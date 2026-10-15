import { prisma } from "../config/prisma.js";
import { encryptToken, decryptToken } from "../utils/crypto.js";
import { matchEmail, type EmailData, type MatchResult } from "./gmailMatcher.js";
import { AppError } from "../errors/appError.js";

export class GmailService {
  /**
   * Retrieves current Gmail integration connection status.
   */
  async getStatus() {
    const account = await prisma.gmailAccount.findFirst();
    return {
      connected: Boolean(account),
      emailAddress: account?.emailAddress || null,
      lastSyncedAt: account?.lastSyncedAt || null,
      syncEnabled: account?.syncEnabled ?? false,
    };
  }

  /**
   * Generates Google OAuth 2.0 authorization URL.
   */
  generateAuthUrl(state: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || "http://127.0.0.1:4000/api/gmail/callback";

    if (!clientId) {
      throw new AppError(
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.",
        500
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchanges OAuth authorization code for tokens and registers/updates the account.
   */
  async handleOAuthCallback(code: string, state: string, expectedState?: string) {
    if (expectedState && state !== expectedState) {
      throw new AppError("Invalid OAuth state parameter. Potential CSRF detected.", 403);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || "http://127.0.0.1:4000/api/gmail/callback";

    if (!clientId || !clientSecret) {
      throw new AppError("Google OAuth credentials missing on backend.", 500);
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new AppError(`Failed to exchange authorization code: ${errText}`, 400);
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
    };

    if (!tokens.refresh_token) {
      // Check if existing account has refresh token
      const existing = await prisma.gmailAccount.findFirst();
      if (!existing) {
        throw new AppError("Google did not return a refresh token. Re-authorization required.", 400);
      }
    }

    // Fetch user email profile
    const profileRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      throw new AppError("Failed to fetch user Gmail profile.", 400);
    }

    const profile = (await profileRes.json()) as { emailAddress: string };
    const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : "";

    const existingAccount = await prisma.gmailAccount.findFirst();
    if (existingAccount) {
      await prisma.gmailAccount.update({
        where: { id: existingAccount.id },
        data: {
          emailAddress: profile.emailAddress,
          encryptedRefreshToken: encryptedRefreshToken || existingAccount.encryptedRefreshToken,
          syncEnabled: true,
        },
      });
    } else {
      await prisma.gmailAccount.create({
        data: {
          emailAddress: profile.emailAddress,
          encryptedRefreshToken,
          syncEnabled: true,
        },
      });
    }

    return { emailAddress: profile.emailAddress };
  }

  /**
   * Safely disconnects Gmail account and purges encrypted tokens.
   */
  async disconnect() {
    await prisma.gmailAccount.deleteMany();
  }

  /**
   * Synchronizes recent emails, detects status progression, and registers recommendations.
   * Supports `mockMessages` for deterministic tests and offline sandbox mode.
   */
  async sync(mockMessages?: EmailData[]) {
    const account = await prisma.gmailAccount.findFirst();
    if (!account && !mockMessages) {
      throw new AppError("No Gmail account connected. Connect Gmail first.", 400);
    }

    let messagesToProcess: EmailData[] = [];

    if (mockMessages) {
      messagesToProcess = mockMessages;
    } else if (account) {
      // Live Gmail sync
      const decryptedRefreshToken = decryptToken(account.encryptedRefreshToken);
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new AppError("OAuth credentials not configured for sync.", 500);
      }

      // Refresh access token
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: decryptedRefreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshRes.ok) {
        throw new AppError("Failed to refresh Gmail access token. Token may have been revoked.", 401);
      }

      const { access_token } = (await refreshRes.json()) as { access_token: string };

      // Search for relevant recruitment emails
      const searchRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=interview+OR+assessment+OR+offer+OR+hackerrank+OR+codesignal",
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      if (!searchRes.ok) {
        throw new AppError("Failed to search Gmail messages.", 502);
      }

      const searchData = (await searchRes.json()) as { messages?: Array<{ id: string }> };
      const rawList = searchData.messages || [];

      for (const item of rawList) {
        // Fetch message details
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        if (msgRes.ok) {
          const msgData = (await msgRes.json()) as {
            id: string;
            snippet: string;
            payload?: { headers?: Array<{ name: string; value: string }> };
          };

          const headers = msgData.payload?.headers || [];
          const sender = headers.find((h) => h.name.toLowerCase() === "from")?.value || "";
          const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "";
          const date = headers.find((h) => h.name.toLowerCase() === "date")?.value || "";

          messagesToProcess.push({
            id: msgData.id,
            sender,
            subject,
            snippet: msgData.snippet || "",
            date,
          });
        }
      }
    }

    // Filter already processed emails (Deduplication by gmailMessageId)
    const existingProcessed = await prisma.processedEmail.findMany({
      where: { gmailMessageId: { in: messagesToProcess.map((m) => m.id) } },
      select: { gmailMessageId: true },
    });
    const existingIds = new Set(existingProcessed.map((p) => p.gmailMessageId));
    const newMessages = messagesToProcess.filter((m) => !existingIds.has(m.id));

    // Fetch all internships to match against
    const internships = await prisma.internship.findMany();

    const results: MatchResult[] = [];
    let newRecommendations = 0;

    for (const msg of newMessages) {
      const match = matchEmail(msg, internships);

      // Save processed email record
      await prisma.processedEmail.create({
        data: {
          gmailMessageId: msg.id,
          internshipId: match.matchedInternshipId,
          detectedCategory: match.detectedCategory,
          recommendedStatus: match.recommendedStatus,
          confidence: match.confidence,
        },
      });

      if (match.matchedInternshipId && match.recommendedStatus && !match.isAmbiguous) {
        newRecommendations++;
      }

      results.push(match);
    }

    // Update lastSyncedAt on account
    if (account) {
      await prisma.gmailAccount.update({
        where: { id: account.id },
        data: { lastSyncedAt: new Date() },
      });
    }

    return {
      syncedCount: newMessages.length,
      newRecommendations,
      results,
    };
  }

  /**
   * Retrieves pending recommendations for user verification.
   */
  async getRecommendations() {
    const processed = await prisma.processedEmail.findMany({
      where: {
        internshipId: { not: null },
        recommendedStatus: { not: null },
      },
      include: {
        internship: true,
      },
      orderBy: { processedAt: "desc" },
    });

    return processed.map((p) => ({
      id: p.id,
      gmailMessageId: p.gmailMessageId,
      internshipId: p.internshipId!,
      companyName: p.internship?.companyName || "Unknown",
      role: p.internship?.role || "Unknown",
      currentStatus: p.internship?.status || "APPLIED",
      recommendedStatus: p.recommendedStatus!,
      detectedCategory: p.detectedCategory || "RECRUITMENT_UPDATE",
      confidence: p.confidence || 0.8,
      processedAt: p.processedAt,
    }));
  }

  /**
   * Confirms and applies a recommended status update from an email.
   * Executes inside a database transaction to ensure StatusHistory and Internship update atomically.
   */
  async applyRecommendation(recommendationId: string) {
    const rec = await prisma.processedEmail.findUnique({
      where: { id: recommendationId },
      include: { internship: true },
    });

    if (!rec || !rec.internship || !rec.recommendedStatus) {
      throw new AppError("Recommendation not found or missing target application.", 404);
    }

    const { internship, recommendedStatus } = rec;
    const previousStatus = internship.status;

    return prisma.$transaction(async (tx) => {
      // 1. Update internship status
      const updated = await tx.internship.update({
        where: { id: internship.id },
        data: {
          status: recommendedStatus,
        },
      });

      // 2. Record status history with source GMAIL and relatedEmailId
      await tx.statusHistory.create({
        data: {
          internshipId: internship.id,
          previousStatus,
          newStatus: recommendedStatus,
          source: "GMAIL",
          relatedEmailId: rec.id,
        },
      });

      // 3. Clear recommendation so it doesn't appear again
      await tx.processedEmail.delete({
        where: { id: recommendationId },
      });

      return updated;
    });
  }

  /**
   * Dismisses a recommendation without modifying internship status.
   */
  async dismissRecommendation(recommendationId: string) {
    const exists = await prisma.processedEmail.findUnique({
      where: { id: recommendationId },
    });

    if (!exists) {
      throw new AppError("Recommendation not found.", 404);
    }

    await prisma.processedEmail.delete({
      where: { id: recommendationId },
    });
  }
}

export const gmailService = new GmailService();
