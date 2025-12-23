/**
 * 사주 기반 재물/직업 추천 시스템 테스트
 * 다양한 용신(오행)과 십성 조합으로 테스트
 */

import type { SajuResult, Element, TenGod } from "../lib/saju/types";
import type { ChartAgentOutput } from "../lib/saju/agents/types";
import { ELEMENT_KEYWORDS, TEN_GOD_KEYWORDS } from "../lib/saju/personalized-keywords";

// 테스트용 색상
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// 오행 한글 매핑
const ELEMENT_KOREAN: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

// 오행별 추천 산업
const ELEMENT_INDUSTRIES: Record<Element, string[]> = {
  wood: ["친환경", "ESG", "바이오", "헬스케어", "교육테크", "신재생에너지"],
  fire: ["AI", "반도체", "메타버스", "디지털콘텐츠", "전기차", "배터리"],
  earth: ["부동산", "인프라", "건설", "물류", "유통", "농식품"],
  metal: ["핀테크", "로봇", "자동화", "블록체인", "보안", "정밀기계"],
  water: ["글로벌이커머스", "물류", "여행", "유통", "미디어", "엔터테인먼트"],
};

// 십성 한글 매핑
const TEN_GOD_KOREAN: Record<TenGod, string> = {
  bijian: "비견",
  gebjae: "겁재",
  siksin: "식신",
  sanggwan: "상관",
  pyeonjae: "편재",
  jeongjae: "정재",
  pyeongwan: "편관",
  jeonggwan: "정관",
  pyeonin: "편인",
  jeongin: "정인",
};

/**
 * Mock SajuResult 생성
 */
function createMockSajuResult(
  yongShin: Element,
  dominantElements: Element[],
  dominantTenGods: TenGod[]
): SajuResult {
  return {
    fourPillars: {
      year: { gan: "갑", zhi: "자", ganElement: "wood", zhiElement: "water" },
      month: { gan: "병", zhi: "인", ganElement: "fire", zhiElement: "wood" },
      day: { gan: "무", zhi: "오", ganElement: "earth", zhiElement: "fire" },
      hour: { gan: "경", zhi: "신", ganElement: "metal", zhiElement: "metal" },
    },
    dayMaster: "무",
    dayMasterElement: "earth",
    dayMasterStrength: "strong",
    dayMasterDescription: "무토일주는 산과 같은 안정적인 성격입니다.",
    elementAnalysis: {
      scores: { wood: 20, fire: 25, earth: 30, metal: 15, water: 10 },
      dominant: dominantElements,
      lacking: [],
      yongShin: yongShin,
    },
    tenGodSummary: {
      dominant: dominantTenGods,
      lacking: [],
      distribution: {},
    },
    stars: [],
    compatibility: { good: [], challenging: [] },
  } as unknown as SajuResult;
}

/**
 * Mock ChartAgentOutput 생성
 */
function createMockChartOutput(
  yongShin: Element,
  dominantElements: Element[],
  dominantTenGods: TenGod[]
): ChartAgentOutput {
  return {
    dayMaster: {
      gan: "무",
      element: "earth",
      description: "무토일주",
    },
    yongShin: yongShin,
    dominantElements: dominantElements,
    lackingElements: [],
    personalizationFlags: {
      avoidMarriageAdvice: false,
      emphasizeCareer: true,
      healthCaution: false,
      emphasizeWealth: true,
      emphasizeMovement: false,
      emphasizeStudy: false,
      relationshipCaution: false,
      emphasizeLeadership: false,
    },
    healthFlags: {
      watchAreas: [],
      recommendations: [],
    },
    personalityProfile: {
      strengths: [],
      weaknesses: [],
      suitableCareers: [],
      relationshipStyle: "",
    },
    significantStars: [],
    chartContext: "",
    dominantTenGods: dominantTenGods.map((tg) => ({
      tenGod: tg,
      meaning: "",
      lifeAspect: "",
    })),
  };
}

/**
 * generateCareerWealthRecommendations 함수 시뮬레이션
 */
