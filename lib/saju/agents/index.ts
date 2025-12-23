/**
 * Multi-Agent 초개인화 사주 시스템
 * 진입점 및 통합 엔진
 */

export * from "./types";
export { runTemporalAgent } from "./temporal-agent";
export { runAgeAgent } from "./age-agent";
export { runChartAgent } from "./chart-agent";
export { runOrchestrator } from "./orchestrator";

import { runTemporalAgent } from "./temporal-agent";
import { runAgeAgent } from "./age-agent";
import { runChartAgent } from "./chart-agent";
import { runOrchestrator } from "./orchestrator";
import type {
  PersonalizationEngineInput,
  PersonalizationEngineOutput,
  Locale,
  Gender
} from "./types";

/**
 * 연령대 문자열 생성 (검색 쿼리용)
 */
function getAgeGroupForSearch(birthYear: number, currentYear: number): string {
  const age = currentYear - birthYear;
  const decade = Math.floor(age / 10) * 10;
  return `${decade}대`;
}

/**
 * 초개인화 엔진 메인 함수
 *
 * 세 개의 에이전트(Temporal, Age, Chart)를 병렬로 실행하고
 * Orchestrator로 결과를 통합합니다.
 */
export async function runPersonalizationEngine(
  input: PersonalizationEngineInput
): Promise<PersonalizationEngineOutput> {
  const {
    sajuResult,
    birthYear,
    gender,
    locale,
    currentDate = new Date(),
    userQuery
  } = input;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  // 세 에이전트를 병렬로 실행
  const [temporalResult, ageResult, chartResult] = await Promise.all([
    runTemporalAgent({
      currentYear,
      currentMonth,
      currentDay,
      ageGroup: getAgeGroupForSearch(birthYear, currentYear),
      gender: gender as Gender,
      locale: locale as Locale,
      sajuResult
    }),
    runAgeAgent({
      birthYear,
      currentYear,
      gender: gender as Gender,
      locale: locale as Locale
    }),
    runChartAgent({
      sajuResult,
      gender: gender as Gender,
      locale: locale as Locale
    })
  ]);

  // Orchestrator로 결과 통합
  const orchestratorResult = await runOrchestrator({
    temporal: temporalResult,
    age: ageResult,
    chart: chartResult,
    userQuery,
    locale: locale as Locale
  });

  return {
    orchestratorResult,
    agentOutputs: {
      temporal: temporalResult,
      age: ageResult,
      chart: chartResult
    },
    metadata: {
      processedAt: new Date().toISOString(),
      locale: locale as Locale,
      groundingUsed: temporalResult.seasonalInterests.searchQuery !== ""
    }
  };
}

/**
 * 간단한 개인화 컨텍스트 생성 (API에서 직접 사용)
 *
 * 기존 API에서 쉽게 통합할 수 있도록
 * 시스템 프롬프트에 추가할 문자열만 반환
 */
export async function getPersonalizedContext(
  sajuResult: PersonalizationEngineInput["sajuResult"],
  birthYear: number,
  gender: Gender,
  locale: Locale = "ko",
  userQuery?: string
): Promise<string> {
  const result = await runPersonalizationEngine({
    sajuResult,
    birthYear,
    gender,
    locale,
    userQuery
  });

  return result.orchestratorResult.systemPromptAddition;
}

/**
 * 개인화 검색 쿼리 생성
 *
 * Google Grounding에서 사용할 검색 쿼리 목록 반환
 */
export async function getPersonalizedSearchQueries(
  sajuResult: PersonalizationEngineInput["sajuResult"],
  birthYear: number,
  gender: Gender,
  locale: Locale = "ko",
  userQuery?: string
): Promise<string[]> {
  const result = await runPersonalizationEngine({
    sajuResult,
    birthYear,
    gender,
    locale,
    userQuery
  });

  return result.orchestratorResult.suggestedSearchQueries;
}

export default runPersonalizationEngine;
