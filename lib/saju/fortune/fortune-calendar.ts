/**
 * 운세 캘린더 모듈
 * Fortune Calendar Module
 *
 * 월별 일일 운세 점수를 캘린더 형태로 제공
 * 택일(擇日) 기능을 위한 길일/흉일 판별
 */

import type { Element } from "../types";
import type { FortuneGrade, Pillar, FortuneInteraction } from "./types";
import {
  calculateDailyPillar,
  analyzeNatalInteraction,
  analyzeUsefulGodRelation,
  calculateDailyScore,
  scoreToGrade,
  gradeToKorean,
} from "./daily-fortune";

// ============================================================================
// Types
// ============================================================================

/**
 * 원국 지지 정보
 */
export interface NatalBranches {
  year: string;
  month: string;
  day: string;
  time: string;
}

/**
 * 캘린더 일일 운세
 */
export interface CalendarDayFortune {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 요일 (0=일, 1=월, ..., 6=토) */
  dayOfWeek: number;
  /** 일자 (1-31) */
  dayOfMonth: number;
  /** 점수 (0-100) */
  score: number;
  /** 등급 */
  grade: FortuneGrade;
  /** 등급 한글 */
  gradeKorean: string;
  /** 일진 */
  pillar: {
    stem: string;
    branch: string;
    stemKorean: string;
    branchKorean: string;
    ganZhi: string;
    ganZhiKorean: string;
  };
  /** 일진 오행 */
  element: Element;
  /** 용신 관계 */
  usefulGodRelation: "support" | "neutral" | "against";
  /** 원국 관계 하이라이트 */
  highlights: string[];
  /** 좋은 일 */
  goodFor: string[];
  /** 피할 일 */
  badFor: string[];
}

/**
 * 캘린더 월 결과
 */
export interface FortuneCalendarResult {
  /** 연도 */
  year: number;
  /** 월 (1-12) */
  month: number;
  /** 일일 운세 목록 */
  days: CalendarDayFortune[];
  /** 대길일 목록 (YYYY-MM-DD) */
  excellentDays: string[];
  /** 길일 목록 */
  goodDays: string[];
  /** 주의일 목록 */
  cautionDays: string[];
  /** 월 통계 */
  statistics: {
    /** 평균 점수 */
    averageScore: number;
    /** 최고 점수 */
    maxScore: number;
    /** 최저 점수 */
    minScore: number;
    /** 대길일 수 */
    excellentCount: number;
    /** 길일 수 */
    goodCount: number;
    /** 평일 수 */
    normalCount: number;
    /** 주의일 수 */
    cautionCount: number;
  };
}

/**
 * 택일 카테고리
 */
export type AuspiciousCategory =
  | "marriage"    // 결혼, 약혼
  | "moving"      // 이사
  | "business"    // 계약, 사업 시작
  | "travel"      // 여행
  | "interview"   // 면접, 시험
  | "medical"     // 수술, 건강검진
  | "celebration" // 잔치, 행사
  | "general";    // 일반

// ============================================================================
// Constants
// ============================================================================

/**
 * 카테고리별 추천/비추천 활동
 */
const CATEGORY_ACTIVITIES: Record<
  AuspiciousCategory,
  { goodFor: string[]; badFor: string[] }
> = {
  marriage: {
    goodFor: ["결혼", "약혼", "맞선", "프로포즈"],
    badFor: ["이별 논의", "갈등 해결"],
  },
  moving: {
    goodFor: ["이사", "집들이", "부동산 계약"],
    badFor: ["정리정돈", "큰 변화"],
  },
  business: {
    goodFor: ["계약", "사업 시작", "투자", "협상"],
    badFor: ["큰 결정", "리스크 있는 거래"],
  },
  travel: {
    goodFor: ["여행", "출장", "새로운 장소 방문"],
    badFor: ["장거리 이동", "모험적 활동"],
  },
  interview: {
    goodFor: ["면접", "시험", "발표", "프레젠테이션"],
    badFor: ["중요한 평가", "경쟁 상황"],
  },
  medical: {
    goodFor: ["건강검진", "치료 시작"],
    badFor: ["수술", "큰 시술"],
  },
  celebration: {
    goodFor: ["파티", "행사", "축하 모임"],
    badFor: ["대규모 행사"],
  },
  general: {
    goodFor: ["일상 활동", "가벼운 약속"],
    badFor: ["큰 결정", "중요한 계획"],
  },
};

