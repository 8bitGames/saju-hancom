/**
 * 오행 (Five Elements) 계산
 * AI 운세 마스터 - Element Scoring
 */

import type {
  Gan,
  Zhi,
  Element,
  ElementScores,
  ElementAnalysis,
  Pillar,
  YongShinMethod,
  DayMasterStrength,
} from "./types";
import {
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  BRANCH_HIDDEN_STEMS,
  ELEMENTS,
  ELEMENT_KOREAN,
  ELEMENT_PRODUCES,
  ELEMENT_CONTROLS,
} from "./constants";

// ============================================================================
// 조후법 (季節法) - Seasonal YongShin Determination
// ============================================================================

/**
 * 월지를 기준으로 계절 판정
 * 寅卯辰 = 봄(wood), 巳午未 = 여름(fire), 申酉戌 = 가을(metal), 亥子丑 = 겨울(water)
 */
const MONTH_TO_SEASON: Record<Zhi, Element> = {
  "寅": "wood",  // 봄
  "卯": "wood",
  "辰": "earth", // 환절기 (봄→여름)
  "巳": "fire",  // 여름
  "午": "fire",
  "未": "earth", // 환절기 (여름→가을)
  "申": "metal", // 가을
  "酉": "metal",
  "戌": "earth", // 환절기 (가을→겨울)
  "亥": "water", // 겨울
  "子": "water",
  "丑": "earth", // 환절기 (겨울→봄)
};

/**
 * 조후법: 계절에 따라 필요한 오행 결정
 * - 여름(火): 뜨거우니 水가 필요 (조후용신: 水)
 * - 겨울(水): 차가우니 火가 필요 (조후용신: 火)
 * - 봄(木): 목이 왕성하니 金으로 조절 (조후용신: 金)
 * - 가을(金): 금이 왕성하니 木으로 조절 (조후용신: 木)
 * - 환절기(土): 土가 왕성하니 木으로 조절 (조후용신: 木)
 */
const JOHU_YONGSHIN: Record<Element, Element> = {
  "fire": "water",   // 여름 → 水 필요
  "water": "fire",   // 겨울 → 火 필요
  "wood": "metal",   // 봄 → 金 필요
  "metal": "wood",   // 가을 → 木 필요
  "earth": "wood",   // 환절기 → 木 필요
};

/**
 * 조후법으로 용신 계산
 * @param monthZhi - 월지
 * @returns 조후 용신
 */
export function calculateJohuYongShin(monthZhi: Zhi): Element {
  const season = MONTH_TO_SEASON[monthZhi];
  return JOHU_YONGSHIN[season];
}

// ============================================================================
// 억부법 (抑扶法) - Strength-based YongShin Determination
// ============================================================================

/**
 * 오행 상생 관계 (어떤 오행이 생해주는지)
 * 水 → 木 → 火 → 土 → 金 → 水
 */
const ELEMENT_PRODUCED_BY: Record<Element, Element> = {
  "wood": "water",  // 수생목
  "fire": "wood",   // 목생화
  "earth": "fire",  // 화생토
  "metal": "earth", // 토생금
  "water": "metal", // 금생수
};

/**
 * 일간 강약 판정
 * @param scores - 오행 점수
 * @param dayMasterElement - 일간 오행
 * @returns 신강/신약/중화 판정
 */
export function calculateDayMasterStrength(
  scores: ElementScores,
  dayMasterElement: Element
): DayMasterStrength {
  // 일간 오행 점수
  const selfScore = scores[dayMasterElement];

  // 일간을 생해주는 오행 (인성) 점수
  const producingElement = ELEMENT_PRODUCED_BY[dayMasterElement];
  const producingScore = scores[producingElement];

  // 강약 판정: 비겁 + 인성 점수 합계
  const supportScore = selfScore + producingScore;

  // 40% 기준으로 강약 판정 (50%가 완벽한 균형)
  if (supportScore >= 45) {
    return "strong";  // 신강 (身强)
  } else if (supportScore <= 35) {
    return "weak";    // 신약 (身弱)
  } else {
    return "neutral"; // 중화 (中和)
  }
}

