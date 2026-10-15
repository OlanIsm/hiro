import { AppError } from "./appError.js";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized. Please log in.") {
    super(message, 401);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = "Too many login attempts. Please try again later."
  ) {
    super(message, 429);
  }
}
