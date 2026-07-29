import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Notification Integration Tests", () => {
  let clientToken: string;
  let clientId: string;
  let freelancerToken: string;
  let freelancerId: string;
  let thirdPartyToken: string;

  const validJobPayload = {
    title: "Notification System Integration Job",
    description: "Job created to trigger and test notification events across client and freelancer actions.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 5000,
    duration: "1 month",
    status: "open" as const,
  };

  const validProposalPayload = {
    coverLetter: "I will build and test the real-time notification engine for GigFlow.",
    bidAmount: 4500,
    deliveryTime: "1 week",
  };

  beforeEach(async () => {
    const client = await registerAndLogin(app, {
      email: "client_notif@example.com",
      role: "client",
    });
    clientToken = client.token;
    clientId = client.userId;

    const freelancer = await registerAndLogin(app, {
      email: "freelancer_notif@example.com",
      role: "freelancer",
    });
    freelancerToken = freelancer.token;
    freelancerId = freelancer.userId;

    const thirdParty = await registerAndLogin(app, {
      email: "thirdparty_notif@example.com",
      role: "freelancer",
    });
    thirdPartyToken = thirdParty.token;
  });

  describe("Notification Triggers", () => {
    it("should create a proposal_received notification for client when freelancer submits a proposal", async () => {
      // Client posts job
      const createJobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = createJobRes.body.data.id;

      // Freelancer submits proposal
      await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      // Check client notifications
      const notifRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(notifRes.status).toBe(200);
      expect(notifRes.body.success).toBe(true);
      expect(notifRes.body.data.length).toBeGreaterThanOrEqual(1);

      const propRecNotif = notifRes.body.data.find(
        (n: any) => n.type === "proposal_received"
      );
      expect(propRecNotif).toBeDefined();
      expect(propRecNotif.read).toBe(false);
    });

    it("should create a proposal_accepted notification for freelancer when client accepts proposal", async () => {
      // Post job & submit proposal
      const jobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = jobRes.body.data.id;

      const propRes = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);
      const proposalId = propRes.body.data.id;

      // Client accepts proposal
      await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      // Check freelancer notifications
      const notifRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(notifRes.status).toBe(200);
      const acceptedNotif = notifRes.body.data.find(
        (n: any) => n.type === "proposal_accepted"
      );
      expect(acceptedNotif).toBeDefined();
    });

    it("should create a proposal_rejected notification for freelancer when client rejects proposal", async () => {
      // Post job & submit proposal
      const jobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = jobRes.body.data.id;

      const propRes = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);
      const proposalId = propRes.body.data.id;

      // Client rejects proposal
      await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "rejected" });

      // Check freelancer notifications
      const notifRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(notifRes.status).toBe(200);
      const rejectedNotif = notifRes.body.data.find(
        (n: any) => n.type === "proposal_rejected"
      );
      expect(rejectedNotif).toBeDefined();
    });

    it("should create contract_completed notifications for both client and freelancer when a funded contract is completed", async () => {
      // Post job, submit proposal, accept proposal
      const jobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = jobRes.body.data.id;

      const propRes = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);
      const proposalId = propRes.body.data.id;

      await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      // Fetch contract ID
      const contractsRes = await request(app)
        .get("/api/v1/contracts/client/my-contracts")
        .set("Authorization", `Bearer ${clientToken}`);
      const contractId = contractsRes.body.data[0].id;

      // Fund contract
      await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Complete contract
      await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Verify client notification
      const clientNotifRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${clientToken}`);

      const clientCompletedNotif = clientNotifRes.body.data.find(
        (n: any) => n.type === "contract_completed"
      );
      expect(clientCompletedNotif).toBeDefined();

      // Verify freelancer notification
      const freelancerNotifRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${freelancerToken}`);

      const freelancerCompletedNotif = freelancerNotifRes.body.data.find(
        (n: any) => n.type === "contract_completed"
      );
      expect(freelancerCompletedNotif).toBeDefined();
    });

    it("should create a review_received notification for reviewee when a review is submitted", async () => {
      // Setup completed contract
      const jobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = jobRes.body.data.id;

      const propRes = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);
      const proposalId = propRes.body.data.id;

      await request(app)
        .patch(`/api/v1/jobs/proposals/${proposalId}/status`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ status: "accepted" });

      const contractsRes = await request(app)
        .get("/api/v1/contracts/client/my-contracts")
        .set("Authorization", `Bearer ${clientToken}`);
      const contractId = contractsRes.body.data[0].id;

      await request(app)
        .post(`/api/v1/payments/contracts/${contractId}/fund`)
        .set("Authorization", `Bearer ${clientToken}`);

      await request(app)
        .patch(`/api/v1/contracts/${contractId}/complete`)
        .set("Authorization", `Bearer ${clientToken}`);

      // Client submits review for freelancer
      await request(app)
        .post(`/api/v1/reviews/contract/${contractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
          rating: 5,
          comment: "Excellent freelancer! Delivered ahead of schedule.",
        });

      // Verify freelancer received review_received notification
      const freelancerNotifRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${freelancerToken}`);

      const reviewNotif = freelancerNotifRes.body.data.find(
        (n: any) => n.type === "review_received"
      );
      expect(reviewNotif).toBeDefined();
    });
  });

  describe("Notification Management & Access Control", () => {
    it("should return correct unread count via GET /api/v1/notifications/unread-count", async () => {
      // Trigger 2 notifications for client
      const jobRes1 = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const job1Id = jobRes1.body.data.id;

      await request(app)
        .post(`/api/v1/jobs/${job1Id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      const jobRes2 = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ ...validJobPayload, title: "Job 2 for Unread Count Test" });
      const job2Id = jobRes2.body.data.id;

      await request(app)
        .post(`/api/v1/jobs/${job2Id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      const countRes = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(countRes.status).toBe(200);
      expect(countRes.body.success).toBe(true);
      expect(countRes.body.data.unreadCount).toBe(2);
    });

    it("should mark a single notification as read via PATCH /api/v1/notifications/:id/read and decrement unread count by 1", async () => {
      // Trigger 2 notifications for client
      const jobRes1 = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const job1Id = jobRes1.body.data.id;

      await request(app)
        .post(`/api/v1/jobs/${job1Id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      const jobRes2 = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ ...validJobPayload, title: "Job 2 for Single Read Test" });
      const job2Id = jobRes2.body.data.id;

      await request(app)
        .post(`/api/v1/jobs/${job2Id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      // Get notifications
      const notifsRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${clientToken}`);
      const [notif1, notif2] = notifsRes.body.data;

      // Mark 1st notification as read
      const markReadRes = await request(app)
        .patch(`/api/v1/notifications/${notif1.id}/read`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(markReadRes.status).toBe(200);
      expect(markReadRes.body.data.read).toBe(true);

      // Check unread count is now 1
      const countRes = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${clientToken}`);
      expect(countRes.body.data.unreadCount).toBe(1);

      // Verify notif2 is still unread
      const updatedNotifsRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${clientToken}`);

      const notif2Updated = updatedNotifsRes.body.data.find(
        (n: any) => n.id === notif2.id
      );
      expect(notif2Updated.read).toBe(false);
    });

    it("should mark all notifications as read via PATCH /api/v1/notifications/read-all and set unread count to 0", async () => {
      // Trigger 2 notifications for client
      const jobRes1 = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const job1Id = jobRes1.body.data.id;

      await request(app)
        .post(`/api/v1/jobs/${job1Id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      const jobRes2 = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ ...validJobPayload, title: "Job 2 for Read All Test" });
      const job2Id = jobRes2.body.data.id;

      await request(app)
        .post(`/api/v1/jobs/${job2Id}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      // Mark all as read
      const readAllRes = await request(app)
        .patch("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(readAllRes.status).toBe(200);

      // Check unread count is 0
      const countRes = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(countRes.body.data.unreadCount).toBe(0);
    });

    it("should return 403 when a user attempts to mark another user's notification as read", async () => {
      // Trigger notification for client
      const jobRes = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(validJobPayload);
      const jobId = jobRes.body.data.id;

      await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send(validProposalPayload);

      const clientNotifsRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${clientToken}`);

      const clientNotifId = clientNotifsRes.body.data[0].id;

      // Third-party (or freelancer) attempts to mark client's notification as read
      const unauthorizedMarkRes = await request(app)
        .patch(`/api/v1/notifications/${clientNotifId}/read`)
        .set("Authorization", `Bearer ${thirdPartyToken}`);

      expect(unauthorizedMarkRes.status).toBe(403);
    });
  });
});
