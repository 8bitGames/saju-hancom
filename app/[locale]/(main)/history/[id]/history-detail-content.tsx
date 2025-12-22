"use client";

import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkle, Star, Atom, YinYang, Calendar, User, MapPin } from "@phosphor-icons/react";
import { STEM_KOREAN, ELEMENT_KOREAN } from "@/lib/saju";
import type { Gan, Element } from "@/lib/saju/types";
import { FourPillarsDisplay } from "@/components/saju/pillar-display";
import { ElementChart } from "@/components/saju/element-chart";
import { TenGodDisplay } from "@/components/saju/ten-god-display";
import { StarsDisplay } from "@/components/saju/stars-display";
import { useTranslations } from "next-intl";
import type { SajuResult } from "@/lib/supabase/types";

interface HistoryDetailContentProps {
  result: SajuResult;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

function GlowingCard({
  children,
  className = "",
  glowColor = "rgba(168, 85, 247, 0.4)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <motion.div className={`relative ${className}`} variants={itemVariants}>
      <div
        className="absolute -inset-1 rounded-2xl opacity-50"
        style={{ background: glowColor }}
      />
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-30"
        style={{ background: glowColor }}
      />
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

export function HistoryDetailContent({ result }: HistoryDetailContentProps) {
  const t = useTranslations("history");
  const data = result.result_data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="space-y-4" variants={itemVariants}>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t("backToHistory")}</span>
        </Link>

        <div className="text-center space-y-2 py-2">
          <p className="text-[#a855f7] text-sm font-medium tracking-wider">
            四柱八字
          </p>
          <h1 className="text-2xl font-bold text-white">
            {t("sajuAnalysis")}
          </h1>
        </div>

        {/* Birth Info Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-4 h-4 text-white/40" />
              <span>
                {result.birth_year}.{result.birth_month}.{result.birth_day}
                {result.is_lunar && (
                  <span className="text-white/40 ml-1">({t("lunar")})</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <User className="w-4 h-4 text-white/40" />
              <span>{result.gender === "male" ? t("male") : t("female")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4 text-white/40" />
              <span>{result.city}</span>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-3">
            {t("savedOn")}: {formatDate(result.created_at)}
          </p>
        </div>
      </motion.div>

      {/* Four Pillars */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.4)">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-[#a855f7]" weight="fill" />
            <h2 className="font-semibold text-white text-lg">{t("fourPillars")}</h2>
          </div>
          <FourPillarsDisplay pillars={data.pillars} />
          {data.meta?.trueSolarTime && (
            <div className="text-center pt-2">
              <p className="text-xs text-white/40">
                {t("trueSolarTime")}: {data.meta.trueSolarTime} (
                {data.meta.offsetMinutes > 0 ? "+" : ""}
                {data.meta.offsetMinutes}{t("minutes")})
              </p>
            </div>
          )}
        </div>
      </GlowingCard>

      {/* Day Master Info */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.5)">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <YinYang className="w-5 h-5 text-[#a855f7]" weight="fill" />
            <h2 className="font-semibold text-white text-lg">{t("dayMaster")}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
              {data.dayMaster}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-lg">
                {STEM_KOREAN[data.dayMaster as Gan]} ({ELEMENT_KOREAN[data.dayMasterElement as Element]})
              </p>
              <p className="text-base text-white/60">
                {data.dayMasterYinYang === "yang" ? t("yang") : t("yin")}{t("energy")}
              </p>
            </div>
          </div>
        </div>
      </GlowingCard>

      {/* Five Elements */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#a855f7]" weight="fill" />
              <h2 className="font-semibold text-white text-lg">{t("fiveElements")}</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[#a855f7]/20 text-[#a855f7]">
              {data.elementAnalysis.balance}
            </span>
          </div>
          <ElementChart
            scores={data.elementAnalysis.scores}
            dominant={data.elementAnalysis.dominant}
            lacking={data.elementAnalysis.lacking}
          />
          {data.elementAnalysis.yongShin && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-sm text-white/40">{t("recommendedYongShin")}</p>
              <p className="text-base font-medium text-[#a855f7]">
                {data.elementAnalysis.yongShin}
              </p>
            </div>
          )}
        </div>
      </GlowingCard>

      {/* Ten Gods */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-[#a855f7]" weight="fill" />
            <h2 className="font-semibold text-white text-lg">{t("tenGods")}</h2>
          </div>
          <TenGodDisplay summary={data.tenGodSummary} />
        </div>
      </GlowingCard>

      {/* Stars */}
      {data.stars && data.stars.length > 0 && (
        <GlowingCard glowColor="rgba(234, 179, 8, 0.3)">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" weight="fill" />
              <h2 className="font-semibold text-white text-lg">
                {t("stars")} ({data.stars.length})
              </h2>
            </div>
            <StarsDisplay stars={data.stars} />
          </div>
        </GlowingCard>
      )}

      {/* Back Button */}
      <motion.div className="pt-4 pb-8" variants={itemVariants}>
        <Link href="/history" className="block">
          <button className="w-full h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t("backToHistory")}</span>
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
