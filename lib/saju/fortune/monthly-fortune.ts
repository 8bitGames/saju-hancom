/**
 * 월운(月運) 계산 모듈
 * Monthly Fortune Calculator
 *
 * 12개월의 월주를 계산하고 원국과의 관계를 분석
 */

import { Solar } from "lunar-javascript";
import type { Element } from "../types";
import type {
  MonthlyFortune,
  Pillar,
  FortuneInteraction,
  FortuneAnalysis,
  FortuneGrade,
  YearlyMonthlyFortunes,
} from "./types";
import {
  HEAVENLY_STEMS,
  STEMS_KOREAN,
  EARTHLY_BRANCHES,
  BRANCHES_KOREAN,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_KOREAN,
} from "./types";
import {
  analyzeNatalInteraction,
  analyzeUsefulGodRelation,
  calculateDailyScore,
  scoreToGrade,
  gradeToKorean,
} from "./daily-fortune";

// ============================================================================
// 24절기 정보
// ============================================================================

/**
 * 24절기 목록 (월주 결정에 사용되는 절기)
 * 각 월의 시작은 절기 기준
 *
 * 1월(인월): 입춘
 * 2월(묘월): 경칩
 * 3월(진월): 청명
 * 4월(사월): 입하
 * 5월(오월): 망종
 * 6월(미월): 소서
 * 7월(신월): 입추
 * 8월(유월): 백로
 * 9월(술월): 한로
 * 10월(해월): 입동
 * 11월(자월): 대설
 * 12월(축월): 소한
 */
export const MONTH_SOLAR_TERMS: Record<number, { name: string; branch: string }> = {
  1: { name: "입춘", branch: "寅" },   // 인월
  2: { name: "경칩", branch: "卯" },   // 묘월
  3: { name: "청명", branch: "辰" },   // 진월
  4: { name: "입하", branch: "巳" },   // 사월
  5: { name: "망종", branch: "午" },   // 오월
  6: { name: "소서", branch: "未" },   // 미월
  7: { name: "입추", branch: "申" },   // 신월
  8: { name: "백로", branch: "酉" },   // 유월
  9: { name: "한로", branch: "戌" },   // 술월
  10: { name: "입동", branch: "亥" },  // 해월
  11: { name: "대설", branch: "子" },  // 자월
  12: { name: "소한", branch: "丑" },  // 축월
};

// ============================================================================
// 월주 계산 (오호둔월법)
// ============================================================================

/**
 * 오호둔월법(五虎遁月法)에 따른 월간 계산
 * 연간에 따라 월의 천간이 결정됨
 *
 * 甲/己년 → 丙寅月 시작
 * 乙/庚년 → 戊寅月 시작
 * 丙/辛년 → 庚寅月 시작
 * 丁/壬년 → 壬寅月 시작
 * 戊/癸년 → 甲寅月 시작
 *
 * @param yearStem - 연간
 * @param monthBranch - 월지 (寅, 卯, 辰...)
 * @returns 월간
 */
export function calculateMonthStem(yearStem: string, monthBranch: string): string {
  // 연간별 인월(寅月) 천간 시작점
  const monthStemStart: Record<string, number> = {
    "甲": 2, "己": 2,  // 丙寅月 시작 (丙 = 2)
    "乙": 4, "庚": 4,  // 戊寅月 시작 (戊 = 4)
    "丙": 6, "辛": 6,  // 庚寅月 시작 (庚 = 6)
    "丁": 8, "壬": 8,  // 壬寅月 시작 (壬 = 8)
    "戊": 0, "癸": 0,  // 甲寅月 시작 (甲 = 0)
  };

  // 월지 순서 (寅부터 시작)
  const monthBranchOrder = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const branchIndex = monthBranchOrder.indexOf(monthBranch);

  const startStemIndex = monthStemStart[yearStem] ?? 0;
  const monthStemIndex = (startStemIndex + branchIndex) % 10;

  return HEAVENLY_STEMS[monthStemIndex];
}

