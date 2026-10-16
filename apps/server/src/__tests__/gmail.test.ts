import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.js";
import { encryptToken, decryptToken } from "../utils/crypto.js";
import { matchEmail } from "../services/gmailMatcher.js";

describe("Phase 7 — Gmail Integration & Recruitment Sync", () => {
  let authCookie: string;

  beforeEach(async () => {
    // Clean test database tables
    await prisma.statusHistory.deleteMany();
    await prisma.processedEmail.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.gmailAccount.deleteMany();
    await prisma.appSettings.deleteMany();

    // Initialize password and login
    await request(app)
      .post("/api/auth/setup")
      .send({ password: "masterpassword123" });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ password: "masterpassword123" });

    authCookie = loginRes.headers["set-cookie"]?.[0] || "";
  });

  describe("Token Encryption & Decryption", () => {
    it("should securely encrypt and decrypt refresh tokens with AES-256-GCM", () => {
      const rawToken = "1//04fake-refresh-token-xyz-123456789";
      const encrypted = encryptToken(rawToken);

      expect(encrypted).not.toBe(rawToken);
      expect(encrypted.split(":")).toHaveLength(3);

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(rawToken);
    });

    it("should throw error on invalid ciphertext format or tampered data", () => {
      expect(() => decryptToken("invalid-token-string")).toThrow("Invalid encrypted token format");
    });
  });

  describe("Connection Status & OAuth", () => {
    it("should reject unauthenticated access to /api/gmail/status (401)", async () => {
      const res = await request(app).get("/api/gmail/status");
      expect(res.status).toBe(401);
    });

    it("should return disconnected state when no Gmail account is registered", async () => {
      const res = await request(app)
        .get("/api/gmail/status")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        connected: false,
        emailAddress: null,
        lastSyncedAt: null,
        syncEnabled: false,
      });
    });

    it("should generate OAuth connect URL with gmail.readonly scope", async () => {
      process.env.GOOGLE_CLIENT_ID = "mock-client-id-12345.apps.googleusercontent.com";
      process.env.GOOGLE_CLIENT_SECRET = "mock-secret-67890";

      const res = await request(app)
        .get("/api/gmail/connect")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.authUrl).toContain("accounts.google.com/o/oauth2/v2/auth");
      expect(res.body.authUrl).toContain("scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly");
      expect(res.body.state).toBeDefined();
    });
  });

  describe("Gmail Matching Engine", () => {
    it("should classify HackerRank assessment email as TEST phase with high confidence", async () => {
      const appRecord = await prisma.internship.create({
        data: {
          companyName: "Stripe",
          role: "Backend Engineering Intern",
          recruiterEmail: "recruiting@stripe.com",
          status: "APPLIED",
        },
      });

      const email = {
        id: "msg-stripe-oa-101",
        sender: "Stripe Recruiting <recruiting@stripe.com>",
        subject: "Stripe Internship: Complete your HackerRank Online Assessment",
        snippet: "Hi Olan, Thank you for applying! Please complete your 90-minute HackerRank coding challenge.",
      };

      const result = matchEmail(email, [appRecord]);

      expect(result.matchedInternshipId).toBe(appRecord.id);
      expect(result.recommendedStatus).toBe("TEST");
      expect(result.detectedCategory).toBe("ONLINE_ASSESSMENT");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.isAmbiguous).toBe(false);
    });

    it("should classify interview invitation email as INTERVIEW phase with high confidence", async () => {
      const appRecord = await prisma.internship.create({
        data: {
          companyName: "Discord",
          role: "Frontend Engineer Intern",
          recruiterEmail: "jobs@discord.com",
          status: "TEST",
        },
      });

      const email = {
        id: "msg-discord-int-202",
        sender: "Discord Talent <jobs@discord.com>",
        subject: "Invitation to interview with Discord team",
        snippet: "We were impressed with your assessment and would like to schedule a 45-minute technical interview via Google Meet.",
      };

      const result = matchEmail(email, [appRecord]);

      expect(result.matchedInternshipId).toBe(appRecord.id);
      expect(result.recommendedStatus).toBe("INTERVIEW");
      expect(result.detectedCategory).toBe("INTERVIEW_INVITATION");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.isAmbiguous).toBe(false);
    });

    it("should mark ambiguous matches without silently applying status", async () => {
      // 2 internships at same company with different roles
      const app1 = await prisma.internship.create({
        data: {
          companyName: "Google",
          role: "Software Engineering Intern",
          status: "APPLIED",
        },
      });
      const app2 = await prisma.internship.create({
        data: {
          companyName: "Google",
          role: "Site Reliability Intern",
          status: "APPLIED",
        },
      });

      const email = {
        id: "msg-ambiguous-303",
        sender: "Google Careers <careers@google.com>",
        subject: "Next steps in your process at Google",
        snippet: "We are pleased to offer you the next round of interviews.",
      };

      const result = matchEmail(email, [app1, app2]);

      // When ambiguous between multiple applications, matchedInternshipId is null
      expect(result.isAmbiguous).toBe(true);
      expect(result.matchedInternshipId).toBeNull();
    });

    it("should ignore irrelevant newsletter or non-recruitment emails", async () => {
      const appRecord = await prisma.internship.create({
        data: {
          companyName: "Spotify",
          role: "Data Engineer Intern",
          status: "APPLIED",
        },
      });

      const email = {
        id: "msg-spotify-newsletter-404",
        sender: "Spotify <news@spotify.com>",
        subject: "Your Weekly Discover Mix is ready",
        snippet: "Listen to the top tracks picked just for you this week.",
      };

      const result = matchEmail(email, [appRecord]);

      expect(result.recommendedStatus).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe("Sync, Deduplication & Atomic Confirmation Flow", () => {
    it("should sync mock emails, record ProcessedEmail, and prevent duplicate syncs", async () => {
      const appRecord = await prisma.internship.create({
        data: {
          companyName: "Netflix",
          role: "Systems Intern",
          status: "APPLIED",
        },
      });

      const mockEmails = [
        {
          id: "netflix-email-001",
          sender: "Netflix University <jobs@netflix.com>",
          subject: "Netflix Systems Intern: Coding Challenge Invitation",
          snippet: "Please take your take-home assignment on HackerRank.",
        },
      ];

      // First sync run
      const syncRes1 = await request(app)
        .post("/api/gmail/sync")
        .set("Cookie", authCookie)
        .send({ mockMessages: mockEmails });

      expect(syncRes1.status).toBe(200);
      expect(syncRes1.body.syncedCount).toBe(1);
      expect(syncRes1.body.newRecommendations).toBe(1);

      // Verify recommendation is listed
      const recsRes = await request(app)
        .get("/api/gmail/recommendations")
        .set("Cookie", authCookie);

      expect(recsRes.status).toBe(200);
      expect(recsRes.body).toHaveLength(1);
      expect(recsRes.body[0].companyName).toBe("Netflix");
      expect(recsRes.body[0].recommendedStatus).toBe("TEST");

      const recommendationId = recsRes.body[0].id;

      // Second sync run with identical email message ID (Deduplication test)
      const syncRes2 = await request(app)
        .post("/api/gmail/sync")
        .set("Cookie", authCookie)
        .send({ mockMessages: mockEmails });

      expect(syncRes2.status).toBe(200);
      expect(syncRes2.body.syncedCount).toBe(0); // Deduplicated!

      // Confirm & Apply recommendation
      const applyRes = await request(app)
        .post(`/api/gmail/recommendations/${recommendationId}/apply`)
        .set("Cookie", authCookie);

      expect(applyRes.status).toBe(200);
      expect(applyRes.body.internship.status).toBe("TEST");

      // Verify StatusHistory was created atomically with source: GMAIL
      const historyRes = await request(app)
        .get(`/api/internships/${appRecord.id}/history`)
        .set("Cookie", authCookie);

      expect(historyRes.status).toBe(200);
      const historyList = Array.isArray(historyRes.body.data) ? historyRes.body.data : historyRes.body;
      const gmailChange = historyList.find((h: { source: string }) => h.source === "GMAIL");
      expect(gmailChange).toBeDefined();
      expect(gmailChange.newStatus).toBe("TEST");
      expect(gmailChange.previousStatus).toBe("APPLIED");
      expect(gmailChange.relatedEmailId).toBe(recommendationId);
    });

    it("should allow dismissing a recommendation without modifying internship status", async () => {
      const appRecord = await prisma.internship.create({
        data: {
          companyName: "Linear",
          role: "Product Intern",
          status: "APPLIED",
        },
      });

      const mockEmails = [
        {
          id: "linear-email-999",
          sender: "Linear Team <careers@linear.app>",
          subject: "Linear Product Interview Schedule",
          snippet: "Let's schedule a chat with our hiring manager.",
        },
      ];

      await request(app)
        .post("/api/gmail/sync")
        .set("Cookie", authCookie)
        .send({ mockMessages: mockEmails });

      const recs = await request(app)
        .get("/api/gmail/recommendations")
        .set("Cookie", authCookie);

      expect(recs.body).toHaveLength(1);
      const recId = recs.body[0].id;

      // Dismiss recommendation
      const dismissRes = await request(app)
        .post(`/api/gmail/recommendations/${recId}/dismiss`)
        .set("Cookie", authCookie);

      expect(dismissRes.status).toBe(200);

      // Verify internship status remains unchanged
      const checkRes = await request(app)
        .get(`/api/internships/${appRecord.id}`)
        .set("Cookie", authCookie);

      const statusVal = checkRes.body.data?.status || checkRes.body.status;
      expect(statusVal).toBe("APPLIED");
    });

    it("should safely disconnect Gmail and remove stored account records", async () => {
      await prisma.gmailAccount.create({
        data: {
          emailAddress: "olan@gmail.com",
          encryptedRefreshToken: encryptToken("refresh-token-val"),
          syncEnabled: true,
        },
      });

      const disconnectRes = await request(app)
        .post("/api/gmail/disconnect")
        .set("Cookie", authCookie);

      expect(disconnectRes.status).toBe(200);

      const statusRes = await request(app)
        .get("/api/gmail/status")
        .set("Cookie", authCookie);

      expect(statusRes.body.connected).toBe(false);
    });
  });
});
