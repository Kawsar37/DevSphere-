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
      const result = await postService.getPosts(query, req.user?.id);
      sendSuccess(res, result, "Posts retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await postService.getPostById(req.params.id, req.user?.id);
      sendSuccess(res, post, "Post retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async toggleSavePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await postService.toggleSavePost(req.user!.id, req.params.id);
      sendSuccess(
        res,
        result,
        result.saved ? "Post saved to bookmarks" : "Post removed from bookmarks",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  public async getSavedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const posts = await postService.getSavedPosts(req.user!.id);
      sendSuccess(res, { posts }, "Saved posts retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  public async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await postService.deletePost(req.params.id, req.user!.id);
      sendSuccess(res, null, "Post deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
