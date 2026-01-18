"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";
import { CarelinkRecommendationList } from "./CarelinkRecommendation";
import { CheongriumProgramList } from "./CheongriumProgramRecommendation";
import { CheongriumProductRecommendation } from "./CheongriumProductRecommendation";
import { TeaRecommendation } from "./TeaRecommendation";
import {
  generateMockSajuResult,
  generateRecommendations,
  type RecommendationResult,
  type MockSajuResult,
} from "@/lib/recommendation/engine";
import type { ElementType } from "@/lib/constants/guardians";
import { GUARDIANS } from "@/lib/constants/guardians";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface RecommendationsPanelProps {
  // Optional: pass in saju result, otherwise uses mock data
  dominantElement?: ElementType;
  deficientElement?: ElementType;
  locale?: Locale;
  className?: string;
  showTitle?: boolean;
}

export function RecommendationsPanel({
  dominantElement,
  deficientElement,
  locale = "ko",
  className,
  showTitle = true,
}: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock saju result or use provided elements
    const mockResult: MockSajuResult = dominantElement
      ? {
          dominantElement,
          deficientElement: deficientElement || "water",
          healthKeywords: ["건강 관리 필요", "체력 관리"],
          stressKeywords: ["스트레스 해소", "마음의 안정"],
          relationshipKeywords: ["인간관계 조화"],
          careerKeywords: ["성장 기회"],
          overallFortune: "건강과 내면의 평화에 집중하면 좋은 시기입니다.",
        }
      : generateMockSajuResult();

    const recs = generateRecommendations(mockResult);
    setRecommendations(recs);
    setIsLoading(false);
  }, [dominantElement, deficientElement]);

  if (isLoading || !recommendations) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-2xl h-40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const element = dominantElement || recommendations.dailyEnergy.dominantElement;
  const guardian = GUARDIANS[element];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Title Section */}
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-1"
        >
          <Sparkle
            className="w-5 h-5"
            weight="fill"
            style={{ color: guardian.color }}
          />
          <h2 className="text-lg font-bold text-gray-800">
            {guardian.name[locale]}의 맞춤 추천
          </h2>
        </motion.div>
      )}

      {/* Carelink Health Recommendations */}
      {recommendations.carelink.length > 0 && (
        <CarelinkRecommendationList
          recommendations={recommendations.carelink}
          element={element}
          locale={locale}
        />
      )}

      {/* Tea Recommendation */}
      {recommendations.tea && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 px-1">
            🍵 맞춤 차 추천
          </h3>
          <TeaRecommendation recommendation={recommendations.tea} />
        </div>
      )}

      {/* Cheongrium Programs */}
      {recommendations.cheongrium.length > 0 && (
        <CheongriumProgramList
          recommendations={recommendations.cheongrium}
          locale={locale}
        />
      )}

      {/* Cheongrium Products */}
      {recommendations.products.length > 0 && (
        <CheongriumProductRecommendation
          recommendations={recommendations.products}
        />
      )}
    </div>
  );
}
