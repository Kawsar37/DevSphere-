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
    if (query?.page) params.set("page", query.page.toString());
    if (query?.limit) params.set("limit", query.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/posts?${queryString}` : "/posts";

    return apiClient.get<PostsFeedResponse>(endpoint);
  },

  async getPostById(id: string): Promise<ApiResponse<Post>> {
    return apiClient.get<Post>(`/posts/${id}`);
  },
};