/**
 * 등급별 활동 추천
 */
const GRADE_ACTIVITIES: Record<
  FortuneGrade,
  { goodFor: string[]; badFor: string[] }
> = {
  excellent: {
    goodFor: ["중요한 계약", "큰 결정", "새로운 시작", "프로포즈", "면접"],
    badFor: [],
  },
  good: {
    goodFor: ["사업 미팅", "여행", "소개팅", "발표"],
    badFor: ["극도로 중요한 결정"],
  },
  normal: {
    goodFor: ["일상 업무", "가벼운 약속"],
    badFor: ["중요한 계약", "큰 투자", "결혼"],
  },
  caution: {
    goodFor: ["휴식", "재충전", "계획 수립"],
    badFor: ["중요한 결정", "계약", "여행", "새로운 시작"],
  },
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * 월별 운세 캘린더 생성
 *
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @param year - 연도
 * @param month - 월 (1-12)
 * @returns 캘린더 결과
 */
export function generateFortuneCalendar(
  natalBranches: NatalBranches,
  usefulGodElement: Element,
  year: number,
  month: number
): FortuneCalendarResult {
  const days: CalendarDayFortune[] = [];
  const excellentDays: string[] = [];
  const goodDays: string[] = [];
  const cautionDays: string[] = [];

  // 해당 월의 일수 계산
  const daysInMonth = new Date(year, month, 0).getDate();

  let totalScore = 0;
  let maxScore = 0;
  let minScore = 100;
  let excellentCount = 0;
  let goodCount = 0;
  let normalCount = 0;
  let cautionCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = formatDate(date);

    // 일진 계산
    const pillar = calculateDailyPillar(date);

    // 원국과의 관계 분석
    const interaction = analyzeNatalInteraction(pillar.branch, natalBranches);

    // 용신과의 관계 분석
    const usefulGodResult = analyzeUsefulGodRelation(
      pillar.element,
      usefulGodElement
    );

    // 점수 계산
    const score = calculateDailyScore(interaction, usefulGodResult.relation);
    const grade = scoreToGrade(score);

    // 하이라이트 생성
    const highlights = generateHighlights(interaction, usefulGodResult.relation);

    // 활동 추천 생성
    const { goodFor, badFor } = generateActivityRecommendations(grade);

    const dayFortune: CalendarDayFortune = {
      date: dateStr,
      dayOfWeek: date.getDay(),
      dayOfMonth: day,
      score,
      grade,
      gradeKorean: gradeToKorean(grade),
      pillar: {
        stem: pillar.stem,
        branch: pillar.branch,
        stemKorean: pillar.stemKorean,
        branchKorean: pillar.branchKorean,
        ganZhi: `${pillar.stem}${pillar.branch}`,
        ganZhiKorean: `${pillar.stemKorean}${pillar.branchKorean}`,
      },
      element: pillar.element,
      usefulGodRelation: usefulGodResult.relation,
      highlights,
      goodFor,
      badFor,
    };

    days.push(dayFortune);

    // 통계 업데이트
    totalScore += score;
    maxScore = Math.max(maxScore, score);
    minScore = Math.min(minScore, score);

    // 등급별 분류
    switch (grade) {
      case "excellent":
        excellentDays.push(dateStr);
        excellentCount++;
        break;
      case "good":
        goodDays.push(dateStr);
        goodCount++;
        break;
      case "normal":
        normalCount++;
        break;
      case "caution":
        cautionDays.push(dateStr);
        cautionCount++;
        break;
    }
  }

  return {
    year,
    month,
    days,
    excellentDays,
    goodDays,
    cautionDays,
    statistics: {
      averageScore: Math.round(totalScore / daysInMonth),
      maxScore,
      minScore,
      excellentCount,
      goodCount,
      normalCount,
      cautionCount,
    },
  };
}

