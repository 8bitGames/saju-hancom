"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TenGodSummary, TenGod } from "@/lib/saju/types";
import { TEN_GOD_INFO } from "@/lib/saju/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Radix Popover hydration mismatch 방지용 훅
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

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
  const mounted = useIsMounted();
  const counts = summary.counts;

  return (
    <div className="space-y-4">
      {/* Categories */}
      {tenGodCategories.map(({ label, gods }) => (
        <div key={label} className="space-y-2">
          <h4 className="text-xs text-text-muted">{label}</h4>
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
                    "p-3 rounded-xl bg-white border border-border shadow-sm transition-all",
                    isDominant && "ring-1 ring-element-wood",
                    isLacking && "opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-text-primary">
                      {info.korean}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        count > 0
                          ? "text-brand-accent"
                          : "text-text-muted"
                      )}
                    >
                      {count}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
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
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            {summary.dominant.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-1">
                  주요 십성
                </p>
                <div className="flex flex-wrap gap-1">
                  {summary.dominant.map((god) => {
                    const buttonEl = (
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded-full bg-element-wood/20 text-element-wood text-xs hover:bg-element-wood/30 active:bg-element-wood/40 transition-colors"
                      >
                        {TEN_GOD_INFO[god].korean}
                      </button>
                    );

                    return mounted ? (
                      <Popover key={god}>
                        <PopoverTrigger asChild>
                          {buttonEl}
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto max-w-[260px] p-3 bg-white backdrop-blur-md border-border text-text-primary shadow-xl"
                          sideOffset={8}
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {TEN_GOD_INFO[god].korean} ({TEN_GOD_INFO[god].hanja})
                            </p>
                            <p className="text-xs text-text-secondary">
                              {TEN_GOD_INFO[god].description}
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span key={god}>{buttonEl}</span>
                    );
                  })}
                </div>
              </div>
            )}
            {summary.lacking.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-1">
                  부재 십성
                </p>
                <div className="flex flex-wrap gap-1">
                  {summary.lacking.map((god) => {
                    const buttonEl = (
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs hover:bg-orange-200 active:bg-orange-300 transition-colors"
                      >
                        {TEN_GOD_INFO[god].korean}
                      </button>
                    );

                    return mounted ? (
                      <Popover key={god}>
                        <PopoverTrigger asChild>
                          {buttonEl}
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto max-w-[260px] p-3 bg-white backdrop-blur-md border-border text-text-primary shadow-xl"
                          sideOffset={8}
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {TEN_GOD_INFO[god].korean} ({TEN_GOD_INFO[god].hanja})
                            </p>
                            <p className="text-xs text-text-secondary">
                              {TEN_GOD_INFO[god].description}
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span key={god}>{buttonEl}</span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
