/**
 * 일운(日運) 계산 모듈
 * Daily Fortune Calculator
 *
 * 특정 날짜의 일진을 계산하고 원국과의 관계를 분석
 */

import { Solar } from "lunar-javascript";
import type { Element } from "../types";
import type {
  DailyFortune,
  Pillar,
  FortuneInteraction,
  FortuneAnalysis,
  FortuneGrade,
  HourlyFortune,
  DailyHourlyFortunes,
} from "./types";
import {
  HEAVENLY_STEMS,
  STEMS_KOREAN,
  EARTHLY_BRANCHES,
  BRANCHES_KOREAN,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_KOREAN,
  SIX_CLASHES,
  SIX_HARMONIES,
  THREE_HARMONIES,
  HOUR_PERIOD_NAMES,
  HOUR_RANGES,
} from "./types";
import {
  STEM_ELEMENTS as MAIN_STEM_ELEMENTS,
  BRANCH_ELEMENTS as MAIN_BRANCH_ELEMENTS,
} from "../constants";

// ============================================================================
// 일진 계산 (Pure Calculation - 100% Accuracy Required)
// ============================================================================

/**
 * 특정 날짜의 일진(日辰) 계산
 * lunar-javascript 라이브러리 활용
 *
 * @param date - 조회할 날짜
 * @returns 일진 정보 (천간, 지지, 오행)
 */
export function calculateDailyPillar(date: Date): Pillar {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const dayGanZhi = lunar.getDayInGanZhi();

  const stem = dayGanZhi[0];
  const branch = dayGanZhi[1];

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
 * 특정 날짜 범위의 일진 목록 계산
 *
 * @param startDate - 시작 날짜
 * @param days - 일수 (기본 7일)
 * @returns 일진 목록
 */
export function calculateDailyPillarsRange(
  startDate: Date,
  days: number = 7
): Array<{ date: string; pillar: Pillar }> {
  const results: Array<{ date: string; pillar: Pillar }> = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dateStr = formatDateToString(date);
    const pillar = calculateDailyPillar(date);

    results.push({ date: dateStr, pillar });
  }

  return results;
}

// ============================================================================
// 시진 계산 (오호둔시법 기반)
// ============================================================================

/**
 * 오호둔시법(五虎遁時法)에 따른 시간 천간 계산
 * 일간에 따라 시간의 천간이 결정됨
 *
 * 甲/己일 → 甲子時 시작
 * 乙/庚일 → 丙子時 시작
 * 丙/辛일 → 戊子時 시작
 * 丁/壬일 → 庚子時 시작
 * 戊/癸일 → 壬子時 시작
 *
 * @param dayStem - 일간
 * @param hourBranch - 시지 (子, 丑, 寅...)
 * @returns 시간 천간
 */
export function calculateHourStem(dayStem: string, hourBranch: string): string {
  // 일간별 자시(子時) 천간 시작점
  const hourStemStart: Record<string, number> = {
    "甲": 0, "己": 0,  // 甲子時 시작 (甲 = 0)
    "乙": 2, "庚": 2,  // 丙子時 시작 (丙 = 2)
    "丙": 4, "辛": 4,  // 戊子時 시작 (戊 = 4)
    "丁": 6, "壬": 6,  // 庚子時 시작 (庚 = 6)
    "戊": 8, "癸": 8,  // 壬子時 시작 (壬 = 8)
  };

  const branchIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
  const startStemIndex = hourStemStart[dayStem] ?? 0;
  const hourStemIndex = (startStemIndex + branchIndex) % 10;

  return HEAVENLY_STEMS[hourStemIndex];
}

/**
 * 시간을 지지(地支)로 변환
 *
 * @param hour - 24시간 형식 (0-23)
 * @returns 시지
 */
export function getHourBranch(hour: number): string {
  // 자시(23:00-01:00), 축시(01:00-03:00), ...
  const hourBranchMap: Record<number, number> = {
    23: 0, 0: 0,   // 子時
    1: 1, 2: 1,    // 丑時
    3: 2, 4: 2,    // 寅時
    5: 3, 6: 3,    // 卯時
    7: 4, 8: 4,    // 辰時
    9: 5, 10: 5,   // 巳時
    11: 6, 12: 6,  // 午時
    13: 7, 14: 7,  // 未時
    15: 8, 16: 8,  // 申時
    17: 9, 18: 9,  // 酉時
    19: 10, 20: 10, // 戌時
    21: 11, 22: 11, // 亥時
  };

  const branchIndex = hourBranchMap[hour] ?? 0;
  return EARTHLY_BRANCHES[branchIndex];
}

/**
 * 특정 날짜의 12시진 계산
 *
 * @param date - 날짜
 * @returns 12시진 정보
 */
