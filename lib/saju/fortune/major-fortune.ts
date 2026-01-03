/**
 * 대운(大運) 정밀 계산 모듈
 * Major Fortune Calculator
 *
 * 절기 기준 대운수 계산 및 대운 분석
 */

import { Solar, Lunar } from "lunar-javascript";
import type { Element } from "../types";
import type {
  MajorFortunePillar,
  MajorFortuneList,
  Pillar,
  FortuneInteraction,
  FortuneGrade,
} from "./types";
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

// ============================================================================
// 대운수 계산 (절기 기반 정밀 계산)
// ============================================================================

/**
 * 천간 음양 판별
 */
const STEM_YIN_YANG: Record<string, "양" | "음"> = {
  "甲": "양", "乙": "음",
  "丙": "양", "丁": "음",
  "戊": "양", "己": "음",
  "庚": "양", "辛": "음",
  "壬": "양", "癸": "음",
};

/**
 * 대운 방향 결정
 *
 * 남자(양) + 양년생 → 순행
 * 남자(양) + 음년생 → 역행
 * 여자(음) + 음년생 → 순행
 * 여자(음) + 양년생 → 역행
 *
 * @param gender - 성별 ("male" | "female")
 * @param yearStem - 연간 (甲, 乙, 丙...)
 * @returns 대운 방향 ("forward" | "backward")
 */
export function determineMajorFortuneDirection(
  gender: "male" | "female",
  yearStem: string
): "forward" | "backward" {
  const yearYinYang = STEM_YIN_YANG[yearStem] || "양";
  const isMale = gender === "male";

  // 남양+양년, 남음+음년 불가능 (성별은 양/음 고정)
  // 실제 로직: 남자+양년=순행, 남자+음년=역행, 여자+음년=순행, 여자+양년=역행
  if (isMale) {
    return yearYinYang === "양" ? "forward" : "backward";
  } else {
    return yearYinYang === "음" ? "forward" : "backward";
  }
}

/**
 * 절기까지의 일수 계산
 *
 * @param birthDate - 생년월일
 * @param direction - 대운 방향
 * @returns 절기까지 일수
 */
