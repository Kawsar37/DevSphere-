import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { sendSuccess } from "../utils/response.js";

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);
      sendSuccess(res, result, "User registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);
      sendSuccess(res, result, "Login successful", 200);
    } catch (error) {
      next(error);
    }
  }

  public async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await authService.getCurrentUser(userId);
      sendSuccess(res, user, "Current user profile retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, null, "Logged out successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
