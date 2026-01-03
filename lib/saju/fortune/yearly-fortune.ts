/**
 * 세운(歲運) 계산 모듈
 * Yearly Fortune Calculator
 *
 * 연도별 운세를 계산하고 원국과의 관계를 분석
 * 5년 전망 제공
 */

import { Solar } from "lunar-javascript";
import type { Element } from "../types";
import type {
  Pillar,
  FortuneInteraction,
  FortuneAnalysis,
  FortuneGrade,
} from "./types";
import {
  HEAVENLY_STEMS,
  STEMS_KOREAN,
  EARTHLY_BRANCHES,
  BRANCHES_KOREAN,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_KOREAN,
} from "./types";
import {
  analyzeNatalInteraction,
  analyzeUsefulGodRelation,
  calculateDailyScore,
  scoreToGrade,
  gradeToKorean,
} from "./daily-fortune";

// ============================================================================
// Types
// ============================================================================

export interface YearlyFortune {
  /** 연도 */
  year: number;

  /** 년주 (年柱) */
  pillar: Pillar;

  /** 원국과의 관계 */
  natalInteraction: FortuneInteraction;

  /** 용신과의 관계 */
  usefulGodRelation: "support" | "neutral" | "against";

  /** 분석 결과 */
  analysis: {
    score: number;
    grade: FortuneGrade;
    theme: string;
    description: string;
    opportunities: string[];
    challenges: string[];
    advice: string;
  };

  /** 이 해의 키워드 */
  keywords: string[];

  /** 띠 (동물) */
  zodiacAnimal: string;
}

export interface YearlyFortuneList {
  /** 현재 연도 */
  currentYear: number;

  /** 조회 연도 수 */
  yearsCount: number;

  /** 연도별 운세 목록 */
  fortunes: YearlyFortune[];

  /** 가장 좋은 해 */
  bestYears: number[];

  /** 주의할 해 */
  cautionYears: number[];
}

// ============================================================================
// 년주 계산
// ============================================================================

/** 띠 동물 이름 */
const ZODIAC_ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

/**
 * 특정 연도의 년주(年柱) 계산
 *
 * @param year - 연도
 * @returns 년주 정보
 */
export function calculateYearlyPillar(year: number): Pillar {
  // 입춘 이후를 기준으로 함 (대략 2월 4일)
  const date = new Date(year, 1, 15); // 2월 15일 기준
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const yearGanZhi = lunar.getYearInGanZhi();

  const stem = yearGanZhi[0];
  const branch = yearGanZhi[1];

  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  const element = STEM_ELEMENTS[stem] || "earth";

  return {
    stem,
    branch,
    stemKorean: STEMS_KOREAN[stemIndex] || stem,
    branchKorean: BRANCHES_KOREAN[branchIndex] || branch,
    element,
    elementKorean: ELEMENT_KOREAN[element],
  };
}

/**
 * 연도의 띠 동물 반환
 */
export function getZodiacAnimal(year: number): string {
  const pillar = calculateYearlyPillar(year);
  const branchIndex = EARTHLY_BRANCHES.indexOf(pillar.branch);
  return ZODIAC_ANIMALS[branchIndex] || "";
}

// ============================================================================
// 세운 분석
// ============================================================================

/**
 * 세운 테마 생성
 */
function generateYearlyTheme(
  pillar: Pillar,
  natalInteraction: FortuneInteraction,
  usefulGodRelation: "support" | "neutral" | "against",
  score: number
): string {
  const elementThemes: Record<Element, string[]> = {
    wood: ["성장", "발전", "시작", "창의"],
    fire: ["열정", "도약", "표현", "명예"],
    earth: ["안정", "축적", "신뢰", "기반"],
    metal: ["결실", "결단", "실행", "정리"],
    water: ["지혜", "유연", "변화", "소통"],
  };

  const themes = elementThemes[pillar.element] || ["변화"];
  const mainTheme = themes[Math.floor(Math.random() * 2)]; // 첫 두 개 중 선택

  if (score >= 75) {
    return `${mainTheme}과 발전의 해`;
  } else if (score >= 60) {
    return `${mainTheme}을 통한 성장의 해`;
  } else if (score >= 45) {
    return `${mainTheme}과 조화의 해`;
  } else {
    return `${mainTheme}과 인내의 해`;
  }
}

