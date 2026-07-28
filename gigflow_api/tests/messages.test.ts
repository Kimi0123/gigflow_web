import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Messages Integration Tests", () => {
  let clientToken: string;
  let clientId: string;
  let clientName: string;
  let freelancerToken: string;
  let freelancerId: string;
  let freelancerName: string;
  let thirdPartyToken: string;
  let contractId: string;
  let contract2Id: string;

  const validJobPayload = {
    title: "Messaging Contract Testing Job",
    description: "Testing contract message creation, read status, unread aggregation, and security boundaries.",
    category: "Development",
    budgetType: "fixed" as const,
    budgetMin: 2500,
    duration: "1 month",
    status: "open" as const,
  };

  const validProposalPayload = {
    coverLetter:
      "I am an automated test suite author specializing in Jest, Supertest, and MongoMemoryServer integration tests for messaging flow.",
    bidAmount: 2400,
    deliveryTime: "1 week",
  };

  beforeEach(async () => {
    const client = await registerAndLogin(app, {
      email: "client_msg@example.com",
      role: "client",
      firstName: "Alice",
      lastName: "Client",
    });
    clientToken = client.token;
    clientId = client.userId;
    clientName = "Alice Client";

    const freelancer = await registerAndLogin(app, {
      email: "freelancer_msg@example.com",
      role: "freelancer",
      firstName: "Bob",
      lastName: "Dev",
    });
    freelancerToken = freelancer.token;
    freelancerId = freelancer.userId;
    freelancerName = "Bob Dev";

    const thirdParty = await registerAndLogin(app, {
      email: "thirdparty_msg@example.com",
      role: "freelancer",
      firstName: "Charlie",
      lastName: "Outsider",
    });
    thirdPartyToken = thirdParty.token;

    // Create Contract 1
    const job1Res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(validJobPayload);
    const prop1Res = await request(app)
      .post(`/api/v1/jobs/${job1Res.body.data.id}/proposals`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send(validProposalPayload);
    await request(app)
      .patch(`/api/v1/jobs/proposals/${prop1Res.body.data.id}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "accepted" });

    const c1List = await request(app)
      .get("/api/v1/contracts/client/my-contracts")
      .set("Authorization", `Bearer ${clientToken}`);
    contractId = c1List.body.data[0].id;

    // Create Contract 2
    const job2Res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ ...validJobPayload, title: "Second Contract for Multi-Contract Messaging" });
    const prop2Res = await request(app)
      .post(`/api/v1/jobs/${job2Res.body.data.id}/proposals`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send(validProposalPayload);
    await request(app)
      .patch(`/api/v1/jobs/proposals/${prop2Res.body.data.id}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "accepted" });

    const c2List = await request(app)
      .get("/api/v1/contracts/client/my-contracts")
      .set("Authorization", `Bearer ${clientToken}`);
    const c2 = c2List.body.data.find(
      (c: any) => c.jobId === job2Res.body.data.id || c.job === job2Res.body.data.id
    );
    contract2Id = c2.id;
  });

  describe("POST /api/v1/messages/contract/:contractId & Access Control", () => {
    it("should allow client and freelancer to send messages on an active contract", async () => {
      const clientMsg = await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ content: "Hi Bob, welcome to the project!" });

      expect(clientMsg.status).toBe(201);
      expect(clientMsg.body.success).toBe(true);
      expect(clientMsg.body.data.content).toBe("Hi Bob, welcome to the project!");
      expect(clientMsg.body.data.senderName).toBe(clientName);

      const freelancerMsg = await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send({ content: "Thanks Alice, excited to get started!" });

      expect(freelancerMsg.status).toBe(201);
      expect(freelancerMsg.body.success).toBe(true);
      expect(freelancerMsg.body.data.content).toBe("Thanks Alice, excited to get started!");
      expect(freelancerMsg.body.data.senderName).toBe(freelancerName);
    });

    it("should prevent a third party user from sending or reading messages on a contract (403 both directions)", async () => {
      // Send attempt by third party
      const sendRes = await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${thirdPartyToken}`)
        .send({ content: "Intruder message!" });

      expect(sendRes.status).toBe(403);
      expect(sendRes.body.success).toBe(false);

      // Read attempt by third party
      const readRes = await request(app)
        .get(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${thirdPartyToken}`);

      expect(readRes.status).toBe(403);
      expect(readRes.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/messages/contract/:contractId & Chronological Order", () => {
    it("should return contract messages in chronological order with correct senderName populated", async () => {
      await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ content: "Message 1 from Client" });

      await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send({ content: "Message 2 from Freelancer" });

      await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ content: "Message 3 from Client" });

      const res = await request(app)
        .get(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const messages = res.body.data.messages;
      expect(messages.length).toBe(3);
      expect(messages[0].content).toBe("Message 1 from Client");
      expect(messages[0].senderName).toBe(clientName);
      expect(messages[1].content).toBe("Message 2 from Freelancer");
      expect(messages[1].senderName).toBe(freelancerName);
      expect(messages[2].content).toBe("Message 3 from Client");
      expect(messages[2].senderName).toBe(clientName);
    });
  });

  describe("Read Status & Unread Counts Across Contracts", () => {
    it("should correctly aggregate unread counts across multiple contracts and clear them upon read", async () => {
      // Contract 1: Client sends 2 messages to Freelancer
      await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ content: "Contract 1 - Msg 1" });

      await request(app)
        .post(`/api/v1/messages/contract/${contractId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ content: "Contract 1 - Msg 2" });

      // Contract 2: Client sends 1 message to Freelancer
      await request(app)
        .post(`/api/v1/messages/contract/${contract2Id}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ content: "Contract 2 - Msg 1" });

      // Total unread messages for Freelancer should be 3 (2 from C1 + 1 from C2)
      const unreadRes1 = await request(app)
        .get("/api/v1/messages/unread-count")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(unreadRes1.status).toBe(200);
      expect(unreadRes1.body.data.unreadCount).toBe(3);

      // Freelancer marks Contract 1 messages as read
      const markReadRes = await request(app)
        .patch(`/api/v1/messages/contract/${contractId}/read`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(markReadRes.status).toBe(200);

      // Unread count for Freelancer should now be 1 (only C2 remains)
      const unreadRes2 = await request(app)
        .get("/api/v1/messages/unread-count")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(unreadRes2.status).toBe(200);
      expect(unreadRes2.body.data.unreadCount).toBe(1);

      // Freelancer marks Contract 2 messages as read
      await request(app)
        .patch(`/api/v1/messages/contract/${contract2Id}/read`)
        .set("Authorization", `Bearer ${freelancerToken}`);

      // Unread count for Freelancer drops to 0
      const unreadRes3 = await request(app)
        .get("/api/v1/messages/unread-count")
        .set("Authorization", `Bearer ${freelancerToken}`);

      expect(unreadRes3.status).toBe(200);
      expect(unreadRes3.body.data.unreadCount).toBe(0);
    });
  });
});
