import { Request, Response, NextFunction } from "express";
import { postService } from "../services/post.service.js";
import { createPostSchema, getPostsQuerySchema } from "../validators/post.validator.js";
import { sendSuccess } from "../utils/response.js";

export class PostController {
  public async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createPostSchema.parse(req.body);
      const post = await postService.createPost(req.user!.id, validated);
      sendSuccess(res, post, "Post published successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getPostsQuerySchema.parse(req.query);
      const result = await postService.getPosts(query);
      sendSuccess(res, result, "Posts retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await postService.getPostById(req.params.id);
      sendSuccess(res, post, "Post retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
