"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowRight,
  Star,
  Fire,
  Drop,
  TreeEvergreen,
  Mountains,
  Flower,
} from "@phosphor-icons/react";
import type { CheongriumProductRecommendation as ProductRec } from "@/lib/recommendation/engine";
import type { ElementType } from "@/lib/constants/guardians";
import { cn } from "@/lib/utils";

interface CheongriumProductRecommendationProps {
  recommendations: ProductRec[];
  className?: string;
}

// Element display configuration
const ELEMENT_CONFIG: Record<
  ElementType,
  { icon: typeof Fire; color: string; name: string; bg: string }
> = {
  wood: {
    icon: TreeEvergreen,
    color: "#22C55E",
    name: "목",
    bg: "bg-green-50",
  },
  fire: {
    icon: Fire,
    color: "#EF4444",
    name: "화",
    bg: "bg-red-50",
  },
  earth: {
    icon: Flower,
    color: "#A16207",
    name: "토",
    bg: "bg-amber-50",
  },
  metal: {
    icon: Mountains,
    color: "#6B7280",
    name: "금",
    bg: "bg-gray-100",
  },
  water: {
    icon: Drop,
    color: "#3B82F6",
    name: "수",
    bg: "bg-blue-50",
  },
};

// Product emoji based on product id
function getProductEmoji(productId: string): string {
  switch (productId) {
    case "geumhong_tea":
      return "🍵";
    case "honey_set":
      return "🍯";
    case "pine_nut_set":
      return "🌰";
    case "herb_tea_blend":
      return "🌿";
    default:
      return "🎁";
  }
}

export function CheongriumProductRecommendation({
  recommendations,
  className,
}: CheongriumProductRecommendationProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-4 h-4 text-white" weight="fill" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">청리움 추천 제품</h3>
          </div>
        </div>
        <Link
          href="https://cheongrium.com/shop"
          target="_blank"
          className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-0.5"
        >
          전체보기
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Horizontal Scroll Product Cards */}
      <div className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {recommendations.slice(0, 4).map((rec, index) => {
            const primaryElement = rec.product.targetElements[0];
            const elementConfig = ELEMENT_CONFIG[primaryElement];
            const ElementIcon = elementConfig.icon;

            return (
              <motion.div
                key={rec.product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[140px] snap-start"
              >
                <Link href={rec.product.purchaseUrl} target="_blank">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all h-full">
                    {/* Product Image Area */}
                    <div
                      className={cn(
                        "relative h-[100px] flex items-center justify-center",
                        elementConfig.bg
                      )}
                    >
                      {/* Product Emoji as Placeholder */}
                      <span className="text-4xl">
                        {getProductEmoji(rec.product.id)}
                      </span>

                      {/* Element Badge */}
                      <div
                        className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm"
                        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                      >
                        <ElementIcon
                          className="w-3 h-3"
                          style={{ color: elementConfig.color }}
                          weight="fill"
                        />
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: elementConfig.color }}
                        >
                          {elementConfig.name}
                        </span>
                      </div>

                      {/* Tag Badge */}
                      {rec.product.tags[0] && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-bold">
                          {rec.product.tags[0]}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h4 className="font-bold text-gray-800 text-xs mb-1 line-clamp-2 leading-tight">
                        {rec.product.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">
                        {rec.product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-600">
                          {rec.product.price}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* See More Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-shrink-0 w-[100px] snap-start"
          >
            <Link href="https://cheongrium.com/shop" target="_blank">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 h-full flex flex-col items-center justify-center p-4 hover:from-amber-100 hover:to-orange-100 transition-colors min-h-[180px]">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <ArrowRight className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs text-amber-700 font-medium text-center">
                  더 많은
                  <br />
                  제품 보기
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Recommendation Reason */}
      {recommendations[0] && (
        <div className="px-1">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
            <p className="text-xs text-amber-700 leading-relaxed">
              {recommendations[0].reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
