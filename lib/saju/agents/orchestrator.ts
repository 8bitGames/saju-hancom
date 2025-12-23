/**
 * Context Orchestrator (통합 오케스트레이터)
 *
 * 역할: 세 에이전트(Temporal, Age, Chart)의 출력을 통합하여
 * 최종 개인화 컨텍스트 생성
 *
 * - 시스템 프롬프트 추가 문구 생성
 * - 추천/피해야 할 토픽 결정
 * - 개인화 포인트 우선순위 정리
 * - Google Grounding 검색 쿼리 제안
 */

import type {
  OrchestratorInput,
  OrchestratorOutput,
  TemporalAgentOutput,
  AgeAgentOutput,
  ChartAgentOutput
} from "./types";

/**
 * 추천 토픽 결정
 * - 시간적 맥락 + 연령 관심사 + 사주 강조점 결합
 */
function determineRecommendedTopics(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const topics: string[] = [];

  // 1. 시즌별 관심사 (Google Grounding 결과)
  topics.push(...temporal.seasonalInterests.topics.slice(0, 3));

  // 2. 연령대 주요 관심사
  topics.push(...age.lifeStageContext.primaryConcerns.slice(0, 2));

  // 3. 사주 기반 강조 토픽
  const flags = chart.personalizationFlags;

  if (locale === "ko") {
    if (flags.emphasizeCareer) topics.push("직업운", "사업운");
    if (flags.emphasizeWealth) topics.push("재물운", "투자");
    if (flags.emphasizeMovement) topics.push("이직", "이사", "여행");
    if (flags.emphasizeStudy) topics.push("학업운", "자격증", "자기계발");
    if (flags.emphasizeLeadership) topics.push("리더십", "승진");
    if (flags.healthCaution) topics.push("건강운", "건강관리");
  } else {
    if (flags.emphasizeCareer) topics.push("career fortune", "business");
    if (flags.emphasizeWealth) topics.push("wealth fortune", "investment");
    if (flags.emphasizeMovement) topics.push("job change", "moving", "travel");
    if (flags.emphasizeStudy) topics.push("study fortune", "certifications", "self-improvement");
    if (flags.emphasizeLeadership) topics.push("leadership", "promotion");
    if (flags.healthCaution) topics.push("health fortune", "wellness");
  }

  // 중복 제거
  return Array.from(new Set(topics));
}

/**
 * 피해야 할 토픽 결정
 */
function determineAvoidTopics(
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const avoidTopics: string[] = [];

  // 연령대 민감 주제
  avoidTopics.push(...age.sensitivities);

  // 사주 기반 피해야 할 토픽
  const flags = chart.personalizationFlags;

  if (locale === "ko") {
    if (flags.avoidMarriageAdvice) {
      avoidTopics.push("결혼 압박", "출산 권유", "연애 조언");
    }
    if (flags.relationshipCaution) {
      avoidTopics.push("대인관계 과도한 낙관", "새로운 만남 권유");
    }
  } else {
    if (flags.avoidMarriageAdvice) {
      avoidTopics.push("marriage pressure", "childbirth advice", "dating advice");
    }
    if (flags.relationshipCaution) {
      avoidTopics.push("over-optimistic relationship outlook", "encouraging new meetings");
    }
  }

  return Array.from(new Set(avoidTopics));
}

/**
 * 개인화 포인트 생성
 */
function generatePersonalizationPoints(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  locale: "ko" | "en"
): string[] {
  const points: string[] = [];

  if (locale === "ko") {
    // 시간 기반
    points.push(`현재 ${temporal.season}철, ${temporal.yearlyPillar.description}`);
    points.push(...temporal.timingAdvice.slice(0, 2));

    // 연령 기반
    points.push(`${age.ageGroup} (${age.lifeStage})`);
    points.push(age.ageContext);

    // 사주 기반
    points.push(chart.chartContext);

    // 건강 관련
    if (chart.healthFlags.watchAreas.length > 0) {
      points.push(`건강 주의: ${chart.healthFlags.watchAreas.join(", ")}`);
    }

    // 주요 신살
    if (chart.significantStars.length > 0) {
      const starNames = chart.significantStars.map(s => s.star.name).slice(0, 3);
      points.push(`주요 신살: ${starNames.join(", ")}`);
    }
  } else {
    // Time-based
    points.push(`Currently ${temporal.season}, ${temporal.yearlyPillar.description}`);
    points.push(...temporal.timingAdvice.slice(0, 2));

    // Age-based
    points.push(`${age.ageGroup} (${age.lifeStage})`);
    points.push(age.ageContext);

    // Chart-based
    points.push(chart.chartContext);

    // Health
    if (chart.healthFlags.watchAreas.length > 0) {
      points.push(`Health watch: ${chart.healthFlags.watchAreas.join(", ")}`);
    }

    // Stars
    if (chart.significantStars.length > 0) {
      const starNames = chart.significantStars.map(s => s.star.name).slice(0, 3);
      points.push(`Key stars: ${starNames.join(", ")}`);
    }
  }

  return points;
}

