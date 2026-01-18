"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Coffee, Leaf, ArrowRight } from "@phosphor-icons/react";
import type { TeaRecommendationResult } from "@/lib/recommendation/engine";
import { getElementName } from "@/lib/recommendation/engine";
import { cn } from "@/lib/utils";

interface TeaRecommendationProps {
  recommendation: TeaRecommendationResult;
  className?: string;
}

export function TeaRecommendation({
  recommendation,
  className,
}: TeaRecommendationProps) {
  const { recommendation: tea, deficientElement, reason } = recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 shadow-sm border border-amber-100",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Tea Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${tea.color}20` }}
        >
          <Coffee
            className="w-6 h-6"
            style={{ color: tea.color }}
            weight="duotone"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              맞춤 차 추천
            </span>
          </div>

          <h3 className="font-bold text-gray-800 mb-1">
            {tea.tea}
          </h3>

          <p className="text-sm text-gray-600 mb-2">
            {tea.benefit}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Leaf className="w-3.5 h-3.5" weight="fill" style={{ color: tea.color }} />
            <span>{tea.cheongiumProduct}</span>
          </div>
        </div>
      </div>

      {/* Element info */}
      <div className="mt-3 p-2.5 rounded-xl bg-white/60">
        <p className="text-xs text-gray-600">
          💡 부족한 <span className="font-bold">{getElementName(deficientElement)}</span> 기운을
          보충하기 위한 추천입니다
        </p>
      </div>

      {/* CTA */}
      <Link href="https://cheongrium.com/shop/tea" target="_blank">
        <button className="mt-3 w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
          청리움 차 구매하기
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </motion.div>
  );
}
