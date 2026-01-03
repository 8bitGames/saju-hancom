/**
 * 운(運) 시스템 타입 정의
 * 대운, 세운, 월운, 일운, 시운, 소운
 */

import type { Element } from "../types";

// ============================================================================
// 공통 타입
// ============================================================================

export type FortuneGrade = "excellent" | "good" | "normal" | "caution";

export interface Pillar {
  stem: string;           // 천간 (甲, 乙, 丙...)
  branch: string;         // 지지 (子, 丑, 寅...)
  stemKorean: string;     // 천간 한글 (갑, 을, 병...)
  branchKorean: string;   // 지지 한글 (자, 축, 인...)
  element: Element;       // 오행
  elementKorean: string;  // 오행 한글
}

export interface FortuneInteraction {
  harmonies: string[];    // 합 관계 (예: "일지와 육합")
  clashes: string[];      // 충 관계 (예: "월지와 충")
  punishments: string[];  // 형 관계
  harms: string[];        // 해 관계
  destructions: string[]; // 파 관계
}

export interface FortuneAnalysis {
  score: number;          // 0-100
  grade: FortuneGrade;
  theme: string;          // 테마/주제
  description: string;    // 상세 설명
  opportunities: string[]; // 좋은 점
  challenges: string[];   // 주의할 점
  advice: string;         // 조언
}

// ============================================================================
// 일운 (日運) - Daily Fortune
// ============================================================================

export interface DailyFortune {
  /** 날짜 (YYYY-MM-DD) */
  date: string;

  /** 일진 (日辰) */
  pillar: Pillar;

  /** 원국과의 관계 */
  natalInteraction: FortuneInteraction;

  /** 용신과의 관계 */
  usefulGodRelation: "support" | "neutral" | "against";
  usefulGodRelationReason: string;

  /** 분석 결과 */
  analysis: FortuneAnalysis;

  /** 추천 활동 */
  recommendedActivities: string[];

  /** 피해야 할 활동 */
  activitiesToAvoid: string[];

  /** 행운의 시간대 (시지 기준) */
  luckyHours: string[];

  /** 주의할 시간대 */
  cautionHours: string[];
}

// ============================================================================
// 시운 (時運) - Hourly Fortune
// ============================================================================

export interface HourlyFortune {
  /** 시간 범위 (예: "05:00-07:00") */
  timeRange: string;

  /** 시진 이름 (예: "묘시") */
  periodName: string;

  /** 시주 (時柱) */
  pillar: Pillar;

  /** 분석 결과 */
  score: number;
  grade: FortuneGrade;
  description: string;
  advice: string;

  /** 이 시간대에 좋은 일 */
  goodFor: string[];

  /** 이 시간대에 피할 일 */
  avoidFor: string[];
}

export interface DailyHourlyFortunes {
  /** 날짜 */
  date: string;

  /** 일진 */
  dailyPillar: Pillar;

  /** 12시진별 운세 */
  hourlyFortunes: HourlyFortune[];

  /** 가장 좋은 시간 */
  bestHours: string[];

  /** 주의할 시간 */
  cautionHours: string[];
}

// ============================================================================
// 월운 (月運) - Monthly Fortune (12개월 상세)
// ============================================================================

export interface MonthlyFortune {
  /** 월 (1-12) */
  month: number;

  /** 월주 (月柱) */
  pillar: Pillar;

  /** 절기 기준 시작일 */
  solarTermStart: string;

  /** 원국과의 관계 */
  natalInteraction: FortuneInteraction;

  /** 용신과의 관계 */
  usefulGodRelation: "support" | "neutral" | "against";

  /** 분석 결과 */
  analysis: FortuneAnalysis;

  /** 이달의 키워드 */
  keywords: string[];

  /** 좋은 날 (일자) */
  luckyDays: number[];

  /** 주의할 날 */
  cautionDays: number[];

  /** 추천 활동 */
  recommendedActivities: string[];
}

export interface YearlyMonthlyFortunes {
  /** 연도 */
  year: number;

  /** 세운 (歲運) */
  yearlyPillar: Pillar;

  /** 12개월 월운 */
  monthlyFortunes: MonthlyFortune[];

  /** 가장 좋은 달 */
  bestMonths: number[];

  /** 주의할 달 */
  cautionMonths: number[];

  /** 연간 흐름 요약 */
  yearSummary: string;
}

// ============================================================================
// 소운 (小運) - Minor Fortune (대운 시작 전)
// ============================================================================

export interface MinorFortune {
  /** 나이 (1세부터) */
  age: number;

  /** 소운 간지 */
  pillar: Pillar;

  /** 분석 */
  description: string;

  /** 주요 테마 */
  theme: string;
}

export interface MinorFortuneList {
  /** 소운 시작 나이 */
  startAge: number;

