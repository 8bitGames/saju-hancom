"use client";

import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  UsersThree,
  ArrowCounterClockwise,
  Heart,
  ChatCircle,
  Fire,
  House,
  Sparkle,
  Check,
  Warning,
  Star,
  ArrowRight,
  Brain,
  ArrowLeft,
  Calendar,
  Handshake,
  Scales,
  Lightning,
  ChartBar,
  Clock,
  Lightbulb,
  CalendarBlank,
  Clover,
} from "@phosphor-icons/react";
import { ELEMENT_KOREAN } from "@/lib/saju";
import type { CoupleRelationType } from "@/lib/couple/types";

interface AIInterpretation {
  summary: string;
  communication: string;
  chemistry: string;
  challenges: string;
  advice: string;
}

interface DetailedResult {
  overallScore: number;
  grade: string;
  gradeText: string;
  summary: string;
  cheonganHap: {
    person1Gan: string;
    person2Gan: string;
    hasHap: boolean;
    hapType?: string;
    hapElement?: string;
    description: string;
  };
  jijiRelation: {
    yukHap: { pairs: Array<{ zhi1: string; zhi2: string; resultElement: string }>; description: string };
    samHap: { groups: Array<{ zhis: string[]; resultElement: string }>; description: string };
    chung: { pairs: Array<{ zhi1: string; zhi2: string }>; description: string };
    hyung: { pairs: Array<{ zhi1: string; zhi2: string }>; description: string };
  };
  iljuCompatibility: {
    person1Ilju: string;
    person2Ilju: string;
    ganRelation: string;
    zhiRelation: string;
    overallIljuScore: number;
    description: string;
  };
  elementBalanceAnalysis: {
    person1Dominant: string;
    person2Dominant: string;
    person1Weak: string;
    person2Weak: string;
    complementary: boolean;
    description: string;
  };
  relationshipAnalysis: {
    emotional: { score: number; description: string };
    physical: { score: number; description: string };
    intellectual: { score: number; description: string };
    spiritual: { score: number; description: string };
    financial: { score: number; description: string };
  };
  timingAnalysis: {
    shortTerm: { score: number; description: string };
    midTerm: { score: number; description: string };
    longTerm: { score: number; description: string };
  };
  strengths: string[];
  challenges: string[];
  adviceForPerson1: string[];
  adviceForPerson2: string[];
  recommendedActivities: string[];
  luckyDates: string[];
  luckyElements: {
    colors: string[];
    directions: string[];
    numbers: number[];
  };
}

interface CoupleResult {
  id: string;
  p1_name: string;
  p1_birth_year: number;
  p1_birth_month: number;
  p1_birth_day: number;
  p1_birth_hour: number;
  p1_birth_minute: number;
  p1_gender: string;
  p1_is_lunar: boolean;
  p2_name: string;
  p2_birth_year: number;
  p2_birth_month: number;
  p2_birth_day: number;
  p2_birth_hour: number;
  p2_birth_minute: number;
  p2_gender: string;
  p2_is_lunar: boolean;
  relation_type: CoupleRelationType;
  result_data: {
    score: number;
    gradeText: string;
    person1Pillars: {
      year: { gan: string; zhi: string };
      month: { gan: string; zhi: string };
      day: { gan: string; zhi: string };
      time: { gan: string; zhi: string };
    };
    person2Pillars: {
      year: { gan: string; zhi: string };
      month: { gan: string; zhi: string };
      day: { gan: string; zhi: string };
      time: { gan: string; zhi: string };
    };
    analysis: {
      romance: { score: number; description: string };
      communication: { score: number; description: string };
      passion: { score: number; description: string };
      stability: { score: number; description: string };
      future: { score: number; description: string };
    };
    elementBalance: {
      person1: Record<string, number>;
      person2: Record<string, number>;
    };
    luckyElements: string[];
    relationshipAdvice: string[];
    cautions: string[];
    interpretation?: AIInterpretation;
    detailedResult?: DetailedResult;
  };
  created_at: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
};

