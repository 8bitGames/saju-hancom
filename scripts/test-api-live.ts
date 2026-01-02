/**
 * 실제 API 라이브 테스트 스크립트
 * 개선된 프롬프트로 실제 AI 응답 확인
 *
 * 실행: npx tsx scripts/test-api-live.ts
 */

import { calculateSaju, summarizeSaju } from "../lib/saju";

// 테스트할 사주 데이터
const TEST_INPUT = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 0,
  gender: "male" as const,
  isLunar: false,
  longitude: 127.0,
};

// 테스트할 카테고리 (전체)
const CATEGORIES_TO_TEST = [
  // 기본 분석 탭
  "dayMaster", "tenGods", "stars", "fortune",
  // 종합 분석 탭
  "personality", "career", "wealth", "relationship", "health"
] as const;

const BASE_URL = process.env.API_URL || "http://localhost:3000";

async function testApiEndpoint(
  category: string,
  sajuResult: ReturnType<typeof calculateSaju>,
  sajuContext: string,
  locale: string = "ko"
) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  📡 API 테스트: ${category} (${locale})`);
  console.log(`${"=".repeat(70)}\n`);

  const requestBody = {
    category,
    sajuContext,
    sajuResult,
    gender: TEST_INPUT.gender,
    birthYear: TEST_INPUT.year,
    locale,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/saju/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": locale,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 오류 (${response.status}):`, errorText);
      return null;
    }

    // SSE 스트림 읽기
    const reader = response.body?.getReader();
    if (!reader) {
      console.error("❌ 응답 스트림 없음");
      return null;
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let tokenCount = 0;
    let groundingSources: string[] = [];

    console.log("📝 AI 응답:\n");
    console.log("-".repeat(60));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "text") {
              process.stdout.write(data.content);
              fullContent += data.content;
            } else if (data.type === "grounding") {
              groundingSources = data.sources || [];
            } else if (data.type === "metadata") {
              tokenCount = data.tokenCount || 0;
            } else if (data.type === "done") {
              console.log("\n");
            }
          } catch {
            // 파싱 실패 무시
          }
        }
      }
    }

    console.log("-".repeat(60));
    console.log(`\n📊 통계:`);
    console.log(`  - 응답 길이: ${fullContent.length}자`);
    console.log(`  - 예상 토큰: ~${Math.ceil(fullContent.length / 3)} 토큰`);

    if (groundingSources.length > 0) {
      console.log(`  - Grounding 소스: ${groundingSources.length}개`);
    }

    // 품질 검사
    console.log(`\n🔍 품질 검사:`);

    // 금지된 패턴 검사
    const forbiddenPatterns = [
      { pattern: /아까 말씀드렸/, name: "아까 말씀드렸" },
      { pattern: /앞서 살펴본/, name: "앞서 살펴본" },
      { pattern: /앞서 말씀드린/, name: "앞서 말씀드린" },
      { pattern: /\[.*탭\]/, name: "[탭] 언급" },
      { pattern: /다른 탭에서/, name: "다른 탭 언급" },
    ];

    let hasIssue = false;
    for (const { pattern, name } of forbiddenPatterns) {
      if (pattern.test(fullContent)) {
        console.log(`  ⚠️ 금지 패턴 발견: "${name}"`);
        hasIssue = true;
      }
    }

    // 긍정적 패턴 검사
    const positivePatterns = [
      { pattern: /타고나/, name: "타고난 표현" },
      { pattern: /(으|시)니까/, name: "자연스러운 연결어" },
      { pattern: /(거예요|셨을|하셨)/, name: "콜드리딩 스타일" },
    ];

    for (const { pattern, name } of positivePatterns) {
      if (pattern.test(fullContent)) {
        console.log(`  ✅ 긍정 패턴 발견: "${name}"`);
      }
    }

    if (!hasIssue) {
      console.log(`  ✅ 금지 패턴 없음 - 품질 통과!`);
    }

    return {
      category,
      content: fullContent,
      length: fullContent.length,
      hasIssue,
    };

  } catch (error) {
    console.error(`❌ 요청 실패:`, error);
    return null;
  }
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║           🚀 실제 API 라이브 테스트 (프롬프트 v1.6)                    ║
╚══════════════════════════════════════════════════════════════════════╝
`);

  console.log(`📅 테스트 일시: ${new Date().toLocaleString("ko-KR")}`);
  console.log(`🌐 API URL: ${BASE_URL}`);

  // 1. 사주 계산
  console.log(`\n📋 테스트 데이터:`);
  console.log(`  생년월일: ${TEST_INPUT.year}년 ${TEST_INPUT.month}월 ${TEST_INPUT.day}일`);
  console.log(`  출생시간: ${TEST_INPUT.hour}시 ${TEST_INPUT.minute}분`);
  console.log(`  성별: ${TEST_INPUT.gender === "male" ? "남성" : "여성"}`);

  const sajuResult = calculateSaju(TEST_INPUT);

  console.log(`\n🔮 사주 계산 결과:`);
  console.log(`  년주: ${sajuResult.pillars.year.ganZhi} (${sajuResult.pillars.year.koreanReading})`);
  console.log(`  월주: ${sajuResult.pillars.month.ganZhi} (${sajuResult.pillars.month.koreanReading})`);
  console.log(`  일주: ${sajuResult.pillars.day.ganZhi} (${sajuResult.pillars.day.koreanReading})`);
  console.log(`  시주: ${sajuResult.pillars.time.ganZhi} (${sajuResult.pillars.time.koreanReading})`);
  console.log(`  일간: ${sajuResult.dayMaster} - ${sajuResult.dayMasterDescription}`);

  // 사주 컨텍스트 생성
  const sajuContext = summarizeSaju(sajuResult);
  console.log(`\n📝 사주 컨텍스트:\n${sajuContext}`);

  // 2. API 테스트
  const results: Array<{category: string; content: string; length: number; hasIssue: boolean} | null> = [];

  for (const category of CATEGORIES_TO_TEST) {
    const result = await testApiEndpoint(category, sajuResult, sajuContext, "ko");
    results.push(result);

    // API 부하 방지를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 3. 최종 요약
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  📊 테스트 요약`);
  console.log(`${"=".repeat(70)}\n`);

  const successResults = results.filter(r => r !== null);

  console.log(`| 카테고리 | 응답길이 | 품질 |`);
  console.log(`|----------|----------|------|`);

  for (const result of successResults) {
    if (result) {
      const status = result.hasIssue ? "⚠️ 이슈" : "✅ 통과";
      console.log(`| ${result.category.padEnd(8)} | ${String(result.length).padStart(6)}자 | ${status} |`);
    }
  }

  const allPassed = successResults.every(r => r && !r.hasIssue);

  console.log(`\n${allPassed ? "🎉 모든 테스트 통과!" : "⚠️ 일부 이슈 발견"}`);
}

main().catch(console.error);