/**
 * 시스템 프롬프트 추가 문구 생성
 */
function generateSystemPromptAddition(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  recommendedTopics: string[],
  avoidTopics: string[],
  locale: "ko" | "en"
): string {
  if (locale === "ko") {
    return `
## 초개인화 컨텍스트

### 현재 시점
${temporal.temporalContext}

### 이 분의 프로필
${age.ageContext}

${chart.chartContext}

### 이번 상담에서 다룰 주제
- 추천: ${recommendedTopics.slice(0, 5).join(", ")}
- 피해야 할 것: ${avoidTopics.slice(0, 3).join(", ")}

### 건강 관련 조언
${chart.healthFlags.recommendations.slice(0, 2).join("\n")}

### 시기별 조언
${temporal.timingAdvice.join("\n")}

### 중요 지침
- 현재가 ${temporal.yearlyPillar.description}의 해임을 기억하세요
- ${age.ageGroup}의 관심사와 고민을 고려하세요
- 다음 주제는 피하세요: ${avoidTopics.slice(0, 3).join(", ")}
- 마치 40년 경력의 역술가처럼 이 분의 상황을 꿰뚫어 보는 듯이 조언하세요
`;
  } else {
    return `
## Hyper-Personalization Context

### Current Moment
${temporal.temporalContext}

### This Person's Profile
${age.ageContext}

${chart.chartContext}

### Topics for This Session
- Recommended: ${recommendedTopics.slice(0, 5).join(", ")}
- Avoid: ${avoidTopics.slice(0, 3).join(", ")}

### Health Advice
${chart.healthFlags.recommendations.slice(0, 2).join("\n")}

### Timely Advice
${temporal.timingAdvice.join("\n")}

### Important Guidelines
- Remember this is the year of ${temporal.yearlyPillar.description}
- Consider the interests and concerns of ${age.ageGroup}
- Avoid these topics: ${avoidTopics.slice(0, 3).join(", ")}
- Provide advice as if you are a fortune teller with 40 years of experience who understands their situation deeply
`;
  }
}

/**
 * Google Grounding 검색 쿼리 제안
 */
function suggestSearchQueries(
  temporal: TemporalAgentOutput,
  age: AgeAgentOutput,
  chart: ChartAgentOutput,
  userQuery: string | undefined,
  locale: "ko" | "en"
): string[] {
  const queries: string[] = [];

  if (locale === "ko") {
    // 기본 쿼리
    queries.push(`${age.ageGroup} ${temporal.yearlyPillar.description} 운세`);

    // 관심사 기반 쿼리
    if (chart.personalizationFlags.emphasizeCareer) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()}년 직업운 이직`);
    }
    if (chart.personalizationFlags.emphasizeWealth) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()}년 재테크 투자 트렌드`);
    }
    if (chart.healthFlags.watchAreas.length > 0) {
      queries.push(`${age.ageGroup} ${chart.healthFlags.watchAreas[0]} 건강관리`);
    }

    // 사용자 쿼리 기반
    if (userQuery) {
      queries.push(`${age.ageGroup} ${userQuery} ${new Date().getFullYear()}년`);
    }
  } else {
    queries.push(`${age.ageGroup} ${temporal.yearlyPillar.description} fortune`);

    if (chart.personalizationFlags.emphasizeCareer) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()} career trends`);
    }
    if (chart.personalizationFlags.emphasizeWealth) {
      queries.push(`${age.ageGroup} ${new Date().getFullYear()} investment trends`);
    }
    if (chart.healthFlags.watchAreas.length > 0) {
      queries.push(`${age.ageGroup} ${chart.healthFlags.watchAreas[0]} health tips`);
    }

    if (userQuery) {
      queries.push(`${age.ageGroup} ${userQuery} ${new Date().getFullYear()}`);
    }
  }

  return Array.from(new Set(queries));
}

/**
 * Context Orchestrator 메인 함수
 */
export async function runOrchestrator(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const { temporal, age, chart, userQuery, locale } = input;

  // 추천 토픽
  const recommendedTopics = determineRecommendedTopics(temporal, age, chart, locale);

  // 피해야 할 토픽
  const avoidTopics = determineAvoidTopics(age, chart, locale);

  // 개인화 포인트
  const personalizationPoints = generatePersonalizationPoints(temporal, age, chart, locale);

  // 시기별 조언
  const timingAdvice = temporal.timingAdvice;

  // 시스템 프롬프트 추가 문구
  const systemPromptAddition = generateSystemPromptAddition(
    temporal,
    age,
    chart,
    recommendedTopics,
    avoidTopics,
    locale
  );

  // 검색 쿼리 제안
  const suggestedSearchQueries = suggestSearchQueries(temporal, age, chart, userQuery, locale);

  return {
    systemPromptAddition,
    recommendedTopics,
    avoidTopics,
    personalizationPoints,
    timingAdvice,
    suggestedSearchQueries
  };
}

export default runOrchestrator;
