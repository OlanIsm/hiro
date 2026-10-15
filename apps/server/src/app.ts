import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { internshipRouter } from "./routes/internshipRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

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

// Public health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "olans-jira-server" });
});

// Internship CRUD and history routes
app.use("/api/internships", internshipRouter);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
