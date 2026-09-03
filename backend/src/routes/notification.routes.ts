import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: Get paginated notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications with unreadCount
 */
router.get(
  "/",
  authenticate,
  notificationController.getNotifications.bind(notificationController)
);

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch(
  "/read-all",
  authenticate,
  notificationController.markAllAsRead.bind(notificationController)
);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark single notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch(
  "/:id/read",
  authenticate,
  notificationController.markAsRead.bind(notificationController)
);

export default router;
