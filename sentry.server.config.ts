/**
 * Sentry Server Configuration
 * This file configures error tracking for the server side
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Performance Monitoring - lower rate in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Filter out non-critical errors
  beforeSend(event, hint) {
    const error = hint.originalException as Error | undefined;

    // Ignore expected operational errors
    if (error?.message) {
      const ignoredMessages = [
        "NEXT_NOT_FOUND",
        "NEXT_REDIRECT",
        "Rate limit exceeded",
      ];

      if (ignoredMessages.some((msg) => error.message.includes(msg))) {
        return null;
      }
    }

    return event;
  },

  // Ignore specific error types
  ignoreErrors: [
    // Expected Next.js errors
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],

  // Tags for filtering in Sentry dashboard
  initialScope: {
    tags: {
      app: "saju-hancom",
      runtime: "server",
    },
  },
});
