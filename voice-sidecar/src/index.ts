import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { wsHandler } from "./routes/ws";
import { sessionHandler } from "./routes/session";
import { healthHandler } from "./routes/health";
import { cartesiaWS } from "./services/cartesia-ws";
import type { Server } from "bun";
import type { WSData } from "./types";

const app = new Hono();

// Pre-warm Cartesia WebSocket connection for faster first TTS
// This saves ~200ms on the first request
cartesiaWS.connect().then(() => {
  console.log("✅ Cartesia WebSocket pre-warmed");
}).catch((err) => {
  console.warn("⚠️ Cartesia WebSocket pre-warm failed:", err);
});

// Middleware
app.use("*", logger());
app.use("*", cors({
  origin: ["https://hansa.ai.kr", "https://saju-hancom.vercel.app", "http://localhost:3000"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.route("/health", healthHandler);
app.route("/session", sessionHandler);

// Start server with WebSocket support
const port = Number(process.env.PORT) || 3001;

console.log(`🎙️ Starting Cheonggiun Voice Sidecar on port ${port}...`);

const server = Bun.serve({
  port,
  fetch(req: Request, server: Server<WSData>) {
    const url = new URL(req.url);

    // Handle WebSocket upgrade for /ws path
    if (url.pathname === "/ws") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) {
        return new Response("Missing sessionId", { status: 400 });
      }

      const upgraded = server.upgrade(req, {
        data: { sessionId },
      });

      if (upgraded) {
        // Bun automatically returns a 101 Switching Protocols response
        return undefined;
      }

      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    // All other requests go to Hono
    return app.fetch(req);
  },
  websocket: wsHandler,
});

console.log(`✅ Voice sidecar running on port ${port}`);
console.log(`   WebSocket: ws://localhost:${port}/ws`);
console.log(`   Health: http://localhost:${port}/health`);
