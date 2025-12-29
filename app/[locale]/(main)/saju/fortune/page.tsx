"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { Sparkle, ArrowCounterClockwise, X, ArrowRight, FilePdf, Warning } from "@phosphor-icons/react";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { MysticalLoader } from "@/components/saju/MysticalLoader";
import { useSajuPipelineStream } from "@/lib/hooks/useSajuPipelineStream";
import PipelineProgress from "@/components/saju/PipelineProgress";
import PipelineResult, { type TabType } from "@/components/saju/PipelineResult";
import { downloadPipelinePDF } from "@/lib/pdf/generator";
import { getDetailAnalysisFromStorage } from "@/components/saju/DetailAnalysisModal";
import type { Gender } from "@/lib/saju/types";

// 총 상세 분석 영역 수
const TOTAL_DETAIL_AREAS = 8;

function SajuFortuneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, startAnalysis, reset, clearSavedData, loadSavedData, hasSavedData } = useSajuPipelineStream();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPdfWarning, setShowPdfWarning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pendingDetailCount, setPendingDetailCount] = useState(0);
  const [currentTab, setCurrentTab] = useState<TabType>("overview");

  const handleDownloadPDF = async (skipWarning = false) => {
    if (!state.finalResult || isDownloading) return;

    // 상세 분석 개수 확인
    const detailAnalyses = getDetailAnalysisFromStorage();
    const detailCount = Object.keys(detailAnalyses).length;

    // 상세 분석을 다 안 했으면 경고창 표시
    if (!skipWarning && detailCount < TOTAL_DETAIL_AREAS) {
      setPendingDetailCount(detailCount);
      setShowPdfWarning(true);
      return;
    }

    setIsDownloading(true);
    try {
      const year = parseInt(searchParams.get("year") || "1990");
      const month = parseInt(searchParams.get("month") || "1");
      const day = parseInt(searchParams.get("day") || "1");
      const hour = parseInt(searchParams.get("hour") || "12");
      const minute = parseInt(searchParams.get("minute") || "0");
      const gender = searchParams.get("gender") || "male";
      const isLunar = searchParams.get("isLunar") === "true";

      await downloadPipelinePDF({
        birthData: {
          year,
          month,
          day,
          hour,
          minute,
          gender,
          isLunar,
        },
        result: state.finalResult,
        detailAnalyses,
      });
    } catch (error) {
      console.error("PDF download error:", error);
      alert("PDF 다운로드 중 오류가 발생했습니다. 팝업 차단을 해제해주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
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

    if (state.status !== "idle") {
      return;
    }

    const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const birthTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

    const currentInput = {
      birthDate,
      birthTime,
      gender,
      isLunar,
    };

    if (hasSavedData()) {
      const loaded = loadSavedData(currentInput);
      if (loaded) {
        return;
      }
    }

    startAnalysis(currentInput);
  }, [searchParams, router, state.status, startAnalysis, hasSavedData, loadSavedData]);

  // Loading/analyzing state
  if (state.status === "idle" || state.status === "running") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <p className="text-[#a855f7] text-sm font-medium tracking-wider">
            四柱分析
          </p>
          <h1 className="text-2xl font-bold text-white">
            전문 사주 분석
          </h1>
          <p className="text-white/60 text-base">
            6단계 심층 분석을 진행하고 있습니다
          </p>
        </div>

        {/* Pipeline Progress */}
        <PipelineProgress state={state} />

        {/* Cancel Button */}
        <div className="text-center pt-4">
          <Link href="/saju">
            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 hover:text-white transition-colors">
              <ArrowCounterClockwise className="w-5 h-5 inline-block mr-2" />
              취소
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4 p-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="w-10 h-10 text-red-400" weight="bold" />
          </div>
          <h2 className="text-xl font-bold text-white">
            분석 중 오류가 발생했습니다
          </h2>
          <p className="text-base text-white/60">{state.error}</p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-[#a855f7] text-white text-base font-medium hover:bg-[#9333ea] transition-colors"
            >
              다시 시도
            </button>
            <Link href="/saju">
              <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 transition-colors">
                처음으로
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Completed state - show result
  if (state.status === "completed" && state.finalResult) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <p className="text-[#a855f7] text-sm font-medium tracking-wider">
            四柱八字
          </p>
          <h1 className="text-2xl font-bold text-white">
            전문 사주 분석 완료
          </h1>
          <TextGenerateEffect
            words="6단계 심층 분석 결과입니다"
            className="text-base text-white/60"
            duration={0.3}
          />
        </div>

        {/* Pipeline Result */}
        <PipelineResult
          result={state.finalResult}
          gender={searchParams.get("gender") || "male"}
          birthInfo={{
            year: searchParams.get("year") || "",
            month: searchParams.get("month") || "",
            day: searchParams.get("day") || "",
            hour: searchParams.get("hour") || undefined,
            minute: searchParams.get("minute") || undefined,
            isLunar: searchParams.get("isLunar") === "true",
          }}
          onTabChange={setCurrentTab}
        />

        {/* Action Buttons - 조언 탭에서만 표시 */}
        {currentTab === "advice" && (
          <div className="space-y-4 pt-4">
            {/* PDF Download Button */}
            {(() => {
              const detailCount = Object.keys(getDetailAnalysisFromStorage()).length;
              return (
                <div className="space-y-2">
                  <button
                    onClick={() => handleDownloadPDF(false)}
                    disabled={isDownloading}
                    className="w-full h-14 rounded-xl bg-[#22c55e] text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FilePdf className="w-5 h-5" weight="fill" />
                    {isDownloading ? "PDF 생성 중..." : "전체 분석 결과 PDF 다운로드"}
                  </button>
                  <p className="text-center text-sm text-white/50">
                    {detailCount > 0
                      ? `기본 분석 + 상세 분석 ${detailCount}/${TOTAL_DETAIL_AREAS}개 영역 포함`
                      : "상세보기를 클릭하면 PDF에 포함됩니다"}
                  </p>
                </div>
              );
            })()}

            <Link href={`/saju/result?${searchParams.toString()}`} className="block">
              <button className="w-full h-14 rounded-xl bg-[#a855f7] text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#9333ea] transition-colors">
                <Sparkle className="w-5 h-5" weight="fill" />
                기본 사주 결과 보기
              </button>
            </Link>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full h-14 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowCounterClockwise className="w-5 h-5" />
              다시 분석하기
            </button>
          </div>
        )}

        {/* Reanalyze Confirm Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <div className="relative bg-[#1a1033] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">
                다시 분석하기
              </h3>
              <p className="text-base text-white/60 mb-6">
                현재 저장된 분석 결과가 새로운 결과로 덮어쓰기됩니다. 다시 분석하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    clearSavedData();
                    setShowClearConfirm(false);
                    router.push("/saju");
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#a855f7] text-base text-white font-medium hover:bg-[#9333ea] transition-colors"
                >
                  다시 분석하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Warning Modal */}
        {showPdfWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPdfWarning(false)}
            />
            <div className="relative bg-[#1a1033] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Warning className="w-6 h-6 text-yellow-400" weight="fill" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  상세 분석을 완료해주세요
                </h3>
              </div>
              <p className="text-base text-white/60 mb-3">
                현재 <span className="text-yellow-400 font-bold">{pendingDetailCount}/{TOTAL_DETAIL_AREAS}개</span> 영역만 상세 분석되었습니다.
              </p>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-sm text-white/70 mb-2 font-medium">
                  📖 완전한 PDF를 받으시려면:
                </p>
                <p className="text-sm text-white/50">
                  아래 분석 결과에서 각 영역의 <span className="text-[#a855f7]">"상세보기"</span> 버튼을 모두 클릭하여 8개 영역의 상세 분석을 먼저 확인해주세요.
                </p>
              </div>
              <p className="text-xs text-white/40 mb-5">
                상세 분석 없이 다운로드하면 기본 분석만 포함됩니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPdfWarning(false)}
                  className="flex-1 py-3 rounded-xl bg-[#a855f7] text-base text-white font-medium hover:bg-[#9333ea] transition-colors"
                >
                  상세보기 하러가기
                </button>
                <button
                  onClick={() => {
                    setShowPdfWarning(false);
                    handleDownloadPDF(true);
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-base text-white/40 font-medium hover:bg-white/10 transition-colors"
                >
                  그냥 다운로드
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-sm text-white/40 space-y-1 pt-4 pb-8">
          <p>본 분석은 전통 명리학을 기반으로 한 재미용 콘텐츠입니다</p>
          <p>실제 운세 예측이 아니며 참고용으로만 사용하세요</p>
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
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <MysticalLoader
              currentStep={0}
              totalSteps={6}
              stepName="분석 준비 중..."
            />
            <p className="text-sm text-white/40 mt-4">
              잠시만 기다려주세요
            </p>
          </div>
        </div>
      }
    >
      <SajuFortuneContent />
    </Suspense>
  );
}
