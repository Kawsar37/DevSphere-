import mongoose from "mongoose";
import { Post, IPost } from "../models/Post.js";
import { User } from "../models/User.js";
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
  public async createPost(authorId: string, input: CreatePostInput): Promise<IPost> {
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
    const { sort, tag, search, page, limit } = query;
    const filter: Record<string, any> = {};

    if (tag) {
      filter.tags = tag;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { body: searchRegex },
        { tags: searchRegex },
      ];
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
    let savedPostSet = new Set<string>();

    if (currentUserId) {
      const [reactions, userDoc] = await Promise.all([
        posts.length > 0
          ? reactionService.getUserReactionsMap(
              currentUserId,
              "post",
              posts.map((p) => p._id.toString())
            )
          : {},
        User.findById(currentUserId).select("savedPostIds"),
      ]);
      userReactions = reactions;
      if (userDoc?.savedPostIds) {
        savedPostSet = new Set(userDoc.savedPostIds.map((id) => id.toString()));
      }
    }

    const postsWithReactions = posts.map((p) => {
      const obj = p.toObject();
      obj.userReaction = userReactions[p._id.toString()] || null;
      obj.isSaved = savedPostSet.has(p._id.toString());
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
      const [map, userDoc] = await Promise.all([
        reactionService.getUserReactionsMap(currentUserId, "post", [id]),
        User.findById(currentUserId).select("savedPostIds"),
      ]);
      obj.userReaction = map[id] || null;
      obj.isSaved = userDoc?.savedPostIds?.some((savedId) => savedId.toString() === id) || false;
    } else {
      obj.userReaction = null;
      obj.isSaved = false;
    }

    return obj;
  }

  public async toggleSavePost(userId: string, postId: string): Promise<{ saved: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Invalid post ID format.");
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const postObjId = new mongoose.Types.ObjectId(postId);
    const existingIndex = user.savedPostIds.findIndex((id) => id.toString() === postId);

    let saved = false;
    if (existingIndex > -1) {
      user.savedPostIds.splice(existingIndex, 1);
      saved = false;
    } else {
      user.savedPostIds.push(postObjId);
      saved = true;
    }

    await user.save();
    return { saved };
  }

  public async getSavedPosts(userId: string): Promise<any[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const posts = await Post.find({ _id: { $in: user.savedPostIds } })
      .sort({ createdAt: -1 })
      .populate("author", "name email avatarUrl bio");

    const postsWithSaved = posts.map((p) => {
      const obj = p.toObject();
      obj.isSaved = true;
      return obj;
    });

    return postsWithSaved;
  }
}

export const postService = new PostService();