/**
 * 세운 설명 생성
 */
function generateYearlyDescription(
  year: number,
  pillar: Pillar,
  natalInteraction: FortuneInteraction,
  usefulGodRelation: "support" | "neutral" | "against",
  score: number
): string {
  const stemKr = pillar.stemKorean;
  const branchKr = pillar.branchKorean;
  const elementKr = pillar.elementKorean;

  let desc = `${year}년은 ${stemKr}${branchKr}년으로 ${elementKr} 기운이 주도하는 해입니다. `;

  if (natalInteraction.harmonies.length > 0) {
    desc += `원국과 ${natalInteraction.harmonies.join(", ")}의 조화로운 관계가 형성됩니다. `;
  }
  if (natalInteraction.clashes.length > 0) {
    desc += `${natalInteraction.clashes.join(", ")}의 충돌이 있어 주의가 필요합니다. `;
  }

  if (usefulGodRelation === "support") {
    desc += "용신과 조화로워 전반적으로 좋은 흐름이 예상됩니다.";
  } else if (usefulGodRelation === "against") {
    desc += "용신과 상충되어 신중한 접근이 필요합니다.";
  } else {
    desc += "균형을 유지하며 꾸준히 나아가는 것이 좋습니다.";
  }

  return desc;
}

/**
 * 세운 기회 생성
 */
function generateYearlyOpportunities(
  pillar: Pillar,
  score: number,
  natalInteraction: FortuneInteraction
): string[] {
  const opportunities: string[] = [];

  const elementOpportunities: Record<Element, string[]> = {
    wood: ["새로운 프로젝트 시작", "학습과 자기계발", "인맥 확장"],
    fire: ["승진이나 인정 기회", "창의적 표현", "리더십 발휘"],
    earth: ["재산 증식", "안정적 관계 형성", "신뢰 구축"],
    metal: ["목표 달성", "결단력 있는 선택", "정리와 마무리"],
    water: ["통찰력 향상", "유연한 대처", "네트워킹"],
  };

  opportunities.push(...(elementOpportunities[pillar.element] || []).slice(0, 2));

  if (natalInteraction.harmonies.length > 0) {
    opportunities.push("원만한 대인관계");
  }

  if (score >= 70) {
    opportunities.push("새로운 시도에 유리");
  }

  return opportunities.slice(0, 3);
}

/**
 * 세운 도전 생성
 */
function generateYearlyChallenges(
  pillar: Pillar,
  score: number,
  natalInteraction: FortuneInteraction
): string[] {
  const challenges: string[] = [];

  const elementChallenges: Record<Element, string[]> = {
    wood: ["조급함 경계", "과도한 확장 주의", "집중력 유지"],
    fire: ["감정 조절", "과시욕 자제", "인내심 필요"],
    earth: ["변화에 대한 저항", "고집 주의", "새로움 수용"],
    metal: ["유연성 부족", "타인과의 마찰", "완벽주의 조절"],
    water: ["우유부단함", "현실 직시", "방향성 명확화"],
  };

  if (natalInteraction.clashes.length > 0) {
    challenges.push("충돌 관계로 인한 갈등 가능성");
  }

  challenges.push(...(elementChallenges[pillar.element] || []).slice(0, 2));

  if (score < 50) {
    challenges.push("중요 결정 신중히");
  }

  return challenges.slice(0, 3);
}

/**
 * 세운 조언 생성
 */
function generateYearlyAdvice(
  pillar: Pillar,
  usefulGodRelation: "support" | "neutral" | "against",
  score: number
): string {
  if (usefulGodRelation === "support" && score >= 70) {
    return "적극적으로 기회를 잡고 새로운 도전을 시도해보세요.";
  } else if (usefulGodRelation === "against" || score < 45) {
    return "무리한 확장보다는 내실을 다지고 기본에 충실하세요.";
  } else {
    return "균형을 유지하며 꾸준히 노력하면 좋은 결과가 있을 것입니다.";
  }
}

/**
 * 세운 키워드 생성
 */
