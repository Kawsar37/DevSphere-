import { apiClient } from "./api-client";
import { ApiResponse, CommentNode } from "../types/api";

export interface CommentsResponse {
  tree: CommentNode[];
  total: number;
}

export const commentsApi = {
  async getComments(postId: string): Promise<ApiResponse<CommentsResponse>> {
    return apiClient.get<CommentsResponse>(`/posts/${postId}/comments`);
  },

  async createRootComment(postId: string, body: string): Promise<ApiResponse<CommentNode>> {
    return apiClient.post<CommentNode>(`/posts/${postId}/comments`, { body });
  },

  async createReply(commentId: string, body: string): Promise<ApiResponse<CommentNode>> {
    return apiClient.post<CommentNode>(`/comments/${commentId}/replies`, { body });
  },
};
