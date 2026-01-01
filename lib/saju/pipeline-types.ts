/**
 * 사주 분석 파이프라인 타입 정의
 * 6단계 분석 시스템: Foundation → Day Master → Ten Gods → Special Stars → Fortune Timing → Synthesis
 */

// ============================================================================
// 공통 타입
// ============================================================================

export type AnalysisGrade = "excellent" | "good" | "normal" | "caution" | "challenging";

export interface ElementScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export type BodyStrength = "신강" | "신약" | "중화";
export type MonthlyRating = "excellent" | "good" | "normal" | "caution";

// ============================================================================
// Step 1: 기초 구조 분석 (Foundation)
// ============================================================================

export interface PillarData {
  stem: string;        // 천간
  branch: string;      // 지지
  stemElement: string; // 천간 오행
  branchElement: string; // 지지 오행
  stemKorean: string;  // 천간 한글명
  branchKorean: string; // 지지 한글명
}

export interface Step1_Foundation {
  /** 사주 원국 - 년월일시 네 기둥 */
  pillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    time: PillarData;
  };

  /** 오행 점수 (0-100) */
  elementScores: ElementScores;

  /** 강한 오행 목록 */
  dominantElements: string[];

  /** 부족한 오행 목록 */
  lackingElements: string[];

  /** 천간 관계 (합, 충 등) */
  stemRelations: string[];

  /** 지지 관계 (삼합, 육합, 충 등) */
  branchRelations: string[];

  /** 원국 전체 요약 */
  summary: string;
}

// ============================================================================
// Step 2: 일간 심층 분석 (Day Master)
// ============================================================================

export interface UsefulGodSystem {
  /** 용신 (가장 필요한 오행) */
  primary: string;
  primaryElement: string;

  /** 희신 (용신을 돕는 오행) */
  supporting: string;
  supportingElement: string;

  /** 기신 (피해야 할 오행) */
  avoiding: string;
  avoidingElement: string;

  /** 용신 선정 이유 */
  reasoning: string;
}

export interface Step2_DayMaster {
  /** 일간 (갑, 을, 병 등) */
  dayMaster: string;

  /** 일간 한글 설명 */
  dayMasterKorean: string;

  /** 일간 오행 */
  dayMasterElement: string;

  /** 일간 핵심 특성 */
  characteristics: string[];

  /** 일간 성격 상세 설명 */
  personalityDescription: string;

  /** 월령 분석 (득령/실령) */
  monthlyInfluence: "득령" | "실령";
  monthlyInfluenceReason: string;

  /** 통근 분석 (지지에 뿌리가 있는지) */
  rootStrength: number; // 0-100
  rootAnalysis: string;

  /** 투출 분석 (천간에 드러난 오행) */
  manifestations: string[];

  /** 신강/신약 판단 */
  bodyStrength: BodyStrength;
  bodyStrengthReason: string;

  /** 용신 체계 */
  usefulGod: UsefulGodSystem;
}

// ============================================================================
// Step 3: 십성 분석 (Ten Gods)
// ============================================================================

export interface TenGodDetail {
  name: string;
  koreanName: string;
  count: number;
  positions: string[]; // 어느 기둥에 있는지
  influence: string;
}

export interface PersonalityProfile {
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  description: string;
}

export interface CareerAptitude {
  suitableFields: string[];
  workStyle: string;
  leadershipStyle: string;
  idealEnvironment: string;
}

export interface RelationshipStyle {
  socialPattern: string;
  communicationStyle: string;
  loveStyle: string;
  familyRole: string;
  idealPartnerTraits: string[];
}

export interface Step3_TenGods {
  /** 각 십성별 상세 정보 */
  tenGodsDetails: TenGodDetail[];

  /** 십성 개수 집계 */
  tenGodsCounts: Record<string, number>;

  /** 주요 십성 (2개 이상인 것들) */
  dominantGods: string[];

  /** 격국 판단 */
  structure: string;
  structureDescription: string;

  /** 성격 프로파일 */
  personality: PersonalityProfile;

  /** 직업 적성 */
  careerAptitude: CareerAptitude;

  /** 대인관계 스타일 */
  relationshipStyle: RelationshipStyle;
}

// ============================================================================
// Step 4: 신살 분석 (Special Stars)
// ============================================================================

export interface AuspiciousStar {
  name: string;
  koreanName: string;
  position: string; // 어느 기둥에 있는지
  meaning: string;
  influence: string;
  howToUse: string;
}

export interface InauspiciousStar {
  name: string;
  koreanName: string;
  position: string;
  meaning: string;
  caution: string;
  positiveUse: string; // 긍정적으로 활용하는 방법
}

