import { Request, Response, NextFunction } from "express";
import { developerService } from "../services/developer.service.js";
import { updateProfileSchema } from "../validators/developer.validator.js";
import { sendSuccess } from "../utils/response.js";

export class DeveloperController {
  public async getDeveloper(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const developer = await developerService.getDeveloperById(req.params.id);
      sendSuccess(res, developer, "Developer profile retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await developerService.updateOwnProfile(req.user!.id, validated);
      sendSuccess(res, updated, "Profile updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async listDevelopers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const developers = await developerService.listDevelopers();
      sendSuccess(res, developers, "Developers retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const developerController = new DeveloperController();
