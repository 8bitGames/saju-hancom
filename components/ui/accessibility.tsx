"use client";

import { cn } from "@/lib/utils";

// Skip to main content link for keyboard users
export function SkipLink({ href = "#main-content" }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
    >
      본문으로 건너뛰기
    </a>
  );
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Live region for dynamic announcements
interface LiveRegionProps {
  message: string;
  mode?: "polite" | "assertive";
  className?: string;
}

export function LiveRegion({ message, mode = "polite", className }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {message}
    </div>
  );
}

// Visually hidden but focusable element for announcements
export function Announcement({
  children,
  as: Component = "div"
}: {
  children: React.ReactNode;
  as?: "div" | "span" | "p";
}) {
  return (
    <Component
      role="status"
      aria-live="polite"
      className="sr-only"
    >
      {children}
    </Component>
  );
}

// Focus visible indicator helper
export function FocusRing({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute inset-0 rounded-lg ring-2 ring-purple-500 ring-offset-2 ring-offset-black opacity-0 group-focus-visible:opacity-100 pointer-events-none transition-opacity",
        className
      )}
      aria-hidden="true"
    />
  );
}

// Keyboard navigation instructions
export function KeyboardHint({ hint }: { hint: string }) {
  return (
    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-white/40 ml-auto">
      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
        {hint}
      </kbd>
    </span>
  );
}

// Reduced motion preference detector
export function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Touch-friendly tap target wrapper
export function TapTarget({
  children,
  className,
  minSize = 44
}: {
  children: React.ReactNode;
  className?: string;
  minSize?: number;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{ minWidth: minSize, minHeight: minSize }}
    >
      {children}
    </div>
  );
}
