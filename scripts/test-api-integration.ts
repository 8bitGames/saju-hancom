/**
 * Phase 6: API 통합 테스트 스크립트
 *
 * 실행: npx tsx scripts/test-api-integration.ts
 *
 * 테스트 항목:
 * 1. Detail API - 각 카테고리별 상세 분석
 * 2. Chat API - 개인화된 채팅 응답
 * 3. 개인화 컨텍스트 적용 확인
 */

import type { SajuResult, Element, TenGod } from "../lib/saju/types";

// ============================================================================
// 테스트용 실제 사주 데이터
// ============================================================================

const testSajuResult: SajuResult = {
  fourPillars: {
    year: {
      gan: "갑" as const,
      zhi: "자" as const,
      ganZhi: "甲子",
      ganElement: "wood" as Element,
      ganYinYang: "yang" as const,
      zhiElement: "water" as Element,
      zhiYinYang: "yang" as const,
      zhiHiddenGan: ["계" as const],
      koreanReading: "갑자",
    },
    month: {
      gan: "병" as const,
      zhi: "인" as const,
      ganZhi: "丙寅",
      ganElement: "fire" as Element,
      ganYinYang: "yang" as const,
      zhiElement: "wood" as Element,
      zhiYinYang: "yang" as const,
      zhiHiddenGan: ["갑" as const, "병" as const, "무" as const],
      koreanReading: "병인",
    },
    day: {
      gan: "무" as const,
      zhi: "오" as const,
      ganZhi: "戊午",
      ganElement: "earth" as Element,
      ganYinYang: "yang" as const,
      zhiElement: "fire" as Element,
      zhiYinYang: "yang" as const,
      zhiHiddenGan: ["정" as const, "기" as const],
      koreanReading: "무오",
    },
    hour: {
      gan: "경" as const,
      zhi: "신" as const,
      ganZhi: "庚申",
      ganElement: "metal" as Element,
      ganYinYang: "yang" as const,
      zhiElement: "metal" as Element,
      zhiYinYang: "yang" as const,
      zhiHiddenGan: ["경" as const, "임" as const, "무" as const],
      koreanReading: "경신",
    },
  },
  dayMaster: "무" as const,
  dayMasterElement: "earth" as Element,
  dayMasterStrength: "strong",
  dayMasterDescription: "무토(戊土) - 산과 같은 안정적이고 신뢰할 수 있는 성격",
  tenGods: {
    year: { gan: "gebjae" as TenGod, zhi: "jeongjae" as TenGod },
    month: { gan: "pyeonin" as TenGod, zhi: "gebjae" as TenGod },
    day: { gan: "bijian" as TenGod, zhi: "pyeonin" as TenGod },
    hour: { gan: "siksin" as TenGod, zhi: "siksin" as TenGod },
  },
  tenGodSummary: {
    dominant: ["siksin" as TenGod, "pyeonin" as TenGod],
    lacking: ["jeonggwan" as TenGod, "pyeongwan" as TenGod],
    counts: {
      bijian: 1,
      gebjae: 2,
      siksin: 2,
      sanggwan: 0,
      pyeonjae: 0,
      jeongjae: 1,
      pyeongwan: 0,
      jeonggwan: 0,
      pyeonin: 2,
      jeongin: 0,
    } as Record<TenGod, number>,
  },
  elementAnalysis: {
    counts: { wood: 3, fire: 3, earth: 2, metal: 2, water: 1 },
    dominant: ["wood" as Element, "fire" as Element],
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
  meta: {
    solarDate: "1990-02-15",
    lunarDate: "1990-01-20",
    inputTime: "15:30",
    adjustedTime: "15:25",
    location: "서울",
    timezone: "Asia/Seoul",
    calculatedAt: new Date().toISOString(),
  },
};

const testSajuContext = `
사주 분석 결과:
- 일간: 무토(戊土) - 산과 같이 안정적이고 신뢰할 수 있는 성격
- 주요 십성: 식신(食神), 편인(偏印) 강함
- 강한 오행: 목(木), 화(火)
- 부족한 오행: 수(水)
- 용신: 수(水)
- 현재 대운: 경오(庚午) 대운 (32-41세)

사주 특징:
- 창의적이고 표현력이 뛰어남
- 학습 능력과 직관이 강함
- 안정을 추구하면서도 변화를 원함
`;

// ============================================================================
// 테스트 설정
// ============================================================================

const BASE_URL = "http://localhost:3000";
const TEST_TIMEOUT = 30000;

// ============================================================================
// 유틸리티 함수
// ============================================================================

function printSection(title: string) {
  console.log("\n" + "=".repeat(70));
  console.log(`  ${title}`);
  console.log("=".repeat(70));
}

function printSubSection(title: string) {
  console.log(`\n--- ${title} ---`);
}

async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);

    // 서버가 실행 중이면 어떤 응답이든 OK
    if (response) return true;

    // health endpoint가 없을 수 있으니 메인 페이지 체크
    const mainPage = await fetch(BASE_URL, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);

    return mainPage !== null;
  } catch {
    return false;
  }
}

