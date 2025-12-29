"use client";

/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom metrics
 */

import * as Sentry from "@sentry/nextjs";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

// Thresholds for Core Web Vitals (INP replaces FID in web-vitals v4+)
const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(
  name: string,
  value: number
): PerformanceMetric["rating"] {
  const threshold = THRESHOLDS[name];
  if (!threshold) return "good";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Report a performance metric
 */
export function reportMetric(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    const color =
      metric.rating === "good"
        ? "\x1b[32m"
        : metric.rating === "needs-improvement"
        ? "\x1b[33m"
        : "\x1b[31m";
    console.log(`${color}[PERF] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})\x1b[0m`);
  }

  // Report to Sentry
  Sentry.addBreadcrumb({
    category: "performance",
    message: `${metric.name}: ${metric.value.toFixed(2)}`,
    level: metric.rating === "poor" ? "warning" : "info",
    data: metric,
  });

  // Send custom transaction for poor metrics
  if (metric.rating === "poor") {
    Sentry.captureMessage(`Poor ${metric.name}: ${metric.value.toFixed(2)}`, {
      level: "warning",
      tags: {
        metric: metric.name,
        rating: metric.rating,
      },
      extra: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: metric.timestamp,
      },
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this in your app's root component
 */
export async function initWebVitals() {
  if (typeof window === "undefined") return;

  try {
    // Note: onFID was removed in web-vitals v4, replaced by INP
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import("web-vitals");

    const handleMetric = (name: string) => (
      metric: { value: number; name: string }
    ) => {
      reportMetric({
        name,
        value: metric.value,
        rating: getRating(name, metric.value),
        timestamp: Date.now(),
      });
    };

    onCLS(handleMetric("CLS"));
    onFCP(handleMetric("FCP"));
    onLCP(handleMetric("LCP"));
    onTTFB(handleMetric("TTFB"));
    onINP(handleMetric("INP"));
  } catch (error) {
    // web-vitals might not be installed, silently fail
    console.debug("Web Vitals not available:", error);
  }
}

/**
 * Track a custom performance measurement
 */
export function trackTiming(name: string, startMark: string, endMark?: string) {
  if (typeof window === "undefined" || !window.performance) return;

  try {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }

    const entries = performance.getEntriesByName(name, "measure");
    const lastEntry = entries[entries.length - 1];

    if (lastEntry) {
      reportMetric({
        name,
        value: lastEntry.duration,
        rating: lastEntry.duration < 100 ? "good" : lastEntry.duration < 300 ? "needs-improvement" : "poor",
        timestamp: Date.now(),
      });
    }

    // Clean up marks
    performance.clearMarks(startMark);
    if (endMark) performance.clearMarks(endMark);
    performance.clearMeasures(name);
  } catch (error) {
    console.debug("Error tracking timing:", error);
  }
}

/**
 * Create a performance mark
 */
export function mark(name: string) {
  if (typeof window === "undefined" || !window.performance) return;
  performance.mark(name);
}

/**
 * Track component render time
 */
export function useRenderTime(componentName: string) {
  if (typeof window === "undefined") return;

  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;

  // Mark start on mount
  mark(startMark);

  // Return cleanup function that measures on unmount
  return () => {
    mark(endMark);
    trackTiming(`${componentName}-render`, startMark, endMark);
  };
}

/**
 * Track API call performance
 */
export async function trackApiCall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await apiCall();
    const duration = performance.now() - start;

    reportMetric({
      name: `api-${name}`,
      value: duration,
      rating: duration < 200 ? "good" : duration < 1000 ? "needs-improvement" : "poor",
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    reportMetric({
      name: `api-${name}-error`,
      value: duration,
      rating: "poor",
      timestamp: Date.now(),
    });

    throw error;
  }
}
