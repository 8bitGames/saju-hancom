"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

// Fixed minimum height matching stars-background.tsx
const MIN_HEIGHT = 1200;

// Check for reduced motion preference
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Check if device is mobile for frame rate optimization
const isMobile = () =>
  typeof window !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;
  const height = Math.max(window.innerHeight, window.screen?.height || 0, MIN_HEIGHT);

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 };
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2:
      return { x: offset, y: height, angle: -45 };
    case 3:
      return { x: 0, y: offset, angle: -135 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [star, setStar] = useState<ShootingStar | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisibleRef = useRef(true);
  const animationFrameId = useRef<number>(0);
  const lastFrameTime = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track if component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Frame rate: 60fps on desktop, 30fps on mobile
  const targetFPS = useMemo(() => (isMounted && isMobile() ? 30 : 60), [isMounted]);
  const frameInterval = 1000 / targetFPS;

  // Page Visibility API - pause animation when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Don't render shooting stars if user prefers reduced motion (only check on client)
  const shouldAnimate = isMounted && !prefersReducedMotion();

  const createStar = useCallback(() => {
    if (!shouldAnimate || !isVisibleRef.current) return;

    const { x, y, angle } = getRandomStartPoint();
    const newStar: ShootingStar = {
      id: Date.now(),
      x,
      y,
      angle,
      scale: 1,
      speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
      distance: 0,
    };
    setStar(newStar);

    const animationDuration = Math.random() * (maxDelay - minDelay) + minDelay;
    setTimeout(() => {
      setStar(null);
    }, animationDuration);
  }, [shouldAnimate, minSpeed, maxSpeed, minDelay, maxDelay]);

  useEffect(() => {
    if (!shouldAnimate) return;

    createStar();

    intervalRef.current = setInterval(() => {
      createStar();
    }, Math.random() * (maxDelay - minDelay) + minDelay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [shouldAnimate, createStar, minDelay, maxDelay]);

  useEffect(() => {
    if (!shouldAnimate) return;

    const moveStar = (currentTime: number) => {
      // Skip frame if page is not visible
      if (!isVisibleRef.current) {
        animationFrameId.current = requestAnimationFrame(moveStar);
        return;
      }

      // Throttle frame rate on mobile
      const elapsed = currentTime - lastFrameTime.current;
      if (elapsed < frameInterval) {
        animationFrameId.current = requestAnimationFrame(moveStar);
        return;
      }
      lastFrameTime.current = currentTime - (elapsed % frameInterval);

      if (star) {
        const height = Math.max(window.innerHeight, window.screen?.height || 0, MIN_HEIGHT);
        setStar((prevStar) => {
          if (!prevStar) return null;
          const newX =
            prevStar.x +
            prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
          const newY =
            prevStar.y +
            prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
          const newDistance = prevStar.distance + prevStar.speed;
          const newScale = 1 + newDistance / 100;
          if (
            newX < -20 ||
            newX > window.innerWidth + 20 ||
            newY < -20 ||
            newY > height + 20
          ) {
            return null;
          }
          return {
            ...prevStar,
            x: newX,
            y: newY,
            distance: newDistance,
            scale: newScale,
          };
        });
      }

      animationFrameId.current = requestAnimationFrame(moveStar);
    };

    animationFrameId.current = requestAnimationFrame(moveStar);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [star, shouldAnimate, frameInterval]);

  // Don't render anything if reduced motion is preferred
  if (!shouldAnimate) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      className={cn("w-full h-full absolute inset-0", className)}
      style={{ willChange: "transform" }}
    >
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill="url(#gradient)"
          transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${star.y + starHeight / 2})`}
        />
      )}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};
