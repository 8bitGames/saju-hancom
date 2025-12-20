"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "rgba(138, 43, 226, 0.15)",
  className,
  ...props
}: {
  children: React.ReactNode;
  radius?: number;
  color?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[var(--background-card)] border border-[var(--border)]",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{
          background: isHovering
            ? `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`
            : "transparent",
        }}
        transition={{ duration: 0.2 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
