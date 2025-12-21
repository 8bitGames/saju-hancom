"use client";

import { Link } from "@/lib/i18n/navigation";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { UsersThree, ArrowCounterClockwise, ChatCircle, Handshake, Heart, ChartBar, Sparkle, User, ArrowRight, Check, Warning, FilePdf } from "@phosphor-icons/react";
import { downloadCompatibilityPDF } from "@/lib/pdf/generator";
import { ELEMENT_KOREAN } from "@/lib/saju";
import { calculatePersonCompatibility } from "@/lib/compatibility/calculator";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import type { Gender } from "@/lib/saju/types";
import type { CompatibilityGrade, RelationType } from "@/lib/compatibility/types";

interface SearchParams {
  p1Name?: string;
  p1Year?: string;
  p1Month?: string;
  p1Day?: string;
  p1Hour?: string;
  p1Minute?: string;
  p1Gender?: string;
  p1IsLunar?: string;
  p1City?: string;
  p2Name?: string;
  p2Year?: string;
  p2Month?: string;
  p2Day?: string;
  p2Hour?: string;
  p2Minute?: string;
  p2Gender?: string;
  p2IsLunar?: string;
  p2City?: string;
  relationType?: string;
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
  glowColor = "rgba(59, 130, 246, 0.4)",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  variants?: any;
}) {
  return (
    <motion.div className={`relative ${className}`} variants={variants}>
      {/* Constant glow effect - static on mobile, animated on desktop */}
      <div
        className="absolute -inset-1 rounded-2xl glow-constant"
        style={{ background: glowColor }}
      />
      {/* Drop shadow */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-30"
        style={{ background: glowColor }}
      />
      {/* Content */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

function getGradeText(grade: CompatibilityGrade): string {
  switch (grade) {
    case "excellent": return "최고";
    case "good": return "좋음";
    case "normal": return "보통";
    case "caution": return "주의";
    case "challenging": return "도전";
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-white";
  return "text-orange-400";
}

function getRelationTypeKorean(type?: string): string {
  switch (type) {
    case "colleague": return "동료";
    case "supervisor": return "상사";
    case "subordinate": return "부하";
    case "partner": return "파트너";
    case "client": return "고객";
    case "mentor": return "멘토";
    case "mentee": return "멘티";
    default: return "동료";
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
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
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
  pillars: { year: { gan: string; zhi: string }; month: { gan: string; zhi: string }; day: { gan: string; zhi: string }; time: { gan: string; zhi: string } };
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
        <User className="w-4 h-4 text-[#3b82f6]" weight="fill" />
        <span className="text-base font-medium text-white">{label}: {name}</span>
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
              {/* Pillar glow */}
              <div className="absolute -inset-0.5 rounded-xl bg-blue-500/20 blur-sm group-hover:bg-blue-500/40 transition-all duration-300" />
              <div className="relative p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-blue-500/50 transition-colors">
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

export function CompatibilityResultContent({ searchParams }: { searchParams: SearchParams }) {
  const person1 = {
    name: searchParams.p1Name || "본인",
    year: parseInt(searchParams.p1Year || "1990"),
    month: parseInt(searchParams.p1Month || "1"),
    day: parseInt(searchParams.p1Day || "1"),
    hour: parseInt(searchParams.p1Hour || "12"),
    minute: parseInt(searchParams.p1Minute || "0"),
    gender: (searchParams.p1Gender as Gender) || "male",
    isLunar: searchParams.p1IsLunar === "true",
    city: searchParams.p1City || "서울",
  };

  const person2 = {
    name: searchParams.p2Name || "상대방",
    year: parseInt(searchParams.p2Year || "1990"),
    month: parseInt(searchParams.p2Month || "1"),
    day: parseInt(searchParams.p2Day || "1"),
    hour: parseInt(searchParams.p2Hour || "12"),
    minute: parseInt(searchParams.p2Minute || "0"),
    gender: (searchParams.p2Gender as Gender) || "male",
    isLunar: searchParams.p2IsLunar === "true",
    city: searchParams.p2City || "서울",
  };

  const relationType = searchParams.relationType as RelationType | undefined;
  const result = calculatePersonCompatibility(person1, person2, relationType);

  const [isDownloading, setIsDownloading] = useState(false);

  const handlePDFDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadCompatibilityPDF({
        person1,
        person2,
        result,
        relationType,
      });
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 팝업 차단을 해제해주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  const queryString = new URLSearchParams({
    p1Name: person1.name,
    p1Year: person1.year.toString(),
    p1Month: person1.month.toString(),
    p1Day: person1.day.toString(),
    p1Hour: person1.hour.toString(),
    p1Minute: person1.minute.toString(),
    p1Gender: person1.gender,
    p1IsLunar: person1.isLunar.toString(),
    p1City: person1.city,
    p2Name: person2.name,
    p2Year: person2.year.toString(),
    p2Month: person2.month.toString(),
    p2Day: person2.day.toString(),
    p2Hour: person2.hour.toString(),
    p2Minute: person2.minute.toString(),
    p2Gender: person2.gender,
    p2IsLunar: person2.isLunar.toString(),
    p2City: person2.city,
    relationType: relationType || "",
  }).toString();

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="text-center space-y-2 py-4"
        variants={itemVariants}
      >
        <motion.p
          className="text-[#3b82f6] text-sm font-medium tracking-wider"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          宮合分析
        </motion.p>
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          궁합 분석 결과
        </motion.h1>
        <TextGenerateEffect
          words={`${person1.name}님과 ${person2.name}님의 ${getRelationTypeKorean(relationType)} 궁합`}
          className="text-base text-white/60"
          duration={0.3}
        />
      </motion.div>

      {/* Score Card */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.5)" variants={itemVariants}>
        <div className="p-6 text-center">
          <motion.div
            className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30"
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
              <AnimatedCounter value={result.score} duration={2} />
            </span>
          </motion.div>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] font-bold text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Handshake className="w-5 h-5" weight="fill" />
            </motion.div>
            {result.gradeText}
          </motion.div>
        </div>
      </GlowingCard>

      {/* Two Person Pillars */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <UsersThree className="w-5 h-5 text-[#3b82f6]" weight="fill" />
            <h2 className="text-lg font-semibold text-white">두 사람의 사주</h2>
          </div>

          <PersonPillarsDisplay
            name={person1.name}
            pillars={result.person1Pillars}
            label="첫 번째"
            delay={0.1}
          />

          <motion.div
            className="border-t border-white/10 my-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />

          <PersonPillarsDisplay
            name={person2.name}
            pillars={result.person2Pillars}
            label="두 번째"
            delay={0.3}
          />
        </div>
      </GlowingCard>

      {/* Analysis Cards */}
      <GlowingCard glowColor="rgba(59, 130, 246, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-[#3b82f6]" weight="fill" />
            <h2 className="text-lg font-semibold text-white">관계 분석</h2>
          </div>

          <div className="space-y-4">
            {[
              { icon: ChatCircle, color: "text-green-400", label: "소통", data: result.analysis.communication, delay: 0 },
              { icon: Handshake, color: "text-orange-400", label: "협업", data: result.analysis.collaboration, delay: 0.15 },
              { icon: Heart, color: "text-pink-400", label: "신뢰", data: result.analysis.trust, delay: 0.3 },
              { icon: Sparkle, color: "text-purple-400", label: "성장", data: result.analysis.growth, delay: 0.45 },
            ].map(({ icon: Icon, color, label, data, delay }) => (
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
                <AnimatedScoreBar score={data.score} label="" delay={delay} />
                <motion.p
                  className="text-sm text-white/60"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: delay + 0.3 }}
                >
                  {data.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </GlowingCard>

      {/* Element Balance */}
      <GlowingCard glowColor="rgba(168, 85, 247, 0.3)" variants={itemVariants}>
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">오행 균형</h2>
          <div className="grid grid-cols-5 gap-2">
            {(["wood", "fire", "earth", "metal", "water"] as const).map((element, index) => {
              const person1Score = result.elementBalance.person1[element];
              const person2Score = result.elementBalance.person2[element];
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
                  {/* Element glow */}
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
                    <p className="text-xs text-white/40">
                      vs {person2Score}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </GlowingCard>

      {/* Relationship Advice */}
      {result.relationshipAdvice.length > 0 && (
        <GlowingCard glowColor="rgba(34, 197, 94, 0.3)" variants={itemVariants}>
          <div className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-green-400">관계 조언</h2>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {result.relationshipAdvice.map((advice, i) => (
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
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
                  </motion.div>
                  {advice}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </GlowingCard>
      )}

      {/* Cautions */}
      {result.cautions.length > 0 && (
        <GlowingCard glowColor="rgba(249, 115, 22, 0.3)" variants={itemVariants}>
          <div className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-orange-400">주의 사항</h2>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {result.cautions.map((caution, i) => (
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
                    <Warning className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" weight="bold" />
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
        <Link href={`/compatibility/detail-result?${queryString}`} className="block">
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
        <motion.button
          onClick={handlePDFDownload}
          disabled={isDownloading}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30 disabled:opacity-50"
          whileHover={{ scale: isDownloading ? 1 : 1.02 }}
          whileTap={{ scale: isDownloading ? 1 : 0.98 }}
        >
          <FilePdf className="w-5 h-5" weight="fill" />
          <span>{isDownloading ? 'PDF 생성 중...' : 'PDF로 저장하기'}</span>
        </motion.button>
        <div className="flex gap-3">
          <Link href="/compatibility" className="flex-1">
            <motion.button
              className="w-full h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowCounterClockwise className="w-5 h-5" />
              <span className="text-base font-medium">다시 분석</span>
            </motion.button>
          </Link>
          <Link href="/saju" className="flex-1">
            <motion.button
              className="w-full h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkle className="w-5 h-5" weight="fill" />
              <span className="text-base font-medium">사주 분석</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        className="text-center text-sm text-white/40 pt-2 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.
      </motion.p>
    </motion.div>
  );
}
