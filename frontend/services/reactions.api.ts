import { apiClient } from "./api-client";
import { ApiResponse } from "../types/api";

export interface ReactionResponse {
  targetId: string;
  targetType: "post" | "comment";
  likesCount: number;
  dislikesCount: number;
  rankScore?: number;
  userReaction: "like" | "dislike" | null;
}

export const reactionsApi = {
  async reactToPost(
    postId: string,
    reactionType: "like" | "dislike"
  ): Promise<ApiResponse<ReactionResponse>> {
    return apiClient.post<ReactionResponse>(`/posts/${postId}/reactions`, {
      reactionType,
    });
  },

  async reactToComment(
    commentId: string,
    reactionType: "like" | "dislike"
  ): Promise<ApiResponse<ReactionResponse>> {
    return apiClient.post<ReactionResponse>(`/comments/${commentId}/reactions`, {
      reactionType,
    });
  },
};
