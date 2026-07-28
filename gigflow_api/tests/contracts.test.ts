import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Contracts Integration Tests", () => {
  let clientToken: string;
  let clientId: string;
  let freelancerToken: string;
  let freelancerId: string;
  let thirdPartyToken: string;
  let jobId: string;
  let proposalId: string;
  let contractId: string;

  const validJobPayload = {
    title: "Mobile App Contract Testing Job",
    description:
      "Creating an automated testing suite for Contract lifecycle endpoints in Express and Mongoose architecture.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 3000,
    duration: "1 month",
    status: "open" as const,
  };

  const validProposalPayload = {
    coverLetter:
      "I am an automated test suite author specializing in Jest, Supertest, and MongoMemoryServer integration tests.",
    bidAmount: 2800,
    deliveryTime: "1 week",
  };

  beforeEach(async () => {
    const client = await registerAndLogin(app, {
      email: "client_contract@example.com",
      role: "client",
    });
    clientToken = client.token;
    clientId = client.userId;

    const freelancer = await registerAndLogin(app, {
      email: "freelancer_contract@example.com",
      role: "freelancer",
    });
    freelancerToken = freelancer.token;
    freelancerId = freelancer.userId;

    const thirdParty = await registerAndLogin(app, {
      email: "thirdparty_contract@example.com",
      role: "client",
    });
    thirdPartyToken = thirdParty.token;

    // Create job
    const createJobRes = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(validJobPayload);
    jobId = createJobRes.body.data.id;

    // Submit proposal
    const submitPropRes = await request(app)
      .post(`/api/v1/jobs/${jobId}/proposals`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send(validProposalPayload);
    proposalId = submitPropRes.body.data.id;

    // Accept proposal to auto-create Contract
    const acceptRes = await request(app)
      .patch(`/api/v1/jobs/proposals/${proposalId}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "accepted" });

    // Fetch client contracts to get created contractId
    const clientContracts = await request(app)
      .get("/api/v1/contracts/client/my-contracts")
      .set("Authorization", `Bearer ${clientToken}`);

    contractId = clientContracts.body.data[0].id;
  });

  describe("GET Contract Lists & Access Control", () => {
    it("should allow both client and freelancer to GET their contracts", async () => {
      const clientRes = await request(app)
        .get("/api/v1/contracts/client/my-contracts")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(clientRes.status).toBe(200);
      expect(clientRes.body.data.length).toBe(1);
      expect(clientRes.body.data[0].id).toBe(contractId);

      const freelancerRes = await request(app)
        .get("/api/v1/contracts/freelancer/my-contracts")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(freelancerRes.status).toBe(200);
      expect(freelancerRes.body.data.length).toBe(1);
      expect(freelancerRes.body.data[0].id).toBe(contractId);
    });

    it("should prevent a third unrelated user from accessing a contract they are not party to", async () => {
      const res = await request(app)
        .get(`/api/v1/contracts/${contractId}`)
        .set("Authorization", `Bearer ${thirdPartyToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/contracts/:id/complete (Completion Flow)", () => {
    it("should reject completion attempt by the freelancer with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow client to complete contract, set completedAt, and close job status", async () => {
      const res = await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("completed");
      expect(res.body.data.completedAt).toBeDefined();

      // Verify associated job status flipped to closed
      const jobRes = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(jobRes.body.data.status).toBe("closed");
    });

    it("should reject completing an already-completed contract with 400 Bad Request", async () => {
      // First completion
      await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Second completion
      const res2 = await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res2.status).toBe(400);
      expect(res2.body.success).toBe(false);
    });
  });
});
