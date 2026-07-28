import request from "supertest";
import app from "../src/app";
import { UserModel } from "../src/models/user.model";
import { registerAndLogin } from "./helpers";
import { setupTestDB } from "./setup";

setupTestDB();

describe("Public Profile & Freelancer Directory Integration Tests", () => {
  let freelancer1Id: string;
  let freelancer2Id: string;
  let freelancer3Id: string;
  let clientId: string;

  beforeEach(async () => {
    // Register Client
    const client = await registerAndLogin(app, {
      email: "client_prof@example.com",
      role: "client",
      firstName: "Claire",
      lastName: "Client",
    });
    clientId = client.userId;

    // Register Freelancer 1
    const free1 = await registerAndLogin(app, {
      email: "alex_freelancer@example.com",
      role: "freelancer",
      firstName: "Alex",
      lastName: "Dev",
    });
    freelancer1Id = free1.userId;
    await UserModel.findByIdAndUpdate(freelancer1Id, {
      bio: "Senior TypeScript Engineer with 7 years experience.",
      title: "Senior Fullstack Engineer",
      skills: ["TypeScript", "Node.js", "React"],
      cvUrl: "https://example.com/alex_cv.pdf",
    });

    // Register Freelancer 2
    const free2 = await registerAndLogin(app, {
      email: "beatrice_freelancer@example.com",
      role: "freelancer",
      firstName: "Beatrice",
      lastName: "Designer",
    });
    freelancer2Id = free2.userId;
    await UserModel.findByIdAndUpdate(freelancer2Id, {
      bio: "UI/UX Designer creating beautiful user experiences.",
      title: "Lead Product Designer",
      skills: ["Figma", "CSS", "UI/UX"],
      cvUrl: "https://example.com/beatrice_cv.pdf",
    });

    // Register Freelancer 3
    const free3 = await registerAndLogin(app, {
      email: "carlos_freelancer@example.com",
      role: "freelancer",
      firstName: "Carlos",
      lastName: "Mobile",
    });
    freelancer3Id = free3.userId;
    await UserModel.findByIdAndUpdate(freelancer3Id, {
      bio: "Flutter and Mobile development expert.",
      title: "Mobile App Developer",
      skills: ["Flutter", "Dart", "iOS", "Android"],
      cvUrl: "https://example.com/carlos_cv.pdf",
    });
  });

  describe("GET /api/v1/users/freelancers (Public Freelancer Directory)", () => {
    it("should return only users with role 'freelancer' and work without an auth token", async () => {
      const res = await request(app).get("/api/v1/users/freelancers");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const freelancers = res.body.data.freelancers;
      expect(freelancers.length).toBe(3);
      freelancers.forEach((f: any) => {
        expect(f.role).toBe("freelancer");
      });

      // Confirm client is NOT listed in freelancer directory
      const hasClient = freelancers.some(
        (f: any) => f.id === clientId || f._id === clientId
      );
      expect(hasClient).toBe(false);
    });

    it("should paginate freelancers correctly and return distinct results per page", async () => {
      // Page 1 with limit=2
      const page1Res = await request(
        app
      ).get("/api/v1/users/freelancers?page=1&limit=2");
      expect(page1Res.status).toBe(200);
      expect(page1Res.body.data.freelancers.length).toBe(2);
      expect(page1Res.body.data.pagination.total).toBe(3);
      expect(page1Res.body.data.pagination.totalPages).toBe(2);

      const page1Ids = page1Res.body.data.freelancers.map((f: any) => f.id);

      // Page 2 with limit=2
      const page2Res = await request(
        app
      ).get("/api/v1/users/freelancers?page=2&limit=2");
      expect(page2Res.status).toBe(200);
      expect(page2Res.body.data.freelancers.length).toBe(1);

      const page2Ids = page2Res.body.data.freelancers.map((f: any) => f.id);

      // Verify page 2 has different freelancers than page 1
      expect(page1Ids.includes(page2Ids[0])).toBe(false);
    });

    it("should filter freelancers correctly by search query matching name or title", async () => {
      const res = await request(app).get("/api/v1/users/freelancers?search=Alex");

      expect(res.status).toBe(200);
      expect(res.body.data.freelancers.length).toBe(1);
      expect(res.body.data.freelancers[0].firstName).toBe("Alex");
    });
  });

  describe("GET /api/v1/users/:userId/public-profile", () => {
    it("should return public profile fields and NOT leak sensitive fields (email, password)", async () => {
      const res = await request(
        app
      ).get(`/api/v1/users/${freelancer1Id}/public-profile`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const profile = res.body.data;
      expect(profile.id).toBe(freelancer1Id);
      expect(profile.firstName).toBe("Alex");
      expect(profile.lastName).toBe("Dev");
      expect(profile.bio).toBe("Senior TypeScript Engineer with 7 years experience.");
      expect(profile.title).toBe("Senior Fullstack Engineer");
      expect(profile.skills).toEqual(["TypeScript", "Node.js", "React"]);
      expect(profile.cvUrl).toBe("https://example.com/alex_cv.pdf");

      // Critical Security Assertions: email and password MUST NOT be present
      expect(profile.email).toBeUndefined();
      expect(profile.password).toBeUndefined();
      expect(Object.keys(profile).includes("email")).toBe(false);
      expect(Object.keys(profile).includes("password")).toBe(false);
    });

    it("should work WITHOUT an auth token (unauthenticated public access)", async () => {
      const res = await request(
        app
      ).get(`/api/v1/users/${freelancer2Id}/public-profile`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe("Beatrice");
    });

    it("should return 404 Not Found for a nonexistent user ID", async () => {
      const nonexistentId = "507f1f77bcf86cd799439011";
      const res = await request(
        app
      ).get(`/api/v1/users/${nonexistentId}/public-profile`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
