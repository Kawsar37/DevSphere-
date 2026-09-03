import { Router } from "express";
import { postController } from "../controllers/post.controller.js";
import { reactionController } from "../controllers/reaction.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/posts:
 *   post:
 *     summary: Publish a new post
 *     tags:
 *       - Posts
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: Why we migrated from distributed transactions to an event-driven Saga pattern in Go
 *               body:
 *                 type: string
 *                 example: Distributed 2PC transactions brought cascading latencies under peak traffic...
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Go", "Architecture", "PostgreSQL", "Distributed Systems"]
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get posts feed with authoritative ranking or latest order
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [ranked, latest]
 *           default: ranked
 *         description: Sorting strategy (ranked uses engagement score, latest uses date)
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter posts by technical tag
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Posts per page
 *     responses:
 *       200:
 *         description: Posts feed list with pagination
 */
router.post("/", authenticate, postController.createPost);
router.get("/", optionalAuth, postController.getPosts);
router.get("/saved", authenticate, postController.getSavedPosts);
router.post("/:id/save", authenticate, postController.toggleSavePost);
router.delete("/:id", authenticate, postController.deletePost);

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     summary: Get post detail by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post detail with populated author
 *       400:
 *         description: Invalid post ID format
 *       404:
 *         description: Post not found
 */
router.get("/:id", optionalAuth, postController.getPostById);

/**
 * @openapi
 * /api/posts/{id}/reactions:
 *   post:
 *     summary: Toggle reaction (like/dislike) on a post
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
 *         description: Post ID
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
 *         description: Post not found
 */
router.post("/:id/reactions", authenticate, reactionController.reactToPost);

export default router;
