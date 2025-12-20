/**
 * 사주팔자 계산기 (Four Pillars Calculator)
 * AI 운세 마스터 - Main Calculator
 *
 * lunar-javascript 라이브러리를 사용하여 정확한 만세력 기반 사주 계산
 */

import { Solar, Lunar } from "lunar-javascript";
import type {
  SajuInput,
  SajuResult,
  Pillar,
  Gan,
  Zhi,
  SajuMeta,
  SajuPromptData,
} from "./types";
import {
  STEM_ELEMENTS,
  STEM_YIN_YANG,
  STEM_KOREAN,
  STEM_DESCRIPTIONS,
  BRANCH_ELEMENTS,
  BRANCH_YIN_YANG,
  BRANCH_KOREAN,
  BRANCH_HIDDEN_STEMS,
  DEFAULT_LONGITUDE,
} from "./constants";
import {
  adjustToTrueSolarTime,
  createDate,
  extractDateParts,
} from "./solar-time";
import { calculateElementScores, analyzeElements } from "./elements";
import { calculateTenGods, summarizeTenGods } from "./ten-gods";
import { calculateStars } from "./stars";

/**
 * 간지 문자열을 Pillar 객체로 변환
 *
 * @param ganZhi - 간지 문자열 (예: "甲子")
 * @returns Pillar 객체
 */
function parseGanZhi(ganZhi: string): Pillar {
  const gan = ganZhi[0] as Gan;
  const zhi = ganZhi[1] as Zhi;

  return {
    gan,
    zhi,
    ganZhi,
    ganElement: STEM_ELEMENTS[gan],
    ganYinYang: STEM_YIN_YANG[gan],
    zhiElement: BRANCH_ELEMENTS[zhi],
    zhiYinYang: BRANCH_YIN_YANG[zhi],
    zhiHiddenGan: BRANCH_HIDDEN_STEMS[zhi] || [],
    koreanReading: `${STEM_KOREAN[gan]}${BRANCH_KOREAN[zhi]}`,
  };
}

/**
 * 사주팔자 계산
 *
 * @param input - 사용자 입력 (생년월일시, 성별 등)
 * @returns 사주 분석 결과
 *
 * @example
 * ```ts
 * const result = calculateSaju({
 *   year: 1990,
 *   month: 1,
 *   day: 15,
 *   hour: 13,
 *   minute: 30,
 *   gender: 'male',
 *   isLunar: false,
 *   longitude: 127.0,  // 서울
 * });
 * ```
 */
