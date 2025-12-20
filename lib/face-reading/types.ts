/**
 * 관상 분석 타입 정의
 */

export interface FaceAnalysisInput {
  imageBase64: string;
  gender: "male" | "female";
}

export interface FaceFeature {
  name: string;
  koreanName: string;
  score: number; // 0-100
  description: string;
  fortune: string;
}

export interface FaceShape {
  type: FaceShapeType;
  koreanName: string;
  description: string;
  characteristics: string[];
}

export type FaceShapeType =
  | "oval"      // 계란형
  | "round"     // 둥근형
  | "square"    // 사각형
  | "heart"     // 하트형
  | "long"      // 긴 형
  | "diamond";  // 다이아몬드형

export interface ForeheadAnalysis {
  type: "wide" | "narrow" | "high" | "low" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface EyeAnalysis {
  type: "phoenix" | "dragon" | "round" | "almond" | "narrow" | "wide";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface NoseAnalysis {
  type: "straight" | "aquiline" | "button" | "wide" | "pointed" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface MouthAnalysis {
  type: "full" | "thin" | "wide" | "small" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface EarAnalysis {
  type: "large" | "small" | "attached" | "detached" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface FaceReadingResult {
  overallScore: number; // 0-100
  overallGrade: FaceReadingGrade;
  gradeText: string;

  faceShape: FaceShape;

  features: {
    forehead: ForeheadAnalysis;
    eyes: EyeAnalysis;
    nose: NoseAnalysis;
    mouth: MouthAnalysis;
    ears: EarAnalysis;
  };

  fortuneAreas: {
    wealth: { score: number; description: string };      // 재물운
    career: { score: number; description: string };      // 직업운
    relationship: { score: number; description: string }; // 대인관계
    health: { score: number; description: string };       // 건강운
    love: { score: number; description: string };         // 애정운
  };

  strengths: string[];
  advice: string[];
  luckyElements: string[];
}

export type FaceReadingGrade =
  | "excellent"   // 대길
  | "good"        // 길
  | "normal"      // 보통
  | "caution"     // 주의
  | "challenging"; // 노력필요
