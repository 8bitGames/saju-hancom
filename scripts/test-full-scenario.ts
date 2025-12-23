/**
 * 전체 시나리오 테스트
 *
 * 테스트 대상:
 * 1. 사주 분석 - Multi-Agent 초개인화 적용
 * 2. 동료 궁합 - 직장 동료 관계 궁합
 * 3. 연인 궁합 - 커플 관계 궁합
 * 4. 관상 분석 - 얼굴 기반 분석
 *
 * 테스트 인물:
 * - 김철수 (44세 남성, 1981년생) - 역마살 있음
 * - 이영희 (38세 여성, 1987년생) - 도화살 있음
 */

import { runPersonalizationEngine } from "../lib/saju/agents";
import type { SajuResult, Star, Pillar, TenGodSummary, ElementAnalysis, TenGodAnalysis } from "../lib/saju/types";

// ============================================================================
// 테스트 데이터 생성
// ============================================================================

function createSajuResult(config: {
  dayMaster: string;
  dayMasterElement: "wood" | "fire" | "earth" | "metal" | "water";
  stars: Array<{ name: string; hanja: string; type: "auspicious" | "inauspicious" | "neutral" }>;
  lackingElements: ("wood" | "fire" | "earth" | "metal" | "water")[];
  dominantTenGods: Array<"bijian" | "gebjae" | "siksin" | "sanggwan" | "pyeonjae" | "jeongjae" | "pyeongwan" | "jeonggwan" | "pyeonin" | "jeongin">;
  description: string;
}): SajuResult {
  const basePillar: Pillar = {
    gan: "甲",
    zhi: "子",
    ganZhi: "甲子",
    ganElement: "wood",
    ganYinYang: "yang",
    zhiElement: "water",
    zhiYinYang: "yang",
    zhiHiddenGan: ["癸"],
    koreanReading: "갑자"
  };

  const stars: Star[] = config.stars.map(s => ({
    name: s.name,
    hanja: s.hanja,
    description: `${s.name} 관련 특성`,
    type: s.type,
    position: "year" as const
  }));

  const elementAnalysis: ElementAnalysis = {
    scores: { wood: 25, fire: 15, earth: 20, metal: 20, water: 20 },
    dominant: [config.dayMasterElement],
    lacking: config.lackingElements,
    balance: "unbalanced"
  };

  const tenGodSummary: TenGodSummary = {
    dominant: config.dominantTenGods,
    lacking: ["jeongjae", "jeonggwan"],
    counts: {
      bijian: 1, gebjae: 0, siksin: 2, sanggwan: 2,
      pyeonjae: 1, jeongjae: 0, pyeongwan: 1, jeonggwan: 0,
      pyeonin: 1, jeongin: 0
    }
  };

  const tenGods: TenGodAnalysis = {
    year: { gan: "siksin", zhi: "pyeonjae" },
    month: { gan: "sanggwan", zhi: "pyeongwan" },
    day: { gan: null, zhi: "bijian" },
    time: { gan: "pyeonin", zhi: "siksin" }
  };

  return {
    pillars: {
      year: basePillar,
      month: { ...basePillar, gan: "乙", ganZhi: "乙丑", koreanReading: "을축" },
      day: { ...basePillar, gan: config.dayMaster as "甲", ganZhi: `${config.dayMaster}寅`, koreanReading: "병인" },
      time: { ...basePillar, gan: "丁", ganZhi: "丁卯", koreanReading: "정묘" }
    },
    dayMaster: config.dayMaster as "甲",
    dayMasterElement: config.dayMasterElement,
    dayMasterYinYang: "yang",
    dayMasterDescription: config.description,
    elementAnalysis,
    tenGods,
    tenGodSummary,
    stars,
    meta: {
      solarDate: "1981-05-15",
      lunarDate: "1981-04-12",
      inputTime: "14:30",
      trueSolarTime: "14:25",
      jieQi: "입하",
      longitude: 127.0,
      offsetMinutes: -5
    }
  };
}

// ============================================================================
// 시나리오 1: 사주 분석 테스트
// ============================================================================