// Glowing card wrapper
function GlowingCard({
  children,
  className = "",
  glowColor = "rgba(236, 72, 153, 0.4)",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  variants?: any;
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

function getScoreColor(score: number): string {
  if (score >= 80) return "text-pink-400";
  if (score >= 60) return "text-rose-400";
  if (score >= 40) return "text-white";
  return "text-orange-400";
}

function getRelationTypeKorean(type?: string): string {
  switch (type) {
    case "dating": return "연인";
    case "engaged": return "약혼자";
    case "married": return "배우자";
    case "interested": return "관심 상대";
    case "exPartner": return "전 연인";
    default: return "연인";
  }
}

// Animated counter component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

// Animated score bar
function AnimatedScoreBar({ score, label, delay = 0 }: { score: number; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex justify-between text-base">
        <span className="text-white/60">{label}</span>
        <motion.span
          className={`font-bold ${getScoreColor(score)}`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: delay + 0.3 }}
        >
          <AnimatedCounter value={score} duration={1.5} />점
        </motion.span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${score}%` } : { width: 0 }}
          transition={{
            duration: 1.2,
            delay: delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      </div>
    </div>
  );
}

function PersonPillarsDisplay({
  name,
  pillars,
  label,
  delay = 0,
}: {
  name: string;
  pillars: {
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    time: { gan: string; zhi: string };
  };
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-[#ec4899]" weight="fill" />
        <span className="text-base font-medium text-white">
          {label}: {name}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(["year", "month", "day", "time"] as const).map((pillar, index) => {
          const p = pillars[pillar];
          return (
            <motion.div
              key={pillar}
              className="relative group text-center"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: delay + 0.1 + index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
            >
              <div className="absolute -inset-0.5 rounded-xl bg-pink-500/20 blur-sm group-hover:bg-pink-500/40 transition-all duration-300" />
              <div className="relative p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-pink-500/50 transition-colors">
                <p className="text-xs text-white/40 mb-1">
                  {pillar === "year" ? "년" : pillar === "month" ? "월" : pillar === "day" ? "일" : "시"}
                </p>
                <p className="text-lg font-bold text-white">{p.gan}{p.zhi}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function CoupleHistoryContent({ result }: { result: CoupleResult }) {
  const t = useTranslations("couple");
  const data = result.result_data;
  const aiInterpretation = data.interpretation;
  const detailedResult = data.detailedResult;

  // Format date
  const createdDate = new Date(result.created_at);
  const formattedDate = createdDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 상세 분석 URL 생성
  const detailParams = new URLSearchParams({
    p1Name: result.p1_name,
    p1Year: result.p1_birth_year.toString(),
    p1Month: result.p1_birth_month.toString(),
    p1Day: result.p1_birth_day.toString(),
    p1Hour: result.p1_birth_hour.toString(),
    p1Minute: result.p1_birth_minute.toString(),
    p1Gender: result.p1_gender,
    p1IsLunar: result.p1_is_lunar.toString(),
    p1City: "서울",
    p2Name: result.p2_name,
    p2Year: result.p2_birth_year.toString(),
    p2Month: result.p2_birth_month.toString(),
    p2Day: result.p2_birth_day.toString(),
    p2Hour: result.p2_birth_hour.toString(),
    p2Minute: result.p2_birth_minute.toString(),
    p2Gender: result.p2_gender,
    p2IsLunar: result.p2_is_lunar.toString(),
    p2City: "서울",
    relationType: result.relation_type || "dating",
  });
  const detailUrl = `/compatibility/detail-result?${detailParams.toString()}`;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Link href="/history" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">기록으로 돌아가기</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        className="text-center space-y-2 py-4"
        variants={itemVariants}
      >
        <motion.p
          className="text-[#ec4899] text-sm font-medium tracking-wider"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          緣分分析
        </motion.p>
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {t("result.title")}
        </motion.h1>
        <p className="text-base text-white/60">
          {result.p1_name}님과 {result.p2_name}님의 {getRelationTypeKorean(result.relation_type)} 궁합
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-white/40">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
      </motion.div>

      {/* Score Card */}
      <GlowingCard glowColor="rgba(236, 72, 153, 0.5)" variants={itemVariants}>
        <div className="p-6 text-center">
          <motion.div
            className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.4
            }}
          >
            <span className="text-6xl font-bold text-white">
              <AnimatedCounter value={data.score} duration={2} />
            </span>
          </motion.div>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 text-pink-300 font-bold text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Heart className="w-5 h-5" weight="fill" />
            </motion.div>
            {data.gradeText}
          </motion.div>
        </div>
      </GlowingCard>

      {/* Two Person Pillars */}
      <GlowingCard glowColor="rgba(236, 72, 153, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <UsersThree className="w-5 h-5 text-[#ec4899]" weight="fill" />
            <h2 className="text-lg font-semibold text-white">{t("result.pillars")}</h2>
          </div>

          <PersonPillarsDisplay
            name={result.p1_name}
            pillars={data.person1Pillars}
            label={t("person1")}
            delay={0.1}
          />

          <motion.div
            className="flex items-center justify-center py-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart className="w-6 h-6 text-pink-400" weight="fill" />
            </motion.div>
          </motion.div>

          <PersonPillarsDisplay
            name={result.p2_name}
            pillars={data.person2Pillars}
            label={t("person2")}
            delay={0.3}
          />
        </div>
      </GlowingCard>

      {/* Analysis Cards */}
      <GlowingCard glowColor="rgba(236, 72, 153, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#ec4899]" weight="fill" />
            <h2 className="text-lg font-semibold text-white">{t("result.analysis")}</h2>
          </div>

          <div className="space-y-4">
            {[
              { icon: Heart, color: "text-pink-400", label: t("result.romance"), data: data.analysis.romance, delay: 0 },
              { icon: ChatCircle, color: "text-blue-400", label: t("result.communication"), data: data.analysis.communication, delay: 0.15 },
              { icon: Fire, color: "text-orange-400", label: t("result.passion"), data: data.analysis.passion, delay: 0.3 },
              { icon: House, color: "text-green-400", label: t("result.stability"), data: data.analysis.stability, delay: 0.45 },
              { icon: Sparkle, color: "text-purple-400", label: t("result.future"), data: data.analysis.future, delay: 0.6 },
            ].map(({ icon: Icon, color, label, data: analysisData, delay }) => (
              <motion.div
                key={label}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay }}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${color}`} weight="fill" />
                  <span className="text-base font-medium text-white">{label}</span>
                </div>
                <AnimatedScoreBar score={analysisData.score} label="" delay={delay} />
                <motion.p
                  className="text-sm text-white/60"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: delay + 0.3 }}
                >
                  {analysisData.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </GlowingCard>

      {/* AI Interpretation */}
      {aiInterpretation && (
        <GlowingCard glowColor="rgba(236, 72, 153, 0.4)" variants={itemVariants}>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-400" weight="fill" />
              <h2 className="text-lg font-semibold text-white">맞춤 궁합 해석</h2>
            </div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Summary */}
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <p className="text-white/90 text-base leading-relaxed">{aiInterpretation.summary}</p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {aiInterpretation.communication && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ChatCircle className="w-4 h-4 text-blue-400" weight="fill" />
                      <span className="text-sm font-medium text-blue-400">소통과 감정 교류</span>
                    </div>
                    <p className="text-white/70 text-sm pl-6">{aiInterpretation.communication}</p>
                  </div>
                )}

                {aiInterpretation.chemistry && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" weight="fill" />
                      <span className="text-sm font-medium text-pink-400">애정과 케미스트리</span>
                    </div>
                    <p className="text-white/70 text-sm pl-6">{aiInterpretation.chemistry}</p>
                  </div>
                )}

                {aiInterpretation.challenges && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Warning className="w-4 h-4 text-orange-400" weight="fill" />
                      <span className="text-sm font-medium text-orange-400">주의할 점</span>
                    </div>
                    <p className="text-white/70 text-sm pl-6">{aiInterpretation.challenges}</p>
                  </div>
                )}

                {aiInterpretation.advice && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-purple-400" weight="fill" />
                      <span className="text-sm font-medium text-purple-400">조언</span>
                    </div>
                    <p className="text-white/70 text-sm pl-6">{aiInterpretation.advice}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </GlowingCard>
      )}

      {/* Detailed Myeongrihak Result (if saved) */}
      {detailedResult && (
        <>
          <GlowingCard glowColor="rgba(147, 51, 234, 0.4)" variants={itemVariants}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-purple-400" weight="fill" />
                <h2 className="text-lg font-semibold text-white">천간합(天干合) 분석</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-white/40">{result.p1_name}님 일간</p>
                  <p className="text-2xl font-bold text-purple-400">{detailedResult.cheonganHap.person1Gan}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-white/40">{result.p2_name}님 일간</p>
                  <p className="text-2xl font-bold text-purple-400">{detailedResult.cheonganHap.person2Gan}</p>
                </div>
              </div>
              {detailedResult.cheonganHap.hasHap && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Sparkle className="w-5 h-5 text-purple-400" weight="fill" />
                  <div>
                    <p className="text-base font-medium text-purple-400">{detailedResult.cheonganHap.hapType}</p>
                    {detailedResult.cheonganHap.hapElement && (
                      <p className="text-sm text-white/60">합화 오행: {detailedResult.cheonganHap.hapElement}</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-base text-white/80">{detailedResult.cheonganHap.description}</p>
            </div>
          </GlowingCard>

          <GlowingCard glowColor="rgba(6, 182, 212, 0.3)" variants={itemVariants}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Scales className="w-5 h-5 text-cyan-400" weight="fill" />
                <h2 className="text-lg font-semibold text-white">지지(地支) 관계 분석</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <h3 className="text-sm font-medium text-green-400 mb-2">육합(六合)</h3>
                  {detailedResult.jijiRelation.yukHap.pairs.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {detailedResult.jijiRelation.yukHap.pairs.map((pair, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                          {pair.zhi1} + {pair.zhi2} → {pair.resultElement}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">육합 관계 없음</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <h3 className="text-sm font-medium text-orange-400 mb-2">충(沖)</h3>
                  {detailedResult.jijiRelation.chung.pairs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detailedResult.jijiRelation.chung.pairs.map((pair, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                          {pair.zhi1} ↔ {pair.zhi2}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">충 관계 없음</p>
                  )}
                </div>
              </div>
            </div>
          </GlowingCard>

          <GlowingCard glowColor="rgba(236, 72, 153, 0.3)" variants={itemVariants}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" weight="fill" />
                <h2 className="text-lg font-semibold text-white">일주(日柱) 궁합</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-white/40">{result.p1_name}님 일주</p>
                  <p className="text-2xl font-bold text-pink-400">{detailedResult.iljuCompatibility.person1Ilju}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-white/40">{result.p2_name}님 일주</p>
                  <p className="text-2xl font-bold text-pink-400">{detailedResult.iljuCompatibility.person2Ilju}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-xs text-white/40">일간 관계</p>
                  <p className="text-base font-medium text-white">{detailedResult.iljuCompatibility.ganRelation}</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-pink-500/20 text-center">
                  <p className="text-xs text-white/40">일주 점수</p>
                  <p className="text-lg font-bold text-pink-400">{detailedResult.iljuCompatibility.overallIljuScore}점</p>
                </div>
              </div>
              <p className="text-base text-white/80">{detailedResult.iljuCompatibility.description}</p>
            </div>
          </GlowingCard>

          <GlowingCard glowColor="rgba(234, 179, 8, 0.3)" variants={itemVariants}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lightning className="w-5 h-5 text-yellow-400" weight="fill" />
                <h2 className="text-lg font-semibold text-white">오행(五行) 균형 분석</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-sm text-white/40">{result.p1_name}님</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                      강: {detailedResult.elementBalanceAnalysis.person1Dominant}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                      약: {detailedResult.elementBalanceAnalysis.person1Weak}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white/40">{result.p2_name}님</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                      강: {detailedResult.elementBalanceAnalysis.person2Dominant}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                      약: {detailedResult.elementBalanceAnalysis.person2Weak}
                    </span>
                  </div>
                </div>
              </div>
              {detailedResult.elementBalanceAnalysis.complementary && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                  <Check className="w-5 h-5 text-green-400" weight="bold" />
                  <p className="text-base text-green-400">서로 보완하는 관계입니다</p>
                </div>
              )}
              <p className="text-base text-white/80">{detailedResult.elementBalanceAnalysis.description}</p>
            </div>
          </GlowingCard>

          <GlowingCard glowColor="rgba(59, 130, 246, 0.3)" variants={itemVariants}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" weight="fill" />
                <h2 className="text-lg font-semibold text-white">시간에 따른 궁합 변화</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "단기 (1-2년)", data: detailedResult.timingAnalysis.shortTerm },
                  { label: "중기 (3-5년)", data: detailedResult.timingAnalysis.midTerm },
                  { label: "장기 (5년+)", data: detailedResult.timingAnalysis.longTerm },
                ].map(({ label, data: timing }, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{label}</span>
                      <span className={`text-base font-bold ${timing.score >= 80 ? "text-green-400" : timing.score >= 60 ? "text-blue-400" : "text-white"}`}>
                        {timing.score}점
                      </span>
                    </div>
                    <p className="text-sm text-white/60">{timing.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlowingCard>

          {/* Strengths and Challenges */}
          <div className="grid grid-cols-1 gap-4">
            <GlowingCard glowColor="rgba(34, 197, 94, 0.3)" variants={itemVariants}>
              <div className="p-5 space-y-3">
                <h2 className="text-lg font-semibold text-green-400">관계의 강점</h2>
                <ul className="space-y-2">
                  {detailedResult.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowingCard>

            <GlowingCard glowColor="rgba(249, 115, 22, 0.3)" variants={itemVariants}>
              <div className="p-5 space-y-3">
                <h2 className="text-lg font-semibold text-orange-400">도전 과제</h2>
                <ul className="space-y-2">
                  {detailedResult.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                      <Warning className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" weight="bold" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowingCard>
          </div>

          {/* Individual Advice */}
          <div className="grid grid-cols-1 gap-4">
            <GlowingCard glowColor="rgba(59, 130, 246, 0.3)" variants={itemVariants}>
              <div className="p-5 space-y-3">
                <h2 className="text-lg font-semibold text-blue-400">{result.p1_name}님께 드리는 조언</h2>
                <ul className="space-y-2">
                  {detailedResult.adviceForPerson1.map((advice, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                      <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" weight="fill" />
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowingCard>

            <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
              <div className="p-5 space-y-3">
                <h2 className="text-lg font-semibold text-purple-400">{result.p2_name}님께 드리는 조언</h2>
                <ul className="space-y-2">
                  {detailedResult.adviceForPerson2.map((advice, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                      <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" weight="fill" />
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowingCard>
          </div>

          {/* Lucky Elements */}
          <GlowingCard glowColor="rgba(34, 197, 94, 0.4)" variants={itemVariants}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clover className="w-5 h-5 text-green-400" weight="fill" />
                <h2 className="text-lg font-semibold text-white">함께할 때 행운의 요소</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/40 mb-2">색상</p>
                  <div className="flex flex-wrap gap-2">
                    {detailedResult.luckyElements.colors.map((color, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/40 mb-2">방향</p>
                  <div className="flex flex-wrap gap-2">
                    {detailedResult.luckyElements.directions.map((direction, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                        {direction}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/40 mb-2">숫자</p>
                  <div className="flex flex-wrap gap-2">
                    {detailedResult.luckyElements.numbers.map((number, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                        {number}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlowingCard>
        </>
      )}

      {/* Element Balance */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">{t("result.elementBalance")}</h2>
          <div className="grid grid-cols-5 gap-2">
            {(["wood", "fire", "earth", "metal", "water"] as const).map(
              (element, index) => {
                const person1Score = data.elementBalance.person1[element];
                const person2Score = data.elementBalance.person2[element];
                const elementColors: Record<string, string> = {
                  wood: "#22c55e",
                  fire: "#ef4444",
                  earth: "#eab308",
                  metal: "#94a3b8",
                  water: "#3b82f6",
                };
                return (
                  <motion.div
                    key={element}
                    className="relative group text-center"
                    initial={{ opacity: 0, scale: 0.5, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <div
                      className="absolute -inset-0.5 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ background: elementColors[element] }}
                    />
                    <div className="relative p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm font-medium text-white">
                        {ELEMENT_KOREAN[element]}
                      </p>
                      <motion.p
                        className="text-base font-bold"
                        style={{ color: elementColors[element] }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {person1Score}
                      </motion.p>
                      <p className="text-xs text-white/40">vs {person2Score}</p>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        </div>
      </GlowingCard>

      {/* Lucky Elements */}
      {data.luckyElements && data.luckyElements.length > 0 && (
        <GlowingCard glowColor="rgba(236, 72, 153, 0.4)" variants={itemVariants}>
          <div className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-pink-300">{t("result.luckyElements")}</h2>
            <div className="flex gap-2 flex-wrap">
              {data.luckyElements.map((element, index) => (
                <motion.span
                  key={element}
                  className="px-4 py-2 rounded-full bg-pink-500/20 text-pink-200 font-medium"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(236, 72, 153, 0.4)" }}
                >
                  {ELEMENT_KOREAN[element as keyof typeof ELEMENT_KOREAN]}
                </motion.span>
              ))}
            </div>
          </div>
        </GlowingCard>
      )}

      {/* Relationship Advice */}
      {data.relationshipAdvice && data.relationshipAdvice.length > 0 && (
        <GlowingCard glowColor="rgba(34, 197, 94, 0.3)" variants={itemVariants}>
          <div className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-green-400">{t("result.advice")}</h2>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {data.relationshipAdvice.map((advice, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-base text-white/80"
                  variants={listItemVariants}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    <Check
                      className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                      weight="bold"
                    />
                  </motion.div>
                  {advice}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </GlowingCard>
      )}

      {/* Cautions */}
      {data.cautions && data.cautions.length > 0 && (
        <GlowingCard glowColor="rgba(249, 115, 22, 0.3)" variants={itemVariants}>
          <div className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-orange-400">{t("result.cautions")}</h2>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {data.cautions.map((caution, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-base text-white/80"
                  variants={listItemVariants}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    <Warning
                      className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
                      weight="bold"
                    />
                  </motion.div>
                  {caution}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </GlowingCard>
      )}

      {/* Actions */}
      <motion.div
        className="space-y-3 pt-4"
        variants={itemVariants}
      >
        {/* 상세 분석 버튼 */}
        <Link href={detailUrl} className="block">
          <motion.button
            className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkle className="w-5 h-5" weight="fill" />
            전통 명리학 상세 분석 보기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </motion.button>
        </Link>

        {/* 다시 분석하기 버튼 */}
        <Link href="/couple" className="block">
          <motion.button
            className="w-full h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowCounterClockwise className="w-5 h-5" />
            <span className="text-base font-medium">{t("result.reAnalyze")}</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        className="text-center text-sm text-white/40 pt-2 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {t("disclaimer")}
      </motion.p>
    </motion.div>
  );
}
