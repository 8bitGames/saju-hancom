/**
 * 사주 분석 파이프라인 진행 상황 컴포넌트
 * 6단계 분석 과정을 시각적으로 표시
 */

"use client";

import React from "react";
import type { PipelineState } from "@/lib/hooks/useSajuPipelineStream";

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
  const progress = (completedSteps.length / 6) * 100;

  if (status === "idle") return null;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {status === "running" ? "사주 분석 중..." : status === "completed" ? "분석 완료!" : "오류 발생"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {status === "running" && currentStep > 0
            ? STEP_INFO[currentStep - 1]?.description
            : status === "completed"
            ? "모든 분석이 완료되었습니다"
            : state.error}
        </p>
      </div>

      {/* 전체 진행률 바 */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        {status === "running" && (
          <div
            className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ left: `${progress - 10}%` }}
          />
        )}
      </div>

      {/* 단계별 표시 */}
      <div className="space-y-3">
        {STEP_INFO.map((stepInfo) => {
          const isCompleted = completedSteps.some((s) => s.step === stepInfo.step);
          const isCurrent = currentStep === stepInfo.step && status === "running";
          const isPending = !isCompleted && !isCurrent;
          const completedData = completedSteps.find((s) => s.step === stepInfo.step);

          return (
            <div
              key={stepInfo.step}
              className={`flex items-center p-3 rounded-xl transition-all duration-300 ${
                isCompleted
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : isCurrent
                  ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 animate-pulse"
                  : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-50"
              }`}
            >
              {/* 아이콘 */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  isCompleted
                    ? "bg-green-100 dark:bg-green-800"
                    : isCurrent
                    ? "bg-purple-100 dark:bg-purple-800"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {isCompleted ? "✓" : stepInfo.icon}
              </div>

              {/* 내용 */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${
                      isCompleted
                        ? "text-green-700 dark:text-green-300"
                        : isCurrent
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {stepInfo.name}
                  </span>
                  {isCompleted && (
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">
                      완료
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded-full">
                      분석 중...
                    </span>
                  )}
                </div>

                {/* 완료된 단계의 요약 */}
                {isCompleted && completedData?.summary && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 truncate">
                    {completedData.summary}
                  </p>
                )}

                {/* 진행 중인 단계의 설명 */}
                {isCurrent && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    {stepInfo.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 정보 */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {status === "running" ? (
          <p>
            {completedSteps.length} / 6 단계 완료 ({Math.round(progress)}%)
          </p>
        ) : status === "completed" ? (
          <p>🎊 분석이 성공적으로 완료되었습니다!</p>
        ) : (
          <p className="text-red-500">분석 중 오류가 발생했습니다. 다시 시도해주세요.</p>
        )}
      </div>
    </div>
  );
}
