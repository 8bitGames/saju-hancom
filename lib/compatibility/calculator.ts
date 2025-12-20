/**
 * 사람 간 궁합 계산기 (Person-to-Person Compatibility Calculator)
 * 두 사람의 사주를 비교하여 직장 내 궁합 분석
 */

import type { Element, Gan, Zhi, SajuResult, Pillar } from "@/lib/saju/types";
import type {
  PersonInfo,
  PersonCompatibilityResult,
  CompatibilityGrade,
  SimplePillar,
  RelationType,
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

/**
 * 사주에서 오행 점수 계산
 */
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

/**
 * 오행 상생상극 관계 분석
 */
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

/**
 * 궁합 등급 결정
 */
function getGrade(score: number): { grade: CompatibilityGrade; text: string } {
  if (score >= 85) return { grade: "excellent", text: "천생연분 (天生緣分)" };
  if (score >= 70) return { grade: "good", text: "좋은 인연 (良緣)" };
  if (score >= 55) return { grade: "normal", text: "보통 인연 (普通緣)" };
  if (score >= 40) return { grade: "caution", text: "노력 필요 (努力)" };
  return { grade: "challenging", text: "도전적 인연 (挑戰)" };
}

/**
 * 관계 유형 한글 변환
 */
function getRelationTypeKorean(type?: RelationType): string {
  switch (type) {
    case "colleague": return "동료";
    case "supervisor": return "상사";
    case "subordinate": return "부하";
    case "partner": return "파트너";
    case "client": return "고객";
    case "mentor": return "멘토";
    case "mentee": return "멘티";
    default: return "동료";
  }
}

/**
 * 두 사람 간 궁합 계산
 */
export function calculatePersonCompatibility(
  person1: PersonInfo,
  person2: PersonInfo,
  relationType?: RelationType
): PersonCompatibilityResult {
  // 두 사람의 사주 계산
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

  // 오행 점수 계산
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

  // 일간 기준 오행 관계 분석
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

  // 기본 점수 계산 (50점 시작)
  let baseScore = 50;

  // 일간 관계 점수 (최대 ±25점)
  const dayRelation = analyzeElementRelation(person1DayElement, person2DayElement);
  if (dayRelation.includes("조화")) baseScore += 20;
  else if (dayRelation.includes("도움 받음")) baseScore += 25;
  else if (dayRelation.includes("내가 도움")) baseScore += 15;
  else if (dayRelation.includes("제어 받음")) baseScore -= 15;
  else if (dayRelation.includes("내가 제어")) baseScore -= 5;

  // 년지 삼합 체크 (+15점)
  const person1YearZhi = person1Saju.pillars.year.zhi;
  const person2YearZhi = person2Saju.pillars.year.zhi;

  const samhapGroups = [
    ["寅", "午", "戌"], // 화국
    ["申", "子", "辰"], // 수국
    ["亥", "卯", "未"], // 목국
    ["巳", "酉", "丑"], // 금국
  ];

  for (const group of samhapGroups) {
    if (group.includes(person1YearZhi) && group.includes(person2YearZhi)) {
      baseScore += 15;
      break;
    }
  }

  // 육합 체크 (+10점)
  const yukHapPairs = [
    ["子", "丑"], ["寅", "亥"], ["卯", "戌"],
    ["辰", "酉"], ["巳", "申"], ["午", "未"],
  ];

  for (const pair of yukHapPairs) {
    if (
      (pair[0] === person1YearZhi && pair[1] === person2YearZhi) ||
      (pair[1] === person1YearZhi && pair[0] === person2YearZhi)
    ) {
      baseScore += 10;
      break;
    }
  }

  // 오행 균형 점수 (최대 ±10점)
  const person1Dominant = person1Saju.elementAnalysis.dominant?.[0];
  const person2Dominant = person2Saju.elementAnalysis.dominant?.[0];

  if (person1Dominant && person2Dominant) {
    if (person1Dominant === person2Dominant) {
      baseScore += 5; // 같은 오행이 강함 - 비화
    } else if (ELEMENT_PRODUCES[person1Dominant] === person2Dominant) {
      baseScore += 10; // 내가 상대를 생함
    } else if (ELEMENT_PRODUCES[person2Dominant] === person1Dominant) {
      baseScore += 10; // 상대가 나를 생함
    } else if (ELEMENT_CONTROLS[person1Dominant] === person2Dominant) {
      baseScore -= 5; // 내가 상대를 극함
    } else if (ELEMENT_CONTROLS[person2Dominant] === person1Dominant) {
      baseScore -= 8; // 상대가 나를 극함
    }
  }

  // 점수 범위 제한
  const finalScore = Math.max(20, Math.min(100, baseScore));
  const { grade, text: gradeText } = getGrade(finalScore);

  // 세부 분석 점수 (약간의 변동 추가)
  const communicationScore = Math.min(100, Math.max(20, baseScore + Math.floor(Math.random() * 16) - 8));
  const collaborationScore = Math.min(100, Math.max(20, baseScore + Math.floor(Math.random() * 16) - 8));
  const trustScore = Math.min(100, Math.max(20, baseScore + Math.floor(Math.random() * 12) - 6));
  const growthScore = Math.min(100, Math.max(20, baseScore + Math.floor(Math.random() * 20) - 10));

  // 관계 조언 및 주의사항 생성
  const relationshipAdvice: string[] = [];
  const cautions: string[] = [];
  const relationKorean = getRelationTypeKorean(relationType);

  if (finalScore >= 70) {
    relationshipAdvice.push(`${person2.name}님과 좋은 ${relationKorean} 관계를 맺을 수 있습니다.`);
    relationshipAdvice.push("서로의 강점을 살려 시너지를 낼 수 있는 조합입니다.");

    if (dayRelation.includes("도움 받음")) {
      relationshipAdvice.push(`${person2.name}님의 ${ELEMENT_KOREAN[person2DayElement]} 기운이 도움이 됩니다.`);
    }
  } else if (finalScore >= 55) {
    relationshipAdvice.push("무난한 관계입니다. 서로 이해하려는 노력이 필요합니다.");
    relationshipAdvice.push("각자의 역할을 명확히 하면 좋은 협업이 가능합니다.");
  } else {
    cautions.push("서로 다른 성향으로 의견 충돌이 있을 수 있습니다.");
    relationshipAdvice.push("서로의 차이를 인정하고 존중하는 것이 중요합니다.");
  }

  if (dayRelation.includes("극")) {
    cautions.push("의사소통 시 오해가 생기기 쉬우니 명확하게 전달하세요.");
  }

  // 보완 관계 조언
  const person1Lacking = person1Saju.elementAnalysis.lacking?.[0];
  const person2Lacking = person2Saju.elementAnalysis.lacking?.[0];

  if (person1Lacking && person2Scores[person1Lacking] > 2) {
    relationshipAdvice.push(
      `${person2.name}님의 ${ELEMENT_KOREAN[person1Lacking]} 기운이 당신의 부족한 부분을 보완해줍니다.`
    );
  }

  if (person2Lacking && person1Scores[person2Lacking] > 2) {
    relationshipAdvice.push(
      `당신의 ${ELEMENT_KOREAN[person2Lacking]} 기운이 ${person2.name}님에게 도움이 됩니다.`
    );
  }

  // 관계 유형별 추가 조언
  switch (relationType) {
    case "supervisor":
      if (finalScore >= 60) {
        relationshipAdvice.push("상사의 지시를 잘 이해하고 따를 수 있는 관계입니다.");
      } else {
        cautions.push("상사의 스타일에 적응하는 데 시간이 필요할 수 있습니다.");
      }
      break;
    case "subordinate":
      if (finalScore >= 60) {
        relationshipAdvice.push("부하직원을 잘 이끌 수 있는 관계입니다.");
      } else {
        cautions.push("명확한 피드백과 소통이 중요합니다.");
      }
      break;
    case "partner":
      if (finalScore >= 70) {
        relationshipAdvice.push("함께 프로젝트를 진행하기에 좋은 파트너입니다.");
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
      communication: {
        score: communicationScore,
        description: communicationScore >= 70
          ? "원활한 의사소통이 가능한 관계입니다."
          : communicationScore >= 50
            ? "서로 이해하려는 노력이 필요합니다."
            : "오해가 생기지 않도록 명확히 소통하세요.",
      },
      collaboration: {
        score: collaborationScore,
        description: collaborationScore >= 70
          ? "함께 일하기 좋은 조합입니다."
          : collaborationScore >= 50
            ? "역할 분담을 명확히 하면 좋습니다."
            : "협업 시 조율이 필요합니다.",
      },
      trust: {
        score: trustScore,
        description: trustScore >= 70
          ? "신뢰를 쌓기 좋은 관계입니다."
          : trustScore >= 50
            ? "시간이 지나면 신뢰가 쌓입니다."
            : "신뢰 구축에 노력이 필요합니다.",
      },
      growth: {
        score: growthScore,
        description: growthScore >= 70
          ? "서로의 성장에 도움이 되는 관계입니다."
          : growthScore >= 50
            ? "함께 성장할 수 있는 가능성이 있습니다."
            : "각자의 방식으로 성장하는 것이 좋습니다.",
      },
    },
    relationshipAdvice,
    cautions,
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