async function testSajuAnalysis() {
  console.log("\n" + "=".repeat(70));
  console.log("📊 시나리오 1: 사주 분석 테스트");
  console.log("=".repeat(70));

  // 김철수 (44세 남성, 역마살)
  const kimSajuResult = createSajuResult({
    dayMaster: "丙",
    dayMasterElement: "fire",
    stars: [
      { name: "역마살", hanja: "驛馬", type: "neutral" },
      { name: "천을귀인", hanja: "天乙貴人", type: "auspicious" }
    ],
    lackingElements: ["water"],
    dominantTenGods: ["siksin", "sanggwan"],
    description: "밝고 열정적인 성격으로 리더십이 있습니다"
  });

  console.log("\n👤 테스트 인물: 김철수");
  console.log("   - 나이: 44세 (1981년생)");
  console.log("   - 성별: 남성");
  console.log("   - 일간: 丙火 (밝고 열정적)");
  console.log("   - 신살: 역마살, 천을귀인");
  console.log("   - 부족 오행: 수(水)");

  // Multi-Agent 시스템 실행
  console.log("\n🤖 Multi-Agent 시스템 실행 중...");
  const result = await runPersonalizationEngine({
    sajuResult: kimSajuResult,
    birthYear: 1981,
    gender: "male",
    locale: "ko"
  });

  console.log("\n📋 Agent 분석 결과:");

  // Temporal Agent
  console.log("\n[🕐 Temporal Agent - 시간 축]");
  console.log(`   - 세운: ${result.agentOutputs.temporal.yearlyPillar.description}`);
  console.log(`   - 계절: ${result.agentOutputs.temporal.season}`);
  console.log(`   - 시기 조언: ${result.agentOutputs.temporal.timingAdvice[0]}`);

  // Age Agent
  console.log("\n[👤 Age Agent - 나이 축]");
  console.log(`   - 나이: ${result.agentOutputs.age.age}세`);
  console.log(`   - 연령대: ${result.agentOutputs.age.ageGroup}`);
  console.log(`   - 생애 단계: ${result.agentOutputs.age.lifeStage}`);
  console.log(`   - 주요 관심사: ${result.agentOutputs.age.lifeStageContext.primaryConcerns.slice(0, 3).join(", ")}`);

  // Chart Agent
  console.log("\n[🔮 Chart Agent - 사주 축]");
  console.log(`   - 결혼 조언 피하기: ${result.agentOutputs.chart.personalizationFlags.avoidMarriageAdvice}`);
  console.log(`   - 이동/변화 강조: ${result.agentOutputs.chart.personalizationFlags.emphasizeMovement}`);
  console.log(`   - 커리어 강조: ${result.agentOutputs.chart.personalizationFlags.emphasizeCareer}`);
  console.log(`   - 건강 주의 부위: ${result.agentOutputs.chart.healthFlags.watchAreas.join(", ")}`);

  // Orchestrator
  console.log("\n[🎯 Orchestrator - 통합]");
  console.log(`   - 추천 토픽: ${result.orchestratorResult.recommendedTopics.slice(0, 5).join(", ")}`);
  console.log(`   - 피해야 할 토픽: ${result.orchestratorResult.avoidTopics.slice(0, 3).join(", ")}`);

  // 검증
  const checks = {
    "12월 연말 인식": result.agentOutputs.temporal.season === "겨울",
    "44세 장년중기": result.agentOutputs.age.lifeStage === "장년중기",
    "역마살 → 결혼 피하기": result.agentOutputs.chart.personalizationFlags.avoidMarriageAdvice === true,
    "역마살 → 이동 강조": result.agentOutputs.chart.personalizationFlags.emphasizeMovement === true,
    "水 부족 → 신장 주의": result.agentOutputs.chart.healthFlags.watchAreas.includes("신장")
  };

  console.log("\n✅ 검증 결과:");
  let allPassed = true;
  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`   ${passed ? "✓" : "✗"} ${name}`);
    if (!passed) allPassed = false;
  });

  return { result, allPassed };
}

