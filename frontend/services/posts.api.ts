import { apiClient } from "./api-client";
import { ApiResponse, Post } from "../types/api";

export interface CreatePostPayload {
  title: string;
  body: string;
  tags?: string[];
}

export interface GetPostsQuery {
  sort?: "ranked" | "latest";
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PostsFeedResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const postsApi = {
  async createPost(payload: CreatePostPayload): Promise<ApiResponse<Post>> {
    return apiClient.post<Post>("/posts", payload);
  },

  async getPosts(query?: GetPostsQuery): Promise<ApiResponse<PostsFeedResponse>> {
    const params = new URLSearchParams();
    if (query?.sort) params.set("sort", query.sort);
    if (query?.tag) params.set("tag", query.tag);
    if (query?.search) params.set("search", query.search);
    if (query?.page) params.set("page", query.page.toString());
    if (query?.limit) params.set("limit", query.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/posts?${queryString}` : "/posts";

    return apiClient.get<PostsFeedResponse>(endpoint);
  },

  async getPostById(id: string): Promise<ApiResponse<Post>> {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  async toggleSavePost(id: string): Promise<ApiResponse<{ saved: boolean }>> {
    return apiClient.post<{ saved: boolean }>(`/posts/${id}/save`);
  },

  async getSavedPosts(): Promise<ApiResponse<{ posts: Post[] }>> {
    return apiClient.get<{ posts: Post[] }>("/posts/saved");
  },

  async deletePost(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/posts/${id}`);
  },
};
