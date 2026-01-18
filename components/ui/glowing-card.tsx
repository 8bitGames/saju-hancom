"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  variants?: any;
  initial?: any;
  animate?: any;
  whileInView?: any;
  viewport?: any;
  transition?: any;
}

export function GlowingCard({
  children,
  className,
  glowColor = "rgba(196, 163, 90, 0.3)",
  variants,
  initial,
  animate,
  whileInView,
  viewport,
  transition,
}: GlowingCardProps) {
  return (
    <motion.div
      className={cn(
        "relative group",
        className
      )}
      variants={variants}
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
    >
      {/* Ambient glow effect - always visible */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-50 blur-xl transition-all duration-500 group-hover:opacity-75 group-hover:blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent 60%)`,
        }}
      />

      {/* Content container */}
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

// Simpler version for inline use
export function GlowingSection({
  children,
  className,
  glowColor = "rgba(196, 163, 90, 0.2)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <div className={cn("relative group", className)}>
      {/* Animated gradient border glow */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent 50%, ${glowColor})`,
          backgroundSize: "200% 200%",
          animation: "gradientShift 3s ease infinite",
        }}
      />

      {/* Drop shadow glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{
          background: glowColor,
        }}
      />

      {/* Content */}
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm">
        {children}
      </div>
    </div>
  );
}
