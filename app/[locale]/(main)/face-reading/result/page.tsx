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
  Sparkle,
  Check,
  Lightbulb,
  Clover,
  User,
} from "@phosphor-icons/react";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";

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

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-white";
  return "text-orange-400";
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-base">
          <span className="text-white/60">{label}</span>
          <span className={`font-bold ${getScoreColor(score)}`}>{score}점</span>
        </div>
      )}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ef4444] rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function FaceReadingResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("faceReadingResult");

    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResult(parsed);
      } catch {
        router.push("/face-reading");
        return;
      }
    } else {
      router.push("/face-reading");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#ef4444] flex items-center justify-center">
            <Camera className="w-10 h-10 text-white" weight="fill" />
          </div>
          <p className="text-base text-white/60">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

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

  const fortuneColors = {
    wealth: "#eab308",
    career: "#3b82f6",
    relationship: "#22c55e",
    health: "#a855f7",
    love: "#ec4899",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#ef4444] text-sm font-medium tracking-wider">
          觀相分析
        </p>
        <h1 className="text-2xl font-bold text-white">
          관상 분석 결과
        </h1>
        <TextGenerateEffect
          words="당신의 관상을 전문적으로 분석했습니다"
          className="text-base text-white/60"
          duration={0.3}
        />
      </div>

      {/* Overall Score Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
        <div className="w-36 h-36 mx-auto rounded-full bg-[#ef4444] flex items-center justify-center mb-4 shadow-lg shadow-[#ef4444]/30">
          <span className="text-6xl font-bold text-white">{result.overallScore}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ef4444]/20 text-[#ef4444] font-bold text-lg">
          <Star className="w-5 h-5" weight="fill" />
          {result.gradeText}
        </div>
        <div className="mt-4 max-w-xs mx-auto">
          <ScoreBar score={result.overallScore} label="" />
        </div>
      </div>

      {/* Face Shape */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">얼굴형 분석</h2>
        </div>

        <div className="space-y-3">
          <div className="inline-flex px-4 py-2 rounded-full bg-[#ef4444] text-white text-base font-medium">
            {result.faceShape.koreanName}
          </div>
          <p className="text-base text-white/80 leading-relaxed">
            {result.faceShape.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.faceShape.characteristics.map((char, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white/70"
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Analysis */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-5 border border-white/10">
        <div className="flex items-center gap-2">
          <ChartBar className="w-5 h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">부위별 분석</h2>
        </div>

        <div className="space-y-5">
          {Object.entries(result.features).map(([key, feature]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-white">
                  {feature.koreanName}
                </span>
                <span className={`text-base font-bold ${getScoreColor(feature.score)}`}>
                  {feature.score}점
                </span>
              </div>
              <ScoreBar score={feature.score} label="" />
              <p className="text-sm text-white/60">{feature.description}</p>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5">
                <Sparkle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" weight="fill" />
                <p className="text-sm text-white/80">{feature.fortune}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fortune Areas */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">운세 영역</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(result.fortuneAreas).map(([key, area]) => {
            const Icon = fortuneIcons[key as keyof typeof fortuneIcons];
            const label = fortuneLabels[key as keyof typeof fortuneLabels];
            const color = fortuneColors[key as keyof typeof fortuneColors];
            return (
              <div key={key} className="p-4 rounded-xl bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" weight="fill" style={{ color }} />
                    <span className="text-base font-medium text-white">{label}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color }}>{area.score}점</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${area.score}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-sm text-white/60">{area.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strengths */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-green-400" weight="fill" />
          <h2 className="text-lg font-semibold text-green-400">당신의 강점</h2>
        </div>
        <ul className="space-y-2">
          {result.strengths.map((strength, idx) => (
            <li key={idx} className="flex items-start gap-2 text-base text-white/80">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
              {strength}
            </li>
          ))}
        </ul>
      </section>

      {/* Advice */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" weight="fill" />
          <h2 className="text-lg font-semibold text-yellow-400">조언</h2>
        </div>
        <ul className="space-y-2">
          {result.advice.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-base text-white/80">
              <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" weight="bold" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Lucky Elements */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
        <div className="flex items-center gap-2">
          <Clover className="w-5 h-5 text-green-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">행운의 요소</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.luckyElements.map((element, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-full bg-[#ef4444] text-white text-base font-medium"
            >
              {element}
            </span>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Link href="/face-reading/detail-result" className="block">
          <button className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30">
            <Sparkle className="w-5 h-5" weight="fill" />
            전통 관상학 상세 분석 보기
          </button>
        </Link>
        <Link href="/face-reading" className="block">
          <button className="w-full h-14 rounded-xl bg-[#ef4444] text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#dc2626] transition-colors">
            <ArrowCounterClockwise className="w-5 h-5" />
            다시 분석하기
          </button>
        </Link>
        <Link href="/" className="block">
          <button className="w-full h-14 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 hover:text-white transition-colors">
            홈으로 돌아가기
          </button>
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-sm text-white/40 pt-2 pb-8">
        본 관상 분석은 전통 관상학을 기반으로 한 재미용 콘텐츠입니다.
      </p>
    </div>
  );
}