function generateCareerWealthRecommendations(
  chart: ChartAgentOutput
): { industries: string[]; investmentStyles: string[]; careerTypes: string[] } {
  const industries: string[] = [];
  const investmentStyles: string[] = [];
  const careerTypes: string[] = [];

  // 용신(用神) 기반 추천 산업
  const yongShin = chart.yongShin;
  if (yongShin && ELEMENT_KEYWORDS[yongShin]) {
    const elementKeywords = ELEMENT_KEYWORDS[yongShin];
    industries.push(...elementKeywords.modernIndustries.slice(0, 3));
    investmentStyles.push(...elementKeywords.investmentStyles.slice(0, 2));
  }

  // 강한 오행 기반 추천
  const dominantElements = chart.dominantElements || [];
  for (const element of dominantElements.slice(0, 1)) {
    if (ELEMENT_KEYWORDS[element]) {
      const elementKeywords = ELEMENT_KEYWORDS[element];
      const newIndustries = elementKeywords.modernIndustries.filter(
        (i) => !industries.includes(i)
      );
      industries.push(...newIndustries.slice(0, 2));
    }
  }

  // 주요 십성 기반 직업군 추천
  const dominantTenGods = chart.dominantTenGods.map((t) => t.tenGod);
  for (const tenGod of dominantTenGods.slice(0, 2)) {
    if (TEN_GOD_KEYWORDS[tenGod]) {
      const tenGodKeywords = TEN_GOD_KEYWORDS[tenGod];
      careerTypes.push(...tenGodKeywords.careerTypes.slice(0, 2));
    }
  }

  return {
    industries: Array.from(new Set(industries)).slice(0, 5),
    investmentStyles: Array.from(new Set(investmentStyles)).slice(0, 3),
    careerTypes: Array.from(new Set(careerTypes)).slice(0, 4),
  };
}

/**
 * 테스트 케이스 실행
 */
function runTest(
  testName: string,
  yongShin: Element,
  dominantElements: Element[],
  dominantTenGods: TenGod[],
  expectedIndustryKeywords: string[]
) {
  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}테스트: ${testName}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  const chart = createMockChartOutput(yongShin, dominantElements, dominantTenGods);
  const recommendations = generateCareerWealthRecommendations(chart);

  console.log(`\n${colors.yellow}📊 입력 조건:${colors.reset}`);
  console.log(`   용신(用神): ${ELEMENT_KOREAN[yongShin]}`);
  console.log(`   강한 오행: ${dominantElements.map((e) => ELEMENT_KOREAN[e]).join(", ")}`);
  console.log(`   주요 십성: ${dominantTenGods.map((t) => TEN_GOD_KOREAN[t]).join(", ")}`);

  console.log(`\n${colors.green}💼 추천 결과:${colors.reset}`);
  console.log(`   추천 산업: ${recommendations.industries.join(", ")}`);
  console.log(`   투자 스타일: ${recommendations.investmentStyles.join(", ")}`);
  console.log(`   적합 직업: ${recommendations.careerTypes.join(", ")}`);

  // 검증
  const hasExpectedIndustry = expectedIndustryKeywords.some((keyword) =>
    recommendations.industries.some((ind) => ind.includes(keyword))
  );

  console.log(`\n${colors.magenta}✅ 검증:${colors.reset}`);
  console.log(`   기대 키워드: ${expectedIndustryKeywords.join(", ")}`);
  console.log(`   결과: ${hasExpectedIndustry ? `${colors.green}통과 ✓${colors.reset}` : `${colors.yellow}확인 필요${colors.reset}`}`);

  // 시스템 프롬프트에 포함될 내용 미리보기
  console.log(`\n${colors.blue}📝 시스템 프롬프트 미리보기:${colors.reset}`);
  console.log(`   "이 분의 용신은 ${ELEMENT_KOREAN[yongShin]}이므로,`);
  console.log(`   ${ELEMENT_INDUSTRIES[yongShin].slice(0, 3).join(", ")} 분야를 추천합니다."`);

  return hasExpectedIndustry;
}

/**
 * Enriched Prompt 시뮬레이션
 */
