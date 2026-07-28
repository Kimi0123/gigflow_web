import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Jobs Integration Tests", () => {
  let clientToken: string;
  let clientId: string;
  let freelancerToken: string;
  let freelancerId: string;
  let otherClientToken: string;

  const validJobPayload = {
    title: "Senior Full Stack React Node Developer Needed",
    description:
      "We are seeking an experienced full stack developer specializing in React, Next.js, and TypeScript for a long-term enterprise project.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 1500,
    budgetMax: 3000,
    duration: "1-3 months",
    skills: ["React", "TypeScript", "Node.js", "C++"],
    status: "open" as const,
  };

  beforeEach(async () => {
    const client = await registerAndLogin(app, {
      email: "client_job@example.com",
      role: "client",
    });
    clientToken = client.token;
    clientId = client.userId;

    const freelancer = await registerAndLogin(app, {
      email: "freelancer_job@example.com",
      role: "freelancer",
    });
    freelancerToken = freelancer.token;
    freelancerId = freelancer.userId;

    const otherClient = await registerAndLogin(app, {
      email: "other_client@example.com",
      role: "client",
    });
    otherClientToken = otherClient.token;
  });

  describe("POST /api/v1/jobs", () => {
    it("should allow a client to create a job successfully", async () => {
      const res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.title).toBe(validJobPayload.title);
      expect(res.body.data.client.id).toBe(clientId);
    });

    it("should reject job creation by a freelancer with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject job creation with missing required fields with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
          title: "Short",
          description: "Too short",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/jobs (List & Search)", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
    });

    it("should filter jobs by search query matching title/description/skills", async () => {
      const res = await request(app)
        .get("/api/v1/jobs?search=React")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
      expect(res.body.data.jobs.length).toBeGreaterThan(0);
    });

    it("should handle search with special regex characters (e.g. C++) without crashing", async () => {
      const res = await request(app)
        .get("/api/v1/jobs?search=C%2B%2B")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
    });
  });

  describe("GET /api/v1/jobs/:id", () => {
    it("should return a single job by id", async () => {
      const createRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);

      const jobId = createRes.body.data.id;

      const res = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(jobId);
    });

    it("should return 404 Not Found for a nonexistent job id", async () => {
      const nonexistentId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .get(`/api/v1/jobs/${nonexistentId}`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/jobs/:id (Update)", () => {
    let jobId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      jobId = createRes.body.data.id;
    });

    it("should allow the job owner to update the job", async () => {
      const res = await request(app)
        .patch(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ title: "Updated Senior Full Stack Engineer Position" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Senior Full Stack Engineer Position");
    });

    it("should reject updates from a non-owner (returns 404 because query scopes to owner)", async () => {
      const res = await request(app)
        .patch(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${otherClientToken}`)
        .send({ title: "Unauthorized Title Change" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Job Status Transitions (Close & Reopen)", () => {
    it("should close a job and reopen it successfully", async () => {
      const createRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = createRes.body.data.id;

      // Close job
      const closeRes = await request(app)
        .patch(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "closed" });

      expect(closeRes.status).toBe(200);
      expect(closeRes.body.data.status).toBe("closed");

      // Reopen job
      const reopenRes = await request(app)
        .patch(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "open" });

      expect(reopenRes.status).toBe(200);
      expect(reopenRes.body.data.status).toBe("open");
    });
  });

  describe("Save & Unsave Job Flow", () => {
    let jobId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      jobId = createRes.body.data.id;
    });

    it("should be idempotent when saving a job twice", async () => {
      const save1 = await request(app)
        .post(`/api/v1/jobs/${jobId}/save`)
        .set("Authorization", `Bearer ${freelancerToken}`);
      expect(save1.status).toBe(200);
      expect(save1.body.data.saved).toBe(true);

      const save2 = await request(app)
        .post(`/api/v1/jobs/${jobId}/save`)
        .set("Authorization", `Bearer ${freelancerToken}`);
      expect(save2.status).toBe(200);
      expect(save2.body.data.saved).toBe(true);
    });

    it("should return saved jobs list and remove job on unsave", async () => {
      await request(app)
        .post(`/api/v1/jobs/${jobId}/save`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      const savedListBefore = await request(app)
        .get("/api/v1/jobs/saved/my-jobs")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(savedListBefore.status).toBe(200);
      expect(savedListBefore.body.data.length).toBe(1);
      expect(savedListBefore.body.data[0].id).toBe(jobId);

      const unsaveRes = await request(app)
        .delete(`/api/v1/jobs/${jobId}/save`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(unsaveRes.status).toBe(200);
      expect(unsaveRes.body.data.saved).toBe(false);

      const savedListAfter = await request(app)
        .get("/api/v1/jobs/saved/my-jobs")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(savedListAfter.status).toBe(200);
      expect(savedListAfter.body.data.length).toBe(0);
    });
  });
});
