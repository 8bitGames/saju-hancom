/**
 * Phase 6: 개인화 시스템 테스트 스크립트
 *
 * 실행: npx tsx scripts/test-personalization.ts
 */

import {
  extractSajuProfile,
  generateSajuProfile,
  generateCareerQueries,
  generateWealthQueries,
  type GroundingContext,
} from "../lib/saju/personalized-keywords";

import {
  shouldTriggerSearch,
  shouldTriggerSearchWithContext,
  generatePersonalizedTriggerQuery,
  getMajorFortuneSummary,
  type PersonalizedSearchContext,
} from "../lib/saju/search-triggers";

import type { SajuResult, TenGod, Element } from "../lib/saju/types";

// ============================================================================
// 테스트용 Mock 데이터
// ============================================================================

const mockSajuResult: SajuResult = {
  fourPillars: {
    year: { gan: "갑", ji: "자", ganElement: "wood", jiElement: "water" },
    month: { gan: "병", ji: "인", ganElement: "fire", jiElement: "wood" },
    day: { gan: "무", ji: "오", ganElement: "earth", jiElement: "fire" },
    hour: { gan: "경", ji: "신", ganElement: "metal", jiElement: "metal" },
  },
  dayMaster: "무",
  dayMasterElement: "earth" as Element,
  dayMasterDescription: "무토(戊土) - 산과 같은 안정적이고 신뢰할 수 있는 성격",
  tenGodSummary: {
    dominant: ["siksin" as TenGod, "pyeonjae" as TenGod],
    lacking: ["gebjae" as TenGod, "pyeongwan" as TenGod],
    counts: {
      bijian: 1,
      gebjae: 0,
      siksin: 2,
      sanggwan: 1,
      pyeonjae: 2,
      jeongjae: 1,
      pyeongwan: 0,
      jeonggwan: 1,
      pyeonin: 1,
      jeongin: 1,
    } as Record<TenGod, number>,
  },
  elementAnalysis: {
    counts: { wood: 2, fire: 3, earth: 2, metal: 2, water: 1 },
    dominant: ["fire" as Element, "wood" as Element],
    lacking: ["water" as Element],
    yongShin: "water" as Element,
    giShin: "fire" as Element,
  },
  majorFortune: {
    startAge: 2,
    direction: "forward" as const,
    periods: [
      {
        startAge: 2,
        endAge: 11,
        pillar: {
          gan: "정" as const,
          zhi: "묘" as const,
          ganZhi: "丁卯",
          ganElement: "fire" as Element,
          ganYinYang: "yin" as const,
          zhiElement: "wood" as Element,
          zhiYinYang: "yin" as const,
          zhiHiddenGan: ["을" as const],
          koreanReading: "정묘",
        },
      },
      {
        startAge: 12,
        endAge: 21,
        pillar: {
          gan: "무" as const,
          zhi: "진" as const,
          ganZhi: "戊辰",
          ganElement: "earth" as Element,
          ganYinYang: "yang" as const,
          zhiElement: "earth" as Element,
          zhiYinYang: "yang" as const,
          zhiHiddenGan: ["무" as const, "을" as const, "계" as const],
          koreanReading: "무진",
        },
      },
      {
        startAge: 22,
        endAge: 31,
        pillar: {
          gan: "기" as const,
          zhi: "사" as const,
          ganZhi: "己巳",
          ganElement: "earth" as Element,
          ganYinYang: "yin" as const,
          zhiElement: "fire" as Element,
          zhiYinYang: "yin" as const,
          zhiHiddenGan: ["병" as const, "무" as const, "경" as const],
          koreanReading: "기사",
        },
      },
      {
        startAge: 32,
        endAge: 41,
        pillar: {
          gan: "경" as const,
          zhi: "오" as const,
          ganZhi: "庚午",
          ganElement: "metal" as Element,
          ganYinYang: "yang" as const,
          zhiElement: "fire" as Element,
          zhiYinYang: "yang" as const,
          zhiHiddenGan: ["정" as const, "기" as const],
          koreanReading: "경오",
        },
      },
      {
        startAge: 42,
        endAge: 51,
        pillar: {
          gan: "신" as const,
          zhi: "미" as const,
          ganZhi: "辛未",
          ganElement: "metal" as Element,
          ganYinYang: "yin" as const,
          zhiElement: "earth" as Element,
          zhiYinYang: "yin" as const,
          zhiHiddenGan: ["기" as const, "정" as const, "을" as const],
          koreanReading: "신미",
        },
      },
    ],
  },
  stars: [],
};

