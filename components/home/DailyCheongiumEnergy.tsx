"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkle,
  ArrowRight,
  MapPin,
  Clock,
  Compass,
  Lightning,
} from "@phosphor-icons/react";
import { generateDailyEnergy, type DailyCheongiumEnergy as DailyEnergy } from "@/lib/recommendation/engine";
import { GUARDIANS, type ElementType } from "@/lib/constants/guardians";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface DailyCheongiumEnergyProps {
  locale?: Locale;
  className?: string;
}

// Element color mapping
const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: "#22C55E",
  fire: "#EF4444",
  earth: "#A16207",
  metal: "#6B7280",
  water: "#3B82F6",
};

const ELEMENT_NAMES: Record<ElementType, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

export function DailyCheongiumEnergy({
  locale = "ko",
  className,
}: DailyCheongiumEnergyProps) {
  const [energy, setEnergy] = useState<DailyEnergy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dailyEnergy = generateDailyEnergy();
    setEnergy(dailyEnergy);
    setIsLoading(false);
  }, []);

  if (isLoading || !energy) {
    return (
      <div className={cn("px-4 py-3", className)}>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-1/3 mb-3" />
            <div className="h-20 bg-gray-100 rounded mb-3" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const guardian = GUARDIANS[energy.dominantElement];
  const elementColor = ELEMENT_COLORS[energy.dominantElement];

  return (
    <section className={cn("px-4 py-3", className)}>
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
        >
          {/* Header */}
          <div
            className="p-4 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${elementColor}10 0%, ${elementColor}05 100%)`,
            }}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${elementColor}20`,
                      color: elementColor,
                    }}
                  >
                    오늘의 청리움 에너지
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date().toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {/* Guardian Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2"
                    style={{
                      backgroundColor: `${guardian.color}15`,
                      borderColor: `${guardian.color}40`,
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

                  <div>
                    <p className="text-sm text-gray-500">
                      {ELEMENT_NAMES[energy.dominantElement]} 기운 우세
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-800">
                        에너지 {energy.energyScore}점
                      </span>
                      <Lightning
                        className="w-5 h-5"
                        weight="fill"
                        style={{ color: elementColor }}
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  "{energy.message}"
                </p>
              </div>
            </div>

            {/* Background decoration */}
            <div
              className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
              style={{ backgroundColor: elementColor }}
            />
          </div>

          {/* Details Grid */}
          <div className="px-4 py-3 border-t border-gray-50">
            <div className="grid grid-cols-3 gap-3">
              {/* Lucky Directions */}
              <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-lg bg-blue-50 flex items-center justify-center mb-1">
                  <Compass className="w-4 h-4 text-blue-500" weight="fill" />
                </div>
                <p className="text-[10px] text-gray-400 mb-0.5">길방</p>
                <p className="text-xs font-bold text-gray-800">
                  {energy.luckyDirections[0]}
                </p>
              </div>

              {/* Recommended Activities */}
              <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-lg bg-green-50 flex items-center justify-center mb-1">
                  <Sparkle className="w-4 h-4 text-green-500" weight="fill" />
                </div>
                <p className="text-[10px] text-gray-400 mb-0.5">추천 활동</p>
                <p className="text-xs font-bold text-gray-800">
                  {energy.recommendedActivities[0]}
                </p>
              </div>

              {/* Guardian */}
              <div className="text-center">
                <div
                  className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1"
                  style={{ backgroundColor: `${guardian.color}15` }}
                >
                  <Image
                    src={guardian.imagePath}
                    alt={guardian.name[locale]}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mb-0.5">수호신</p>
                <p className="text-xs font-bold" style={{ color: guardian.color }}>
                  {guardian.name[locale]}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <Link href={energy.cheongiumProgramMatch.bookingUrl} target="_blank">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" weight="fill" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">오늘의 추천 프로그램</p>
                    <p className="text-sm font-bold text-gray-800">
                      {energy.cheongiumProgramMatch.program}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
