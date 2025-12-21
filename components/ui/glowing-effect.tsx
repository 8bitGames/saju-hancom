"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(function GlowingEffect({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  variant = "default",
  glow = false,
  className,
  movementDuration = 2,
  borderWidth = 1,
  disabled = true,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMove = useCallback(
    (e?: MouseEvent | { x: number; y: number }) => {
      if (!containerRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const element = containerRef.current;
        if (!element) return;

        const { left, top, width, height } = element.getBoundingClientRect();

        let x: number, y: number;
        if (e && "clientX" in e) {
          x = e.clientX - left;
          y = e.clientY - top;
        } else if (e) {
          x = e.x;
          y = e.y;
        } else {
          x = width / 2;
          y = height / 2;
        }

        const center = { x: width / 2, y: height / 2 };
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
        );
        const maxDistance = Math.sqrt(
          Math.pow(width / 2, 2) + Math.pow(height / 2, 2)
        );
        const normalizedDistance = distanceFromCenter / maxDistance;

        const isInZone = proximity
          ? x >= -proximity &&
            x <= width + proximity &&
            y >= -proximity &&
            y <= height + proximity
          : normalizedDistance <= inactiveZone;

        if (!isInZone || disabled) {
          element.style.setProperty("--glow-opacity", "0");
          return;
        }

        lastPosition.current = { x, y };

        element.style.setProperty("--glow-x", `${x}px`);
        element.style.setProperty("--glow-y", `${y}px`);
        element.style.setProperty(
          "--glow-opacity",
          `${1 - normalizedDistance / inactiveZone}`
        );
      });
    },
    [inactiveZone, proximity, disabled]
  );

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e);

    window.addEventListener("mousemove", handleMouseMove);
    handleMove({
      x: lastPosition.current.x || window.innerWidth / 2,
      y: lastPosition.current.y || window.innerHeight / 2,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMove, disabled]);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
          glow && "opacity-100",
          variant === "white" && "border-white",
          disabled && "!block",
          className
        )}
        style={{
          borderWidth,
          "--glow-spread": `${spread}px`,
          "--glow-blur": `${blur}px`,
          "--glow-duration": `${movementDuration}s`,
        } as React.CSSProperties}
      />
      <div
        ref={containerRef}
        style={
          {
            "--glow-spread": `${spread}px`,
            "--glow-blur": `${blur}px`,
            "--glow-duration": `${movementDuration}s`,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] border-0 opacity-0 transition-opacity duration-300",
          "[background:radial-gradient(var(--glow-spread)_circle_at_var(--glow-x,50%)_var(--glow-y,50%),var(--glow-color,#a855f7),transparent_100%)]",
          glow && "opacity-[var(--glow-opacity,0)]",
          blur > 0 && "blur-[var(--glow-blur)]",
          className
        )}
      />
    </>
  );
});

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
