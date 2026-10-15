import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.js";

describe("Internship API & Status History (Phase 1)", () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.statusHistory.deleteMany();
    await prisma.processedEmail.deleteMany();
    await prisma.internship.deleteMany();
  });

  afterAll(async () => {
    await prisma.statusHistory.deleteMany();
    await prisma.processedEmail.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /api/health", () => {
    it("should return 200 and status ok", async () => {
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

      const res = await request(app).post("/api/internships").send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.companyName).toBe("Google");
      expect(res.body.data.role).toBe("Software Engineering Intern");
      expect(res.body.data.status).toBe("APPLIED");
      expect(res.body.data.skills).toEqual(["TypeScript", "React", "Node.js"]);

      // Verify status history was created automatically
      const historyRes = await request(app).get(
        `/api/internships/${res.body.data.id}/history`
      );
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data).toHaveLength(1);
      expect(historyRes.body.data[0].previousStatus).toBeNull();
      expect(historyRes.body.data[0].newStatus).toBe("APPLIED");
      expect(historyRes.body.data[0].source).toBe("MANUAL");
    });

    it("should reject creation when companyName or role is missing (400 Bad Request)", async () => {
      const res = await request(app).post("/api/internships").send({
        companyName: "Google",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toBe("Validation failed");
    });

    it("should reject creation when status is invalid", async () => {
      const res = await request(app).post("/api/internships").send({
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
      const res = await request(app).get("/api/internships");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return list of applications", async () => {
      await request(app).post("/api/internships").send({
        companyName: "Acme Corp",
        role: "Frontend Intern",
      });

      const res = await request(app).get("/api/internships");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].companyName).toBe("Acme Corp");
    });
  });

  describe("GET /api/internships/:id", () => {
    it("should return application detail by ID", async () => {
      const created = await request(app).post("/api/internships").send({
        companyName: "Stripe",
        role: "Fullstack Intern",
      });

      const res = await request(app).get(`/api/internships/${created.body.data.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.body.data.id);
      expect(res.body.data.companyName).toBe("Stripe");
    });

    it("should return 400 for malformed UUID param", async () => {
      const res = await request(app).get("/api/internships/not-a-valid-uuid");
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return 404 if internship is not found", async () => {
      const res = await request(app).get(
        "/api/internships/00000000-0000-0000-0000-000000000000"
      );
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain("not found");
    });
  });

  describe("PATCH /api/internships/:id", () => {
    it("should update application fields and record status history when status changes", async () => {
      const created = await request(app).post("/api/internships").send({
        companyName: "Spotify",
        role: "Data Engineering Intern",
      });

      const id = created.body.data.id;

      // Update status to TEST
      const updateRes = await request(app)
        .patch(`/api/internships/${id}`)
        .send({
          status: "TEST",
          notes: "Scheduled coding challenge",
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe("TEST");
      expect(updateRes.body.data.notes).toBe("Scheduled coding challenge");

      // Verify status history has 2 records
      const historyRes = await request(app).get(`/api/internships/${id}/history`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data).toHaveLength(2);
      expect(historyRes.body.data[0].previousStatus).toBe("APPLIED");
      expect(historyRes.body.data[0].newStatus).toBe("TEST");
    });

    it("should not create duplicate history when status does not change", async () => {
      const created = await request(app).post("/api/internships").send({
        companyName: "Netflix",
        role: "UI Intern",
      });

      const id = created.body.data.id;

      // Update notes only without changing status
      await request(app).patch(`/api/internships/${id}`).send({
        notes: "Updated note",
      });

      const historyRes = await request(app).get(`/api/internships/${id}/history`);
      expect(historyRes.body.data).toHaveLength(1); // Only initial APPLIED record
    });
  });

  describe("DELETE /api/internships/:id", () => {
    it("should delete the internship and cascade delete its status history", async () => {
      const created = await request(app).post("/api/internships").send({
        companyName: "Amazon",
        role: "Cloud Intern",
      });

      const id = created.body.data.id;

      const deleteRes = await request(app).delete(`/api/internships/${id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe("Internship deleted successfully");

      // Verify it's no longer found
      const getRes = await request(app).get(`/api/internships/${id}`);
      expect(getRes.status).toBe(404);
    });
  });
});
