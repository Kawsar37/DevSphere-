import { ENV } from "../config/env.js";

/**
 * Automatically self-pings the server every 10 minutes to prevent
 * Render.com free-tier instances from spinning down due to inactivity.
 */
export function startKeepAliveJob(): void {
  // 10 minutes in milliseconds (Render spins down after 15 mins of inactivity)
  const TEN_MINUTES_MS = 10 * 60 * 1000;

  console.log("[Keep-Alive] Initialized self-ping service (interval: 10 minutes)");

  setInterval(async () => {
    try {
      // 1. Render automatically exposes RENDER_EXTERNAL_URL in environment (e.g. https://devsphere.onrender.com)
      // 2. Or custom SERVER_URL environment variable
      // 3. Fallback to local server port
      const baseUrl =
        process.env.RENDER_EXTERNAL_URL ||
        process.env.SERVER_URL ||
        `http://localhost:${ENV.PORT}`;

      const pingUrl = `${baseUrl.replace(/\/$/, "")}/api/keep-alive`;

      const response = await fetch(pingUrl);
      if (response.ok) {
        console.log(
          `[Keep-Alive] Ping successful: ${pingUrl} (HTTP ${response.status}) at ${new Date().toLocaleTimeString()}`
        );
      } else {
        console.warn(`[Keep-Alive] Ping returned HTTP ${response.status}`);
      }
    } catch (err: any) {
      // Avoid unhandled crashes if network blips occur
      console.warn(`[Keep-Alive] Ping skipped (${err.message}). Retrying in 10 minutes.`);
    }
  }, TEN_MINUTES_MS);
}