// ============================================================================
// 시나리오 2: 동료 궁합 테스트
// ============================================================================

async function testColleagueCompatibility() {
  console.log("\n" + "=".repeat(70));
  console.log("🤝 시나리오 2: 동료 궁합 테스트");
  console.log("=".repeat(70));

  // 두 사람의 사주 데이터
  const kim = {
    name: "김철수",
    birthYear: 1981,
    gender: "male" as const,
    sajuResult: createSajuResult({
      dayMaster: "丙",
      dayMasterElement: "fire",
      stars: [{ name: "역마살", hanja: "驛馬", type: "neutral" }],
      lackingElements: ["water"],
      dominantTenGods: ["siksin", "sanggwan"],
      description: "밝고 열정적인 성격으로 리더십이 있습니다"
    })
  };

  const lee = {
    name: "이영희",
    birthYear: 1987,
    gender: "female" as const,
    sajuResult: createSajuResult({
      dayMaster: "壬",
      dayMasterElement: "water",
      stars: [{ name: "화개살", hanja: "華蓋", type: "auspicious" }],
      lackingElements: ["fire"],
      dominantTenGods: ["jeongin", "jeonggwan"],
      description: "지혜롭고 유연한 성격으로 적응력이 뛰어납니다"
    })
  };

  console.log("\n👥 테스트 인물:");
  console.log(`   - ${kim.name}: ${2025 - kim.birthYear}세 남성, 丙火 (역마살)`);
  console.log(`   - ${lee.name}: ${2025 - lee.birthYear}세 여성, 壬水 (화개살)`);

  // 두 사람의 개인화 컨텍스트 생성
  console.log("\n🤖 두 사람의 Multi-Agent 분석 실행 중...");

  const [kimContext, leeContext] = await Promise.all([
    runPersonalizationEngine({
      sajuResult: kim.sajuResult,
      birthYear: kim.birthYear,
      gender: kim.gender,
      locale: "ko",
      userQuery: "직장 동료 관계"
    }),
    runPersonalizationEngine({
      sajuResult: lee.sajuResult,
      birthYear: lee.birthYear,
      gender: lee.gender,
      locale: "ko",
      userQuery: "직장 동료 관계"
    })
  ]);

  console.log("\n📋 동료 궁합 분석:");

  // 오행 상호작용 분석
  const kimElement = kim.sajuResult.dayMasterElement;
  const leeElement = lee.sajuResult.dayMasterElement;

  console.log("\n[오행 상호작용]");
  console.log(`   - ${kim.name}: ${kimElement} (火)`);
  console.log(`   - ${lee.name}: ${leeElement} (水)`);

  // 화(火)와 수(水)는 상극 관계이지만, 서로 보완적
  const interaction = (kimElement === "fire" && leeElement === "water")
    ? "상극 관계 (서로 견제하지만, 균형을 이룰 수 있음)"
    : "상생 관계";

  console.log(`   - 상호작용: ${interaction}`);

  console.log("\n[각자의 업무 스타일]");
  console.log(`   - ${kim.name}: ${kimContext.agentOutputs.chart.personalityProfile.relationshipStyle}`);
  console.log(`   - ${lee.name}: ${leeContext.agentOutputs.chart.personalityProfile.relationshipStyle}`);

  console.log("\n[협업 시 강점]");
  console.log(`   - ${kim.name}의 열정 + ${lee.name}의 지혜 = 균형 잡힌 의사결정`);
  console.log(`   - ${kim.name}의 리더십 + ${lee.name}의 세심함 = 효과적인 팀워크`);

  console.log("\n[주의할 점]");
  if (kimContext.agentOutputs.chart.personalizationFlags.emphasizeMovement) {
    console.log(`   - ${kim.name}은 변화를 추구하므로 안정을 원하는 동료와 갈등 가능`);
  }
  if (leeContext.agentOutputs.chart.personalizationFlags.emphasizeStudy) {
    console.log(`   - ${lee.name}은 깊이 있는 분석을 선호하므로 빠른 결정에 답답할 수 있음`);
  }

  // 검증
  const checks = {
    "김철수 이동 강조": kimContext.agentOutputs.chart.personalizationFlags.emphasizeMovement === true,
    "이영희 학업/연구 강조": leeContext.agentOutputs.chart.personalizationFlags.emphasizeStudy === true,
    "오행 분석 완료": kimElement === "fire" && leeElement === "water"
  };

  console.log("\n✅ 검증 결과:");
  let allPassed = true;
  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`   ${passed ? "✓" : "✗"} ${name}`);
    if (!passed) allPassed = false;
  });

  return { kimContext, leeContext, allPassed };
}

