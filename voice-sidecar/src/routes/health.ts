import { Hono } from "hono";

export const healthHandler = new Hono();

healthHandler.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "hansa-voice-sidecar",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthHandler.get("/ready", (c) => {
  // Check if all required environment variables are set
  const requiredEnvVars = [
    "CARTESIA_API_KEY",
    "GROQ_API_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY",
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return c.json(
      {
        status: "not_ready",
        missing: missing.map((k) => k.replace(/_API_KEY$/, "_API_KEY (hidden)")),
      },
      503
    );
  }

  return c.json({ status: "ready" });
});
