"use client";

import { motion } from "framer-motion";
import { Leaf, Sparkle } from "@phosphor-icons/react";
import { GUARDIANS, type ElementType } from "@/lib/constants/guardians";
import { SCENT_BLENDS, getScentBlend } from "@/lib/constants/scents";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface ScentRecommendationProps {
  element: ElementType;
  locale: Locale;
  className?: string;
  /**
   * 컴팩트 모드 (작은 카드)
   */
  compact?: boolean;
}

export function ScentRecommendation({
  element,
  locale,
  className,
  compact = false,
}: ScentRecommendationProps) {
  const guardian = GUARDIANS[element];
  const scent = getScentBlend(element);

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
            style={{ backgroundColor: `${scent.color}15` }}
          >
            {scent.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">
              {locale === "ko" ? "추천 향기" : "Recommended Scent"}
            </p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: scent.color }}
            >
              {scent.name[locale]}
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
        <Leaf className="w-5 h-5" style={{ color: guardian.color }} weight="fill" />
        <h3 className="font-bold text-gray-800">
          {locale === "ko"
            ? `${guardian.name.ko}이 추천하는 향기`
            : `Scent from ${guardian.name.en}`}
        </h3>
      </div>

      {/* Scent Card */}
      <div
        className="rounded-xl p-4 border"
        style={{
          background: `linear-gradient(135deg, ${scent.color}08, ${scent.color}03)`,
          borderColor: `${scent.color}20`,
        }}
      >
        {/* Scent Name */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${scent.color}15` }}
          >
            {scent.emoji}
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{scent.name[locale]}</h4>
            <p className="text-xs text-gray-500">
              {locale === "ko"
                ? `당신의 기운을 보완하는 향기`
                : "A scent to complement your energy"}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {scent.description[locale]}
        </p>

        {/* Scent Pyramid */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 w-16">Top</span>
            <span className="text-gray-600 text-right flex-1">
              {scent.notes.top[locale].join(", ")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 w-16">Middle</span>
            <span className="text-gray-600 text-right flex-1">
              {scent.notes.middle[locale].join(", ")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 w-16">Base</span>
            <span className="text-gray-600 text-right flex-1">
              {scent.notes.base[locale].join(", ")}
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-1">
          {scent.benefits[locale].map((benefit, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{
                backgroundColor: `${scent.color}10`,
                color: scent.color,
              }}
            >
              <Sparkle className="w-3 h-3" weight="fill" />
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Loading skeleton for ScentRecommendation
 */
export function ScentRecommendationLoading({
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
        <div className="w-36 h-5 bg-gray-200 rounded" />
      </div>
      <div className="rounded-xl p-4 bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div>
            <div className="w-24 h-5 bg-gray-200 rounded mb-1" />
            <div className="w-32 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-full h-10 bg-gray-200 rounded mb-4" />
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <div className="w-10 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="w-12 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="w-10 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-16 h-6 bg-gray-200 rounded-full" />
          <div className="w-16 h-6 bg-gray-200 rounded-full" />
          <div className="w-16 h-6 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
