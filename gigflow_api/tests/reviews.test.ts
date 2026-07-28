import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Reviews Integration Tests", () => {
  let clientToken: string;
  let clientId: string;
  let freelancerToken: string;
  let freelancerId: string;
  let thirdPartyToken: string;
  let jobId: string;
  let proposalId: string;
  let activeContractId: string;
  let completedContractId: string;

  const validJobPayload = {
    title: "Fullstack App Review Testing Job",
    description: "Job created to test Review creation, permissions, and rating aggregation.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 4000,
    duration: "1 month",
    status: "open" as const,
  };

  const validProposalPayload = {
    coverLetter:
      "I am an automated test suite author specializing in Jest, Supertest, and MongoMemoryServer integration tests for review endpoints.",
    bidAmount: 3800,
    deliveryTime: "2 weeks",
  };

  beforeEach(async () => {
    const client = await registerAndLogin(app, {
      email: "client_review@example.com",
      role: "client",
    });
    clientToken = client.token;
    clientId = client.userId;

    const freelancer = await registerAndLogin(app, {
      email: "freelancer_review@example.com",
      role: "freelancer",
    });
    freelancerToken = freelancer.token;
    freelancerId = freelancer.userId;

    const thirdParty = await registerAndLogin(app, {
      email: "thirdparty_review@example.com",
      role: "freelancer",
    });
    thirdPartyToken = thirdParty.token;

    // Create Job 1
    const createJobRes = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(validJobPayload);
    jobId = createJobRes.body.data.id;

    // Submit Proposal 1
    const submitPropRes = await request(app)
      .post(`/api/v1/jobs/${jobId}/proposals`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send(validProposalPayload);
    proposalId = submitPropRes.body.data.id;

    // Accept Proposal 1 -> creates active contract
    await request(app)
      .patch(`/api/v1/jobs/proposals/${proposalId}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "accepted" });

    const contractsRes = await request(app)
      .get("/api/v1/contracts/client/my-contracts")
      .set("Authorization", `Bearer ${clientToken}`);
    activeContractId = contractsRes.body.data[0].id;

    // Create Job 2 & Contract 2 -> completed contract
    const createJob2Res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ ...validJobPayload, title: "Job 2 for Completed Contract Review" });
    const job2Id = createJob2Res.body.data.id;

    const submitProp2Res = await request(app)
      .post(`/api/v1/jobs/${job2Id}/proposals`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send(validProposalPayload);
    const proposal2Id = submitProp2Res.body.data.id;

    await request(app)
      .patch(`/api/v1/jobs/proposals/${proposal2Id}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "accepted" });

    const contractsRes2 = await request(app)
      .get("/api/v1/contracts/client/my-contracts")
      .set("Authorization", `Bearer ${clientToken}`);

    const c2 = contractsRes2.body.data.find(
      (c: any) => c.jobId === job2Id || c.job === job2Id
    );
    completedContractId = c2.id;

    // Complete contract 2
    await request(app)
      .patch(`/api/v1/contracts/${completedContractId}/complete`)
      .set("Authorization", `Bearer ${clientToken}`);
  });

  describe("POST /api/v1/reviews/contract/:contractId (Creation & Validation)", () => {
    it("should reject leaving a review on an active contract with 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/api/v1/reviews/contract/${activeContractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ rating: 5, comment: "Premature review." });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should allow both client and freelancer to leave a review on a completed contract", async () => {
      // Client reviews freelancer
      const clientReviewRes = await request(app)
        .post(`/api/v1/reviews/contract/${completedContractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ rating: 5, comment: "Outstanding freelancer work!" });

      expect(clientReviewRes.status).toBe(201);
      expect(clientReviewRes.body.success).toBe(true);
      expect(clientReviewRes.body.data.reviewerRole).toBe("client");
      expect(clientReviewRes.body.data.rating).toBe(5);

      // Freelancer reviews client
      const freelancerReviewRes = await request(app)
        .post(`/api/v1/reviews/contract/${completedContractId}`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send({ rating: 4, comment: "Great communication client." });

      expect(freelancerReviewRes.status).toBe(201);
      expect(freelancerReviewRes.body.success).toBe(true);
      expect(freelancerReviewRes.body.data.reviewerRole).toBe("freelancer");
      expect(freelancerReviewRes.body.data.rating).toBe(4);
    });

    it("should reject a second review from the same reviewer on the same contract with 409 Conflict", async () => {
      await request(app)
        .post(`/api/v1/reviews/contract/${completedContractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ rating: 5, comment: "First review." });

      const duplicateRes = await request(app)
        .post(`/api/v1/reviews/contract/${completedContractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ rating: 4, comment: "Attempted second review." });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
    });

    it("should reject review creation from an unrelated third party with 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/v1/reviews/contract/${completedContractId}`)
        .set("Authorization", `Bearer ${thirdPartyToken}`)
        .send({ rating: 1, comment: "Unrelated party review." });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET User Reviews & Rating Summary", () => {
    it("should return a user's reviews list with correct reviewerRole values", async () => {
      await request(app)
        .post(`/api/v1/reviews/contract/${completedContractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ rating: 5, comment: "Excellent freelancer." });

      const res = await request(app)
        .get(`/api/v1/reviews/user/${freelancerId}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.reviews.length).toBe(1);
      expect(res.body.data.reviews[0].reviewerRole).toBe("client");
      expect(res.body.data.reviews[0].rating).toBe(5);
    });

    it("should compute accurate averageRating and totalReviews in rating summary (math verification)", async () => {
      // Contract 1 (already completed) -> Client reviews freelancer with rating 5
      await request(app)
        .post(`/api/v1/reviews/contract/${completedContractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ rating: 5, comment: "First review (5 stars)" });

      // Create Contract 2 with Client 2 -> completed contract, Client 2 reviews freelancer with rating 3
      const client2 = await registerAndLogin(app, {
        email: "client2_review@example.com",
        role: "client",
      });
      const j2Res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${client2.token}`)
        .send(validJobPayload);
      const p2Res = await request(app)
        .post(`/api/v1/jobs/${j2Res.body.data.id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);
      await request(app)
        .patch(`/api/v1/jobs/proposals/${p2Res.body.data.id}/status`)
        .set("Authorization", `Bearer ${client2.token}`)
        .send({ status: "accepted" });
      const c2List = await request(app)
        .get("/api/v1/contracts/client/my-contracts")
        .set("Authorization", `Bearer ${client2.token}`);
      const c2Id = c2List.body.data[0].id;
      await request(app)
        .patch(`/api/v1/contracts/${c2Id}/complete`)
        .set("Authorization", `Bearer ${client2.token}`);
      await request(app)
        .post(`/api/v1/reviews/contract/${c2Id}`)
        .set("Authorization", `Bearer ${client2.token}`)
        .send({ rating: 3, comment: "Second review (3 stars)" });

      // Create Contract 3 with Client 3 -> completed contract, Client 3 reviews freelancer with rating 4
      const client3 = await registerAndLogin(app, {
        email: "client3_review@example.com",
        role: "client",
      });
      const j3Res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${client3.token}`)
        .send(validJobPayload);
      const p3Res = await request(app)
        .post(`/api/v1/jobs/${j3Res.body.data.id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);
      await request(app)
        .patch(`/api/v1/jobs/proposals/${p3Res.body.data.id}/status`)
        .set("Authorization", `Bearer ${client3.token}`)
        .send({ status: "accepted" });
      const c3List = await request(app)
        .get("/api/v1/contracts/client/my-contracts")
        .set("Authorization", `Bearer ${client3.token}`);
      const c3Id = c3List.body.data[0].id;
      await request(app)
        .patch(`/api/v1/contracts/${c3Id}/complete`)
        .set("Authorization", `Bearer ${client3.token}`);
      await request(app)
        .post(`/api/v1/reviews/contract/${c3Id}`)
        .set("Authorization", `Bearer ${client3.token}`)
        .send({ rating: 4, comment: "Third review (4 stars)" });

      // Ratings are 5, 3, 4 -> Average = (5 + 3 + 4) / 3 = 4.0
      const summaryRes = await request(app)
        .get(`/api/v1/reviews/user/${freelancerId}/summary`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.data.totalReviews).toBe(3);
      expect(summaryRes.body.data.averageRating).toBe(4);
    });
  });
});
