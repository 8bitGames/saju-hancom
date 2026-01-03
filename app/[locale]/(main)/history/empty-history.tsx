"use client";

import { useTranslations } from "next-intl";
import { ClockCounterClockwise, Sparkle, UsersThree, Eye } from "@phosphor-icons/react";
import { Link } from "@/lib/i18n/navigation";

export function EmptyHistory() {
  const t = useTranslations("history");
  const tNav = useTranslations("nav");

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-6">
          <ClockCounterClockwise className="w-10 h-10 text-white/30" />
        </div>
        <p className="text-white/60 mb-8">
          {t("empty")}
        </p>

        <div className="space-y-4">
          <p className="text-xs text-white/40">
            {t("startAnalysis")}
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/saju"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-accent-primary text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkle className="w-5 h-5" weight="fill" />
              {tNav("saju")}
            </Link>
            <Link
              href="/compatibility"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-info text-white font-medium hover:opacity-90 transition-opacity"
            >
              <UsersThree className="w-5 h-5" weight="fill" />
              {tNav("compatibility")}
            </Link>
            <Link
              href="/face-reading"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-error text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Eye className="w-5 h-5" weight="fill" />
              {tNav("faceReading")}
            </Link>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-white/40 px-4">
        {t("savedToAccount")}
      </p>
    </>
  );
}
