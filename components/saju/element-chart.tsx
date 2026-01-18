"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ElementScores, Element } from "@/lib/saju/types";
import { ELEMENT_KOREAN } from "@/lib/saju/constants";

interface ElementChartProps {
  scores: ElementScores;
  dominant: Element[];
  lacking: Element[];
}

// 청기운 디자인 시스템 오행 컬러
const elementConfig: Record<Element, { color: string; lightColor: string; hanja: string; gradient: string; emoji: string }> = {
  wood: {
    color: "#2D5A27",
    lightColor: "#4A7C43",
    hanja: "木",
    gradient: "from-[#2D5A27] to-[#4A7C43]",
    emoji: "🐲",
  },
  fire: {
    color: "#B91C1C",
    lightColor: "#DC2626",
    hanja: "火",
    gradient: "from-[#B91C1C] to-[#DC2626]",
    emoji: "🦅",
  },
  earth: {
    color: "#C4A35A",
    lightColor: "#D4B86A",
    hanja: "土",
    gradient: "from-[#C4A35A] to-[#D4B86A]",
    emoji: "🐉",
  },
  metal: {
    color: "#6B7280",
    lightColor: "#9CA3AF",
    hanja: "金",
    gradient: "from-[#6B7280] to-[#9CA3AF]",
    emoji: "🐅",
  },
  water: {
    color: "#1E3A5F",
    lightColor: "#2563EB",
    hanja: "水",
    gradient: "from-[#1E3A5F] to-[#2563EB]",
    emoji: "🐢",
  },
};

const ELEMENT_ORDER: Element[] = ["wood", "fire", "earth", "metal", "water"];

export function ElementChart({ scores, dominant, lacking }: ElementChartProps) {
  const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const maxScore = Math.max(...Object.values(scores));

  return (
    <div className="space-y-5">
      {/* Circular Element Display */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {ELEMENT_ORDER.map((element, index) => {
          const score = scores[element];
          const percentage = total > 0 ? (score / total) * 100 : 0;
          const isDominant = dominant.includes(element);
          const isLacking = lacking.includes(element);
          const config = elementConfig[element];

          return (
            <motion.div
              key={element}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
            >
              {/* Element Circle */}
              <div
                className={cn(
                  "relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl",
                  "ring-2 ring-offset-2 ring-offset-white transition-all",
                  isDominant && "ring-4 ring-offset-4",
                  isLacking && "opacity-50"
                )}
                style={{
                  background: `linear-gradient(135deg, ${config.color}20, ${config.color}10)`,
                  borderColor: config.color,
                  boxShadow: isDominant ? `0 0 20px ${config.color}40` : "none",
                  ["--tw-ring-color" as string]: config.color,
                }}
              >
                <span className="text-2xl">{config.emoji}</span>
                {/* Percentage Badge */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold"
                  style={{
                    background: config.color,
                    color: "white",
                  }}
                >
                  {percentage.toFixed(0)}%
                </div>
              </div>

              {/* Element Name */}
              <p
                className="mt-3 text-xs sm:text-sm font-medium"
                style={{ color: config.color }}
              >
                {ELEMENT_KOREAN[element]}
              </p>

              {/* Status Badge */}
              {isDominant && (
                <span
                  className="mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${config.color}20`,
                    color: config.color
                  }}
                >
                  강
                </span>
              )}
              {isLacking && (
                <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                  약
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-2 pt-2">
        {ELEMENT_ORDER.map((element, index) => {
          const score = scores[element];
          const percentage = total > 0 ? (score / total) * 100 : 0;
          const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;
          const config = elementConfig[element];

          return (
            <motion.div
              key={element}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: `${config.color}15`, color: config.color }}
              >
                {config.hanja}
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", config.gradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
              <span className="text-xs text-text-muted w-10 text-right font-mono">
                {percentage.toFixed(0)}%
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-2 gap-3 pt-3">
        {dominant.length > 0 && (
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-element-wood/10 to-element-wood/5 border border-element-wood/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-[10px] sm:text-xs text-element-wood/70 mb-1">강한 오행</p>
            <div className="flex items-center gap-2 flex-wrap">
              {dominant.map((e) => (
                <span
                  key={e}
                  className="text-sm sm:text-base font-bold"
                  style={{ color: elementConfig[e].color }}
                >
                  {elementConfig[e].emoji} {ELEMENT_KOREAN[e]}
                </span>
              ))}
            </div>
          </motion.div>
        )}
        {lacking.length > 0 && (
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-[10px] sm:text-xs text-orange-600/70 mb-1">약한 오행</p>
            <div className="flex items-center gap-2 flex-wrap">
              {lacking.map((e) => (
                <span
                  key={e}
                  className="text-sm sm:text-base font-bold"
                  style={{ color: elementConfig[e].color }}
                >
                  {elementConfig[e].emoji} {ELEMENT_KOREAN[e]}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
