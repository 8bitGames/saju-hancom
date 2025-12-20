/**
 * 오행 (Five Elements) 계산
 * AI 운세 마스터 - Element Scoring
 */

import type { Gan, Element, ElementScores, ElementAnalysis, Pillar } from "./types";
import {
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  BRANCH_HIDDEN_STEMS,
  ELEMENTS,
  ELEMENT_KOREAN,
} from "./constants";

/**
 * 천간의 오행 점수 가중치
 * 천간은 오행의 순수한 표현
 */
const STEM_WEIGHT = 10;

/**
 * 지지 정기의 오행 점수 가중치
 * 지지의 주된 오행
 */
const BRANCH_MAIN_WEIGHT = 10;

/**
 * 지지 장간의 오행 점수 가중치
 * 숨겨진 천간들의 영향력 (첫 번째가 가장 강함)
 */
const HIDDEN_STEM_WEIGHTS = [6, 4, 2];

/**
 * 사주 팔자에서 오행 점수 계산
 *
 * @param pillars - 네 개의 주 (년월일시)
 * @returns 오행별 점수 (각 0-100 스케일로 정규화)
 */
export function calculateElementScores(pillars: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  time: Pillar;
}): ElementScores {
  // 초기 점수
  const rawScores: ElementScores = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 각 주에서 오행 점수 계산
  const pillarArray = [pillars.year, pillars.month, pillars.day, pillars.time];

  for (const pillar of pillarArray) {
    // 1. 천간 오행 점수
    rawScores[pillar.ganElement] += STEM_WEIGHT;

    // 2. 지지 정기 오행 점수
    rawScores[pillar.zhiElement] += BRANCH_MAIN_WEIGHT;

    // 3. 지지 장간 오행 점수
    pillar.zhiHiddenGan.forEach((hiddenGan, index) => {
      const element = STEM_ELEMENTS[hiddenGan];
      const weight = HIDDEN_STEM_WEIGHTS[index] ?? 1;
      rawScores[element] += weight;
    });
  }

  // 전체 합계 계산
  const total = Object.values(rawScores).reduce((sum, score) => sum + score, 0);

  // 0-100 스케일로 정규화
  const normalizedScores: ElementScores = {
    wood: Math.round((rawScores.wood / total) * 100),
    fire: Math.round((rawScores.fire / total) * 100),
    earth: Math.round((rawScores.earth / total) * 100),
    metal: Math.round((rawScores.metal / total) * 100),
    water: Math.round((rawScores.water / total) * 100),
  };

  return normalizedScores;
}

/**
 * 오행 분석 수행
 *
 * @param scores - 오행 점수
 * @param dayMasterElement - 일간의 오행 (본인)
 * @returns 오행 분석 결과
 */
export function analyzeElements(
  scores: ElementScores,
  dayMasterElement: Element
): ElementAnalysis {
  // 평균 점수 (균등 분포면 각 20)
  const average = 20;

  // 강한 오행 (평균보다 50% 이상 높음)
  const dominantThreshold = average * 1.5; // 30
  const dominant = ELEMENTS.filter((e) => scores[e] >= dominantThreshold);

  // 약한 오행 (평균의 절반 이하)
  const lackingThreshold = average * 0.5; // 10
  const lacking = ELEMENTS.filter((e) => scores[e] <= lackingThreshold);

  // 균형 판정 (가장 높은 점수와 가장 낮은 점수의 차이)
  const maxScore = Math.max(...Object.values(scores));
  const minScore = Math.min(...Object.values(scores));
  const balance: "balanced" | "unbalanced" =
    maxScore - minScore <= 25 ? "balanced" : "unbalanced";

  // 용신 계산 (간단한 버전: 가장 부족한 오행)
  // 실제로는 더 복잡한 로직이 필요하지만 MVP에서는 단순화
  const sortedByScore = [...ELEMENTS].sort((a, b) => scores[a] - scores[b]);
  const yongShin = sortedByScore[0];

  return {
    scores,
    dominant,
    lacking,
    balance,
    yongShin,
  };
}

/**
 * 오행 점수를 한글 설명으로 변환
 *
 * @param scores - 오행 점수
 * @returns 한글 설명 문자열
 */
export function formatElementScores(scores: ElementScores): string {
  return ELEMENTS.map((e) => `${ELEMENT_KOREAN[e]}: ${scores[e]}%`).join(", ");
}

/**
 * 오행 분석 결과를 한글 설명으로 변환
 *
 * @param analysis - 오행 분석 결과
 * @returns 한글 설명 문자열
 */
export function formatElementAnalysis(analysis: ElementAnalysis): string {
  const lines: string[] = [];

  if (analysis.dominant.length > 0) {
    const dominantKorean = analysis.dominant
      .map((e) => ELEMENT_KOREAN[e])
      .join(", ");
    lines.push(`강한 오행: ${dominantKorean}`);
  }

  if (analysis.lacking.length > 0) {
    const lackingKorean = analysis.lacking
      .map((e) => ELEMENT_KOREAN[e])
      .join(", ");
    lines.push(`부족한 오행: ${lackingKorean}`);
  }

  lines.push(`오행 균형: ${analysis.balance === "balanced" ? "균형" : "불균형"}`);

  if (analysis.yongShin) {
    lines.push(`용신(필요한 오행): ${ELEMENT_KOREAN[analysis.yongShin]}`);
  }

  return lines.join("\n");
}

/**
 * 천간에서 오행 가져오기
 */
export function getElementFromStem(gan: Gan): Element {
  return STEM_ELEMENTS[gan];
}

/**
 * 지지에서 정기 오행 가져오기
 */
export function getElementFromBranch(zhi: string): Element {
  return BRANCH_ELEMENTS[zhi as keyof typeof BRANCH_ELEMENTS];
}

/**
 * 지지에서 장간(숨은 천간들) 가져오기
 */
export function getHiddenStemsFromBranch(zhi: string): Gan[] {
  return BRANCH_HIDDEN_STEMS[zhi as keyof typeof BRANCH_HIDDEN_STEMS] ?? [];
}
