import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

async function startServer(): Promise<void> {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`[DevSphere API] Server listening on port ${ENV.PORT} (${ENV.NODE_ENV})`);
      console.log(`[DevSphere API] Swagger docs available at http://localhost:${ENV.PORT}/api-docs`);
      console.log(`[DevSphere API] Health check at http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (error) {
    console.error("[DevSphere API] Fatal server startup error:", error);
    process.exit(1);
  }
}

startServer();
