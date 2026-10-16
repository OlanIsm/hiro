import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/authError.js";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
    loginTime?: number;
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    next(new UnauthorizedError("Authentication required"));
  }
}
