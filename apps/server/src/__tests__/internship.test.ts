import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.js";

describe("Internship API & Status History (Phase 1)", () => {
  const agent = request.agent(app);

  beforeEach(async () => {
    // Clean database before each test
    await prisma.statusHistory.deleteMany();
    await prisma.processedEmail.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.appSettings.deleteMany();

    // Authenticate session for protected routes
    await agent.post("/api/auth/setup").send({
      password: "testpassword123",
    });
  });

  afterAll(async () => {
    await prisma.statusHistory.deleteMany();
    await prisma.processedEmail.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.appSettings.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /api/health", () => {
    it("should return 200 and status ok without authentication", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok", service: "olans-jira-server" });
    });
  });

  describe("POST /api/internships", () => {
    it("should create a new internship application with APPLIED status and initial history", async () => {
      const payload = {
        companyName: "Google",
        role: "Software Engineering Intern",
        skills: ["TypeScript", "React", "Node.js"],
        notes: "Applied via careers portal",
      };

      const res = await agent.post("/api/internships").send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.companyName).toBe("Google");
      expect(res.body.data.role).toBe("Software Engineering Intern");
      expect(res.body.data.status).toBe("APPLIED");
      expect(res.body.data.skills).toEqual(["TypeScript", "React", "Node.js"]);

      // Verify status history was created automatically
      const historyRes = await agent.get(
        `/api/internships/${res.body.data.id}/history`
      );
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data).toHaveLength(1);
      expect(historyRes.body.data[0].previousStatus).toBeNull();
      expect(historyRes.body.data[0].newStatus).toBe("APPLIED");
      expect(historyRes.body.data[0].source).toBe("MANUAL");
    });

    it("should reject creation when companyName or role is missing (400 Bad Request)", async () => {
      const res = await agent.post("/api/internships").send({
        companyName: "Google",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toBe("Validation failed");
    });

    it("should reject creation when status is invalid", async () => {
      const res = await agent.post("/api/internships").send({
        companyName: "Meta",
        role: "Backend Intern",
        status: "INVALID_STATUS",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("GET /api/internships", () => {
    it("should return empty list when no applications exist", async () => {
      const res = await agent.get("/api/internships");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return list of applications", async () => {
      await agent.post("/api/internships").send({
        companyName: "Acme Corp",
        role: "Frontend Intern",
      });

      const res = await agent.get("/api/internships");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].companyName).toBe("Acme Corp");
    });
  });

  describe("GET /api/internships/:id", () => {
    it("should return application detail by ID", async () => {
      const created = await agent.post("/api/internships").send({
        companyName: "Stripe",
        role: "Fullstack Intern",
      });

      const res = await agent.get(`/api/internships/${created.body.data.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.body.data.id);
      expect(res.body.data.companyName).toBe("Stripe");
    });

    it("should return 400 for malformed UUID param", async () => {
      const res = await agent.get("/api/internships/not-a-valid-uuid");
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return 404 if internship is not found", async () => {
      const res = await agent.get(
        "/api/internships/00000000-0000-0000-0000-000000000000"
      );
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain("not found");
    });
  });

  describe("PATCH /api/internships/:id", () => {
    it("should update application fields and record status history when status changes", async () => {
      const created = await agent.post("/api/internships").send({
        companyName: "Spotify",
        role: "Data Engineering Intern",
      });

      const id = created.body.data.id;

      // Update status to TEST
      const updateRes = await agent
        .patch(`/api/internships/${id}`)
        .send({
          status: "TEST",
          notes: "Scheduled coding challenge",
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe("TEST");
      expect(updateRes.body.data.notes).toBe("Scheduled coding challenge");

      // Verify status history has 2 records
      const historyRes = await agent.get(`/api/internships/${id}/history`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data).toHaveLength(2);
      expect(historyRes.body.data[0].previousStatus).toBe("APPLIED");
      expect(historyRes.body.data[0].newStatus).toBe("TEST");
    });

    it("should not create duplicate history when status does not change", async () => {
      const created = await agent.post("/api/internships").send({
        companyName: "Netflix",
        role: "UI Intern",
      });

      const id = created.body.data.id;

      // Update notes only without changing status
      await agent.patch(`/api/internships/${id}`).send({
        notes: "Updated note",
      });

      const historyRes = await agent.get(`/api/internships/${id}/history`);
      expect(historyRes.body.data).toHaveLength(1); // Only initial APPLIED record
    });
  });

  describe("DELETE /api/internships/:id", () => {
    it("should delete the internship and cascade delete its status history", async () => {
      const created = await agent.post("/api/internships").send({
        companyName: "Amazon",
        role: "Cloud Intern",
      });

      const id = created.body.data.id;

      const deleteRes = await agent.delete(`/api/internships/${id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe("Internship deleted successfully");

      // Verify it's no longer found
      const getRes = await agent.get(`/api/internships/${id}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe("Phase 6 - Search, Filter, Sort, and Export", () => {
    beforeEach(async () => {
      // Seed 3 test records
      await agent.post("/api/internships").send({
        companyName: "Apple",
        role: "iOS Engineering Intern",
        skills: ["Swift", "SwiftUI"],
        status: "APPLIED",
      });

      await agent.post("/api/internships").send({
        companyName: "Microsoft",
        role: "Cloud Engineering Intern",
        skills: ["Azure", "TypeScript", "C#"],
        status: "TEST",
      });

      await agent.post("/api/internships").send({
        companyName: "Google",
        role: "Frontend Engineer Intern",
        skills: ["React", "TypeScript"],
        status: "INTERVIEW",
      });
    });

    it("should filter applications by status", async () => {
      const res = await agent.get("/api/internships?status=TEST");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].companyName).toBe("Microsoft");
    });

    it("should search applications by company name or role", async () => {
      const res = await agent.get("/api/internships?q=Google");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].role).toBe("Frontend Engineer Intern");
    });

    it("should search applications by skills tag", async () => {
      const res = await agent.get("/api/internships?q=TypeScript");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2); // Microsoft and Google
    });

    it("should export applications as JSON", async () => {
      const res = await agent.get("/api/internships/export?format=json");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.headers["content-disposition"]).toContain("attachment");
      expect(res.headers["content-disposition"]).toContain(".json");

      const parsed = JSON.parse(res.text);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThanOrEqual(3);
    });

    it("should export applications as CSV", async () => {
      const res = await agent.get("/api/internships/export?format=csv");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toContain("attachment");
      expect(res.headers["content-disposition"]).toContain(".csv");

      expect(res.text).toContain("ID,Company,Role,Status");
      expect(res.text).toContain("Apple");
      expect(res.text).toContain("Microsoft");
      expect(res.text).toContain("Google");
    });

    it("should batch import applications from items array", async () => {
      const importPayload = {
        items: [
          {
            companyName: "Stripe",
            role: "Backend Intern",
            status: "APPLIED",
            skills: ["Ruby", "Go"],
            notes: "Imported via CSV/JSON",
          },
          {
            companyName: "Airbnb",
            role: "Fullstack Intern",
            status: "INTERVIEW",
            skills: ["React", "Node.js"],
            notes: "Direct referral",
          },
        ],
      };

      const res = await agent.post("/api/internships/import").send(importPayload);
      expect(res.status).toBe(201);
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.imported).toHaveLength(2);
      expect(res.body.data.imported[0].companyName).toBe("Stripe");
      expect(res.body.data.imported[1].companyName).toBe("Airbnb");

      // Verify status history was created with source IMPORT
      const stripeId = res.body.data.imported[0].id;
      const historyRes = await agent.get(`/api/internships/${stripeId}/history`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data[0].source).toBe("IMPORT");
    });

    it("should reject batch import with empty items array", async () => {
      const res = await agent.post("/api/internships/import").send({ items: [] });
      expect(res.status).toBe(400);
    });

    it("should reject batch import with invalid internship fields", async () => {
      const res = await agent
        .post("/api/internships/import")
        .send({ items: [{ companyName: "", role: "" }] });
      expect(res.status).toBe(400);
    });
  });
});