export interface Step4_SpecialStars {
  /** 길신 목록 */
  auspiciousStars: AuspiciousStar[];

  /** 흉신 목록 */
  inauspiciousStars: InauspiciousStar[];

  /** 신살 종합 영향력 분석 */
  overallStarInfluence: string;

  /** 길신 활용 전략 */
  auspiciousStrategy: string;

  /** 흉신 대처 전략 */
  inauspiciousStrategy: string;
}

// ============================================================================
// Step 5: 대운/세운 분석 (Fortune Timing)
// ============================================================================

export interface MajorFortune {
  period: string; // "2020-2030"
  startAge: number;
  endAge: number;
  stem: string;
  branch: string;
  element: string;
  theme: string;
  influence: string;
  opportunities: string[];
  challenges: string[];
}

export interface YearlyFortune {
  year: number;
  stem: string;
  branch: string;
  element: string;
  interaction: string; // 원국과의 관계
  theme: string;
  score: number;
  opportunities: string[];
  challenges: string[];
  advice: string;
}

export interface MonthlyHighlight {
  month: number;
  rating: MonthlyRating;
  element: string;
  description: string;
  focus: string;
  advice: string;
}

export interface Step5_FortuneTiming {
  /** 현재 대운 */
  currentMajorFortune: MajorFortune;

  /** 다음 대운 미리보기 */
  nextMajorFortune: {
    period: string;
    theme: string;
    preview: string;
  };

  /** 올해 세운 */
  yearlyFortune: YearlyFortune;

  /** 월별 하이라이트 (주요 월 3-4개) */
  monthlyHighlights: MonthlyHighlight[];

  /** 시기별 조언 */
  timingAdvice: {
    bestMonths: number[];
    cautionMonths: number[];
    overallTimingStrategy: string;
  };
}

// ============================================================================
// Step 6: 종합 및 조언 (Synthesis)
// ============================================================================

export interface AreaScore {
  score: number;
  grade: AnalysisGrade;
  summary: string;
  keyPoints: string[];
}

export interface PracticalAdvice {
  immediate: string[];   // 즉시 할 수 있는 것
  shortTerm: string[];   // 1-3개월 내 조언
  longTerm: string[];    // 장기 조언
}

export interface LuckyElements {
  colors: string[];
  numbers: number[];
  directions: string[];
  activities: string[];
  seasons: string[];
}

export interface Step6_Synthesis {
  /** 캐치프레이즈 - 사주를 한 문장으로 표현 */
  catchphrase: string;

  /** 성격/특성 태그 (3-5개) */
  tags: string[];

  /** 종합 점수 (0-100) */
  overallScore: number;

  /** 종합 등급 */
  overallGrade: AnalysisGrade;

  /** 등급 텍스트 */
  gradeText: string;

  /** 종합 요약 (2-3문장) */
  summary: string;

  /** 영역별 점수 및 요약 */
  areas: {
    personality: AreaScore;
    career: AreaScore;
    wealth: AreaScore;
    relationship: AreaScore;
    health: AreaScore;
  };

  /** 핵심 인사이트 (3-5개) */
  keyInsights: string[];

  /** 가장 큰 강점 */
  topStrengths: string[];

  /** 주의해야 할 점 */
  areasToWatch: string[];

  /** 실용적 조언 */
  advice: PracticalAdvice;

  /** 행운 요소 */
  luckyElements: LuckyElements;

  /** 한줄 운세 메시지 */
  oneLineMessage: string;
}

// ============================================================================
// 파이프라인 결과 타입
// ============================================================================

export interface SajuPipelineResult {
  step1: Step1_Foundation;
  step2: Step2_DayMaster;
  step3: Step3_TenGods;
  step4: Step4_SpecialStars;
  step5: Step5_FortuneTiming;
  step6: Step6_Synthesis;
}

export interface PipelineProgress {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  stepDescription: string;
  completedSteps: Array<{
    step: number;
    name: string;
    summary: string;
  }>;
}

export type StepResult<T> = {
  success: true;
  data: T;
  processingTime: number;
} | {
  success: false;
  error: string;
  processingTime: number;
};

// ============================================================================
// API 요청/응답 타입
// ============================================================================

export interface SajuAnalysisInput {
  birthDate: string;      // YYYY-MM-DD
  birthTime: string;      // HH:mm
  gender: "male" | "female";
  isLunar?: boolean;      // 음력 여부
  name?: string;          // 선택적 이름
  locale?: "ko" | "en";   // 언어 설정 (기본값: ko)
}

export interface StreamingEvent {
  type: "step_start" | "step_complete" | "step_error" | "analysis_complete";
  step?: number;
  stepName?: string;
  data?: unknown;
  error?: string;
  progress?: PipelineProgress;
}
