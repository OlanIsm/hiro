import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { internshipRouter } from "./routes/internshipRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";

dotenv.config();

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: clientOrigin,
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

// Centralized error handling middleware
app.use(errorHandler);

export default app;
