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

// 직장 관계 타입
export type WorkRelationType =
  | "colleague"    // 동료
  | "supervisor"   // 상사
  | "subordinate"  // 부하
  | "partner"      // 파트너/협력자
  | "client"       // 고객/거래처
  | "mentor"       // 멘토
  | "mentee";      // 멘티

// 개인 관계 타입
export type PersonalRelationType =
  | "lover"        // 연인
  | "spouse"       // 부부
  | "friend"       // 친구
  | "family";      // 가족

// 전체 관계 타입
export type RelationType = WorkRelationType | PersonalRelationType;

// 천간합 결과
export interface CheonganHapResult {
  person1Gan: Gan;
  person2Gan: Gan;
  hasHap: boolean;
  hapType?: "갑기합토" | "을경합금" | "병신합수" | "정임합목" | "무계합화";
  hapElement?: Element;
  description: string;
}

// 지지 관계 결과
export interface JijiRelationResult {
  // 육합 (六合)
  yukHap: {
    pairs: Array<{ zhi1: Zhi; zhi2: Zhi; resultElement: Element }>;
    description: string;
  };
  // 삼합 (三合)
  samHap: {
    groups: Array<{ zhis: Zhi[]; resultElement: Element }>;
    description: string;
  };
  // 충 (沖)
  chung: {
    pairs: Array<{ zhi1: Zhi; zhi2: Zhi }>;
    description: string;
  };
  // 형 (刑)
  hyung: {
    pairs: Array<{ zhi1: Zhi; zhi2: Zhi }>;
    description: string;
  };
}

// 일주 궁합 결과
export interface IljuCompatibilityResult {
  person1Ilju: SimplePillar;
  person2Ilju: SimplePillar;
  ganRelation: "상생" | "상극" | "비화" | "합";
  zhiRelation: "합" | "충" | "형" | "해" | "중립";
  overallIljuScore: number;
  description: string;
}

// 오행 균형 분석
export interface ElementBalanceAnalysis {
  person1Dominant: Element;
  person2Dominant: Element;
  person1Weak: Element;
  person2Weak: Element;
  complementary: boolean; // 서로 보완하는 관계인지
  description: string;
}

// 상세 궁합 결과
export interface DetailedCompatibilityResult extends PersonCompatibilityResult {
  // 천간합 분석
  cheonganHap: CheonganHapResult;

  // 지지 관계 분석
  jijiRelation: JijiRelationResult;

  // 일주 궁합 분석
  iljuCompatibility: IljuCompatibilityResult;

  // 오행 균형 분석
  elementBalanceAnalysis: ElementBalanceAnalysis;

  // 관계 유형별 상세 분석
  relationshipAnalysis: {
    emotional: { score: number; description: string };      // 정서적 교감
    physical: { score: number; description: string };       // 신체적 조화
    intellectual: { score: number; description: string };   // 지적 교류
    spiritual: { score: number; description: string };      // 정신적 유대
    financial: { score: number; description: string };      // 경제적 조화
  };

  // 시간에 따른 궁합 변화
  timingAnalysis: {
    shortTerm: { score: number; description: string };      // 단기 (1-2년)
    midTerm: { score: number; description: string };        // 중기 (3-5년)
    longTerm: { score: number; description: string };       // 장기 (5년+)
  };

  // 연애/결혼 관련 특별 분석 (연인/부부 관계일 때)
  romanticAnalysis?: {
    initialAttraction: { score: number; description: string };  // 첫인상/끌림
    dateCompatibility: { score: number; description: string };  // 데이트 궁합
    marriageProspect: { score: number; description: string };   // 결혼 전망
    childrenFortune: { score: number; description: string };    // 자녀운
  };

  // 갈등 포인트와 해결책
  conflictPoints: Array<{
    area: string;
    description: string;
    solution: string;
  }>;

  // 함께하면 좋은 활동/시기
  recommendedActivities: string[];
  luckyDates: string[];

  // 서로에게 해주면 좋은 조언
  adviceForPerson1: string[];
  adviceForPerson2: string[];
}

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
