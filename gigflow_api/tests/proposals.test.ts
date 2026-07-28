import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Proposals Integration Tests", () => {
  let clientToken: string;
  let clientId: string;
  let freelancerToken1: string;
  let freelancerId1: string;
  let freelancerToken2: string;
  let freelancerId2: string;
  let jobId: string;

  const validJobPayload = {
    title: "Senior React Native Engineer Required",
    description:
      "Looking for an expert React Native engineer to build cross-platform mobile apps with Bluetooth integration.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 2000,
    duration: "1-3 months",
    status: "open" as const,
  };

  const validProposalPayload = {
    coverLetter:
      "I have over 6 years of experience building production React Native applications with native modules and Bluetooth functionality.",
    bidAmount: 1800,
    deliveryTime: "2 weeks",
  };

  beforeEach(async () => {
    const client = await registerAndLogin(app, {
      email: "client_prop@example.com",
      role: "client",
    });
    clientToken = client.token;
    clientId = client.userId;

    const freelancer1 = await registerAndLogin(app, {
      email: "freelancer1_prop@example.com",
      role: "freelancer",
    });
    freelancerToken1 = freelancer1.token;
    freelancerId1 = freelancer1.userId;

    const freelancer2 = await registerAndLogin(app, {
      email: "freelancer2_prop@example.com",
      role: "freelancer",
    });
    freelancerToken2 = freelancer2.token;
    freelancerId2 = freelancer2.userId;

    // Create a job for proposal testing
    const createJobRes = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(validJobPayload);

    jobId = createJobRes.body.data.id;
  });

  describe("POST /api/v1/jobs/:jobId/proposals (Submit Proposal)", () => {
    it("should allow a freelancer to submit a proposal on an open job", async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken1}`)
        .send(validProposalPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.coverLetter).toBe(validProposalPayload.coverLetter);
      expect(res.body.data.status).toBe("pending");
    });

    it("should reject proposal submission by a client with 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validProposalPayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject proposals with cover letter under 50 characters with 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken1}`)
        .send({
          ...validProposalPayload,
          coverLetter: "Too short cover letter",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Duplicate Proposal & Reapply Flow", () => {
    it("should reject a second proposal on the same job while first is pending with 409 Conflict", async () => {
      await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken1}`)
        .send(validProposalPayload);

      const secondRes = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken1}`)
        .send(validProposalPayload);

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.success).toBe(false);
    });

    it("should allow withdrawing a proposal and then submitting a new proposal on the same job", async () => {
      const prop1 = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken1}`)
        .send(validProposalPayload);

      const proposalId = prop1.body.data.id;

      // Withdraw proposal
      const withdrawRes = await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId}/withdraw`)
        .set("Authorization", `Bearer ${freelancerToken1}`);

      expect(withdrawRes.status).toBe(200);

      // Reapply on same job
      const reapplyRes = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken1}`)
        .send({
          ...validProposalPayload,
          coverLetter: "Updated cover letter detailing my new experience and revised availability for this project.",
        });

      expect(reapplyRes.status).toBe(201);
      expect(reapplyRes.body.success).toBe(true);
      expect(reapplyRes.body.data.status).toBe("pending");
    });
  });

  describe("Accept Proposal & Side Effects", () => {
    let proposalId1: string;
    let proposalId2: string;

    beforeEach(async () => {
      const p1 = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken1}`)
        .send(validProposalPayload);
      proposalId1 = p1.body.data.id;

      const p2 = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken2}`)
        .send({
          coverLetter: "Another freelancer applying with extensive mobile experience and React Native skillsets.",
          bidAmount: 1900,
          deliveryTime: "3 weeks",
        });
      proposalId2 = p2.body.data.id;
    });

    it("should accept proposal, create contract, set job to in-progress, and auto-reject other pending proposals", async () => {
      const acceptRes = await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId1}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.status).toBe("accepted");

      // Verify job status flipped to in-progress
      const jobRes = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(jobRes.body.data.status).toBe("in-progress");

      // Verify proposalId2 was auto-rejected
      const clientProposalsRes = await request(app)
        .get("/api/v1/jobs/proposals/client/all-proposals")
        .set("Authorization", `Bearer ${clientToken}`);

      const prop2 = clientProposalsRes.body.data.find(
        (p: { id: string }) => p.id === proposalId2
      );
      expect(prop2.status).toBe("rejected");
    });

    it("should reject accepting a proposal on a job that already has an active contract with 400 Bad Request", async () => {
      // Accept first proposal to create active contract
      await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId1}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      // Attempting to accept second proposal should fail
      const acceptSecondRes = await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId2}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      expect(acceptSecondRes.status).toBe(400);
      expect(acceptSecondRes.body.success).toBe(false);
    });
  });
});
