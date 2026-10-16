import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle unexpected errors (never leak stack trace in production mode)
  console.error("Unhandled error:", err);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(500).json({
    error: {
      message,
    },
  });
}
