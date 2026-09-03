import { Request, Response, NextFunction } from "express";
import { reactionService } from "../services/reaction.service.js";
import { reactionSchema } from "../validators/reaction.validator.js";
import { sendSuccess } from "../utils/response.js";

export class ReactionController {
  public async reactToPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = reactionSchema.parse(req.body);
      const result = await reactionService.toggleReaction(
        req.user!.id,
        "post",
        req.params.id,
        validated.reactionType
      );
      sendSuccess(res, result, "Reaction updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async reactToComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = reactionSchema.parse(req.body);
      const result = await reactionService.toggleReaction(
        req.user!.id,
        "comment",
        req.params.id,
        validated.reactionType
      );
      sendSuccess(res, result, "Reaction updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const reactionController = new ReactionController();
