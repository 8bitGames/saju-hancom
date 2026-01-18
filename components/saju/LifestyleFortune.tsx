"use client";

import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  ForkKnife,
  Hash,
  Compass,
  CheckCircle,
  XCircle,
  Sparkle,
  Info,
} from "@phosphor-icons/react";
import type { LifestyleFortune as LifestyleFortuneType } from "@/lib/saju/lifestyle/lifestyle-fortune";

// ============================================================================
// Types
// ============================================================================

interface LifestyleFortuneProps {
  shareId: string;
  date?: string;
}

// ============================================================================
// Loading Component
// ============================================================================

function LifestyleLoading() {
  return (
    <div className="space-y-3">
      {/* Color & Food row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-28 rounded-xl bg-white/5 animate-pulse" />
      </div>
      {/* Number & Direction row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
      </div>
      {/* Activities */}
      <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

const LuckyColorCard = memo(function LuckyColorCard({
  color,
  delay,
}: {
  color: LifestyleFortuneType["luckyColor"];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-pink-400" weight="fill" />
        <span className="text-xs text-white/50 font-medium">행운의 색상</span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full ring-2 ring-offset-2 ring-offset-black ring-white/20 shadow-lg"
          style={{ backgroundColor: color.hex }}
        />
        <div>
          <p className="font-bold text-white">{color.name}</p>
          <p className="text-xs text-white/50">{color.meaning}</p>
        </div>
      </div>
      <p className="text-xs text-white/40 mt-2 leading-relaxed">{color.reason}</p>
    </motion.div>
  );
});

const LuckyFoodCard = memo(function LuckyFoodCard({
  food,
  delay,
}: {
  food: LifestyleFortuneType["luckyFood"];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <ForkKnife className="w-4 h-4 text-green-400" weight="fill" />
        <span className="text-xs text-white/50 font-medium">행운의 음식</span>
      </div>
      <div>
        <p className="font-bold text-white text-lg">{food.name}</p>
        <p className="text-xs text-white/50 mb-1">{food.category}</p>
        <p className="text-xs text-green-300/80">{food.benefit}</p>
      </div>
      <p className="text-xs text-white/40 mt-2 leading-relaxed">{food.reason}</p>
    </motion.div>
  );
});

const LuckyNumbersCard = memo(function LuckyNumbersCard({
  numbers,
  delay,
}: {
  numbers: number[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-blue-400" weight="fill" />
        <span className="text-xs text-white/50 font-medium">행운의 숫자</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {numbers.map((num, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-sm border border-blue-500/30"
          >
            {num}
          </span>
        ))}
      </div>
    </motion.div>
  );
});

const LuckyDirectionCard = memo(function LuckyDirectionCard({
  direction,
  delay,
}: {
  direction: LifestyleFortuneType["luckyDirection"];
  delay: number;
}) {
  // 방향에 따른 회전 각도
  const rotationMap: Record<string, number> = {
    동쪽: 90,
    남쪽: 180,
    서쪽: 270,
    북쪽: 0,
    중앙: 0,
  };
  const rotation = rotationMap[direction.name] || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-4 h-4 text-amber-400" weight="fill" />
        <span className="text-xs text-white/50 font-medium">행운의 방향</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-500/30" />
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-amber-400"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L8 10h8L12 2zM12 22v-8" />
            </svg>
          </motion.div>
        </div>
        <div>
          <p className="font-bold text-white">{direction.name}</p>
          <p className="text-xs text-white/50">{direction.meaning}</p>
        </div>
      </div>
    </motion.div>
  );
});

const ActivitiesCard = memo(function ActivitiesCard({
  luckyActivities,
  avoidActivities,
  delay,
}: {
  luckyActivities: string[];
  avoidActivities: string[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkle className="w-4 h-4 text-purple-400" weight="fill" />
        <span className="text-xs text-white/50 font-medium">오늘의 활동 추천</span>
      </div>
      <div className="space-y-3">
        {/* Recommended activities */}
        <div className="flex flex-wrap gap-2">
          {luckyActivities.map((activity, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-300 text-xs border border-green-500/20 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" weight="fill" />
              {activity}
            </span>
          ))}
        </div>
        {/* Activities to avoid */}
        <div className="flex flex-wrap gap-2">
          {avoidActivities.map((activity, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-300 text-xs border border-red-500/20 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" weight="fill" />
              {activity}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

const ElementInteractionCard = memo(function ElementInteractionCard({
  data,
  delay,
}: {
  data: LifestyleFortuneType;
  delay: number;
}) {
  const relationColors = {
    harmonious: "text-green-400 bg-green-500/10 border-green-500/20",
    neutral: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    conflicting: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };
  const relationLabels = {
    harmonious: "조화",
    neutral: "중립",
    conflicting: "상충",
  };

  const elementKorean: Record<string, string> = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-purple-400" />
        <span className="text-xs text-white/50 font-medium">오행 상호작용</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white/50">용신</span>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-sm font-medium">
            {elementKorean[data.usefulGodElement]}
          </span>
        </div>
        <span className="text-white/30">+</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white/50">일진</span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-sm font-medium">
            {elementKorean[data.dailyElement]}
          </span>
        </div>
        <span className="text-white/30">=</span>
        <span
          className={`px-2 py-0.5 rounded text-sm font-medium border ${
            relationColors[data.dailyUsefulGodRelation]
          }`}
        >
          {relationLabels[data.dailyUsefulGodRelation]}
        </span>
      </div>
      <p className="text-xs text-white/60 leading-relaxed">
        {data.elementInteraction}
      </p>
    </motion.div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const LifestyleFortune = memo(function LifestyleFortune({
  shareId,
  date,
}: LifestyleFortuneProps) {
  const [data, setData] = useState<LifestyleFortuneType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ shareId });
        if (date) params.append("date", date);

        const res = await fetch(`/api/saju/fortune/lifestyle?${params}`);
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("Failed to fetch lifestyle fortune:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [shareId, date]);

  if (loading) {
    return <LifestyleLoading />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Element Interaction */}
      <ElementInteractionCard data={data} delay={0} />

      {/* Color & Food */}
      <div className="grid grid-cols-2 gap-3">
        <LuckyColorCard color={data.luckyColor} delay={0.1} />
        <LuckyFoodCard food={data.luckyFood} delay={0.15} />
      </div>

      {/* Number & Direction */}
      <div className="grid grid-cols-2 gap-3">
        <LuckyNumbersCard numbers={data.luckyNumbers} delay={0.2} />
        <LuckyDirectionCard direction={data.luckyDirection} delay={0.25} />
      </div>

      {/* Activities */}
      <ActivitiesCard
        luckyActivities={data.luckyActivities}
        avoidActivities={data.avoidActivities}
        delay={0.3}
      />
    </div>
  );
});

export default LifestyleFortune;
