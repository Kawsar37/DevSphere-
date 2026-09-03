import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { reactionController } from "../controllers/reaction.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

export const postCommentsRouter = Router({ mergeParams: true });
export const commentRepliesRouter = Router();

/**
 * @openapi
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: Get threaded comments tree for a post
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Threaded comments tree hierarchy
 *   post:
 *     summary: Add a root-level comment to a post
 *     tags:
 *       - Comments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 example: How do you handle compensating transactions when third-party gateway webhooks fail?
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
postCommentsRouter.get("/:postId/comments", optionalAuth, commentController.getComments);
postCommentsRouter.post("/:postId/comments", authenticate, commentController.createRootComment);

/**
 * @openapi
 * /api/comments/{commentId}/replies:
 *   post:
 *     summary: Reply to an existing comment (nested discussion)
 *     tags:
 *       - Comments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 example: We use an exponential backoff worker pool that commits dead-letter events to an audit queue...
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Parent comment not found
 */
commentRepliesRouter.post("/:commentId/replies", authenticate, commentController.createReply);

/**
 * @openapi
 * /api/comments/{id}/reactions:
 *   post:
 *     summary: Toggle reaction (like/dislike) on a comment
 *     tags:
 *       - Reactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reactionType
 *             properties:
 *               reactionType:
 *                 type: string
 *                 enum: [like, dislike]
 *                 example: like
 *     responses:
 *       200:
 *         description: Reaction updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
commentRepliesRouter.post("/:id/reactions", authenticate, reactionController.reactToComment);
