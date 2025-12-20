"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ArrowCounterClockwise,
  Star,
  ChatCircle,
  Handshake,
  Heart,
  ChartBar,
  Sparkle,
} from "@/components/ui/icons";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";
import { Spotlight } from "@/components/aceternity/spotlight";
import { calculateSaju, toPromptData } from "@/lib/saju";
import { getLongitudeByCity } from "@/lib/saju/solar-time";
import type { Gender, SajuPromptData } from "@/lib/saju/types";

interface CompatibilityResult {
  overallScore: number;
  grade: string;
  gradeText: string;
  summary: string;
  compatibility: {
    communication: { score: number; description: string };
    collaboration: { score: number; description: string };
    trust: { score: number; description: string };
    growth: { score: number; description: string };
    emotionalConnection: { score: number; description: string };
  };
  elementAnalysis: {
    person1Dominant: string;
    person2Dominant: string;
    interaction: string;
    balanceAdvice: string;
  };
  strengths: string[];
  challenges: string[];
  relationshipAdvice: {
    doList: string[];
    dontList: string[];
    communicationTips: string[];
  };
  timing: {
    goodPeriods: string[];
    cautionPeriods: string[];
  };
  luckyElements: {
    colors: string[];
    activities: string[];
    places: string[];
  };
}

const gradeColors: Record<string, string> = {
  excellent: "from-yellow-400 to-orange-500",
  good: "from-green-400 to-emerald-500",
  normal: "from-blue-400 to-cyan-500",
  caution: "from-orange-400 to-red-400",
  challenging: "from-gray-400 to-gray-500",
};

function CompatibilityAIResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPerson2Name] = useState("");

  useEffect(() => {
    const fetchCompatibility = async () => {
      // URL 파라미터에서 두 사람 정보 가져오기
      const p1Name = searchParams.get("p1Name") || "본인";
      const p1Year = parseInt(searchParams.get("p1Year") || "0");
      const p1Month = parseInt(searchParams.get("p1Month") || "0");
      const p1Day = parseInt(searchParams.get("p1Day") || "0");
      const p1Hour = parseInt(searchParams.get("p1Hour") || "12");
      const p1Minute = parseInt(searchParams.get("p1Minute") || "0");
      const p1Gender = (searchParams.get("p1Gender") as Gender) || "male";
      const p1IsLunar = searchParams.get("p1IsLunar") === "true";
      const p1City = searchParams.get("p1City") || "서울";

      const p2Name = searchParams.get("p2Name") || "상대방";
      const p2Year = parseInt(searchParams.get("p2Year") || "0");
      const p2Month = parseInt(searchParams.get("p2Month") || "0");
      const p2Day = parseInt(searchParams.get("p2Day") || "0");
      const p2Hour = parseInt(searchParams.get("p2Hour") || "12");
      const p2Minute = parseInt(searchParams.get("p2Minute") || "0");
      const p2Gender = (searchParams.get("p2Gender") as Gender) || "male";
      const p2IsLunar = searchParams.get("p2IsLunar") === "true";
      const p2City = searchParams.get("p2City") || "서울";

      const relationType = searchParams.get("relationType");

      setPerson1Name(p1Name);
      setPerson2Name(p2Name);

      if (!p1Year || !p1Month || !p1Day || !p2Year || !p2Month || !p2Day) {
        router.push("/compatibility");
        return;
      }

      try {
        // 두 사람의 사주 계산
        const p1Longitude = getLongitudeByCity(p1City);
        const p1SajuResult = calculateSaju({
          year: p1Year,
          month: p1Month,
          day: p1Day,
          hour: p1Hour,
          minute: p1Minute,
          gender: p1Gender,
          isLunar: p1IsLunar,
          longitude: p1Longitude,
        });

        const p2Longitude = getLongitudeByCity(p2City);
        const p2SajuResult = calculateSaju({
          year: p2Year,
          month: p2Month,
          day: p2Day,
          hour: p2Hour,
          minute: p2Minute,
          gender: p2Gender,
          isLunar: p2IsLunar,
          longitude: p2Longitude,
        });

        // LLM에 보낼 데이터 준비
        const person1Data: SajuPromptData & { name: string; gender: string } = {
          ...toPromptData(p1SajuResult),
          name: p1Name,
          gender: p1Gender,
        };

        const person2Data: SajuPromptData & { name: string; gender: string } = {
          ...toPromptData(p2SajuResult),
          name: p2Name,
          gender: p2Gender,
        };

        // API 호출
        const response = await fetch("/api/compatibility", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            person1: person1Data,
            person2: person2Data,
            relationType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "궁합 분석에 실패했습니다.");
        }

        const compatibilityResult = await response.json();
        setResult(compatibilityResult);
      } catch (err) {
        console.error("Compatibility fetch error:", err);
        setError(err instanceof Error ? err.message : "궁합 분석 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompatibility();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--element-water)] to-[var(--accent)] flex items-center justify-center animate-pulse">
            <Users className="w-10 h-10 text-white" weight="fill" />
          </div>
          <p className="text-lg text-[var(--text-secondary)]">궁합을 분석하고 있습니다...</p>
          <p className="text-sm text-[var(--text-tertiary)]">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-[var(--element-fire)]">{error}</p>
          <Link href="/compatibility">
            <button className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium">
              다시 시도하기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="relative min-h-screen pb-8">
      <Spotlight
        className="-top-40 -right-10 md:right-40 md:-top-20"
        fill="var(--element-water)"
      />

      <div className="space-y-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="relative text-center space-y-4 py-8">
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="compatibility-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={40}
              particleColor="var(--element-water)"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-2xl p-5"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-20 h-20 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{result.overallScore}</span>
              </div>
            </BackgroundGradient>
          </div>

          <div className="relative z-10 space-y-2">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${gradeColors[result.grade] || gradeColors.normal} text-white font-bold text-lg`}>
              <Star className="w-6 h-6" weight="fill" />
              {result.gradeText}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {person1Name}님 ❤️ {person2Name}님
            </h1>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              {result.summary}
            </p>
          </div>
        </div>

        {/* Compatibility Scores */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-[var(--accent)]" weight="fill" />
            궁합 상세 분석
          </h2>

          <div className="space-y-5">
            {/* Communication */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChatCircle className="w-5 h-5 text-[var(--element-wood)]" weight="fill" />
                  <span className="font-medium text-[var(--text-primary)]">소통</span>
                </div>
                <span className="text-lg font-bold text-[var(--accent)]">{result.compatibility.communication.score}점</span>
              </div>
              <div className="h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--element-wood)] to-[var(--element-fire)] rounded-full" style={{ width: `${result.compatibility.communication.score}%` }} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{result.compatibility.communication.description}</p>
            </div>

            {/* Collaboration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-[var(--element-fire)]" weight="fill" />
                  <span className="font-medium text-[var(--text-primary)]">협업</span>
                </div>
                <span className="text-lg font-bold text-[var(--accent)]">{result.compatibility.collaboration.score}점</span>
              </div>
              <div className="h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--element-fire)] to-[var(--accent)] rounded-full" style={{ width: `${result.compatibility.collaboration.score}%` }} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{result.compatibility.collaboration.description}</p>
            </div>

            {/* Trust */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[var(--element-earth)]" weight="fill" />
                  <span className="font-medium text-[var(--text-primary)]">신뢰</span>
                </div>
                <span className="text-lg font-bold text-[var(--accent)]">{result.compatibility.trust.score}점</span>
              </div>
              <div className="h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--element-earth)] to-[var(--element-metal)] rounded-full" style={{ width: `${result.compatibility.trust.score}%` }} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{result.compatibility.trust.description}</p>
            </div>

            {/* Growth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-[var(--element-metal)]" weight="fill" />
                  <span className="font-medium text-[var(--text-primary)]">성장</span>
                </div>
                <span className="text-lg font-bold text-[var(--accent)]">{result.compatibility.growth.score}점</span>
              </div>
              <div className="h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--element-metal)] to-[var(--element-water)] rounded-full" style={{ width: `${result.compatibility.growth.score}%` }} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{result.compatibility.growth.description}</p>
            </div>

            {/* Emotional Connection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--element-water)]" weight="fill" />
                  <span className="font-medium text-[var(--text-primary)]">정서적 교감</span>
                </div>
                <span className="text-lg font-bold text-[var(--accent)]">{result.compatibility.emotionalConnection.score}점</span>
              </div>
              <div className="h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--element-water)] to-[var(--accent)] rounded-full" style={{ width: `${result.compatibility.emotionalConnection.score}%` }} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{result.compatibility.emotionalConnection.description}</p>
            </div>
          </div>
        </div>

        {/* Element Analysis */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">🌿 오행 분석</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-[var(--background-elevated)]">
                <p className="text-sm text-[var(--text-tertiary)]">{person1Name}님의 주요 오행</p>
                <p className="text-lg font-bold text-[var(--accent)]">{result.elementAnalysis.person1Dominant}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--background-elevated)]">
                <p className="text-sm text-[var(--text-tertiary)]">{person2Name}님의 주요 오행</p>
                <p className="text-lg font-bold text-[var(--accent)]">{result.elementAnalysis.person2Dominant}</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)]">{result.elementAnalysis.interaction}</p>
            <p className="text-sm text-[var(--text-tertiary)] bg-[var(--accent)]/10 p-3 rounded-lg">
              💡 {result.elementAnalysis.balanceAdvice}
            </p>
          </div>
        </div>

        {/* Strengths & Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
            <h2 className="text-lg font-bold text-[var(--element-wood)] mb-3">✨ 관계의 강점</h2>
            <ul className="space-y-2">
              {result.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--element-wood)]">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
            <h2 className="text-lg font-bold text-[var(--element-fire)] mb-3">⚡ 도전 과제</h2>
            <ul className="space-y-2">
              {result.challenges.map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--element-fire)]">!</span>
                  {challenge}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Relationship Advice */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">💡 관계 조언</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--element-wood)] mb-2">✅ 해야 할 것</p>
              <ul className="space-y-1">
                {result.relationshipAdvice.doList.map((item, idx) => (
                  <li key={idx} className="text-sm text-[var(--text-secondary)]">• {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--element-fire)] mb-2">❌ 피해야 할 것</p>
              <ul className="space-y-1">
                {result.relationshipAdvice.dontList.map((item, idx) => (
                  <li key={idx} className="text-sm text-[var(--text-secondary)]">• {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--accent)] mb-2">💬 소통 팁</p>
              <ul className="space-y-1">
                {result.relationshipAdvice.communicationTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-[var(--text-secondary)]">• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">📅 시기 분석</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--element-wood)] mb-2">🌟 좋은 시기</p>
              {result.timing.goodPeriods.map((period, idx) => (
                <p key={idx} className="text-sm text-[var(--text-secondary)]">• {period}</p>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--element-fire)] mb-2">⚠️ 주의 시기</p>
              {result.timing.cautionPeriods.map((period, idx) => (
                <p key={idx} className="text-sm text-[var(--text-secondary)]">• {period}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Lucky Elements */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">🍀 함께할 때 행운의 요소</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-2">색상</p>
              <div className="flex flex-wrap gap-2">
                {result.luckyElements.colors.map((color, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium">
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-2">함께하면 좋은 활동</p>
              <div className="flex flex-wrap gap-2">
                {result.luckyElements.activities.map((activity, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-[var(--element-wood)]/20 text-[var(--element-wood)] text-sm">
                    {activity}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-2">추천 장소</p>
              <div className="flex flex-wrap gap-2">
                {result.luckyElements.places.map((place, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-[var(--element-water)]/20 text-[var(--element-water)] text-sm">
                    {place}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <Link href={`/compatibility/result?${searchParams.toString()}`} className="block">
            <HoverBorderGradient
              containerClassName="w-full rounded-xl"
              className="w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--element-water)] to-[var(--accent)] text-white font-bold text-lg rounded-xl"
              as="div"
            >
              <ChartBar className="w-5 h-5" weight="fill" />
              기본 궁합 분석 보기
            </HoverBorderGradient>
          </Link>

          <Link href="/compatibility" className="block">
            <button className="w-full h-14 rounded-xl bg-[var(--background-elevated)] text-[var(--text-secondary)] font-medium hover:bg-[var(--background-elevated)]/80 transition-colors flex items-center justify-center gap-2">
              <ArrowCounterClockwise className="w-5 h-5" />
              다시 분석하기
            </button>
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-sm text-[var(--text-tertiary)] space-y-1 pt-4 pb-8">
          <p>본 궁합 분석은 전통 명리학을 기반으로 한 재미용 콘텐츠입니다</p>
          <p>실제 관계 예측이 아니며 참고용으로만 사용하세요</p>
        </div>
      </div>
    </div>
  );
}

export default function CompatibilityAIResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--element-water)] to-[var(--accent)] flex items-center justify-center animate-pulse">
              <Users className="w-10 h-10 text-white" weight="fill" />
            </div>
            <p className="text-lg text-[var(--text-secondary)]">궁합을 분석하고 있습니다...</p>
            <p className="text-sm text-[var(--text-tertiary)]">잠시만 기다려주세요</p>
          </div>
        </div>
      }
    >
      <CompatibilityAIResultContent />
    </Suspense>
  );
}
