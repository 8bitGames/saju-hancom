"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Clock,
  CalendarBlank,
  Star,
  Lightning,
  TrendUp,
  Warning,
  CheckCircle,
  ArrowRight,
  Sparkle,
  Timer,
  Crown,
  Lock,
} from "@phosphor-icons/react";
import type { Element } from "@/lib/saju/types";

// ============================================================================
// Types
// ============================================================================

interface FortuneGrade {
  grade: "excellent" | "good" | "normal" | "caution";
  score: number;
}

interface HourlyFortune {
  timeRange: string;
  periodName: string;
  pillar: {
    stem: string;
    branch: string;
    stemKorean: string;
    branchKorean: string;
  };
  score: number;
  grade: string;
  description: string;
  goodFor: string[];
  avoidFor: string[];
}

interface DailyFortuneData {
  date: string;
  pillar: {
    stem: string;
    branch: string;
    stemKorean: string;
    branchKorean: string;
    element: Element;
    elementKorean: string;
  };
  analysis: {
    score: number;
    grade: string;
    theme: string;
    description: string;
    opportunities: string[];
    challenges: string[];
    advice: string;
  };
  recommendedActivities: string[];
  activitiesToAvoid: string[];
}

interface MajorFortunePillar {
  order: number;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  pillar: {
    stem: string;
    branch: string;
    stemKorean: string;
    branchKorean: string;
  };
  analysis: {
    score: number;
    grade: string;
    theme: string;
    description: string;
  };
  keywords: string[];
}

interface MajorFortuneData {
  startAge: number;
  direction: "forward" | "backward";
  currentIndex: number;
  fortunes: MajorFortunePillar[];
}

interface FortunePanelProps {
  shareId?: string;
  birthYear: number;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
  isLoadingShareId?: boolean;
}

// ============================================================================
// Sub Components
// ============================================================================

function GradeIcon({ grade }: { grade: string }) {
  switch (grade) {
    case "excellent":
      return <Star className="w-5 h-5 text-yellow-400" weight="fill" />;
    case "good":
      return <TrendUp className="w-5 h-5 text-green-400" weight="fill" />;
    case "normal":
      return <CheckCircle className="w-5 h-5 text-blue-400" weight="fill" />;
    case "caution":
      return <Warning className="w-5 h-5 text-orange-400" weight="fill" />;
    default:
      return <CheckCircle className="w-5 h-5 text-white/40" />;
  }
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const gradeConfig: Record<string, { bg: string; text: string; label: string }> = {
    excellent: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "대길" },
    good: { bg: "bg-green-500/20", text: "text-green-400", label: "길" },
    normal: { bg: "bg-blue-500/20", text: "text-blue-400", label: "평" },
    caution: { bg: "bg-orange-500/20", text: "text-orange-400", label: "주의" },
  };

  const config = gradeConfig[grade] || gradeConfig.normal;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
      <GradeIcon grade={grade} />
      <span className={`text-sm font-bold ${config.text}`}>{config.label}</span>
      <span className="text-xs text-white/50">{score}점</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-purple-500/30 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

