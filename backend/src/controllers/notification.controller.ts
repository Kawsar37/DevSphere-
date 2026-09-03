import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service.js";
import { sendSuccess } from "../utils/response.js";

export class NotificationController {
  async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await notificationService.getUserNotifications(
        req.user!.id,
        page,
        limit
      );

      sendSuccess(res, result, "Notifications retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const modified = await notificationService.markAsRead(req.user!.id, id);

      sendSuccess(res, { modified }, "Notification marked as read.");
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const modifiedCount = await notificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, { modifiedCount }, "All notifications marked as read.");
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
