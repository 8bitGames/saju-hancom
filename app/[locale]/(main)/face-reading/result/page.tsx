"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/lib/i18n/navigation";
import {
  Camera,
  Star,
  ArrowCounterClockwise,
  Heart,
  Briefcase,
  Users,
  Shield,
  Lightning,
  ChartBar,
} from "@/components/ui/icons";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";
import { Spotlight } from "@/components/aceternity/spotlight";

interface FaceReadingResult {
  overallScore: number;
  overallGrade: string;
  gradeText: string;
  faceShape: {
    type: string;
    koreanName: string;
    description: string;
    characteristics: string[];
  };
  features: {
    forehead: { koreanName: string; score: number; description: string; fortune: string };
    eyes: { koreanName: string; score: number; description: string; fortune: string };
    nose: { koreanName: string; score: number; description: string; fortune: string };
    mouth: { koreanName: string; score: number; description: string; fortune: string };
    ears: { koreanName: string; score: number; description: string; fortune: string };
  };
  fortuneAreas: {
    wealth: { score: number; description: string };
    career: { score: number; description: string };
    relationship: { score: number; description: string };
    health: { score: number; description: string };
    love: { score: number; description: string };
  };
  strengths: string[];
  advice: string[];
  luckyElements: string[];
}

export default function FaceReadingResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // sessionStorage에서 결과 가져오기
    const storedResult = sessionStorage.getItem("faceReadingResult");

    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResult(parsed);
      } catch {
        // 파싱 실패시 폼으로 리다이렉트
        router.push("/face-reading");
        return;
      }
    } else {
      // 결과가 없으면 폼으로 리다이렉트
      router.push("/face-reading");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--element-metal)] to-[var(--element-water)] flex items-center justify-center animate-pulse">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <p className="text-base sm:text-lg text-[var(--text-secondary)]">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const gradeColors: Record<string, string> = {
    excellent: "from-yellow-400 to-orange-500",
    good: "from-green-400 to-emerald-500",
    normal: "from-blue-400 to-cyan-500",
    caution: "from-orange-400 to-red-400",
    challenging: "from-gray-400 to-gray-500",
  };

  const fortuneIcons = {
    wealth: Lightning,
    career: Briefcase,
    relationship: Users,
    health: Shield,
    love: Heart,
  };

  const fortuneLabels = {
    wealth: "재물운",
    career: "직업운",
    relationship: "대인관계",
    health: "건강운",
    love: "애정운",
  };

  return (
    <div className="relative min-h-screen pb-6 sm:pb-8">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="var(--element-metal)"
      />

      <div className="space-y-4 sm:space-y-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="relative text-center space-y-3 sm:space-y-4 py-6 sm:py-8">
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="result-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={40}
              particleColor="var(--element-metal)"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </BackgroundGradient>
          </div>

          <div className="relative z-10 space-y-1.5 sm:space-y-2 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              관상 분석 결과
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)]">
              당신의 관상을 전문적으로 분석했습니다
            </p>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r ${gradeColors[result.overallGrade] || gradeColors.normal} text-white font-bold text-base sm:text-lg`}>
              <Star className="w-5 h-5 sm:w-6 sm:h-6" weight="fill" />
              {result.gradeText}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)]">
                {result.overallScore}점
              </p>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">종합 관상 점수</p>
            </div>

            {/* Score Bar */}
            <div className="max-w-xs mx-auto">
              <div className="h-2.5 sm:h-3 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradeColors[result.overallGrade] || gradeColors.normal} rounded-full transition-all duration-1000`}
                  style={{ width: `${result.overallScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Face Shape */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent)]" />
            </div>
            얼굴형 분석
          </h2>

          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[var(--element-metal)] to-[var(--element-water)] text-white text-sm sm:text-base font-medium">
                {result.faceShape.koreanName}
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {result.faceShape.description}
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1.5 sm:pt-2">
              {result.faceShape.characteristics.map((char, idx) => (
                <span
                  key={idx}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)] text-xs sm:text-sm text-[var(--text-secondary)]"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Analysis */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--element-fire)]/20 flex items-center justify-center">
              <ChartBar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--element-fire)]" />
            </div>
            부위별 분석
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {Object.entries(result.features).map(([key, feature]) => (
              <div key={key} className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-[var(--text-primary)]">
                    {feature.koreanName}
                  </span>
                  <span className="text-sm sm:text-base text-[var(--accent)] font-bold">{feature.score}점</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] rounded-full transition-all duration-700"
                    style={{ width: `${feature.score}%` }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">{feature.description}</p>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] bg-[var(--background-elevated)] p-2.5 sm:p-3 rounded-lg">
                  💫 {feature.fortune}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Fortune Areas */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--element-wood)]/20 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--element-wood)]" weight="fill" />
            </div>
            운세 영역
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {Object.entries(result.fortuneAreas).map(([key, area]) => {
              const Icon = fortuneIcons[key as keyof typeof fortuneIcons];
              const label = fortuneLabels[key as keyof typeof fortuneLabels];
              return (
                <div key={key} className="bg-[var(--background-elevated)] rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent)]" weight="fill" />
                      </div>
                      <span className="text-sm sm:text-base font-medium text-[var(--text-primary)]">{label}</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-[var(--accent)]">{area.score}점</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-[var(--background)]/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--element-wood)] to-[var(--element-fire)] rounded-full transition-all duration-700"
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{area.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">✨ 당신의 강점</h2>
          <ul className="space-y-1.5 sm:space-y-2">
            {result.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="text-[var(--accent)]">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Advice */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">💡 조언</h2>
          <ul className="space-y-1.5 sm:space-y-2">
            {result.advice.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-sm sm:text-base text-[var(--text-secondary)]">
                <span className="text-[var(--element-fire)]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Lucky Elements */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">🍀 행운의 요소</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {result.luckyElements.map((element, idx) => (
              <span
                key={idx}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[var(--element-wood)] to-[var(--element-water)] text-white text-sm sm:text-base font-medium"
              >
                {element}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
          <Link href="/face-reading" className="block">
            <HoverBorderGradient
              containerClassName="w-full rounded-lg sm:rounded-xl"
              className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[var(--element-metal)] to-[var(--element-water)] text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-xl"
              as="div"
            >
              <ArrowCounterClockwise className="w-4 h-4 sm:w-5 sm:h-5" />
              다시 분석하기
            </HoverBorderGradient>
          </Link>

          <Link href="/" className="block">
            <button className="w-full h-12 sm:h-14 rounded-lg sm:rounded-xl bg-[var(--background-elevated)] text-sm sm:text-base text-[var(--text-secondary)] font-medium hover:bg-[var(--background-elevated)]/80 transition-colors">
              홈으로 돌아가기
            </button>
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs sm:text-sm text-[var(--text-tertiary)] space-y-0.5 sm:space-y-1 pt-3 sm:pt-4 pb-6 sm:pb-8">
          <p>본 관상 분석은 전통 관상학을 기반으로 한 재미용 콘텐츠입니다</p>
          <p>실제 운세 예측이 아니며 참고용으로만 사용하세요</p>
        </div>
      </div>
    </div>
  );
}
