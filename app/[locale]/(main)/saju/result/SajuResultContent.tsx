"use client";

import { Link } from "@/lib/i18n/navigation";
import { Sparkle, ArrowCounterClockwise } from "@/components/ui/icons";
import { calculateSaju, STEM_KOREAN, ELEMENT_KOREAN } from "@/lib/saju";
import { getLongitudeByCity } from "@/lib/saju/solar-time";
import { FourPillarsDisplay } from "@/components/saju/pillar-display";
import { ElementChart } from "@/components/saju/element-chart";
import { TenGodDisplay } from "@/components/saju/ten-god-display";
import { StarsDisplay } from "@/components/saju/stars-display";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { Spotlight } from "@/components/aceternity/spotlight";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";
import type { Gender } from "@/lib/saju/types";

interface SearchParams {
  year?: string;
  month?: string;
  day?: string;
  hour?: string;
  minute?: string;
  gender?: string;
  isLunar?: string;
  city?: string;
}

export function SajuResultContent({ searchParams }: { searchParams: SearchParams }) {
  const year = parseInt(searchParams.year || "1990");
  const month = parseInt(searchParams.month || "1");
  const day = parseInt(searchParams.day || "1");
  const hour = parseInt(searchParams.hour || "12");
  const minute = parseInt(searchParams.minute || "0");
  const gender = (searchParams.gender as Gender) || "male";
  const isLunar = searchParams.isLunar === "true";
  const city = searchParams.city || "서울";

  // Get longitude for the city
  const longitude = getLongitudeByCity(city);

  // Calculate saju
  const result = calculateSaju({
    year,
    month,
    day,
    hour,
    minute,
    gender,
    isLunar,
    longitude,
  });

  // Build query string for fortune link
  const queryString = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
    day: day.toString(),
    hour: hour.toString(),
    minute: minute.toString(),
    gender,
    isLunar: isLunar.toString(),
    city,
  }).toString();

  return (
    <div className="relative min-h-screen pb-4 sm:pb-6">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="var(--accent)"
      />

      <div className="space-y-4 sm:space-y-6 animate-fade-in relative z-10">
        {/* Header with Premium Effects */}
        <div className="relative text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
          {/* Sparkles Background */}
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

          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-lg sm:rounded-xl p-3 sm:p-4"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <Sparkle className="w-6 h-6 sm:w-7 sm:h-7 text-white" weight="fill" />
              </div>
            </BackgroundGradient>
          </div>

          <div className="relative z-10 px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              사주 분석 결과
            </h1>
            <TextGenerateEffect
              words={`${result.meta.solarDate} (${gender === "male" ? "남" : "여"})`}
              className="text-sm sm:text-base text-[var(--text-secondary)]"
              duration={0.2}
            />
          </div>
        </div>

        {/* Four Pillars */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="font-semibold text-[var(--text-primary)] text-base sm:text-lg">사주팔자</h2>
          <FourPillarsDisplay pillars={result.pillars} />
          <div className="text-center pt-1.5 sm:pt-2">
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
              진태양시 보정: {result.meta.trueSolarTime} (
              {result.meta.offsetMinutes > 0 ? "+" : ""}
              {result.meta.offsetMinutes}분)
            </p>
          </div>
        </section>

        {/* Day Master Info */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="font-semibold text-[var(--text-primary)] text-base sm:text-lg">일간 (일주)</h2>
          <div className="flex items-center gap-3 sm:gap-4">
            <BackgroundGradient
              className="rounded-lg sm:rounded-xl p-2.5 sm:p-3"
              containerClassName="w-fit"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
                {result.dayMaster}
              </div>
            </BackgroundGradient>
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)] text-base sm:text-lg">
                {STEM_KOREAN[result.dayMaster]} ({ELEMENT_KOREAN[result.dayMasterElement]})
              </p>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                {result.dayMasterYinYang === "yang" ? "양" : "음"}의 기운
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-0.5 sm:mt-1">
                {result.dayMasterDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Five Elements */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 backdrop-blur-xl border border-[var(--border)]/50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)] text-base sm:text-lg">오행 분석</h2>
            <span className="text-xs sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
              {result.elementAnalysis.balance}
            </span>
          </div>
          <ElementChart
            scores={result.elementAnalysis.scores}
            dominant={result.elementAnalysis.dominant}
            lacking={result.elementAnalysis.lacking}
          />
          {result.elementAnalysis.yongShin && (
            <div className="pt-2.5 sm:pt-3 border-t border-[var(--border)]/50">
              <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">추천 용신</p>
              <p className="text-sm sm:text-base font-medium text-[var(--accent)]">
                {result.elementAnalysis.yongShin}
              </p>
            </div>
          )}
        </section>

        {/* Ten Gods */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="font-semibold text-[var(--text-primary)] text-base sm:text-lg">십성 분석</h2>
          <TenGodDisplay summary={result.tenGodSummary} />
        </section>

        {/* Stars */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="font-semibold text-[var(--text-primary)] text-base sm:text-lg">
            신살 ({result.stars.length})
          </h2>
          <StarsDisplay stars={result.stars} />
        </section>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Link href="/saju" className="flex-1">
            <div className="h-12 sm:h-14 rounded-lg sm:rounded-xl glass-card border border-[var(--border)]/50 flex items-center justify-center gap-1.5 sm:gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <ArrowCounterClockwise className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">다시 분석</span>
            </div>
          </Link>
          <Link href={`/saju/fortune?${queryString}`} className="flex-1">
            <HoverBorderGradient
              containerClassName="w-full rounded-lg sm:rounded-xl"
              className="w-full h-12 sm:h-14 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl"
              as="div"
            >
              <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" weight="fill" />
              상세 운세 보기
            </HoverBorderGradient>
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs sm:text-sm text-[var(--text-tertiary)] pt-2 pb-6 sm:pb-8">
          이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.
        </p>
      </div>
    </div>
  );
}