// ============================================================================
// 테스트 함수들
// ============================================================================

function printSection(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(`📌 ${title}`);
  console.log("=".repeat(60));
}

function printResult(label: string, value: unknown) {
  console.log(`\n🔹 ${label}:`);
  if (typeof value === "object") {
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log(value);
  }
}

function testExtractSajuProfile() {
  printSection("Test 1: extractSajuProfile()");

  const profile = extractSajuProfile(mockSajuResult);

  printResult("Extracted Profile", profile);

  // 검증
  const checks = [
    { name: "personality", ok: profile.personality.length > 0 },
    { name: "suitableIndustry", ok: profile.suitableIndustry.length > 0 },
    { name: "investmentStyle", ok: profile.investmentStyle.length > 0 },
    { name: "careerTypes", ok: profile.careerTypes.length > 0 },
    { name: "summary", ok: profile.summary.length > 0 },
  ];

  console.log("\n✅ 검증 결과:");
  checks.forEach(c => {
    console.log(`   ${c.ok ? "✓" : "✗"} ${c.name}: ${c.ok ? "PASS" : "FAIL"}`);
  });

  return checks.every(c => c.ok);
}

function testGenerateSajuProfile() {
  printSection("Test 2: generateSajuProfile()");

  const profile = generateSajuProfile(mockSajuResult, 35);

  printResult("Generated Profile (age 35)", profile);

  const hasContent = profile.length > 50;
  console.log(`\n✅ 검증 결과: ${hasContent ? "PASS" : "FAIL"} (길이: ${profile.length}자)`);

  return hasContent;
}

function testSearchTriggers() {
  printSection("Test 3: shouldTriggerSearch()");

  const testMessages = [
    "올해 이직을 해도 될까요?",
    "주식 투자 어떻게 할까요?",
    "연애운이 어떤가요?",
    "건강이 걱정돼요",
    "오늘 날씨 어때요?", // 트리거 안됨
  ];

  console.log("\n🔹 트리거 테스트:");
  const results: boolean[] = [];

  testMessages.forEach(msg => {
    const result = shouldTriggerSearch(msg);
    const triggered = result.shouldSearch;
    results.push(msg.includes("날씨") ? !triggered : triggered);
    console.log(`   ${triggered ? "🔍" : "  "} "${msg}" → ${triggered ? result.trigger?.category : "No trigger"}`);
  });

  const allPass = results.every(r => r);
  console.log(`\n✅ 검증 결과: ${allPass ? "PASS" : "FAIL"}`);

  return allPass;
}

function testPersonalizedTriggerQuery() {
  printSection("Test 4: generatePersonalizedTriggerQuery()");

  const context: PersonalizedSearchContext = {
    sajuResult: mockSajuResult,
    birthYear: 1990,
    currentYear: 2025,
    currentAge: 36,
  };

  const triggerResult = shouldTriggerSearch("이직 고민이에요");

  if (triggerResult.trigger) {
    const queries = generatePersonalizedTriggerQuery(
      triggerResult.trigger,
      context,
      "이직 고민이에요"
    );

    printResult("Generated Queries", queries);

    const hasQueries = queries.length > 0;
    console.log(`\n✅ 검증 결과: ${hasQueries ? "PASS" : "FAIL"} (${queries.length}개 쿼리)`);
    return hasQueries;
  }

  console.log("\n❌ 트리거 감지 실패");
  return false;
}

