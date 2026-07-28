import request from "supertest";
import app from "../src/app";
import { UserModel } from "../src/models/user.model";
import { registerAndLogin } from "./helpers";
import { setupTestDB } from "./setup";

setupTestDB();

describe("Admin Integration Tests", () => {
  let adminToken: string;
  let adminId: string;
  let clientToken: string;
  let clientId: string;
  let freelancerToken: string;
  let freelancerId: string;

  const validJobPayload = {
    title: "Admin Moderation Test Job",
    description: "Job used for admin deletion and contract status conflict checks.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 5000,
    duration: "1 month",
    status: "open" as const,
  };

  const validProposalPayload = {
    coverLetter:
      "I am an automated test suite author specializing in Jest, Supertest, and MongoMemoryServer integration tests for admin moderation.",
    bidAmount: 4500,
    deliveryTime: "2 weeks",
  };

  beforeEach(async () => {
    // 1. Create client
    const client = await registerAndLogin(app, {
      email: "client_admin@example.com",
      role: "client",
    });
    clientToken = client.token;
    clientId = client.userId;

    // 2. Create freelancer
    const freelancer = await registerAndLogin(app, {
      email: "freelancer_admin@example.com",
      role: "freelancer",
    });
    freelancerToken = freelancer.token;
    freelancerId = freelancer.userId;

    // 3. Create admin
    const admin = await registerAndLogin(app, {
      email: "admin_user@example.com",
      role: "client",
    });
    adminToken = admin.token;
    adminId = admin.userId;
    // Upgrade role in DB to admin
    await UserModel.findByIdAndUpdate(adminId, { role: "admin" });
  });

  describe("Security Boundary (Non-Admin 403 Rejection)", () => {
    it("should reject non-admin access to User Management routes with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-admin access to Analytics routes with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/v1/admin/analytics/overview")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-admin access to Job Moderation routes with 403 Forbidden", async () => {
      const fakeJobId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`/api/v1/admin/jobs/${fakeJobId}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/analytics/overview (Accurate Platform Metrics)", () => {
    it("should return accurate aggregate counts matching database reality", async () => {
      // Current DB state: 3 users (1 client, 1 freelancer, 1 admin)
      // Let's create 2 jobs: 1 open, 1 with an accepted proposal -> active contract
      const job1Res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const job1Id = job1Res.body.data.id;

      const job2Res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ ...validJobPayload, title: "Second Admin Analytics Job" });
      const job2Id = job2Res.body.data.id;

      // Submit proposal & accept on job2 -> 1 active contract
      const propRes = await request(app)
        .post(`/api/v1/jobs/${job2Id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      await request(app)
        .patch(`/api/v1/jobs/proposals/${propRes.body.data.id}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      const res = await request(app)
        .get("/api/v1/admin/analytics/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const metrics = res.body.data;
      expect(metrics.totalUsers).toBe(3);
      expect(metrics.totalClients).toBe(1);
      expect(metrics.totalFreelancers).toBe(1);
      expect(metrics.totalJobs).toBe(2);
      expect(metrics.totalContracts).toBe(1);
      expect(metrics.contractsByStatus.active).toBe(1);
    });
  });

  describe("DELETE /api/v1/admin/jobs/:jobId (Job Moderation Rules)", () => {
    it("should allow admin to delete a job with no active contract", async () => {
      const jobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = jobRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/jobs/${jobId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify job is removed
      const getRes = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${clientToken}`);
      expect(getRes.status).toBe(404);
    });

    it("should reject admin deletion of a job WITH an active contract with 409 Conflict", async () => {
      const jobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = jobRes.body.data.id;

      const propRes = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      await request(app)
        .patch(`/api/v1/jobs/proposals/${propRes.body.data.id}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/jobs/${jobId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(409);
      expect(deleteRes.body.success).toBe(false);
    });
  });

  describe("Admin User Management CRUD (/api/v1/admin/users)", () => {
    it("should list all users", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it("should fetch a single user by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${clientId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(clientId);
      expect(res.body.data.email).toBe("client_admin@example.com");
    });

    it("should update a user's role and persist the change", async () => {
      const updateRes = await request(app)
        .patch(`/api/v1/admin/users/${freelancerId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "client" });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.role).toBe("client");

      // Re-fetch to confirm persistence
      const fetchRes = await request(app)
        .get(`/api/v1/admin/users/${freelancerId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(fetchRes.body.data.role).toBe("client");
    });

    it("should delete a user and verify deletion via re-fetch", async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/users/${freelancerId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      // Re-fetch to verify user is deleted (404)
      const fetchRes = await request(app)
        .get(`/api/v1/admin/users/${freelancerId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(fetchRes.status).toBe(404);
    });
  });
});
