import { apiClient } from "./api-client";
import { ApiResponse, User } from "../types/api";

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  bio?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>("/auth/register", payload);
    if (res.success && res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>("/auth/login", payload);
    if (res.success && res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res;
  },

  async getMe(): Promise<ApiResponse<User>> {
    return apiClient.get<User>("/auth/me");
  },

  async logout(): Promise<ApiResponse<null>> {
    const res = await apiClient.post<null>("/auth/logout");
    apiClient.removeToken();
    return res;
  },
};
