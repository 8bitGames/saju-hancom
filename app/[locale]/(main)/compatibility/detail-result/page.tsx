"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import {
  UsersThree,
  ArrowCounterClockwise,
  Star,
  Heart,
  ChartBar,
  Sparkle,
  Check,
  Warning,
  Lightbulb,
  CalendarBlank,
  Clover,
  ArrowLeft,
  Handshake,
  ChatCircle,
  Lightning,
  ShieldCheck,
  Scales,
  Users,
  Brain,
  HandHeart,
  CurrencyCircleDollar,
  Clock,
  Compass,
  Hash,
  Briefcase,
  Target,
  Strategy,
  TrendUp,
  FilePdf,
} from "@phosphor-icons/react";
import { downloadDetailedCompatibilityPDF, type DetailedCompatibilityPDFData } from "@/lib/pdf/generator";
import { autoSaveDetailedCoupleResult, autoSaveDetailedCompatibilityResult, getExistingDetailedResult } from "@/lib/actions/saju";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { FlipWords } from "@/components/aceternity/flip-words";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { motion } from "framer-motion";
import { calculateSaju, toPromptData } from "@/lib/saju";
import { getLongitudeByCity } from "@/lib/saju/solar-time";
import type { Gender, SajuPromptData } from "@/lib/saju/types";

interface DetailedCompatibilityResult {
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
    yukHap: {
      pairs: Array<{ zhi1: string; zhi2: string; resultElement: string }>;
      description: string;
    };
    samHap: {
      groups: Array<{ zhis: string[]; resultElement: string }>;
      description: string;
    };
    chung: {
      pairs: Array<{ zhi1: string; zhi2: string }>;
      description: string;
    };
    hyung: {
      pairs: Array<{ zhi1: string; zhi2: string }>;
      description: string;
    };
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

  romanticAnalysis?: {
    initialAttraction: { score: number; description: string };
    dateCompatibility: { score: number; description: string };
    marriageProspect: { score: number; description: string };
    childrenFortune: { score: number; description: string };
  };

  workplaceAnalysis?: {
    teamwork: { score: number; description: string };
    projectCollaboration: { score: number; description: string };
    decisionMaking: { score: number; description: string };
    stressHandling: { score: number; description: string };
    careerSupport: { score: number; description: string };
    tenGodRelation: {
      person1Role: string;
      person2Role: string;
      relationDynamic: string;
    };
  };

  conflictPoints: Array<{
    area: string;
    description: string;
    solution?: string;
  }>;