  /** 대운 시작 나이 (소운 종료) */
  majorFortuneStartAge: number;

  /** 순행/역행 */
  direction: "forward" | "backward";

  /** 소운 목록 */
  fortunes: MinorFortune[];
}

// ============================================================================
// 대운 (大運) - Major Fortune (정밀화)
// ============================================================================

export interface MajorFortunePillar {
  /** 대운 순서 (1, 2, 3...) */
  order: number;

  /** 시작 나이 */
  startAge: number;

  /** 종료 나이 */
  endAge: number;

  /** 시작 연도 */
  startYear: number;

  /** 종료 연도 */
  endYear: number;

  /** 대운 간지 */
  pillar: Pillar;

  /** 원국과의 관계 */
  natalInteraction: FortuneInteraction;

  /** 용신과의 관계 */
  usefulGodRelation: "support" | "neutral" | "against";

  /** 분석 결과 */
  analysis: FortuneAnalysis;

  /** 이 대운의 키워드 */
  keywords: string[];
}

export interface MajorFortuneList {
  /** 대운수 (대운 시작 나이) */
  startAge: number;

  /** 순행/역행 */
  direction: "forward" | "backward";

  /** 대운수 계산 근거 */
  calculationBasis: {
    /** 설명 문자열 */
    description: string;
    /** 절기 이름 */
    solarTermName: string;
    /** 절기 날짜 */
    solarTermDate: string;
    /** 절기까지 일수 */
    daysToSolarTerm: number;
  };

  /** 현재 대운 인덱스 */
  currentIndex: number;

  /** 대운 목록 (8-10개) */
  fortunes: MajorFortunePillar[];
}

// ============================================================================
// API 요청/응답 타입
// ============================================================================

export interface DailyFortuneRequest {
  /** 사주 분석 결과의 shareId */
  shareId: string;

  /** 조회할 날짜 (기본값: 오늘) */
  date?: string;

  /** 언어 */
  locale?: "ko" | "en";
}

export interface HourlyFortuneRequest {
  shareId: string;
  date?: string;
  locale?: "ko" | "en";
}

export interface MonthlyFortuneRequest {
  shareId: string;
  year?: number;
  locale?: "ko" | "en";
}

// ============================================================================
// 상수
// ============================================================================

/** 천간 배열 */
export const HEAVENLY_STEMS: string[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/** 천간 한글 */
export const STEMS_KOREAN: string[] = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];

/** 지지 배열 */
export const EARTHLY_BRANCHES: string[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/** 지지 한글 */
export const BRANCHES_KOREAN: string[] = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

/** 지지 띠 동물 */
export const BRANCHES_ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"] as const;

/** 시진 이름 */
export const HOUR_PERIOD_NAMES = ["자시", "축시", "인시", "묘시", "진시", "사시", "오시", "미시", "신시", "유시", "술시", "해시"] as const;

/** 시간대 범위 */
export const HOUR_RANGES = [
  "23:00-01:00", "01:00-03:00", "03:00-05:00", "05:00-07:00",
  "07:00-09:00", "09:00-11:00", "11:00-13:00", "13:00-15:00",
  "15:00-17:00", "17:00-19:00", "19:00-21:00", "21:00-23:00"
] as const;

/** 천간 오행 매핑 */
export const STEM_ELEMENTS: Record<string, Element> = {
  "甲": "wood", "乙": "wood",
  "丙": "fire", "丁": "fire",
  "戊": "earth", "己": "earth",
  "庚": "metal", "辛": "metal",
  "壬": "water", "癸": "water"
};

/** 지지 오행 매핑 */
export const BRANCH_ELEMENTS: Record<string, Element> = {
  "子": "water", "丑": "earth", "寅": "wood", "卯": "wood",
  "辰": "earth", "巳": "fire", "午": "fire", "未": "earth",
  "申": "metal", "酉": "metal", "戌": "earth", "亥": "water"
};

/** 오행 한글 */
export const ELEMENT_KOREAN: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)"
};

/** 육충 관계 */
export const SIX_CLASHES: [string, string][] = [
  ["子", "午"], ["丑", "未"], ["寅", "申"],
  ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]
];

/** 육합 관계 */
export const SIX_HARMONIES: [string, string][] = [
  ["子", "丑"], ["寅", "亥"], ["卯", "戌"],
  ["辰", "酉"], ["巳", "申"], ["午", "未"]
];

/** 삼합 관계 */
export const THREE_HARMONIES: [string, string, string, Element][] = [
  ["寅", "午", "戌", "fire"],   // 인오술 화국
  ["巳", "酉", "丑", "metal"],  // 사유축 금국
  ["申", "子", "辰", "water"],  // 신자진 수국
  ["亥", "卯", "未", "wood"]    // 해묘미 목국
];
