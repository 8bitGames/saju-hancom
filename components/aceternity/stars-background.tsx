"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
}

interface StarsBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}

// Fixed large height to cover all possible iOS Safari viewport states
// iPhone 14 Pro Max is ~932pt, plus URL bar, safe areas, etc.
const CANVAS_MIN_HEIGHT = 1200;

export const StarsBackground: React.FC<StarsBackgroundProps> = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const [stars, setStars] = useState<Star[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateStars = useCallback(
    (width: number, height: number): Star[] => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.05 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        };
      });
    },
    [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]
  );

  useEffect(() => {
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = window.innerWidth;
        // Use fixed minimum height to guarantee coverage on iOS Safari
        // This avoids relying on viewport measurements which are unreliable
        const height = Math.max(
          window.innerHeight,
          window.screen?.height || 0,
          CANVAS_MIN_HEIGHT
        );

        canvas.width = width;
        canvas.height = height;
        setStars(generateStars(width, height));
      }
    };

    updateStars();

    // Standard events
    window.addEventListener("resize", updateStars);
    window.addEventListener("orientationchange", updateStars);

    // iOS Safari visualViewport API for URL bar changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateStars);
    }

    return () => {
      window.removeEventListener("resize", updateStars);
      window.removeEventListener("orientationchange", updateStars);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateStars);
      }
    };
  }, [generateStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 +
            Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
    />
  );
};
