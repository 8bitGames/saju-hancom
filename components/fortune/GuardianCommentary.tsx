"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChatCircle, MapPin } from "@phosphor-icons/react";
import { GUARDIANS, type ElementType } from "@/lib/constants/guardians";
import { SACRED_PLACES } from "@/lib/constants/sacred-places";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface GuardianCommentaryProps {
  element: ElementType;
  message: string;
  locale: Locale;
  className?: string;
  /**
   * 성지 정보를 함께 표시할지 여부 (기본: false)
   */
  showSacredPlace?: boolean;
}

export function GuardianCommentary({
  element,
  message,
  locale,
  className,
  showSacredPlace = false,
}: GuardianCommentaryProps) {
  const guardian = GUARDIANS[element];
  const sacredPlace = SACRED_PLACES[element];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl p-4 shadow-sm", className)}
    >
      <div className="flex gap-3">
        {/* Guardian Avatar */}
        <div className="flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: `${guardian.color}15`,
              border: `2px solid ${guardian.color}40`,
            }}
          >
            <Image
              src={guardian.imagePath}
              alt={guardian.name[locale]}
              width={36}
              height={36}
              className="object-cover rounded-full"
            />
          </div>
        </div>

        {/* Message Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-sm font-bold"
              style={{ color: guardian.color }}
            >
              {guardian.name[locale]}
            </span>
            <ChatCircle
              className="w-4 h-4"
              style={{ color: guardian.color }}
              weight="fill"
            />
          </div>

          {/* Sacred Place Tag (Optional) */}
          {showSacredPlace && (
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 text-gray-400" weight="fill" />
              <span className="text-xs text-gray-400">
                {sacredPlace.name[locale]}
                {locale === "ko" ? "에서" : ""}
              </span>
            </div>
          )}

          <div
            className="relative p-3 rounded-xl rounded-tl-none"
            style={{
              backgroundColor: `${guardian.color}10`,
            }}
          >
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Guardian Commentary with loading state
 */
export function GuardianCommentaryLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 shadow-sm animate-pulse",
        className
      )}
    >
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
          <div className="p-3 rounded-xl rounded-tl-none bg-gray-100">
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
