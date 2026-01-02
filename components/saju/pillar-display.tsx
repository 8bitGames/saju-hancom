"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Pillar, Element } from "@/lib/saju/types";
import {
  STEM_KOREAN,
  STEM_ELEMENTS,
  STEM_DESCRIPTIONS,
  BRANCH_KOREAN,
  BRANCH_ANIMALS,
  BRANCH_ELEMENTS,
  BRANCH_DESCRIPTIONS,
  ELEMENT_KOREAN,
} from "@/lib/saju/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Radix Popover hydration mismatch 방지용 훅
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

interface PillarDisplayProps {
  pillar: Pillar;
  label: string;
  isDayMaster?: boolean;
}

const elementColorMap: Record<Element, string> = {
  wood: "bg-[#22c55e]",
  fire: "bg-[#ef4444]",
  earth: "bg-[#eab308]",
  metal: "bg-[#94a3b8]",
  water: "bg-[#3b82f6]",
};

const elementTextColorMap: Record<Element, string> = {
  wood: "text-[#22c55e]",
  fire: "text-[#ef4444]",
  earth: "text-[#eab308]",
  metal: "text-[#94a3b8]",
  water: "text-[#3b82f6]",
};

export function PillarDisplay({
  pillar,
  label,
  isDayMaster = false,
}: PillarDisplayProps) {
  const mounted = useIsMounted();
  const stemElement = STEM_ELEMENTS[pillar.gan];
  const branchElement = BRANCH_ELEMENTS[pillar.zhi];
  const stemKorean = STEM_KOREAN[pillar.gan];
  const branchKorean = BRANCH_KOREAN[pillar.zhi];
  const animal = BRANCH_ANIMALS[pillar.zhi];

  // Stem 버튼 UI (Popover 내외부에서 공용)
  const stemButton = (
    <button type="button" className="flex flex-col items-center focus:outline-none active:scale-95 transition-transform">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
          elementColorMap[stemElement],
          stemElement === "metal" || stemElement === "earth"
            ? "text-[#0f172a]"
            : "text-white"
        )}
      >
        {pillar.gan}
      </div>
      <span className="text-xs text-white/60 mt-1">
        {stemKorean}
      </span>
      <span
        className={cn(
          "text-[10px] font-medium",
          elementTextColorMap[stemElement]
        )}
      >
        {ELEMENT_KOREAN[stemElement]}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <span
        className={cn(
          "text-xs",
          isDayMaster
            ? "text-[#a855f7] font-semibold"
            : "text-white/40"
        )}
      >
        {label}
      </span>

      {/* Pillar Card */}
      <div
        className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-xl transition-all bg-white/5 border border-white/10",
          isDayMaster && "ring-2 ring-[#a855f7]"
        )}
      >

        {/* Stem (Heavenly) - 탭하면 설명 표시 */}
        {mounted ? (
          <Popover>
            <PopoverTrigger asChild>
              {stemButton}
            </PopoverTrigger>
            <PopoverContent
              className="w-auto max-w-[260px] p-3 bg-[#1a1033]/95 backdrop-blur-md border-purple-500/30 text-white shadow-xl"
              sideOffset={8}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-sm font-bold",
                    elementColorMap[stemElement],
                    stemElement === "metal" || stemElement === "earth"
                      ? "text-[#0f172a]"
                      : "text-white"
                  )}
                >
                  {pillar.gan}
                </div>
                <p className="text-sm leading-relaxed">{STEM_DESCRIPTIONS[pillar.gan]}</p>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          stemButton
        )}

        {/* Divider */}
        <div className="w-full h-px bg-white/10 my-1" />

        {/* Branch (Earthly) - 탭하면 설명 표시 */}
        {(() => {
          const branchButton = (
            <button type="button" className="flex flex-col items-center focus:outline-none active:scale-95 transition-transform">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                  elementColorMap[branchElement],
                  branchElement === "metal" || branchElement === "earth"
                    ? "text-[#0f172a]"
                    : "text-white"
                )}
              >
                {pillar.zhi}
              </div>
              <span className="text-xs text-white/60 mt-1">
                {branchKorean}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  elementTextColorMap[branchElement]
                )}
              >
                {animal}
              </span>
            </button>
          );

          return mounted ? (
            <Popover>
              <PopoverTrigger asChild>
                {branchButton}
              </PopoverTrigger>
              <PopoverContent
                className="w-auto max-w-[260px] p-3 bg-[#1a1033]/95 backdrop-blur-md border-purple-500/30 text-white shadow-xl"
                sideOffset={8}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-sm font-bold",
                      elementColorMap[branchElement],
                      branchElement === "metal" || branchElement === "earth"
                        ? "text-[#0f172a]"
                        : "text-white"
                    )}
                  >
                    {pillar.zhi}
                  </div>
                  <p className="text-sm leading-relaxed">{BRANCH_DESCRIPTIONS[pillar.zhi]}</p>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            branchButton
          );
        })()}
      </div>
    </div>
  );
}

interface FourPillarsDisplayProps {
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    time: Pillar;
  };
}

export function FourPillarsDisplay({ pillars }: FourPillarsDisplayProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <PillarDisplay pillar={pillars.time} label="시주" />
      <PillarDisplay pillar={pillars.day} label="일주" isDayMaster />
      <PillarDisplay pillar={pillars.month} label="월주" />
      <PillarDisplay pillar={pillars.year} label="년주" />
    </div>
  );
}
