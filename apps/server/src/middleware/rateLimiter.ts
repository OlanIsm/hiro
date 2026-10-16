import { rateLimit } from "express-rate-limit";
import { TooManyRequestsError } from "../errors/authError.js";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError("Too many login attempts. Please try again after 15 minutes."));
  },
  skip: () => process.env.NODE_ENV === "test", // Skip in testing environment
});