function generateYearlyKeywords(
  pillar: Pillar,
  score: number,
  usefulGodRelation: "support" | "neutral" | "against"
): string[] {
  const keywords: string[] = [];

  // 오행별 키워드
  const elementKeywords: Record<Element, string[]> = {
    wood: ["성장", "시작", "창의"],
    fire: ["열정", "도약", "명예"],
    earth: ["안정", "신뢰", "축적"],
    metal: ["결실", "정리", "실행"],
    water: ["지혜", "변화", "소통"],
  };

  keywords.push(...(elementKeywords[pillar.element] || []).slice(0, 2));

  // 점수별 키워드
  if (score >= 75) {
    keywords.push("발전");
  } else if (score >= 60) {
    keywords.push("성장");
  } else if (score >= 45) {
    keywords.push("조화");
  } else {
    keywords.push("인내");
  }

  return keywords;
}

/**
 * 단일 연도 세운 분석
 */
export function analyzeYearlyFortune(
  year: number,
  natalBranches: { year: string; month: string; day: string; time: string },
  usefulGodElement: Element
): YearlyFortune {
  const pillar = calculateYearlyPillar(year);

  // 원국과의 관계 분석
  const natalInteraction = analyzeNatalInteraction(pillar.branch, natalBranches);

  // 용신과의 관계 분석 (pillar.element를 전달하고 relation 추출)
  const usefulGodResult = analyzeUsefulGodRelation(pillar.element, usefulGodElement);
  const usefulGodRelation = usefulGodResult.relation;

  // 점수 계산
  const score = calculateDailyScore(natalInteraction, usefulGodRelation);
  const grade = scoreToGrade(score);

  // 테마, 설명, 기회, 도전, 조언 생성
  const theme = generateYearlyTheme(pillar, natalInteraction, usefulGodRelation, score);
  const description = generateYearlyDescription(year, pillar, natalInteraction, usefulGodRelation, score);
  const opportunities = generateYearlyOpportunities(pillar, score, natalInteraction);
  const challenges = generateYearlyChallenges(pillar, score, natalInteraction);
  const advice = generateYearlyAdvice(pillar, usefulGodRelation, score);
  const keywords = generateYearlyKeywords(pillar, score, usefulGodRelation);
  const zodiacAnimal = getZodiacAnimal(year);

  return {
    year,
    pillar,
    natalInteraction,
    usefulGodRelation,
    analysis: {
      score,
      grade,
      theme,
      description,
      opportunities,
      challenges,
      advice,
    },
    keywords,
    zodiacAnimal,
  };
}

/**
 * 다년간 세운 분석 (5년 전망)
 */
export function analyzeYearlyFortuneRange(
  startYear: number,
  yearsCount: number,
  natalBranches: { year: string; month: string; day: string; time: string },
  usefulGodElement: Element
): YearlyFortuneList {
  const fortunes: YearlyFortune[] = [];

  for (let i = 0; i < yearsCount; i++) {
    const year = startYear + i;
    const fortune = analyzeYearlyFortune(year, natalBranches, usefulGodElement);
    fortunes.push(fortune);
  }

  // 가장 좋은 해와 주의할 해 찾기
  const sortedByScore = [...fortunes].sort((a, b) => b.analysis.score - a.analysis.score);
  const bestYears = sortedByScore
    .filter(f => f.analysis.score >= 65)
    .slice(0, 2)
    .map(f => f.year);
  const cautionYears = sortedByScore
    .filter(f => f.analysis.score < 50)
    .slice(-2)
    .map(f => f.year);

  return {
    currentYear: startYear,
    yearsCount,
    fortunes,
    bestYears,
    cautionYears,
  };
}

/**
 * 세운 요약 정보 반환
 */
export function getYearlyFortuneSummary(
  year: number,
  natalBranches: { year: string; month: string; day: string; time: string },
  usefulGodElement: Element
): {
  year: number;
  pillarKorean: string;
  element: Element;
  elementKorean: string;
  score: number;
  grade: FortuneGrade;
  gradeKorean: string;
  theme: string;
  zodiacAnimal: string;
} {
  const fortune = analyzeYearlyFortune(year, natalBranches, usefulGodElement);

  return {
    year: fortune.year,
    pillarKorean: `${fortune.pillar.stemKorean}${fortune.pillar.branchKorean}`,
    element: fortune.pillar.element,
    elementKorean: fortune.pillar.elementKorean,
    score: fortune.analysis.score,
    grade: fortune.analysis.grade,
    gradeKorean: gradeToKorean(fortune.analysis.grade),
    theme: fortune.analysis.theme,
    zodiacAnimal: fortune.zodiacAnimal,
  };
}
