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

export interface SimplePillar {
  gan: Gan;
  zhi: Zhi;
}

export type CoupleRelationType =
  | "dating"      // 연애 중
  | "engaged"     // 약혼
  | "married"     // 결혼
  | "interested"  // 관심 있는 상대
  | "exPartner";  // 전 연인

export interface CoupleCompatibilityResult {
  score: number; // 0-100
  grade: CoupleCompatibilityGrade;
  gradeText: string;
  elementBalance: {
    person1: Record<Element, number>;
    person2: Record<Element, number>;
    compatibility: Record<Element, string>;
  };
  analysis: {
    romance: { score: number; description: string };      // 연애운
    communication: { score: number; description: string }; // 소통
    passion: { score: number; description: string };       // 열정
    stability: { score: number; description: string };     // 안정성
    future: { score: number; description: string };        // 미래
  };
  relationshipAdvice: string[];
  cautions: string[];
  luckyElements: Element[];
  bestDates: string[];
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
  relationType?: CoupleRelationType;
}

export type CoupleCompatibilityGrade = "soulmate" | "excellent" | "good" | "normal" | "challenging";
