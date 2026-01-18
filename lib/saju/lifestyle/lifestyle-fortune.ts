/**
 * 행운 라이프스타일 계산 모듈
 * 용신(用神) 기반 일일 라이프스타일 운세 계산
 */

import type { Element } from "../types";
import type { SajuPipelineResult } from "../pipeline-types";
import { calculateDailyPillar } from "../fortune/daily-fortune";
import {
  ELEMENT_COLORS,
  ELEMENT_FOODS,
  ELEMENT_DIRECTIONS,
  ELEMENT_NUMBERS,
  ELEMENT_ACTIVITIES,
  ELEMENT_AVOID_ACTIVITIES,
  ELEMENT_GENERATED_BY,
  ELEMENT_CONTROLLED_BY,
  ELEMENT_KOREAN_SHORT,
  type LuckyColor,
  type LuckyFood,
  type LuckyDirection,
} from "./lifestyle-mappings";

// ============================================================================
// 타입 정의
// ============================================================================

export interface LifestyleFortune {
  /** 날짜 (YYYY-MM-DD) */
  date: string;

  /** 행운의 색상 */
  luckyColor: LuckyColor & { reason: string };

  /** 행운의 음식 */
  luckyFood: LuckyFood & { reason: string };

  /** 행운의 숫자 (4개) */
  luckyNumbers: number[];

  /** 행운의 방향 */
  luckyDirection: LuckyDirection & { reason: string };

  /** 추천 활동 (3개) */
  luckyActivities: string[];

  /** 피해야 할 활동 (2개) */
  avoidActivities: string[];

  /** 사용자의 용신 오행 */
  usefulGodElement: Element;

  /** 오늘의 일진 오행 */
  dailyElement: Element;

  /** 오늘과 용신의 관계 */
  dailyUsefulGodRelation: "harmonious" | "neutral" | "conflicting";

  /** 오행 상호작용 설명 */
  elementInteraction: string;
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 날짜 기반 시드로 일관된 랜덤 선택
 * 같은 날짜에는 같은 결과가 나오도록 보장
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 배열에서 시드 기반 랜덤 선택
 */
function selectFromArray<T>(arr: T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * arr.length);
  return arr[index];
}

/**
 * 날짜에서 시드 생성
 */
function getDateSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

// ============================================================================
// 오행 관계 분석
// ============================================================================

/**
 * 두 오행의 관계 분석
 * @returns "harmonious" | "neutral" | "conflicting"
 */
function analyzeElementRelation(
  element1: Element,
  element2: Element
): "harmonious" | "neutral" | "conflicting" {
  // 같은 오행이면 조화
  if (element1 === element2) {
    return "harmonious";
  }

  // element1이 element2를 생하면 조화
  if (ELEMENT_GENERATED_BY[element2] === element1) {
    return "harmonious";
  }

  // element2가 element1을 생하면 (내가 생을 받음) 조화
  if (ELEMENT_GENERATED_BY[element1] === element2) {
    return "harmonious";
  }

  // element1이 element2를 극하면 (나를 극함) 갈등
  if (ELEMENT_CONTROLLED_BY[element2] === element1) {
    return "conflicting";
  }

  // element2가 element1을 극하면 갈등
  if (ELEMENT_CONTROLLED_BY[element1] === element2) {
    return "conflicting";
  }

  return "neutral";
}

/**
 * 오행 상호작용 설명 생성
 */
function getElementInteractionDescription(
  dailyElement: Element,
  usefulGodElement: Element,
  relation: "harmonious" | "neutral" | "conflicting"
): string {
  const dailyKorean = ELEMENT_KOREAN_SHORT[dailyElement];
  const usefulGodKorean = ELEMENT_KOREAN_SHORT[usefulGodElement];

  if (relation === "harmonious") {
    if (dailyElement === usefulGodElement) {
      return `오늘의 ${dailyKorean} 기운이 당신의 용신 ${usefulGodKorean}과(와) 일치하여 매우 좋은 날입니다.`;
    }
    if (ELEMENT_GENERATED_BY[usefulGodElement] === dailyElement) {
      return `오늘의 ${dailyKorean} 기운이 당신의 용신 ${usefulGodKorean}을(를) 생(生)하여 용신의 힘이 강해지는 날입니다.`;
    }
    return `오늘의 ${dailyKorean} 기운이 당신의 용신 ${usefulGodKorean}과(와) 조화를 이루는 날입니다.`;
  }

  if (relation === "conflicting") {
    if (ELEMENT_CONTROLLED_BY[usefulGodElement] === dailyElement) {
      return `오늘의 ${dailyKorean} 기운이 당신의 용신 ${usefulGodKorean}을(를) 극(剋)하여 주의가 필요한 날입니다. ${usefulGodKorean}의 기운을 보충하세요.`;
    }
    return `오늘의 ${dailyKorean} 기운이 당신의 용신 ${usefulGodKorean}과(와) 상충하는 날입니다. 신중하게 행동하세요.`;
  }

  return `오늘의 ${dailyKorean} 기운이 당신의 용신 ${usefulGodKorean}과(와) 중립적 관계입니다. 평범한 하루가 될 것입니다.`;
}

// ============================================================================
// 행운 요소 계산
// ============================================================================

/**
 * 행운의 숫자 생성
 */
