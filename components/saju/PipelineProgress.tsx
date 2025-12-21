/**
 * 사주 분석 파이프라인 진행 상황 컴포넌트
 * 6단계 분석 과정을 신비로운 스타일로 표시
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import type { PipelineState } from "@/lib/hooks/useSajuPipelineStream";
import { MysticalLoader, MysticalStepCard } from "./MysticalLoader";
import { ShootingStars } from "@/components/aceternity/shooting-stars";
import { StarsBackground } from "@/components/aceternity/stars-background";

interface PipelineProgressProps {
  state: PipelineState;
}

const STEP_INFO = [
  { step: 1, name: "기초 구조 분석", icon: "🔮", description: "사주 원국을 분석하고 있습니다..." },
  { step: 2, name: "일간 심층 분석", icon: "☯️", description: "일간의 특성을 파악하고 있습니다..." },
  { step: 3, name: "십성 분석", icon: "⭐", description: "십성의 조화를 분석하고 있습니다..." },
  { step: 4, name: "신살 분석", icon: "🌟", description: "신살을 해석하고 있습니다..." },
  { step: 5, name: "대운/세운 분석", icon: "📅", description: "올해 운세를 살펴보고 있습니다..." },
  { step: 6, name: "종합 분석", icon: "✨", description: "종합 분석을 완성하고 있습니다..." },
];

export default function PipelineProgress({ state }: PipelineProgressProps) {
  const { status, currentStep, completedSteps } = state;

  if (status === "idle") return null;

  const currentStepInfo = STEP_INFO.find((s) => s.step === currentStep);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Mystical background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <StarsBackground starDensity={0.0005} className="opacity-50" />
        <ShootingStars
          starColor="var(--accent)"
          trailColor="var(--element-fire)"
          minDelay={3000}
          maxDelay={6000}
        />
      </div>

      {/* Main container with glass effect */}
      <div className="relative p-4 sm:p-6 rounded-2xl bg-[var(--background-card)]/80 backdrop-blur-xl border border-[var(--border)]/50">
        {/* Mystical Loader - Only show when running */}
        {status === "running" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 sm:mb-8"
          >
            <MysticalLoader
              currentStep={completedSteps.length}
              totalSteps={6}
              stepName={currentStepInfo?.name}
            />
          </motion.div>
        )}

        {/* Completed state header */}
        {status === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--element-wood)] to-[var(--accent)] flex items-center justify-center text-3xl sm:text-4xl mb-4"
              animate={{
                boxShadow: [
                  "0 0 20px var(--element-wood)",
                  "0 0 40px var(--element-wood)",
                  "0 0 20px var(--element-wood)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              분석이 완료되었습니다!
            </h3>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
              모든 단계가 성공적으로 완료되었습니다
            </p>
          </motion.div>
        )}

        {/* Step cards */}
        <div className="space-y-2 sm:space-y-3">
          {STEP_INFO.map((stepInfo) => {
            const isCompleted = completedSteps.some((s) => s.step === stepInfo.step);
            const isCurrent = currentStep === stepInfo.step && status === "running";
            const completedData = completedSteps.find((s) => s.step === stepInfo.step);

            return (
              <MysticalStepCard
                key={stepInfo.step}
                step={stepInfo.step}
                name={stepInfo.name}
                icon={stepInfo.icon}
                description={stepInfo.description}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                summary={completedData?.summary}
              />
            );
          })}
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-6 pt-4 border-t border-[var(--border)]/30"
        >
          {status === "running" ? (
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-[var(--text-secondary)]">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔮
              </motion.span>
              <span>
                {completedSteps.length} / 6 단계 완료 ({Math.round((completedSteps.length / 6) * 100)}%)
              </span>
            </div>
          ) : status === "completed" ? (
            <p className="text-center text-sm sm:text-base text-[var(--element-wood)]">
              🎊 모든 분석이 완료되었습니다!
            </p>
          ) : (
            <p className="text-center text-sm sm:text-base text-[var(--error)]">
              분석 중 오류가 발생했습니다. 다시 시도해주세요.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
