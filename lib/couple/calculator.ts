/**
 * 연인 궁합 계산기 (Couple Compatibility Calculator)
 * 두 사람의 사주를 비교하여 연인/부부 궁합 분석
 */

import type { Element, Pillar } from "@/lib/saju/types";
import type {
  PersonInfo,
  CoupleCompatibilityResult,
  CoupleCompatibilityGrade,
  SimplePillar,
  CoupleRelationType,
} from "./types";
import { calculateSaju } from "@/lib/saju";
import { getLongitudeByCity } from "@/lib/saju/solar-time";
import {
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_PRODUCES,
  ELEMENT_CONTROLS,
  ELEMENT_KOREAN,
} from "@/lib/saju/constants";

function calculateElementScores(pillars: (SimplePillar | Pillar)[]): Record<Element, number> {
  const scores: Record<Element, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };

  for (const pillar of pillars) {
    if (pillar.gan) {
      scores[STEM_ELEMENTS[pillar.gan]] += 2;
    }
    if (pillar.zhi) {
      scores[BRANCH_ELEMENTS[pillar.zhi]] += 1;
    }
  }

  return scores;
}

function analyzeElementRelation(element1: Element, element2: Element): string {
  if (element1 === element2) {
    return "비화(比和) - 조화로움";
  }
  if (ELEMENT_PRODUCES[element1] === element2) {
    return "상생(相生) - 내가 도움";
  }
  if (ELEMENT_PRODUCES[element2] === element1) {
    return "상생(相生) - 도움 받음";
  }
  if (ELEMENT_CONTROLS[element1] === element2) {
    return "상극(相剋) - 내가 제어";
  }
  if (ELEMENT_CONTROLS[element2] === element1) {
    return "상극(相剋) - 제어 받음";
  }
  return "중립";
}

function getGrade(score: number): { grade: CoupleCompatibilityGrade; text: string } {
  if (score >= 90) return { grade: "soulmate", text: "천생연분 (天生緣分)" };
  if (score >= 75) return { grade: "excellent", text: "최상의 궁합 (最上)" };
  if (score >= 60) return { grade: "good", text: "좋은 인연 (良緣)" };
  if (score >= 45) return { grade: "normal", text: "보통 인연 (普通)" };
  return { grade: "challenging", text: "노력 필요 (努力)" };
}

function getRelationTypeKorean(type?: CoupleRelationType): string {
  switch (type) {
    case "dating": return "연인";
    case "engaged": return "약혼자";
    case "married": return "배우자";
    case "interested": return "관심 상대";
    case "exPartner": return "전 연인";
    default: return "연인";
  }
}