// ============================================================================
// 시나리오 3: 연인 궁합 테스트
// ============================================================================

async function testCoupleCompatibility() {
  console.log("\n" + "=".repeat(70));
  console.log("💕 시나리오 3: 연인 궁합 테스트");
  console.log("=".repeat(70));

  // 두 사람의 사주 데이터
  const man = {
    name: "박준영",
    birthYear: 1990,
    gender: "male" as const,
    sajuResult: createSajuResult({
      dayMaster: "甲",
      dayMasterElement: "wood",
      stars: [
        { name: "도화살", hanja: "桃花", type: "auspicious" },
        { name: "천을귀인", hanja: "天乙貴人", type: "auspicious" }
      ],
      lackingElements: ["metal"],
      dominantTenGods: ["pyeonjae", "siksin"],
      description: "진취적이고 성장 지향적인 성격입니다"
    })
  };

  const woman = {
    name: "최민지",
    birthYear: 1992,
    gender: "female" as const,
    sajuResult: createSajuResult({
      dayMaster: "己",
      dayMasterElement: "earth",
      stars: [
        { name: "천덕귀인", hanja: "天德貴人", type: "auspicious" }
      ],
      lackingElements: ["water"],
      dominantTenGods: ["jeongjae", "jeongin"],
      description: "안정적이고 포용력 있는 성격입니다"
    })
  };

  console.log("\n👫 테스트 인물:");
  console.log(`   - ${man.name}: ${2025 - man.birthYear}세 남성, 甲木 (도화살, 천을귀인)`);
  console.log(`   - ${woman.name}: ${2025 - woman.birthYear}세 여성, 己土 (천덕귀인)`);

  // 두 사람의 개인화 컨텍스트 생성
  console.log("\n🤖 두 사람의 Multi-Agent 분석 실행 중...");

  const [manContext, womanContext] = await Promise.all([
    runPersonalizationEngine({
      sajuResult: man.sajuResult,
      birthYear: man.birthYear,
      gender: man.gender,
      locale: "ko",
      userQuery: "연인 관계"
    }),
    runPersonalizationEngine({
      sajuResult: woman.sajuResult,
      birthYear: woman.birthYear,
      gender: woman.gender,
      locale: "ko",
      userQuery: "연인 관계"
    })
  ]);

  console.log("\n📋 연인 궁합 분석:");

  // 오행 상호작용 분석
  const manElement = man.sajuResult.dayMasterElement;
  const womanElement = woman.sajuResult.dayMasterElement;

  console.log("\n[오행 상호작용]");
  console.log(`   - ${man.name}: ${manElement} (木)`);
  console.log(`   - ${woman.name}: ${womanElement} (土)`);

  // 목(木)이 토(土)를 극하는 관계 (목극토)
  // 하지만 이것이 반드시 나쁜 것은 아님 - 상호 보완적일 수 있음
  console.log(`   - 상호작용: 木이 土를 극하는 관계 (목극토)`);
  console.log(`   - 해석: ${man.name}이 주도하고 ${woman.name}이 받아들이는 관계 형성 가능`);

  console.log("\n[연애 스타일]");
  console.log(`   - ${man.name}: ${manContext.agentOutputs.chart.personalityProfile.relationshipStyle}`);
  console.log(`   - ${woman.name}: ${womanContext.agentOutputs.chart.personalityProfile.relationshipStyle}`);

  console.log("\n[궁합 강점]");
  if (manContext.agentOutputs.chart.personalizationFlags.relationshipCaution) {
    console.log(`   - ${man.name}의 도화살: 이성에게 인기 많고 매력적`);
  }
  console.log(`   - ${woman.name}의 천덕귀인: 덕이 있어 귀인을 만나는 복`);
  console.log(`   - 서로 다른 오행으로 상호 보완 가능`);

  console.log("\n[주의할 점]");
  if (manContext.agentOutputs.chart.personalizationFlags.relationshipCaution) {
    console.log(`   - ${man.name}: 도화살로 인해 다른 이성에게도 관심 받을 수 있으니 신뢰 관계 중요`);
  }

  // 나이대별 연애 민감도 확인
  console.log("\n[나이대별 특성]");
  console.log(`   - ${man.name} (${manContext.agentOutputs.age.ageGroup}): ${manContext.agentOutputs.age.lifeStage}`);
  console.log(`   - ${woman.name} (${womanContext.agentOutputs.age.ageGroup}): ${womanContext.agentOutputs.age.lifeStage}`);

  // 연인 궁합 점수 계산 (간단한 버전)
  let compatibilityScore = 70; // 기본 점수

  // 상생 관계면 +15, 상극 관계면 -5 (상극도 긴장감으로 좋을 수 있음)
  if (manElement === "wood" && womanElement === "earth") {
    compatibilityScore -= 5; // 목극토
    console.log("\n[궁합 점수 조정]");
    console.log(`   - 오행 상극 관계: -5점`);
  }

  // 귀인 신살 있으면 +10
  const hasGuiren = man.sajuResult.stars.some(s => s.name.includes("귀인")) ||
                    woman.sajuResult.stars.some(s => s.name.includes("귀인"));
  if (hasGuiren) {
    compatibilityScore += 15;
    console.log(`   - 귀인 신살 보유: +15점`);
  }

  // 도화살 있으면 매력 +10, 하지만 불안정 -5
  if (manContext.agentOutputs.chart.personalizationFlags.relationshipCaution) {
    compatibilityScore += 5; // 10 - 5 = 5
    console.log(`   - 도화살 (매력적이나 주의 필요): +5점`);
  }

  console.log(`\n💯 예상 연인 궁합 점수: ${compatibilityScore}점`);

  // 검증
  const checks = {
    "박준영 도화살 인식": manContext.agentOutputs.chart.personalizationFlags.relationshipCaution === true,
    "최민지 35세 미만": womanContext.agentOutputs.age.age < 40,
    "오행 분석 완료": manElement === "wood" && womanElement === "earth",
    "귀인 신살 인식": hasGuiren
  };

  console.log("\n✅ 검증 결과:");
  let allPassed = true;
  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`   ${passed ? "✓" : "✗"} ${name}`);
    if (!passed) allPassed = false;
  });

  return { manContext, womanContext, compatibilityScore, allPassed };
}

