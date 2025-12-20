"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkle, ArrowCounterClockwise, X } from "@/components/ui/icons";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { Spotlight } from "@/components/aceternity/spotlight";
import { useSajuPipelineStream } from "@/lib/hooks/useSajuPipelineStream";
import PipelineProgress from "@/components/saju/PipelineProgress";
import PipelineResult from "@/components/saju/PipelineResult";
import type { Gender } from "@/lib/saju/types";

function SajuFortuneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, startAnalysis, reset, clearSavedData, loadSavedData, hasSavedData } = useSajuPipelineStream();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    // URL 파라미터에서 사주 정보 가져오기
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const day = searchParams.get("day");
    const hour = searchParams.get("hour") || "12";
    const minute = searchParams.get("minute") || "0";
    const gender = (searchParams.get("gender") as Gender) || "male";
    const isLunar = searchParams.get("isLunar") === "true";

    if (!year || !month || !day) {
      router.push("/saju");
      return;
    }

    // 이미 분석 중이거나 완료된 경우 재시작하지 않음
    if (state.status !== "idle") {
      return;
    }

    // 저장된 데이터가 있으면 먼저 로드 시도
    if (hasSavedData()) {
      const loaded = loadSavedData();
      if (loaded) {
        return; // 저장된 데이터 로드 성공
      }
    }

    // 생년월일 문자열 생성 (YYYY-MM-DD 형식)
    const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const birthTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

    // 6단계 파이프라인 분석 시작
    startAnalysis({
      birthDate,
      birthTime,
      gender,
      isLunar,
    });
  }, [searchParams, router, state.status, startAnalysis, hasSavedData, loadSavedData]);

  // 로딩/분석 중 상태
  if (state.status === "idle" || state.status === "running") {
    return (
      <div className="relative min-h-screen pb-8">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="var(--accent)"
        />

        <div className="space-y-8 animate-fade-in relative z-10">
          {/* Header */}
          <div className="relative text-center space-y-4 py-8">
            <div className="absolute inset-0 w-full h-full">
              <SparklesCore
                id="fortune-sparkles"
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={40}
                particleColor="var(--accent)"
                className="w-full h-full"
              />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)] flex items-center justify-center animate-pulse">
                <Sparkle className="w-10 h-10 text-white" weight="fill" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                전문 사주 분석
              </h1>
              <p className="text-[var(--text-secondary)]">
                6단계 심층 분석을 진행하고 있습니다
              </p>
            </div>
          </div>

          {/* Pipeline Progress */}
          <PipelineProgress state={state} />

          {/* Cancel Button */}
          <div className="text-center pt-4">
            <Link href="/saju">
              <button className="px-6 py-3 rounded-xl bg-[var(--background-elevated)] text-[var(--text-secondary)] font-medium hover:bg-[var(--background-elevated)]/80 transition-colors">
                <ArrowCounterClockwise className="w-5 h-5 inline-block mr-2" />
                취소
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (state.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-4xl">😔</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            분석 중 오류가 발생했습니다
          </h2>
          <p className="text-[var(--text-secondary)]">{state.error}</p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium"
            >
              다시 시도
            </button>
            <Link href="/saju">
              <button className="px-6 py-3 rounded-xl bg-[var(--background-elevated)] text-[var(--text-secondary)] font-medium">
                처음으로
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 완료 상태 - 결과 표시
  if (state.status === "completed" && state.finalResult) {
    return (
      <div className="relative min-h-screen pb-8">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="var(--accent)"
        />

        <div className="space-y-8 animate-fade-in relative z-10">
          {/* Header */}
          <div className="relative text-center space-y-4 py-6">
            <div className="absolute inset-0 w-full h-full">
              <SparklesCore
                id="result-sparkles"
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={30}
                particleColor="var(--accent)"
                className="w-full h-full"
              />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)] flex items-center justify-center">
                <span className="text-3xl">🎴</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                전문 사주 분석 완료
              </h1>
              <p className="text-[var(--text-secondary)]">
                6단계 심층 분석 결과입니다
              </p>
            </div>
          </div>

          {/* Pipeline Result */}
          <PipelineResult result={state.finalResult} gender={searchParams.get("gender") || "male"} />

          {/* Action Buttons */}
          <div className="space-y-4 pt-4 max-w-4xl mx-auto">
            <Link href={`/saju/result?${searchParams.toString()}`} className="block">
              <button className="w-full h-14 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white font-bold text-lg flex items-center justify-center gap-3">
                <Sparkle className="w-5 h-5" weight="fill" />
                기본 사주 결과 보기
              </button>
            </Link>

            <Link href="/saju" className="block">
              <button className="w-full h-14 rounded-xl bg-[var(--background-elevated)] text-[var(--text-secondary)] font-medium hover:bg-[var(--background-elevated)]/80 transition-colors flex items-center justify-center gap-2">
                <ArrowCounterClockwise className="w-5 h-5" />
                다시 분석하기
              </button>
            </Link>

            {/* 저장된 데이터 삭제 버튼 */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full h-12 rounded-xl border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              저장된 분석 결과 삭제
            </button>
          </div>

          {/* 삭제 확인 모달 */}
          {showClearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowClearConfirm(false)}
              />
              <div className="relative bg-[var(--background-card)] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  분석 결과 삭제
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  저장된 사주 분석 결과를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-[var(--background-elevated)] text-[var(--text-secondary)] font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      clearSavedData();
                      setShowClearConfirm(false);
                      router.push("/saju");
                    }}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-center text-sm text-[var(--text-tertiary)] space-y-1 pt-4 pb-8">
            <p>본 분석은 전통 명리학을 기반으로 한 재미용 콘텐츠입니다</p>
            <p>실제 운세 예측이 아니며 참고용으로만 사용하세요</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function SajuFortunePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)] flex items-center justify-center animate-pulse">
              <Sparkle className="w-10 h-10 text-white" weight="fill" />
            </div>
            <p className="text-lg text-[var(--text-secondary)]">전문 분석 준비 중...</p>
            <p className="text-sm text-[var(--text-tertiary)]">잠시만 기다려주세요</p>
          </div>
        </div>
      }
    >
      <SajuFortuneContent />
    </Suspense>
  );
}
