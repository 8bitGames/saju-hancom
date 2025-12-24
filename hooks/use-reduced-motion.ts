"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect user's reduced motion preference
 * Returns true if the user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns motion-safe animation props for Framer Motion
 * When reduced motion is preferred, returns static values
 */
export function useMotionSafe() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Safe transition that respects reduced motion
    safeTransition: prefersReducedMotion
      ? { duration: 0 }
      : undefined,
    // Safe initial state
    safeInitial: (initial: Record<string, unknown>) =>
      prefersReducedMotion ? {} : initial,
    // Safe animate state
    safeAnimate: (animate: Record<string, unknown>, fallback: Record<string, unknown> = {}) =>
      prefersReducedMotion ? fallback : animate,
  };
}
