import type { ElementType } from "@/lib/constants/guardians";
import {
  CARELINK_PRODUCTS,
  CHEONGRIUM_PROGRAMS,
  CHEONGRIUM_PRODUCTS,
  TEA_RECOMMENDATIONS,
  HEALTH_TRIGGER_KEYWORDS,
  STRESS_TRIGGER_KEYWORDS,
  RELATIONSHIP_TRIGGER_KEYWORDS,
  CAREER_TRIGGER_KEYWORDS,
  type CarelinkProduct,
  type CheongriumProgram,
  type CheongriumProduct,
  type TeaRecommendation,
  type DailyCheongiumEnergy,
} from "@/lib/constants/recommendations";

// Re-export types for external use
export type { DailyCheongiumEnergy };

// ============================================
// Types
// ============================================

export interface RecommendationResult {
  carelink: CarelinkRecommendation[];
  cheongrium: CheongriumProgramRecommendation[];
  products: CheongriumProductRecommendation[];
  tea: TeaRecommendationResult | null;
  dailyEnergy: DailyCheongiumEnergy;
}

export interface CarelinkRecommendation {
  product: CarelinkProduct;
  reason: string;
  priority: number;
}

export interface CheongriumProgramRecommendation {
  program: CheongriumProgram;
  reason: string;
  priority: number;
}

export interface CheongriumProductRecommendation {
  product: CheongriumProduct;
  reason: string;
  priority: number;
}

export interface TeaRecommendationResult {
  recommendation: TeaRecommendation;
  deficientElement: ElementType;
  reason: string;
}

// ============================================
// Mock Saju Analysis Result for Demo
// ============================================

export interface MockSajuResult {
  dominantElement: ElementType;
  deficientElement: ElementType;
  healthKeywords: string[];
  stressKeywords: string[];
  relationshipKeywords: string[];
  careerKeywords: string[];
  overallFortune: string;
}

// Generate mock saju result based on seed (date-based for consistency)
export function generateMockSajuResult(seed?: number): MockSajuResult {
  const elements: ElementType[] = ["wood", "fire", "earth", "metal", "water"];
  const actualSeed = seed ?? new Date().getDate();

  const dominantIndex = actualSeed % 5;
  const deficientIndex = (actualSeed + 2) % 5;

  const healthOptions = [
    ["건강에 신경 쓰세요", "체력 관리 필요"],
    ["면역력 약화 시기", "휴식 필요"],
    ["소화기 관리", "규칙적인 식사"],
    ["스트레스 관리", "수면 패턴 개선"],
    [],
  ];

  const stressOptions = [
    ["마음의 안정 필요", "명상 추천"],
    ["긴장 해소", "재충전 시기"],
    [],
    ["내면 탐구", "정신적 성장"],
    [],
  ];

  const relationshipOptions = [
    ["인간관계 조화", "소통 중요"],
    ["새로운 인연", "관계 확장"],
    [],
    ["갈등 해소", "화합 필요"],
    [],
  ];

  const careerOptions = [
    ["성장 기회", "도약의 시기"],
    ["사업운 상승", "적극적 행동"],
    [],
    ["안정 추구", "기반 다지기"],
    [],
  ];

  const fortuneOptions = [
    "올해는 새로운 시작과 성장의 기운이 강한 해입니다. 건강에 특별히 신경 쓰면서 적극적인 도전을 해보세요.",
    "인간관계와 소통이 중요한 시기입니다. 주변 사람들과의 화합을 통해 좋은 기회가 찾아올 수 있습니다.",
    "안정과 내실을 다지는 시기입니다. 건강 관리와 재충전에 집중하면 좋은 결과가 있을 것입니다.",
    "결단력이 필요한 시기입니다. 명확한 목표를 세우고 실행에 옮기세요. 스트레스 관리도 중요합니다.",
    "직관과 지혜가 빛나는 시기입니다. 내면의 목소리에 귀 기울이고 깊은 통찰을 얻어보세요.",
  ];

  return {
    dominantElement: elements[dominantIndex],
    deficientElement: elements[deficientIndex],
    healthKeywords: healthOptions[actualSeed % healthOptions.length],
    stressKeywords: stressOptions[actualSeed % stressOptions.length],
    relationshipKeywords: relationshipOptions[actualSeed % relationshipOptions.length],
    careerKeywords: careerOptions[actualSeed % careerOptions.length],
    overallFortune: fortuneOptions[dominantIndex],
  };
}

// ============================================
// Daily Energy Generator
// ============================================

