import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { sendSuccess } from "../utils/response.js";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: System and database health status
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Health status details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                     database:
 *                       type: string
 *                       example: connected
 */
router.get("/health", (req: Request, res: Response) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"][
    mongoose.connection.readyState
  ] || "unknown";

  sendSuccess(res, {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbState,
  }, "System operational");
});

/**
 * @openapi
 * /api/keep-alive:
 *   get:
 *     summary: Keep-alive ping route for preventing Render sleep
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Ping acknowledgment
 */
router.get(["/keep-alive", "/temp/keep-alive"], (req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: "alive",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      message: "Render keep-alive ping received. Service is awake.",
    },
    "Keep-alive ping acknowledged"
  );
});

export default router;
