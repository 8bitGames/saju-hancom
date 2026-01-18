"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, ArrowRight, Sparkle, CheckCircle } from "@phosphor-icons/react";
import type { CheongriumProgramRecommendation as ProgramRec } from "@/lib/recommendation/engine";
import type { ElementType } from "@/lib/constants/guardians";
import { GUARDIANS } from "@/lib/constants/guardians";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface CheongriumProgramRecommendationProps {
  recommendation: ProgramRec;
  locale?: Locale;
  className?: string;
}

export function CheongriumProgramRecommendation({
  recommendation,
  locale = "ko",
  className,
}: CheongriumProgramRecommendationProps) {
  const { program, reason } = recommendation;
  const guardian = GUARDIANS[program.targetElement];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100",
        className
      )}
    >
      {/* Header with guardian color */}
      <div
        className="p-4"
        style={{ backgroundColor: `${guardian.color}10` }}
      >
        <div className="flex items-center gap-3">
          {/* Guardian Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2"
            style={{
              backgroundColor: `${guardian.color}15`,
              borderColor: `${guardian.color}30`,
            }}
          >
            <Image
              src={guardian.imagePath}
              alt={guardian.name[locale]}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">
              {guardian.name[locale]}의 추천
            </p>
            <h3 className="font-bold text-gray-800 text-base">
              {program.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {program.description}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {program.highlights.map((highlight, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600"
            >
              <CheckCircle className="w-3 h-3" weight="fill" style={{ color: guardian.color }} />
              {highlight}
            </span>
          ))}
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-3 text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {program.duration}
            </span>
          </div>
          <span className="font-bold text-gray-800">
            {program.price}
          </span>
        </div>

        {/* Reason */}
        <div className="p-3 rounded-xl bg-gray-50 mb-4">
          <p className="text-xs text-gray-600 flex items-start gap-2">
            <Sparkle
              className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
              weight="fill"
              style={{ color: guardian.color }}
            />
            <span>{reason}</span>
          </p>
        </div>

        {/* CTA Button */}
        <Link href={program.bookingUrl} target="_blank">
          <button
            className="w-full py-3 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: "#0E4168" }}
          >
            청리움 예약하기
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" weight="fill" />
          경기도 가평군 청리움 | 서울에서 1시간
        </p>
      </div>
    </motion.div>
  );
}

// List component for multiple program recommendations
interface CheongriumProgramListProps {
  recommendations: ProgramRec[];
  locale?: Locale;
  className?: string;
}

export function CheongriumProgramList({
  recommendations,
  locale = "ko",
  className,
}: CheongriumProgramListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-bold text-gray-800 px-1">
        🏔️ 청리움 프로그램 추천
      </h3>
      {recommendations.map((rec, index) => (
        <motion.div
          key={rec.program.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CheongriumProgramRecommendation
            recommendation={rec}
            locale={locale}
          />
        </motion.div>
      ))}
    </div>
  );
}
