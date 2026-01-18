/**
 * 시운(時運) 계산 모듈
 * Hourly Fortune Calculator
 *
 * 12시진의 시운을 계산하고 원국과의 관계를 분석
 */

import type { Element } from "../types";
import type {
  HourlyFortune,
  DailyHourlyFortunes,
  Pillar,
  FortuneGrade,
} from "./types";
import {
  HEAVENLY_STEMS,
  STEMS_KOREAN,
  EARTHLY_BRANCHES,
  BRANCHES_KOREAN,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_KOREAN,
  HOUR_PERIOD_NAMES,
  HOUR_RANGES,
} from "./types";
import {
  calculateDailyPillar,
  calculateHourStem,
  getHourBranch,
  analyzeNatalInteraction,
  analyzeUsefulGodRelation,
  scoreToGrade,
  gradeToKorean,
} from "./daily-fortune";

// ============================================================================
// 시진 계산
// ============================================================================

/**
 * 원국 지지 정보
 */
interface NatalBranches {
  year: string;
  month: string;
  day: string;
  time: string;
}

/**
 * 특정 시간의 시주(時柱) 계산
 *
 * @param date - 날짜
 * @param hour - 시간 (0-23)
 * @returns 시주 정보
 */
export function calculateHourlyPillar(date: Date, hour: number): Pillar {
  const dailyPillar = calculateDailyPillar(date);
  const branch = getHourBranch(hour);
  const stem = calculateHourStem(dailyPillar.stem, branch);

  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  const element = STEM_ELEMENTS[stem] || "earth";

  return {
    stem,
    branch,
    stemKorean: STEMS_KOREAN[stemIndex] || stem,
    branchKorean: BRANCHES_KOREAN[branchIndex] || branch,
    element,
    elementKorean: ELEMENT_KOREAN[element],
  };
}

/**
 * 시간을 시진 인덱스로 변환 (0-11)
 *
 * @param hour - 24시간 형식 (0-23)
 * @returns 시진 인덱스
 */
