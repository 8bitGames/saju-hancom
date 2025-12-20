"use client";

import { Star, Shield } from "@/components/ui/icons";
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
      <div className="text-center py-4 text-[var(--text-tertiary)]">
        <p className="text-sm">발견된 신살이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Auspicious Stars */}
      {auspicious.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[var(--warning)]" />
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              길신 ({auspicious.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {auspicious.map((star, idx) => (
              <div
                key={`${star.name}-${idx}`}
                className="p-3 rounded-xl glass-card border border-[var(--warning)]/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3 h-3 text-[var(--warning)]" />
                  <span className="font-medium text-[var(--text-primary)]">
                    {star.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {star.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inauspicious Stars */}
      {inauspicious.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--text-tertiary)]" />
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              흉신 ({inauspicious.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {inauspicious.map((star, idx) => (
              <div
                key={`${star.name}-${idx}`}
                className="p-3 rounded-xl glass-card border border-[var(--text-tertiary)]/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span className="font-medium text-[var(--text-primary)]">
                    {star.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {star.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
