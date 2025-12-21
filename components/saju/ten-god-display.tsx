"use client";

import { cn } from "@/lib/utils";
import type { TenGodSummary, TenGod } from "@/lib/saju/types";
import { TEN_GOD_INFO } from "@/lib/saju/constants";

interface TenGodDisplayProps {
  summary: TenGodSummary;
}

const tenGodCategories: { label: string; gods: TenGod[] }[] = [
  { label: "비겁 (자아)", gods: ["bijian", "gebjae"] },
  { label: "식상 (표현)", gods: ["siksin", "sanggwan"] },
  { label: "재성 (재물)", gods: ["pyeonjae", "jeongjae"] },
  { label: "관성 (명예)", gods: ["pyeongwan", "jeonggwan"] },
  { label: "인성 (학문)", gods: ["pyeonin", "jeongin"] },
];

export function TenGodDisplay({ summary }: TenGodDisplayProps) {
  const counts = summary.counts;

  return (
    <div className="space-y-4">
      {/* Categories */}
      {tenGodCategories.map(({ label, gods }) => (
        <div key={label} className="space-y-2">
          <h4 className="text-xs text-white/40">{label}</h4>
          <div className="grid grid-cols-2 gap-2">
            {gods.map((god) => {
              const count = counts[god] || 0;
              const info = TEN_GOD_INFO[god];
              const isDominant = summary.dominant.includes(god);
              const isLacking = summary.lacking.includes(god);

              return (
                <div
                  key={god}
                  className={cn(
                    "p-3 rounded-xl bg-white/5 border border-white/10 transition-all",
                    isDominant && "ring-1 ring-[#22c55e]",
                    isLacking && "opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">
                      {info.korean}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        count > 0
                          ? "text-[#a855f7]"
                          : "text-white/40"
                      )}
                    >
                      {count}
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    {info.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      {(summary.dominant.length > 0 || summary.lacking.length > 0) && (
        <div className="pt-2 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            {summary.dominant.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-1">
                  주요 십성
                </p>
                <div className="flex flex-wrap gap-1">
                  {summary.dominant.map((god) => (
                    <span
                      key={god}
                      className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-xs"
                    >
                      {TEN_GOD_INFO[god].korean}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {summary.lacking.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-1">
                  부재 십성
                </p>
                <div className="flex flex-wrap gap-1">
                  {summary.lacking.map((god) => (
                    <span
                      key={god}
                      className="px-2 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316] text-xs"
                    >
                      {TEN_GOD_INFO[god].korean}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
