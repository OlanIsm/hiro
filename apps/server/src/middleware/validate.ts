import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../errors/appError.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError(
            "Validation failed",
            (error.issues || []).map((e) => ({
              path: e.path.join("."),
              message: e.message,
            }))
          )
        );
      } else {
        next(error);
      }
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError(
            "Invalid route parameters",
            (error.issues || []).map((e) => ({
              path: e.path.join("."),
              message: e.message,
            }))
          )
        );
      } else {
        next(error);
      }
    }
  };
}
