"use client";

import { Link } from "@/lib/i18n/navigation";
import { FortunePanel } from "@/components/saju/FortunePanel";

interface TodayFortuneContentProps {
  shareId?: string;
  birthYear?: number;
  isPremium?: boolean;
  error?: string;
}

export function TodayFortuneContent({
  shareId,
  birthYear,
  isPremium = false,
  error,
}: TodayFortuneContentProps) {
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-white/60">{error}</p>
          <Link href="/saju">
            <button className="px-6 py-3 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary-hover transition-colors">
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
        <p className="text-accent-gold text-sm font-medium tracking-wider">
          今日運勢
        </p>
        <h1 className="text-2xl font-bold text-white">오늘의 운세</h1>
        <p className="text-white/60 text-base">
          오늘 하루의 기운을 미리 살펴보세요
        </p>
      </div>

      {/* Fortune Panel */}
      <FortunePanel
        shareId={shareId}
        birthYear={birthYear || new Date().getFullYear() - 30}
        isPremium={isPremium}
        isLoadingShareId={false}
      />

      {/* Disclaimer */}
      <div className="text-center text-sm text-white/40 space-y-1 pt-4">
        <p>본 운세는 전통 명리학을 기반으로 한 재미용 콘텐츠입니다</p>
        <p>실제 운세 예측이 아니며 참고용으로만 사용하세요</p>
      </div>
    </div>
  );
}
