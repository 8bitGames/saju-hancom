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

// 청기운 디자인 시스템 오행 컬러
const elementColorMap: Record<Element, string> = {
  wood: "bg-element-wood",
  fire: "bg-element-fire",
  earth: "bg-element-earth",
  metal: "bg-element-metal",
  water: "bg-element-water",
};

const elementTextColorMap: Record<Element, string> = {
  wood: "text-element-wood",
  fire: "text-element-fire",
  earth: "text-element-earth",
  metal: "text-element-metal",
  water: "text-element-water",
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
            ? "text-text-primary"
            : "text-white"
        )}
      >
        {pillar.gan}
      </div>
      <span className="text-xs text-text-secondary mt-1">
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
            ? "text-brand-accent font-semibold"
            : "text-text-muted"
        )}
      >
        {label}
      </span>

      {/* Pillar Card */}
      <div
        className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-xl transition-all bg-white border border-border shadow-sm",
          isDayMaster && "ring-2 ring-brand-accent"
        )}
      >

        {/* Stem (Heavenly) - 탭하면 설명 표시 */}
        {mounted ? (
          <Popover>
            <PopoverTrigger asChild>
              {stemButton}
            </PopoverTrigger>
            <PopoverContent
              className="w-auto max-w-[260px] p-3 bg-white backdrop-blur-md border-border text-text-primary shadow-xl"
              sideOffset={8}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-sm font-bold",
                    elementColorMap[stemElement],
                    stemElement === "metal" || stemElement === "earth"
                      ? "text-text-primary"
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
        <div className="w-full h-px bg-border my-1" />

        {/* Branch (Earthly) - 탭하면 설명 표시 */}
        {(() => {
          const branchButton = (
            <button type="button" className="flex flex-col items-center focus:outline-none active:scale-95 transition-transform">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                  elementColorMap[branchElement],
                  branchElement === "metal" || branchElement === "earth"
                    ? "text-text-primary"
                    : "text-white"
                )}
              >
                {pillar.zhi}
              </div>
              <span className="text-xs text-text-secondary mt-1">
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
                className="w-auto max-w-[260px] p-3 bg-white backdrop-blur-md border-border text-text-primary shadow-xl"
                sideOffset={8}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-sm font-bold",
                      elementColorMap[branchElement],
                      branchElement === "metal" || branchElement === "earth"
                        ? "text-text-primary"
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
