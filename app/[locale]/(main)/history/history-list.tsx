"use client";

import { useTranslations } from "next-intl";
import { Sparkle, Calendar, MapPin, User } from "@phosphor-icons/react";
import { Link } from "@/lib/i18n/navigation";
import type { SajuResult } from "@/lib/supabase/types";

interface HistoryListProps {
  results: SajuResult[];
}

export function HistoryList({ results }: HistoryListProps) {
  const t = useTranslations("history");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatBirthDate = (result: SajuResult) => {
    return `${result.birth_year}.${result.birth_month}.${result.birth_day}`;
  };

  const getGenderLabel = (gender: string) => {
    return gender === "male" ? t("male") : t("female");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60 px-1">
        {t("resultCount", { count: results.length })}
      </p>

      <div className="space-y-3">
        {results.map((result) => (
          <Link
            key={result.id}
            href={`/history/${result.id}`}
            className="block bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-[#a855f7]/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center flex-shrink-0">
                <Sparkle className="w-6 h-6 text-white" weight="fill" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                    {t("sajuAnalysis")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span>{formatBirthDate(result)}</span>
                    {result.is_lunar && (
                      <span className="text-xs text-white/40">({t("lunar")})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-white/40" />
                      <span>{getGenderLabel(result.gender)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-white/40" />
                      <span>{result.city}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/40 mt-3">
                  {formatDate(result.created_at)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-white/40 px-4 pt-4">
        {t("savedToAccount")}
      </p>
    </div>
  );
}