export function getHourIndex(hour: number): number {
  // 자시(23:00-01:00) = 0, 축시(01:00-03:00) = 1, ...
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

/**
 * 현재 시간의 시진 정보
 */
export function getCurrentHourInfo(): {
  periodName: string;
  timeRange: string;
  hourIndex: number;
  branch: string;
  branchKorean: string;
} {
  const now = new Date();
  const hour = now.getHours();
  const hourIndex = getHourIndex(hour);

  return {
    periodName: HOUR_PERIOD_NAMES[hourIndex],
    timeRange: HOUR_RANGES[hourIndex],
    hourIndex,
    branch: EARTHLY_BRANCHES[hourIndex],
    branchKorean: BRANCHES_KOREAN[hourIndex],
  };
}

// ============================================================================
// 시운 분석
// ============================================================================

/**
 * 단일 시진 분석
 *
 * @param date - 날짜
 * @param hourIndex - 시진 인덱스 (0-11)
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @returns 시운 분석 결과
 */
export function analyzeHourlyFortune(
  date: Date,
  hourIndex: number,
  natalBranches: NatalBranches,
  usefulGodElement: Element
): Omit<HourlyFortune, "description" | "advice" | "goodFor" | "avoidFor"> & {
  baseAnalysis: {
    usefulGodReason: string;
    natalInteraction: ReturnType<typeof analyzeNatalInteraction>;
  };
} {
  const branch = EARTHLY_BRANCHES[hourIndex];
  const dailyPillar = calculateDailyPillar(date);
  const stem = calculateHourStem(dailyPillar.stem, branch);

  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  const element = STEM_ELEMENTS[stem] || "earth";

  const pillar: Pillar = {
    stem,
    branch,
    stemKorean: STEMS_KOREAN[stemIndex] || stem,
    branchKorean: BRANCHES_KOREAN[hourIndex],
    element,
    elementKorean: ELEMENT_KOREAN[element],
  };

  // 원국과의 관계 분석
  const natalInteraction = analyzeNatalInteraction(branch, natalBranches);

  // 용신과의 관계 분석
  const usefulGodResult = analyzeUsefulGodRelation(element as Element, usefulGodElement);

  // 점수 계산
  let score = 50;
  score += natalInteraction.harmonies.length * 10;
  score -= natalInteraction.clashes.length * 15;
  score -= natalInteraction.punishments.length * 10;
  score -= natalInteraction.harms.length * 8;
  score -= natalInteraction.destructions.length * 5;

  if (usefulGodResult.relation === "support") {
    score += 15;
  } else if (usefulGodResult.relation === "against") {
    score -= 12;
  }

  score = Math.max(0, Math.min(100, score));
  const grade = scoreToGrade(score);

  return {
    timeRange: HOUR_RANGES[hourIndex],
    periodName: HOUR_PERIOD_NAMES[hourIndex],
    pillar,
    score,
    grade,
    baseAnalysis: {
      usefulGodReason: usefulGodResult.reason,
      natalInteraction,
    },
  };
}

/**
 * 하루 12시진 전체 분석
 *
 * @param date - 날짜
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @returns 12시진 분석 결과
 */
export function analyzeDailyHourlyFortunes(
  date: Date,
  natalBranches: NatalBranches,
  usefulGodElement: Element
): {
  date: string;
  dailyPillar: Pillar;
  hourlyFortunes: Array<{
    timeRange: string;
    periodName: string;
    pillar: Pillar;
    score: number;
    grade: FortuneGrade;
    gradeKorean: string;
    usefulGodRelation: "support" | "neutral" | "against";
    hasHarmony: boolean;
    hasClash: boolean;
  }>;
  bestHours: string[];
  cautionHours: string[];
  bestPeriodNames: string[];
  cautionPeriodNames: string[];
} {
  const dailyPillar = calculateDailyPillar(date);
  const hourlyFortunes = [];
  const bestHours: string[] = [];
  const cautionHours: string[] = [];
  const bestPeriodNames: string[] = [];
  const cautionPeriodNames: string[] = [];

  for (let i = 0; i < 12; i++) {
    const result = analyzeHourlyFortune(date, i, natalBranches, usefulGodElement);

    const usefulGodElement_local = result.pillar.element as Element;
    const usefulGodResult = analyzeUsefulGodRelation(usefulGodElement_local, usefulGodElement);

    const fortune = {
      timeRange: result.timeRange,
      periodName: result.periodName,
      pillar: result.pillar,
      score: result.score,
      grade: result.grade,
      gradeKorean: gradeToKorean(result.grade),
      usefulGodRelation: usefulGodResult.relation,
      hasHarmony: result.baseAnalysis.natalInteraction.harmonies.length > 0,
      hasClash: result.baseAnalysis.natalInteraction.clashes.length > 0,
    };

    hourlyFortunes.push(fortune);

    // 베스트/주의 시간대 판별
    if (fortune.grade === "excellent" || (fortune.grade === "good" && fortune.score >= 65)) {
      bestHours.push(fortune.timeRange);
      bestPeriodNames.push(fortune.periodName);
    }
    if (fortune.grade === "caution" || (fortune.grade === "normal" && fortune.score < 45)) {
      cautionHours.push(fortune.timeRange);
      cautionPeriodNames.push(fortune.periodName);
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    dailyPillar,
    hourlyFortunes,
    bestHours,
    cautionHours,
    bestPeriodNames,
    cautionPeriodNames,
  };
}

/**
 * 현재 시간의 시운 요약
 */
export function getCurrentHourFortuneSummary(
  natalBranches: NatalBranches,
  usefulGodElement: Element
): {
  currentTime: string;
  periodName: string;
  timeRange: string;
  pillarKorean: string;
  score: number;
  grade: string;
  highlights: string[];
  nextBestHour: string | null;
} {
  const now = new Date();
  const hourIndex = getHourIndex(now.getHours());

  const result = analyzeHourlyFortune(now, hourIndex, natalBranches, usefulGodElement);
  const allHours = analyzeDailyHourlyFortunes(now, natalBranches, usefulGodElement);

  const highlights: string[] = [];

  if (result.baseAnalysis.natalInteraction.harmonies.length > 0) {
    highlights.push(result.baseAnalysis.natalInteraction.harmonies.join(", "));
  }
  if (result.baseAnalysis.natalInteraction.clashes.length > 0) {
    highlights.push(result.baseAnalysis.natalInteraction.clashes.join(", "));
  }

  const usefulGodResult = analyzeUsefulGodRelation(result.pillar.element as Element, usefulGodElement);
  if (usefulGodResult.relation === "support") {
    highlights.push("용신에 좋은 시간");
  } else if (usefulGodResult.relation === "against") {
    highlights.push("용신에 불리한 시간");
  }

  // 다음 좋은 시간대 찾기
  let nextBestHour: string | null = null;
  for (let i = hourIndex + 1; i < 12; i++) {
    const hourFortune = allHours.hourlyFortunes[i];
    if (hourFortune.grade === "excellent" || hourFortune.grade === "good") {
      nextBestHour = `${hourFortune.periodName}(${hourFortune.timeRange})`;
      break;
    }
  }

  return {
    currentTime: now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    periodName: result.periodName,
    timeRange: result.timeRange,
    pillarKorean: `${result.pillar.stemKorean}${result.pillar.branchKorean}`,
    score: result.score,
    grade: gradeToKorean(result.grade),
    highlights,
    nextBestHour,
  };
}

// ============================================================================
// 특정 활동에 좋은 시간대 추천
// ============================================================================

/**
 * 활동별 추천 시간대
 *
 * @param date - 날짜
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @param activityType - 활동 유형
 * @returns 추천 시간대 목록
 */
export function getRecommendedHoursForActivity(
  date: Date,
  natalBranches: NatalBranches,
  usefulGodElement: Element,
  activityType: "meeting" | "negotiation" | "decision" | "creative" | "rest"
): {
  recommended: Array<{
    periodName: string;
    timeRange: string;
    score: number;
    reason: string;
  }>;
  avoid: Array<{
    periodName: string;
    timeRange: string;
    reason: string;
  }>;
} {
  const allHours = analyzeDailyHourlyFortunes(date, natalBranches, usefulGodElement);

  // 활동별 추천 오행
  const activityElements: Record<string, Element[]> = {
    meeting: ["wood", "fire"], // 소통, 활기
    negotiation: ["metal", "water"], // 날카로움, 유연함
    decision: ["metal", "earth"], // 결단력, 안정감
    creative: ["fire", "wood"], // 창의성, 성장
    rest: ["water", "earth"], // 휴식, 안정
  };

  const preferredElements = activityElements[activityType] || ["wood"];

  const recommended: Array<{
    periodName: string;
    timeRange: string;
    score: number;
    reason: string;
  }> = [];

  const avoid: Array<{
    periodName: string;
    timeRange: string;
    reason: string;
  }> = [];

  allHours.hourlyFortunes.forEach((hour) => {
    const hourElement = hour.pillar.element as Element;

    // 추천 시간대 (높은 점수 + 활동에 맞는 오행)
    if (hour.score >= 55 && preferredElements.includes(hourElement)) {
      recommended.push({
        periodName: hour.periodName,
        timeRange: hour.timeRange,
        score: hour.score,
        reason: `${hour.pillar.elementKorean} 에너지가 ${getActivityDescription(activityType)}에 적합`,
      });
    }

    // 피해야 할 시간대
    if (hour.hasClash || hour.grade === "caution") {
      avoid.push({
        periodName: hour.periodName,
        timeRange: hour.timeRange,
        reason: hour.hasClash ? "원국과 충돌" : "운의 흐름이 불안정",
      });
    }
  });

  // 점수순 정렬
  recommended.sort((a, b) => b.score - a.score);

  return { recommended: recommended.slice(0, 3), avoid: avoid.slice(0, 2) };
}

/**
 * 활동 유형 설명
 */
function getActivityDescription(activityType: string): string {
  const descriptions: Record<string, string> = {
    meeting: "대인관계 및 소통",
    negotiation: "협상 및 계약",
    decision: "중요한 결정",
    creative: "창의적인 작업",
    rest: "휴식 및 충전",
  };
  return descriptions[activityType] || "활동";
}
