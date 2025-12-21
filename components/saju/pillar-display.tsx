"use client";

import { cn } from "@/lib/utils";
import type { Pillar, Element } from "@/lib/saju/types";
import {
  STEM_KOREAN,
  STEM_ELEMENTS,
  BRANCH_KOREAN,
  BRANCH_ANIMALS,
  BRANCH_ELEMENTS,
  ELEMENT_KOREAN,
} from "@/lib/saju/constants";

interface PillarDisplayProps {
  pillar: Pillar;
  label: string;
  isDayMaster?: boolean;
}

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
  const stemElement = STEM_ELEMENTS[pillar.gan];
  const branchElement = BRANCH_ELEMENTS[pillar.zhi];
  const stemKorean = STEM_KOREAN[pillar.gan];
  const branchKorean = BRANCH_KOREAN[pillar.zhi];
  const animal = BRANCH_ANIMALS[pillar.zhi];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <span
        className={cn(
          "text-xs",
          isDayMaster
            ? "text-[var(--accent)] font-semibold"
            : "text-[var(--text-tertiary)]"
        )}
      >
        {label}
      </span>

      {/* Pillar Card */}
      <div
        className={cn(
          "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
          isDayMaster
            ? "glass-card ring-2 ring-[var(--accent)] shadow-lg"
            : "glass-card"
        )}
      >

        {/* Stem (Heavenly) */}
        <div className="flex flex-col items-center">
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
          <span className="text-xs text-[var(--text-secondary)] mt-1">
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
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[var(--border)] my-1" />

        {/* Branch (Earthly) */}
        <div className="flex flex-col items-center">
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
          <span className="text-xs text-[var(--text-secondary)] mt-1">
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
        </div>
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