export function calculateHourlyPillars(date: Date): Array<{
  branch: string;
  branchKorean: string;
  stem: string;
  stemKorean: string;
  timeRange: string;
  periodName: string;
}> {
  const dailyPillar = calculateDailyPillar(date);
  const results = [];

  for (let i = 0; i < 12; i++) {
    const branch = EARTHLY_BRANCHES[i];
    const stem = calculateHourStem(dailyPillar.stem, branch);
    const stemIndex = HEAVENLY_STEMS.indexOf(stem);

    results.push({
      branch,
      branchKorean: BRANCHES_KOREAN[i],
      stem,
      stemKorean: STEMS_KOREAN[stemIndex],
      timeRange: HOUR_RANGES[i],
      periodName: HOUR_PERIOD_NAMES[i],
    });
  }

  return results;
}

// ============================================================================
// 원국과의 관계 분석
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
 * 원국 천간 정보
 */
interface NatalStems {
  year: string;
  month: string;
  day: string;
  time: string;
}

/**
 * 두 지지 간 충(沖) 관계 확인
 */
export function checkClash(branch1: string, branch2: string): boolean {
  return SIX_CLASHES.some(
    ([a, b]) => (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
  );
}

/**
 * 두 지지 간 합(合) 관계 확인 (육합)
 */
export function checkHarmony(branch1: string, branch2: string): boolean {
  return SIX_HARMONIES.some(
    ([a, b]) => (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
  );
}

/**
 * 삼합 관계 확인
 */
export function checkThreeHarmony(
  branch1: string,
  branch2: string,
  branch3: string
): { isHarmony: boolean; element?: Element } {
  for (const [a, b, c, element] of THREE_HARMONIES) {
    const branches = [a, b, c];
    if (
      branches.includes(branch1) &&
      branches.includes(branch2) &&
      branches.includes(branch3)
    ) {
      return { isHarmony: true, element };
    }
  }
  return { isHarmony: false };
}

/**
 * 반합(半合) 관계 확인 - 삼합 중 2개
 */
export function checkHalfHarmony(branch1: string, branch2: string): boolean {
  for (const [a, b, c] of THREE_HARMONIES) {
    const pairs = [[a, b], [b, c], [a, c]];
    if (pairs.some(([x, y]) =>
      (x === branch1 && y === branch2) || (x === branch2 && y === branch1)
    )) {
      return true;
    }
  }
  return false;
}

/**
 * 형(刑) 관계 - 삼형살
 * 寅巳申 - 무은지형
 * 丑戌未 - 무례지형
 * 子卯 - 무례지형
 * 辰辰, 午午, 酉酉, 亥亥 - 자형
 */
const THREE_PUNISHMENTS: string[][] = [
  ["寅", "巳", "申"],  // 인사신 삼형
  ["丑", "戌", "未"],  // 축술미 삼형
];

const MUTUAL_PUNISHMENT: [string, string][] = [
  ["子", "卯"],  // 자묘형
];

const SELF_PUNISHMENT: string[] = ["辰", "午", "酉", "亥"]; // 자형

export function checkPunishment(branch1: string, branch2: string): boolean {
  // 삼형 중 일부 확인
  for (const group of THREE_PUNISHMENTS) {
    if (group.includes(branch1) && group.includes(branch2) && branch1 !== branch2) {
      return true;
    }
  }

  // 상호 형
  if (MUTUAL_PUNISHMENT.some(
    ([a, b]) => (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
  )) {
    return true;
  }

  // 자형
  if (branch1 === branch2 && SELF_PUNISHMENT.includes(branch1)) {
    return true;
  }

  return false;
}

/**
 * 해(害) 관계 - 육해
 * 子未, 丑午, 寅巳, 卯辰, 申亥, 酉戌
 */
const SIX_HARMS: [string, string][] = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "巳"],
  ["卯", "辰"],
  ["申", "亥"],
  ["酉", "戌"],
];

export function checkHarm(branch1: string, branch2: string): boolean {
  return SIX_HARMS.some(
    ([a, b]) => (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
  );
}

/**
 * 파(破) 관계 - 육파
 * 子酉, 丑辰, 寅亥, 卯午, 巳申, 未戌
 */
const SIX_DESTRUCTIONS: [string, string][] = [
  ["子", "酉"],
  ["丑", "辰"],
  ["寅", "亥"],
  ["卯", "午"],
  ["巳", "申"],
  ["未", "戌"],
];

export function checkDestruction(branch1: string, branch2: string): boolean {
  return SIX_DESTRUCTIONS.some(
    ([a, b]) => (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
  );
}

/**
 * 일진과 원국의 전체 관계 분석
 *
 * @param dailyBranch - 일진 지지
 * @param natalBranches - 원국 지지들
 * @returns 관계 분석 결과
 */
export function analyzeNatalInteraction(
  dailyBranch: string,
  natalBranches: NatalBranches
): FortuneInteraction {
  const pillars = ["년지", "월지", "일지", "시지"];
  const branches = [
    natalBranches.year,
    natalBranches.month,
    natalBranches.day,
    natalBranches.time,
  ];

  const harmonies: string[] = [];
  const clashes: string[] = [];
  const punishments: string[] = [];
  const harms: string[] = [];
  const destructions: string[] = [];

  branches.forEach((branch, index) => {
    if (checkHarmony(dailyBranch, branch)) {
      harmonies.push(`${pillars[index]}와 육합`);
    }
    if (checkClash(dailyBranch, branch)) {
      clashes.push(`${pillars[index]}와 충`);
    }
    if (checkPunishment(dailyBranch, branch)) {
      punishments.push(`${pillars[index]}와 형`);
    }
    if (checkHarm(dailyBranch, branch)) {
      harms.push(`${pillars[index]}와 해`);
    }
    if (checkDestruction(dailyBranch, branch)) {
      destructions.push(`${pillars[index]}와 파`);
    }
  });

  return {
    harmonies,
    clashes,
    punishments,
    harms,
    destructions,
  };
}

// ============================================================================
// 용신 관계 분석
// ============================================================================

/**
 * 오행 상생상극 관계
 */
const ELEMENT_RELATIONS: Record<Element, {
  generates: Element;  // 생
  controls: Element;   // 극
  generatedBy: Element; // 생을 받음
  controlledBy: Element; // 극을 받음
}> = {
  wood: { generates: "fire", controls: "earth", generatedBy: "water", controlledBy: "metal" },
  fire: { generates: "earth", controls: "metal", generatedBy: "wood", controlledBy: "water" },
  earth: { generates: "metal", controls: "water", generatedBy: "fire", controlledBy: "wood" },
  metal: { generates: "water", controls: "wood", generatedBy: "earth", controlledBy: "fire" },
  water: { generates: "wood", controls: "fire", generatedBy: "metal", controlledBy: "earth" },
};

/**
 * 일진과 용신의 관계 분석
 *
 * @param dailyElement - 일진 오행
 * @param usefulGodElement - 용신 오행
 * @returns 관계 (support/neutral/against)
 */
export function analyzeUsefulGodRelation(
  dailyElement: Element,
  usefulGodElement: Element
): { relation: "support" | "neutral" | "against"; reason: string } {
  if (dailyElement === usefulGodElement) {
    return {
      relation: "support",
      reason: `일진 ${ELEMENT_KOREAN[dailyElement]}이(가) 용신 ${ELEMENT_KOREAN[usefulGodElement]}과(와) 같은 오행으로 용신을 강화합니다.`,
    };
  }

  const relations = ELEMENT_RELATIONS[dailyElement];

  // 일진이 용신을 생
  if (relations.generates === usefulGodElement) {
    return {
      relation: "support",
      reason: `일진 ${ELEMENT_KOREAN[dailyElement]}이(가) 용신 ${ELEMENT_KOREAN[usefulGodElement]}을(를) 생하여 용신을 강화합니다.`,
    };
  }

  // 일진이 용신의 생을 받음
  if (relations.generatedBy === usefulGodElement) {
    return {
      relation: "neutral",
      reason: `일진 ${ELEMENT_KOREAN[dailyElement]}이(가) 용신 ${ELEMENT_KOREAN[usefulGodElement]}의 생을 받아 무난합니다.`,
    };
  }

  // 일진이 용신을 극
  if (relations.controls === usefulGodElement) {
    return {
      relation: "against",
      reason: `일진 ${ELEMENT_KOREAN[dailyElement]}이(가) 용신 ${ELEMENT_KOREAN[usefulGodElement]}을(를) 극하여 용신이 약해집니다.`,
    };
  }

  // 일진이 용신에게 극 당함
  if (relations.controlledBy === usefulGodElement) {
    return {
      relation: "neutral",
      reason: `일진 ${ELEMENT_KOREAN[dailyElement]}이(가) 용신 ${ELEMENT_KOREAN[usefulGodElement]}에게 극 당하지만 용신 자체는 강해집니다.`,
    };
  }

  return {
    relation: "neutral",
    reason: "일진과 용신의 관계가 중립적입니다.",
  };
}

// ============================================================================
// 점수 및 등급 계산
// ============================================================================

/**
 * 일운 점수 계산
 *
 * @param interaction - 원국과의 관계
 * @param usefulGodRelation - 용신과의 관계
 * @returns 점수 (0-100)
 */
export function calculateDailyScore(
  interaction: FortuneInteraction,
  usefulGodRelation: "support" | "neutral" | "against"
): number {
  let score = 50; // 기본점수

  // 합(+), 충/형/해/파(-)
  score += interaction.harmonies.length * 10;
  score -= interaction.clashes.length * 15;
  score -= interaction.punishments.length * 10;
  score -= interaction.harms.length * 8;
  score -= interaction.destructions.length * 5;

  // 용신 관계
  if (usefulGodRelation === "support") {
    score += 20;
  } else if (usefulGodRelation === "against") {
    score -= 15;
  }

  // 범위 제한
  return Math.max(0, Math.min(100, score));
}

/**
 * 점수를 등급으로 변환
 */
export function scoreToGrade(score: number): FortuneGrade {
  if (score >= 75) return "excellent";
  if (score >= 55) return "good";
  if (score >= 40) return "normal";
  return "caution";
}

/**
 * 등급을 한글로 변환
 */
export function gradeToKorean(grade: FortuneGrade): string {
  const gradeMap: Record<FortuneGrade, string> = {
    excellent: "대길(大吉)",
    good: "길(吉)",
    normal: "평(平)",
    caution: "주의(注意)",
  };
  return gradeMap[grade];
}

// ============================================================================
// 일운 종합 분석
// ============================================================================

/**
 * 일운 종합 분석 수행
 * AI 해석 없이 rule-based 분석만 수행
 *
 * @param date - 날짜
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @returns 일운 분석 결과 (일부 필드는 AI 해석 필요)
 */
export function analyzeDailyFortune(
  date: Date,
  natalBranches: NatalBranches,
  usefulGodElement: Element
): Omit<DailyFortune, "analysis" | "recommendedActivities" | "activitiesToAvoid"> & {
  baseAnalysis: {
    score: number;
    grade: FortuneGrade;
    gradeKorean: string;
    usefulGodReason: string;
  };
} {
  const pillar = calculateDailyPillar(date);
  const interaction = analyzeNatalInteraction(pillar.branch, natalBranches);
  const usefulGodResult = analyzeUsefulGodRelation(pillar.element, usefulGodElement);
  const score = calculateDailyScore(interaction, usefulGodResult.relation);
  const grade = scoreToGrade(score);

  // 행운/주의 시간대 계산
  const hourlyPillars = calculateHourlyPillars(date);
  const luckyHours: string[] = [];
  const cautionHours: string[] = [];

  hourlyPillars.forEach((hourPillar) => {
    const hourElement = BRANCH_ELEMENTS[hourPillar.branch] || "earth";
    const hourRelation = analyzeUsefulGodRelation(hourElement as Element, usefulGodElement);

    if (hourRelation.relation === "support") {
      luckyHours.push(`${hourPillar.periodName}(${hourPillar.timeRange})`);
    } else if (hourRelation.relation === "against") {
      cautionHours.push(`${hourPillar.periodName}(${hourPillar.timeRange})`);
    }
  });

  return {
    date: formatDateToString(date),
    pillar,
    natalInteraction: interaction,
    usefulGodRelation: usefulGodResult.relation,
    usefulGodRelationReason: usefulGodResult.reason,
    luckyHours,
    cautionHours,
    baseAnalysis: {
      score,
      grade,
      gradeKorean: gradeToKorean(grade),
      usefulGodReason: usefulGodResult.reason,
    },
  };
}

// ============================================================================
// 유틸리티
// ============================================================================

/**
 * Date를 YYYY-MM-DD 문자열로 변환
 */
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 문자열을 Date로 변환
 */
export function parseStringToDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 오늘 날짜의 일운 요약 생성
 */
export function getTodayFortuneSummary(
  natalBranches: NatalBranches,
  usefulGodElement: Element
): {
  date: string;
  pillar: string;
  pillarKorean: string;
  grade: string;
  score: number;
  highlights: string[];
} {
  const today = new Date();
  const result = analyzeDailyFortune(today, natalBranches, usefulGodElement);

  const highlights: string[] = [];

  if (result.natalInteraction.harmonies.length > 0) {
    highlights.push(result.natalInteraction.harmonies.join(", "));
  }
  if (result.natalInteraction.clashes.length > 0) {
    highlights.push(result.natalInteraction.clashes.join(", "));
  }
  if (result.usefulGodRelation === "support") {
    highlights.push("용신에 좋은 날");
  } else if (result.usefulGodRelation === "against") {
    highlights.push("용신에 불리한 날");
  }

  return {
    date: result.date,
    pillar: `${result.pillar.stem}${result.pillar.branch}`,
    pillarKorean: `${result.pillar.stemKorean}${result.pillar.branchKorean}`,
    grade: result.baseAnalysis.gradeKorean,
    score: result.baseAnalysis.score,
    highlights,
  };
}
