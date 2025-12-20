import type { Element, Gan, Zhi } from "@/lib/saju/types";

export interface PersonInfo {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: "male" | "female";
  isLunar: boolean;
  city: string;
}

/** 간단한 주 타입 */
export interface SimplePillar {
  gan: Gan;
  zhi: Zhi;
}

export type RelationType =
  | "colleague"    // 동료
  | "supervisor"   // 상사
  | "subordinate"  // 부하
  | "partner"      // 파트너/협력자
  | "client"       // 고객/거래처
  | "mentor"       // 멘토
  | "mentee";      // 멘티

export interface PersonCompatibilityResult {
  score: number; // 0-100
  grade: CompatibilityGrade;
  gradeText: string;
  elementBalance: {
    person1: Record<Element, number>;
    person2: Record<Element, number>;
    compatibility: Record<Element, string>;
  };
  analysis: {
    communication: { score: number; description: string };  // 소통
    collaboration: { score: number; description: string };  // 협업
    trust: { score: number; description: string };          // 신뢰
    growth: { score: number; description: string };         // 성장
  };
  relationshipAdvice: string[];
  cautions: string[];
  person1Pillars: {
    year: SimplePillar;
    month: SimplePillar;
    day: SimplePillar;
    time: SimplePillar;
  };
  person2Pillars: {
    year: SimplePillar;
    month: SimplePillar;
    day: SimplePillar;
    time: SimplePillar;
  };
  person1Name: string;
  person2Name: string;
  relationType?: RelationType;
}

export type CompatibilityGrade = "excellent" | "good" | "normal" | "caution" | "challenging";

// Legacy support (deprecated)
export interface CompanyInfo {
  name: string;
  foundedYear: number;
  foundedMonth: number;
  foundedDay: number;
}

export interface CompatibilityResult {
  score: number;
  grade: CompatibilityGrade;
  gradeText: string;
  elementBalance: {
    person: Record<Element, number>;
    company: Record<Element, number>;
    compatibility: Record<Element, string>;
  };
  analysis: {
    career: { score: number; description: string };
    wealth: { score: number; description: string };
    stability: { score: number; description: string };
    growth: { score: number; description: string };
  };
  recommendations: string[];
  cautions: string[];
  companyPillars: {
    year: SimplePillar;
    month: SimplePillar;
    day: SimplePillar;
  };
}
