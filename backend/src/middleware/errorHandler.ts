import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import { ENV } from "../config/env.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    sendError(res, "Validation Error", 400, formattedErrors);
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    sendError(res, `Invalid format for field: ${err.path}`, 400);
    return;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    sendError(res, `A record with this ${field} already exists.`, 409);
    return;
  }

  // Handle Known AppErrors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors || []);
    return;
  }

  // Log unexpected errors
  console.error("[ServerError]", err);

  // Generic 500 Error
  const message =
    ENV.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  sendError(res, message, 500);
}