export function calculateDaysToSolarTerm(
  birthDate: Date,
  direction: "forward" | "backward"
): { days: number; solarTermName: string; solarTermDate: string } {
  const solar = Solar.fromDate(birthDate);
  const lunar = solar.getLunar();

  // 현재 절기 정보
  const currentJieQi = lunar.getJieQi() || "";

  // 다음/이전 절기 찾기
  let targetDate: Date;
  let targetJieQi: string;

  if (direction === "forward") {
    // 순행: 다음 절(節) 찾기
    const nextJieQi = lunar.getNextJieQi();
    if (nextJieQi && nextJieQi.solar) {
      const nextSolar = nextJieQi.solar;
      targetDate = new Date(nextSolar.getYear(), nextSolar.getMonth() - 1, nextSolar.getDay());
      targetJieQi = nextJieQi.name || "절기";
    } else {
      // 절기를 찾지 못한 경우 기본값 (약 15일 추정)
      targetDate = new Date(birthDate);
      targetDate.setDate(targetDate.getDate() + 15);
      targetJieQi = "절기";
    }
  } else {
    // 역행: 이전 절(節) 찾기
    const prevJieQi = lunar.getPrevJieQi();
    if (prevJieQi && prevJieQi.solar) {
      const prevSolar = prevJieQi.solar;
      targetDate = new Date(prevSolar.getYear(), prevSolar.getMonth() - 1, prevSolar.getDay());
      targetJieQi = prevJieQi.name || "절기";
    } else {
      // 절기를 찾지 못한 경우 기본값 (약 15일 추정)
      targetDate = new Date(birthDate);
      targetDate.setDate(targetDate.getDate() - 15);
      targetJieQi = "절기";
    }
  }

  // 일수 계산
  const diffTime = Math.abs(targetDate.getTime() - birthDate.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const targetYear = targetDate.getFullYear();
  const targetMonth = String(targetDate.getMonth() + 1).padStart(2, "0");
  const targetDay = String(targetDate.getDate()).padStart(2, "0");

  return {
    days,
    solarTermName: targetJieQi,
    solarTermDate: `${targetYear}-${targetMonth}-${targetDay}`,
  };
}

/**
 * 대운수(大運數) 계산
 * 절기까지의 일수 ÷ 3 = 대운수 (반올림)
 *
 * @param birthDate - 생년월일
 * @param gender - 성별
 * @param yearStem - 연간
 * @returns 대운수 정보
 */
export function calculateMajorFortuneStartAge(
  birthDate: Date,
  gender: "male" | "female",
  yearStem: string
): {
  startAge: number;
  direction: "forward" | "backward";
  daysToSolarTerm: number;
  solarTermName: string;
  calculationBasis: string;
} {
  const direction = determineMajorFortuneDirection(gender, yearStem);
  const solarTermInfo = calculateDaysToSolarTerm(birthDate, direction);

  // 대운수 = 절기까지 일수 ÷ 3 (반올림, 최소 1)
  const startAge = Math.max(1, Math.round(solarTermInfo.days / 3));

  const directionText = direction === "forward" ? "순행" : "역행";
  const yearYinYang = STEM_YIN_YANG[yearStem];
  const genderText = gender === "male" ? "남성" : "여성";

  return {
    startAge,
    direction,
    daysToSolarTerm: solarTermInfo.days,
    solarTermName: solarTermInfo.solarTermName,
    calculationBasis: `${genderText}(${gender === "male" ? "양" : "음"}) + ${yearStem}(${yearYinYang})년생 → ${directionText}. ${solarTermInfo.solarTermName}까지 ${solarTermInfo.days}일 ÷ 3 = ${startAge}세`,
  };
}

// ============================================================================
// 대운 간지 계산
// ============================================================================

/**
 * 월주에서 다음/이전 간지 계산
 *
 * @param monthStem - 월간
 * @param monthBranch - 월지
 * @param direction - 방향
 * @param steps - 몇 번째 대운
 * @returns 대운 간지
 */
export function calculateMajorFortunePillarGanZhi(
  monthStem: string,
  monthBranch: string,
  direction: "forward" | "backward",
  steps: number
): { stem: string; branch: string } {
  const stemIndex = HEAVENLY_STEMS.indexOf(monthStem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(monthBranch);

  let newStemIndex: number;
  let newBranchIndex: number;

  if (direction === "forward") {
    newStemIndex = (stemIndex + steps) % 10;
    newBranchIndex = (branchIndex + steps) % 12;
  } else {
    newStemIndex = (stemIndex - steps % 10 + 10) % 10;
    newBranchIndex = (branchIndex - steps % 12 + 12) % 12;
  }

  return {
    stem: HEAVENLY_STEMS[newStemIndex],
    branch: EARTHLY_BRANCHES[newBranchIndex],
  };
}

// ============================================================================
// 대운 목록 생성
// ============================================================================

/**
 * 원국 지지 정보
 */
interface NatalBranches {
  year: string;
  month: string;
  day: string;
  time: string;
}

/**
 * 대운 목록 생성 (8-10개)
 *
 * @param birthDate - 생년월일
 * @param birthYear - 출생 연도
 * @param gender - 성별
 * @param yearStem - 연간
 * @param monthStem - 월간
 * @param monthBranch - 월지
 * @param natalBranches - 원국 지지
 * @param usefulGodElement - 용신 오행
 * @param fortuneCount - 생성할 대운 개수 (기본 10)
 * @returns 대운 목록
 */
export function generateMajorFortuneList(
  birthDate: Date,
  birthYear: number,
  gender: "male" | "female",
  yearStem: string,
  monthStem: string,
  monthBranch: string,
  natalBranches: NatalBranches,
  usefulGodElement: Element,
  fortuneCount: number = 10
): MajorFortuneList {
  const startAgeInfo = calculateMajorFortuneStartAge(birthDate, gender, yearStem);
  const { startAge, direction, calculationBasis: calcBasisText, solarTermName, daysToSolarTerm } = startAgeInfo;

  // 절기 날짜 계산
  const solarTermDate = (() => {
    const solarTermInfo = calculateDaysToSolarTerm(birthDate, direction);
    return solarTermInfo.solarTermDate;
  })();

  const calculationBasis = {
    description: calcBasisText,
    solarTermName: solarTermName || "절기",
    solarTermDate: solarTermDate || "미정",
    daysToSolarTerm: daysToSolarTerm || 0,
  };

  const fortunes: MajorFortunePillar[] = [];
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear + 1; // 한국 나이

  let currentIndex = -1;

  for (let i = 1; i <= fortuneCount; i++) {
    const fortuneStartAge = startAge + (i - 1) * 10;
    const fortuneEndAge = fortuneStartAge + 9;
    const fortuneStartYear = birthYear + fortuneStartAge - 1;
    const fortuneEndYear = birthYear + fortuneEndAge - 1;

    // 대운 간지 계산
    const { stem, branch } = calculateMajorFortunePillarGanZhi(
      monthStem,
      monthBranch,
      direction,
      i
    );

    const stemIndex = HEAVENLY_STEMS.indexOf(stem);
    const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
    const element = STEM_ELEMENTS[stem] || "earth";

    const pillar: Pillar = {
      stem,
      branch,
      stemKorean: STEMS_KOREAN[stemIndex] || stem,
      branchKorean: BRANCHES_KOREAN[branchIndex] || branch,
      element,
      elementKorean: ELEMENT_KOREAN[element],
    };

    // 원국과의 관계 분석
    const natalInteraction = analyzeNatalInteraction(branch, natalBranches);

    // 용신과의 관계 분석
    const usefulGodResult = analyzeUsefulGodRelation(element as Element, usefulGodElement);

    // 점수 계산
    let score = 50;
    score += natalInteraction.harmonies.length * 12;
    score -= natalInteraction.clashes.length * 18;
    score -= natalInteraction.punishments.length * 12;
    score -= natalInteraction.harms.length * 10;
    score -= natalInteraction.destructions.length * 6;

    if (usefulGodResult.relation === "support") {
      score += 20;
    } else if (usefulGodResult.relation === "against") {
      score -= 15;
    }

    score = Math.max(0, Math.min(100, score));
    const grade = scoreToGrade(score);

    // 현재 대운 인덱스 확인
    if (currentAge >= fortuneStartAge && currentAge <= fortuneEndAge) {
      currentIndex = i - 1;
    }

    // 키워드 생성
    const keywords: string[] = [];
    if (natalInteraction.harmonies.length > 0) {
      keywords.push("조화");
    }
    if (natalInteraction.clashes.length > 0) {
      keywords.push("변화");
    }
    if (usefulGodResult.relation === "support") {
      keywords.push("발전");
    }
    keywords.push(getElementKeyword(element as Element));

    fortunes.push({
      order: i,
      startAge: fortuneStartAge,
      endAge: fortuneEndAge,
      startYear: fortuneStartYear,
      endYear: fortuneEndYear,
      pillar,
      natalInteraction,
      usefulGodRelation: usefulGodResult.relation,
      analysis: {
        score,
        grade,
        theme: "", // AI에서 채움
        description: "", // AI에서 채움
        opportunities: [],
        challenges: [],
        advice: "",
      },
      keywords,
    });
  }

  return {
    startAge,
    direction,
    calculationBasis,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    fortunes,
  };
}

/**
 * 오행별 키워드
 */
function getElementKeyword(element: Element): string {
  const keywords: Record<Element, string> = {
    wood: "성장",
    fire: "열정",
    earth: "안정",
    metal: "결실",
    water: "지혜",
  };
  return keywords[element];
}

// ============================================================================
// 현재 대운 분석
// ============================================================================

/**
 * 현재 대운 상세 분석
 */
export function getCurrentMajorFortuneAnalysis(
  majorFortuneList: MajorFortuneList,
  currentAge: number
): {
  current: MajorFortunePillar | null;
  next: MajorFortunePillar | null;
  previous: MajorFortunePillar | null;
  yearsRemaining: number;
  progress: number; // 0-100%
} {
  const { fortunes, currentIndex } = majorFortuneList;

  const current = fortunes[currentIndex] || null;
  const next = fortunes[currentIndex + 1] || null;
  const previous = currentIndex > 0 ? fortunes[currentIndex - 1] : null;

  let yearsRemaining = 0;
  let progress = 0;

  if (current) {
    yearsRemaining = current.endAge - currentAge;
    const totalYears = current.endAge - current.startAge + 1;
    const yearsElapsed = currentAge - current.startAge + 1;
    progress = Math.round((yearsElapsed / totalYears) * 100);
  }

  return {
    current,
    next,
    previous,
    yearsRemaining: Math.max(0, yearsRemaining),
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * 대운 요약 정보
 */
export function getMajorFortuneSummary(
  birthDate: Date,
  birthYear: number,
  gender: "male" | "female",
  yearStem: string,
  monthStem: string,
  monthBranch: string,
  natalBranches: NatalBranches,
  usefulGodElement: Element
): {
  startAge: number;
  direction: string;
  currentFortune: {
    period: string;
    pillarKorean: string;
    element: string;
    grade: string;
    yearsRemaining: number;
  } | null;
  nextFortune: {
    period: string;
    pillarKorean: string;
    element: string;
  } | null;
  lifetimeOverview: Array<{
    order: number;
    period: string;
    pillarKorean: string;
    grade: string;
    isCurrent: boolean;
  }>;
} {
  const list = generateMajorFortuneList(
    birthDate,
    birthYear,
    gender,
    yearStem,
    monthStem,
    monthBranch,
    natalBranches,
    usefulGodElement
  );

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear + 1;

  const analysis = getCurrentMajorFortuneAnalysis(list, currentAge);

  return {
    startAge: list.startAge,
    direction: list.direction === "forward" ? "순행" : "역행",
    currentFortune: analysis.current
      ? {
          period: `${analysis.current.startAge}~${analysis.current.endAge}세 (${analysis.current.startYear}~${analysis.current.endYear}년)`,
          pillarKorean: `${analysis.current.pillar.stemKorean}${analysis.current.pillar.branchKorean}`,
          element: analysis.current.pillar.elementKorean,
          grade: gradeToKorean(analysis.current.analysis.grade),
          yearsRemaining: analysis.yearsRemaining,
        }
      : null,
    nextFortune: analysis.next
      ? {
          period: `${analysis.next.startAge}~${analysis.next.endAge}세`,
          pillarKorean: `${analysis.next.pillar.stemKorean}${analysis.next.pillar.branchKorean}`,
          element: analysis.next.pillar.elementKorean,
        }
      : null,
    lifetimeOverview: list.fortunes.map((f, idx) => ({
      order: f.order,
      period: `${f.startAge}~${f.endAge}세`,
      pillarKorean: `${f.pillar.stemKorean}${f.pillar.branchKorean}`,
      grade: gradeToKorean(f.analysis.grade),
      isCurrent: idx === list.currentIndex,
    })),
  };
}
