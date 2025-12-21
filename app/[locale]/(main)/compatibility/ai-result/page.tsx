"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/lib/i18n/navigation";
import {
  UsersThree,
  ArrowCounterClockwise,
  Star,
  ChatCircle,
  Handshake,
  Heart,
  ChartBar,
  Sparkle,
  Check,
  Warning,
  Lightbulb,
  CalendarBlank,
  Clover,
  ArrowRight,
} from "@phosphor-icons/react";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
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

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-white";
  return "text-orange-400";
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-base">
        <span className="text-white/60">{label}</span>
        <span className={`font-bold ${getScoreColor(score)}`}>{score}점</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

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
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#3b82f6] flex items-center justify-center animate-pulse">
            <UsersThree className="w-10 h-10 text-white" weight="fill" />
          </div>
          <p className="text-lg text-white">AI가 궁합을 분석하고 있습니다...</p>
          <p className="text-base text-white/60">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center">
            <Warning className="w-10 h-10 text-red-400" weight="bold" />
          </div>
          <p className="text-lg text-red-400">{error}</p>
          <Link href="/compatibility">
            <button className="px-6 py-3 rounded-xl bg-[#3b82f6] text-white text-base font-medium hover:bg-[#2563eb] transition-colors">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#3b82f6] text-sm font-medium tracking-wider">
          AI宮合分析
        </p>
        <h1 className="text-2xl font-bold text-white">
          AI 궁합 분석 결과
        </h1>
        <TextGenerateEffect
          words={`${person1Name}님과 ${person2Name}님의 상세 궁합 분석`}
          className="text-base text-white/60"
          duration={0.3}
        />
      </div>

      {/* Score Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-[#3b82f6] flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">{result.overallScore}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] font-bold text-lg mb-3">
          <Star className="w-5 h-5" weight="fill" />
          {result.gradeText}
        </div>
        <p className="text-base text-white/80 max-w-md mx-auto">
          {result.summary}
        </p>
      </div>

      {/* Compatibility Scores */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-5 border border-white/10">
        <div className="flex items-center gap-2">
          <ChartBar className="w-5 h-5 text-[#3b82f6]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">궁합 상세 분석</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ChatCircle className="w-5 h-5 text-green-400" weight="fill" />
              <span className="text-base font-medium text-white">소통</span>
            </div>
            <ScoreBar score={result.compatibility.communication.score} label="" />
            <p className="text-sm text-white/60">
              {result.compatibility.communication.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-orange-400" weight="fill" />
              <span className="text-base font-medium text-white">협업</span>
            </div>
            <ScoreBar score={result.compatibility.collaboration.score} label="" />
            <p className="text-sm text-white/60">
              {result.compatibility.collaboration.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" weight="fill" />
              <span className="text-base font-medium text-white">신뢰</span>
            </div>
            <ScoreBar score={result.compatibility.trust.score} label="" />
            <p className="text-sm text-white/60">
              {result.compatibility.trust.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-purple-400" weight="fill" />
              <span className="text-base font-medium text-white">성장</span>
            </div>
            <ScoreBar score={result.compatibility.growth.score} label="" />
            <p className="text-sm text-white/60">
              {result.compatibility.growth.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UsersThree className="w-5 h-5 text-blue-400" weight="fill" />
              <span className="text-base font-medium text-white">정서적 교감</span>
            </div>
            <ScoreBar score={result.compatibility.emotionalConnection.score} label="" />
            <p className="text-sm text-white/60">
              {result.compatibility.emotionalConnection.description}
            </p>
          </div>
        </div>
      </section>

      {/* Element Analysis */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <h2 className="text-lg font-semibold text-white">오행 분석</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-white/40">{person1Name}님의 주요 오행</p>
            <p className="text-lg font-bold text-[#3b82f6]">{result.elementAnalysis.person1Dominant}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-white/40">{person2Name}님의 주요 오행</p>
            <p className="text-lg font-bold text-[#3b82f6]">{result.elementAnalysis.person2Dominant}</p>
          </div>
        </div>
        <p className="text-base text-white/80">{result.elementAnalysis.interaction}</p>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#3b82f6]/10">
          <Lightbulb className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" weight="fill" />
          <p className="text-sm text-white/80">{result.elementAnalysis.balanceAdvice}</p>
        </div>
      </section>

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 gap-4">
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
          <h2 className="text-lg font-semibold text-green-400">관계의 강점</h2>
          <ul className="space-y-2">
            {result.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
                {strength}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
          <h2 className="text-lg font-semibold text-orange-400">도전 과제</h2>
          <ul className="space-y-2">
            {result.challenges.map((challenge, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                <Warning className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" weight="bold" />
                {challenge}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Relationship Advice */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <h2 className="text-lg font-semibold text-white">관계 조언</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
              <Check className="w-4 h-4" weight="bold" />
              해야 할 것
            </p>
            <ul className="space-y-1">
              {result.relationshipAdvice.doList.map((item, idx) => (
                <li key={idx} className="text-base text-white/80 pl-6">• {item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
              <Warning className="w-4 h-4" weight="bold" />
              피해야 할 것
            </p>
            <ul className="space-y-1">
              {result.relationshipAdvice.dontList.map((item, idx) => (
                <li key={idx} className="text-base text-white/80 pl-6">• {item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-[#3b82f6] mb-2 flex items-center gap-2">
              <ChatCircle className="w-4 h-4" weight="fill" />
              소통 팁
            </p>
            <ul className="space-y-1">
              {result.relationshipAdvice.communicationTips.map((tip, idx) => (
                <li key={idx} className="text-base text-white/80 pl-6">• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Timing */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <CalendarBlank className="w-5 h-5 text-[#3b82f6]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">시기 분석</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4" weight="fill" />
              좋은 시기
            </p>
            {result.timing.goodPeriods.map((period, idx) => (
              <p key={idx} className="text-base text-white/80">• {period}</p>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
              <Warning className="w-4 h-4" weight="bold" />
              주의 시기
            </p>
            {result.timing.cautionPeriods.map((period, idx) => (
              <p key={idx} className="text-base text-white/80">• {period}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Lucky Elements */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Clover className="w-5 h-5 text-green-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">함께할 때 행운의 요소</h2>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-white/40 mb-2">색상</p>
            <div className="flex flex-wrap gap-2">
              {result.luckyElements.colors.map((color, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-medium">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2">함께하면 좋은 활동</p>
            <div className="flex flex-wrap gap-2">
              {result.luckyElements.activities.map((activity, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                  {activity}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2">추천 장소</p>
            <div className="flex flex-wrap gap-2">
              {result.luckyElements.places.map((place, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                  {place}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Link href={`/compatibility/detail-result?${searchParams.toString()}`} className="block">
          <button className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30">
            <Sparkle className="w-5 h-5" weight="fill" />
            전통 명리학 상세 분석 보기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </button>
        </Link>

        <Link href={`/compatibility/result?${searchParams.toString()}`} className="block">
          <button className="w-full h-14 rounded-xl bg-[#3b82f6] text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#2563eb] transition-colors">
            <ChartBar className="w-5 h-5" weight="fill" />
            기본 궁합 분석 보기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </button>
        </Link>

        <Link href="/compatibility" className="block">
          <button className="w-full h-14 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ArrowCounterClockwise className="w-5 h-5" />
            다시 분석하기
          </button>
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-sm text-white/40 pt-2 pb-8">
        이 분석은 전통 명리학과 AI를 기반으로 한 참고용 정보입니다.
      </p>
    </div>
  );
}

export default function CompatibilityAIResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#3b82f6] flex items-center justify-center animate-pulse">
              <UsersThree className="w-10 h-10 text-white" weight="fill" />
            </div>
            <p className="text-lg text-white">AI가 궁합을 분석하고 있습니다...</p>
            <p className="text-base text-white/60">잠시만 기다려주세요</p>
          </div>
        </div>
      }
    >
      <CompatibilityAIResultContent />
    </Suspense>
  );
}
