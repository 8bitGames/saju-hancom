"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { FortunePanel } from "@/components/saju/FortunePanel";

function TodayFortuneContent() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get("shareId");

  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError("사주 분석 결과를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    // Fetch saju result via API to get birth year
    fetch(`/api/saju/shared?id=${shareId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.result) {
          setBirthYear(data.result.birthData.year);
        } else {
          setError("사주 분석 결과를 불러올 수 없습니다.");
        }
      })
      .catch((err) => {
        console.error("Error fetching saju result:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-white/60">{error}</p>
          <Link href="/saju">
            <button className="px-6 py-3 rounded-xl bg-[#a855f7] text-white font-medium hover:bg-[#9333ea] transition-colors">
              사주 분석하러 가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="text-center space-y-2 pt-4">
        <p className="text-[#fbbf24] text-sm font-medium tracking-wider">
          今日運勢
        </p>
        <h1 className="text-2xl font-bold text-white">오늘의 운세</h1>
        <p className="text-white/60 text-base">
          오늘 하루의 기운을 미리 살펴보세요
        </p>
      </div>

      {/* Fortune Panel */}
      <FortunePanel
        shareId={shareId || undefined}
        birthYear={birthYear || new Date().getFullYear() - 30}
        isPremium={true}
        isLoadingShareId={isLoading}
      />

      {/* Disclaimer */}
      <div className="text-center text-sm text-white/40 space-y-1 pt-4">
        <p>본 운세는 전통 명리학을 기반으로 한 재미용 콘텐츠입니다</p>
        <p>실제 운세 예측이 아니며 참고용으로만 사용하세요</p>
      </div>
    </div>
  );
}

export default function TodayFortunePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TodayFortuneContent />
    </Suspense>
  );
}
