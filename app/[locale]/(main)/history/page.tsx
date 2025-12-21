"use client";

import { useTranslations } from "next-intl";
import { ClockCounterClockwise, Sparkle, UsersThree, Eye } from "@phosphor-icons/react";
import { Link } from "@/lib/i18n/navigation";

export default function HistoryPage() {
  const t = useTranslations("history");
  const tNav = useTranslations("nav");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#22c55e] text-sm font-medium tracking-wider">
          分析記錄
        </p>
        <h1 className="text-2xl font-bold text-white">
          {t("title")}
        </h1>
      </div>

      {/* Empty State */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-6">
          <ClockCounterClockwise className="w-10 h-10 text-white/30" />
        </div>
        <p className="text-white/60 mb-8">
          {t("empty")}
        </p>

        {/* Quick Links */}
        <div className="space-y-4">
          <p className="text-xs text-white/40">
            분석을 시작해보세요
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/saju"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#a855f7] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkle className="w-5 h-5" weight="fill" />
              {tNav("saju")}
            </Link>
            <Link
              href="/compatibility"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#3b82f6] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <UsersThree className="w-5 h-5" weight="fill" />
              {tNav("compatibility")}
            </Link>
            <Link
              href="/face-reading"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#ef4444] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Eye className="w-5 h-5" weight="fill" />
              {tNav("faceReading")}
            </Link>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <p className="text-center text-xs text-white/40 px-4">
        분석 기록은 브라우저에 저장됩니다
      </p>
    </div>
  );
}
