/**
 * 소운(小運) 계산 모듈
 * Minor Fortune Calculator
 *
 * 대운이 시작되기 전 어린 시절(1세~대운수)의 운을 계산
 * 시주(時柱)를 기준으로 순행/역행하여 매년의 간지 결정
 */

import type { Element } from "../types";
import type { Pillar, FortuneGrade, MinorFortune, MinorFortuneList } from "./types";
import {
  HEAVENLY_STEMS,
  STEMS_KOREAN,
  EARTHLY_BRANCHES,
  BRANCHES_KOREAN,
  STEM_ELEMENTS,
  ELEMENT_KOREAN,
} from "./types";
import {
  analyzeNatalInteraction,
  analyzeUsefulGodRelation,
  scoreToGrade,
  gradeToKorean,
} from "./daily-fortune";
import { determineMajorFortuneDirection, calculateMajorFortuneStartAge } from "./major-fortune";

// ============================================================================
// 소운 간지 계산
// ============================================================================

/**
 * 특정 나이의 소운 간지 계산
 *
 * @param timePillar - 시주 (출생 시간의 간지)
 * @param age - 나이 (1세부터)
 * @param direction - 순행/역행
 * @returns 해당 나이의 소운 간지
 */
export function calculateMinorFortunePillar(
  timePillar: { stem: string; branch: string },
  age: number,
  direction: "forward" | "backward"
): Pillar {
  // 시주의 천간, 지지 인덱스
  const stemIndex = HEAVENLY_STEMS.indexOf(timePillar.stem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(timePillar.branch);

  if (stemIndex === -1 || branchIndex === -1) {
    throw new Error(`Invalid time pillar: ${timePillar.stem}${timePillar.branch}`);
  }

  // 나이에 따른 이동량 (1세는 시주 그대로, 2세부터 이동)
  const offset = age - 1;

  // 순행/역행에 따른 새 인덱스 계산
  let newStemIndex: number;
  let newBranchIndex: number;

  if (direction === "forward") {
    newStemIndex = (stemIndex + offset) % 10;
    newBranchIndex = (branchIndex + offset) % 12;
  } else {
    newStemIndex = (stemIndex - offset % 10 + 10) % 10;
    newBranchIndex = (branchIndex - offset % 12 + 12) % 12;
  }

  const stem = HEAVENLY_STEMS[newStemIndex];
  const branch = EARTHLY_BRANCHES[newBranchIndex];
  const element = STEM_ELEMENTS[stem] || "earth";

  return {
    stem,
    branch,
    stemKorean: STEMS_KOREAN[newStemIndex],
    branchKorean: BRANCHES_KOREAN[newBranchIndex],
    element,
    elementKorean: ELEMENT_KOREAN[element],
  };
}

// ============================================================================
// 소운 분석
// ============================================================================

/**
 * 단일 소운 분석
 *
 * @param pillar - 소운 간지
 * @param age - 나이
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @returns 소운 분석 결과
 */
export function analyzeMinorFortune(
  pillar: Pillar,
  age: number,
  natalBranches: {
    year: string;
    month: string;
    day: string;
    time: string;
  },
  usefulGodElement: Element
): MinorFortune {
  // 원국과의 관계 분석
  const natalInteraction = analyzeNatalInteraction(pillar.branch, natalBranches);

  // 용신과의 관계 분석
  const usefulGodResult = analyzeUsefulGodRelation(pillar.element, usefulGodElement);

  // 점수 계산
  let score = 50;

  // 원국과의 관계 반영
  score += natalInteraction.harmonies.length * 10;
  score -= natalInteraction.clashes.length * 15;
  score -= natalInteraction.punishments.length * 10;
  score -= natalInteraction.harms.length * 8;
  score -= natalInteraction.destructions.length * 5;

  // 용신과의 관계 반영
  if (usefulGodResult.relation === "support") {
    score += 15;
  } else if (usefulGodResult.relation === "against") {
    score -= 12;
  }

  score = Math.max(0, Math.min(100, score));
  const grade = scoreToGrade(score);

  // 테마 결정
  const theme = getMinorFortuneTheme(pillar, grade, age);

  // 설명 생성
  const description = generateMinorFortuneDescription(
    pillar,
    age,
    natalInteraction,
    usefulGodResult.relation,
    grade
  );

  return {
    age,
    pillar,
    description,
    theme,
  };
}

/**
 * 소운 테마 결정
 */
function getMinorFortuneTheme(pillar: Pillar, grade: FortuneGrade, age: number): string {
  const elementThemes: Record<Element, string> = {
    wood: "성장과 발전",
    fire: "활력과 표현",
    earth: "안정과 기반",
    metal: "단련과 성취",
    water: "지혜와 적응",
  };

  const gradeModifier: Record<FortuneGrade, string> = {
    excellent: "빛나는 ",
    good: "순조로운 ",
    normal: "",
    caution: "조심스러운 ",
  };

  const baseTheme = elementThemes[pillar.element] || "변화";
  const ageContext = age <= 3 ? "유아기" : age <= 6 ? "유치원기" : age <= 12 ? "초등기" : "청소년기";

  return `${gradeModifier[grade]}${ageContext}의 ${baseTheme}`;
}

/**
 * 소운 설명 생성
 */
function generateMinorFortuneDescription(
  pillar: Pillar,
  age: number,
  natalInteraction: ReturnType<typeof analyzeNatalInteraction>,
  usefulGodRelation: "support" | "neutral" | "against",
  grade: FortuneGrade
): string {
  const parts: string[] = [];

  // 나이와 간지 설명
  parts.push(`${age}세(${pillar.stemKorean}${pillar.branchKorean}년)의 운세입니다.`);

  // 오행 특성
  const elementDescriptions: Record<Element, string> = {
    wood: "목(木)의 기운으로 새로운 것을 배우고 자라는 시기입니다.",
    fire: "화(火)의 기운으로 활발하고 표현력이 풍부해지는 시기입니다.",
    earth: "토(土)의 기운으로 안정적이고 착실한 발달이 이루어지는 시기입니다.",
    metal: "금(金)의 기운으로 규율과 질서를 배우는 시기입니다.",
    water: "수(水)의 기운으로 지혜롭고 유연하게 적응하는 시기입니다.",
  };
  parts.push(elementDescriptions[pillar.element] || "");

  // 원국과의 관계
  if (natalInteraction.harmonies.length > 0) {
    parts.push(`원국과 합(合)을 이루어 조화로운 흐름이 있습니다.`);
  }
  if (natalInteraction.clashes.length > 0) {
    parts.push(`원국과 충(沖)이 있어 변화와 도전이 따를 수 있습니다.`);
  }

  // 용신 관계
  if (usefulGodRelation === "support") {
    parts.push("용신을 돕는 기운으로 운세가 순조롭습니다.");
  } else if (usefulGodRelation === "against") {
    parts.push("용신과 상충되는 기운으로 건강과 정서에 주의가 필요합니다.");
  }

  return parts.join(" ");
}

// ============================================================================
// 소운 목록 생성
// ============================================================================

/**
 * 전체 소운 목록 생성
 *
 * @param birthDate - 생년월일
 * @param gender - 성별
 * @param timePillar - 시주
 * @param yearStem - 연간 (천간)
 * @param monthPillar - 월주
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @returns 소운 목록
 */
export function generateMinorFortuneList(
  birthDate: Date,
  gender: "male" | "female",
  timePillar: { stem: string; branch: string },
  yearStem: string,
  monthPillar: { stem: string; branch: string },
  natalBranches: {
    year: string;
    month: string;
    day: string;
    time: string;
  },
  usefulGodElement: Element
): MinorFortuneList {
  // 대운 시작 나이 계산
  const majorFortuneInfo = calculateMajorFortuneStartAge(birthDate, gender, yearStem);
  const majorFortuneStartAge = majorFortuneInfo.startAge;
  const direction = majorFortuneInfo.direction;

  // 소운은 1세부터 대운 시작 전까지
  const fortunes: MinorFortune[] = [];

  for (let age = 1; age < majorFortuneStartAge; age++) {
    const pillar = calculateMinorFortunePillar(timePillar, age, direction);
    const fortune = analyzeMinorFortune(pillar, age, natalBranches, usefulGodElement);
    fortunes.push(fortune);
  }

  return {
    startAge: 1,
    majorFortuneStartAge,
    direction,
    fortunes,
  };
}

// ============================================================================
// 현재 소운 분석
// ============================================================================

/**
 * 현재 나이가 소운 기간에 해당하는지 확인
 *
 * @param birthDate - 생년월일
 * @param majorFortuneStartAge - 대운 시작 나이
 * @returns 소운 기간 여부
 */
export function isInMinorFortunePeriod(
  birthDate: Date,
  majorFortuneStartAge: number
): { isMinorFortune: boolean; currentAge: number } {
  const now = new Date();
  const birthYear = birthDate.getFullYear();
  const currentYear = now.getFullYear();

  // 한국식 나이 계산 (세는 나이)
  const currentAge = currentYear - birthYear + 1;

  return {
    isMinorFortune: currentAge < majorFortuneStartAge,
    currentAge,
  };
}

/**
 * 현재 소운 정보 조회
 *
 * @param minorFortuneList - 소운 목록
 * @param currentAge - 현재 나이
 * @returns 현재 소운 정보 (소운 기간이 아니면 null)
 */
export function getCurrentMinorFortune(
  minorFortuneList: MinorFortuneList,
  currentAge: number
): MinorFortune | null {
  if (currentAge >= minorFortuneList.majorFortuneStartAge || currentAge < 1) {
    return null;
  }

  return minorFortuneList.fortunes.find((f) => f.age === currentAge) || null;
}

/**
 * 소운 요약 정보
 */
export function getMinorFortuneSummary(
  birthDate: Date,
  gender: "male" | "female",
  timePillar: { stem: string; branch: string },
  yearStem: string,
  monthPillar: { stem: string; branch: string },
  natalBranches: {
    year: string;
    month: string;
    day: string;
    time: string;
  },
  usefulGodElement: Element
): {
  isMinorFortunePeriod: boolean;
  currentAge: number;
  majorFortuneStartAge: number;
  currentFortune: MinorFortune | null;
  allFortunes: MinorFortune[];
  direction: "forward" | "backward";
  summary: string;
} {
  const minorFortuneList = generateMinorFortuneList(
    birthDate,
    gender,
    timePillar,
    yearStem,
    monthPillar,
    natalBranches,
    usefulGodElement
  );

  const { isMinorFortune, currentAge } = isInMinorFortunePeriod(
    birthDate,
    minorFortuneList.majorFortuneStartAge
  );

  const currentFortune = isMinorFortune
    ? getCurrentMinorFortune(minorFortuneList, currentAge)
    : null;

  // 요약 문구 생성
  let summary: string;
  if (isMinorFortune && currentFortune) {
    summary = `현재 ${currentAge}세로 소운 기간입니다. ${currentFortune.theme}의 시기이며, ${minorFortuneList.majorFortuneStartAge}세부터 대운이 시작됩니다.`;
  } else {
    summary = `현재 ${currentAge}세로 대운 기간입니다. 소운은 ${minorFortuneList.majorFortuneStartAge}세 이전까지였습니다.`;
  }

  return {
    isMinorFortunePeriod: isMinorFortune,
    currentAge,
    majorFortuneStartAge: minorFortuneList.majorFortuneStartAge,
    currentFortune,
    allFortunes: minorFortuneList.fortunes,
    direction: minorFortuneList.direction,
    summary,
  };
}