/**
 * 특정 카테고리의 길일 찾기 (택일)
 *
 * @param calendar - 캘린더 결과
 * @param category - 택일 카테고리
 * @param minGrade - 최소 등급 (기본: good)
 * @returns 추천 날짜 목록
 */
export function findAuspiciousDays(
  calendar: FortuneCalendarResult,
  category: AuspiciousCategory = "general",
  minGrade: FortuneGrade = "good"
): CalendarDayFortune[] {
  const gradeOrder: FortuneGrade[] = ["excellent", "good", "normal", "caution"];
  const minGradeIndex = gradeOrder.indexOf(minGrade);

  return calendar.days
    .filter((day) => {
      const dayGradeIndex = gradeOrder.indexOf(day.grade);
      return dayGradeIndex <= minGradeIndex;
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * 다중 월 캘린더 생성 (3개월 또는 6개월)
 *
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @param startYear - 시작 연도
 * @param startMonth - 시작 월
 * @param months - 월 수 (기본: 3)
 * @returns 캘린더 결과 배열
 */
export function generateMultiMonthCalendar(
  natalBranches: NatalBranches,
  usefulGodElement: Element,
  startYear: number,
  startMonth: number,
  months: number = 3
): FortuneCalendarResult[] {
  const calendars: FortuneCalendarResult[] = [];

  let year = startYear;
  let month = startMonth;

  for (let i = 0; i < months; i++) {
    calendars.push(
      generateFortuneCalendar(natalBranches, usefulGodElement, year, month)
    );

    // 다음 달로 이동
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return calendars;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 관계 분석 결과로 하이라이트 생성
 */
function generateHighlights(
  interaction: FortuneInteraction,
  usefulGodRelation: "support" | "neutral" | "against"
): string[] {
  const highlights: string[] = [];

  // 긍정적 관계
  if (interaction.harmonies.length > 0) {
    highlights.push(`✨ ${interaction.harmonies.join(", ")}`);
  }

  // 부정적 관계
  if (interaction.clashes.length > 0) {
    highlights.push(`⚠️ ${interaction.clashes.join(", ")}`);
  }
  if (interaction.punishments.length > 0) {
    highlights.push(`⛔ ${interaction.punishments.join(", ")}`);
  }

  // 용신 관계
  if (usefulGodRelation === "support") {
    highlights.push("💪 용신 강화");
  } else if (usefulGodRelation === "against") {
    highlights.push("🔻 용신 약화");
  }

  return highlights;
}

/**
 * 등급별 활동 추천 생성
 */
function generateActivityRecommendations(
  grade: FortuneGrade
): { goodFor: string[]; badFor: string[] } {
  return GRADE_ACTIVITIES[grade];
}

/**
 * Date를 YYYY-MM-DD 문자열로 변환
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 요일 한글명 반환
 */
export function getDayOfWeekKorean(dayOfWeek: number): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[dayOfWeek];
}

/**
 * 등급별 색상 클래스 반환
 */
export function getGradeColorClass(grade: FortuneGrade): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<FortuneGrade, { bg: string; text: string; border: string }> = {
    excellent: {
      bg: "bg-green-500",
      text: "text-white",
      border: "border-green-500",
    },
    good: {
      bg: "bg-blue-500",
      text: "text-white",
      border: "border-blue-500",
    },
    normal: {
      bg: "bg-gray-300",
      text: "text-gray-700",
      border: "border-gray-300",
    },
    caution: {
      bg: "bg-orange-500",
      text: "text-white",
      border: "border-orange-500",
    },
  };
  return colors[grade];
}

/**
 * 등급별 투명도 있는 색상 클래스 반환 (캘린더 배경용)
 */
export function getGradeBgColorClass(grade: FortuneGrade): string {
  const colors: Record<FortuneGrade, string> = {
    excellent: "bg-green-500/20",
    good: "bg-blue-500/20",
    normal: "bg-white/5",
    caution: "bg-orange-500/20",
  };
  return colors[grade];
}
