import { apiClient } from "./api-client";
import { ApiResponse, NotificationItem } from "../types/api";

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export const notificationsApi = {
  async getNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<NotificationsResponse>> {
    return apiClient.get<NotificationsResponse>(
      `/notifications?page=${page}&limit=${limit}`
    );
  },

  async markAsRead(id: string): Promise<ApiResponse<{ modified: boolean }>> {
    return apiClient.patch<{ modified: boolean }>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<ApiResponse<{ modifiedCount: number }>> {
    return apiClient.patch<{ modifiedCount: number }>(`/notifications/read-all`);
  },
};