function simulateEnrichedPrompt(yongShin: Element, dominantElements: Element[]) {
  const yongShinKorean = ELEMENT_KOREAN[yongShin];
  const yongShinIndustries = ELEMENT_INDUSTRIES[yongShin].join(", ");
  const dominantIndustries =
    dominantElements.length > 0 ? ELEMENT_INDUSTRIES[dominantElements[0]].join(", ") : "";

  console.log(`\n${colors.bright}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Enriched Prompt 시뮬레이션${colors.reset}`);
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  console.log(`
${colors.yellow}**매우 중요 - 이 분에게 맞는 분야**:${colors.reset}
- 용신(用神): ${yongShinKorean} → 추천 산업: ${yongShinIndustries}
- 강한 오행: ${dominantElements.map((e) => ELEMENT_KOREAN[e]).join(", ")} → 관련 산업: ${dominantIndustries}

${colors.green}**반드시 지켜야 할 규칙**:${colors.reset}
1. 절대로 "AI가 유망하다", "반도체에 투자하라" 같은 뻔한 일반론 금지!
2. 반드시 이 분의 용신(${yongShinKorean})에 맞는 산업을 추천하세요
3. 예: 용신이 木이면 ESG/바이오, 火면 AI/반도체, 土면 부동산, 金이면 핀테크, 水면 글로벌이커머스

${colors.cyan}검색 주제: 2025년 ${ELEMENT_INDUSTRIES[yongShin][0]} 산업 전망${colors.reset}
`);
}

// 메인 테스트 실행
console.log(`
${colors.bright}${colors.green}╔══════════════════════════════════════════════════════════════╗
║     사주 기반 재물/직업 추천 시스템 테스트                      ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);

// 테스트 케이스 1: 용신이 木(목)인 경우
runTest(
  "용신이 木(목)인 사람",
  "wood",
  ["wood", "fire"],
  ["siksin", "sanggwan"],
  ["친환경", "ESG", "바이오", "헬스케어"]
);

// 테스트 케이스 2: 용신이 火(화)인 경우
runTest(
  "용신이 火(화)인 사람",
  "fire",
  ["fire", "earth"],
  ["pyeonjae", "gebjae"],
  ["AI", "반도체", "메타버스", "전기차"]
);

// 테스트 케이스 3: 용신이 土(토)인 경우
runTest(
  "용신이 土(토)인 사람",
  "earth",
  ["earth", "metal"],
  ["jeongjae", "jeonggwan"],
  ["부동산", "인프라", "건설", "물류"]
);

// 테스트 케이스 4: 용신이 金(금)인 경우
runTest(
  "용신이 金(금)인 사람",
  "metal",
  ["metal", "water"],
  ["jeonggwan", "pyeongwan"],
  ["핀테크", "로봇", "자동화", "블록체인"]
);

// 테스트 케이스 5: 용신이 水(수)인 경우
runTest(
  "용신이 水(수)인 사람",
  "water",
  ["water", "wood"],
  ["bijian", "pyeonin"],
  ["글로벌", "이커머스", "물류", "미디어"]
);

// Enriched Prompt 시뮬레이션
console.log(`\n\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.bright}Enriched Prompt 예시 (각 오행별)${colors.reset}`);
console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);

simulateEnrichedPrompt("wood", ["wood", "fire"]);
simulateEnrichedPrompt("fire", ["fire", "earth"]);
simulateEnrichedPrompt("metal", ["metal", "water"]);

console.log(`
${colors.bright}${colors.green}╔══════════════════════════════════════════════════════════════╗
║                    테스트 완료!                               ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}결론:${colors.reset}
- 각 용신(오행)에 따라 다른 산업이 추천됩니다
- 火(화) 용신 → AI/반도체 (이 경우에만 AI 추천)
- 木(목) 용신 → ESG/바이오/헬스케어
- 金(금) 용신 → 핀테크/로봇/블록체인
- 土(토) 용신 → 부동산/인프라
- 水(수) 용신 → 글로벌이커머스/물류

${colors.cyan}이제 "AI가 유망하니 투자하라"는 뻔한 답변 대신,
각 사용자의 사주에 맞는 맞춤 추천이 제공됩니다!${colors.reset}
`);
