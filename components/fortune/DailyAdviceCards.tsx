"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Heart,
  CurrencyCircleDollar,
  Briefcase,
  FirstAidKit,
  Star,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export interface DailyAdvice {
  id: string;
  category: "love" | "money" | "career" | "health" | "overall";
  score: number; // 0-100
  title: string;
  description: string;
  advice: string;
}

interface DailyAdviceCardsProps {
  advices: DailyAdvice[];
  locale: Locale;
  className?: string;
}

const CATEGORY_CONFIG = {
  love: {
    icon: Heart,
    color: "#ec4899",
    bgColor: "bg-pink-50",
    label: { ko: "연애운", en: "Love" },
  },
  money: {
    icon: CurrencyCircleDollar,
    color: "#22c55e",
    bgColor: "bg-green-50",
    label: { ko: "금전운", en: "Money" },
  },
  career: {
    icon: Briefcase,
    color: "#3b82f6",
    bgColor: "bg-blue-50",
    label: { ko: "직장운", en: "Career" },
  },
  health: {
    icon: FirstAidKit,
    color: "#f59e0b",
    bgColor: "bg-amber-50",
    label: { ko: "건강운", en: "Health" },
  },
  overall: {
    icon: Star,
    color: "#8b5cf6",
    bgColor: "bg-purple-50",
    label: { ko: "총운", en: "Overall" },
  },
};

// Default advices for demonstration
const defaultAdvices: DailyAdvice[] = [
  {
    id: "overall",
    category: "overall",
    score: 75,
    title: "오늘의 총운",
    description: "전반적으로 안정적인 하루가 될 것으로 보입니다.",
    advice: "새로운 시도보다는 기존 일에 집중하세요.",
  },
  {
    id: "love",
    category: "love",
    score: 80,
    title: "연애운",
    description: "인연과의 소통이 활발해지는 날입니다.",
    advice: "진심을 담아 대화하면 좋은 결과가 있을 것입니다.",
  },
  {
    id: "money",
    category: "money",
    score: 65,
    title: "금전운",
    description: "지출이 많아질 수 있는 시기입니다.",
    advice: "불필요한 소비를 줄이고 저축에 신경 쓰세요.",
  },
  {
    id: "career",
    category: "career",
    score: 85,
    title: "직장운",
    description: "업무에서 성과를 낼 수 있는 좋은 기회입니다.",
    advice: "적극적으로 의견을 제시해 보세요.",
  },
  {
    id: "health",
    category: "health",
    score: 70,
    title: "건강운",
    description: "무리하지 않는 것이 중요합니다.",
    advice: "충분한 휴식과 규칙적인 생활을 유지하세요.",
  },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function DailyAdviceCards({
  advices = defaultAdvices,
  locale,
  className,
}: DailyAdviceCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % advices.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + advices.length) % advices.length);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrev();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
  };

  const currentAdvice = advices[currentIndex];
  const config = CATEGORY_CONFIG[currentAdvice.category];
  const Icon = config.icon;

  return (
    <div className={cn("", className)}>
      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {advices.map((advice, index) => {
          const tabConfig = CATEGORY_CONFIG[advice.category];
          const isActive = index === currentIndex;
          return (
            <button
              key={advice.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                isActive
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              style={{
                backgroundColor: isActive ? tabConfig.color : undefined,
              }}
            >
              <tabConfig.icon className="w-4 h-4" weight={isActive ? "fill" : "regular"} />
              {tabConfig.label[locale]}
            </button>
          );
        })}
      </div>

      {/* Card Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAdvice.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              "p-5 rounded-2xl cursor-grab active:cursor-grabbing",
              config.bgColor
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: config.color }}
                    weight="fill"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {currentAdvice.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {config.label[locale]}
                  </p>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="mb-4">
              <ScoreBar score={currentAdvice.score} color={config.color} />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 mb-3">
              {currentAdvice.description}
            </p>

            {/* Advice */}
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${config.color}10` }}
            >
              <p className="text-sm font-medium" style={{ color: config.color }}>
                {currentAdvice.advice}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {advices.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
              aria-label="Previous"
            >
              <CaretLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
              aria-label="Next"
            >
              <CaretRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {advices.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {advices.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "w-4"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              style={{
                backgroundColor:
                  index === currentIndex
                    ? CATEGORY_CONFIG[advices[index].category].color
                    : undefined,
              }}
              aria-label={`Go to ${advices[index].title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for Daily Advice Cards
 */
export function DailyAdviceCardsLoading({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>

      {/* Card skeleton */}
      <div className="p-5 rounded-2xl bg-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div>
            <div className="h-5 w-24 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full mb-4" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
        <div className="h-16 w-full bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
