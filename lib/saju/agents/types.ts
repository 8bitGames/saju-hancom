/**
 * Multi-Agent 초개인화 사주 시스템 타입 정의
 * v1.1 - 2024.12
 */

import type { SajuResult, Star, TenGod, Element } from "../types";

// ============================================================================
// 공통 타입 (Common Types)
// ============================================================================

/** 지원 언어 */
export type Locale = "ko" | "en";

/** 성별 */
export type Gender = "male" | "female";

/** 생애 단계 */
export type LifeStage =
  | "청년기" // 20-29
  | "장년초기" // 30-39
  | "장년중기" // 40-49
  | "장년후기" // 50-59
  | "중년기" // 60-69
  | "노년기"; // 70+

/** 월별 시즌 */
export type Season = "봄" | "여름" | "가을" | "겨울";

// ============================================================================
// Temporal Agent (시간 축 에이전트)
// ============================================================================

export interface TemporalAgentInput {
  /** 현재 연도 */
  currentYear: number;
  /** 현재 월 (1-12) */
  currentMonth: number;
  /** 현재 일 (1-31) */
  currentDay: number;
  /** 사용자 연령대 (검색 쿼리용) */
  ageGroup: string;
  /** 성별 */
  gender: Gender;
  /** 로케일 */
  locale: Locale;
  /** 사주 결과 (세운 계산용) */
  sajuResult?: SajuResult;
}

export interface TemporalAgentOutput {
  /** 세운 (올해의 천간지지) */
  yearlyPillar: {
    gan: string;
    zhi: string;
    element: Element;
    description: string;
  };
  /** 월운 */
  monthlyPillar: {
    gan: string;
    zhi: string;
    element: Element;
  };
  /** 현재 시즌 */
  season: Season;
  /** Google Grounding으로 검색한 월별 관심사 */
  seasonalInterests: {
    topics: string[];
    searchQuery: string;
    groundingSources?: Array<{ url: string; title: string }>;
  };
  /** 시간 기반 컨텍스트 메시지 */
  temporalContext: string;
  /** 시기 적절한 조언 포인트 */
  timingAdvice: string[];
}

// ============================================================================
// Age Agent (연령 축 에이전트)
// ============================================================================

export interface AgeAgentInput {
  /** 출생 연도 */
  birthYear: number;
  /** 현재 연도 */
  currentYear: number;
  /** 성별 */
  gender: Gender;
  /** 로케일 */
  locale: Locale;
}

export interface AgeAgentOutput {
  /** 현재 나이 (만 나이) */
  age: number;
  /** 연령대 문자열 (예: "40대 초반") */
  ageGroup: string;
  /** 생애 단계 */
  lifeStage: LifeStage;
  /** 이 연령대의 주요 관심사 */
  lifeStageContext: {
    primaryConcerns: string[];
    typicalGoals: string[];
    commonChallenges: string[];
  };
  /** 연령 기반 컨텍스트 메시지 */
  ageContext: string;
  /** 피해야 할 민감 주제 */
  sensitivities: string[];
}

// ============================================================================
// Chart Agent (사주 축 에이전트)
// ============================================================================

export interface ChartAgentInput {
  /** 사주 분석 결과 */
  sajuResult: SajuResult;
  /** 성별 */
  gender: Gender;
  /** 로케일 */
  locale: Locale;
}

/** 개인화 플래그 */
export interface PersonalizationFlags {
  /** 결혼/연애 조언 피하기 */
  avoidMarriageAdvice: boolean;
  /** 직장 관련 조언 강조 */
  emphasizeCareer: boolean;
  /** 건강 주의 필요 */
  healthCaution: boolean;
  /** 재물운 강조 */
  emphasizeWealth: boolean;
  /** 이동/변화 관련 조언 */
  emphasizeMovement: boolean;
  /** 학업/시험 관련 */
  emphasizeStudy: boolean;
  /** 대인관계 주의 */
  relationshipCaution: boolean;
  /** 리더십/권력 관련 */
  emphasizeLeadership: boolean;
}

/** 건강 주의 영역 */
export interface HealthFlags {
  /** 주의 필요한 장기/시스템 */
  watchAreas: string[];
  /** 권장 건강 관리 */
  recommendations: string[];
  /** 오행 불균형으로 인한 주의점 */
  elementImbalance?: {
    lacking: Element[];
    excess: Element[];
    advice: string;
  };
}

/** 성격/적성 분석 */
export interface PersonalityProfile {
  /** 강점 */
  strengths: string[];
  /** 약점 */
  weaknesses: string[];
  /** 적합한 직업군 */
  suitableCareers: string[];
  /** 대인관계 스타일 */
  relationshipStyle: string;
}

export interface ChartAgentOutput {
  /** 일간 (Day Master) 정보 */
  dayMaster: {
    gan: string;
    element: Element;
    description: string;
  };
  /** 용신 (用神) - 유리한 오행 */
  yongShin?: Element;
  /** 강한 오행 목록 */
  dominantElements: Element[];
  /** 부족한 오행 목록 */
  lackingElements: Element[];
  /** 개인화 플래그 */
  personalizationFlags: PersonalizationFlags;
  /** 건강 플래그 */
  healthFlags: HealthFlags;
  /** 성격/적성 프로필 */
  personalityProfile: PersonalityProfile;
  /** 주요 신살 및 해석 */
  significantStars: Array<{
    star: Star;
    interpretation: string;
    advice: string;
  }>;
  /** 사주 기반 컨텍스트 메시지 */
  chartContext: string;
  /** 주요 십성 분석 */
  dominantTenGods: Array<{
    tenGod: TenGod;
    meaning: string;
    lifeAspect: string;
  }>;
}

// ============================================================================
// Context Orchestrator (통합 오케스트레이터)
// ============================================================================

export interface OrchestratorInput {
  temporal: TemporalAgentOutput;
  age: AgeAgentOutput;
  chart: ChartAgentOutput;
  /** 사용자 질문 (있는 경우) */
  userQuery?: string;
  /** 로케일 */
  locale: Locale;
}

export interface OrchestratorOutput {
  /** 병합된 시스템 프롬프트 */
  systemPromptAddition: string;
  /** 추천 토픽 (우선순위 순) */
  recommendedTopics: string[];
  /** 피해야 할 토픽 */
  avoidTopics: string[];
  /** 강조해야 할 개인화 포인트 */
  personalizationPoints: string[];
  /** 시기별 조언 */
  timingAdvice: string[];
  /** Google Grounding 검색 쿼리 제안 */
  suggestedSearchQueries: string[];
}

// ============================================================================
// 전체 개인화 엔진 타입
// ============================================================================

export interface PersonalizationEngineInput {
  /** 사주 분석 결과 */
  sajuResult: SajuResult;
  /** 출생 연도 */
  birthYear: number;
  /** 성별 */
  gender: Gender;
  /** 로케일 */
  locale: Locale;
  /** 현재 날짜 (선택적, 기본값: 오늘) */
  currentDate?: Date;
  /** 사용자 질문 (있는 경우) */
  userQuery?: string;
}

export interface PersonalizationEngineOutput {
  /** 오케스트레이터 출력 */
  orchestratorResult: OrchestratorOutput;
  /** 각 에이전트의 원본 출력 (디버깅/로깅용) */
  agentOutputs: {
    temporal: TemporalAgentOutput;
    age: AgeAgentOutput;
    chart: ChartAgentOutput;
  };
  /** 처리 메타데이터 */
  metadata: {
    processedAt: string;
    locale: Locale;
    groundingUsed: boolean;
  };
}
