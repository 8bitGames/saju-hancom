"use client";

import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkle, Star, Atom, YinYang, ChatCircle, Lightning, Heart, Lightbulb } from "@phosphor-icons/react";
import { STEM_KOREAN, ELEMENT_KOREAN } from "@/lib/saju";
import type { Gan, Element } from "@/lib/saju/types";
import { FourPillarsDisplay } from "@/components/saju/pillar-display";
import { ElementChart } from "@/components/saju/element-chart";
import { TenGodDisplay } from "@/components/saju/ten-god-display";
import { StarsDisplay } from "@/components/saju/stars-display";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import type { Gender } from "@/lib/saju/types";

interface SharedSajuResultContentProps {
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  resultData: any;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
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

// Glowing card wrapper
function GlowingCard({
  children,
  className = "",
  glowColor = "rgba(168, 85, 247, 0.4)",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  variants?: typeof itemVariants;
}) {
  return (
    <motion.div className={`relative ${className}`} variants={variants}>
      <div
        className="absolute -inset-1 rounded-2xl glow-constant"
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

export function SharedSajuResultContent({ birthData, resultData }: SharedSajuResultContentProps) {
  const { year, month, day, hour, minute, gender, isLunar, city } = birthData;
  const result = resultData;
  const interpretation = result.interpretation;

  const queryString = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
    day: day.toString(),
    hour: hour.toString(),
    minute: minute.toString(),
    gender,
    isLunar: isLunar.toString(),
    city,
  }).toString();

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Shared Banner */}
      <motion.div
        className="text-center py-3 bg-purple-500/10 rounded-xl border border-purple-500/20"
        variants={itemVariants}
      >
        <p className="text-sm text-purple-300">
          공유된 사주 분석 결과입니다
        </p>
      </motion.div>

      {/* Header */}
      <motion.div
        className="text-center space-y-2 py-4"
        variants={itemVariants}
      >
        <motion.p
          className="text-[#a855f7] text-sm font-medium tracking-wider"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          四柱八字
        </motion.p>
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          사주 분석 결과
        </motion.h1>
        <TextGenerateEffect
          words={`${result.meta?.solarDate || `${year}년 ${month}월 ${day}일`} (${gender === "male" ? "남" : "여"})`}
          className="text-base text-white/60"
          duration={0.3}
        />
      </motion.div>

      {/* Four Pillars */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.4)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Atom className="w-5 h-5 text-[#a855f7]" weight="fill" />
            <h2 className="font-semibold text-white text-lg">사주팔자</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <FourPillarsDisplay pillars={result.pillars} />
          </motion.div>
          {result.meta?.trueSolarTime && (
            <motion.div
              className="text-center pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-white/40">
                진태양시 보정: {result.meta.trueSolarTime} (
                {result.meta.offsetMinutes > 0 ? "+" : ""}
                {result.meta.offsetMinutes}분)
              </p>
            </motion.div>
          )}
        </div>
      </GlowingCard>

      {/* Day Master Info */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.5)" variants={itemVariants}>
        <div className="p-5 space-y-3">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <YinYang className="w-5 h-5 text-[#a855f7]" weight="fill" />
            <h2 className="font-semibold text-white text-lg">일간 (일주)</h2>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.5
              }}
              whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
            >
              {result.dayMaster}
            </motion.div>
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="font-medium text-white text-lg">
                {STEM_KOREAN[result.dayMaster as Gan]} ({ELEMENT_KOREAN[result.dayMasterElement as Element]})
              </p>
              <p className="text-base text-white/60">
                {result.dayMasterYinYang === "yang" ? "양" : "음"}의 기운
              </p>
            </motion.div>
          </div>
        </div>
      </GlowingCard>

      {/* Five Elements */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Star className="w-5 h-5 text-[#a855f7]" weight="fill" />
              <h2 className="font-semibold text-white text-lg">오행 분석</h2>
            </motion.div>
            <motion.span
              className="text-xs px-3 py-1 rounded-full bg-[#a855f7]/20 text-[#a855f7]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              {result.elementAnalysis?.balance}
            </motion.span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ElementChart
              scores={result.elementAnalysis?.scores}
              dominant={result.elementAnalysis?.dominant}
              lacking={result.elementAnalysis?.lacking}
            />
          </motion.div>
          {result.elementAnalysis?.yongShin && (
            <motion.div
              className="pt-3 border-t border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-sm text-white/40">추천 용신</p>
              <motion.p
                className="text-base font-medium text-[#a855f7]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                {result.elementAnalysis.yongShin}
              </motion.p>
            </motion.div>
          )}
        </div>
      </GlowingCard>

      {/* Ten Gods */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Sparkle className="w-5 h-5 text-[#a855f7]" weight="fill" />
            <h2 className="font-semibold text-white text-lg">십성 분석</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <TenGodDisplay summary={result.tenGodSummary} />
          </motion.div>
        </div>
      </GlowingCard>

      {/* Stars */}
      <GlowingCard glowColor="rgba(234, 179, 8, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Star className="w-5 h-5 text-yellow-400" weight="fill" />
            <h2 className="font-semibold text-white text-lg">
              신살 ({result.stars?.length || 0})
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <StarsDisplay stars={result.stars || []} />
          </motion.div>
        </div>
      </GlowingCard>

      {/* AI Interpretation - if available */}
      {interpretation && (
        <GlowingCard glowColor="rgba(236, 72, 153, 0.4)" variants={itemVariants}>
          <div className="p-5 space-y-4">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <ChatCircle className="w-5 h-5 text-pink-400" weight="fill" />
              <h2 className="font-semibold text-white text-lg">사주 풀이</h2>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Overall Message */}
              {interpretation.overallMessage && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                  <p className="text-white/90 text-base leading-relaxed">
                    {typeof interpretation.overallMessage === 'string'
                      ? interpretation.overallMessage
                      : '사주 해석이 완료되었습니다.'}
                  </p>
                </div>
              )}

              {/* Personality */}
              {interpretation.personalityReading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" weight="fill" />
                    <h3 className="text-sm font-medium text-white/80">성격과 기질</h3>
                  </div>
                  {interpretation.personalityReading.summary && (
                    <p className="text-sm text-white/70 leading-relaxed">
                      {typeof interpretation.personalityReading.summary === 'string'
                        ? interpretation.personalityReading.summary
                        : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Element Insight */}
              {interpretation.elementInsight && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightning className="w-4 h-4 text-yellow-400" weight="fill" />
                    <h3 className="text-sm font-medium text-white/80">오행의 기운</h3>
                  </div>
                  {interpretation.elementInsight.balance && (
                    <p className="text-sm text-white/70 leading-relaxed">
                      {typeof interpretation.elementInsight.balance === 'string'
                        ? interpretation.elementInsight.balance
                        : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Ten God Insight */}
              {interpretation.tenGodInsight && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-400" weight="fill" />
                    <h3 className="text-sm font-medium text-white/80">삶의 패턴</h3>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {typeof interpretation.tenGodInsight.dominant === 'string' ? interpretation.tenGodInsight.dominant : ''}{' '}
                    {typeof interpretation.tenGodInsight.lifePattern === 'string' ? interpretation.tenGodInsight.lifePattern : ''}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </GlowingCard>
      )}

      {/* CTA to try own analysis */}
      <motion.div
        className="pt-4"
        variants={itemVariants}
      >
        <Link href="/saju" className="block">
          <motion.button
            className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center gap-2 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            나도 사주 분석 해보기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        className="text-center text-xs text-white/40 pt-2 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.
      </motion.p>
    </motion.div>
  );
}
