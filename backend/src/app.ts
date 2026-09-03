import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import healthRouter from "./routes/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupSwagger } from "./docs/swagger.js";
import { sendError } from "./utils/response.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: [ENV.CORS_ORIGIN, "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
setupSwagger(app);

// API Routes
app.use("/api", healthRouter);

// Root route redirect/info
app.get("/", (req, res) => {
  res.json({
    name: "DevSphere API",
    version: "1.0.0",
    docs: "/api-docs",
    health: "/api/health",
  });
});

// 404 Handler
app.use((req, res) => {
  sendError(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Error Middleware
app.use(errorHandler);

export default app;
