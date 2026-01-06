"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Eye,
  Ear,
  SmileyWink,
  Warning,
  ArrowRight,
  Scales,
  Brain,
  HandHeart,
  TreeStructure,
  Timer,
  Fire,
  Drop,
  Mountains,
  Leaf,
  Coin,
  MagicWand,
  ChatCircleText,
  SunHorizon,
  UsersThree,
  TrendUp,
  Compass,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { FlipWords } from "@/components/aceternity/flip-words";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface DetailedFaceReadingResult {
  overallScore: number;
  overallGrade: string;
  gradeText: string;
  summary: string;

  samjeong: {
    sangjeong: {
      score: number;
      proportion: string;
      characteristics: string[];
      fortune: string;
      parentalLuck: string;
      intelligence: string;
    };
    jungjeong: {
      score: number;
      proportion: string;
      characteristics: string[];
      fortune: string;
      socialLuck: string;
      wealthLuck: string;
    };
    hajeong: {
      score: number;
      proportion: string;
      characteristics: string[];
      fortune: string;
      childrenLuck: string;
      healthLuck: string;
    };
    balance: {
      isBalanced: boolean;
      description: string;
      overallAssessment: string;
    };
  };

  detailedFeatures: {
    ears: {
      type: string;
      koreanName: string;
      score: number;
      size: string;
      position: string;
      earlobe: string;
      characteristics: string[];
      fortune: string;
      earlyLifeLuck: string;
      wisdomLevel: string;
      longevity: string;
    };
    eyebrows: {
      type: string;
      koreanName: string;
      score: number;
      length: string;
      thickness: string;
      shape: string;
      characteristics: string[];
      fortune: string;
      siblingLuck: string;
      emotionalControl: string;
      friendshipLuck: string;
    };
    eyes: {
      type: string;
      koreanName: string;
      score: number;
      size: string;
      brightness: string;
      blackWhiteRatio: string;
      leftEye: string;
      rightEye: string;
      characteristics: string[];
      fortune: string;
      currentLuck: string;
      personality: string;
      intellect: string;
      marriageLuck: string;
    };
    nose: {
      type: string;
      koreanName: string;
      score: number;
      bridge: string;
      tip: string;
      nostrils: string;
      characteristics: string[];
      fortune: string;
      wealthStorage: string;
      middleAgeLuck: string;
      prideLevel: string;
      healthConnection: string;
    };
    mouth: {
      type: string;
      koreanName: string;
      score: number;
      size: string;
      lipThickness: string;
      corners: string;
      characteristics: string[];
      fortune: string;
      eloquence: string;
      vitalityLuck: string;
      loveLuck: string;
      lateLifeLuck: string;
    };
  };

  additionalFeatures: {
    philtrum: {
      length: string;
      clarity: string;
      shape: string;
      score: number;
      description: string;
      childrenFortune: string;
      longevitySign: string;
    };
    cheekbones: {
      prominence: string;
      position: string;
      score: number;
      description: string;
      powerLuck: string;
      socialStatus: string;
    };
    chin: {
      shape: string;
      size: string;
      score: number;
      description: string;
      lateLifeStability: string;
      subordinateLuck: string;
    };
    nasolabialFolds: {
      presence: string;
      length: string;
      symmetry: string;
      score: number;
      description: string;
      authorityLuck: string;
      longevity: string;
    };
  };

  fiveElementFace: {
    primaryElement: string;
    koreanName: string;
    chineseName: string;
    score: number;
    characteristics: string[];
    strengths: string[];
    weaknesses: string[];
    compatibleElements: string[];
    careerSuggestions: string[];
    healthTendencies: string[];
  };

  fortuneByAge: {
    earlyLife: { range: string; mainFeature: string; score: number; description: string };
    youth: { range: string; mainFeature: string; score: number; description: string };
    earlyMiddle: { range: string; mainFeature: string; score: number; description: string };
    middleAge: { range: string; mainFeature: string; score: number; description: string };
    lateMiddle: { range: string; mainFeature: string; score: number; description: string };
    lateLife: { range: string; mainFeature: string; score: number; description: string };
  };

  comprehensiveFortune: {
    wealthFortune: { score: number; rank: string; description: string };
    careerFortune: { score: number; rank: string; description: string };
    loveFortune: { score: number; rank: string; description: string };
    healthFortune: { score: number; rank: string; description: string };
    socialFortune: { score: number; rank: string; description: string };
    familyFortune: { score: number; rank: string; description: string };
  };

  specialFeatures: Array<{
    feature: string;
    type: "positive" | "negative" | "neutral";
    description: string;
    meaning: string;
  }>;

  improvementAdvice: {
    expression: string[];
    makeup?: string[];
    grooming?: string[];
    mindset: string[];
    lifestyle: string[];
  };

  koreanInterpretation: {
    emphasis: string;
    culturalContext: string;
    modernApplication: string;
  };

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

// AI 해석 스트리밍 카테고리 타입 (상세 분석용 6개 카테고리)
type StreamingCategory = "summary" | "personality" | "fortune" | "relationship" | "career" | "advice";

// 스트리밍 카테고리 설정
const STREAMING_CATEGORIES: {
  key: StreamingCategory;
  label: string;
  icon: Icon;
  color: string;
}[] = [
  { key: "summary", label: "종합 해석", icon: MagicWand, color: "#ef4444" },
  { key: "personality", label: "성격/기질 분석", icon: ChatCircleText, color: "#a855f7" },
  { key: "fortune", label: "운세/길흉 분석", icon: SunHorizon, color: "#3b82f6" },
  { key: "relationship", label: "대인관계 분석", icon: UsersThree, color: "#22c55e" },
  { key: "career", label: "직업/재물운 분석", icon: TrendUp, color: "#eab308" },
  { key: "advice", label: "조언/개운법", icon: Compass, color: "#ec4899" },
];

// 스트리밍 섹션 컴포넌트
function StreamingSection({
  category,
  content,
  isStreaming,
  isComplete,
}: {
  category: (typeof STREAMING_CATEGORIES)[number];
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
}) {
  const IconComponent = category.icon;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 border-b border-white/10"
        style={{ backgroundColor: `${category.color}10` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category.color}30` }}
        >
          <IconComponent className="w-4 h-4" weight="fill" style={{ color: category.color }} />
        </div>
        <span className="text-base font-medium text-white">{category.label}</span>
        {isComplete && (
          <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs">
            <Check className="w-4 h-4" weight="bold" />
            완료
          </div>
        )}
        {isStreaming && !isComplete && (
          <div className="ml-auto flex items-center gap-1.5 text-white/60 text-xs">
            <div
              className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${category.color}50`, borderTopColor: category.color }}
            />
            분석 중
          </div>
        )}
      </div>
      <div className="p-4">
        {content ? (
          <MarkdownRenderer content={content} />
        ) : isStreaming ? (
          <div className="flex items-center gap-3 text-white/40">
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${category.color}30`, borderTopColor: category.color }}
            />
            <span className="text-sm animate-pulse">분석 중...</span>
          </div>
        ) : (
          <span className="text-sm text-white/30">대기 중...</span>
        )}
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-white";
  return "text-orange-400";
}

function ScoreBar({ score, color = "bg-[#ef4444]" }: { score: number; color?: string }) {
  return (
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function getElementIcon(element: string) {
  switch (element) {
    case "wood": return Leaf;
    case "fire": return Fire;
    case "earth": return Mountains;
    case "metal": return Coin;
    case "water": return Drop;
    default: return Star;
  }
}

function getElementColor(element: string): string {
  switch (element) {
    case "wood": return "#22c55e";
    case "fire": return "#ef4444";
    case "earth": return "#eab308";
    case "metal": return "#94a3b8";
    case "water": return "#3b82f6";
    default: return "#a855f7";
  }
}

export default function DetailedFaceReadingResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DetailedFaceReadingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("male");

  // AI 해석 스트리밍 상태 (6개 카테고리)
  const [streamingContents, setStreamingContents] = useState<Record<StreamingCategory, string>>({
    summary: "",
    personality: "",
    fortune: "",
    relationship: "",
    career: "",
    advice: "",
  });
  const [streamingCategory, setStreamingCategory] = useState<StreamingCategory | null>(null);
  const [completedCategories, setCompletedCategories] = useState<Set<StreamingCategory>>(new Set());
  const hasStartedStreaming = useRef(false);

  useEffect(() => {
    const fetchDetailedFaceReading = async () => {
      const storedData = sessionStorage.getItem("faceReadingImage");
      const storedGender = sessionStorage.getItem("faceReadingGender");

      if (!storedData) {
        router.push("/face-reading");
        return;
      }

      setGender(storedGender || "male");

      try {
        const response = await fetch("/api/face-reading/detail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64: storedData,
            gender: storedGender || "male",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "상세 관상 분석에 실패했습니다.");
        }

        const faceReadingResult = await response.json();
        setResult(faceReadingResult);
      } catch (err) {
        console.error("Detailed face reading fetch error:", err);
        setError(err instanceof Error ? err.message : "상세 관상 분석 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedFaceReading();
  }, [router]);

  // 개별 카테고리 스트리밍 fetch
  const fetchStreamingCategory = useCallback(
    async (
      category: StreamingCategory,
      faceData: DetailedFaceReadingResult,
      genderValue: string
    ): Promise<void> => {
      setStreamingCategory(category);

      try {
        const response = await fetch("/api/face-reading/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            faceData,
            gender: genderValue,
            locale: "ko",
          }),
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${category} interpretation`);
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
                  setStreamingContents((prev) => ({
                    ...prev,
                    [category]: fullText,
                  }));
                } else if (data.type === "done") {
                  setCompletedCategories((prev) => new Set([...prev, category]));
                }
              } catch {
                // 파싱 오류 무시
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error streaming ${category}:`, error);
      } finally {
        setStreamingCategory(null);
      }
    },
    []
  );

  // 모든 카테고리 순차 스트리밍
  const streamAllCategories = useCallback(
    async (faceData: DetailedFaceReadingResult, genderValue: string) => {
      // 캐시 확인
      const cacheKey = `face_detail_ai_all_${JSON.stringify(faceData).slice(0, 100)}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const cachedData = JSON.parse(cached) as Record<StreamingCategory, string>;
          setStreamingContents(cachedData);
          setCompletedCategories(new Set(STREAMING_CATEGORIES.map((c) => c.key)));
          return;
        } catch {
          // 캐시 파싱 실패 시 무시
        }
      }

      // 모든 카테고리 순차적으로 스트리밍
      for (const category of STREAMING_CATEGORIES) {
        await fetchStreamingCategory(category.key, faceData, genderValue);
        // 각 카테고리 사이에 약간의 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 완료 후 캐시 저장
      setStreamingContents((currentContents) => {
        localStorage.setItem(cacheKey, JSON.stringify(currentContents));
        return currentContents;
      });
    },
    [fetchStreamingCategory]
  );

  // AI 해석 시작 (6개 카테고리 순차 스트리밍)
  useEffect(() => {
    if (result && !hasStartedStreaming.current) {
      hasStartedStreaming.current = true;
      // 약간의 딜레이 후 시작 (UI 렌더링 후)
      const timer = setTimeout(() => {
        streamAllCategories(result, gender);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [result, gender, streamAllCategories]);

  if (isLoading) {
    const loadingSteps = [
      "삼정 분석 중",
      "오관 특성 확인 중",
      "오행 얼굴형 분석 중",
      "부위별 운세 계산 중",
      "나이별 운세 분석 중",
      "종합 운세 분석 중",
    ];

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Sparkles Background */}
        <SparklesCore
          id="loading-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={50}
          particleColor="#ef4444"
          className="absolute inset-0"
        />

        <div className="text-center space-y-6 relative z-10">
          {/* Animated Icon */}
          <motion.div
            className="relative w-24 h-24 mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-[#ef4444]/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Middle ring */}
            <motion.div
              className="absolute inset-2 rounded-xl bg-[#ef4444]/50"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.4, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            {/* Inner icon container */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ef4444] to-[#f97316] flex items-center justify-center shadow-lg shadow-[#ef4444]/50"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Camera className="w-12 h-12 text-white" weight="fill" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xl font-bold text-white">전통 관상학 상세 분석</p>
          </motion.div>

          {/* Flip Words for loading steps */}
          <motion.div
            className="h-8 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FlipWords
              words={loadingSteps}
              duration={2000}
              className="text-base text-[#ef4444] font-medium"
            />
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-48 mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 12,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Sub text */}
          <motion.p
            className="text-sm text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            AI가 관상을 깊이 분석하고 있습니다
          </motion.p>
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
          <Link href="/face-reading">
            <button className="px-6 py-3 rounded-xl bg-[#ef4444] text-white text-base font-medium hover:bg-[#dc2626] transition-colors">
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

  const ElementIcon = getElementIcon(result.fiveElementFace.primaryElement);
  const elementColor = getElementColor(result.fiveElementFace.primaryElement);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#ef4444] text-sm font-medium tracking-wider">
          傳統觀相詳細分析
        </p>
        <h1 className="text-2xl font-bold text-white">
          전통 관상 상세 분석
        </h1>
        <TextGenerateEffect
          words="삼정, 오관, 오행 기반 심층 관상 분석"
          className="text-base text-white/60"
          duration={0.3}
        />
      </div>

      {/* Overall Score Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
        <div className="w-36 h-36 mx-auto rounded-full bg-[#ef4444] flex items-center justify-center mb-4 shadow-lg shadow-[#ef4444]/30">
          <span className="text-6xl font-bold text-white">{result.overallScore}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ef4444]/20 text-[#ef4444] font-bold text-lg mb-3">
          <Star className="w-5 h-5" weight="fill" />
          {result.gradeText}
        </div>
        <p className="text-base text-white/80 max-w-md mx-auto">
          {result.summary}
        </p>
      </div>

      {/* 삼정 분석 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <TreeStructure className="w-5 h-5 text-purple-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">삼정(三停) 분석</h2>
        </div>

        <div className="space-y-4">
          {/* 상정 */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-cyan-400">상정 (이마 영역) - 초년운</span>
              <span className={`text-lg font-bold ${getScoreColor(result.samjeong.sangjeong.score)}`}>
                {result.samjeong.sangjeong.score}점
              </span>
            </div>
            <ScoreBar score={result.samjeong.sangjeong.score} color="bg-cyan-400" />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.samjeong.sangjeong.fortune}</p>
              <div className="flex flex-wrap gap-2">
                {result.samjeong.sangjeong.characteristics.map((char, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs">{char}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">부모운:</span> <span className="text-white/80">{result.samjeong.sangjeong.parentalLuck}</span></div>
                <div><span className="text-white/40">지성:</span> <span className="text-white/80">{result.samjeong.sangjeong.intelligence}</span></div>
              </div>
            </div>
          </div>

          {/* 중정 */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-yellow-400">중정 (눈~코 영역) - 중년운</span>
              <span className={`text-lg font-bold ${getScoreColor(result.samjeong.jungjeong.score)}`}>
                {result.samjeong.jungjeong.score}점
              </span>
            </div>
            <ScoreBar score={result.samjeong.jungjeong.score} color="bg-yellow-400" />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.samjeong.jungjeong.fortune}</p>
              <div className="flex flex-wrap gap-2">
                {result.samjeong.jungjeong.characteristics.map((char, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">{char}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">사회운:</span> <span className="text-white/80">{result.samjeong.jungjeong.socialLuck}</span></div>
                <div><span className="text-white/40">재물운:</span> <span className="text-white/80">{result.samjeong.jungjeong.wealthLuck}</span></div>
              </div>
            </div>
          </div>

          {/* 하정 */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-orange-400">하정 (입~턱 영역) - 말년운</span>
              <span className={`text-lg font-bold ${getScoreColor(result.samjeong.hajeong.score)}`}>
                {result.samjeong.hajeong.score}점
              </span>
            </div>
            <ScoreBar score={result.samjeong.hajeong.score} color="bg-orange-400" />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.samjeong.hajeong.fortune}</p>
              <div className="flex flex-wrap gap-2">
                {result.samjeong.hajeong.characteristics.map((char, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs">{char}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">자녀운:</span> <span className="text-white/80">{result.samjeong.hajeong.childrenLuck}</span></div>
                <div><span className="text-white/40">건강운:</span> <span className="text-white/80">{result.samjeong.hajeong.healthLuck}</span></div>
              </div>
            </div>
          </div>

          {/* 삼정 균형 */}
          <div className={`p-4 rounded-xl ${result.samjeong.balance.isBalanced ? 'bg-green-500/20 border border-green-500/30' : 'bg-orange-500/20 border border-orange-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.samjeong.balance.isBalanced ? (
                <Check className="w-5 h-5 text-green-400" weight="bold" />
              ) : (
                <Warning className="w-5 h-5 text-orange-400" weight="bold" />
              )}
              <span className={`text-base font-medium ${result.samjeong.balance.isBalanced ? 'text-green-400' : 'text-orange-400'}`}>
                삼정 균형
              </span>
            </div>
            <p className="text-sm text-white/80">{result.samjeong.balance.description}</p>
            <p className="text-sm text-white/60 mt-1">{result.samjeong.balance.overallAssessment}</p>
          </div>
        </div>
      </section>

      {/* 오관 상세 분석 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">오관(五官) 상세 분석</h2>
        </div>

        <div className="space-y-4">
          {/* 눈 - 가장 중요 */}
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#ef4444]" weight="fill" />
                <span className="text-base font-medium text-[#ef4444]">눈 - 감찰관 (가장 중요)</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(result.detailedFeatures.eyes.score)}`}>
                {result.detailedFeatures.eyes.score}점
              </span>
            </div>
            <p className="text-lg font-medium text-white mb-2">{result.detailedFeatures.eyes.koreanName}</p>
            <ScoreBar score={result.detailedFeatures.eyes.score} />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.detailedFeatures.eyes.fortune}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">현재운:</span> <span className="text-white/80">{result.detailedFeatures.eyes.currentLuck}</span></div>
                <div><span className="text-white/40">배우자운:</span> <span className="text-white/80">{result.detailedFeatures.eyes.marriageLuck}</span></div>
                <div><span className="text-white/40">성격:</span> <span className="text-white/80">{result.detailedFeatures.eyes.personality}</span></div>
                <div><span className="text-white/40">지성:</span> <span className="text-white/80">{result.detailedFeatures.eyes.intellect}</span></div>
              </div>
            </div>
          </div>

          {/* 코 */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-yellow-400">코 - 심판관</span>
              <span className={`text-lg font-bold ${getScoreColor(result.detailedFeatures.nose.score)}`}>
                {result.detailedFeatures.nose.score}점
              </span>
            </div>
            <p className="text-lg font-medium text-white mb-2">{result.detailedFeatures.nose.koreanName}</p>
            <ScoreBar score={result.detailedFeatures.nose.score} color="bg-yellow-400" />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.detailedFeatures.nose.fortune}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">재물저장:</span> <span className="text-white/80">{result.detailedFeatures.nose.wealthStorage}</span></div>
                <div><span className="text-white/40">중년운:</span> <span className="text-white/80">{result.detailedFeatures.nose.middleAgeLuck}</span></div>
              </div>
            </div>
          </div>

          {/* 눈썹 */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-purple-400">눈썹 - 보수관</span>
              <span className={`text-lg font-bold ${getScoreColor(result.detailedFeatures.eyebrows.score)}`}>
                {result.detailedFeatures.eyebrows.score}점
              </span>
            </div>
            <p className="text-lg font-medium text-white mb-2">{result.detailedFeatures.eyebrows.koreanName}</p>
            <ScoreBar score={result.detailedFeatures.eyebrows.score} color="bg-purple-400" />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.detailedFeatures.eyebrows.fortune}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">형제운:</span> <span className="text-white/80">{result.detailedFeatures.eyebrows.siblingLuck}</span></div>
                <div><span className="text-white/40">감정조절:</span> <span className="text-white/80">{result.detailedFeatures.eyebrows.emotionalControl}</span></div>
              </div>
            </div>
          </div>

          {/* 입 */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <SmileyWink className="w-5 h-5 text-pink-400" weight="fill" />
                <span className="text-base font-medium text-pink-400">입 - 출납관</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(result.detailedFeatures.mouth.score)}`}>
                {result.detailedFeatures.mouth.score}점
              </span>
            </div>
            <p className="text-lg font-medium text-white mb-2">{result.detailedFeatures.mouth.koreanName}</p>
            <ScoreBar score={result.detailedFeatures.mouth.score} color="bg-pink-400" />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.detailedFeatures.mouth.fortune}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">언변:</span> <span className="text-white/80">{result.detailedFeatures.mouth.eloquence}</span></div>
                <div><span className="text-white/40">애정운:</span> <span className="text-white/80">{result.detailedFeatures.mouth.loveLuck}</span></div>
              </div>
            </div>
          </div>

          {/* 귀 */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Ear className="w-5 h-5 text-green-400" weight="fill" />
                <span className="text-base font-medium text-green-400">귀 - 채청관</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(result.detailedFeatures.ears.score)}`}>
                {result.detailedFeatures.ears.score}점
              </span>
            </div>
            <p className="text-lg font-medium text-white mb-2">{result.detailedFeatures.ears.koreanName}</p>
            <ScoreBar score={result.detailedFeatures.ears.score} color="bg-green-400" />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-white/60">{result.detailedFeatures.ears.fortune}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/40">지혜:</span> <span className="text-white/80">{result.detailedFeatures.ears.wisdomLevel}</span></div>
                <div><span className="text-white/40">수명:</span> <span className="text-white/80">{result.detailedFeatures.ears.longevity}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 오행 얼굴형 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <ElementIcon className="w-5 h-5" weight="fill" style={{ color: elementColor }} />
          <h2 className="text-lg font-semibold text-white">오행(五行) 얼굴형</h2>
        </div>

        <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${elementColor}20` }}>
          <ElementIcon className="w-12 h-12 mx-auto mb-2" weight="fill" style={{ color: elementColor }} />
          <p className="text-2xl font-bold text-white">{result.fiveElementFace.koreanName}</p>
          <p className="text-sm text-white/60">{result.fiveElementFace.chineseName}</p>
          <div className="mt-2">
            <span className="text-lg font-bold" style={{ color: elementColor }}>{result.fiveElementFace.score}점</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/40 mb-2">특성</p>
            <div className="flex flex-wrap gap-2">
              {result.fiveElementFace.characteristics.map((char, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: `${elementColor}20`, color: elementColor }}>
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2">강점</p>
            <ul className="space-y-1">
              {result.fiveElementFace.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2">약점</p>
            <ul className="space-y-1">
              {result.fiveElementFace.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <Warning className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" weight="bold" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2">추천 직업</p>
            <div className="flex flex-wrap gap-2">
              {result.fiveElementFace.careerSuggestions.map((career, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 나이별 운세 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">나이별 운세</h2>
        </div>

        <div className="space-y-3">
          {Object.entries(result.fortuneByAge).map(([key, data]) => (
            <div key={key} className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-base font-medium text-white">{data.range}</span>
                  <span className="text-sm text-white/40 ml-2">({data.mainFeature})</span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(data.score)}`}>{data.score}점</span>
              </div>
              <ScoreBar score={data.score} />
              <p className="text-sm text-white/60 mt-2">{data.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 종합 운세 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <ChartBar className="w-5 h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">종합 운세 분석</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: "wealthFortune", icon: Lightning, label: "재물운", color: "#eab308" },
            { key: "careerFortune", icon: Briefcase, label: "사업운", color: "#3b82f6" },
            { key: "loveFortune", icon: Heart, label: "애정운", color: "#ec4899" },
            { key: "healthFortune", icon: Shield, label: "건강운", color: "#22c55e" },
            { key: "socialFortune", icon: Users, label: "사회운", color: "#a855f7" },
            { key: "familyFortune", icon: HandHeart, label: "가정운", color: "#f59e0b" },
          ].map(({ key, icon: Icon, label, color }) => {
            const fortune = result.comprehensiveFortune[key as keyof typeof result.comprehensiveFortune];
            return (
              <div key={key} className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" weight="fill" style={{ color }} />
                    <span className="text-base font-medium text-white">{label}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${color}20`, color }}>
                      {fortune.rank}
                    </span>
                  </div>
                  <span className="text-lg font-bold" style={{ color }}>{fortune.score}점</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${fortune.score}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-sm text-white/60 mt-2">{fortune.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 특별한 상 */}
      {result.specialFeatures.length > 0 && (
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
          <div className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-yellow-400" weight="fill" />
            <h2 className="text-lg font-semibold text-white">특별한 상</h2>
          </div>

          <div className="space-y-3">
            {result.specialFeatures.map((feature, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl ${
                  feature.type === "positive" ? "bg-green-500/10 border border-green-500/30" :
                  feature.type === "negative" ? "bg-orange-500/10 border border-orange-500/30" :
                  "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {feature.type === "positive" ? (
                    <Sparkle className="w-5 h-5 text-green-400" weight="fill" />
                  ) : feature.type === "negative" ? (
                    <Warning className="w-5 h-5 text-orange-400" weight="bold" />
                  ) : (
                    <Star className="w-5 h-5 text-white/60" weight="fill" />
                  )}
                  <span className={`text-base font-medium ${
                    feature.type === "positive" ? "text-green-400" :
                    feature.type === "negative" ? "text-orange-400" :
                    "text-white"
                  }`}>
                    {feature.feature}
                  </span>
                </div>
                <p className="text-sm text-white/60">{feature.description}</p>
                <p className="text-sm text-white/80 mt-1">{feature.meaning}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 관상 개선 조언 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">관상 개선 조언</h2>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-white/40 mb-2">표정 관리</p>
            <ul className="space-y-1">
              {result.improvementAdvice.expression.map((advice, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
                  {advice}
                </li>
              ))}
            </ul>
          </div>

          {result.improvementAdvice.makeup && (
            <div>
              <p className="text-sm text-white/40 mb-2">화장/스타일링</p>
              <ul className="space-y-1">
                {result.improvementAdvice.makeup.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" weight="bold" />
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.improvementAdvice.grooming && (
            <div>
              <p className="text-sm text-white/40 mb-2">그루밍</p>
              <ul className="space-y-1">
                {result.improvementAdvice.grooming.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" weight="bold" />
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-sm text-white/40 mb-2">마음가짐</p>
            <ul className="space-y-1">
              {result.improvementAdvice.mindset.map((advice, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" weight="fill" />
                  {advice}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2">생활습관</p>
            <ul className="space-y-1">
              {result.improvementAdvice.lifestyle.map((advice, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <Heart className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" weight="fill" />
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 한국 관상학 특수 해석 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#ef4444]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">한국 관상학 특수 해석</h2>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#ef4444]/10">
            <p className="text-sm text-white/40">강조 부분</p>
            <p className="text-base text-white/80">{result.koreanInterpretation.emphasis}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-sm text-white/40">문화적 맥락</p>
            <p className="text-base text-white/80">{result.koreanInterpretation.culturalContext}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-sm text-white/40">현대적 적용</p>
            <p className="text-base text-white/80">{result.koreanInterpretation.modernApplication}</p>
          </div>
        </div>
      </section>

      {/* 강점 */}
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

      {/* 조언 */}
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

      {/* 행운의 요소 */}
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

      {/* AI 상세 해석 (6개 카테고리) */}
      <section className="bg-gradient-to-br from-[#ef4444]/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-5 space-y-5 border border-[#ef4444]/30">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ef4444] to-purple-500 flex items-center justify-center">
            <MagicWand className="w-5 h-5 text-white" weight="fill" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI 상세 해석</h2>
            <p className="text-xs text-white/60">40년 경력 관상가의 6가지 영역별 분석</p>
          </div>
        </div>

        {/* 진행 상태 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>분석 진행률</span>
            <span>{completedCategories.size} / {STREAMING_CATEGORIES.length} 완료</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ef4444] to-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${(completedCategories.size / STREAMING_CATEGORIES.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* 6개 스트리밍 섹션 */}
        <div className="space-y-4">
          {STREAMING_CATEGORIES.map((category) => (
            <StreamingSection
              key={category.key}
              category={category}
              content={streamingContents[category.key]}
              isStreaming={streamingCategory === category.key}
              isComplete={completedCategories.has(category.key)}
            />
          ))}
        </div>

        {/* 완료 메시지 */}
        {completedCategories.size === STREAMING_CATEGORIES.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-400 font-medium">
              <Check className="w-5 h-5" weight="bold" />
              모든 AI 분석이 완료되었습니다
            </div>
            <p className="text-xs text-white/60 mt-1">
              결과를 저장하시면 다음에 더 빠르게 확인할 수 있습니다
            </p>
          </motion.div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Link href="/face-reading/result" className="block">
          <button className="w-full h-14 rounded-xl bg-[#ef4444] text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#dc2626] transition-colors">
            <ChartBar className="w-5 h-5" weight="fill" />
            기본 분석 결과 보기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </button>
        </Link>

        <Link href="/face-reading" className="block">
          <button className="w-full h-14 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ArrowCounterClockwise className="w-5 h-5" />
            다시 분석하기
          </button>
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-sm text-white/40 pt-2 pb-8">
        본 관상 분석은 전통 관상학(삼정, 오관, 오행)을 기반으로 한 참고용 정보입니다.
      </p>
    </div>
  );
}
