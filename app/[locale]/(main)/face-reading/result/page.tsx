"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Brain,
  MagicWand,
} from "@phosphor-icons/react";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { LoginCTAModal } from "@/components/auth/LoginCTAModal";
import { checkAuthStatus, autoSaveFaceReadingResult } from "@/lib/actions/saju";
import { saveLocalFaceReadingResult } from "@/lib/local-history";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

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

// 스트리밍 카테고리 타입 (기본 분석: 종합 요약만)
type StreamingCategory = "summary";

// AI 분석 중 애니메이션
function AIAnalyzingAnimation() {
  const messages = [
    "관상을 깊이 살펴보고 있습니다...",
    "얼굴형에서 타고난 성향을 분석합니다...",
    "오관(五官)에서 운세를 읽어냅니다...",
    "삼정(三停)에서 인생 흐름을 봅니다...",
    "AI가 관상학 지혜를 종합하고 있습니다...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#ef4444] to-pink-500 flex items-center justify-center">
          <MagicWand className="w-8 h-8 sm:w-10 sm:h-10 text-white" weight="fill" />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ef4444] to-pink-500 animate-ping opacity-30" />
      </div>
      <p className="text-sm sm:text-base text-text-secondary text-center animate-pulse">
        {messages[messageIndex]}
      </p>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-text-primary";
  return "text-orange-500";
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-text-secondary">{label}</span>
          <span className={`font-bold ${getScoreColor(score)}`}>{score}점</span>
        </div>
      )}
      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("male");
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginCTA, setShowLoginCTA] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const hasCheckedAuth = useRef(false);
  const hasSaved = useRef(false);

  // 스트리밍 상태 (종합 요약만)
  const [summaryContent, setSummaryContent] = useState("");
  const [isStreamingStarted, setIsStreamingStarted] = useState(false);
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);
  const hasStartedStreaming = useRef(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("faceReadingResult");
    const storedImage = sessionStorage.getItem("faceReadingImage");
    const storedGender = sessionStorage.getItem("faceReadingGender");

    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResult(parsed);
        if (storedImage) setImageBase64(storedImage);
        if (storedGender) setGender(storedGender);
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

  // Check auth status and auto-save for authenticated users
  useEffect(() => {
    if (!result || hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAndSave = async () => {
      const { isAuthenticated: authStatus } = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus && !hasSaved.current) {
        hasSaved.current = true;
        // Auto-save the result with image for authenticated users
        await autoSaveFaceReadingResult({
          resultData: result,
          imageBase64: imageBase64 || undefined,
          gender,
        });
      } else if (!authStatus && !hasSaved.current) {
        hasSaved.current = true;
        // Save to localStorage for non-authenticated users
        saveLocalFaceReadingResult(result, gender);
        // Show login CTA for non-authenticated users after a delay
        setTimeout(() => {
          setShowLoginCTA(true);
        }, 2000);
      }
    };

    checkAndSave();
  }, [result, imageBase64, gender]);

  // 종합 요약 스트리밍
  const fetchSummary = useCallback(async () => {
    if (!result || hasStartedStreaming.current) return;
    hasStartedStreaming.current = true;

    // 캐시 확인
    const cacheKey = `face_summary_${JSON.stringify(result).slice(0, 100)}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setSummaryContent(cached);
      setIsStreamingComplete(true);
      return;
    }

    setIsStreamingStarted(true);

    try {
      const response = await fetch("/api/face-reading/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "summary",
          faceData: result,
          gender,
          locale: "ko",
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch summary");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text") {
                fullText += data.content;
                setSummaryContent(fullText);
              } else if (data.type === "done") {
                setIsStreamingComplete(true);
                // 캐시 저장
                localStorage.setItem(cacheKey, fullText);
              }
            } catch {
              // 파싱 오류 무시
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming summary:", error);
    }
  }, [result, gender]);

  // 스트리밍 시작
  useEffect(() => {
    if (result && !hasStartedStreaming.current) {
      // 약간의 딜레이 후 스트리밍 시작 (UI 렌더링 후)
      const timer = setTimeout(() => {
        fetchSummary();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [result, fetchSummary]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-20">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-[#ef4444] flex items-center justify-center">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" weight="fill" />
          </div>
          <p className="text-sm sm:text-base text-text-secondary">결과를 불러오는 중...</p>
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
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-1.5 py-2 sm:py-3">
        <p className="text-[#ef4444] text-[10px] sm:text-xs font-medium tracking-wider">
          觀相分析
        </p>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">
          관상 분석 결과
        </h1>
        <TextGenerateEffect
          words="당신의 관상을 전문적으로 분석했습니다"
          className="text-xs sm:text-sm text-text-secondary"
          duration={0.3}
        />
      </div>

      {/* Overall Score Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm text-center">
        <div className="w-24 h-24 sm:w-32 md:w-36 sm:h-32 md:h-36 mx-auto rounded-full bg-[#ef4444] flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-[#ef4444]/30">
          <span className="text-3xl sm:text-5xl md:text-6xl font-bold text-white">{result.overallScore}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#ef4444]/20 text-[#ef4444] font-bold text-sm sm:text-base md:text-lg">
          <Star className="w-4 h-4 sm:w-5 sm:h-5" weight="fill" />
          {result.gradeText}
        </div>
        <div className="mt-3 sm:mt-4 max-w-[280px] sm:max-w-xs mx-auto">
          <ScoreBar score={result.overallScore} label="" />
        </div>
      </div>

      {/* Face Shape */}
      <section className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 border border-border shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-text-primary">얼굴형 분석</h2>
        </div>

        <div className="space-y-2 sm:space-y-2.5">
          <div className="inline-flex px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#ef4444] text-white text-xs sm:text-sm font-medium">
            {result.faceShape.koreanName}
          </div>
          <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
            {result.faceShape.description}
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {result.faceShape.characteristics.map((char, idx) => (
              <span
                key={idx}
                className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gray-100 text-[10px] sm:text-xs text-text-secondary"
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Analysis */}
      <section className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 border border-border shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ChartBar className="w-4 h-4 sm:w-5 sm:h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-text-primary">부위별 분석</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {Object.entries(result.features).map(([key, feature]) => (
            <div key={key} className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-text-primary">
                  {feature.koreanName}
                </span>
                <span className={`text-xs sm:text-sm font-bold ${getScoreColor(feature.score)}`}>
                  {feature.score}점
                </span>
              </div>
              <ScoreBar score={feature.score} label="" />
              <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed">{feature.description}</p>
              <div className="flex items-start gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-background-secondary">
                <Sparkle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ef4444] flex-shrink-0 mt-0.5" weight="fill" />
                <p className="text-[10px] sm:text-xs text-text-primary leading-relaxed">{feature.fortune}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fortune Areas */}
      <section className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 border border-border shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-text-primary">운세 영역</h2>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {Object.entries(result.fortuneAreas).map(([key, area]) => {
            const Icon = fortuneIcons[key as keyof typeof fortuneIcons];
            const label = fortuneLabels[key as keyof typeof fortuneLabels];
            const color = fortuneColors[key as keyof typeof fortuneColors];
            return (
              <div key={key} className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-background-secondary space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" weight="fill" style={{ color }} />
                    <span className="text-xs sm:text-sm font-medium text-text-primary">{label}</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold" style={{ color }}>{area.score}점</span>
                </div>
                <div className="h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${area.score}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed">{area.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strengths */}
      <section className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5 border border-border shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Sparkle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" weight="fill" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-green-600">당신의 강점</h2>
        </div>
        <ul className="space-y-1.5 sm:space-y-2">
          {result.strengths.map((strength, idx) => (
            <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm text-text-primary leading-relaxed">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" weight="bold" />
              <span className="break-words">{strength}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Advice */}
      <section className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5 border border-border shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" weight="fill" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-yellow-600">조언</h2>
        </div>
        <ul className="space-y-1.5 sm:space-y-2">
          {result.advice.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm text-text-primary leading-relaxed">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0 mt-0.5" weight="bold" />
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Lucky Elements */}
      <section className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5 border border-border shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Clover className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" weight="fill" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-text-primary">행운의 요소</h2>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {result.luckyElements.map((element, idx) => (
            <span
              key={idx}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#ef4444] text-white text-[11px] sm:text-xs md:text-sm font-medium"
            >
              {element}
            </span>
          ))}
        </div>
      </section>

      {/* AI 종합 요약 섹션 */}
      <section className="bg-gradient-to-br from-[#ef4444]/10 to-pink-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 border border-[#ef4444]/30">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#ef4444] to-pink-500 flex items-center justify-center">
            <MagicWand className="w-4 h-4 sm:w-5 sm:h-5 text-white" weight="fill" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-text-primary">
              AI 종합 요약
            </h2>
            <p className="text-[10px] sm:text-xs text-text-secondary">
              관상가의 핵심 해석
            </p>
          </div>
          {isStreamingComplete && (
            <div className="ml-auto flex items-center gap-1.5 text-green-500 text-xs">
              <Check className="w-4 h-4" weight="bold" />
              완료
            </div>
          )}
        </div>

        {/* 스트리밍 진행 상태 */}
        {!isStreamingStarted && !isStreamingComplete && (
          <AIAnalyzingAnimation />
        )}

        {/* 종합 요약 콘텐츠 */}
        {(isStreamingStarted || isStreamingComplete) && (
          <div className="rounded-xl bg-white p-3 sm:p-4 border border-border">
            {summaryContent ? (
              <MarkdownRenderer content={summaryContent} />
            ) : (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <div className="w-4 h-4 border-2 border-[#ef4444]/30 border-t-[#ef4444] rounded-full animate-spin" />
                해석 생성 중...
              </div>
            )}
          </div>
        )}

        {/* 상세 분석 유도 */}
        {isStreamingComplete && (
          <div className="pt-2 text-center">
            <p className="text-[10px] sm:text-xs text-text-muted">
              더 깊은 분석이 궁금하시다면 아래 버튼을 눌러주세요
            </p>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="space-y-2 sm:space-y-2.5 pt-2 sm:pt-3">
        <Link href="/face-reading/detail-result" className="block">
          <button className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30">
            <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" weight="fill" />
            전통 관상학 상세 분석 보기
          </button>
        </Link>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/face-reading" className="flex-1">
            <button className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl bg-[#ef4444] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-[#dc2626] transition-colors">
              <ArrowCounterClockwise className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">다시 분석</span>
            </button>
          </Link>
        </div>
        <Link href="/" className="block">
          <button className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl bg-background-secondary border border-border text-xs sm:text-sm text-text-secondary font-medium hover:bg-background-tertiary hover:text-text-primary transition-colors">
            홈으로 돌아가기
          </button>
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] sm:text-xs text-text-muted pt-1 pb-4 sm:pb-6">
        본 관상 분석은 전통 관상학을 기반으로 한 재미용 콘텐츠입니다.
      </p>

      {/* Login CTA Modal */}
      <LoginCTAModal
        open={showLoginCTA}
        onOpenChange={setShowLoginCTA}
        onSuccess={() => {
          // Re-check auth and save after login
          hasCheckedAuth.current = false;
          hasSaved.current = false;
        }}
        resultType="face"
      />

    </div>
  );
}
