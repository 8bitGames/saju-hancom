"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MysticalLoaderProps {
  currentStep: number;
  totalSteps: number;
  stepName?: string;
  className?: string;
}

export function MysticalLoader({
  currentStep,
  totalSteps,
  stepName,
  className,
}: MysticalLoaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      {/* Mystical Orb */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            opacity: 0.3,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotating mystical ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dashed border-[var(--accent)]/50"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Second rotating ring (opposite direction) */}
        <motion.div
          className="absolute inset-4 rounded-full border border-[var(--element-fire)]/30"
          style={{
            borderStyle: "dotted",
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner glowing orb */}
        <motion.div
          className="absolute inset-6 rounded-full bg-gradient-to-br from-[var(--accent)] via-[var(--element-fire)] to-[var(--element-water)]"
          animate={{
            boxShadow: [
              "0 0 30px var(--accent), inset 0 0 30px rgba(255,255,255,0.1)",
              "0 0 60px var(--accent), inset 0 0 60px rgba(255,255,255,0.2)",
              "0 0 30px var(--accent), inset 0 0 30px rgba(255,255,255,0.1)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Crystal ball highlight */}
        <div className="absolute inset-6 rounded-full overflow-hidden">
          <div className="absolute top-2 left-4 w-8 h-4 bg-white/30 rounded-full blur-sm transform -rotate-45" />
        </div>

        {/* Floating particles inside */}
        <div className="absolute inset-6 rounded-full overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/60"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Progress arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="47%"
            fill="none"
            stroke="var(--background-elevated)"
            strokeWidth="4"
            opacity="0.3"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="47%"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 47} ${2 * Math.PI * 47}`}
            animate={{
              strokeDashoffset: 2 * Math.PI * 47 * (1 - progress / 100),
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="50%" stopColor="var(--element-fire)" />
              <stop offset="100%" stopColor="var(--element-water)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center icon with step number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-3xl sm:text-4xl"
            animate={{
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🔮
          </motion.div>
        </div>
      </div>

      {/* Step indicator */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={stepName}
            className="text-lg sm:text-xl font-medium text-[var(--accent)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {stepName}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
          {currentStep} / {totalSteps} 단계
        </p>
      </motion.div>

      {/* Mystical energy waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/20"
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{
              width: [0, 300, 400],
              height: [0, 300, 400],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Mystical step cards component
interface MysticalStepCardProps {
  step: number;
  name: string;
  icon: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  summary?: string;
}

export function MysticalStepCard({
  step,
  name,
  icon,
  description,
  isCompleted,
  isCurrent,
  summary,
}: MysticalStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
      className={cn(
        "relative p-3 sm:p-4 rounded-xl border transition-all duration-500",
        isCompleted
          ? "bg-[var(--element-wood)]/10 border-[var(--element-wood)]/30"
          : isCurrent
          ? "bg-[var(--accent)]/10 border-[var(--accent)]/50"
          : "bg-[var(--background-card)]/50 border-[var(--border)]/30 opacity-50"
      )}
    >
      {/* Glow effect for current step */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-[var(--accent)]/5"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Icon */}
        <motion.div
          className={cn(
            "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl",
            isCompleted
              ? "bg-[var(--element-wood)]/20"
              : isCurrent
              ? "bg-[var(--accent)]/20"
              : "bg-[var(--background-elevated)]"
          )}
          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isCompleted ? "✓" : icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "font-medium text-sm sm:text-base",
                isCompleted
                  ? "text-[var(--element-wood)]"
                  : isCurrent
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-tertiary)]"
              )}
            >
              {name}
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--element-wood)]/20 text-[var(--element-wood)]">
                완료
              </span>
            )}
            {isCurrent && (
              <motion.span
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                분석 중
              </motion.span>
            )}
          </div>

          {/* Summary or description */}
          {isCompleted && summary && (
            <p className="text-xs sm:text-sm text-[var(--element-wood)]/80 mt-1 truncate">
              {summary}
            </p>
          )}
          {isCurrent && (
            <p className="text-xs sm:text-sm text-[var(--accent)]/80 mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
