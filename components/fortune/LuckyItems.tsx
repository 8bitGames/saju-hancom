"use client";

import { motion } from "framer-motion";
import {
  NumberCircleSeven,
  Palette,
  Compass,
  Clock,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export interface LuckyItemsData {
  number: number;
  color: {
    name: string;
    hex: string;
  };
  direction: string;
  time: string;
}

interface LuckyItemsProps {
  data: LuckyItemsData;
  locale: Locale;
  className?: string;
}

// Default lucky items for demonstration
const defaultData: LuckyItemsData = {
  number: 7,
  color: {
    name: "파란색",
    hex: "#3B82F6",
  },
  direction: "동쪽",
  time: "오전 10시",
};

export function LuckyItems({
  data = defaultData,
  locale,
  className,
}: LuckyItemsProps) {
  const items = [
    {
      icon: NumberCircleSeven,
      label: locale === "ko" ? "행운의 숫자" : "Lucky Number",
      value: data.number.toString(),
      color: "#8b5cf6",
    },
    {
      icon: Palette,
      label: locale === "ko" ? "행운의 색상" : "Lucky Color",
      value: data.color.name,
      colorSwatch: data.color.hex,
      color: "#ec4899",
    },
    {
      icon: Compass,
      label: locale === "ko" ? "행운의 방향" : "Lucky Direction",
      value: data.direction,
      color: "#22c55e",
    },
    {
      icon: Clock,
      label: locale === "ko" ? "행운의 시간" : "Lucky Time",
      value: data.time,
      color: "#f59e0b",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl p-4", className)}
    >
      <h3 className="text-sm font-bold text-gray-800 mb-3">
        {locale === "ko" ? "오늘의 행운 아이템" : "Today's Lucky Items"}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: item.color }}
                  weight="fill"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{item.label}</p>
                <div className="flex items-center gap-2">
                  {item.colorSwatch && (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: item.colorSwatch }}
                    />
                  )}
                  <p className="font-bold text-gray-800 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * Loading skeleton for Lucky Items
 */
export function LuckyItemsLoading({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl p-4 animate-pulse", className)}>
      <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
