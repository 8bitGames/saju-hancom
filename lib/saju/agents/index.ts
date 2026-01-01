/**
 * Multi-Agent 초개인화 사주 시스템
 * 진입점 및 통합 엔진
 * 🆕 카테고리별 필터링 지원
 * 🆕 v1.3: 기본 분석 vs 종합 분석 분리
 */

export * from "./types";
export { runTemporalAgent } from "./temporal-agent";
export { runAgeAgent } from "./age-agent";
export { runChartAgent } from "./chart-agent";
export { runOrchestrator } from "./orchestrator";

// 🆕 기본 분석 컨텍스트 함수 내보내기
export {
  generateDayMasterBasicContext,
  generateTenGodsBasicContext,
  generateStarsBasicContext,
  generateFortuneBasicContext,
  generateBasicAnalysisContext,
  getAnalysisTypeDescription,
  type BasicAnalysisContext,
} from "./basic-analysis-context";

import { runTemporalAgent } from "./temporal-agent";
import { runAgeAgent } from "./age-agent";
import { runChartAgent } from "./chart-agent";
import { runOrchestrator } from "./orchestrator";
import { generateBasicAnalysisContext } from "./basic-analysis-context";
import { isBasicCategory } from "../basic-analysis-data";
import type {
  PersonalizationEngineInput,
  PersonalizationEngineOutput,
  Locale,
  Gender,
  DetailCategory
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
    userQuery,
    category  // 🆕 카테고리별 필터링용
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

  // Orchestrator로 결과 통합 (🆕 카테고리 전달)
  const orchestratorResult = await runOrchestrator({
    temporal: temporalResult,
    age: ageResult,
    chart: chartResult,
    userQuery,
    locale: locale as Locale,
    category  // 🆕 카테고리별 콘텐츠 필터링
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
 *
 * 🆕 v1.2: category 파라미터 추가 - 카테고리별로 다른 콘텐츠 생성
 * 🆕 v1.3: 기본 분석 vs 종합 분석 분리
 *   - 기본 분석(dayMaster, tenGods, stars, fortune): 교육적 설명 컨텍스트
 *   - 종합 분석(personality, career, wealth, relationship, health): 개인화된 해석 컨텍스트
 */
export async function getPersonalizedContext(
  sajuResult: PersonalizationEngineInput["sajuResult"],
  birthYear: number,
  gender: Gender,
  locale: Locale = "ko",
  userQuery?: string,
  category?: DetailCategory  // 🆕 카테고리별 필터링
): Promise<string> {
  // 🆕 기본 분석 카테고리인 경우 교육적 컨텍스트 생성
  if (category && isBasicCategory(category)) {
    const basicContext = generateBasicAnalysisContext(
      category,
      sajuResult,
      locale,
      birthYear
    );
    if (basicContext) {
      return basicContext.promptContext;
    }
  }

  // 종합 분석 카테고리 또는 카테고리 미지정 시 기존 개인화 엔진 사용
  const result = await runPersonalizationEngine({
    sajuResult,
    birthYear,
    gender,
    locale,
    userQuery,
    category  // 🆕 카테고리 전달 (종합 분석용 필터링)
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
