import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.js";

describe("Phase 2 - Authentication & Authorization", () => {
  const agent = request.agent(app); // Keeps session cookies across requests

  beforeEach(async () => {
    await prisma.statusHistory.deleteMany();
    await prisma.processedEmail.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.appSettings.deleteMany();
  });

  afterAll(async () => {
    await prisma.statusHistory.deleteMany();
    await prisma.processedEmail.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.appSettings.deleteMany();
    await prisma.$disconnect();
  });

  describe("First-Run Password Setup Flow", () => {
    it("should report initialized: false before setup", async () => {
      const res = await request(app).get("/api/auth/status");
      expect(res.status).toBe(200);
      expect(res.body.data.initialized).toBe(false);
      expect(res.body.data.authenticated).toBe(false);
    });

    it("should set up password, store hashed password, and authenticate session", async () => {
      const setupRes = await agent.post("/api/auth/setup").send({
        password: "securepassword123",
      });

      expect(setupRes.status).toBe(201);
      expect(setupRes.body.data.authenticated).toBe(true);

      // Verify password is NOT stored as plaintext
      const storedSetting = await prisma.appSettings.findUnique({
        where: { key: "auth_password_hash" },
      });
      expect(storedSetting).toBeDefined();
      expect(storedSetting?.value).not.toBe("securepassword123");
      expect(storedSetting?.value.startsWith("$2b$")).toBe(true);

      // Verify status now reports initialized: true and authenticated: true
      const statusRes = await agent.get("/api/auth/status");
      expect(statusRes.body.data.initialized).toBe(true);
      expect(statusRes.body.data.authenticated).toBe(true);
    });

    it("should reject setting up password again if already initialized", async () => {
      await request(app).post("/api/auth/setup").send({
        password: "firstpassword",
      });

      const secondAttempt = await request(app).post("/api/auth/setup").send({
        password: "secondpassword",
      });

      expect(secondAttempt.status).toBe(400);
      expect(secondAttempt.body.error.message).toContain("already been initialized");
    });

    it("should reject password that is shorter than 6 characters", async () => {
      const res = await request(app).post("/api/auth/setup").send({
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Validation failed");
    });
  });

  describe("Login and Logout Flow", () => {
    beforeEach(async () => {
      // Initialize with password
      await request(app).post("/api/auth/setup").send({
        password: "mypassword123",
      });
    });

    it("should reject login with invalid password (401)", async () => {
      const res = await request(app).post("/api/auth/login").send({
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe("Invalid credentials");
    });

    it("should successfully log in and establish session", async () => {
      const userAgent = request.agent(app);

      const loginRes = await userAgent.post("/api/auth/login").send({
        password: "mypassword123",
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.authenticated).toBe(true);

      // Session survives next request
      const statusRes = await userAgent.get("/api/auth/status");
      expect(statusRes.body.data.authenticated).toBe(true);
    });

    it("should successfully log out and invalidate session", async () => {
      const userAgent = request.agent(app);

      await userAgent.post("/api/auth/login").send({
        password: "mypassword123",
      });

      const logoutRes = await userAgent.post("/api/auth/logout");
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.data.authenticated).toBe(false);

      // Session is now unauthenticated
      const statusRes = await userAgent.get("/api/auth/status");
      expect(statusRes.body.data.authenticated).toBe(false);
    });
  });

  describe("API Protection via requireAuth Middleware", () => {
    it("should reject unauthenticated requests to /api/internships (401)", async () => {
      const res = await request(app).get("/api/internships");
      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain("Authentication required");
    });

    it("should reject unauthenticated POST /api/internships (401)", async () => {
      const res = await request(app).post("/api/internships").send({
        companyName: "Secret Corp",
        role: "Intern",
      });
      expect(res.status).toBe(401);
    });

    it("should allow authenticated session to access /api/internships", async () => {
      const userAgent = request.agent(app);

      await userAgent.post("/api/auth/setup").send({
        password: "mypassword123",
      });

      const res = await userAgent.get("/api/internships");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });
});
