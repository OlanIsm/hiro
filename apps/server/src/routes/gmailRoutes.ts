import { Router, type Request, type Response, type NextFunction } from "express";
import crypto from "node:crypto";
import { gmailService } from "../services/gmailService.js";
import { validateBody } from "../middleware/validate.js";
import { z } from "zod";

export const gmailRouter = Router();

// Extend express session type
declare module "express-session" {
  interface SessionData {
    oauthState?: string;
  }
}

// GET /api/gmail/status - Get Gmail connection status
gmailRouter.get("/status", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await gmailService.getStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// GET /api/gmail/connect - Initialize OAuth and get Google authorization URL
gmailRouter.get("/connect", (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    const authUrl = gmailService.generateAuthUrl(state);
    res.json({ authUrl, state });
  } catch (err) {
    next(err);
  }
});

// GET /api/gmail/callback - OAuth callback from Google
gmailRouter.get("/callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) {
      return res.status(400).json({ error: "Authorization code missing" });
    }

    const expectedState = req.session?.oauthState;
    const result = await gmailService.handleOAuthCallback(code, state, expectedState);

    // If client requested JSON (e.g. from tests or API fetch)
    if (req.headers.accept?.includes("application/json")) {
      return res.json({ message: "Connected successfully", email: result.emailAddress });
    }

    // Otherwise redirect to frontend with success query param
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    res.redirect(`${clientOrigin}?gmail=connected`);
  } catch (err) {
    next(err);
  }
});

// POST /api/gmail/disconnect - Disconnect Gmail account
gmailRouter.post("/disconnect", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await gmailService.disconnect();
    res.json({ message: "Gmail disconnected successfully" });
  } catch (err) {
    next(err);
  }
});

const SyncSchema = z.object({
  mockMessages: z
    .array(
      z.object({
        id: z.string(),
        sender: z.string(),
        subject: z.string(),
        snippet: z.string(),
        date: z.string().optional(),
      })
    )
    .optional(),
});

// POST /api/gmail/sync - Run email sync and matching
gmailRouter.post(
  "/sync",
  validateBody(SyncSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mockMessages } = req.body;
      const result = await gmailService.sync(mockMessages);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/gmail/recommendations - List pending email recommendations
gmailRouter.get("/recommendations", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const recommendations = await gmailService.getRecommendations();
    res.json(recommendations);
  } catch (err) {
    next(err);
  }
});

// POST /api/gmail/recommendations/:id/apply - User confirms and applies recommendation
gmailRouter.post("/recommendations/:id/apply", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await gmailService.applyRecommendation(String(req.params.id));
    res.json({
      message: "Recommendation applied successfully",
      internship: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/gmail/recommendations/:id/dismiss - Dismiss recommendation
gmailRouter.post("/recommendations/:id/dismiss", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await gmailService.dismissRecommendation(String(req.params.id));
    res.json({ message: "Recommendation dismissed" });
  } catch (err) {
    next(err);
  }
});