/**
 * 억부법으로 용신 계산
 * - 신강: 억제 필요 → 식상(설기), 재성(소모), 관성(극)
 * - 신약: 보조 필요 → 비겁(동류), 인성(생조)
 * @param dayMasterElement - 일간 오행
 * @param strength - 일간 강약
 * @returns 억부 용신
 */
export function calculateEokbuYongShin(
  dayMasterElement: Element,
  strength: DayMasterStrength
): Element {
  if (strength === "strong") {
    // 신강: 일간을 극하는 오행(관성)이 용신
    // 관성 = 나를 극하는 오행
    return ELEMENT_CONTROLS[ELEMENT_CONTROLS[dayMasterElement]]; // 나를 극하는 오행의 극을 받는 것 = 나를 극하는 것
  } else if (strength === "weak") {
    // 신약: 일간을 생해주는 오행(인성)이 용신
    return ELEMENT_PRODUCED_BY[dayMasterElement];
  } else {
    // 중화: 가장 부족한 오행 보충 (기본 방식)
    return dayMasterElement; // 자신의 오행 유지
  }
}

// ============================================================================
// 희신/기신/구신/한신 계산
// ============================================================================

/**
 * 용신 기반 희신/기신/구신/한신 계산
 *
 * - 희신(喜神): 용신을 생해주는 오행 (용신 보조)
 * - 기신(忌神): 용신을 극하는 오행 (용신 방해)
 * - 구신(仇神): 기신을 생해주는 오행 (기신 보조 = 간접 방해)
 * - 한신(閑神): 나머지 오행 (중립)
 */
export function calculateDerivedElements(yongShin: Element): {
  huiShin: Element;
  jiShin: Element;
  guShin: Element;
  hanShin: Element;
} {
  // 희신: 용신을 생해주는 오행
  const huiShin = ELEMENT_PRODUCED_BY[yongShin];

  // 기신: 용신을 극하는 오행
  // A를 극하는 오행 = ELEMENT_CONTROLS 에서 A가 value인 key
  const jiShin = Object.entries(ELEMENT_CONTROLS).find(
    ([_, controlled]) => controlled === yongShin
  )?.[0] as Element;

  // 구신: 기신을 생해주는 오행
  const guShin = ELEMENT_PRODUCED_BY[jiShin];

  // 한신: 나머지 오행 (용신, 희신, 기신, 구신 제외)
  const usedElements = new Set([yongShin, huiShin, jiShin, guShin]);
  const hanShin = ELEMENTS.find(e => !usedElements.has(e)) as Element;

  return { huiShin, jiShin, guShin, hanShin };
}

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

  // 0-100 스케일로 정규화 (합계가 정확히 100이 되도록)
  const normalizedScores: ElementScores = {
    wood: Math.round((rawScores.wood / total) * 100),
    fire: Math.round((rawScores.fire / total) * 100),
    earth: Math.round((rawScores.earth / total) * 100),
    metal: Math.round((rawScores.metal / total) * 100),
    water: Math.round((rawScores.water / total) * 100),
  };

  // 반올림으로 인한 합계 오차 조정 (가장 큰 값에서 조정)
  const normalizedTotal = Object.values(normalizedScores).reduce((sum, score) => sum + score, 0);
  if (normalizedTotal !== 100) {
    const diff = normalizedTotal - 100;
    // 가장 높은 점수를 가진 오행에서 차이 조정
    const maxElement = (Object.entries(normalizedScores) as [Element, number][])
      .sort((a, b) => b[1] - a[1])[0][0];
    normalizedScores[maxElement] -= diff;
  }

  return normalizedScores;
}

