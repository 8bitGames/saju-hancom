"use client";

import { useState, useEffect, useCallback, memo } from "react";
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
  Leaf,
  Heartbeat,
} from "@phosphor-icons/react";
import { LifestyleFortune } from "./LifestyleFortune";
import { BiorhythmChart } from "./BiorhythmChart";
import { FortuneCalendar } from "./FortuneCalendar";
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
  pillar?: {
    stem: string;
    branch: string;
    stemKorean: string;
    branchKorean: string;
  };
  pillarKorean?: string;
  score: number;
  grade: string;
  description?: string;
  goodFor?: string[];
  avoidFor?: string[];
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

export interface MajorFortunePillar {
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
  analysis?: {
    score: number;
    grade: string;
    theme?: string;
    description?: string;
  };
  keywords?: string[];
}

export interface MajorFortuneData {
  startAge: number;
  direction: "forward" | "backward";
  currentIndex: number;
  fortunes?: MajorFortunePillar[];
}

interface FortunePanelProps {
  shareId?: string;
  birthYear: number;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
  isLoadingShareId?: boolean;
}

// ============================================================================
// Constants (moved outside components to avoid recreation on each render)
// ============================================================================

const GRADE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  excellent: { bg: "bg-yellow-100", text: "text-yellow-600", label: "대길" },
  good: { bg: "bg-green-100", text: "text-green-600", label: "길" },
  normal: { bg: "bg-blue-100", text: "text-blue-600", label: "평" },
  caution: { bg: "bg-orange-100", text: "text-orange-600", label: "주의" },
};

const GRADE_COLORS: Record<string, string> = {
  excellent: "border-yellow-300 bg-yellow-50",
  good: "border-green-300 bg-green-50",
  normal: "border-blue-300 bg-blue-50",
  caution: "border-orange-300 bg-orange-50",
};

// ============================================================================
// Sub Components
// ============================================================================

function GradeIcon({ grade }: { grade: string }) {
  switch (grade) {
    case "excellent":
      return <Star className="w-5 h-5 text-yellow-500" weight="fill" />;
    case "good":
      return <TrendUp className="w-5 h-5 text-green-500" weight="fill" />;
    case "normal":
      return <CheckCircle className="w-5 h-5 text-blue-500" weight="fill" />;
    case "caution":
      return <Warning className="w-5 h-5 text-orange-500" weight="fill" />;
    default:
      return <CheckCircle className="w-5 h-5 text-gray-400" />;
  }
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.normal;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
      <GradeIcon grade={grade} />
      <span className={`text-sm font-bold ${config.text}`}>{config.label}</span>
      <span className="text-xs text-gray-500">{score}점</span>
    </div>
  );
}

