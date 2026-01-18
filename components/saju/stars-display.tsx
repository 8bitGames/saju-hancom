"use client";

import { Star, Shield, Sparkle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Star as StarType } from "@/lib/saju/types";

interface StarsDisplayProps {
  stars: StarType[];
}

export function StarsDisplay({ stars }: StarsDisplayProps) {
  const auspicious = stars.filter((s) => s.type === "auspicious");
  const inauspicious = stars.filter((s) => s.type === "inauspicious");

  if (stars.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Sparkle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">발견된 신살이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Auspicious Stars */}
      {auspicious.length > 0 && (
        <div className="space-y-3">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" weight="fill" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800">
              길신
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600">
              {auspicious.length}
            </span>
          </motion.div>

          <div className="space-y-2">
            {auspicious.map((star, idx) => (
              <motion.div
                key={`${star.name}-${idx}`}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 hover:border-yellow-300 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-600" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-800 text-base mb-1">
                      {star.name}
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {star.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Inauspicious Stars */}
      {inauspicious.length > 0 && (
        <div className="space-y-3">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" weight="fill" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800">
              흉신
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {inauspicious.length}
            </span>
          </motion.div>

          <div className="space-y-2">
            {inauspicious.map((star, idx) => (
              <motion.div
                key={`${star.name}-${idx}`}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-gray-300 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-gray-400" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-800 text-base mb-1">
                      {star.name}
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {star.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
