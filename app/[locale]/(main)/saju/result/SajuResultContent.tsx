"use client";

import { Link, useRouter } from "@/lib/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { ArrowCounterClockwise, ArrowRight, Sparkle, Star, Atom, YinYang, ChatCircle, Lightning, Heart, Lightbulb, Brain, CheckCircle, ChatCircleDots, RocketLaunch, Chats, Crown, CalendarBlank } from "@phosphor-icons/react";
import { calculateSaju, STEM_KOREAN, ELEMENT_KOREAN } from "@/lib/saju";
import { getLongitudeByCity } from "@/lib/saju/solar-time";
import { FourPillarsDisplay } from "@/components/saju/pillar-display";
import { ElementChart } from "@/components/saju/element-chart";
import { TenGodDisplay } from "@/components/saju/ten-god-display";
import { StarsDisplay } from "@/components/saju/stars-display";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { DownloadPDFButton } from "@/components/auth/DownloadPDFButton";
import { ShareButton } from "@/components/auth/ShareButton";
import { LoginCTAModal } from "@/components/auth/LoginCTAModal";
import { autoSaveSajuResult } from "@/lib/actions/saju";
import { saveLocalSajuResult } from "@/lib/local-history";
import { InlineSajuChat } from "@/components/saju/InlineSajuChat";
import { MajorFortuneSection, MajorFortuneData } from "@/components/saju/FortunePanel";
import { createClient } from "@/lib/supabase/client";
import type { Gender } from "@/lib/saju/types";

// Tab types for content switching
type ContentTab = "analysis" | "chat";

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

interface BasicInterpretation {
  personalityReading?: {
    summary?: string;
    coreTraits?: string[];
    strengths?: string[];
    challenges?: string[];
  };
  elementInsight?: {
    balance?: string;
    recommendation?: string;
  };
  tenGodInsight?: {
    dominant?: string;
    lifePattern?: string;
  };
  starInsight?: {
    positive?: string;
    caution?: string;
  };
  overallMessage?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

// Glowing card wrapper
function GlowingCard({
  children,
  className = "",
  glowColor = "rgba(168, 85, 247, 0.4)",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  variants?: typeof itemVariants;
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
      <div className="relative bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

// Impressive loading animation for AI interpretation
function AIAnalyzingAnimation() {
  const messages = [
    "사주팔자를 분석하고 있습니다...",
    "오행의 균형을 살펴보고 있습니다...",
    "십성의 배치를 해석하고 있습니다...",
    "신살의 영향을 파악하고 있습니다...",
    "운명의 흐름을 읽고 있습니다...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12 space-y-8">
      {/* Animated brain/thinking icon */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Outer pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Middle pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          {/* Center icon container */}
          <motion.div
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center border-2 border-pink-500/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="w-16 h-16 text-pink-400" weight="fill" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Animated message */}
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-center"
      >
        <p className="text-text-primary text-lg font-medium">{messages[messageIndex]}</p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-pink-400"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: i === messageIndex ? 1 : 0.3,
              scale: i === messageIndex ? 1.3 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Floating elements */}
      <div className="flex justify-center gap-6 pt-4">
        {["木", "火", "土", "金", "水"].map((element, idx) => (
          <motion.span
            key={element}
            className="text-2xl opacity-50"
            animate={{
              y: [0, -12, 0],
              opacity: [0.5, 0.9, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: idx * 0.2,
              ease: "easeInOut"
            }}
          >
            {element}
          </motion.span>
        ))}
      </div>
    </div>
  );
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

  const longitude = getLongitudeByCity(city);

  // Tab state for switching between analysis and chat
  const [activeTab, setActiveTab] = useState<ContentTab>("analysis");

  // Memoize to prevent infinite useEffect loop
  const result = useMemo(() => calculateSaju({
    year,
    month,
    day,
    hour,
    minute,
    gender,
    isLunar,
    longitude,
  }), [year, month, day, hour, minute, gender, isLunar, longitude]);

  const [interpretation, setInterpretation] = useState<BasicInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showLoginCTA, setShowLoginCTA] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | undefined>(undefined);
  const [isPremium, setIsPremium] = useState(false);
  const [majorData, setMajorData] = useState<MajorFortuneData | null>(null);
  const hasFetched = useRef(false);
  const hasSaved = useRef(false);
  const router = useRouter();

  // Check premium status on mount
  useEffect(() => {
    const checkPremium = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_tier, subscription_expires_at')
          .eq('id', user.id)
          .single();

        const isPremiumActive =
          profile?.subscription_tier === 'premium' &&
          profile.subscription_expires_at &&
          new Date(profile.subscription_expires_at) > new Date();

        setIsPremium(isPremiumActive || false);
      }
    };

    checkPremium();
  }, []);

