"use client";

import { useTranslations } from "next-intl";
import { ClockCounterClockwise, Sparkle, Handshake, Camera } from "@/components/ui/icons";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { Spotlight } from "@/components/aceternity/spotlight";
import { Link } from "@/lib/i18n/navigation";

export default function HistoryPage() {
  const t = useTranslations("history");
  const tNav = useTranslations("nav");

  return (
    <div className="relative min-h-screen">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="var(--accent)"
      />

      <div className="space-y-6 sm:space-y-8 animate-fade-in relative z-10">
        {/* Header with Premium Effects */}
        <div className="relative text-center space-y-3 sm:space-y-4 py-6 sm:py-8">
          {/* Sparkles Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="history-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={40}
              particleColor="var(--accent)"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                <ClockCounterClockwise className="w-8 h-8 sm:w-10 sm:h-10 text-white" weight="fill" />
              </div>
            </BackgroundGradient>
          </div>

          <div className="relative z-10 space-y-1.5 sm:space-y-2 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {t("title")}
            </h1>
            <TextGenerateEffect
              words={t("empty")}
              className="text-base sm:text-lg text-[var(--text-secondary)]"
              duration={0.3}
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-[var(--border)]/50 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-[var(--background-elevated)] flex items-center justify-center mb-4 sm:mb-6">
            <ClockCounterClockwise className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--text-tertiary)]" />
          </div>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6 sm:mb-8">
            {t("empty")}
          </p>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
              분석을 시작해보세요
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Link
                href="/saju"
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <Sparkle className="w-5 h-5 shrink-0" weight="fill" />
                {tNav("saju")}
              </Link>
              <Link
                href="/compatibility"
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-[var(--element-water)] to-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <Handshake className="w-5 h-5 shrink-0" weight="fill" />
                {tNav("compatibility")}
              </Link>
              <Link
                href="/face-reading"
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-[var(--element-metal)] to-[var(--element-water)] text-white font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <Camera className="w-5 h-5 shrink-0" />
                {tNav("faceReading")}
              </Link>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center text-xs sm:text-sm text-[var(--text-tertiary)] space-y-1 sm:space-y-2 pt-4 sm:pt-6 pb-6 sm:pb-8 px-4">
          <p>분석 기록은 브라우저에 저장됩니다</p>
          <p>다른 기기에서는 조회되지 않습니다</p>
        </div>
      </div>
    </div>
  );
}
