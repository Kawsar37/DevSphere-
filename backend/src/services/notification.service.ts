import mongoose from "mongoose";
import { Notification, INotification, NotificationType } from "../models/Notification.js";

export interface CreateNotificationDTO {
  recipientId: string | mongoose.Types.ObjectId;
  senderId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  postId: string | mongoose.Types.ObjectId;
  commentId?: string | mongoose.Types.ObjectId | null;
  title: string;
  body: string;
}

export class NotificationService {
  /**
   * Dispatches a notification if the recipient is not the actor themselves.
   */
  async createNotification(data: CreateNotificationDTO): Promise<INotification | null> {
    if (data.recipientId.toString() === data.senderId.toString()) {
      return null; // Don't notify users of their own actions
    }

    const notification = await Notification.create({
      recipientId: data.recipientId,
      senderId: data.senderId,
      type: data.type,
      postId: data.postId,
      commentId: data.commentId || null,
      title: data.title,
      body: data.body,
      isRead: false,
    });

    return notification;
  }

  /**
   * Retrieves paginated notifications and total unread count for a user.
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name email avatarUrl")
        .populate("post", "title")
        .lean(),
      Notification.countDocuments({ recipientId: userId }),
      Notification.countDocuments({ recipientId: userId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
    };
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const res = await Notification.updateOne(
      { _id: notificationId, recipientId: userId },
      { $set: { isRead: true } }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Marks all unread notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<number> {
    const res = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return res.modifiedCount;
  }
}

export const notificationService = new NotificationService();