/**
 * 특정 연도, 월의 월주 계산
 *
 * @param year - 연도
 * @param month - 월 (1-12)
 * @returns 월주 정보
 */
export function calculateMonthlyPillar(year: number, month: number): Pillar {
  // 해당 월의 절기일 기준 Solar 객체 생성
  // 절기가 보통 매월 4-8일 사이에 있으므로 중순으로 계산
  const midMonthDate = new Date(year, month - 1, 15);
  const solar = Solar.fromDate(midMonthDate);
  const lunar = solar.getLunar();

  const monthGanZhi = lunar.getMonthInGanZhi();
  const stem = monthGanZhi[0];
  const branch = monthGanZhi[1];

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
 * 특정 연도, 월의 절기 시작일 조회
 *
 * @param year - 연도
 * @param month - 월 (1-12)
 * @returns 절기 시작일
 */
export function getSolarTermDate(year: number, month: number): string {
  // 각 월의 절기 대략적 날짜
  // 실제로는 lunar-javascript의 절기 계산 활용
  const solar = Solar.fromYmd(year, month, 1);

  // 해당 월의 절기들 조회
  const lunar = solar.getLunar();

  // 현재 월의 절기 찾기 (간략화된 버전)
  // 실제 구현시 lunar.getJieQi() 등 활용
  const termInfo = MONTH_SOLAR_TERMS[month];
  if (!termInfo) return `${year}-${String(month).padStart(2, "0")}-04`;

  // 대략적인 절기 시작일 (보통 4-8일 사이)
  const approxDay = month <= 6 ? (4 + (month % 2)) : (7 + (month % 2));

  return `${year}-${String(month).padStart(2, "0")}-${String(approxDay).padStart(2, "0")}`;
}

// ============================================================================
// 연간 월운 분석
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
 * 연간 12개월 월운 분석
 *
 * @param year - 연도
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @returns 연간 월운 분석 결과
 */
export function analyzeYearlyMonthlyFortunes(
  year: number,
  natalBranches: NatalBranches,
  usefulGodElement: Element
): Omit<YearlyMonthlyFortunes, "yearSummary"> & {
  monthlyAnalyses: Array<{
    month: number;
    pillar: Pillar;
    solarTermStart: string;
    interaction: FortuneInteraction;
    usefulGodRelation: "support" | "neutral" | "against";
    score: number;
    grade: FortuneGrade;
    gradeKorean: string;
  }>;
} {
  // 연주 계산
  const yearMidDate = new Date(year, 6, 1); // 7월 1일 기준
  const yearSolar = Solar.fromDate(yearMidDate);
  const yearLunar = yearSolar.getLunar();
  const yearGanZhi = yearLunar.getYearInGanZhi();

  const yearStem = yearGanZhi[0];
  const yearBranch = yearGanZhi[1];
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  const yearBranchIndex = EARTHLY_BRANCHES.indexOf(yearBranch);
  const yearElement = STEM_ELEMENTS[yearStem] || "earth";

  const yearlyPillar: Pillar = {
    stem: yearStem,
    branch: yearBranch,
    stemKorean: STEMS_KOREAN[yearStemIndex] || yearStem,
    branchKorean: BRANCHES_KOREAN[yearBranchIndex] || yearBranch,
    element: yearElement,
    elementKorean: ELEMENT_KOREAN[yearElement],
  };

  // 12개월 분석
  const monthlyAnalyses: Array<{
    month: number;
    pillar: Pillar;
    solarTermStart: string;
    interaction: FortuneInteraction;
    usefulGodRelation: "support" | "neutral" | "against";
    score: number;
    grade: FortuneGrade;
    gradeKorean: string;
  }> = [];

  const bestMonths: number[] = [];
  const cautionMonths: number[] = [];

  for (let month = 1; month <= 12; month++) {
    const pillar = calculateMonthlyPillar(year, month);
    const solarTermStart = getSolarTermDate(year, month);
    const interaction = analyzeNatalInteraction(pillar.branch, natalBranches);
    const usefulGodResult = analyzeUsefulGodRelation(pillar.element, usefulGodElement);
    const score = calculateDailyScore(interaction, usefulGodResult.relation);
    const grade = scoreToGrade(score);

    monthlyAnalyses.push({
      month,
      pillar,
      solarTermStart,
      interaction,
      usefulGodRelation: usefulGodResult.relation,
      score,
      grade,
      gradeKorean: gradeToKorean(grade),
    });

    // 베스트/주의 월 판별
    if (grade === "excellent" || (grade === "good" && score >= 65)) {
      bestMonths.push(month);
    }
    if (grade === "caution" || (grade === "normal" && score < 45)) {
      cautionMonths.push(month);
    }
  }

  return {
    year,
    yearlyPillar,
    monthlyFortunes: monthlyAnalyses.map((m) => ({
      month: m.month,
      pillar: m.pillar,
      solarTermStart: m.solarTermStart,
      natalInteraction: m.interaction,
      usefulGodRelation: m.usefulGodRelation,
      analysis: {
        score: m.score,
        grade: m.grade,
        theme: "",
        description: "",
        opportunities: [],
        challenges: [],
        advice: "",
      },
      keywords: [],
      luckyDays: [],
      cautionDays: [],
      recommendedActivities: [],
    })),
    bestMonths,
    cautionMonths,
    monthlyAnalyses,
  };
}

/**
 * 특정 월의 월운 요약
 */
export function getMonthFortuneSummary(
  year: number,
  month: number,
  natalBranches: NatalBranches,
  usefulGodElement: Element
): {
  year: number;
  month: number;
  pillar: string;
  pillarKorean: string;
  grade: string;
  score: number;
  highlights: string[];
  solarTermStart: string;
} {
  const pillar = calculateMonthlyPillar(year, month);
  const solarTermStart = getSolarTermDate(year, month);
  const interaction = analyzeNatalInteraction(pillar.branch, natalBranches);
  const usefulGodResult = analyzeUsefulGodRelation(pillar.element, usefulGodElement);
  const score = calculateDailyScore(interaction, usefulGodResult.relation);
  const grade = scoreToGrade(score);

  const highlights: string[] = [];

  if (interaction.harmonies.length > 0) {
    highlights.push(interaction.harmonies.join(", "));
  }
  if (interaction.clashes.length > 0) {
    highlights.push(interaction.clashes.join(", "));
  }
  if (usefulGodResult.relation === "support") {
    highlights.push("용신에 좋은 달");
  } else if (usefulGodResult.relation === "against") {
    highlights.push("용신에 불리한 달");
  }

  const termInfo = MONTH_SOLAR_TERMS[month];
  if (termInfo) {
    highlights.push(`${termInfo.name} 시작`);
  }

  return {
    year,
    month,
    pillar: `${pillar.stem}${pillar.branch}`,
    pillarKorean: `${pillar.stemKorean}${pillar.branchKorean}`,
    grade: gradeToKorean(grade),
    score,
    highlights,
    solarTermStart,
  };
}

/**
 * 올해의 월별 운세 개요
 */
export function getCurrentYearMonthlyOverview(
  natalBranches: NatalBranches,
  usefulGodElement: Element
): {
  year: number;
  currentMonth: number;
  months: Array<{
    month: number;
    pillarKorean: string;
    grade: string;
    score: number;
    isBest: boolean;
    isCaution: boolean;
  }>;
  bestMonths: number[];
  cautionMonths: number[];
} {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const analysis = analyzeYearlyMonthlyFortunes(year, natalBranches, usefulGodElement);

  return {
    year,
    currentMonth,
    months: analysis.monthlyAnalyses.map((m) => ({
      month: m.month,
      pillarKorean: `${m.pillar.stemKorean}${m.pillar.branchKorean}`,
      grade: m.gradeKorean,
      score: m.score,
      isBest: analysis.bestMonths.includes(m.month),
      isCaution: analysis.cautionMonths.includes(m.month),
    })),
    bestMonths: analysis.bestMonths,
    cautionMonths: analysis.cautionMonths,
  };
}