export function generateDailyEnergy(date?: Date): DailyCheongiumEnergy {
  const targetDate = date ?? new Date();
  const dateStr = `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
  const seed = dateStr.split("-").reduce((acc, n) => acc + parseInt(n), 0);

  const elements: ElementType[] = ["wood", "fire", "earth", "metal", "water"];
  const dominantElement = elements[seed % 5];

  const directions = ["동쪽", "서쪽", "남쪽", "북쪽", "동남쪽", "서남쪽", "동북쪽", "서북쪽"];
  const luckyDirections = [
    directions[seed % directions.length],
    directions[(seed + 3) % directions.length],
  ];

  const activitiesMap: Record<ElementType, string[]> = {
    wood: ["산책", "독서", "새로운 시작", "창작 활동"],
    fire: ["사교 활동", "발표", "적극적 행동", "네트워킹"],
    earth: ["정리정돈", "계획 수립", "저축", "건강 관리"],
    metal: ["결단", "마무리", "청소", "명확한 소통"],
    water: ["명상", "학습", "내면 탐구", "직관 따르기"],
  };

  const messagesMap: Record<ElementType, string[]> = {
    wood: [
      "성장과 새로운 시작의 기운이 청리움에서 흘러나오고 있습니다",
      "창의력과 도전 정신이 빛나는 날입니다",
    ],
    fire: [
      "열정과 활력의 에너지가 가득한 하루입니다",
      "인간관계와 소통에 좋은 기운이 감돕니다",
    ],
    earth: [
      "안정적이고 평화로운 에너지의 날입니다",
      "기반을 다지고 내실을 쌓기 좋은 날입니다",
    ],
    metal: [
      "명확함과 결단의 기운이 흐르는 날입니다",
      "정리와 마무리에 좋은 에너지입니다",
    ],
    water: [
      "직관과 통찰의 에너지가 강한 날입니다",
      "내면의 평화와 지혜를 얻기 좋은 날입니다",
    ],
  };

  const program = CHEONGRIUM_PROGRAMS[dominantElement];
  const energyScore = 70 + (seed % 30); // 70-99 range

  return {
    date: dateStr,
    dominantElement,
    energyScore,
    luckyDirections,
    recommendedActivities: activitiesMap[dominantElement].slice(0, 3),
    message: messagesMap[dominantElement][seed % 2],
    cheongiumProgramMatch: {
      program: program.name,
      reason: `오늘의 ${getElementName(dominantElement)} 기운과 어울리는 프로그램입니다`,
      bookingUrl: program.bookingUrl,
    },
  };
}

// ============================================
// Recommendation Engine
// ============================================

export function generateRecommendations(
  sajuResult: MockSajuResult,
  dailyEnergy?: DailyCheongiumEnergy
): RecommendationResult {
  const energy = dailyEnergy ?? generateDailyEnergy();

  // Generate Carelink recommendations
  const carelinkRecs = generateCarelinkRecommendations(sajuResult);

  // Generate Cheongrium program recommendations
  const programRecs = generateProgramRecommendations(sajuResult, energy);

  // Generate Cheongrium product recommendations
  const productRecs = generateProductRecommendations(sajuResult);

  // Generate tea recommendation
  const teaRec = generateTeaRecommendation(sajuResult);

  return {
    carelink: carelinkRecs,
    cheongrium: programRecs,
    products: productRecs,
    tea: teaRec,
    dailyEnergy: energy,
  };
}

function generateCarelinkRecommendations(
  sajuResult: MockSajuResult
): CarelinkRecommendation[] {
  const recommendations: CarelinkRecommendation[] = [];
  const allKeywords = [
    ...sajuResult.healthKeywords,
    ...sajuResult.stressKeywords,
    sajuResult.overallFortune,
  ].join(" ");

  // Check each Carelink product
  for (const [_, product] of Object.entries(CARELINK_PRODUCTS)) {
    const matchingKeywords = product.targetKeywords.filter((keyword) =>
      allKeywords.includes(keyword)
    );

    if (matchingKeywords.length > 0 || sajuResult.healthKeywords.length > 0) {
      let reason = "";
      let priority = matchingKeywords.length;

      if (product.id === "genetic_comprehensive") {
        reason = "사주 분석에서 건강 관리의 중요성이 나타났습니다. 유전자 검사로 선제적 건강 관리를 시작해보세요.";
        priority = sajuResult.healthKeywords.length > 0 ? 10 : 5;
      } else if (product.id === "gut_microbiome") {
        reason = "소화기 건강과 면역력에 신경 쓰면 좋은 시기입니다. 장내 환경을 체크해보세요.";
        priority = allKeywords.includes("소화") ? 8 : 3;
      } else if (product.id === "nutrition_genetic") {
        reason = "체력과 에너지 관리가 중요한 시기입니다. 맞춤 영양 가이드를 받아보세요.";
        priority = allKeywords.includes("피로") || allKeywords.includes("체력") ? 7 : 2;
      } else if (product.id === "skin_genetic") {
        reason = "외모와 관련된 기운이 감지됩니다. 피부 유전자 분석으로 맞춤 케어를 시작하세요.";
        priority = 1;
      }

      recommendations.push({ product, reason, priority });
    }
  }

  // Sort by priority and return top 2
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 2);
}

function generateProgramRecommendations(
  sajuResult: MockSajuResult,
  dailyEnergy: DailyCheongiumEnergy
): CheongriumProgramRecommendation[] {
  const recommendations: CheongriumProgramRecommendation[] = [];

  // Primary recommendation based on dominant element
  const dominantProgram = CHEONGRIUM_PROGRAMS[sajuResult.dominantElement];
  recommendations.push({
    program: dominantProgram,
    reason: `${getGuardianName(sajuResult.dominantElement)}의 기운을 강화하는 프로그램입니다`,
    priority: 10,
  });

  // Stress-related recommendation
  if (sajuResult.stressKeywords.length > 0) {
    const stressProgram = CHEONGRIUM_PROGRAMS.water; // Singing bowl for stress
    if (stressProgram.id !== dominantProgram.id) {
      recommendations.push({
        program: stressProgram,
        reason: "마음의 안정과 스트레스 해소에 도움이 되는 프로그램입니다",
        priority: 8,
      });
    }
  }

  // Relationship-related recommendation
  if (sajuResult.relationshipKeywords.length > 0) {
    const relationshipProgram = CHEONGRIUM_PROGRAMS.fire; // Tea ceremony
    if (!recommendations.find((r) => r.program.id === relationshipProgram.id)) {
      recommendations.push({
        program: relationshipProgram,
        reason: "인간관계 조화와 소통에 도움이 되는 프로그램입니다",
        priority: 7,
      });
    }
  }

  // Daily energy based recommendation
  const dailyProgram = CHEONGRIUM_PROGRAMS[dailyEnergy.dominantElement];
  if (!recommendations.find((r) => r.program.id === dailyProgram.id)) {
    recommendations.push({
      program: dailyProgram,
      reason: `오늘의 ${getElementName(dailyEnergy.dominantElement)} 기운과 조화로운 프로그램입니다`,
      priority: 6,
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 2);
}

function generateProductRecommendations(
  sajuResult: MockSajuResult
): CheongriumProductRecommendation[] {
  const recommendations: CheongriumProductRecommendation[] = [];

  for (const product of CHEONGRIUM_PRODUCTS) {
    if (
      product.targetElements.includes(sajuResult.dominantElement) ||
      product.targetElements.includes(sajuResult.deficientElement)
    ) {
      let reason = "";
      let priority = 5;

      if (product.targetElements.includes(sajuResult.dominantElement)) {
        reason = `${getElementName(sajuResult.dominantElement)} 기운을 강화해주는 제품입니다`;
        priority = 8;
      } else {
        reason = `부족한 ${getElementName(sajuResult.deficientElement)} 기운을 보충해주는 제품입니다`;
        priority = 7;
      }

      recommendations.push({ product, reason, priority });
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

function generateTeaRecommendation(
  sajuResult: MockSajuResult
): TeaRecommendationResult | null {
  const deficientKey = `${sajuResult.deficientElement}_deficiency`;
  const recommendation = TEA_RECOMMENDATIONS[deficientKey];

  if (!recommendation) return null;

  return {
    recommendation,
    deficientElement: sajuResult.deficientElement,
    reason: `부족한 ${getElementName(sajuResult.deficientElement)} 기운을 보충하기 위한 차입니다`,
  };
}

// ============================================
// Helper Functions
// ============================================

function getElementName(element: ElementType): string {
  const names: Record<ElementType, string> = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)",
  };
  return names[element];
}

function getGuardianName(element: ElementType): string {
  const names: Record<ElementType, string> = {
    wood: "청룡",
    fire: "주작",
    earth: "황룡",
    metal: "백호",
    water: "현무",
  };
  return names[element];
}

// Export helper functions
export { getElementName, getGuardianName };