export function calculateCoupleCompatibility(
  person1: PersonInfo,
  person2: PersonInfo,
  relationType?: CoupleRelationType
): CoupleCompatibilityResult {
  const person1Saju = calculateSaju({
    year: person1.year,
    month: person1.month,
    day: person1.day,
    hour: person1.hour,
    minute: person1.minute,
    gender: person1.gender,
    isLunar: person1.isLunar,
    longitude: getLongitudeByCity(person1.city),
  });

  const person2Saju = calculateSaju({
    year: person2.year,
    month: person2.month,
    day: person2.day,
    hour: person2.hour,
    minute: person2.minute,
    gender: person2.gender,
    isLunar: person2.isLunar,
    longitude: getLongitudeByCity(person2.city),
  });

  const person1Pillars = [
    person1Saju.pillars.year,
    person1Saju.pillars.month,
    person1Saju.pillars.day,
    person1Saju.pillars.time,
  ];
  const person2Pillars = [
    person2Saju.pillars.year,
    person2Saju.pillars.month,
    person2Saju.pillars.day,
    person2Saju.pillars.time,
  ];

  const person1Scores = calculateElementScores(person1Pillars);
  const person2Scores = calculateElementScores(person2Pillars);

  const person1DayElement = person1Saju.dayMasterElement;
  const person2DayElement = person2Saju.dayMasterElement;

  const elementCompatibility: Record<Element, string> = {
    wood: "", fire: "", earth: "", metal: "", water: "",
  };

  for (const element of ["wood", "fire", "earth", "metal", "water"] as Element[]) {
    if (person1Scores[element] > 0 || person2Scores[element] > 0) {
      elementCompatibility[element] = analyzeElementRelation(person1DayElement, element);
    }
  }

  // 연인 궁합 점수 계산 (55점 시작 - 더 관대한 시작점)
  let baseScore = 55;

  // 일간 관계 점수 (최대 ±30점)
  const dayRelation = analyzeElementRelation(person1DayElement, person2DayElement);
  if (dayRelation.includes("조화")) baseScore += 25;
  else if (dayRelation.includes("도움 받음")) baseScore += 30;
  else if (dayRelation.includes("내가 도움")) baseScore += 20;
  else if (dayRelation.includes("제어 받음")) baseScore -= 10;
  else if (dayRelation.includes("내가 제어")) baseScore -= 5;

  // 년지 삼합 체크 (+20점) - 연인 궁합에서 더 중요
  const person1YearZhi = person1Saju.pillars.year.zhi;
  const person2YearZhi = person2Saju.pillars.year.zhi;

  const samhapGroups = [
    ["寅", "午", "戌"],
    ["申", "子", "辰"],
    ["亥", "卯", "未"],
    ["巳", "酉", "丑"],
  ];

  for (const group of samhapGroups) {
    if (group.includes(person1YearZhi) && group.includes(person2YearZhi)) {
      baseScore += 20;
      break;
    }
  }

  // 육합 체크 (+15점) - 연인에게 매우 좋은 인연
  const yukHapPairs = [
    ["子", "丑"], ["寅", "亥"], ["卯", "戌"],
    ["辰", "酉"], ["巳", "申"], ["午", "未"],
  ];

  for (const pair of yukHapPairs) {
    if (
      (pair[0] === person1YearZhi && pair[1] === person2YearZhi) ||
      (pair[1] === person1YearZhi && pair[0] === person2YearZhi)
    ) {
      baseScore += 15;
      break;
    }
  }

  // 일지 궁합 (결혼운)
  const person1DayZhi = person1Saju.pillars.day.zhi;
  const person2DayZhi = person2Saju.pillars.day.zhi;

  for (const pair of yukHapPairs) {
    if (
      (pair[0] === person1DayZhi && pair[1] === person2DayZhi) ||
      (pair[1] === person1DayZhi && pair[0] === person2DayZhi)
    ) {
      baseScore += 10;
      break;
    }
  }

  // 오행 균형 보완 (+10점)
  const person1Dominant = person1Saju.elementAnalysis.dominant?.[0];
  const person2Dominant = person2Saju.elementAnalysis.dominant?.[0];
  const person1Lacking = person1Saju.elementAnalysis.lacking?.[0];
  const person2Lacking = person2Saju.elementAnalysis.lacking?.[0];

  if (person1Lacking && person2Scores[person1Lacking] > 2) {
    baseScore += 5;
  }
  if (person2Lacking && person1Scores[person2Lacking] > 2) {
    baseScore += 5;
  }

  const finalScore = Math.max(25, Math.min(100, baseScore));
  const { grade, text: gradeText } = getGrade(finalScore);

  // 세부 분석 점수
  const romanceScore = Math.min(100, Math.max(25, baseScore + Math.floor(Math.random() * 16) - 8));
  const communicationScore = Math.min(100, Math.max(25, baseScore + Math.floor(Math.random() * 14) - 7));
  const passionScore = Math.min(100, Math.max(25, baseScore + Math.floor(Math.random() * 20) - 10));
  const stabilityScore = Math.min(100, Math.max(25, baseScore + Math.floor(Math.random() * 12) - 6));
  const futureScore = Math.min(100, Math.max(25, baseScore + Math.floor(Math.random() * 18) - 9));

  const relationshipAdvice: string[] = [];
  const cautions: string[] = [];
  const relationKorean = getRelationTypeKorean(relationType);

  // 행운 오행 계산
  const luckyElements: Element[] = [];
  if (person1Lacking) luckyElements.push(person1Lacking);
  if (person2Lacking && !luckyElements.includes(person2Lacking)) {
    luckyElements.push(person2Lacking);
  }
  if (luckyElements.length === 0) {
    luckyElements.push("earth"); // 기본 안정의 토
  }

  // 좋은 날 추천
  const bestDates = ["삼합일", "육합일", "천덕일"];

  if (finalScore >= 75) {
    relationshipAdvice.push(`${person2.name}님과 매우 좋은 ${relationKorean} 인연입니다.`);
    relationshipAdvice.push("서로를 존중하며 깊은 사랑을 키워갈 수 있습니다.");
    relationshipAdvice.push("결혼을 고려해도 좋은 궁합입니다.");

    if (dayRelation.includes("도움 받음")) {
      relationshipAdvice.push(`${person2.name}님의 ${ELEMENT_KOREAN[person2DayElement]} 기운이 당신에게 큰 힘이 됩니다.`);
    }
  } else if (finalScore >= 60) {
    relationshipAdvice.push("서로 노력하면 좋은 관계를 유지할 수 있습니다.");
    relationshipAdvice.push("대화와 이해가 관계 발전의 열쇠입니다.");
    relationshipAdvice.push("서로의 차이를 인정하고 배려하세요.");
  } else if (finalScore >= 45) {
    relationshipAdvice.push("서로 다른 성향을 이해하는 노력이 필요합니다.");
    relationshipAdvice.push("갈등이 생길 때 대화로 해결하세요.");
    cautions.push("감정적인 대응보다 이성적인 대화를 권장합니다.");
  } else {
    cautions.push("서로 다른 가치관으로 충돌이 있을 수 있습니다.");
    cautions.push("장기적인 관계를 위해 많은 노력이 필요합니다.");
    relationshipAdvice.push("서로의 차이를 인정하고 존중하는 것이 중요합니다.");
  }

  if (dayRelation.includes("극")) {
    cautions.push("감정 표현 시 오해가 생기기 쉬우니 솔직하게 대화하세요.");
  }

  // 보완 관계 조언
  if (person1Lacking && person2Scores[person1Lacking] > 2) {
    relationshipAdvice.push(
      `${person2.name}님의 ${ELEMENT_KOREAN[person1Lacking]} 기운이 당신의 부족한 부분을 채워줍니다.`
    );
  }

  // 관계 유형별 조언
  switch (relationType) {
    case "married":
      if (finalScore >= 60) {
        relationshipAdvice.push("서로의 가정 역할을 존중하며 화목한 가정을 이룰 수 있습니다.");
      } else {
        cautions.push("배우자와의 소통에 더 많은 노력을 기울이세요.");
      }
      break;
    case "engaged":
      if (finalScore >= 70) {
        relationshipAdvice.push("결혼 후에도 좋은 관계를 유지할 수 있는 궁합입니다.");
      }
      break;
    case "dating":
      if (finalScore >= 65) {
        relationshipAdvice.push("앞으로의 발전 가능성이 높은 관계입니다.");
      }
      break;
    case "interested":
      if (finalScore >= 55) {
        relationshipAdvice.push("적극적으로 다가가 보세요. 좋은 인연이 될 수 있습니다.");
      }
      break;
  }

  return {
    score: finalScore,
    grade,
    gradeText,
    elementBalance: {
      person1: person1Scores,
      person2: person2Scores,
      compatibility: elementCompatibility,
    },
    analysis: {
      romance: {
        score: romanceScore,
        description: romanceScore >= 70
          ? "서로에게 강한 끌림과 사랑을 느끼는 관계입니다."
          : romanceScore >= 50
            ? "로맨스를 키워나갈 수 있는 관계입니다."
            : "로맨틱한 감정을 표현하는 노력이 필요합니다.",
      },
      communication: {
        score: communicationScore,
        description: communicationScore >= 70
          ? "마음이 잘 통하는 관계입니다."
          : communicationScore >= 50
            ? "대화를 통해 서로를 이해할 수 있습니다."
            : "오해가 생기지 않도록 솔직하게 대화하세요.",
      },
      passion: {
        score: passionScore,
        description: passionScore >= 70
          ? "뜨거운 열정이 넘치는 관계입니다."
          : passionScore >= 50
            ? "함께 있을 때 설렘을 느낄 수 있습니다."
            : "관계에 활력을 불어넣는 노력이 필요합니다.",
      },
      stability: {
        score: stabilityScore,
        description: stabilityScore >= 70
          ? "안정적이고 편안한 관계를 유지할 수 있습니다."
          : stabilityScore >= 50
            ? "시간이 지나며 안정감이 생깁니다."
            : "관계의 안정을 위해 신뢰를 쌓아가세요.",
      },
      future: {
        score: futureScore,
        description: futureScore >= 70
          ? "함께 아름다운 미래를 그려갈 수 있습니다."
          : futureScore >= 50
            ? "노력하면 좋은 미래를 만들 수 있습니다."
            : "장기적인 계획에 대해 함께 대화하세요.",
      },
    },
    relationshipAdvice,
    cautions,
    luckyElements,
    bestDates,
    person1Pillars: {
      year: { gan: person1Saju.pillars.year.gan, zhi: person1Saju.pillars.year.zhi },
      month: { gan: person1Saju.pillars.month.gan, zhi: person1Saju.pillars.month.zhi },
      day: { gan: person1Saju.pillars.day.gan, zhi: person1Saju.pillars.day.zhi },
      time: { gan: person1Saju.pillars.time.gan, zhi: person1Saju.pillars.time.zhi },
    },
    person2Pillars: {
      year: { gan: person2Saju.pillars.year.gan, zhi: person2Saju.pillars.year.zhi },
      month: { gan: person2Saju.pillars.month.gan, zhi: person2Saju.pillars.month.zhi },
      day: { gan: person2Saju.pillars.day.gan, zhi: person2Saju.pillars.day.zhi },
      time: { gan: person2Saju.pillars.time.gan, zhi: person2Saju.pillars.time.zhi },
    },
    person1Name: person1.name,
    person2Name: person2.name,
    relationType,
  };
}
