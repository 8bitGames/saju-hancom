"use client";

import { motion } from "framer-motion";
import { Coffee, Drop, Timer, Sparkle } from "@phosphor-icons/react";
import { GUARDIANS, type ElementType } from "@/lib/constants/guardians";
import { ELEMENTAL_TEAS, getElementalTea } from "@/lib/constants/teas";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface TeaRecommendationProps {
  element: ElementType;
  locale: Locale;
  className?: string;
  /**
   * 컴팩트 모드 (작은 카드)
   */
  compact?: boolean;
}

export function TeaRecommendation({
  element,
  locale,
  className,
  compact = false,
}: TeaRecommendationProps) {
  const guardian = GUARDIANS[element];
  const tea = getElementalTea(element);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white rounded-xl p-3 border border-gray-100",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: `${tea.color}15` }}
          >
            {tea.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">
              {locale === "ko" ? "추천 차" : "Recommended Tea"}
            </p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: tea.color }}
            >
              {tea.name[locale]}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl p-4 shadow-sm", className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Coffee className="w-5 h-5" style={{ color: guardian.color }} weight="fill" />
        <h3 className="font-bold text-gray-800">
          {locale === "ko"
            ? `${guardian.name.ko}이 추천하는 차`
            : `Tea from ${guardian.name.en}`}
        </h3>
      </div>

      {/* Tea Card */}
      <div
        className="rounded-xl p-4 border"
        style={{
          background: `linear-gradient(135deg, ${tea.color}08, ${tea.color}03)`,
          borderColor: `${tea.color}20`,
        }}
      >
        {/* Tea Name */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${tea.color}15` }}
          >
            {tea.emoji}
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{tea.name[locale]}</h4>
            {tea.name.hanja && (
              <p className="text-xs text-gray-400">{tea.name.hanja}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {tea.description[locale]}
        </p>

        {/* Ingredients */}
        <div className="flex items-center gap-2 mb-3">
          <Drop className="w-4 h-4 text-gray-400" weight="fill" />
          <span className="text-xs text-gray-500">
            {tea.ingredients[locale].join(" · ")}
          </span>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tea.benefits[locale].map((benefit, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{
                backgroundColor: `${tea.color}10`,
                color: tea.color,
              }}
            >
              <Sparkle className="w-3 h-3" weight="fill" />
              {benefit}
            </span>
          ))}
        </div>

        {/* Brewing Tip */}
        <div
          className="flex items-start gap-2 p-2 rounded-lg"
          style={{ backgroundColor: `${tea.color}08` }}
        >
          <Timer className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">{tea.brewingTip[locale]}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Loading skeleton for TeaRecommendation
 */
export function TeaRecommendationLoading({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "bg-white rounded-xl p-3 border border-gray-100 animate-pulse",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="w-12 h-2 bg-gray-200 rounded mb-1" />
            <div className="w-20 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 shadow-sm animate-pulse",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-gray-200" />
        <div className="w-32 h-5 bg-gray-200 rounded" />
      </div>
      <div className="rounded-xl p-4 bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div>
            <div className="w-24 h-5 bg-gray-200 rounded mb-1" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-full h-10 bg-gray-200 rounded mb-4" />
        <div className="flex gap-1">
          <div className="w-16 h-6 bg-gray-200 rounded-full" />
          <div className="w-16 h-6 bg-gray-200 rounded-full" />
          <div className="w-16 h-6 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
