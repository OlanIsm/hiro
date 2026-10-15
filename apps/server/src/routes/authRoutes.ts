import { Router, Request, Response, NextFunction } from "express";
import { authService } from "../services/authService.js";
import { validateBody } from "../middleware/validate.js";
import { SetupPasswordSchema, LoginSchema } from "../validation/auth.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

// GET /api/auth/status - Check whether system is initialized and session is authenticated
authRouter.get(
  "/status",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const initialized = await authService.isInitialized();
      const authenticated = Boolean(req.session && req.session.authenticated);
      res.json({
        data: {
          initialized,
          authenticated,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/setup - First-run password setup
authRouter.post(
  "/setup",
  validateBody(SetupPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.setupPassword(req.body.password);
      // Automatically log the user in upon setup
      req.session.authenticated = true;
      req.session.loginTime = Date.now();

      res.status(201).json({
        message: "Password initialized successfully",
        data: { authenticated: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login - Authenticate user
authRouter.post(
  "/login",
  loginRateLimiter,
  validateBody(LoginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.verifyPassword(req.body.password);

      req.session.authenticated = true;
      req.session.loginTime = Date.now();

      res.json({
        message: "Login successful",
        data: { authenticated: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout - End session
authRouter.post(
  "/logout",
  requireAuth,
  (req: Request, res: Response, next: NextFunction): void => {
    req.session.destroy((err) => {
      if (err) {
        next(err);
        return;
      }
      res.clearCookie("connect.sid");
      res.json({
        message: "Logout successful",
        data: { authenticated: false },
      });
    });
  }
);
