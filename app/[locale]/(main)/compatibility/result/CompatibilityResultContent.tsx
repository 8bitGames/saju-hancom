"use client";

import { Link } from "@/lib/i18n/navigation";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { UsersThree, ArrowCounterClockwise, ChatCircle, Handshake, Heart, ChartBar, Sparkle, User, ArrowRight, Check, Warning, Brain, CircleNotch, Lightning, Clock, Lightbulb } from "@phosphor-icons/react";
import { ELEMENT_KOREAN } from "@/lib/saju";
import { calculatePersonCompatibility } from "@/lib/compatibility/calculator";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { LoginCTAModal } from "@/components/auth/LoginCTAModal";
import { checkAuthStatus, autoSaveCompatibilityResult } from "@/lib/actions/saju";
import { saveLocalCompatibilityResult } from "@/lib/local-history";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import type { Gender, Element } from "@/lib/saju/types";
import type { RelationType } from "@/lib/compatibility/types";

// 스트리밍 카테고리 타입
type StreamingCategory = "summary" | "communication" | "synergy" | "challenges" | "advice" | "timing";

interface AIInterpretation {
  summary: string;
  communication: string;
  synergy: string;
  challenges: string;
  advice: string;
  timing: string;
}

// 카테고리 메타데이터
const CATEGORY_META: Record<StreamingCategory, {
  icon: typeof Brain;
  color: string;
  label: string;
  bgColor: string;
}> = {
  summary: { icon: Brain, color: "text-blue-400", label: "종합 궁합", bgColor: "bg-blue-500/10" },
  communication: { icon: ChatCircle, color: "text-green-400", label: "소통과 협업", bgColor: "bg-green-500/10" },
  synergy: { icon: Lightning, color: "text-purple-400", label: "시너지 분석", bgColor: "bg-purple-500/10" },
  challenges: { icon: Warning, color: "text-orange-400", label: "주의할 점", bgColor: "bg-orange-500/10" },
  advice: { icon: Lightbulb, color: "text-pink-400", label: "관계 발전 조언", bgColor: "bg-pink-500/10" },
  timing: { icon: Clock, color: "text-cyan-400", label: "좋은 시기", bgColor: "bg-cyan-500/10" },
};

// AI Loading Animation Component
function AIAnalyzingAnimation({ message = "궁합을 분석하고 있어요..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-3">
      <motion.div
        className="relative w-12 h-12"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <CircleNotch className="w-12 h-12 text-blue-400" weight="bold" />
      </motion.div>
      <motion.div
        className="flex items-center gap-2 text-blue-300"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Brain className="w-4 h-4" weight="fill" />
        <span className="text-sm font-medium">{message}</span>
      </motion.div>
    </div>
  );
}

