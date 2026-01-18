"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";
import {
  GUARDIANS,
  getTodayGuardianMessage,
  getTodayElement,
  type ElementType,
} from "@/lib/constants/guardians";
import { SACRED_PLACES } from "@/lib/constants/sacred-places";
import type { Locale } from "@/lib/i18n/config";

interface DailyGuardianMessageProps {
  locale: Locale;
  /**
   * 사용자의 주된 오행 (있으면 그 수호신의 메시지 표시)
   * 없으면 오늘의 담당 수호신 메시지 표시
   */
  userElement?: ElementType;
  className?: string;
}

export function DailyGuardianMessage({
  locale,
  userElement,
  className = "",
}: DailyGuardianMessageProps) {
  // 사용자 오행이 있으면 사용, 없으면 오늘의 담당 오행 사용
  const element = userElement || getTodayElement();
  const guardian = GUARDIANS[element];
  const sacredPlace = SACRED_PLACES[element];
  const message = getTodayGuardianMessage(element, locale);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`px-4 py-4 bg-white ${className}`}
    >
      <div className="max-w-md mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkle className="w-4 h-4 text-accent-gold" weight="fill" />
          <span className="text-xs text-gray-500 font-medium">
            {locale === "ko" ? "오늘의 수호신 메시지" : "Guardian Message"}
          </span>
        </div>

        {/* Message Card */}
        <div
          className="relative rounded-2xl p-4 border overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${guardian.color}08, ${guardian.color}03)`,
            borderColor: `${guardian.color}20`,
          }}
        >
          {/* Background Glow */}
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: guardian.color }}
          />

          <div className="relative flex items-start gap-3">
            {/* Guardian Avatar */}
            <div
              className="relative w-12 h-12 rounded-full flex-shrink-0 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${guardian.color}20, ${guardian.color}10)`,
                border: `2px solid ${guardian.color}30`,
              }}
            >
              <Image
                src={guardian.imagePath}
                alt={guardian.name[locale]}
                fill
                className="object-cover p-0.5"
              />
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {/* Guardian Info */}
              <p className="text-xs text-gray-500 mb-1">
                {sacredPlace.name[locale]}
                {locale === "ko" ? "에서 " : " - "}
                <span
                  className="font-medium"
                  style={{ color: guardian.color }}
                >
                  {guardian.name[locale]}
                </span>
                {locale === "ko" ? "이 전합니다" : " says"}
              </p>

              {/* Message */}
              <p className="text-sm text-gray-700 leading-relaxed">
                "{message}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Loading skeleton for DailyGuardianMessage
 */
export function DailyGuardianMessageLoading({ className = "" }: { className?: string }) {
  return (
    <section className={`px-4 py-4 bg-white ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Header Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Card Skeleton */}
        <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
