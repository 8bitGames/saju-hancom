"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkle, Check } from "@phosphor-icons/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

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
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      {/* Mystical Orb */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-accent-primary/30"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotating mystical ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dashed border-accent-primary/50"
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          transition={prefersReducedMotion ? {} : {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Second rotating ring (opposite direction) */}
        <motion.div
          className="absolute inset-4 rounded-full border border-error/30"
          style={{
            borderStyle: "dotted",
          }}
          animate={prefersReducedMotion ? {} : { rotate: -360 }}
          transition={prefersReducedMotion ? {} : {
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner glowing orb */}
        <motion.div
          className="absolute inset-6 rounded-full bg-accent-primary"
          style={prefersReducedMotion ? { boxShadow: "0 0 30px #a855f7, inset 0 0 30px rgba(255,255,255,0.1)" } : {}}
          animate={prefersReducedMotion ? {} : {
            boxShadow: [
              "0 0 30px #a855f7, inset 0 0 30px rgba(255,255,255,0.1)",
              "0 0 60px #a855f7, inset 0 0 60px rgba(255,255,255,0.2)",
              "0 0 30px #a855f7, inset 0 0 30px rgba(255,255,255,0.1)",
            ],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Crystal ball highlight */}
        <div className="absolute inset-6 rounded-full overflow-hidden">
          <div className="absolute top-2 left-4 w-8 h-4 bg-white/30 rounded-full blur-sm transform -rotate-45" />
        </div>

        {/* Floating particles inside - skip if reduced motion */}
        {!prefersReducedMotion && (
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
        )}

        {/* Progress arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="47%"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="47%"
            fill="none"
            className="stroke-accent-primary"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 47} ${2 * Math.PI * 47}`}
            animate={{
              strokeDashoffset: 2 * Math.PI * 47 * (1 - progress / 100),
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>

        {/* Center icon with step number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360],
            }}
            transition={prefersReducedMotion ? {} : {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkle className="w-10 h-10 text-white" weight="fill" />
          </motion.div>
        </div>
      </div>

      {/* Step indicator */}
      <motion.div
        className="mt-6 text-center"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={stepName}
            className="text-lg sm:text-xl font-medium text-accent-primary"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
          >
            {stepName}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm sm:text-base text-text-secondary mt-1">
          {currentStep} / {totalSteps} 단계
        </p>
      </motion.div>

      {/* Mystical energy waves - skip if reduced motion */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-primary/20"
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
      )}
    </div>
  );
}

// Step icons mapping
const stepIcons: Record<number, React.ReactNode> = {
  1: <Sparkle className="w-5 h-5" weight="fill" />,
  2: <Sparkle className="w-5 h-5" weight="fill" />,
  3: <Sparkle className="w-5 h-5" weight="fill" />,
  4: <Sparkle className="w-5 h-5" weight="fill" />,
  5: <Sparkle className="w-5 h-5" weight="fill" />,
  6: <Sparkle className="w-5 h-5" weight="fill" />,
};

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
          ? "bg-success/10 border-success/30"
          : isCurrent
          ? "bg-accent-primary/10 border-accent-primary/50"
          : "bg-background-secondary border-border opacity-50"
      )}
    >
      {/* Glow effect for current step */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-accent-primary/5"
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
            "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center",
            isCompleted
              ? "bg-success/20"
              : isCurrent
              ? "bg-accent-primary/20"
              : "bg-background-tertiary"
          )}
          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isCompleted ? (
            <Check className="w-5 h-5 text-success" weight="bold" />
          ) : (
            <span className={cn(
              isCurrent ? "text-accent-primary" : "text-text-muted"
            )}>
              {stepIcons[step]}
            </span>
          )}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "font-medium text-sm sm:text-base",
                isCompleted
                  ? "text-success"
                  : isCurrent
                  ? "text-accent-primary"
                  : "text-text-muted"
              )}
            >
              {name}
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                완료
              </span>
            )}
            {isCurrent && (
              <motion.span
                className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                분석 중
              </motion.span>
            )}
          </div>

          {/* Summary or description */}
          {isCompleted && summary && (
            <p className="text-xs sm:text-sm text-success/80 mt-1 truncate">
              {summary}
            </p>
          )}
          {isCurrent && (
            <p className="text-xs sm:text-sm text-accent-primary/80 mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
