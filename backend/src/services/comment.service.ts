import mongoose from "mongoose";
import { Comment, IComment } from "../models/Comment.js";
import { Post } from "../models/Post.js";
import { CreateCommentInput } from "../validators/comment.validator.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

import { reactionService } from "./reaction.service.js";

export interface CommentNode {
  _id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  body: string;
  likesCount: number;
  dislikesCount: number;
  replyCount: number;
  userReaction?: "like" | "dislike" | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
  };
  replies: CommentNode[];
}

export class CommentService {
  public async getCommentsByPostId(
    postId: string,
    currentUserId?: string
  ): Promise<{ tree: CommentNode[]; total: number }> {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Invalid post ID format.");
    }

    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .populate("author", "name email avatarUrl bio");

    let reactionsMap: Record<string, "like" | "dislike"> = {};
    if (currentUserId && comments.length > 0) {
      reactionsMap = await reactionService.getUserReactionsMap(
        currentUserId,
        "comment",
        comments.map((c) => c._id.toString())
      );
    }

    // Assemble flat list into nested tree hierarchy
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    // Step 1: Initialize nodes
    comments.forEach((c) => {
      const node: CommentNode = {
        _id: c._id.toString(),
        postId: c.postId.toString(),
        authorId: c.authorId.toString(),
        parentCommentId: c.parentCommentId ? c.parentCommentId.toString() : null,
        body: c.body,
        likesCount: c.likesCount,
        dislikesCount: c.dislikesCount,
        replyCount: c.replyCount,
        userReaction: reactionsMap[c._id.toString()] || null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        author: (c as any).author,
        replies: [],
      };
      map.set(c._id.toString(), node);
    });

    // Step 2: Build tree
    comments.forEach((c) => {
      const node = map.get(c._id.toString())!;
      if (c.parentCommentId && map.has(c.parentCommentId.toString())) {
        const parent = map.get(c.parentCommentId.toString())!;
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return {
      tree: roots,
      total: comments.length,
    };
  }

  public async createComment(
    postId: string,
    authorId: string,
    input: CreateCommentInput,
    parentCommentId?: string
  ): Promise<IComment> {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Invalid post ID format.");
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found.");
    }

    let parentId: mongoose.Types.ObjectId | null = null;
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        throw new BadRequestError("Invalid parent comment ID format.");
      }
      const parent = await Comment.findById(parentCommentId);
      if (!parent || parent.postId.toString() !== postId) {
        throw new NotFoundError("Parent comment not found on this post.");
      }
      parentId = new mongoose.Types.ObjectId(parentCommentId);

      // Increment parent's replyCount
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { replyCount: 1 },
      });
    }

    const comment = await Comment.create({
      postId: new mongoose.Types.ObjectId(postId),
      authorId: new mongoose.Types.ObjectId(authorId),
      parentCommentId: parentId,
      body: input.body,
      likesCount: 0,
      dislikesCount: 0,
      replyCount: 0,
    });

    // Atomically increment post commentCount and recompute rankScore
    post.commentCount += 1;
    post.rankScore = (post.likesCount - post.dislikesCount) + (post.commentCount * 2);
    await post.save();

    await comment.populate("author", "name email avatarUrl bio");
    return comment;
  }
}

export const commentService = new CommentService();
