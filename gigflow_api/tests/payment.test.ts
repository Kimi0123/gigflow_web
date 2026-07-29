import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Payment Integration Tests", () => {
  let clientToken: string;
  let clientId: string;
  let freelancerToken: string;
  let freelancerId: string;
  let thirdPartyToken: string;
  let jobId: string;
  let proposalId: string;
  let contractId: string;
  const agreedAmount = 3000;

  const validJobPayload = {
    title: "Fullstack Payment System Testing Job",
    description: "Job created to test contract funding, escrow ledger, and wallet balance operations.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 3500,
    duration: "1 month",
    status: "open" as const,
  };

  const validProposalPayload = {
    coverLetter: "I will implement and test the complete payment and wallet ledger architecture.",
    bidAmount: agreedAmount,
    deliveryTime: "1 week",
  };

  beforeEach(async () => {
    const client = await registerAndLogin(app, {
      email: "client_payment@example.com",
      role: "client",
    });
    clientToken = client.token;
    clientId = client.userId;

    const freelancer = await registerAndLogin(app, {
      email: "freelancer_payment@example.com",
      role: "freelancer",
    });
    freelancerToken = freelancer.token;
    freelancerId = freelancer.userId;

    const thirdParty = await registerAndLogin(app, {
      email: "thirdparty_payment@example.com",
      role: "client",
    });
    thirdPartyToken = thirdParty.token;

    // Create Job
    const createJobRes = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(validJobPayload);
    jobId = createJobRes.body.data.id;

    // Submit Proposal
    const submitPropRes = await request(app)
      .post(`/api/v1/jobs/${jobId}/proposals`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send(validProposalPayload);
    proposalId = submitPropRes.body.data.id;

    // Accept Proposal -> Auto-creates Contract
    await request(app)
      .patch(`/api/v1/jobs/proposals/${proposalId}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "accepted" });

    // Fetch created contract
    const contractsRes = await request(app)
      .get("/api/v1/contracts/client/my-contracts")
      .set("Authorization", `Bearer ${clientToken}`);

    contractId = contractsRes.body.data[0].id;
  });

  describe("GET /api/v1/payments/wallet/me", () => {
    it("should return default starting balance and empty transaction list for a newly registered user", async () => {
      const newUser = await registerAndLogin(app, {
        email: "new_wallet_user@example.com",
        role: "client",
      });

      const res = await request(app)
        .get("/api/v1/payments/wallet/me")
        .set("Authorization", `Bearer ${newUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.balance).toBe(50000);
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
      expect(res.body.data.transactions.length).toBe(0);
    });
  });

  describe("POST /api/v1/payments/topup", () => {
    it("should increase wallet balance and record a topup transaction when given a valid amount", async () => {
      const topupRes = await request(app)
        .post("/api/v1/payments/topup")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ amount: 5000 });

      expect(topupRes.status).toBe(200);
      expect(topupRes.body.success).toBe(true);
      expect(topupRes.body.data.balance).toBe(55000);

      const walletRes = await request(app)
        .get("/api/v1/payments/wallet/me")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(walletRes.body.data.balance).toBe(55000);
      expect(walletRes.body.data.transactions.length).toBe(1);
      expect(walletRes.body.data.transactions[0].type).toBe("topup");
      expect(walletRes.body.data.transactions[0].amount).toBe(5000);
    });

    it("should return 400 when topup amount is <= 0", async () => {
      const zeroRes = await request(app)
        .post("/api/v1/payments/topup")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ amount: 0 });

      expect(zeroRes.status).toBe(400);

      const negRes = await request(app)
        .post("/api/v1/payments/topup")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ amount: -100 });

      expect(negRes.status).toBe(400);
    });

    it("should return 400 when topup amount exceeds demo ceiling (> 100000)", async () => {
      const excessRes = await request(app)
        .post("/api/v1/payments/topup")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ amount: 150000 });

      expect(excessRes.status).toBe(400);
      expect(excessRes.body.message).toContain("Amount too large");
    });
  });

  describe("POST /api/v1/payments/withdraw", () => {
    it("should decrease balance and record a withdraw transaction when given a valid amount", async () => {
      const withdrawRes = await request(app)
        .post("/api/v1/payments/withdraw")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ amount: 10000 });

      expect(withdrawRes.status).toBe(200);
      expect(withdrawRes.body.success).toBe(true);
      expect(withdrawRes.body.data.balance).toBe(40000);

      const walletRes = await request(app)
        .get("/api/v1/payments/wallet/me")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(walletRes.body.data.balance).toBe(40000);
      expect(walletRes.body.data.transactions.length).toBe(1);
      expect(walletRes.body.data.transactions[0].type).toBe("withdraw");
      expect(walletRes.body.data.transactions[0].amount).toBe(10000);
    });

    it("should return 400 Insufficient wallet balance when withdraw amount exceeds current balance", async () => {
      const excessWithdrawRes = await request(app)
        .post("/api/v1/payments/withdraw")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ amount: 100000 });

      expect(excessWithdrawRes.status).toBe(400);
      expect(excessWithdrawRes.body.message).toContain("Insufficient wallet balance");
    });
  });

  describe("POST /api/v1/payments/contracts/:id/fund", () => {
    it("should allow client to fund contract, deduct balance by agreedAmount, and mark contract as funded", async () => {
      const fundRes = await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(fundRes.status).toBe(200);
      expect(fundRes.body.success).toBe(true);
      expect(fundRes.body.data.contract.isFunded).toBe(true);
      expect(fundRes.body.data.walletBalance).toBe(50000 - agreedAmount);
    });

    it("should return 400 when client has insufficient balance to fund contract", async () => {
      // Drain client wallet completely
      await request(app)
        .post("/api/v1/payments/withdraw")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ amount: 50000 });

      const fundRes = await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(fundRes.status).toBe(400);
      expect(fundRes.body.message).toContain("Insufficient wallet balance");
    });

    it("should return 403 when called by a user who is not the contract client", async () => {
      const freelancerFundRes = await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(freelancerFundRes.status).toBe(403);

      const thirdPartyFundRes = await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${thirdPartyToken}`);

      expect(thirdPartyFundRes.status).toBe(403);
    });

    it("should return 409 when contract is already funded", async () => {
      // Fund contract first time
      await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Fund contract second time
      const duplicateFundRes = await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(duplicateFundRes.status).toBe(409);
    });
  });

  describe("Contract Completion & Payment Release Flow", () => {
    it("should fail 400 and NOT mark contract completed if contract is unfunded", async () => {
      const completeRes = await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(completeRes.status).toBe(400);

      // Verify contract status is still "active"
      const contractsRes = await request(app)
        .get("/api/v1/contracts/client/my-contracts")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(contractsRes.body.data[0].status).toBe("active");
    });

    it("should mark contract completed, credit freelancer wallet by agreedAmount, and record release transaction when funded", async () => {
      // Fund contract first
      await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Complete contract
      const completeRes = await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.status).toBe("completed");

      // Verify freelancer's wallet balance increased by agreedAmount
      const freelancerWalletRes = await request(app)
        .get("/api/v1/payments/wallet/me")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(freelancerWalletRes.body.data.balance).toBe(50000 + agreedAmount);

      const releaseTx = freelancerWalletRes.body.data.transactions.find(
        (t: any) => t.type === "release"
      );
      expect(releaseTx).toBeDefined();
      expect(releaseTx.amount).toBe(agreedAmount);
    });

    it("should be idempotent and NOT credit freelancer a second time on duplicate completion attempt", async () => {
      // Fund and complete contract
      await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Check freelancer balance after 1st completion
      const walletRes1 = await request(app)
        .get("/api/v1/payments/wallet/me")
        .set("Authorization", `Bearer ${freelancerToken}`);

      const balanceAfterFirstComplete = walletRes1.body.data.balance;
      expect(balanceAfterFirstComplete).toBe(50000 + agreedAmount);

      // Attempt to complete contract a 2nd time
      await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Check freelancer balance after 2nd completion attempt
      const walletRes2 = await request(app)
        .get("/api/v1/payments/wallet/me")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(walletRes2.body.data.balance).toBe(balanceAfterFirstComplete);
    });
  });
});
