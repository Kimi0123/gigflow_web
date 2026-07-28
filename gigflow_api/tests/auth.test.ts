import request from "supertest";
import app from "../src/app";
import { setupTestDB } from "./setup";
import { registerAndLogin } from "./helpers";

setupTestDB();

describe("Auth Integration Tests", () => {
  const validClient = {
    email: "client@example.com",
    password: "Password123",
    role: "client" as const,
    firstName: "Client",
    lastName: "User",
    phoneNumber: "1234567890",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should register a user successfully with status 201", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validClient);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.email).toBe(validClient.email);
      expect(res.body.data.role).toBe("client");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should reject duplicate email registration with 409 Conflict", async () => {
      await request(app).post("/api/v1/auth/register").send(validClient);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validClient);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it("should reject registration missing required fields with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "incomplete@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject password below minimum length with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...validClient,
          email: "shortpass@example.com",
          password: "short",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(validClient);
    });

    it("should succeed login with correct credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: validClient.email,
        password: validClient.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user.email).toBe(validClient.email);
    });

    it("should reject wrong password with generic message", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: validClient.email,
        password: "WrongPassword123",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should reject nonexistent email with identical generic message", async () => {
      const resWrongPass = await request(app).post("/api/v1/auth/login").send({
        email: validClient.email,
        password: "WrongPassword123",
      });

      const resNoUser = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: "Password123",
      });

      expect(resNoUser.status).toBe(resWrongPass.status);
      expect(resNoUser.body.message).toBe(resWrongPass.body.message);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return the profile for a valid token", async () => {
      const { token, userId } = await registerAndLogin(app, {
        email: "authed@example.com",
        role: "client",
      });

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.email).toBe("authed@example.com");
    });

    it("should reject request with missing token with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with malformed or invalid token with 401 Unauthorized", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid.token.string");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Forgot & Reset Password Flow", () => {
    it("should return identical response for real and nonexistent emails on forgot password", async () => {
      await registerAndLogin(app, {
        email: "registered@example.com",
        role: "client",
      });

      const resReal = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "registered@example.com" });

      const resNonexistent = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(resReal.status).toBe(200);
      expect(resNonexistent.status).toBe(200);
      expect(resReal.body).toEqual(resNonexistent.body);
    });

    it("should reject password reset with an invalid code with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          email: "anyone@example.com",
          code: "123456",
          newPassword: "NewPassword123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