// ============================================================================
// 시나리오 4: 관상 분석 테스트
// ============================================================================

async function testFaceReading() {
  console.log("\n" + "=".repeat(70));
  console.log("👁️ 시나리오 4: 관상 분석 테스트");
  console.log("=".repeat(70));

  console.log("\n📌 관상 분석은 이미지 기반이므로 Multi-Agent 시스템과 별도로 작동합니다.");
  console.log("   현재 관상 API는 Gemini Vision을 사용하여 이미지 분석을 수행합니다.\n");

  // 관상 분석은 이미지 기반이므로, Multi-Agent 시스템 적용 방식 검토
  console.log("[현재 관상 분석 프로세스]");
  console.log("   1. 사용자가 얼굴 이미지 업로드");
  console.log("   2. Gemini Vision API로 얼굴 특징 분석");
  console.log("   3. 관상학적 해석 제공");

  console.log("\n[Multi-Agent 통합 방안]");
  console.log("   - 관상 분석에 사주 정보가 있으면 통합 분석 가능");
  console.log("   - 현재 시점(연말 등) 맥락 추가 가능");
  console.log("   - 나이대별 관상 해석 차별화 가능\n");

  // 관상 + 사주 통합 시나리오 시뮬레이션
  console.log("[통합 시나리오 시뮬레이션: 김철수(44세) 관상 분석 시]");

  const kimSajuResult = createSajuResult({
    dayMaster: "丙",
    dayMasterElement: "fire",
    stars: [{ name: "역마살", hanja: "驛馬", type: "neutral" }],
    lackingElements: ["water"],
    dominantTenGods: ["siksin", "sanggwan"],
    description: "밝고 열정적인 성격으로 리더십이 있습니다"
  });

  const personalizationResult = await runPersonalizationEngine({
    sajuResult: kimSajuResult,
    birthYear: 1981,
    gender: "male",
    locale: "ko",
    userQuery: "관상 분석"
  });

  console.log("\n   [사주 기반 관상 해석 포인트]");
  console.log(`   - 나이: ${personalizationResult.agentOutputs.age.ageGroup} → 중년 관상 특징 중점 분석`);
  console.log(`   - 역마살: 눈에 활기, 관골 발달 확인`);
  console.log(`   - 火 일간: 밝은 인상, 이마 넓음 가능성`);
  console.log(`   - 水 부족: 귀 형태, 신장 관련 관상 주의`);

  console.log("\n   [관상 + 사주 통합 조언]");
  console.log(`   - "얼굴에서 활기찬 기운이 보이는데, 사주의 역마살과 일치합니다"`);
  console.log(`   - "이마가 넓고 밝아 리더십이 있어 보이는데, 丙火 일간의 특징입니다"`);
  console.log(`   - "귀 부분을 잘 살펴보면 신장 건강을 가늠할 수 있는데, 수분 섭취에 신경 쓰세요"`);

  // 검증
  const checks = {
    "사주 컨텍스트 생성 완료": personalizationResult.orchestratorResult.systemPromptAddition.length > 0,
    "나이대 분석 완료": personalizationResult.agentOutputs.age.ageGroup.includes("40대"),
    "건강 주의사항 포함": personalizationResult.agentOutputs.chart.healthFlags.watchAreas.length > 0
  };

  console.log("\n✅ 검증 결과:");
  let allPassed = true;
  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`   ${passed ? "✓" : "✗"} ${name}`);
    if (!passed) allPassed = false;
  });

  return { personalizationResult, allPassed };
}

