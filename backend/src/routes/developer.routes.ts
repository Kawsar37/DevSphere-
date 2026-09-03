import { Router } from "express";
import { developerController } from "../controllers/developer.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/developers:
 *   get:
 *     summary: List developers
 *     tags:
 *       - Developers
 *     responses:
 *       200:
 *         description: List of developers
 */
router.get("/", developerController.listDevelopers);

/**
 * @openapi
 * /api/developers/me:
 *   patch:
 *     summary: Update currently authenticated developer's profile
 *     tags:
 *       - Developers
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experiences:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - company
 *                     - from
 *                   properties:
 *                     title:
 *                       type: string
 *                     company:
 *                       type: string
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *                     currentlyWorking:
 *                       type: boolean
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", authenticate, developerController.updateProfile);

/**
 * @openapi
 * /api/developers/{id}:
 *   get:
 *     summary: Get public developer profile by ID
 *     tags:
 *       - Developers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Developer user ID
 *     responses:
 *       200:
 *         description: Developer profile details
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Developer not found
 */
router.get("/:id", developerController.getDeveloper);

export default router;