function testMajorFortuneSummary() {
  printSection("Test 5: getMajorFortuneSummary()");

  const summary = getMajorFortuneSummary(mockSajuResult, 1990, 2025);

  printResult("Major Fortune Summary (1990년생, 2025년 기준)", summary);

  const hasSummary = summary !== null && summary.length > 0;
  console.log(`\n✅ 검증 결과: ${hasSummary ? "PASS" : "FAIL"}`);

  return hasSummary;
}

function testSearchWithContext() {
  printSection("Test 6: shouldTriggerSearchWithContext()");

  const context: PersonalizedSearchContext = {
    sajuResult: mockSajuResult,
    birthYear: 1990,
    currentYear: 2025,
    currentAge: 36,
  };

  const result = shouldTriggerSearchWithContext("재테크 어떻게 해야 할까요?", context);

  printResult("Context-aware Trigger Result", {
    shouldSearch: result.shouldSearch,
    category: result.trigger?.category,
    personalizedQueries: result.personalizedQueries,
    reason: result.reason,
  });

  const hasPersonalizedQueries = result.personalizedQueries.length > 0;
  console.log(`\n✅ 검증 결과: ${hasPersonalizedQueries ? "PASS" : "FAIL"}`);

  return hasPersonalizedQueries;
}

function testGroundingQueries() {
  printSection("Test 7: generateCareerQueries() & generateWealthQueries()");

  const context: GroundingContext = {
    currentYear: 2025,
    currentMonth: 12,
    ageGroup: "30대",
    currentAge: 36,
    sajuResult: mockSajuResult,
  };

  const careerQueries = generateCareerQueries(context);
  const wealthQueries = generateWealthQueries(context);

  printResult("Career Queries", careerQueries);
  printResult("Wealth Queries", wealthQueries);

  const hasCareer = careerQueries.length > 0;
  const hasWealth = wealthQueries.length > 0;

  console.log(`\n✅ 검증 결과:`);
  console.log(`   ${hasCareer ? "✓" : "✗"} Career Queries: ${hasCareer ? "PASS" : "FAIL"}`);
  console.log(`   ${hasWealth ? "✓" : "✗"} Wealth Queries: ${hasWealth ? "PASS" : "FAIL"}`);

  return hasCareer && hasWealth;
}

// ============================================================================
// 메인 실행
// ============================================================================

async function main() {
  console.log("\n" + "🚀".repeat(30));
  console.log("   Phase 6: 개인화 시스템 테스트");
  console.log("🚀".repeat(30));

  const results: { name: string; passed: boolean }[] = [];

  try {
    results.push({ name: "extractSajuProfile", passed: testExtractSajuProfile() });
    results.push({ name: "generateSajuProfile", passed: testGenerateSajuProfile() });
    results.push({ name: "shouldTriggerSearch", passed: testSearchTriggers() });
    results.push({ name: "generatePersonalizedTriggerQuery", passed: testPersonalizedTriggerQuery() });
    results.push({ name: "getMajorFortuneSummary", passed: testMajorFortuneSummary() });
    results.push({ name: "shouldTriggerSearchWithContext", passed: testSearchWithContext() });
    results.push({ name: "generateGroundingQueries", passed: testGroundingQueries() });
  } catch (error) {
    console.error("\n❌ 테스트 중 오류 발생:", error);
    process.exit(1);
  }

  // 최종 결과
  printSection("최종 테스트 결과");

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  results.forEach(r => {
    console.log(`   ${r.passed ? "✅" : "❌"} ${r.name}`);
  });

  console.log(`\n📊 결과: ${passedCount}/${totalCount} 테스트 통과`);

  if (passedCount === totalCount) {
    console.log("\n🎉 모든 테스트 통과! Phase 6 완료!\n");
    process.exit(0);
  } else {
    console.log("\n⚠️ 일부 테스트 실패. 확인이 필요합니다.\n");
    process.exit(1);
  }
}

main();
