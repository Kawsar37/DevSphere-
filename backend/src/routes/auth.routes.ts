import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new developer account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Elena Rostova
 *               email:
 *                 type: string
 *                 format: email
 *                 example: elena@prisma.io
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: SecureDev123!
 *               bio:
 *                 type: string
 *                 example: Staff Engineer building distributed systems.
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: elena@prisma.io
 *               password:
 *                 type: string
 *                 example: SecureDev123!
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user info
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user details
 *       401:
 *         description: Missing or invalid token
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Clear user session
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Session terminated
 */
router.post("/logout", authController.logout);

export default router;