// 운세 로딩 애니메이션 - 점술사가 운세를 보는 느낌
function FortuneLoadingAnimation() {
  // 오행 심볼
  const elements = ["木", "火", "土", "金", "水"];
  // 천간 심볼
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const [stemIndex, setStemIndex] = useState(0);

  // 별 위치 고정 (SSR 호환)
  const starPositions = [
    { left: 10, top: 15 }, { left: 85, top: 20 }, { left: 25, top: 80 },
    { left: 70, top: 10 }, { left: 45, top: 90 }, { left: 90, top: 60 },
    { left: 5, top: 50 }, { left: 60, top: 75 }, { left: 35, top: 25 },
    { left: 80, top: 85 }, { left: 15, top: 70 }, { left: 55, top: 5 },
    { left: 95, top: 40 }, { left: 40, top: 55 }, { left: 20, top: 35 },
    { left: 75, top: 45 }, { left: 30, top: 60 }, { left: 65, top: 30 },
    { left: 50, top: 15 }, { left: 12, top: 88 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStemIndex((prev) => (prev + 1) % stems.length);
    }, 500);
    return () => clearInterval(interval);
  }, [stems.length]);

  return (
    <div className="relative flex flex-col items-center justify-center py-12 overflow-hidden">
      {/* 배경 별 효과 */}
      <div className="absolute inset-0">
        {starPositions.map((pos, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-[#C4A35A] rounded-full"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* 중앙 수정구 */}
      <div className="relative w-32 h-32">
        {/* 외곽 회전 링 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#C4A35A]/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-[#a88f4a]/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* 에너지 펄스 링 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute inset-0 rounded-full border border-[#C4A35A]/30"
            animate={{
              scale: [1, 2],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}

        {/* 궤도를 도는 오행 심볼 */}
        {elements.map((el, i) => {
          const angle = (i * 72 * Math.PI) / 180;
          return (
            <motion.div
              key={`element-${i}`}
              className="absolute text-sm font-bold"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: [
                  Math.cos(angle) * 50 - 8,
                  Math.cos(angle + Math.PI) * 50 - 8,
                  Math.cos(angle + Math.PI * 2) * 50 - 8,
                ],
                y: [
                  Math.sin(angle) * 50 - 8,
                  Math.sin(angle + Math.PI) * 50 - 8,
                  Math.sin(angle + Math.PI * 2) * 50 - 8,
                ],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            >
              <span className={`
                ${i === 0 ? "text-green-600" : ""}
                ${i === 1 ? "text-red-600" : ""}
                ${i === 2 ? "text-yellow-600" : ""}
                ${i === 3 ? "text-gray-600" : ""}
                ${i === 4 ? "text-blue-600" : ""}
              `}>
                {el}
              </span>
            </motion.div>
          );
        })}

        {/* 중앙 빛나는 구슬 */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#C4A35A]/80 via-[#a88f4a]/60 to-[#C4A35A]/80 backdrop-blur-sm flex items-center justify-center overflow-hidden">
          {/* 내부 빛 효과 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* 중앙 천간 글자 변화 */}
          <AnimatePresence mode="wait">
            <motion.span
              key={stemIndex}
              className="text-2xl font-bold text-white z-10"
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              transition={{ duration: 0.3 }}
            >
              {stems[stemIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* 로딩 텍스트 */}
      <motion.div
        className="mt-6 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-gray-700 font-medium flex items-center justify-center gap-2">
          <Sparkle className="w-4 h-4 text-[#C4A35A]" weight="fill" />
          오늘의 운세를 살피는 중
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        </p>
        <p className="text-gray-400 text-sm mt-1">
          천기를 읽고 있습니다
        </p>
      </motion.div>

      {/* 하단 장식 - 팔괘 심볼 */}
      <div className="flex gap-3 mt-4">
        {["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"].map((trigram, i) => (
          <motion.span
            key={i}
            className="text-gray-400 text-xs"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          >
            {trigram}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// 간단한 로딩 스피너 (폴백용)
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-[#C4A35A]/30 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-[#C4A35A] border-t-transparent rounded-full animate-spin" />
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
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl">
        <div className="text-center space-y-4 p-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#C4A35A]/20 to-[#a88f4a]/20 flex items-center justify-center">
            <Crown className="w-8 h-8 text-[#C4A35A]" weight="fill" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">프리미엄 전용</h3>
            <p className="text-sm text-gray-500">
              시운과 대운 분석은 프리미엄 회원만 이용 가능합니다
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
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

const DailyFortuneSection = memo(function DailyFortuneSection({ data }: { data: DailyFortuneData | null }) {
  if (!data) {
    return <FortuneLoadingAnimation />;
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
          <p className="text-gray-500 text-sm">{dateStr} ({weekday})</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-800">
              {data.pillar.stem}{data.pillar.branch}
            </span>
            <span className="text-gray-500">
              ({data.pillar.stemKorean}{data.pillar.branchKorean})
            </span>
          </div>
        </div>
        <GradeBadge grade={data.analysis.grade} score={data.analysis.score} />
      </div>

      {/* Theme & Description */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#C4A35A]/10 to-[#a88f4a]/10 border border-[#C4A35A]/30">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{data.analysis.theme}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {data.analysis.description}
        </p>
      </div>

      {/* Opportunities & Challenges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-green-50 border border-green-200">
          <p className="text-xs text-green-600 font-medium mb-2 flex items-center gap-1">
            <TrendUp className="w-3.5 h-3.5" weight="fill" />
            좋은 기회
          </p>
          <ul className="space-y-1">
            {data.analysis.opportunities.map((item, idx) => (
              <li key={idx} className="text-xs text-gray-600">• {item}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
          <p className="text-xs text-orange-600 font-medium mb-2 flex items-center gap-1">
            <Warning className="w-3.5 h-3.5" weight="fill" />
            주의할 점
          </p>
          <ul className="space-y-1">
            {data.analysis.challenges.map((item, idx) => (
              <li key={idx} className="text-xs text-gray-600">• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advice */}
      {data.analysis.advice && (
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs text-[#C4A35A] flex items-center gap-1">
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
                className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs border border-green-200"
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
                className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs border border-red-200"
              >
                ✗ {activity}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// Hourly Fortune Section
// ============================================================================

const HourlyFortuneSection = memo(function HourlyFortuneSection({
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
      <p className="text-sm text-gray-500 flex items-center gap-2">
        <Timer className="w-4 h-4" />
        12시진별 운세 (현재: {data[currentPeriodIndex]?.periodName || "알 수 없음"})
      </p>

      <div className="grid grid-cols-3 gap-2">
        {data.map((hourly, idx) => {
          const isCurrent = idx === currentPeriodIndex;

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? "ring-2 ring-[#C4A35A] " + (GRADE_COLORS[hourly.grade] || "border-gray-200")
                  : GRADE_COLORS[hourly.grade] || "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-800">
                  {hourly.periodName}
                </span>
                {isCurrent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C4A35A] text-white">
                    NOW
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mb-1">{hourly.timeRange}</p>
              <div className="flex items-center gap-1">
                <GradeIcon grade={hourly.grade} />
                <span className="text-xs text-gray-500">{hourly.score}점</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 현재 시간대 상세 */}
      {data[currentPeriodIndex] && (
        <div className="p-4 rounded-xl bg-[#C4A35A]/10 border border-[#C4A35A]/30 mt-4">
          <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C4A35A]" />
            지금 시간대 ({data[currentPeriodIndex].periodName})
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {data[currentPeriodIndex].description || `${data[currentPeriodIndex].periodName} 시간대입니다.`}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-green-600 mb-1">좋은 활동</p>
              <ul className="space-y-0.5">
                {(data[currentPeriodIndex].goodFor ?? []).map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600">• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-orange-600 mb-1">피할 활동</p>
              <ul className="space-y-0.5">
                {(data[currentPeriodIndex].avoidFor ?? []).map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// Major Fortune Section (Exported for use in result page)
// ============================================================================

export const MajorFortuneSection = memo(function MajorFortuneSection({
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

  // fortunes 배열이 없으면 로딩 표시
  if (!data.fortunes || data.fortunes.length === 0) {
    return <LoadingSpinner />;
  }

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear + 1; // 한국 나이

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            대운수 {data.startAge}세 시작 ({data.direction === "forward" ? "순행" : "역행"})
          </p>
          <p className="text-xs text-gray-400">현재 나이: {currentAge}세</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-3">
          {(data.fortunes ?? []).map((fortune, idx) => {
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
                      ? "bg-[#C4A35A] border-[#C4A35A] ring-4 ring-[#C4A35A]/30"
                      : isPast
                      ? "bg-gray-200 border-gray-300"
                      : "bg-gray-100 border-gray-200"
                  }`}
                />

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-[#C4A35A]/10 border-[#C4A35A]/30"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-800">
                        {fortune.pillar.stem}{fortune.pillar.branch}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({fortune.pillar.stemKorean}{fortune.pillar.branchKorean})
                      </span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#C4A35A] text-white">
                          현재
                        </span>
                      )}
                    </div>
                    <GradeBadge grade={fortune.analysis?.grade || "normal"} score={fortune.analysis?.score || 50} />
                  </div>

                  <p className="text-xs text-gray-400 mb-2">
                    {fortune.startAge}세 ~ {fortune.endAge}세 ({fortune.startYear} ~ {fortune.endYear})
                  </p>

                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {fortune.analysis?.theme || "대운 분석"}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {fortune.analysis?.description || "대운 기간입니다."}
                  </p>

                  {(fortune.keywords?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(fortune.keywords ?? []).map((keyword, kidx) => (
                        <span
                          key={kidx}
                          className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
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
});

// ============================================================================
// Main Component
// ============================================================================

type FortuneTab = "daily" | "hourly" | "lifestyle" | "biorhythm" | "calendar";

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
    { key: "lifestyle", label: "라이프스타일", icon: <Leaf className="w-4 h-4" weight="fill" />, premium: true },
    { key: "biorhythm", label: "바이오리듬", icon: <Heartbeat className="w-4 h-4" weight="fill" />, premium: true },
    { key: "calendar", label: "캘린더", icon: <CalendarBlank className="w-4 h-4" weight="fill" />, premium: true },
  ];

  if (!shareId) {
    return (
      <div className="p-4 text-center">
        {isLoadingShareId ? (
          <FortuneLoadingAnimation />
        ) : (
          <div className="space-y-4 py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#C4A35A]/10 flex items-center justify-center mb-4">
              <Sun className="w-8 h-8 text-[#C4A35A]" weight="fill" />
            </div>
            <p className="text-gray-700 font-medium">운세 분석 준비 중</p>
            <p className="text-gray-500 text-sm">
              사주 분석이 저장되면 오늘의 운세를 확인할 수 있습니다
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200" role="tablist" aria-label="운세 탭">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] text-white shadow-lg"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.premium && !isPremium && (
              <Crown className="w-3 h-3 text-[#C4A35A]" weight="fill" />
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
          className="p-4 bg-white rounded-xl border border-gray-200"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={activeTab}
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
          {activeTab === "lifestyle" && (
            isPremium ? (
              <LifestyleFortune shareId={shareId} />
            ) : (
              <PremiumLock onUpgradeClick={onUpgradeClick} />
            )
          )}
          {activeTab === "biorhythm" && (
            isPremium ? (
              <BiorhythmChart shareId={shareId} />
            ) : (
              <PremiumLock onUpgradeClick={onUpgradeClick} />
            )
          )}
          {activeTab === "calendar" && (
            isPremium ? (
              <FortuneCalendar shareId={shareId} />
            ) : (
              <PremiumLock onUpgradeClick={onUpgradeClick} />
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
