import { Hono } from "hono";

// Store for session data that will be accessed by WebSocket handler
export const sessionStore = new Map<string, {
  systemPrompt: string;
  locale: string;
  contextType: string;
  greeting: string;
  existingMessages?: Array<{ role: "user" | "assistant"; content: string; channel: string }>;
  createdAt: Date;
}>();

export const sessionHandler = new Hono();

sessionHandler.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, systemPrompt, locale, contextType, greeting, existingMessages } = body;

    if (!sessionId || !systemPrompt) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Store session data for WebSocket handler to access
    sessionStore.set(sessionId, {
      systemPrompt,
      locale: locale || "ko",
      contextType: contextType || "saju",
      greeting: greeting || "",
      existingMessages: existingMessages || undefined,
      createdAt: new Date(),
    });

    // Clean up old sessions (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [id, session] of sessionStore.entries()) {
      if (session.createdAt < oneHourAgo) {
        sessionStore.delete(id);
      }
    }

    console.log(`[Session] Created session: ${sessionId}`);

    return c.json({
      success: true,
      sessionId,
      wsUrl: `/ws?sessionId=${sessionId}`,
    });
  } catch (error) {
    console.error("[Session] Error:", error);
    return c.json({ error: "Failed to create session" }, 500);
  }
});

sessionHandler.get("/:sessionId", (c) => {
  const sessionId = c.req.param("sessionId");
  const session = sessionStore.get(sessionId);

  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  return c.json({
    sessionId,
    locale: session.locale,
    contextType: session.contextType,
    createdAt: session.createdAt.toISOString(),
  });
});

sessionHandler.delete("/:sessionId", (c) => {
  const sessionId = c.req.param("sessionId");
  const deleted = sessionStore.delete(sessionId);

  return c.json({ success: deleted });
});
