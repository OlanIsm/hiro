import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import path from "node:path";
import fs from "node:fs";
import { internshipRouter } from "./routes/internshipRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { gmailRouter } from "./routes/gmailRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";

dotenv.config();

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from same origin (production single-origin) or configured client origin
      if (
        !origin ||
        origin === clientOrigin ||
        origin.startsWith("http://127.0.0.1") ||
        origin.startsWith("http://localhost")
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Session configuration
const isProd = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET || "olan-jira-dev-secret-12345";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd, // true only behind HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Public health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "olans-jira-server" });
});

// Authentication routes (setup, login, logout, status)
app.use("/api/auth", authRouter);

// Protected internship CRUD and history routes
app.use("/api/internships", requireAuth, internshipRouter);

// Protected Gmail integration routes
app.use("/api/gmail", requireAuth, gmailRouter);

// Serve built frontend in production / local launcher mode
const candidatePaths = [
  process.env.STATIC_PATH,
  path.resolve(__dirname, "../../web/dist"),
  path.resolve(__dirname, "../../../apps/web/dist"),
  path.resolve(process.cwd(), "../web/dist"),
  path.resolve(process.cwd(), "apps/web/dist"),
].filter(Boolean) as string[];
const frontendDistPath = candidatePaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));

  // SPA fallback for non-API GET requests
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Centralized error handling middleware
app.use(errorHandler);

export default app;
