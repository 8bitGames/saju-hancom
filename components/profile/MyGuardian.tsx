"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GUARDIANS, type ElementType } from "@/lib/constants/guardians";
import { SACRED_PLACES } from "@/lib/constants/sacred-places";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, MapPin } from "@phosphor-icons/react";
import type { Locale } from "@/lib/i18n/config";

interface MyGuardianProps {
  element: ElementType;
  locale: Locale;
  shareId?: string;
  className?: string;
}

export function MyGuardian({ element, locale, shareId, className }: MyGuardianProps) {
  const guardian = GUARDIANS[element];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div
        className="rounded-2xl p-5 border"
        style={{
          background: `linear-gradient(135deg, ${guardian.color}15, ${guardian.color}08)`,
          borderColor: `${guardian.color}30`,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Guardian Avatar */}
          <div
            className="relative w-20 h-20 rounded-full flex-shrink-0 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${guardian.color}30, ${guardian.color}10)`,
              border: `3px solid ${guardian.color}50`,
            }}
          >
            <Image
              src={guardian.imagePath}
              alt={guardian.name[locale]}
              fill
              className="object-cover p-1"
            />
          </div>

          {/* Guardian Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-1">나의 수호신</p>
            <h3
              className="text-xl font-bold mb-1"
              style={{ color: guardian.color }}
            >
              {guardian.name[locale]}
            </h3>
            <p className="text-sm text-gray-600">
              {guardian.element[locale]} ({element === "wood" ? "목" : element === "fire" ? "화" : element === "earth" ? "토" : element === "metal" ? "금" : "수"})
            </p>
          </div>
        </div>

        {/* Guardian Description */}
        <p className="text-sm text-gray-500 mt-4 leading-relaxed">
          {guardian.description[locale]}
        </p>

        {/* Sacred Place */}
        {(() => {
          const sacredPlace = SACRED_PLACES[element];
          return (
            <div
              className="flex items-center gap-2 mt-3 p-2 rounded-lg"
              style={{ backgroundColor: `${guardian.color}10` }}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: guardian.color }} />
              <span className="text-xs text-gray-600">
                {locale === "ko" ? "수호 성지" : "Sacred Place"}:{" "}
                <span style={{ color: guardian.color }} className="font-medium">
                  {sacredPlace.name[locale]}
                </span>
              </span>
            </div>
          );
        })()}

        {/* Link to Today's Fortune */}
        {shareId && (
          <Link
            href={`/saju/today-fortune?shareId=${shareId}`}
            className="flex items-center justify-between mt-4 p-3 rounded-xl transition-colors"
            style={{
              backgroundColor: `${guardian.color}15`,
            }}
          >
            <span className="text-sm font-medium text-gray-700">
              오늘의 운세 확인하기
            </span>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Empty state when user has no saju analysis
 */
export function MyGuardianEmpty({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-2xl p-6 bg-white border border-gray-200 text-center shadow-sm">
      <p className="text-gray-500 mb-4">
        {locale === "ko"
          ? "사주 분석을 하면 나의 수호신을 만날 수 있어요"
          : "Analyze your Saju to meet your guardian"}
      </p>
      <Link href="/saju">
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] text-white font-medium hover:opacity-90 transition-opacity">
          {locale === "ko" ? "사주 분석하러 가기" : "Analyze Saju"}
        </button>
      </Link>
    </div>
  );
}

/**
 * Loading skeleton for My Guardian
 */
export function MyGuardianLoading({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl p-5 bg-white border border-gray-200 animate-pulse shadow-sm ${className || ""}`}>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100" />
        <div className="flex-1">
          <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
          <div className="h-6 w-24 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="h-12 bg-gray-50 rounded mt-4" />
    </div>
  );
}
