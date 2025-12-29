/**
 * Sentry Edge Configuration
 * This file configures error tracking for edge functions (middleware, edge API routes)
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

  // Tags for filtering in Sentry dashboard
  initialScope: {
    tags: {
      app: "saju-hancom",
      runtime: "edge",
    },
  },
});
