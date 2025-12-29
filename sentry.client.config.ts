/**
 * Sentry Client Configuration
 * This file configures error tracking for the browser/client side
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay for debugging
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Integrations
  integrations: [
    // Browser Tracing for performance monitoring
    Sentry.browserTracingIntegration(),
    // Replay for session recording on errors
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out non-critical errors
  beforeSend(event, hint) {
    const error = hint.originalException as Error | undefined;

    // Ignore network errors that are user-related
    if (error?.message) {
      const ignoredMessages = [
        "Failed to fetch",
        "NetworkError",
        "AbortError",
        "Load failed",
        "cancelled",
      ];

      if (ignoredMessages.some((msg) => error.message.includes(msg))) {
        return null;
      }
    }

    // Ignore errors from browser extensions
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames;
      const hasExtensionFrame = frames.some(
        (frame) =>
          frame.filename?.includes("chrome-extension://") ||
          frame.filename?.includes("moz-extension://")
      );
      if (hasExtensionFrame) {
        return null;
      }
    }

    return event;
  },

  // Ignore specific error types
  ignoreErrors: [
    // Random browser plugins/extensions
    "top.GLOBALS",
    // Chrome specific error
    "originalCreateNotification",
    "canvas.contentDocument",
    // Facebook borance
    "fb_xd_fragment",
    // Adblockers
    "Can't find variable: adblock",
    // Random JS errors
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // User errors
    "Non-Error promise rejection captured",
  ],

  // Tags for filtering in Sentry dashboard
  initialScope: {
    tags: {
      app: "saju-hancom",
    },
  },
});