  // Fetch major fortune when savedResultId is available
  useEffect(() => {
    if (!savedResultId || !isPremium) return;

    const fetchMajorFortune = async () => {
      try {
        const res = await fetch(`/api/saju/fortune/major?shareId=${savedResultId}`);
        const json = await res.json();
        if (json.success) {
          setMajorData(json.data);
        }
      } catch (err) {
        console.error("Major fortune error:", err);
      }
    };

    fetchMajorFortune();
  }, [savedResultId, isPremium]);

  // Create cache key from saju input
  const cacheKey = useMemo(() =>
    `saju_interpretation_${year}_${month}_${day}_${hour}_${minute}_${gender}_${isLunar}_${city}`,
    [year, month, day, hour, minute, gender, isLunar, city]
  );

  // Fetch AI interpretation on mount (with caching)
  useEffect(() => {
    // Prevent double fetch in React Strict Mode
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Check cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setInterpretation(parsed);
        setIsLoading(false);
        console.log('Loaded from cache');
        return;
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    const fetchInterpretation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sajuData = {
          dayMaster: result.dayMaster,
          dayMasterDescription: result.dayMasterDescription,
          pillars: {
            year: `${result.pillars.year.ganZhi} (${result.pillars.year.koreanReading})`,
            month: `${result.pillars.month.ganZhi} (${result.pillars.month.koreanReading})`,
            day: `${result.pillars.day.ganZhi} (${result.pillars.day.koreanReading})`,
            time: `${result.pillars.time.ganZhi} (${result.pillars.time.koreanReading})`,
          },
          elementScores: result.elementAnalysis.scores,
          elementBalance: result.elementAnalysis.balance,
          dominantElements: result.elementAnalysis.dominant.map(e => ELEMENT_KOREAN[e]),
          lackingElements: result.elementAnalysis.lacking.map(e => ELEMENT_KOREAN[e]),
          yongShin: result.elementAnalysis.yongShin,
          dominantTenGods: result.tenGodSummary.dominant,
          stars: result.stars.map(s => ({
            name: s.name,
            type: s.type === 'auspicious' ? '길신' : '흉신',
            description: s.description,
          })),
          gender,
        };

        const response = await fetch('/api/saju/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sajuData, locale: 'ko' }),
        });

        if (!response.ok) {
          throw new Error('해석을 불러오는데 실패했습니다.');
        }

        const data = await response.json();

        // Check if response has error
        if (data.error) {
          throw new Error(data.error);
        }

        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log('Saved to cache');

        setInterpretation(data);
      } catch (err) {
        console.error('Interpretation error:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterpretation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-save to database when interpretation is ready
  useEffect(() => {
    // Only save once, after interpretation is loaded
    if (hasSaved.current || isLoading || !interpretation) return;
    hasSaved.current = true;

    const saveResult = async () => {
      setSaveStatus('saving');

      const response = await autoSaveSajuResult({
        birthData: {
          year,
          month,
          day,
          hour,
          minute,
          gender,
          isLunar,
          city,
        },
        resultData: result,
        interpretation,
      });

      if (response.success) {
        setSaveStatus('saved');
        setSavedResultId(response.resultId);
        // Hide notification after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else if (response.error === 'Not authenticated') {
        // User not logged in - save to localStorage instead
        saveLocalSajuResult(
          {
            year,
            month,
            day,
            hour,
            minute,
            gender,
            isLunar,
            city,
          },
          result,
          interpretation
        );
        setSaveStatus('idle');
        // Show login CTA after a delay
        setTimeout(() => {
          setShowLoginCTA(true);
        }, 2000);
      } else {
        console.error('[AutoSave] Error:', response.error);
        setSaveStatus('error');
      }
    };

    saveResult();
  }, [interpretation, isLoading, year, month, day, hour, minute, gender, isLunar, city, result]);

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
          className="text-brand-accent text-sm font-medium tracking-wider"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          四柱八字
        </motion.p>
        <motion.h1
          className="text-2xl font-bold text-text-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          사주 분석 결과
        </motion.h1>
        <TextGenerateEffect
          words={`${result.meta.solarDate} (${gender === "male" ? "남" : "여"})`}
          className="text-base text-text-secondary"
          duration={0.3}
        />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="flex gap-1 p-1 bg-background-secondary rounded-xl border border-border"
        variants={itemVariants}
      >
        <button
          onClick={() => setActiveTab("analysis")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === "analysis"
              ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg"
              : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
          }`}
        >
          <Sparkle className="w-4 h-4 flex-shrink-0" weight="fill" />
          <span className="whitespace-nowrap">분석</span>
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === "chat"
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
              : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
          }`}
        >
          <ChatCircleDots className="w-4 h-4 flex-shrink-0" weight="fill" />
          <span className="whitespace-nowrap">AI 상담</span>
        </button>
      </motion.div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <InlineSajuChat sajuResult={result} gender={gender} interpretation={interpretation ?? undefined} />
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: 20 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.05,
                },
              },
            }}
            className="space-y-6"
          >
      {/* Four Pillars - First */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.4)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Atom className="w-5 h-5 text-brand-accent" weight="fill" />
            <h2 className="font-semibold text-text-primary text-lg">사주팔자</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <FourPillarsDisplay pillars={result.pillars} />
          </motion.div>
          <motion.div
            className="text-center pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs text-text-muted">
              진태양시 보정: {result.meta.trueSolarTime} (
              {result.meta.offsetMinutes > 0 ? "+" : ""}
              {result.meta.offsetMinutes}분)
            </p>
          </motion.div>
        </div>
      </GlowingCard>

      {/* Day Master Info */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.5)" variants={itemVariants}>
        <div className="p-5 space-y-3">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <YinYang className="w-5 h-5 text-brand-accent" weight="fill" />
            <h2 className="font-semibold text-text-primary text-lg">일간 (일주)</h2>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.5
              }}
              whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
            >
              {result.dayMaster}
            </motion.div>
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="font-medium text-text-primary text-lg">
                {STEM_KOREAN[result.dayMaster]} ({ELEMENT_KOREAN[result.dayMasterElement]})
              </p>
              <p className="text-base text-text-secondary">
                {result.dayMasterYinYang === "yang" ? "양" : "음"}의 기운
              </p>
            </motion.div>
          </div>
        </div>
      </GlowingCard>

      {/* Five Elements */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Star className="w-5 h-5 text-brand-accent" weight="fill" />
              <h2 className="font-semibold text-text-primary text-lg">오행 분석</h2>
            </motion.div>
            <motion.span
              className="text-xs px-3 py-1 rounded-full bg-[#a855f7]/20 text-brand-accent"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              {result.elementAnalysis.balance}
            </motion.span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ElementChart
              scores={result.elementAnalysis.scores}
              dominant={result.elementAnalysis.dominant}
              lacking={result.elementAnalysis.lacking}
            />
          </motion.div>
          {result.elementAnalysis.yongShin && (
            <motion.div
              className="pt-3 border-t border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-sm text-text-muted">추천 용신</p>
              <motion.p
                className="text-base font-medium text-brand-accent"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                {result.elementAnalysis.yongShin}
              </motion.p>
            </motion.div>
          )}
        </div>
      </GlowingCard>

      {/* Ten Gods */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Sparkle className="w-5 h-5 text-brand-accent" weight="fill" />
            <h2 className="font-semibold text-text-primary text-lg">십성 분석</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <TenGodDisplay summary={result.tenGodSummary} />
          </motion.div>
        </div>
      </GlowingCard>

      {/* Stars */}
      <GlowingCard glowColor="rgba(234, 179, 8, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Star className="w-5 h-5 text-amber-600" weight="fill" />
            <h2 className="font-semibold text-text-primary text-lg">
              신살 ({result.stars.length})
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <StarsDisplay stars={result.stars} />
          </motion.div>
        </div>
      </GlowingCard>

      {/* Major Fortune (대운) */}
      <GlowingCard glowColor="rgba(99, 102, 241, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 }}
          >
            <CalendarBlank className="w-5 h-5 text-indigo-400" weight="fill" />
            <h2 className="font-semibold text-text-primary text-lg">대운</h2>
            {!isPremium && (
              <Crown className="w-4 h-4 text-amber-600 ml-1" weight="fill" />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <MajorFortuneSection
              data={majorData}
              birthYear={year}
              isPremium={isPremium}
              onUpgradeClick={() => router.push('/premium')}
            />
          </motion.div>
        </div>
      </GlowingCard>

      {/* AI Interpretation - At the bottom, after user reads basic info */}
      <div>
        <GlowingCard glowColor="rgba(236, 72, 153, 0.4)" variants={itemVariants}>
          <div className="p-5 space-y-4">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
            >
              <ChatCircle className="w-5 h-5 text-pink-400" weight="fill" />
              <h2 className="font-semibold text-text-primary text-lg">사주 풀이</h2>
            </motion.div>

            {isLoading ? (
              <AIAnalyzingAnimation />
            ) : error ? (
              <div className="py-6 text-center">
                <p className="text-text-secondary text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 rounded-lg bg-pink-500/20 text-pink-300 text-sm hover:bg-pink-500/30 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : interpretation ? (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Overall Message */}
                {interpretation.overallMessage && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                    <p className="text-text-primary text-base leading-relaxed">
                      {typeof interpretation.overallMessage === 'string'
                        ? interpretation.overallMessage
                        : '사주 해석이 완료되었습니다.'}
                    </p>
                  </div>
                )}

                {/* Personality */}
                {interpretation.personalityReading && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" weight="fill" />
                      <h3 className="text-sm font-medium text-text-primary">성격과 기질</h3>
                    </div>
                    {interpretation.personalityReading.summary && (
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {typeof interpretation.personalityReading.summary === 'string'
                          ? interpretation.personalityReading.summary
                          : ''}
                      </p>
                    )}
                    {interpretation.personalityReading.coreTraits && Array.isArray(interpretation.personalityReading.coreTraits) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {interpretation.personalityReading.coreTraits.map((trait, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs"
                          >
                            {typeof trait === 'string' ? trait : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Strengths & Challenges */}
                {interpretation.personalityReading && (interpretation.personalityReading.strengths || interpretation.personalityReading.challenges) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-400 font-medium mb-2">강점</p>
                      <ul className="space-y-1">
                        {Array.isArray(interpretation.personalityReading.strengths) && interpretation.personalityReading.strengths.map((s, idx) => (
                          <li key={idx} className="text-xs text-text-secondary">• {typeof s === 'string' ? s : ''}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <p className="text-xs text-orange-600 font-medium mb-2">주의점</p>
                      <ul className="space-y-1">
                        {Array.isArray(interpretation.personalityReading.challenges) && interpretation.personalityReading.challenges.map((c, idx) => (
                          <li key={idx} className="text-xs text-text-secondary">• {typeof c === 'string' ? c : ''}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Element Insight */}
                {interpretation.elementInsight && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightning className="w-4 h-4 text-amber-600" weight="fill" />
                      <h3 className="text-sm font-medium text-text-primary">오행의 기운</h3>
                    </div>
                    {interpretation.elementInsight.balance && (
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {typeof interpretation.elementInsight.balance === 'string'
                          ? interpretation.elementInsight.balance
                          : ''}
                      </p>
                    )}
                    {interpretation.elementInsight.recommendation && (
                      <p className="text-xs text-purple-300 italic">
                        {typeof interpretation.elementInsight.recommendation === 'string'
                          ? interpretation.elementInsight.recommendation
                          : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Ten God & Star Insights */}
                {interpretation.tenGodInsight && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-400" weight="fill" />
                      <h3 className="text-sm font-medium text-text-primary">삶의 패턴</h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {typeof interpretation.tenGodInsight.dominant === 'string' ? interpretation.tenGodInsight.dominant : ''}{' '}
                      {typeof interpretation.tenGodInsight.lifePattern === 'string' ? interpretation.tenGodInsight.lifePattern : ''}
                    </p>
                  </div>
                )}

                {/* Star Insights */}
                {interpretation.starInsight && (interpretation.starInsight.positive || interpretation.starInsight.caution) && (
                  <div className="p-3 rounded-xl bg-background-secondary space-y-2">
                    {interpretation.starInsight.positive && typeof interpretation.starInsight.positive === 'string' && (
                      <p className="text-xs text-green-300">
                        {interpretation.starInsight.positive}
                      </p>
                    )}
                    {interpretation.starInsight.caution && typeof interpretation.starInsight.caution === 'string' && (
                      <p className="text-xs text-orange-300">
                        {interpretation.starInsight.caution}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ) : null}
          </div>
        </GlowingCard>
      </div>

      {/* AI Chat CTA Section - Prominent feature highlight */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.5)" variants={itemVariants}>
        <div className="p-6 space-y-5">
          {/* Header with animated icon */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                  "0 10px 30px -5px rgba(59, 130, 246, 0.5)",
                  "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChatCircleDots className="w-6 h-6 text-white" weight="fill" />
            </motion.div>
            <div>
              <h2 className="font-bold text-text-primary text-lg">AI 사주 상담</h2>
              <p className="text-sm text-blue-300">나만의 사주 전문가와 대화하세요</p>
            </div>
          </motion.div>

          {/* Value proposition */}
          <motion.div
            className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <p className="text-text-primary text-sm leading-relaxed">
              방금 분석한 <span className="text-blue-300 font-semibold">당신의 사주 데이터</span>를 기반으로
              연애, 직업, 재물, 건강 등 <span className="text-cyan-300 font-semibold">맞춤형 상담</span>을
              AI가 즉시 답변해드립니다.
            </p>
          </motion.div>

          {/* Suggested questions */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <Chats className="w-4 h-4" />
              이런 것들을 물어볼 수 있어요
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "올해 연애운은?",
                "이직해도 될까요?",
                "재테크 조언",
                "건강 주의점",
              ].map((question, idx) => (
                <motion.span
                  key={question}
                  className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-200 text-xs border border-blue-500/30 hover:bg-blue-500/30 transition-colors cursor-default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.15 + idx * 0.05 }}
                >
                  {question}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <Link href={`/saju/chat?${queryString}`} className="block">
            <motion.button
              className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center gap-3 text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <RocketLaunch className="w-5 h-5" weight="fill" />
              AI 상담 시작하기
              <ArrowRight className="w-5 h-5" weight="bold" />
            </motion.button>
          </Link>

          {/* Trust badge */}
          <motion.p
            className="text-center text-xs text-text-muted flex items-center justify-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <Sparkle className="w-3.5 h-3.5 text-blue-400" weight="fill" />
            Google AI 기반 실시간 맞춤 상담
          </motion.p>
        </div>
      </GlowingCard>

      {/* Share Actions */}
      <motion.div
        className="grid grid-cols-2 gap-2 pt-4"
        variants={itemVariants}
      >
        <DownloadPDFButton
          birthData={{
            year,
            month,
            day,
            hour,
            minute,
            gender,
            isLunar,
            city,
          }}
          result={result}
          className="w-full h-12 bg-background-secondary border border-border hover:bg-background-tertiary text-text-primary text-xs sm:text-sm whitespace-nowrap px-2"
        />
        <ShareButton
          resultId={savedResultId}
          birthData={{
            year,
            month,
            day,
            hour,
            minute,
            gender,
            isLunar,
            city,
          }}
          resultData={{ ...result, interpretation }}
          className="w-full h-12 text-xs sm:text-sm whitespace-nowrap px-2"
        />
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex gap-3 pt-2"
        variants={itemVariants}
      >
        <Link href={`/saju?${queryString}`} className="flex-1">
          <motion.button
            className="w-full h-14 rounded-xl bg-background-secondary border border-border flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowCounterClockwise className="w-5 h-5" />
            <span className="font-medium">다시 분석</span>
          </motion.button>
        </Link>
        <Link href={`/saju/fortune?${queryString}`} className="flex-1">
          <motion.button
            className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center gap-2 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            상세 운세 보기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        className="text-center text-xs text-text-muted pt-2 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.
      </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save notification */}
      <AnimatePresence>
        {saveStatus === 'saved' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/90 text-white text-sm shadow-lg">
              <CheckCircle className="w-4 h-4" weight="fill" />
              <span>기록에 저장됨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login CTA Modal */}
      <LoginCTAModal
        open={showLoginCTA}
        onOpenChange={setShowLoginCTA}
        onSuccess={() => {
          // Re-trigger save after login
          hasSaved.current = false;
        }}
        resultType="saju"
      />

    </motion.div>
  );
}
