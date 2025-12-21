/**
 * 사주 분석 파이프라인 진행 상황 컴포넌트
 * 6단계 분석 과정을 신비로운 스타일로 표시
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import type { PipelineState } from "@/lib/hooks/useSajuPipelineStream";
import { MysticalLoader, MysticalStepCard } from "./MysticalLoader";
import { Sparkle, Check } from "@phosphor-icons/react";

interface PipelineProgressProps {
  state: PipelineState;
}

const STEP_INFO = [
  { step: 1, name: "기초 구조 분석", icon: "sparkle", description: "사주 원국을 분석하고 있습니다..." },
  { step: 2, name: "일간 심층 분석", icon: "sparkle", description: "일간의 특성을 파악하고 있습니다..." },
  { step: 3, name: "십성 분석", icon: "sparkle", description: "십성의 조화를 분석하고 있습니다..." },
  { step: 4, name: "신살 분석", icon: "sparkle", description: "신살을 해석하고 있습니다..." },
  { step: 5, name: "대운/세운 분석", icon: "sparkle", description: "올해 운세를 살펴보고 있습니다..." },
  { step: 6, name: "종합 분석", icon: "sparkle", description: "종합 분석을 완성하고 있습니다..." },
];

export default function PipelineProgress({ state }: PipelineProgressProps) {
  const { status, currentStep, completedSteps } = state;

  if (status === "idle") return null;

  const currentStepInfo = STEP_INFO.find((s) => s.step === currentStep);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main container with glass effect */}
      <div className="relative p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
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
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#22c55e] flex items-center justify-center mb-4"
              animate={{
                boxShadow: [
                  "0 0 20px #22c55e",
                  "0 0 40px #22c55e",
                  "0 0 20px #22c55e",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkle className="w-8 h-8 text-white" weight="fill" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              분석이 완료되었습니다!
            </h3>
            <p className="text-sm sm:text-base text-white/60 mt-1">
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
          className="mt-4 sm:mt-6 pt-4 border-t border-white/10"
        >
          {status === "running" ? (
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-white/60">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkle className="w-4 h-4 text-[#a855f7]" weight="fill" />
              </motion.span>
              <span>
                {completedSteps.length} / 6 단계 완료 ({Math.round((completedSteps.length / 6) * 100)}%)
              </span>
            </div>
          ) : status === "completed" ? (
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-[#22c55e]">
              <Check className="w-4 h-4" weight="bold" />
              모든 분석이 완료되었습니다!
            </div>
          ) : (
            <p className="text-center text-sm sm:text-base text-[#ef4444]">
              분석 중 오류가 발생했습니다. 다시 시도해주세요.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
