import { Request, Response, NextFunction } from "express";
import { commentService } from "../services/comment.service.js";
import { createCommentSchema } from "../validators/comment.validator.js";
import { Comment } from "../models/Comment.js";
import { sendSuccess } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

export class CommentController {
  public async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await commentService.getCommentsByPostId(req.params.postId, req.user?.id);
      sendSuccess(res, result, "Comments retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async createRootComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createCommentSchema.parse(req.body);
      const comment = await commentService.createComment(
        req.params.postId,
        req.user!.id,
        validated
      );
      sendSuccess(res, comment, "Comment added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public async createReply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createCommentSchema.parse(req.body);
      const parentComment = await Comment.findById(req.params.commentId);
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found.");
      }

      const reply = await commentService.createComment(
        parentComment.postId.toString(),
        req.user!.id,
        validated,
        parentComment._id.toString()
      );

      sendSuccess(res, reply, "Reply added successfully", 201);
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