// 스트리밍 섹션 컴포넌트
function StreamingSection({
  category,
  content,
  isStreaming,
  isComplete,
}: {
  category: StreamingCategory;
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  if (!content && !isStreaming) return null;

  return (
    <motion.div
      className={`p-4 rounded-xl ${meta.bgColor} border border-white/10`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${meta.color}`} weight="fill" />
        <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
        {isStreaming && (
          <motion.div
            className="w-2 h-2 rounded-full bg-blue-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        {isComplete && (
          <Check className="w-4 h-4 text-green-400" weight="bold" />
        )}
      </div>
      {content ? (
        <div className="text-white/80 text-sm leading-relaxed">
          <MarkdownRenderer content={content} />
        </div>
      ) : isStreaming ? (
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            분석 중...
          </motion.span>
        </div>
      ) : null}
    </motion.div>
  );
}

interface SearchParams {
  p1Name?: string;
  p1Year?: string;
  p1Month?: string;
  p1Day?: string;
  p1Hour?: string;
  p1Minute?: string;
  p1Gender?: string;
  p1IsLunar?: string;
  p1City?: string;
  p2Name?: string;
  p2Year?: string;
  p2Month?: string;
  p2Day?: string;
  p2Hour?: string;
  p2Minute?: string;
  p2Gender?: string;
  p2IsLunar?: string;
  p2City?: string;
  relationType?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
};

// Glowing card wrapper
function GlowingCard({
  children,
  className = "",
  glowColor = "rgba(59, 130, 246, 0.4)",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={`relative ${className}`} variants={variants}>
      {/* Constant glow effect - static on mobile, animated on desktop */}
      <div
        className="absolute -inset-1 rounded-2xl glow-constant"
        style={{ background: glowColor }}
      />
      {/* Drop shadow */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-30"
        style={{ background: glowColor }}
      />
      {/* Content */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}


function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-white";
  return "text-orange-400";
}

function getRelationTypeKorean(type?: string): string {
  switch (type) {
    case "colleague": return "동료";
    case "supervisor": return "선배";
    case "subordinate": return "후배";
    case "partner": return "파트너";
    case "client": return "고객";
    case "mentor": return "멘토";
    case "mentee": return "멘티";
    case "friend": return "친구";
    case "family": return "가족";
    default: return "동료";
  }
}

// Animated counter component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

// Animated score bar
function AnimatedScoreBar({ score, label, delay = 0 }: { score: number; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex justify-between text-base">
        <span className="text-white/60">{label}</span>
        <motion.span
          className={`font-bold ${getScoreColor(score)}`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: delay + 0.3 }}
        >
          <AnimatedCounter value={score} duration={1.5} />점
        </motion.span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${score}%` } : { width: 0 }}
          transition={{
            duration: 1.2,
            delay: delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      </div>
    </div>
  );
}

function PersonPillarsDisplay({
  name,
  pillars,
  label,
  delay = 0,
}: {
  name: string;
  pillars: { year: { gan: string; zhi: string }; month: { gan: string; zhi: string }; day: { gan: string; zhi: string }; time: { gan: string; zhi: string } };
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-[#3b82f6]" weight="fill" />
        <span className="text-base font-medium text-white">{label}: {name}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(["year", "month", "day", "time"] as const).map((pillar, index) => {
          const p = pillars[pillar];
          return (
            <motion.div
              key={pillar}
              className="relative group text-center"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: delay + 0.1 + index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
            >
              {/* Pillar glow */}
              <div className="absolute -inset-0.5 rounded-xl bg-blue-500/20 blur-sm group-hover:bg-blue-500/40 transition-all duration-300" />
              <div className="relative p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                <p className="text-xs text-white/40 mb-1">
                  {pillar === "year" ? "년" : pillar === "month" ? "월" : pillar === "day" ? "일" : "시"}
                </p>
                <p className="text-lg font-bold text-white">{p.gan}{p.zhi}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function CompatibilityResultContent({ searchParams }: { searchParams: SearchParams }) {
  const person1 = {
    name: searchParams.p1Name || "본인",
    year: parseInt(searchParams.p1Year || "1990"),
    month: parseInt(searchParams.p1Month || "1"),
    day: parseInt(searchParams.p1Day || "1"),
    hour: parseInt(searchParams.p1Hour || "12"),
    minute: parseInt(searchParams.p1Minute || "0"),
    gender: (searchParams.p1Gender as Gender) || "male",
    isLunar: searchParams.p1IsLunar === "true",
    city: searchParams.p1City || "서울",
  };

  const person2 = {
    name: searchParams.p2Name || "상대방",
    year: parseInt(searchParams.p2Year || "1990"),
    month: parseInt(searchParams.p2Month || "1"),
    day: parseInt(searchParams.p2Day || "1"),
    hour: parseInt(searchParams.p2Hour || "12"),
    minute: parseInt(searchParams.p2Minute || "0"),
    gender: (searchParams.p2Gender as Gender) || "male",
    isLunar: searchParams.p2IsLunar === "true",
    city: searchParams.p2City || "서울",
  };

  const relationType = searchParams.relationType as RelationType | undefined;
  const result = calculatePersonCompatibility(person1, person2, relationType);

  const [aiInterpretation, setAiInterpretation] = useState<AIInterpretation>({
    summary: "",
    communication: "",
    synergy: "",
    challenges: "",
    advice: "",
    timing: "",
  });
  const [streamingCategory, setStreamingCategory] = useState<StreamingCategory | null>(null);
  const [completedCategories, setCompletedCategories] = useState<Set<StreamingCategory>>(new Set());
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const [showLoginCTA, setShowLoginCTA] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const hasCheckedAuth = useRef(false);
  const hasSaved = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create cache key from person data
  const cacheKey = useMemo(() =>
    `compatibility_stream_v2_${person1.year}_${person1.month}_${person1.day}_${person1.hour}_${person1.gender}_${person2.year}_${person2.month}_${person2.day}_${person2.hour}_${person2.gender}_${relationType || 'colleague'}`,
    [person1.year, person1.month, person1.day, person1.hour, person1.gender, person2.year, person2.month, person2.day, person2.hour, person2.gender, relationType]
  );

  // Helper functions
  const pillarsStr = useCallback((pillars: { year: { gan: string; zhi: string }; month: { gan: string; zhi: string }; day: { gan: string; zhi: string }; time: { gan: string; zhi: string } }) =>
    `${pillars.year.gan}${pillars.year.zhi} ${pillars.month.gan}${pillars.month.zhi} ${pillars.day.gan}${pillars.day.zhi} ${pillars.time.gan}${pillars.time.zhi}`, []);

  const elementsStr = useCallback((balance: Record<string, number>) =>
    Object.entries(balance).map(([k, v]) => `${ELEMENT_KOREAN[k as keyof typeof ELEMENT_KOREAN]}:${v}`).join(', '), []);

  // 일간 오행 가져오기
  const getDayMasterElement = useCallback((gan: string): Element => {
    const ganElements: Record<string, Element> = {
      "甲": "wood", "乙": "wood",
      "丙": "fire", "丁": "fire",
      "戊": "earth", "己": "earth",
      "庚": "metal", "辛": "metal",
      "壬": "water", "癸": "water",
    };
    return ganElements[gan] || "wood";
  }, []);

  // 스트리밍 fetch 함수
  const fetchStreamingCategory = useCallback(async (category: StreamingCategory): Promise<string> => {
    const p1DayMaster = result.person1Pillars.day.gan;
    const p2DayMaster = result.person2Pillars.day.gan;

    console.log(`[AI 스트리밍] ${category} API 호출 중...`);
    const response = await fetch('/api/compatibility/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        person1: {
          name: person1.name,
          pillars: pillarsStr(result.person1Pillars),
          dayMaster: p1DayMaster,
          dayMasterElement: getDayMasterElement(p1DayMaster),
          elements: elementsStr(result.elementBalance.person1),
        },
        person2: {
          name: person2.name,
          pillars: pillarsStr(result.person2Pillars),
          dayMaster: p2DayMaster,
          dayMasterElement: getDayMasterElement(p2DayMaster),
          elements: elementsStr(result.elementBalance.person2),
        },
        compatibilityData: {
          score: result.score,
          gradeText: result.gradeText,
          person1Pillars: result.person1Pillars,
          person2Pillars: result.person2Pillars,
        },
        relationType: relationType || 'colleague',
        locale: 'ko',
      }),
      signal: abortControllerRef.current?.signal,
    });

    console.log(`[AI 스트리밍] ${category} 응답 상태: ${response.status}`);
    if (!response.ok) {
      let errorMessage = `API 오류 (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 에러 메시지 사용
      }
      console.error(`[AI 스트리밍] ${category} API 오류:`, errorMessage);
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('리더 없음');

    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') {
              fullContent += data.content;
              setAiInterpretation(prev => ({
                ...prev,
                [category]: prev[category] + data.content,
              }));
            } else if (data.type === 'done') {
              // 완료
            } else if (data.type === 'error') {
              // 스트리밍 중 에러
              throw new Error(data.message || 'AI 응답 생성 오류');
            }
          } catch (parseError) {
            // JSON 파싱 오류가 아닌 경우 재throw
            if (parseError instanceof SyntaxError) {
              // 파싱 오류 무시
            } else {
              throw parseError;
            }
          }
        }
      }
    }

    return fullContent;
  }, [person1, person2, result, relationType, pillarsStr, elementsStr, getDayMasterElement]);

  // 카테고리 순차 스트리밍
  const streamAllCategories = useCallback(async () => {
    const categories: StreamingCategory[] = ['summary', 'communication', 'synergy', 'challenges', 'advice', 'timing'];

    console.log('[AI 스트리밍] 시작');
    abortControllerRef.current = new AbortController();
    setStreamingError(null);
    let hasAnySuccess = false;
    let lastError: string | null = null;

    for (const category of categories) {
      if (abortControllerRef.current?.signal.aborted) break;

      setStreamingCategory(category);

      try {
        console.log(`[AI 스트리밍] ${category} 요청 시작`);
        const content = await fetchStreamingCategory(category);
        console.log(`[AI 스트리밍] ${category} 완료, 길이: ${content?.length || 0}`);
        if (content && content.trim().length > 0) {
          hasAnySuccess = true;
        }
        setCompletedCategories(prev => new Set([...prev, category]));
      } catch (error) {
        if ((error as Error).name === 'AbortError') break;
        console.error(`[AI 스트리밍] ${category} 오류:`, error);
        lastError = error instanceof Error ? error.message : '스트리밍 오류';
      }

      // 다음 카테고리 전 짧은 딜레이
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setStreamingCategory(null);
    setIsAllComplete(true);

    // 모든 카테고리 실패 시 에러 메시지 표시
    if (!hasAnySuccess) {
      setStreamingError(lastError || 'AI 분석 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.');
    }
  }, [fetchStreamingCategory]);

  // Fetch AI interpretation with streaming
  useEffect(() => {
    console.log('[AI 스트리밍] useEffect 실행, hasFetched:', hasFetched.current);
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Check cache first
    const cached = localStorage.getItem(cacheKey);
    console.log('[AI 스트리밍] 캐시 확인:', cached ? '있음' : '없음');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // 캐시 데이터가 유효한지 확인 (최소한 summary가 있어야 함)
        if (parsed && parsed.summary && parsed.summary.trim().length > 0) {
          console.log('[AI 스트리밍] 유효한 캐시 사용');
          setAiInterpretation(parsed);
          setCompletedCategories(new Set(['summary', 'communication', 'synergy', 'challenges', 'advice', 'timing']));
          setIsAllComplete(true);
          return;
        } else {
          // 빈 캐시 데이터는 삭제
          console.log('[AI 스트리밍] 빈 캐시 삭제');
          localStorage.removeItem(cacheKey);
        }
      } catch {
        console.log('[AI 스트리밍] 캐시 파싱 오류, 삭제');
        localStorage.removeItem(cacheKey);
      }
    }

    // 스트리밍 시작
    console.log('[AI 스트리밍] 스트리밍 호출');
    streamAllCategories();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [cacheKey, streamAllCategories]);

  // 완료 시 캐시 저장
  useEffect(() => {
    if (isAllComplete && aiInterpretation.summary) {
      localStorage.setItem(cacheKey, JSON.stringify(aiInterpretation));
    }
  }, [isAllComplete, aiInterpretation, cacheKey]);

  // Check auth status and auto-save or show login CTA
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAndSave = async () => {
      const { isAuthenticated: authStatus } = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (!authStatus) {
        // Show login CTA after a short delay for non-authenticated users
        setTimeout(() => {
          setShowLoginCTA(true);
        }, 2000);
      }
    };

    checkAndSave();
  }, []);

  // Auto-save when all streaming is complete
  useEffect(() => {
    if (!isAllComplete || hasSaved.current) return;
    if (!aiInterpretation.summary) return;

    hasSaved.current = true;

    const saveData = {
      person1: {
        name: person1.name,
        year: person1.year,
        month: person1.month,
        day: person1.day,
        hour: person1.hour,
        minute: person1.minute,
        gender: person1.gender,
        isLunar: person1.isLunar,
      },
      person2: {
        name: person2.name,
        year: person2.year,
        month: person2.month,
        day: person2.day,
        hour: person2.hour,
        minute: person2.minute,
        gender: person2.gender,
        isLunar: person2.isLunar,
      },
      relationType: relationType || "colleague",
      resultData: result,
      interpretation: aiInterpretation,
    };

    if (isAuthenticated) {
      // 로그인 사용자: DB에 저장
      autoSaveCompatibilityResult(saveData);
    } else {
      // 비로그인 사용자: localStorage에 저장
      saveLocalCompatibilityResult(
        saveData.person1,
        saveData.person2,
        saveData.relationType,
        saveData.resultData,
        saveData.interpretation
      );
    }
  }, [isAllComplete, isAuthenticated, aiInterpretation, person1, person2, relationType, result]);

  const queryString = new URLSearchParams({
    p1Name: person1.name,
    p1Year: person1.year.toString(),
    p1Month: person1.month.toString(),
    p1Day: person1.day.toString(),
    p1Hour: person1.hour.toString(),
    p1Minute: person1.minute.toString(),
    p1Gender: person1.gender,
    p1IsLunar: person1.isLunar.toString(),
    p1City: person1.city,
    p2Name: person2.name,
    p2Year: person2.year.toString(),
    p2Month: person2.month.toString(),
    p2Day: person2.day.toString(),
    p2Hour: person2.hour.toString(),
    p2Minute: person2.minute.toString(),
    p2Gender: person2.gender,
    p2IsLunar: person2.isLunar.toString(),
    p2City: person2.city,
    relationType: relationType || "colleague",
  }).toString();

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="text-center space-y-2 py-4"
        variants={itemVariants}
      >
        <motion.p
          className="text-[#3b82f6] text-sm font-medium tracking-wider"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          宮合分析
        </motion.p>
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          궁합 분석 결과
        </motion.h1>
        <TextGenerateEffect
          words={`${person1.name}님과 ${person2.name}님의 ${getRelationTypeKorean(relationType)} 궁합`}
          className="text-base text-white/60"
          duration={0.3}
        />
      </motion.div>

      {/* Score Card */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.5)" variants={itemVariants}>
        <div className="p-6 text-center">
          <motion.div
            className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.4
            }}
          >
            <span className="text-6xl font-bold text-white">
              <AnimatedCounter value={result.score} duration={2} />
            </span>
          </motion.div>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] font-bold text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Handshake className="w-5 h-5" weight="fill" />
            </motion.div>
            {result.gradeText}
          </motion.div>
        </div>
      </GlowingCard>

      {/* Two Person Pillars */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <UsersThree className="w-5 h-5 text-[#3b82f6]" weight="fill" />
            <h2 className="text-lg font-semibold text-white">두 사람의 사주</h2>
          </div>

          <PersonPillarsDisplay
            name={person1.name}
            pillars={result.person1Pillars}
            label="첫 번째"
            delay={0.1}
          />

          <motion.div
            className="border-t border-white/10 my-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />

          <PersonPillarsDisplay
            name={person2.name}
            pillars={result.person2Pillars}
            label="두 번째"
            delay={0.3}
          />
        </div>
      </GlowingCard>

      {/* Analysis Cards */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-[#3b82f6]" weight="fill" />
            <h2 className="text-lg font-semibold text-white">관계 분석</h2>
          </div>

          <div className="space-y-4">
            {[
              { icon: ChatCircle, color: "text-green-400", label: "소통", data: result.analysis.communication, delay: 0 },
              { icon: Handshake, color: "text-orange-400", label: "협업", data: result.analysis.collaboration, delay: 0.15 },
              { icon: Heart, color: "text-pink-400", label: "신뢰", data: result.analysis.trust, delay: 0.3 },
              { icon: Sparkle, color: "text-purple-400", label: "성장", data: result.analysis.growth, delay: 0.45 },
            ].map(({ icon: Icon, color, label, data, delay }) => (
              <motion.div
                key={label}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay }}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${color}`} weight="fill" />
                  <span className="text-base font-medium text-white">{label}</span>
                </div>
                <AnimatedScoreBar score={data.score} label="" delay={delay} />
                <motion.p
                  className="text-sm text-white/60"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: delay + 0.3 }}
                >
                  {data.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </GlowingCard>

      {/* AI Interpretation - 스트리밍 */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.4)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" weight="fill" />
              <h2 className="text-lg font-semibold text-white">맞춤 궁합 해석</h2>
            </div>
            {!isAllComplete && streamingCategory && (
              <motion.div
                className="flex items-center gap-2 text-xs text-blue-300"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                <span>{CATEGORY_META[streamingCategory].label} 분석 중 ({completedCategories.size + 1}/6)</span>
              </motion.div>
            )}
            {isAllComplete && aiInterpretation.summary && (
              <motion.div
                className="flex items-center gap-1 text-xs text-green-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Check className="w-4 h-4" weight="bold" />
                <span>분석 완료</span>
              </motion.div>
            )}
          </div>

          {/* 스트리밍 섹션들 */}
          <div className="space-y-3">
            {(['summary', 'communication', 'synergy', 'challenges', 'advice', 'timing'] as StreamingCategory[]).map((cat) => (
              <StreamingSection
                key={cat}
                category={cat}
                content={aiInterpretation[cat]}
                isStreaming={streamingCategory === cat}
                isComplete={completedCategories.has(cat)}
              />
            ))}
          </div>

          {/* 첫 스트리밍 시작 전 로딩 */}
          {!streamingCategory && !isAllComplete && completedCategories.size === 0 && (
            <AIAnalyzingAnimation message="AI 분석을 시작합니다..." />
          )}

          {/* 스트리밍 실패 시 재시도 버튼 */}
          {isAllComplete && !aiInterpretation.summary && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-white/60 text-sm">AI 분석을 불러오지 못했습니다.</p>
              {streamingError && (
                <p className="text-red-400/80 text-xs max-w-xs text-center">
                  오류: {streamingError}
                </p>
              )}
              <button
                onClick={() => {
                  // 상태 초기화 후 재시도
                  setAiInterpretation({
                    summary: "",
                    communication: "",
                    synergy: "",
                    challenges: "",
                    advice: "",
                    timing: "",
                  });
                  setCompletedCategories(new Set());
                  setIsAllComplete(false);
                  setStreamingCategory(null);
                  setStreamingError(null);
                  hasFetched.current = false;
                  // 캐시 삭제
                  localStorage.removeItem(cacheKey);
                  // 재시도
                  streamAllCategories();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <ArrowCounterClockwise className="w-4 h-4" weight="bold" />
                <span className="text-sm font-medium">다시 시도</span>
              </button>
            </div>
          )}
        </div>
      </GlowingCard>

      {/* Element Balance */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">오행 균형</h2>
          <div className="grid grid-cols-5 gap-2">
            {(["wood", "fire", "earth", "metal", "water"] as const).map((element, index) => {
              const person1Score = result.elementBalance.person1[element];
              const person2Score = result.elementBalance.person2[element];
              const elementColors: Record<string, string> = {
                wood: "#22c55e",
                fire: "#ef4444",
                earth: "#eab308",
                metal: "#94a3b8",
                water: "#3b82f6",
              };
              return (
                <motion.div
                  key={element}
                  className="relative group text-center"
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  {/* Element glow */}
                  <div
                    className="absolute -inset-0.5 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ background: elementColors[element] }}
                  />
                  <div className="relative p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm font-medium text-white">
                      {ELEMENT_KOREAN[element]}
                    </p>
                    <motion.p
                      className="text-base font-bold"
                      style={{ color: elementColors[element] }}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {person1Score}
                    </motion.p>
                    <p className="text-xs text-white/40">
                      vs {person2Score}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </GlowingCard>

      {/* Relationship Advice */}
      {result.relationshipAdvice.length > 0 && (
        <GlowingCard glowColor="rgba(34, 197, 94, 0.3)" variants={itemVariants}>
          <div className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-green-400">관계 조언</h2>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {result.relationshipAdvice.map((advice, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-base text-white/80"
                  variants={listItemVariants}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
                  </motion.div>
                  {advice}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </GlowingCard>
      )}

      {/* Cautions */}
      {result.cautions.length > 0 && (
        <GlowingCard glowColor="rgba(249, 115, 22, 0.3)" variants={itemVariants}>
          <div className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-orange-400">주의 사항</h2>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {result.cautions.map((caution, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-base text-white/80"
                  variants={listItemVariants}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    <Warning className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" weight="bold" />
                  </motion.div>
                  {caution}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </GlowingCard>
      )}

      {/* Actions */}
      <motion.div
        className="space-y-3 pt-4"
        variants={itemVariants}
      >
        <Link href={`/compatibility/detail-result?${queryString}`} className="block">
          <motion.button
            className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkle className="w-5 h-5" weight="fill" />
            전통 명리학 상세 분석 보기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </motion.button>
        </Link>
        <div className="flex gap-3">
          <Link href="/compatibility" className="flex-1">
            <motion.button
              className="w-full h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowCounterClockwise className="w-5 h-5" />
              <span className="text-base font-medium">다시 분석</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        className="text-center text-sm text-white/40 pt-2 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.
      </motion.p>

      {/* Login CTA Modal for non-authenticated users */}
      <LoginCTAModal
        open={showLoginCTA}
        onOpenChange={setShowLoginCTA}
        resultType="compatibility"
        onSuccess={() => {
          // After login, save the result
          hasSaved.current = false;
          hasCheckedAuth.current = false;
          setIsAuthenticated(null);
        }}
      />

    </motion.div>
  );
}
