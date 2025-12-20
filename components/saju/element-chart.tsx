"use client";

import { cn } from "@/lib/utils";
import type { ElementScores, Element } from "@/lib/saju/types";
import { ELEMENT_KOREAN } from "@/lib/saju/constants";

interface ElementChartProps {
  scores: ElementScores;
  dominant: Element[];
  lacking: Element[];
}

const elementColors: Record<Element, string> = {
  wood: "bg-element-wood",
  fire: "bg-element-fire",
  earth: "bg-element-earth",
  metal: "bg-element-metal",
  water: "bg-element-water",
};

const elementTextColors: Record<Element, string> = {
  wood: "text-element-wood",
  fire: "text-element-fire",
  earth: "text-element-earth",
  metal: "text-element-metal",
  water: "text-element-water",
};

const ELEMENT_ORDER: Element[] = ["wood", "fire", "earth", "metal", "water"];

export function ElementChart({ scores, dominant, lacking }: ElementChartProps) {
  const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const maxScore = Math.max(...Object.values(scores));

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="space-y-3">
        {ELEMENT_ORDER.map((element) => {
          const score = scores[element];
          const percentage = total > 0 ? (score / total) * 100 : 0;
          const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;
          const isDominant = dominant.includes(element);
          const isLacking = lacking.includes(element);

          return (
            <div key={element} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                      elementColors[element],
                      element === "metal" || element === "earth"
                        ? "text-[#0f172a]"
                        : "text-white"
                    )}
                  >
                    {ELEMENT_KOREAN[element]}
                  </div>
                  <span className={cn("font-medium", elementTextColors[element])}>
                    {ELEMENT_KOREAN[element]}
                  </span>
                  {isDominant && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
                      강
                    </span>
                  )}
                  {isLacking && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
                      약
                    </span>
                  )}
                </div>
                <span className="text-[var(--text-tertiary)]">
                  {percentage.toFixed(0)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    elementColors[element]
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Balance Summary */}
      <div className="flex justify-center gap-4 pt-2">
        {dominant.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-[var(--text-tertiary)]">강한 오행</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {dominant.map((e) => ELEMENT_KOREAN[e]).join(", ")}
            </p>
          </div>
        )}
        {lacking.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-[var(--text-tertiary)]">약한 오행</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {lacking.map((e) => ELEMENT_KOREAN[e]).join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
