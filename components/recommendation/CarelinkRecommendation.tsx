"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dna, ArrowRight, Sparkle, Virus, Pill } from "@phosphor-icons/react";
import type { CarelinkRecommendation as CarelinkRec } from "@/lib/recommendation/engine";
import type { ElementType } from "@/lib/constants/guardians";
import { GUARDIANS } from "@/lib/constants/guardians";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface CarelinkRecommendationProps {
  recommendation: CarelinkRec;
  element?: ElementType;
  locale?: Locale;
  className?: string;
}

// Icon mapping
function getIcon(iconName: string) {
  switch (iconName) {
    case "Dna":
      return Dna;
    case "Virus":
      return Virus;
    case "Pill":
      return Pill;
    default:
      return Sparkle;
  }
}

export function CarelinkRecommendation({
  recommendation,
  element = "wood",
  locale = "ko",
  className,
}: CarelinkRecommendationProps) {
  const { product, reason } = recommendation;
  const guardian = GUARDIANS[element];
  const Icon = getIcon(product.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-5 shadow-sm border border-emerald-100",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${product.color}15` }}
        >
          <Icon
            className="w-7 h-7"
            style={{ color: product.color }}
            weight="duotone"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              건강 추천
            </span>
            <span className="text-[10px] text-gray-400">케어링크</span>
          </div>

          <h3 className="font-bold text-gray-800 mb-1 text-base">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {reason}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: product.color }}>
              {product.price}
            </span>
            <Link href={product.ctaUrl} target="_blank">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                자세히 보기
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Guardian message footer */}
      <div className="mt-4 pt-4 border-t border-emerald-100/50">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Sparkle
            className="w-3.5 h-3.5 flex-shrink-0"
            weight="fill"
            style={{ color: guardian.color }}
          />
          <span>
            청리움의 {guardian.name[locale]} 수호신이 당신의 건강을 응원합니다
          </span>
        </p>
      </div>
    </motion.div>
  );
}

// List component for multiple recommendations
interface CarelinkRecommendationListProps {
  recommendations: CarelinkRec[];
  element?: ElementType;
  locale?: Locale;
  className?: string;
}

export function CarelinkRecommendationList({
  recommendations,
  element = "wood",
  locale = "ko",
  className,
}: CarelinkRecommendationListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-bold text-gray-800 px-1">
        🧬 맞춤 건강 추천
      </h3>
      {recommendations.map((rec, index) => (
        <motion.div
          key={rec.product.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CarelinkRecommendation
            recommendation={rec}
            element={element}
            locale={locale}
          />
        </motion.div>
      ))}
    </div>
  );
}