  compatibility: {
    communication: { score: number; description: string };
    collaboration: { score: number; description: string };
    trust: { score: number; description: string };
    growth: { score: number; description: string };
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

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-white";
  return "text-orange-400";
}

function ScoreBar({ score, color = "bg-[#3b82f6]" }: { score: number; color?: string }) {
  return (
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function ScoreCard({
  icon: Icon,
  label,
  score,
  description,
  color
}: {
  icon: React.ElementType;
  label: string;
  score: number;
  description: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" weight="fill" style={{ color }} />
          <span className="text-base font-medium text-white">{label}</span>
        </div>
        <span className="text-lg font-bold" style={{ color }}>{score}점</span>
      </div>
      <ScoreBar score={score} color={`bg-[${color}]`} />
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
}

function DetailedCompatibilityResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [result, setResult] = useState<DetailedCompatibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const hasSavedRef = useRef(false);

  useEffect(() => {
    const fetchDetailedCompatibility = async () => {
      const p1Name = searchParams.get("p1Name") || "본인";
      const p1Year = parseInt(searchParams.get("p1Year") || "0");
      const p1Month = parseInt(searchParams.get("p1Month") || "0");
      const p1Day = parseInt(searchParams.get("p1Day") || "0");
      const p1Hour = parseInt(searchParams.get("p1Hour") || "12");
      const p1Minute = parseInt(searchParams.get("p1Minute") || "0");
      const p1Gender = (searchParams.get("p1Gender") as Gender) || "male";
      const p1IsLunar = searchParams.get("p1IsLunar") === "true";
      const p1City = searchParams.get("p1City") || "서울";

      const p2Name = searchParams.get("p2Name") || "상대방";
      const p2Year = parseInt(searchParams.get("p2Year") || "0");
      const p2Month = parseInt(searchParams.get("p2Month") || "0");
      const p2Day = parseInt(searchParams.get("p2Day") || "0");
      const p2Hour = parseInt(searchParams.get("p2Hour") || "12");
      const p2Minute = parseInt(searchParams.get("p2Minute") || "0");
      const p2Gender = (searchParams.get("p2Gender") as Gender) || "male";
      const p2IsLunar = searchParams.get("p2IsLunar") === "true";
      const p2City = searchParams.get("p2City") || "서울";

      const relationType = searchParams.get("relationType");

      setPerson1Name(p1Name);
      setPerson2Name(p2Name);

      if (!p1Year || !p1Month || !p1Day || !p2Year || !p2Month || !p2Day) {
        router.push("/compatibility");
        return;
      }

      try {
        // First, check if there's already saved detailed result in the database
        const existingResult = await getExistingDetailedResult({
          person1: {
            year: p1Year,
            month: p1Month,
            day: p1Day,
            hour: p1Hour,
            minute: p1Minute,
            gender: p1Gender,
            isLunar: p1IsLunar,
          },
          person2: {
            year: p2Year,
            month: p2Month,
            day: p2Day,
            hour: p2Hour,
            minute: p2Minute,
            gender: p2Gender,
            isLunar: p2IsLunar,
          },
          relationType: relationType || "friend",
        });

        if (existingResult.success && existingResult.detailedResult) {
          console.log("[DetailedCompatibilityResult] Using existing saved result from database");
          setResult(existingResult.detailedResult);
          hasSavedRef.current = true; // Already saved, no need to save again
          setIsLoading(false);
          return;
        }

        console.log("[DetailedCompatibilityResult] No existing result found, fetching from API");

        const p1Longitude = getLongitudeByCity(p1City);
        const p1SajuResult = calculateSaju({
          year: p1Year,
          month: p1Month,
          day: p1Day,
          hour: p1Hour,
          minute: p1Minute,
          gender: p1Gender,
          isLunar: p1IsLunar,
          longitude: p1Longitude,
        });

        const p2Longitude = getLongitudeByCity(p2City);
        const p2SajuResult = calculateSaju({
          year: p2Year,
          month: p2Month,
          day: p2Day,
          hour: p2Hour,
          minute: p2Minute,
          gender: p2Gender,
          isLunar: p2IsLunar,
          longitude: p2Longitude,
        });

        const person1Data: SajuPromptData & { name: string; gender: string } = {
          ...toPromptData(p1SajuResult),
          name: p1Name,
          gender: p1Gender,
        };

        const person2Data: SajuPromptData & { name: string; gender: string } = {
          ...toPromptData(p2SajuResult),
          name: p2Name,
          gender: p2Gender,
        };

        console.log("Sending API request with:", {
          person1: person1Data,
          person2: person2Data,
          relationType,
          locale,
        });

        const response = await fetch("/api/compatibility/detail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            person1: person1Data,
            person2: person2Data,
            relationType,
            locale,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error response:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          const errorMsg = errorData.error || `상세 궁합 분석에 실패했습니다. (HTTP ${response.status})`;
          const details = errorData.details ? ` [${errorData.details}]` : '';
          throw new Error(errorMsg + details);
        }

        const compatibilityResult = await response.json();
        setResult(compatibilityResult);
      } catch (err) {
        console.error("Detailed compatibility fetch error:", err);
        setError(err instanceof Error ? err.message : "상세 궁합 분석 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedCompatibility();
  }, [searchParams, router, locale]);

  // Auto-save detailed result when loaded
  useEffect(() => {
    if (!result || hasSavedRef.current) return;

    const saveDetailedResult = async () => {
      const p1Year = parseInt(searchParams.get("p1Year") || "0");
      const p1Month = parseInt(searchParams.get("p1Month") || "0");
      const p1Day = parseInt(searchParams.get("p1Day") || "0");
      const p1Hour = parseInt(searchParams.get("p1Hour") || "12");
      const p1Minute = parseInt(searchParams.get("p1Minute") || "0");
      const p1Gender = searchParams.get("p1Gender") || "male";
      const p1IsLunar = searchParams.get("p1IsLunar") === "true";
      const p1Name = searchParams.get("p1Name") || "본인";

      const p2Year = parseInt(searchParams.get("p2Year") || "0");
      const p2Month = parseInt(searchParams.get("p2Month") || "0");
      const p2Day = parseInt(searchParams.get("p2Day") || "0");
      const p2Hour = parseInt(searchParams.get("p2Hour") || "12");
      const p2Minute = parseInt(searchParams.get("p2Minute") || "0");
      const p2Gender = searchParams.get("p2Gender") || "male";
      const p2IsLunar = searchParams.get("p2IsLunar") === "true";
      const p2Name = searchParams.get("p2Name") || "상대방";

      const relationType = searchParams.get("relationType") || "friend";

      // Determine if this is a romantic or workplace compatibility
      const romanticRelationTypes = ["dating", "engaged", "married", "interested"];
      const isRomantic = romanticRelationTypes.includes(relationType);

      const saveInput = {
        person1: {
          name: p1Name,
          year: p1Year,
          month: p1Month,
          day: p1Day,
          hour: p1Hour,
          minute: p1Minute,
          gender: p1Gender,
          isLunar: p1IsLunar,
        },
        person2: {
          name: p2Name,
          year: p2Year,
          month: p2Month,
          day: p2Day,
          hour: p2Hour,
          minute: p2Minute,
          gender: p2Gender,
          isLunar: p2IsLunar,
        },
        relationType,
        detailedResultData: result,
      };

      try {
        // Call appropriate save function based on relation type
        const saveResult = isRomantic
          ? await autoSaveDetailedCoupleResult(saveInput)
          : await autoSaveDetailedCompatibilityResult(saveInput);

        if (saveResult.success) {
          console.log(`[DetailedCompatibilityResult] Auto-saved ${isRomantic ? 'couple' : 'workplace'} detailed result:`, saveResult.resultId);
          hasSavedRef.current = true;
        } else {
          console.log('[DetailedCompatibilityResult] Could not auto-save:', saveResult.error);
        }
      } catch (err) {
        console.error('[DetailedCompatibilityResult] Auto-save error:', err);
      }
    };

    saveDetailedResult();
  }, [result, searchParams]);

  const handleDownloadPDF = () => {
    if (!result) return;

    setIsDownloadingPDF(true);
    try {
      // Get birth data from search params
      const p1Year = parseInt(searchParams.get("p1Year") || "0");
      const p1Month = parseInt(searchParams.get("p1Month") || "0");
      const p1Day = parseInt(searchParams.get("p1Day") || "0");
      const p1Hour = parseInt(searchParams.get("p1Hour") || "12");
      const p1Minute = parseInt(searchParams.get("p1Minute") || "0");
      const p1Gender = searchParams.get("p1Gender") || "male";
      const p1IsLunar = searchParams.get("p1IsLunar") === "true";

      const p2Year = parseInt(searchParams.get("p2Year") || "0");
      const p2Month = parseInt(searchParams.get("p2Month") || "0");
      const p2Day = parseInt(searchParams.get("p2Day") || "0");
      const p2Hour = parseInt(searchParams.get("p2Hour") || "12");
      const p2Minute = parseInt(searchParams.get("p2Minute") || "0");
      const p2Gender = searchParams.get("p2Gender") || "male";
      const p2IsLunar = searchParams.get("p2IsLunar") === "true";

      const relationType = searchParams.get("relationType") || undefined;

      const pdfData: DetailedCompatibilityPDFData = {
        person1: {
          name: person1Name,
          birthYear: p1Year,
          birthMonth: p1Month,
          birthDay: p1Day,
          birthHour: p1Hour,
          birthMinute: p1Minute,
          gender: p1Gender,
          isLunar: p1IsLunar,
        },
        person2: {
          name: person2Name,
          birthYear: p2Year,
          birthMonth: p2Month,
          birthDay: p2Day,
          birthHour: p2Hour,
          birthMinute: p2Minute,
          gender: p2Gender,
          isLunar: p2IsLunar,
        },
        result: {
          overallScore: result.overallScore,
          grade: result.grade,
          gradeText: result.gradeText,
          summary: result.summary,
          cheonganHap: result.cheonganHap ? {
            combinations: result.cheonganHap.hasHap ? [{
              stem1: result.cheonganHap.person1Gan,
              stem2: result.cheonganHap.person2Gan,
              resultElement: result.cheonganHap.hapElement || '',
              description: result.cheonganHap.description,
            }] : [],
            analysis: result.cheonganHap.description,
          } : undefined,
          jijiRelation: result.jijiRelation ? {
            yukHap: result.jijiRelation.yukHap?.pairs?.map(p => ({
              branch1: p.zhi1,
              branch2: p.zhi2,
              resultElement: p.resultElement,
              description: result.jijiRelation.yukHap.description,
            })),
            samHap: result.jijiRelation.samHap?.groups?.map(g => ({
              branches: g.zhis,
              resultElement: g.resultElement,
              description: result.jijiRelation.samHap.description,
            })),
            chung: result.jijiRelation.chung?.pairs?.map(p => ({
              branch1: p.zhi1,
              branch2: p.zhi2,
              description: result.jijiRelation.chung.description,
            })),
            hyung: result.jijiRelation.hyung?.pairs?.map(p => ({
              branches: [p.zhi1, p.zhi2],
              description: result.jijiRelation.hyung.description,
            })),
            analysis: [
              result.jijiRelation.yukHap?.description,
              result.jijiRelation.samHap?.description,
              result.jijiRelation.chung?.description,
              result.jijiRelation.hyung?.description,
            ].filter(Boolean).join(' '),
          } : undefined,
          iljuCompatibility: result.iljuCompatibility ? {
            person1Ilju: result.iljuCompatibility.person1Ilju,
            person2Ilju: result.iljuCompatibility.person2Ilju,
            compatibility: `${result.iljuCompatibility.overallIljuScore}점`,
            analysis: result.iljuCompatibility.description,
          } : undefined,
          elementBalanceAnalysis: result.elementBalanceAnalysis ? {
            person1Elements: { [result.elementBalanceAnalysis.person1Dominant]: 1, [result.elementBalanceAnalysis.person1Weak]: 0 },
            person2Elements: { [result.elementBalanceAnalysis.person2Dominant]: 1, [result.elementBalanceAnalysis.person2Weak]: 0 },
            combinedBalance: {},
            analysis: result.elementBalanceAnalysis.description,
          } : undefined,
          strengths: result.strengths,
          challenges: result.challenges,
          adviceForPerson1: result.adviceForPerson1.join('\n'),
          adviceForPerson2: result.adviceForPerson2.join('\n'),
          recommendedActivities: result.recommendedActivities,
          luckyElements: result.luckyElements?.colors,
          // New detailed analysis fields
          relationshipAnalysis: result.relationshipAnalysis ? {
            emotional: result.relationshipAnalysis.emotional,
            physical: result.relationshipAnalysis.physical,
            intellectual: result.relationshipAnalysis.intellectual,
            spiritual: result.relationshipAnalysis.spiritual,
            financial: result.relationshipAnalysis.financial,
          } : undefined,
          timingAnalysis: result.timingAnalysis ? {
            shortTerm: result.timingAnalysis.shortTerm,
            midTerm: result.timingAnalysis.midTerm,
            longTerm: result.timingAnalysis.longTerm,
          } : undefined,
          romanticAnalysis: result.romanticAnalysis ? {
            initialAttraction: result.romanticAnalysis.initialAttraction,
            dateCompatibility: result.romanticAnalysis.dateCompatibility,
            marriageProspect: result.romanticAnalysis.marriageProspect,
            childrenFortune: result.romanticAnalysis.childrenFortune,
          } : undefined,
          workplaceAnalysis: result.workplaceAnalysis ? {
            teamwork: result.workplaceAnalysis.teamwork,
            projectCollaboration: result.workplaceAnalysis.projectCollaboration,
            decisionMaking: result.workplaceAnalysis.decisionMaking,
            stressHandling: result.workplaceAnalysis.stressHandling,
            careerSupport: result.workplaceAnalysis.careerSupport,
            tenGodRelation: result.workplaceAnalysis.tenGodRelation,
          } : undefined,
          conflictPoints: result.conflictPoints,
          compatibility: result.compatibility ? {
            communication: result.compatibility.communication,
            collaboration: result.compatibility.collaboration,
            trust: result.compatibility.trust,
            growth: result.compatibility.growth,
          } : undefined,
          luckyDates: result.luckyDates,
          luckyElementsDetailed: result.luckyElements ? {
            colors: result.luckyElements.colors,
            directions: result.luckyElements.directions,
            numbers: result.luckyElements.numbers,
          } : undefined,
        },
        relationType,
      };

      downloadDetailedCompatibilityPDF(pdfData);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다. 팝업 차단을 해제해주세요.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  if (isLoading) {
    const loadingSteps = [
      "천간합 분석 중",
      "지지 육합 확인 중",
      "삼합 관계 분석 중",
      "일주 궁합 계산 중",
      "오행 균형 분석 중",
      "운세 영역 분석 중",
    ];

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Sparkles Background */}
        <SparklesCore
          id="loading-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={50}
          particleColor="#3b82f6"
          className="absolute inset-0"
        />

        <div className="text-center space-y-6 relative z-10">
          {/* Animated Icon */}
          <motion.div
            className="relative w-24 h-24 mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-[#3b82f6]/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Middle ring */}
            <motion.div
              className="absolute inset-2 rounded-xl bg-[#3b82f6]/50"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.4, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            {/* Inner icon container */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#3b82f6]/50"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <UsersThree className="w-12 h-12 text-white" weight="fill" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xl font-bold text-white">전통 명리학 상세 분석</p>
          </motion.div>

          {/* Flip Words for loading steps */}
          <motion.div
            className="h-8 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FlipWords
              words={loadingSteps}
              duration={2000}
              className="text-base text-[#3b82f6] font-medium"
            />
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-48 mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 12,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Sub text */}
          <motion.p
            className="text-sm text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            AI가 사주 궁합을 깊이 분석하고 있습니다
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center">
            <Warning className="w-10 h-10 text-red-400" weight="bold" />
          </div>
          <p className="text-lg text-red-400">{error}</p>
          <Link href="/compatibility">
            <button className="px-6 py-3 rounded-xl bg-[#3b82f6] text-white text-base font-medium hover:bg-[#2563eb] transition-colors">
              다시 시도하기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#3b82f6] text-sm font-medium tracking-wider">
          傳統宮合詳細分析
        </p>
        <h1 className="text-2xl font-bold text-white">
          전통 궁합 상세 분석
        </h1>
        <TextGenerateEffect
          words={`${person1Name}님과 ${person2Name}님의 명리학 기반 심층 궁합`}
          className="text-base text-white/60"
          duration={0.3}
        />
      </div>

      {/* Overall Score Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-[#3b82f6] flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">{result.overallScore}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] font-bold text-lg mb-3">
          <Star className="w-5 h-5" weight="fill" />
          {result.gradeText}
        </div>
        <p className="text-base text-white/80 max-w-md mx-auto">
          {result.summary}
        </p>
      </div>

      {/* 천간합 분석 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Handshake className="w-5 h-5 text-purple-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">천간합(天干合) 분석</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-sm text-white/40">{person1Name}님 일간</p>
            <p className="text-2xl font-bold text-purple-400">{result.cheonganHap.person1Gan}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-sm text-white/40">{person2Name}님 일간</p>
            <p className="text-2xl font-bold text-purple-400">{result.cheonganHap.person2Gan}</p>
          </div>
        </div>

        {result.cheonganHap.hasHap && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Sparkle className="w-5 h-5 text-purple-400" weight="fill" />
            <div>
              <p className="text-base font-medium text-purple-400">{result.cheonganHap.hapType}</p>
              {result.cheonganHap.hapElement && (
                <p className="text-sm text-white/60">합화 오행: {result.cheonganHap.hapElement}</p>
              )}
            </div>
          </div>
        )}

        <p className="text-base text-white/80">{result.cheonganHap.description}</p>
      </section>

      {/* 지지 관계 분석 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Scales className="w-5 h-5 text-cyan-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">지지(地支) 관계 분석</h2>
        </div>

        <div className="space-y-4">
          {/* 육합 */}
          <div className="p-4 rounded-xl bg-white/5">
            <h3 className="text-base font-medium text-green-400 mb-2">육합(六合)</h3>
            {result.jijiRelation.yukHap.pairs.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {result.jijiRelation.yukHap.pairs.map((pair, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                    {pair.zhi1} + {pair.zhi2} → {pair.resultElement}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 mb-2">육합 관계 없음</p>
            )}
            <p className="text-sm text-white/60">{result.jijiRelation.yukHap.description}</p>
          </div>

          {/* 삼합 */}
          <div className="p-4 rounded-xl bg-white/5">
            <h3 className="text-base font-medium text-blue-400 mb-2">삼합(三合)</h3>
            {result.jijiRelation.samHap.groups.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {result.jijiRelation.samHap.groups.map((group, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                    {group.zhis.join(" + ")} → {group.resultElement}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 mb-2">삼합 관계 없음</p>
            )}
            <p className="text-sm text-white/60">{result.jijiRelation.samHap.description}</p>
          </div>

          {/* 충 */}
          <div className="p-4 rounded-xl bg-white/5">
            <h3 className="text-base font-medium text-orange-400 mb-2">충(沖)</h3>
            {result.jijiRelation.chung.pairs.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {result.jijiRelation.chung.pairs.map((pair, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                    {pair.zhi1} ↔ {pair.zhi2}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 mb-2">충 관계 없음</p>
            )}
            <p className="text-sm text-white/60">{result.jijiRelation.chung.description}</p>
          </div>

          {/* 형 */}
          <div className="p-4 rounded-xl bg-white/5">
            <h3 className="text-base font-medium text-red-400 mb-2">형(刑)</h3>
            {result.jijiRelation.hyung.pairs.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {result.jijiRelation.hyung.pairs.map((pair, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm">
                    {pair.zhi1} → {pair.zhi2}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 mb-2">형 관계 없음</p>
            )}
            <p className="text-sm text-white/60">{result.jijiRelation.hyung.description}</p>
          </div>
        </div>
      </section>

      {/* 일주 궁합 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">일주(日柱) 궁합</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-sm text-white/40">{person1Name}님 일주</p>
            <p className="text-2xl font-bold text-pink-400">{result.iljuCompatibility.person1Ilju}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-sm text-white/40">{person2Name}님 일주</p>
            <p className="text-2xl font-bold text-pink-400">{result.iljuCompatibility.person2Ilju}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-white/5 text-center">
            <p className="text-xs text-white/40">일간 관계</p>
            <p className="text-lg font-medium text-white">{result.iljuCompatibility.ganRelation}</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-white/5 text-center">
            <p className="text-xs text-white/40">일지 관계</p>
            <p className="text-lg font-medium text-white">{result.iljuCompatibility.zhiRelation}</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-pink-500/20 text-center">
            <p className="text-xs text-white/40">일주 점수</p>
            <p className="text-lg font-bold text-pink-400">{result.iljuCompatibility.overallIljuScore}점</p>
          </div>
        </div>

        <p className="text-base text-white/80">{result.iljuCompatibility.description}</p>
      </section>

      {/* 오행 균형 분석 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Lightning className="w-5 h-5 text-yellow-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">오행(五行) 균형 분석</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-sm text-white/40">{person1Name}님</p>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                강: {result.elementBalanceAnalysis.person1Dominant}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                약: {result.elementBalanceAnalysis.person1Weak}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/40">{person2Name}님</p>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                강: {result.elementBalanceAnalysis.person2Dominant}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                약: {result.elementBalanceAnalysis.person2Weak}
              </span>
            </div>
          </div>
        </div>

        {result.elementBalanceAnalysis.complementary && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/20 border border-green-500/30">
            <Check className="w-5 h-5 text-green-400" weight="bold" />
            <p className="text-base text-green-400">서로 보완하는 관계입니다</p>
          </div>
        )}

        <p className="text-base text-white/80">{result.elementBalanceAnalysis.description}</p>
      </section>

      {/* 관계 영역별 분석 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <ChartBar className="w-5 h-5 text-[#3b82f6]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">관계 영역별 상세 분석</h2>
        </div>

        <div className="space-y-4">
          <ScoreCard
            icon={Heart}
            label="정서적 교감"
            score={result.relationshipAnalysis.emotional.score}
            description={result.relationshipAnalysis.emotional.description}
            color="#ec4899"
          />
          <ScoreCard
            icon={Lightning}
            label="신체적 조화"
            score={result.relationshipAnalysis.physical.score}
            description={result.relationshipAnalysis.physical.description}
            color="#f59e0b"
          />
          <ScoreCard
            icon={Brain}
            label="지적 교류"
            score={result.relationshipAnalysis.intellectual.score}
            description={result.relationshipAnalysis.intellectual.description}
            color="#8b5cf6"
          />
          <ScoreCard
            icon={HandHeart}
            label="정신적 유대"
            score={result.relationshipAnalysis.spiritual.score}
            description={result.relationshipAnalysis.spiritual.description}
            color="#06b6d4"
          />
          <ScoreCard
            icon={CurrencyCircleDollar}
            label="경제적 조화"
            score={result.relationshipAnalysis.financial.score}
            description={result.relationshipAnalysis.financial.description}
            color="#22c55e"
          />
        </div>
      </section>

      {/* 시간에 따른 궁합 변화 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#3b82f6]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">시간에 따른 궁합 변화</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-white">단기 (1-2년)</span>
              <span className={`text-lg font-bold ${getScoreColor(result.timingAnalysis.shortTerm.score)}`}>
                {result.timingAnalysis.shortTerm.score}점
              </span>
            </div>
            <ScoreBar score={result.timingAnalysis.shortTerm.score} />
            <p className="text-sm text-white/60 mt-2">{result.timingAnalysis.shortTerm.description}</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-white">중기 (3-5년)</span>
              <span className={`text-lg font-bold ${getScoreColor(result.timingAnalysis.midTerm.score)}`}>
                {result.timingAnalysis.midTerm.score}점
              </span>
            </div>
            <ScoreBar score={result.timingAnalysis.midTerm.score} />
            <p className="text-sm text-white/60 mt-2">{result.timingAnalysis.midTerm.description}</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-white">장기 (5년+)</span>
              <span className={`text-lg font-bold ${getScoreColor(result.timingAnalysis.longTerm.score)}`}>
                {result.timingAnalysis.longTerm.score}점
              </span>
            </div>
            <ScoreBar score={result.timingAnalysis.longTerm.score} />
            <p className="text-sm text-white/60 mt-2">{result.timingAnalysis.longTerm.description}</p>
          </div>
        </div>
      </section>

      {/* 연애/결혼 분석 (연인/부부만) */}
      {result.romanticAnalysis && (
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" weight="fill" />
            <h2 className="text-lg font-semibold text-pink-400">연애/결혼 특별 분석</h2>
          </div>

          <div className="space-y-4">
            <ScoreCard
              icon={Sparkle}
              label="첫인상/끌림"
              score={result.romanticAnalysis.initialAttraction.score}
              description={result.romanticAnalysis.initialAttraction.description}
              color="#ec4899"
            />
            <ScoreCard
              icon={Heart}
              label="데이트 궁합"
              score={result.romanticAnalysis.dateCompatibility.score}
              description={result.romanticAnalysis.dateCompatibility.description}
              color="#f43f5e"
            />
            <ScoreCard
              icon={Users}
              label="결혼 전망"
              score={result.romanticAnalysis.marriageProspect.score}
              description={result.romanticAnalysis.marriageProspect.description}
              color="#a855f7"
            />
            <ScoreCard
              icon={Star}
              label="자녀운"
              score={result.romanticAnalysis.childrenFortune.score}
              description={result.romanticAnalysis.childrenFortune.description}
              color="#3b82f6"
            />
          </div>
        </section>
      )}

      {/* 직장/업무 관계 특별 분석 */}
      {result.workplaceAnalysis && (
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" weight="fill" />
            <h2 className="text-lg font-semibold text-cyan-400">직장/업무 관계 특별 분석</h2>
          </div>

          {/* 십성 관계 분석 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Scales className="w-5 h-5 text-cyan-400" weight="fill" />
              <span className="text-base font-medium text-cyan-400">십성(十星) 기반 업무 역학</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-white/60 mb-1">{person1Name}의 역할</p>
                <p className="text-white font-medium">{result.workplaceAnalysis.tenGodRelation.person1Role}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-white/60 mb-1">{person2Name}의 역할</p>
                <p className="text-white font-medium">{result.workplaceAnalysis.tenGodRelation.person2Role}</p>
              </div>
            </div>
            <p className="text-sm text-white/80">{result.workplaceAnalysis.tenGodRelation.relationDynamic}</p>
          </div>

          <div className="space-y-4">
            <ScoreCard
              icon={UsersThree}
              label="팀워크 궁합"
              score={result.workplaceAnalysis.teamwork.score}
              description={result.workplaceAnalysis.teamwork.description}
              color="#06b6d4"
            />
            <ScoreCard
              icon={Target}
              label="프로젝트 협업"
              score={result.workplaceAnalysis.projectCollaboration.score}
              description={result.workplaceAnalysis.projectCollaboration.description}
              color="#0ea5e9"
            />
            <ScoreCard
              icon={Strategy}
              label="의사결정 스타일 호환성"
              score={result.workplaceAnalysis.decisionMaking.score}
              description={result.workplaceAnalysis.decisionMaking.description}
              color="#3b82f6"
            />
            <ScoreCard
              icon={ShieldCheck}
              label="스트레스 상황 대응"
              score={result.workplaceAnalysis.stressHandling.score}
              description={result.workplaceAnalysis.stressHandling.description}
              color="#6366f1"
            />
            <ScoreCard
              icon={TrendUp}
              label="커리어 성장 지원"
              score={result.workplaceAnalysis.careerSupport.score}
              description={result.workplaceAnalysis.careerSupport.description}
              color="#8b5cf6"
            />
          </div>
        </section>
      )}

      {/* 갈등 포인트와 해결책 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">갈등 포인트와 해결책</h2>
        </div>

        <div className="space-y-4">
          {result.conflictPoints.map((conflict, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Warning className="w-5 h-5 text-orange-400" weight="bold" />
                <span className="text-base font-medium text-orange-400">{conflict.area}</span>
              </div>
              <p className="text-sm text-white/60">{conflict.description}</p>
              {conflict.solution && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10">
                  <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="fill" />
                  <p className="text-sm text-green-400">{conflict.solution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 기본 궁합 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <ChartBar className="w-5 h-5 text-[#3b82f6]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">기본 궁합 분석</h2>
        </div>

        <div className="space-y-4">
          <ScoreCard
            icon={ChatCircle}
            label="소통"
            score={result.compatibility.communication.score}
            description={result.compatibility.communication.description}
            color="#22c55e"
          />
          <ScoreCard
            icon={Handshake}
            label="협업"
            score={result.compatibility.collaboration.score}
            description={result.compatibility.collaboration.description}
            color="#f59e0b"
          />
          <ScoreCard
            icon={ShieldCheck}
            label="신뢰"
            score={result.compatibility.trust.score}
            description={result.compatibility.trust.description}
            color="#3b82f6"
          />
          <ScoreCard
            icon={Sparkle}
            label="성장"
            score={result.compatibility.growth.score}
            description={result.compatibility.growth.description}
            color="#a855f7"
          />
        </div>
      </section>

      {/* 강점과 도전 */}
      <div className="grid grid-cols-1 gap-4">
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
          <h2 className="text-lg font-semibold text-green-400">관계의 강점</h2>
          <ul className="space-y-2">
            {result.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="bold" />
                {strength}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
          <h2 className="text-lg font-semibold text-orange-400">도전 과제</h2>
          <ul className="space-y-2">
            {result.challenges.map((challenge, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                <Warning className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" weight="bold" />
                {challenge}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 개인별 조언 */}
      <div className="grid grid-cols-1 gap-4">
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
          <h2 className="text-lg font-semibold text-[#3b82f6]">{person1Name}님께 드리는 조언</h2>
          <ul className="space-y-2">
            {result.adviceForPerson1.map((advice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                <Lightbulb className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" weight="fill" />
                {advice}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
          <h2 className="text-lg font-semibold text-purple-400">{person2Name}님께 드리는 조언</h2>
          <ul className="space-y-2">
            {result.adviceForPerson2.map((advice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-white/80">
                <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" weight="fill" />
                {advice}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 추천 활동 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-[#3b82f6]" weight="fill" />
          <h2 className="text-lg font-semibold text-white">함께하면 좋은 활동</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.recommendedActivities.map((activity, idx) => (
            <span key={idx} className="px-4 py-2 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-medium">
              {activity}
            </span>
          ))}
        </div>
      </section>

      {/* 좋은 날짜 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-white/10">
        <div className="flex items-center gap-2">
          <CalendarBlank className="w-5 h-5 text-green-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">함께하기 좋은 날짜/시기</h2>
        </div>
        <ul className="space-y-2">
          {result.luckyDates.map((date, idx) => (
            <li key={idx} className="flex items-start gap-2 text-base text-white/80">
              <Star className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" weight="fill" />
              {date}
            </li>
          ))}
        </ul>
      </section>

      {/* 행운의 요소 */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Clover className="w-5 h-5 text-green-400" weight="fill" />
          <h2 className="text-lg font-semibold text-white">함께할 때 행운의 요소</h2>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-white/40 mb-2">색상</p>
            <div className="flex flex-wrap gap-2">
              {result.luckyElements.colors.map((color, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-medium">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2 flex items-center gap-1">
              <Compass className="w-4 h-4" />
              방향
            </p>
            <div className="flex flex-wrap gap-2">
              {result.luckyElements.directions.map((direction, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
                  {direction}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-white/40 mb-2 flex items-center gap-1">
              <Hash className="w-4 h-4" />
              숫자
            </p>
            <div className="flex flex-wrap gap-2">
              {result.luckyElements.numbers.map((number, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                  {number}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloadingPDF}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <FilePdf className="w-5 h-5" weight="fill" />
          {isDownloadingPDF ? 'PDF 생성 중...' : 'PDF로 저장하기'}
        </button>

        <Link href={`/compatibility/result?${searchParams.toString()}`} className="block">
          <button className="w-full h-14 rounded-xl bg-[#3b82f6] text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#2563eb] transition-colors">
            <ArrowLeft className="w-5 h-5" weight="bold" />
            메인 결과로 돌아가기
          </button>
        </Link>

        <Link href="/compatibility" className="block">
          <button className="w-full h-14 rounded-xl bg-white/5 border border-white/10 text-base text-white/60 font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ArrowCounterClockwise className="w-5 h-5" />
            다시 분석하기
          </button>
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-sm text-white/40 pt-2 pb-8">
        이 분석은 전통 명리학(천간합, 지지합, 일주 궁합)을 기반으로 한 참고용 정보입니다.
      </p>
    </div>
  );
}

export default function DetailedCompatibilityResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#3b82f6] flex items-center justify-center animate-pulse">
              <UsersThree className="w-10 h-10 text-white" weight="fill" />
            </div>
            <p className="text-lg text-white">전통 명리학 기반 상세 궁합 분석 중...</p>
            <p className="text-base text-white/60">잠시만 기다려주세요</p>
          </div>
        </div>
      }
    >
      <DetailedCompatibilityResultContent />
    </Suspense>
  );
}