function generateLuckyNumbers(
  usefulGodElement: Element,
  date: Date
): number[] {
  const baseNumbers = ELEMENT_NUMBERS[usefulGodElement].primary;
  const seed = getDateSeed(date);

  // 기본 숫자 (용신 오행의 숫자)
  const primaryNumbers = [...baseNumbers];

  // 변형 숫자 생성 (10-99 범위)
  const derived1 = baseNumbers[0] * 10 + Math.floor(seededRandom(seed) * 10);
  const derived2 = baseNumbers[1] * 10 + Math.floor(seededRandom(seed + 1) * 10);

  return [...primaryNumbers, derived1, derived2];
}

/**
 * 보완해야 할 오행 결정
 * - 기본: 용신 오행
 * - 갈등 시: 용신을 생(生)하는 오행
 */
function determineTargetElement(
  usefulGodElement: Element,
  dailyElement: Element,
  relation: "harmonious" | "neutral" | "conflicting"
): Element {
  if (relation === "conflicting") {
    // 용신을 생하는 오행을 대신 추천
    return ELEMENT_GENERATED_BY[usefulGodElement];
  }
  return usefulGodElement;
}

// ============================================================================
// 메인 함수
// ============================================================================

/**
 * 라이프스타일 운세 계산
 *
 * @param sajuResult - 사주 분석 파이프라인 결과
 * @param targetDate - 조회할 날짜 (기본: 오늘)
 * @returns 라이프스타일 운세
 */
export function calculateLifestyleFortune(
  sajuResult: SajuPipelineResult,
  targetDate: Date = new Date()
): LifestyleFortune {
  // 1. 용신 추출
  const usefulGodElement = (sajuResult.step2?.usefulGod?.primaryElement ||
    "wood") as Element;

  // 2. 일진 계산
  const dailyPillar = calculateDailyPillar(targetDate);
  const dailyElement = dailyPillar.element;

  // 3. 일진과 용신의 관계 분석
  const relation = analyzeElementRelation(dailyElement, usefulGodElement);
  const elementInteraction = getElementInteractionDescription(
    dailyElement,
    usefulGodElement,
    relation
  );

  // 4. 보완할 오행 결정
  const targetElement = determineTargetElement(
    usefulGodElement,
    dailyElement,
    relation
  );

  // 5. 날짜 시드 생성
  const seed = getDateSeed(targetDate);
  const dateStr = targetDate.toISOString().split("T")[0];

  // 6. 행운 요소 선택
  const luckyColor = selectFromArray(ELEMENT_COLORS[targetElement], seed);
  const luckyFood = selectFromArray(ELEMENT_FOODS[targetElement], seed + 100);
  const luckyDirection = ELEMENT_DIRECTIONS[targetElement];
  const luckyNumbers = generateLuckyNumbers(usefulGodElement, targetDate);

  // 7. 활동 선택 (3개 추천, 2개 피하기)
  const allActivities = ELEMENT_ACTIVITIES[targetElement];
  const luckyActivities = [
    selectFromArray(allActivities.slice(0, 4), seed + 200),
    selectFromArray(allActivities.slice(4, 7), seed + 201),
    selectFromArray(allActivities.slice(7), seed + 202),
  ];

  // 피해야 할 활동 (용신을 극하는 오행)
  const avoidElement = ELEMENT_CONTROLLED_BY[usefulGodElement];
  const avoidActivities = ELEMENT_AVOID_ACTIVITIES[avoidElement].slice(0, 2);

  // 8. 이유 생성
  const colorReason =
    relation === "conflicting"
      ? `오늘의 기운(${ELEMENT_KOREAN_SHORT[dailyElement]})이 용신(${ELEMENT_KOREAN_SHORT[usefulGodElement]})과 상충하므로, ${ELEMENT_KOREAN_SHORT[targetElement]}의 기운으로 조화를 이루세요.`
      : `당신의 용신 ${ELEMENT_KOREAN_SHORT[usefulGodElement]}의 기운을 강화하는 색상입니다.`;

  const foodReason = `${luckyFood.benefit}에 좋으며, ${ELEMENT_KOREAN_SHORT[targetElement]} 기운을 보충합니다.`;

  const directionReason = `${ELEMENT_KOREAN_SHORT[targetElement]}의 방위로, ${luckyDirection.meaning}`;

  return {
    date: dateStr,
    luckyColor: { ...luckyColor, reason: colorReason },
    luckyFood: { ...luckyFood, reason: foodReason },
    luckyNumbers,
    luckyDirection: { ...luckyDirection, reason: directionReason },
    luckyActivities,
    avoidActivities,
    usefulGodElement,
    dailyElement,
    dailyUsefulGodRelation: relation,
    elementInteraction,
  };
}

/**
 * 오행별 색상 팔레트 조회 (UI용)
 */
export function getColorPalette(element: Element): LuckyColor[] {
  return ELEMENT_COLORS[element];
}

/**
 * 오행별 음식 목록 조회 (UI용)
 */
export function getFoodList(element: Element): LuckyFood[] {
  return ELEMENT_FOODS[element];
}

/**
 * 모든 오행의 방향 정보 조회 (UI용)
 */
export function getAllDirections(): Record<Element, LuckyDirection> {
  return ELEMENT_DIRECTIONS;
}
