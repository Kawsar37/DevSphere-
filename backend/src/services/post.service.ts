import mongoose from "mongoose";
import { Post, IPost } from "../models/Post.js";
import { CreatePostInput, GetPostsQueryInput } from "../validators/post.validator.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

import { reactionService } from "./reaction.service.js";

export interface PostsFeedResult {
  posts: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PostService {
  public async createPost(
    authorId: string,
    input: CreatePostInput
  ): Promise<IPost> {
    const post = await Post.create({
      authorId: new mongoose.Types.ObjectId(authorId),
      title: input.title,
      body: input.body,
      tags: input.tags || [],
      likesCount: 0,
      dislikesCount: 0,
      commentCount: 0,
      rankScore: 0,
    });

    await post.populate("author", "name email avatarUrl bio");
    return post;
  }

  public async getPosts(query: GetPostsQueryInput, currentUserId?: string): Promise<PostsFeedResult> {
    const { sort, tag, page, limit } = query;
    const filter: Record<string, any> = {};

    if (tag) {
      filter.tags = tag;
    }

    // Determine sort order
    // Authoritative ranking formula: score = (likes - dislikes) + (commentCount * 2)
    // Tie-break: createdAt descending
    const sortOption: Record<string, any> =
      sort === "latest"
        ? { createdAt: -1 }
        : { rankScore: -1, createdAt: -1 };

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate("author", "name email avatarUrl bio"),
      Post.countDocuments(filter),
    ]);

    let userReactions: Record<string, "like" | "dislike"> = {};
    if (currentUserId && posts.length > 0) {
      userReactions = await reactionService.getUserReactionsMap(
        currentUserId,
        "post",
        posts.map((p) => p._id.toString())
      );
    }

    const postsWithReactions = posts.map((p) => {
      const obj = p.toObject();
      obj.userReaction = userReactions[p._id.toString()] || null;
      return obj;
    });

    return {
      posts: postsWithReactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public async getPostById(id: string, currentUserId?: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid post ID format.");
    }

    const post = await Post.findById(id).populate("author", "name email avatarUrl bio");
    if (!post) {
      throw new NotFoundError("Post not found.");
    }

    const obj = post.toObject();
    if (currentUserId) {
      const map = await reactionService.getUserReactionsMap(currentUserId, "post", [id]);
      obj.userReaction = map[id] || null;
    } else {
      obj.userReaction = null;
    }

    return obj;
  }
}

export const postService = new PostService();
