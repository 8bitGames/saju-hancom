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

const elementConfig: Record<Element, { color: string; hanja: string; gradient: string }> = {
  wood: {
    color: "#22c55e",
    hanja: "木",
    gradient: "from-[#22c55e] to-[#16a34a]"
  },
  fire: {
    color: "#ef4444",
    hanja: "火",
    gradient: "from-[#ef4444] to-[#dc2626]"
  },
  earth: {
    color: "#eab308",
    hanja: "土",
    gradient: "from-[#eab308] to-[#ca8a04]"
  },
  metal: {
    color: "#94a3b8",
    hanja: "金",
    gradient: "from-[#94a3b8] to-[#64748b]"
  },
  water: {
    color: "#3b82f6",
    hanja: "水",
    gradient: "from-[#3b82f6] to-[#2563eb]"
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
                  "ring-2 ring-offset-2 ring-offset-transparent transition-all",
                  isDominant && "ring-4 ring-offset-4",
                  isLacking && "opacity-50"
                )}
                style={{
                  background: `linear-gradient(135deg, ${config.color}40, ${config.color}20)`,
                  borderColor: config.color,
                  boxShadow: isDominant ? `0 0 20px ${config.color}60` : "none",
                  ["--tw-ring-color" as string]: config.color,
                }}
              >
                <span
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: config.color }}
                >
                  {config.hanja}
                </span>
                {/* Percentage Badge */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold"
                  style={{
                    background: config.color,
                    color: element === "metal" || element === "earth" ? "#0f172a" : "white",
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
                <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] font-medium">
                  강
                </span>
              )}
              {isLacking && (
                <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316] font-medium">
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
                style={{ background: `${config.color}30`, color: config.color }}
              >
                {config.hanja}
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", config.gradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
              <span className="text-xs text-white/50 w-10 text-right font-mono">
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
            className="p-3 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 border border-[#22c55e]/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-[10px] sm:text-xs text-[#22c55e]/70 mb-1">강한 오행</p>
            <div className="flex items-center gap-2">
              {dominant.map((e) => (
                <span
                  key={e}
                  className="text-sm sm:text-base font-bold"
                  style={{ color: elementConfig[e].color }}
                >
                  {elementConfig[e].hanja} {ELEMENT_KOREAN[e]}
                </span>
              ))}
            </div>
          </motion.div>
        )}
        {lacking.length > 0 && (
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-[#f97316]/20 to-[#f97316]/5 border border-[#f97316]/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-[10px] sm:text-xs text-[#f97316]/70 mb-1">약한 오행</p>
            <div className="flex items-center gap-2">
              {lacking.map((e) => (
                <span
                  key={e}
                  className="text-sm sm:text-base font-bold"
                  style={{ color: elementConfig[e].color }}
                >
                  {elementConfig[e].hanja} {ELEMENT_KOREAN[e]}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
