import request from "supertest";
import { Express } from "express";

export interface TestUserOptions {
  email: string;
  password?: string;
  role: "client" | "freelancer";
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

let phoneCounter = 0;

export async function registerAndLogin(app: Express, options: TestUserOptions) {
  const password = options.password || "Password123";
  const firstName = options.firstName || (options.role === "client" ? "Client" : "Free");
  const lastName = options.lastName || "User";
  const phoneNumber = options.phoneNumber || `555${String(++phoneCounter).padStart(7, "0")}`;

  const regRes = await request(app)
    .post("/api/v1/auth/register")
    .send({
      email: options.email,
      password,
      role: options.role,
      firstName,
      lastName,
      phoneNumber,
    });

  if (regRes.status !== 201) {
    throw new Error(`Registration failed in helper (${regRes.status}): ${JSON.stringify(regRes.body)}`);
  }

  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: options.email,
      password,
    });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed in helper (${loginRes.status}): ${JSON.stringify(loginRes.body)}`);
  }

  const token = loginRes.body.data.token || loginRes.body.data.accessToken;
  const user = loginRes.body.data.user;
  const userId = user?.id || user?._id;

  return { token, userId, user, response: loginRes.body };
}
