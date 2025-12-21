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
  glowColor = "rgba(168, 85, 247, 0.5)",
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
        className="absolute -inset-0.5 rounded-2xl opacity-75 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent 60%)`,
        }}
      />

      {/* Content container */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

// Simpler version for inline use
export function GlowingSection({
  children,
  className,
  glowColor = "rgba(168, 85, 247, 0.3)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <div className={cn("relative group", className)}>
      {/* Animated gradient border glow */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent 50%, ${glowColor})`,
          backgroundSize: "200% 200%",
          animation: "gradientShift 3s ease infinite",
        }}
      />

      {/* Drop shadow glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
        style={{
          background: glowColor,
        }}
      />

      {/* Content */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
        {children}
      </div>
    </div>
  );
}
