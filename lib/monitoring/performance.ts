"use client";

/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

function getRating(
  value: number,
  goodThreshold: number,
  poorThreshold: number
): PerformanceMetric["rating"] {
  if (value <= goodThreshold) return "good";
  if (value <= poorThreshold) return "needs-improvement";
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
        rating: getRating(lastEntry.duration, 100, 300),
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
      rating: getRating(duration, 200, 1000),
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
