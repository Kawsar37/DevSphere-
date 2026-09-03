import { apiClient } from "./api-client";
import { ApiResponse, User, Experience } from "../types/api";

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  experiences?: Experience[];
}

export const developersApi = {
  async getDeveloperById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/developers/${id}`);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    return apiClient.patch<User>("/developers/me", payload);
  },

  async listDevelopers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>("/developers");
  },
};