export function calculateSaju(input: SajuInput): SajuResult {
  // 1. 입력 검증
  validateInput(input);

  // 2. 경도 기본값 설정
  const longitude = input.longitude ?? DEFAULT_LONGITUDE;

  // 3. 날짜 객체 생성
  const inputDate = createDate(
    input.year,
    input.month,
    input.day,
    input.hour,
    input.minute
  );

  // 4. 진태양시 보정 적용
  const solarTimeResult = adjustToTrueSolarTime(inputDate, longitude);
  const adjustedParts = extractDateParts(solarTimeResult.adjusted);

  // 5. Solar 객체 생성 (lunar-javascript)
  let solar: InstanceType<typeof Solar>;

  if (input.isLunar) {
    // 음력 입력인 경우
    const lunar = Lunar.fromYmdHms(
      input.year,
      input.month,
      input.day,
      adjustedParts.hour,
      adjustedParts.minute,
      0
    );
    solar = lunar.getSolar();
  } else {
    // 양력 입력인 경우
    solar = Solar.fromYmdHms(
      adjustedParts.year,
      adjustedParts.month,
      adjustedParts.day,
      adjustedParts.hour,
      adjustedParts.minute,
      0
    );
  }

  // 6. Lunar 객체로 변환 (절기 기준 자동 적용)
  const lunar = solar.getLunar();

  // 7. 사주 팔자 추출
  const yearGanZhi = lunar.getYearInGanZhi();
  const monthGanZhi = lunar.getMonthInGanZhi();
  const dayGanZhi = lunar.getDayInGanZhi();
  const timeGanZhi = lunar.getTimeInGanZhi();

  const pillars = {
    year: parseGanZhi(yearGanZhi),
    month: parseGanZhi(monthGanZhi),
    day: parseGanZhi(dayGanZhi),
    time: parseGanZhi(timeGanZhi),
  };

  // 8. 일간 (Day Master) 정보
  const dayMaster = pillars.day.gan;
  const dayMasterElement = STEM_ELEMENTS[dayMaster];
  const dayMasterYinYang = STEM_YIN_YANG[dayMaster];
  const dayMasterDescription = STEM_DESCRIPTIONS[dayMaster];

  // 9. 오행 분석
  const elementScores = calculateElementScores(pillars);
  const elementAnalysis = analyzeElements(elementScores, dayMasterElement);

  // 10. 십성 분석
  const tenGods = calculateTenGods(dayMaster, pillars);
  const tenGodSummary = summarizeTenGods(tenGods);

  // 11. 신살 분석
  const stars = calculateStars(pillars);

  // 12. 메타 정보 생성
  const meta: SajuMeta = {
    solarDate: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, "0")}-${String(solar.getDay()).padStart(2, "0")}`,
    lunarDate: `${lunar.getYear()}-${String(lunar.getMonth()).padStart(2, "0")}-${String(lunar.getDay()).padStart(2, "0")}`,
    inputTime: `${String(input.hour).padStart(2, "0")}:${String(input.minute).padStart(2, "0")}`,
    trueSolarTime: `${String(adjustedParts.hour).padStart(2, "0")}:${String(adjustedParts.minute).padStart(2, "0")}`,
    jieQi: lunar.getJieQi() || "절기 없음",
    longitude,
    offsetMinutes: solarTimeResult.offsetMinutes,
  };

  // 13. 결과 반환
  return {
    pillars,
    dayMaster,
    dayMasterElement,
    dayMasterYinYang,
    dayMasterDescription,
    elementAnalysis,
    tenGods,
    tenGodSummary,
    stars,
    meta,
  };
}

/**
 * 입력값 검증
 */
function validateInput(input: SajuInput): void {
  if (input.year < 1900 || input.year > 2100) {
    throw new Error("년도는 1900-2100 사이여야 합니다.");
  }
  if (input.month < 1 || input.month > 12) {
    throw new Error("월은 1-12 사이여야 합니다.");
  }
  if (input.day < 1 || input.day > 31) {
    throw new Error("일은 1-31 사이여야 합니다.");
  }
  if (input.hour < 0 || input.hour > 23) {
    throw new Error("시는 0-23 사이여야 합니다.");
  }
  if (input.minute < 0 || input.minute > 59) {
    throw new Error("분은 0-59 사이여야 합니다.");
  }
}

/**
 * SajuResult를 LLM 프롬프트용 데이터로 변환
 *
 * @param result - 사주 분석 결과
 * @returns 프롬프트용 단순화된 데이터
 */
export function toPromptData(result: SajuResult): SajuPromptData {
  return {
    dayMaster: `${result.dayMaster}(${STEM_KOREAN[result.dayMaster]})`,
    dayMasterDescription: result.dayMasterDescription,
    pillars: {
      year: `${result.pillars.year.ganZhi}(${result.pillars.year.koreanReading})`,
      month: `${result.pillars.month.ganZhi}(${result.pillars.month.koreanReading})`,
      day: `${result.pillars.day.ganZhi}(${result.pillars.day.koreanReading})`,
      time: `${result.pillars.time.ganZhi}(${result.pillars.time.koreanReading})`,
    },
    elementScores: result.elementAnalysis.scores,
    dominantElements: result.elementAnalysis.dominant,
    lackingElements: result.elementAnalysis.lacking,
    dominantTenGods: result.tenGodSummary.dominant.map(
      (god) => god
    ),
    stars: result.stars.map((star) => star.name),
  };
}

/**
 * 사주 결과 요약 문자열 생성
 *
 * @param result - 사주 분석 결과
 * @returns 요약 문자열
 */
export function summarizeSaju(result: SajuResult): string {
  const lines = [
    `[사주팔자]`,
    `년주: ${result.pillars.year.ganZhi} (${result.pillars.year.koreanReading})`,
    `월주: ${result.pillars.month.ganZhi} (${result.pillars.month.koreanReading})`,
    `일주: ${result.pillars.day.ganZhi} (${result.pillars.day.koreanReading})`,
    `시주: ${result.pillars.time.ganZhi} (${result.pillars.time.koreanReading})`,
    ``,
    `[일간(본인)]`,
    result.dayMasterDescription,
    ``,
    `[오행 분포]`,
    `목: ${result.elementAnalysis.scores.wood}%, 화: ${result.elementAnalysis.scores.fire}%, 토: ${result.elementAnalysis.scores.earth}%, 금: ${result.elementAnalysis.scores.metal}%, 수: ${result.elementAnalysis.scores.water}%`,
    ``,
    `[신살]`,
    result.stars.length > 0
      ? result.stars.map((s) => s.name).join(", ")
      : "특별한 신살 없음",
  ];

  return lines.join("\n");
}

// Re-export for convenience
export { parseGanZhi };