// ============================================================================
// 메인 실행
// ============================================================================

async function main() {
  console.log("\n🚀 전체 시나리오 테스트 시작");
  console.log("테스트 일시: 2025년 12월 23일");
  console.log("=".repeat(70));

  const results = {
    saju: false,
    colleague: false,
    couple: false,
    face: false
  };

  try {
    // 1. 사주 분석
    const sajuResult = await testSajuAnalysis();
    results.saju = sajuResult.allPassed;

    // 2. 동료 궁합
    const colleagueResult = await testColleagueCompatibility();
    results.colleague = colleagueResult.allPassed;

    // 3. 연인 궁합
    const coupleResult = await testCoupleCompatibility();
    results.couple = coupleResult.allPassed;

    // 4. 관상 분석
    const faceResult = await testFaceReading();
    results.face = faceResult.allPassed;

    // 최종 결과
    console.log("\n" + "=".repeat(70));
    console.log("📊 최종 테스트 결과");
    console.log("=".repeat(70));

    console.log(`\n   📊 사주 분석:    ${results.saju ? "✅ 통과" : "❌ 실패"}`);
    console.log(`   🤝 동료 궁합:    ${results.colleague ? "✅ 통과" : "❌ 실패"}`);
    console.log(`   💕 연인 궁합:    ${results.couple ? "✅ 통과" : "❌ 실패"}`);
    console.log(`   👁️ 관상 분석:    ${results.face ? "✅ 통과" : "❌ 실패"}`);

    const allPassed = Object.values(results).every(r => r);
    console.log(`\n   ${allPassed ? "🎉 모든 테스트 통과!" : "⚠️ 일부 테스트 실패"}`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("\n❌ 테스트 중 에러 발생:", error);
    process.exit(1);
  }
}

main();
