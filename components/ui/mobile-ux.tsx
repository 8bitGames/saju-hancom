"use client";

import { useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Haptic feedback utility
export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light") {
  if (typeof window === "undefined") return;

  // iOS Safari haptic via Taptic Engine
  if ("vibrate" in navigator) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 20],
      warning: [20, 30, 20],
      error: [50, 50, 50],
    };
    navigator.vibrate(patterns[type]);
  }
}

// Pull to refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  disabled = false,
  threshold = 80,
}: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || refreshing) return;
    if (window.scrollY > 0) return;

    startY.current = e.touches[0].clientY;
    setPulling(true);
  }, [disabled, refreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling || disabled || refreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);

    // Apply resistance to pull
    const resistance = 0.5;
    const adjustedDistance = Math.min(distance * resistance, threshold * 1.5);

    setPullDistance(adjustedDistance);

    if (adjustedDistance >= threshold) {
      triggerHaptic("light");
    }
  }, [pulling, disabled, refreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling || disabled) return;

    setPulling(false);

    if (pullDistance >= threshold) {
      setRefreshing(true);
      triggerHaptic("medium");

      try {
        await onRefresh();
        triggerHaptic("success");
      } catch {
        triggerHaptic("error");
      } finally {
        setRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pulling, disabled, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity duration-200 z-10",
          (pulling || refreshing) && pullDistance > 10 ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(0, pullDistance - 40),
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-gray-100 backdrop-blur-sm flex items-center justify-center",
            refreshing && "animate-spin"
          )}
        >
          <ArrowClockwise
            className="w-5 h-5 text-[#C4A35A]"
            weight="bold"
            style={{
              transform: refreshing ? "none" : `rotate(${rotation}deg)`,
              transition: refreshing ? "none" : "transform 0.1s ease-out",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: pulling && pullDistance > 0 ? `translateY(${pullDistance}px)` : "none",
          transition: pulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Swipe action component (for list items)
interface SwipeActionProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  threshold?: number;
  className?: string;
}

export function SwipeAction({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 80,
  className,
}: SwipeActionProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // Limit swipe distance
    const maxOffset = 100;
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, diff));
    setOffsetX(clampedOffset);
  }, [swiping]);

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);

    if (offsetX >= threshold && onSwipeRight) {
      triggerHaptic("medium");
      onSwipeRight();
    } else if (offsetX <= -threshold && onSwipeLeft) {
      triggerHaptic("medium");
      onSwipeLeft();
    }

    setOffsetX(0);
  }, [offsetX, threshold, onSwipeLeft, onSwipeRight]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Left action (revealed on swipe right) */}
      {leftAction && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-start pl-4 bg-green-500"
          style={{
            width: Math.max(0, offsetX),
            opacity: offsetX > 0 ? offsetX / threshold : 0,
          }}
        >
          {leftAction}
        </div>
      )}

      {/* Right action (revealed on swipe left) */}
      {rightAction && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-4 bg-red-500"
          style={{
            width: Math.max(0, -offsetX),
            opacity: offsetX < 0 ? -offsetX / threshold : 0,
          }}
        >
          {rightAction}
        </div>
      )}

      {/* Main content */}
      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? "none" : "transform 0.2s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Bottom sheet component
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up shadow-2xl",
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-6 pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="overflow-auto max-h-[calc(85vh-80px)] p-6">
          {children}
        </div>
      </div>
    </>
  );
}
