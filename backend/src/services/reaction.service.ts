import mongoose from "mongoose";
import { Reaction, TargetType, ReactionType } from "../models/Reaction.js";
import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

export interface ReactionResult {
  targetId: string;
  targetType: TargetType;
  likesCount: number;
  dislikesCount: number;
  rankScore?: number;
  userReaction: ReactionType | null;
}

export class ReactionService {
  public async toggleReaction(
    userId: string,
    targetType: TargetType,
    targetId: string,
    reactionType: ReactionType
  ): Promise<ReactionResult> {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      throw new BadRequestError(`Invalid ${targetType} ID format.`);
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    const targetObjId = new mongoose.Types.ObjectId(targetId);

    // Verify target existence
    let postTarget = targetType === "post" ? await Post.findById(targetId) : null;
    let commentTarget = targetType === "comment" ? await Comment.findById(targetId) : null;

    if (targetType === "post" && !postTarget) {
      throw new NotFoundError("Post not found.");
    }
    if (targetType === "comment" && !commentTarget) {
      throw new NotFoundError("Comment not found.");
    }

    // Look for existing reaction
    const existing = await Reaction.findOne({
      userId: userObjId,
      targetType,
      targetId: targetObjId,
    });

    let finalReaction: ReactionType | null = null;
    let deltaLikes = 0;
    let deltaDislikes = 0;

    if (existing) {
      if (existing.reactionType === reactionType) {
        // Toggle OFF: remove reaction
        await Reaction.deleteOne({ _id: existing._id });
        if (reactionType === "like") deltaLikes = -1;
        else deltaDislikes = -1;
        finalReaction = null;
      } else {
        // Flip reaction
        existing.reactionType = reactionType;
        await existing.save();
        if (reactionType === "like") {
          deltaLikes = 1;
          deltaDislikes = -1;
        } else {
          deltaLikes = -1;
          deltaDislikes = 1;
        }
        finalReaction = reactionType;
      }
    } else {
      // Create new reaction
      await Reaction.create({
        userId: userObjId,
        targetType,
        targetId: targetObjId,
        reactionType,
      });
      if (reactionType === "like") deltaLikes = 1;
      else deltaDislikes = 1;
      finalReaction = reactionType;
    }

    // Update target document
    if (postTarget) {
      postTarget.likesCount = Math.max(0, postTarget.likesCount + deltaLikes);
      postTarget.dislikesCount = Math.max(0, postTarget.dislikesCount + deltaDislikes);
      // Authoritative ranking formula: score = (likes - dislikes) + (commentCount * 2)
      postTarget.rankScore =
        (postTarget.likesCount - postTarget.dislikesCount) + (postTarget.commentCount * 2);
      await postTarget.save();

      return {
        targetId,
        targetType: "post",
        likesCount: postTarget.likesCount,
        dislikesCount: postTarget.dislikesCount,
        rankScore: postTarget.rankScore,
        userReaction: finalReaction,
      };
    } else if (commentTarget) {
      commentTarget.likesCount = Math.max(0, commentTarget.likesCount + deltaLikes);
      commentTarget.dislikesCount = Math.max(0, commentTarget.dislikesCount + deltaDislikes);
      await commentTarget.save();

      return {
        targetId,
        targetType: "comment",
        likesCount: commentTarget.likesCount,
        dislikesCount: commentTarget.dislikesCount,
        userReaction: finalReaction,
      };
    }

    throw new BadRequestError("Failed to apply reaction.");
  }

  public async getUserReactionsMap(
    userId: string,
    targetType: TargetType,
    targetIds: string[]
  ): Promise<Record<string, ReactionType>> {
    if (!userId || targetIds.length === 0) return {};

    const objIds = targetIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const reactions = await Reaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      targetType,
      targetId: { $in: objIds },
    });

    const map: Record<string, ReactionType> = {};
    reactions.forEach((r) => {
      map[r.targetId.toString()] = r.reactionType;
    });

    return map;
  }
}

export const reactionService = new ReactionService();