function PremiumLock({ onUpgradeClick }: { onUpgradeClick?: () => void }) {
  return (
    <div className="relative">
      {/* Blurred content placeholder */}
      <div className="filter blur-sm opacity-50 pointer-events-none">
        <div className="space-y-3">
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="h-32 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl">
        <div className="text-center space-y-4 p-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
            <Crown className="w-8 h-8 text-yellow-400" weight="fill" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">프리미엄 전용</h3>
            <p className="text-sm text-white/60">
              시운과 대운 분석은 프리미엄 회원만 이용 가능합니다
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
          >
            <Lock className="w-4 h-4" />
            프리미엄 구독하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Daily Fortune Section
// ============================================================================

function DailyFortuneSection({ data }: { data: DailyFortuneData | null }) {
  if (!data) {
    return <LoadingSpinner />;
  }

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[today.getDay()];

  return (
    <div className="space-y-4">
      {/* Date & Pillar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm">{dateStr} ({weekday})</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-white">
              {data.pillar.stem}{data.pillar.branch}
            </span>
            <span className="text-white/60">
              ({data.pillar.stemKorean}{data.pillar.branchKorean})
            </span>
          </div>
        </div>
        <GradeBadge grade={data.analysis.grade} score={data.analysis.score} />
      </div>

      {/* Theme & Description */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-2">{data.analysis.theme}</h3>
        <p className="text-sm text-white/70 leading-relaxed">
          {data.analysis.description}
        </p>
      </div>

      {/* Opportunities & Challenges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
            <TrendUp className="w-3.5 h-3.5" weight="fill" />
            좋은 기회
          </p>
          <ul className="space-y-1">
            {data.analysis.opportunities.map((item, idx) => (
              <li key={idx} className="text-xs text-white/70">• {item}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-xs text-orange-400 font-medium mb-2 flex items-center gap-1">
            <Warning className="w-3.5 h-3.5" weight="fill" />
            주의할 점
          </p>
          <ul className="space-y-1">
            {data.analysis.challenges.map((item, idx) => (
              <li key={idx} className="text-xs text-white/70">• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advice */}
      {data.analysis.advice && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-purple-300 flex items-center gap-1">
            <Sparkle className="w-3.5 h-3.5" weight="fill" />
            {data.analysis.advice}
          </p>
        </div>
      )}

      {/* Activities */}
      <div className="space-y-2">
        {data.recommendedActivities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.recommendedActivities.map((activity, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-300 text-xs border border-green-500/20"
              >
                ✓ {activity}
              </span>
            ))}
          </div>
        )}
        {data.activitiesToAvoid.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.activitiesToAvoid.map((activity, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-300 text-xs border border-red-500/20"
              >
                ✗ {activity}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Hourly Fortune Section
// ============================================================================

function HourlyFortuneSection({
  data,
  isPremium,
  onUpgradeClick,
}: {
  data: HourlyFortune[] | null;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}) {
  if (!isPremium) {
    return <PremiumLock onUpgradeClick={onUpgradeClick} />;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  // 현재 시간 찾기
  const now = new Date();
  const currentHour = now.getHours();
  const currentPeriodIndex = Math.floor(((currentHour + 1) % 24) / 2);

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50 flex items-center gap-2">
        <Timer className="w-4 h-4" />
        12시진별 운세 (현재: {data[currentPeriodIndex]?.periodName || "알 수 없음"})
      </p>

      <div className="grid grid-cols-3 gap-2">
        {data.map((hourly, idx) => {
          const isCurrent = idx === currentPeriodIndex;
          const gradeColors: Record<string, string> = {
            excellent: "border-yellow-500/50 bg-yellow-500/10",
            good: "border-green-500/50 bg-green-500/10",
            normal: "border-blue-500/50 bg-blue-500/10",
            caution: "border-orange-500/50 bg-orange-500/10",
          };

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? "ring-2 ring-purple-500 " + (gradeColors[hourly.grade] || "border-white/10")
                  : gradeColors[hourly.grade] || "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white">
                  {hourly.periodName}
                </span>
                {isCurrent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500 text-white">
                    NOW
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/40 mb-1">{hourly.timeRange}</p>
              <div className="flex items-center gap-1">
                <GradeIcon grade={hourly.grade} />
                <span className="text-xs text-white/60">{hourly.score}점</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 현재 시간대 상세 */}
      {data[currentPeriodIndex] && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 mt-4">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            지금 시간대 ({data[currentPeriodIndex].periodName})
          </h4>
          <p className="text-sm text-white/70 mb-3">
            {data[currentPeriodIndex].description}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-green-400 mb-1">좋은 활동</p>
              <ul className="space-y-0.5">
                {data[currentPeriodIndex].goodFor.map((item, idx) => (
                  <li key={idx} className="text-xs text-white/60">• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-orange-400 mb-1">피할 활동</p>
              <ul className="space-y-0.5">
                {data[currentPeriodIndex].avoidFor.map((item, idx) => (
                  <li key={idx} className="text-xs text-white/60">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Major Fortune Section
// ============================================================================

function MajorFortuneSection({
  data,
  birthYear,
  isPremium,
  onUpgradeClick,
}: {
  data: MajorFortuneData | null;
  birthYear: number;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}) {
  if (!isPremium) {
    return <PremiumLock onUpgradeClick={onUpgradeClick} />;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear + 1; // 한국 나이

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">
            대운수 {data.startAge}세 시작 ({data.direction === "forward" ? "순행" : "역행"})
          </p>
          <p className="text-xs text-white/40">현재 나이: {currentAge}세</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

        <div className="space-y-3">
          {data.fortunes.map((fortune, idx) => {
            const isCurrent = idx === data.currentIndex;
            const isPast = idx < data.currentIndex;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative pl-10 ${isPast ? "opacity-50" : ""}`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-2 top-4 w-4 h-4 rounded-full border-2 ${
                    isCurrent
                      ? "bg-purple-500 border-purple-400 ring-4 ring-purple-500/30"
                      : isPast
                      ? "bg-white/20 border-white/30"
                      : "bg-white/10 border-white/20"
                  }`}
                />

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-purple-500/10 border-purple-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">
                        {fortune.pillar.stem}{fortune.pillar.branch}
                      </span>
                      <span className="text-sm text-white/50">
                        ({fortune.pillar.stemKorean}{fortune.pillar.branchKorean})
                      </span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500 text-white">
                          현재
                        </span>
                      )}
                    </div>
                    <GradeBadge grade={fortune.analysis.grade} score={fortune.analysis.score} />
                  </div>

                  <p className="text-xs text-white/40 mb-2">
                    {fortune.startAge}세 ~ {fortune.endAge}세 ({fortune.startYear} ~ {fortune.endYear})
                  </p>

                  <p className="text-sm font-medium text-white mb-1">
                    {fortune.analysis.theme}
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {fortune.analysis.description}
                  </p>

                  {fortune.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {fortune.keywords.map((keyword, kidx) => (
                        <span
                          key={kidx}
                          className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

type FortuneTab = "daily" | "hourly" | "major";

export function FortunePanel({
  shareId,
  birthYear,
  isPremium = false,
  onUpgradeClick,
  isLoadingShareId = false,
}: FortunePanelProps) {
  const [activeTab, setActiveTab] = useState<FortuneTab>("daily");
  const [dailyData, setDailyData] = useState<DailyFortuneData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyFortune[] | null>(null);
  const [majorData, setMajorData] = useState<MajorFortuneData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyFortune = useCallback(async () => {
    if (!shareId) return;

    try {
      const res = await fetch(`/api/saju/fortune/daily?shareId=${shareId}`);
      const json = await res.json();
      if (json.success) {
        setDailyData(json.data);
      }
    } catch (err) {
      console.error("Daily fortune error:", err);
    }
  }, [shareId]);

  const fetchHourlyFortune = useCallback(async () => {
    if (!shareId || !isPremium) return;

    try {
      const res = await fetch(`/api/saju/fortune/hourly?shareId=${shareId}`);
      const json = await res.json();
      if (json.success) {
        setHourlyData(json.data.hourlyFortunes);
      }
    } catch (err) {
      console.error("Hourly fortune error:", err);
    }
  }, [shareId, isPremium]);

  const fetchMajorFortune = useCallback(async () => {
    if (!shareId || !isPremium) return;

    try {
      const res = await fetch(`/api/saju/fortune/major?shareId=${shareId}`);
      const json = await res.json();
      if (json.success) {
        setMajorData(json.data);
      }
    } catch (err) {
      console.error("Major fortune error:", err);
    }
  }, [shareId, isPremium]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDailyFortune(),
        fetchHourlyFortune(),
        fetchMajorFortune(),
      ]);
      setIsLoading(false);
    };

    fetchAll();
  }, [fetchDailyFortune, fetchHourlyFortune, fetchMajorFortune]);

  const tabs: { key: FortuneTab; label: string; icon: React.ReactNode; premium?: boolean }[] = [
    { key: "daily", label: "오늘의 운", icon: <Sun className="w-4 h-4" weight="fill" /> },
    { key: "hourly", label: "시운", icon: <Clock className="w-4 h-4" weight="fill" />, premium: true },
    { key: "major", label: "대운", icon: <CalendarBlank className="w-4 h-4" weight="fill" />, premium: true },
  ];

  if (!shareId) {
    return (
      <div className="p-8 text-center space-y-4">
        {isLoadingShareId ? (
          <>
            <LoadingSpinner />
            <p className="text-white/60 text-sm">운세 데이터를 준비하고 있습니다...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Sun className="w-8 h-8 text-amber-400" weight="fill" />
            </div>
            <p className="text-white/80 font-medium">운세 분석 준비 중</p>
            <p className="text-white/50 text-sm">
              사주 분석이 저장되면 오늘의 운세를 확인할 수 있습니다
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.premium && !isPremium && (
              <Crown className="w-3 h-3 text-yellow-400" weight="fill" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          {activeTab === "daily" && (
            <DailyFortuneSection data={dailyData} />
          )}
          {activeTab === "hourly" && (
            <HourlyFortuneSection
              data={hourlyData}
              isPremium={isPremium}
              onUpgradeClick={onUpgradeClick}
            />
          )}
          {activeTab === "major" && (
            <MajorFortuneSection
              data={majorData}
              birthYear={birthYear}
              isPremium={isPremium}
              onUpgradeClick={onUpgradeClick}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