/**
 * 오행 분석 수행 (기본 버전 - 월지 없이 분석)
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

  // 억부법으로 용신 계산
  const dayMasterStrength = calculateDayMasterStrength(scores, dayMasterElement);
  const yongShin = calculateEokbuYongShin(dayMasterElement, dayMasterStrength);

  // 희신/기신/구신/한신 계산
  const { huiShin, jiShin, guShin, hanShin } = calculateDerivedElements(yongShin);

  return {
    scores,
    dominant,
    lacking,
    balance,
    yongShin,
    huiShin,
    jiShin,
    guShin,
    hanShin,
    yongShinMethod: "eokbu",
    dayMasterStrength,
  };
}

/**
 * 오행 분석 수행 (조후법 + 억부법 통합)
 *
 * @param scores - 오행 점수
 * @param dayMasterElement - 일간의 오행 (본인)
 * @param monthZhi - 월지 (계절 판정용)
 * @returns 오행 분석 결과
 */
export function analyzeElementsAdvanced(
  scores: ElementScores,
  dayMasterElement: Element,
  monthZhi: Zhi
): ElementAnalysis {
  // 기본 분석
  const average = 20;
  const dominantThreshold = average * 1.5;
  const dominant = ELEMENTS.filter((e) => scores[e] >= dominantThreshold);
  const lackingThreshold = average * 0.5;
  const lacking = ELEMENTS.filter((e) => scores[e] <= lackingThreshold);
  const maxScore = Math.max(...Object.values(scores));
  const minScore = Math.min(...Object.values(scores));
  const balance: "balanced" | "unbalanced" =
    maxScore - minScore <= 25 ? "balanced" : "unbalanced";

  // 일간 강약 판정
  const dayMasterStrength = calculateDayMasterStrength(scores, dayMasterElement);

  // 조후법 용신
  const johuYongShin = calculateJohuYongShin(monthZhi);

  // 억부법 용신
  const eokbuYongShin = calculateEokbuYongShin(dayMasterElement, dayMasterStrength);

  // 용신 결정: 조후법 우선, 단 억부법과 충돌 시 조정
  // 일반적으로 조후법이 우선되지만, 극단적 신강/신약 시 억부법 우선
  let yongShin: Element;
  let yongShinMethod: YongShinMethod;

  if (dayMasterStrength === "neutral") {
    // 중화 상태: 조후법 우선
    yongShin = johuYongShin;
    yongShinMethod = "johu";
  } else {
    // 신강/신약: 억부법 우선
    yongShin = eokbuYongShin;
    yongShinMethod = "eokbu";
  }

  // 희신/기신/구신/한신 계산
  const { huiShin, jiShin, guShin, hanShin } = calculateDerivedElements(yongShin);

  return {
    scores,
    dominant,
    lacking,
    balance,
    yongShin,
    huiShin,
    jiShin,
    guShin,
    hanShin,
    yongShinMethod,
    dayMasterStrength,
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

  // 일간 강약 표시
  if (analysis.dayMasterStrength) {
    const strengthLabel = {
      strong: "신강(身强) - 일간이 강함",
      weak: "신약(身弱) - 일간이 약함",
      neutral: "중화(中和) - 균형 상태",
    }[analysis.dayMasterStrength];
    lines.push(`일간 강약: ${strengthLabel}`);
  }

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

  // 용신/희신/기신/구신/한신 표시
  if (analysis.yongShin) {
    const methodLabel = analysis.yongShinMethod === "johu" ? "조후법" :
                        analysis.yongShinMethod === "eokbu" ? "억부법" : "기본";
    lines.push(`용신(用神): ${ELEMENT_KOREAN[analysis.yongShin]} (${methodLabel})`);
  }

  if (analysis.huiShin) {
    lines.push(`희신(喜神): ${ELEMENT_KOREAN[analysis.huiShin]} - 용신을 돕는 오행`);
  }

  if (analysis.jiShin) {
    lines.push(`기신(忌神): ${ELEMENT_KOREAN[analysis.jiShin]} - 용신을 방해하는 오행`);
  }

  if (analysis.guShin) {
    lines.push(`구신(仇神): ${ELEMENT_KOREAN[analysis.guShin]} - 기신을 돕는 오행`);
  }

  if (analysis.hanShin) {
    lines.push(`한신(閑神): ${ELEMENT_KOREAN[analysis.hanShin]} - 중립 오행`);
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