// ============================================================================
// SSE 파싱 유틸리티
// ============================================================================

interface SSEEvent {
  type: string;
  content?: string;
  category?: string;
  fullContent?: string;
  personalizedFor?: string;
  searchQueries?: string[];
  sources?: Array<{ url: string; title: string }>;
  grounded?: boolean;
  groundingSources?: Array<{ url: string; title: string }>;
  // Phase 6: 그라운딩 강도 정보
  groundingIntensity?: "HIGH" | "MEDIUM" | "LOW";
}

async function parseSSEResponse(response: Response): Promise<SSEEvent[]> {
  const events: SSEEvent[] = [];
  const reader = response.body?.getReader();
  if (!reader) return events;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            events.push(parsed);
          } catch {
            // 파싱 실패 시 무시
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return events;
}

// ============================================================================
// Detail API 테스트
// ============================================================================

async function testDetailAPI(): Promise<{ passed: number; failed: number; results: string[] }> {
  printSection("Detail API 테스트");

  const categories = ["career", "wealth", "health", "relationship", "fortune"];
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  for (const category of categories) {
    printSubSection(`카테고리: ${category}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

      const response = await fetch(`${BASE_URL}/api/saju/detail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          sajuContext: testSajuContext,
          sajuResult: testSajuResult,
          gender: "male",
          birthYear: 1990,
          locale: "ko",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const events = await parseSSEResponse(response);

      // 결과 분석
      const textEvents = events.filter((e) => e.type === "text");
      const doneEvent = events.find((e) => e.type === "done");
      const metadataEvent = events.find((e) => e.type === "metadata");

      const totalText = textEvents.map((e) => e.content || "").join("");
      const hasContent = totalText.length > 100;
      const hasPersonalization = doneEvent?.personalizedFor !== null;
      const hasSearchQueries = doneEvent?.searchQueries && doneEvent.searchQueries.length > 0;
      const isGrounded = metadataEvent?.grounded === true;

      // Phase 6: 그라운딩 강도 출력
      const groundingIntensity = doneEvent?.groundingIntensity || "N/A";

      console.log(`  - 응답 길이: ${totalText.length}자`);
      console.log(`  - 개인화 정보: ${hasPersonalization ? "O" : "X"} ${doneEvent?.personalizedFor ? `(${doneEvent.personalizedFor.slice(0, 50)}...)` : ""}`);
      console.log(`  - 검색 쿼리: ${hasSearchQueries ? `O (${doneEvent?.searchQueries?.length}개)` : "X"}`);
      console.log(`  - 그라운딩 강도: ${groundingIntensity}`);
      console.log(`  - Grounding 사용: ${isGrounded ? "O" : "X"}`);

      if (hasContent) {
        console.log(`  => PASS`);
        passed++;
        results.push(`${category}: PASS`);
      } else {
        console.log(`  => FAIL (응답 부족)`);
        failed++;
        results.push(`${category}: FAIL`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  => ERROR: ${errorMessage}`);
      failed++;
      results.push(`${category}: ERROR - ${errorMessage}`);
    }
  }

  return { passed, failed, results };
}

// ============================================================================
// Chat API 테스트
// ============================================================================

async function testChatAPI(): Promise<{ passed: number; failed: number; results: string[] }> {
  printSection("Chat API 테스트");

  const testMessages = [
    { query: "올해 이직을 해도 될까요?", expectedTrigger: "career" },
    { query: "주식 투자 어떻게 할까요?", expectedTrigger: "wealth" },
    { query: "건강 관리 어떻게 해야 하나요?", expectedTrigger: "health" },
    { query: "연애운이 어떤가요?", expectedTrigger: "relationship" },
  ];

  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  for (const { query, expectedTrigger } of testMessages) {
    printSubSection(`질문: "${query}"`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

      const response = await fetch(`${BASE_URL}/api/saju/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: query }],
          sajuContext: testSajuContext,
          sajuResult: testSajuResult,
          gender: "male",
          birthYear: 1990,
          locale: "ko",
          enableGrounding: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // SSE 또는 일반 텍스트 응답 처리
      const contentType = response.headers.get("content-type") || "";

      let responseText = "";
      let hasEnrichedResponse = false;
      let hasSources = false;

      if (contentType.includes("text/event-stream")) {
        const events = await parseSSEResponse(response);

        const primaryEvents = events.filter((e) => e.type === "primary");
        const enrichedEvents = events.filter((e) => e.type === "enriched");

        responseText = primaryEvents.map((e) => e.content || "").join("");
        hasEnrichedResponse = enrichedEvents.length > 0;
        hasSources = enrichedEvents.some((e) => e.sources && e.sources.length > 0);

        if (hasEnrichedResponse) {
          const enrichedText = enrichedEvents.map((e) => e.content || "").join("");
          console.log(`  - 1차 응답: ${responseText.length}자`);
          console.log(`  - 2차 응답 (Grounding): ${enrichedText.length}자`);
        } else {
          console.log(`  - 응답 길이: ${responseText.length}자`);
        }
      } else {
        responseText = await response.text();
        console.log(`  - 응답 길이: ${responseText.length}자`);
      }

      console.log(`  - 2단계 응답: ${hasEnrichedResponse ? "O" : "X"}`);
      console.log(`  - 출처 포함: ${hasSources ? "O" : "X"}`);

      const hasContent = responseText.length > 50;
      if (hasContent) {
        console.log(`  => PASS`);
        passed++;
        results.push(`Chat "${query.slice(0, 20)}...": PASS`);
      } else {
        console.log(`  => FAIL (응답 부족)`);
        failed++;
        results.push(`Chat "${query.slice(0, 20)}...": FAIL`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  => ERROR: ${errorMessage}`);
      failed++;
      results.push(`Chat "${query.slice(0, 20)}...": ERROR - ${errorMessage}`);
    }
  }

  return { passed, failed, results };
}

// ============================================================================
// 개인화 함수 직접 테스트
// ============================================================================

async function testPersonalizationFunctions(): Promise<{ passed: number; failed: number; results: string[] }> {
  printSection("개인화 함수 직접 테스트");

  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  // 동적 임포트
  const { extractSajuProfile, generateSajuProfile, getAgeGroup } = await import("../lib/saju/personalized-keywords");
  const { shouldTriggerSearch, getMajorFortuneSummary, shouldTriggerSearchWithContext } = await import("../lib/saju/search-triggers");

  // Test 1: extractSajuProfile
  printSubSection("extractSajuProfile");
  try {
    const profile = extractSajuProfile(testSajuResult);
    const checks = [
      profile.personality.length > 0,
      profile.suitableIndustry.length > 0,
      profile.investmentStyle.length > 0,
      profile.careerTypes.length > 0,
      profile.summary.length > 0,
    ];
    const allPass = checks.every((c) => c);
    console.log(`  성향: ${profile.personality}`);
    console.log(`  적합 산업: ${profile.suitableIndustry}`);
    console.log(`  투자 스타일: ${profile.investmentStyle}`);
    console.log(`  => ${allPass ? "PASS" : "FAIL"}`);
    if (allPass) {
      passed++;
      results.push("extractSajuProfile: PASS");
    } else {
      failed++;
      results.push("extractSajuProfile: FAIL");
    }
  } catch (error) {
    console.log(`  => ERROR: ${error}`);
    failed++;
    results.push(`extractSajuProfile: ERROR`);
  }

  // Test 2: generateSajuProfile
  printSubSection("generateSajuProfile");
  try {
    const profile = generateSajuProfile(testSajuResult, 35);
    const hasContent = profile.length > 50;
    console.log(`  프로필 길이: ${profile.length}자`);
    console.log(`  => ${hasContent ? "PASS" : "FAIL"}`);
    if (hasContent) {
      passed++;
      results.push("generateSajuProfile: PASS");
    } else {
      failed++;
      results.push("generateSajuProfile: FAIL");
    }
  } catch (error) {
    console.log(`  => ERROR: ${error}`);
    failed++;
    results.push(`generateSajuProfile: ERROR`);
  }

  // Test 3: shouldTriggerSearch
  printSubSection("shouldTriggerSearch");
  try {
    const triggers = [
      { msg: "이직하고 싶어요", expected: "career" },
      { msg: "투자 추천해주세요", expected: "wealth" },
      { msg: "건강이 걱정돼요", expected: "health" },
      { msg: "연애운이 궁금해요", expected: "relationship" },
      { msg: "오늘 날씨 어때요?", expected: null },
    ];
    let allPass = true;
    for (const { msg, expected } of triggers) {
      const result = shouldTriggerSearch(msg);
      const matched = expected ? result.trigger?.category === expected : !result.shouldSearch;
      console.log(`  "${msg}" => ${result.trigger?.category || "none"} (${matched ? "O" : "X"})`);
      if (!matched) allPass = false;
    }
    console.log(`  => ${allPass ? "PASS" : "FAIL"}`);
    if (allPass) {
      passed++;
      results.push("shouldTriggerSearch: PASS");
    } else {
      failed++;
      results.push("shouldTriggerSearch: FAIL");
    }
  } catch (error) {
    console.log(`  => ERROR: ${error}`);
    failed++;
    results.push(`shouldTriggerSearch: ERROR`);
  }

  // Test 4: getMajorFortuneSummary
  printSubSection("getMajorFortuneSummary");
  try {
    const summary = getMajorFortuneSummary(testSajuResult, 1990, 2025);
    const hasContent = summary !== null && summary.length > 0;
    console.log(`  대운 요약: ${summary}`);
    console.log(`  => ${hasContent ? "PASS" : "FAIL"}`);
    if (hasContent) {
      passed++;
      results.push("getMajorFortuneSummary: PASS");
    } else {
      failed++;
      results.push("getMajorFortuneSummary: FAIL");
    }
  } catch (error) {
    console.log(`  => ERROR: ${error}`);
    failed++;
    results.push(`getMajorFortuneSummary: ERROR`);
  }

  // Test 5: shouldTriggerSearchWithContext
  printSubSection("shouldTriggerSearchWithContext");
  try {
    const context = {
      sajuResult: testSajuResult,
      birthYear: 1990,
      currentYear: 2025,
      currentAge: 36,
    };
    const result = shouldTriggerSearchWithContext("재테크 어떻게 해야 할까요?", context);
    const hasQueries = result.personalizedQueries.length > 0;
    console.log(`  트리거: ${result.trigger?.category || "none"}`);
    console.log(`  개인화 쿼리: ${result.personalizedQueries.length}개`);
    console.log(`  => ${hasQueries ? "PASS" : "FAIL"}`);
    if (hasQueries) {
      passed++;
      results.push("shouldTriggerSearchWithContext: PASS");
    } else {
      failed++;
      results.push("shouldTriggerSearchWithContext: FAIL");
    }
  } catch (error) {
    console.log(`  => ERROR: ${error}`);
    failed++;
    results.push(`shouldTriggerSearchWithContext: ERROR`);
  }

  // Test 6: getAgeGroup
  printSubSection("getAgeGroup");
  try {
    const ageGroup = getAgeGroup(1990, 2025);
    const isCorrect = ageGroup === "30대";
    console.log(`  나이대: ${ageGroup}`);
    console.log(`  => ${isCorrect ? "PASS" : "FAIL"}`);
    if (isCorrect) {
      passed++;
      results.push("getAgeGroup: PASS");
    } else {
      failed++;
      results.push("getAgeGroup: FAIL");
    }
  } catch (error) {
    console.log(`  => ERROR: ${error}`);
    failed++;
    results.push(`getAgeGroup: ERROR`);
  }

  return { passed, failed, results };
}

// ============================================================================
// 메인 실행
// ============================================================================

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("        Phase 6: API 통합 테스트");
  console.log("=".repeat(70));

  // 1. 개인화 함수 테스트 (서버 없이 가능)
  const funcResults = await testPersonalizationFunctions();

  // 2. 서버 상태 확인
  printSection("서버 상태 확인");
  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    console.log(`\n서버가 실행 중이 아닙니다.`);
    console.log(`다음 명령어로 서버를 시작하세요: npm run dev`);
    console.log(`\n개인화 함수 테스트 결과만 표시합니다.\n`);

    // 함수 테스트 결과만 출력
    printSection("최종 테스트 결과 (함수 테스트만)");
    console.log(`\n개인화 함수: ${funcResults.passed}/${funcResults.passed + funcResults.failed} 통과`);
    funcResults.results.forEach((r) => console.log(`  - ${r}`));

    const totalPassed = funcResults.passed;
    const totalFailed = funcResults.failed;

    console.log(`\n${"=".repeat(70)}`);
    console.log(`총 결과: ${totalPassed}/${totalPassed + totalFailed} 테스트 통과`);
    console.log(`${"=".repeat(70)}`);

    if (totalFailed === 0) {
      console.log("\n개인화 함수 테스트 모두 통과!");
      console.log("API 테스트를 위해서는 서버를 실행 후 다시 테스트해주세요.\n");
    }

    process.exit(totalFailed === 0 ? 0 : 1);
    return;
  }

  console.log(`서버가 실행 중입니다: ${BASE_URL}`);

  // 3. API 테스트
  const detailResults = await testDetailAPI();
  const chatResults = await testChatAPI();

  // 최종 결과
  printSection("최종 테스트 결과");

  console.log(`\n개인화 함수: ${funcResults.passed}/${funcResults.passed + funcResults.failed} 통과`);
  funcResults.results.forEach((r) => console.log(`  - ${r}`));

  console.log(`\nDetail API: ${detailResults.passed}/${detailResults.passed + detailResults.failed} 통과`);
  detailResults.results.forEach((r) => console.log(`  - ${r}`));

  console.log(`\nChat API: ${chatResults.passed}/${chatResults.passed + chatResults.failed} 통과`);
  chatResults.results.forEach((r) => console.log(`  - ${r}`));

  const totalPassed = funcResults.passed + detailResults.passed + chatResults.passed;
  const totalFailed = funcResults.failed + detailResults.failed + chatResults.failed;

  console.log(`\n${"=".repeat(70)}`);
  console.log(`총 결과: ${totalPassed}/${totalPassed + totalFailed} 테스트 통과`);
  console.log(`${"=".repeat(70)}`);

  if (totalFailed === 0) {
    console.log("\n모든 테스트 통과!\n");
    process.exit(0);
  } else {
    console.log(`\n${totalFailed}개 테스트 실패. 확인이 필요합니다.\n`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("테스트 실행 중 오류:", error);
  process.exit(1);
});
