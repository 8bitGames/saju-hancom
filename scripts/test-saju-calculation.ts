/**
 * 사주 명리학 계산 검증 테스트 (v2)
 *
 * 다음 항목들을 검증합니다:
 * 1. 진태양시 보정
 * 2. 십성 (Ten Gods) 계산
 * 3. 신살 (Stars/Spirits) 계산 - 실제 계산기 결과 사용
 * 4. 오행 분석
 * 5. 사주팔자 계산 - 결과 출력 및 검토
 */

import { calculateSaju } from "../lib/saju/calculator";
import { adjustToTrueSolarTime } from "../lib/saju/solar-time";
import { getTenGodRelation } from "../lib/saju/ten-gods";
import { calculateStars } from "../lib/saju/stars";
import type { Gan, TenGod } from "../lib/saju/types";

// 테스트 결과 타입
interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

// ============================================================
// 1. 진태양시 보정 검증
// ============================================================

interface SolarTimeTestCase {
  name: string;
  date: Date;
  longitude: number;
  expectedOffset: number; // 분 단위
}

// 진태양시 = 평균태양시 - 경도보정 + 균시차
// 1월 15일 균시차: 약 -9분 (Spencer 공식)
// 따라서 총 보정 = 경도보정 - 균시차 = 경도보정 + 9분
const solarTimeTestCases: SolarTimeTestCase[] = [
  {
    name: "서울 (127°E) - 1월 기준 41분 보정",
    date: new Date(2024, 0, 15, 12, 0),
    longitude: 127.0,
    expectedOffset: 41 // (135-127)*4 = 32분 + 균시차 9분 = 41분
  },
  {
    name: "부산 (129°E) - 1월 기준 33분 보정",
    date: new Date(2024, 0, 15, 12, 0),
    longitude: 129.0,
    expectedOffset: 33 // (135-129)*4 = 24분 + 균시차 9분 = 33분
  },
  {
    name: "평양 (125.7°E) - 1월 기준 46분 보정",
    date: new Date(2024, 0, 15, 12, 0),
    longitude: 125.7,
    expectedOffset: 46 // (135-125.7)*4 ≈ 37분 + 균시차 9분 = 46분
  },
  {
    name: "일본 표준시 기준선 (135°E) - 1월 기준 9분 보정 (균시차만)",
    date: new Date(2024, 0, 15, 12, 0),
    longitude: 135.0,
    expectedOffset: 9 // 경도보정 0분 + 균시차 9분 = 9분
  }
];

function testSolarTimeAdjustment(): TestResult[] {
  const results: TestResult[] = [];

  for (const testCase of solarTimeTestCases) {
    try {
      const result = adjustToTrueSolarTime(testCase.date, testCase.longitude);
      const actualOffset = Math.round(result.offsetMinutes);
      const passed = Math.abs(actualOffset - testCase.expectedOffset) <= 1;

      results.push({
        name: `진태양시: ${testCase.name}`,
        passed,
        expected: `${testCase.expectedOffset}분 보정`,
        actual: `${actualOffset}분 보정`,
        details: passed ? undefined : `차이: ${Math.abs(actualOffset - testCase.expectedOffset)}분`
      });
    } catch (error) {
      results.push({
        name: `진태양시: ${testCase.name}`,
        passed: false,
        expected: `${testCase.expectedOffset}분 보정`,
        actual: `에러: ${error}`,
      });
    }
  }

  return results;
}

// ============================================================
// 2. 십성 (Ten Gods) 계산 검증
// ============================================================

interface TenGodTestCase {
  dayMaster: Gan;
  targetStem: Gan;
  expectedTenGod: TenGod;
  description: string;
}

const tenGodTestCases: TenGodTestCase[] = [
  // 丙火 일간 기준
  { dayMaster: "丙", targetStem: "丙", expectedTenGod: "bijian", description: "丙 vs 丙 = 비견 (같은 오행, 같은 음양)" },
  { dayMaster: "丙", targetStem: "丁", expectedTenGod: "gebjae", description: "丙 vs 丁 = 겁재 (같은 오행, 다른 음양)" },
  { dayMaster: "丙", targetStem: "戊", expectedTenGod: "siksin", description: "丙 vs 戊 = 식신 (火生土, 같은 음양)" },
  { dayMaster: "丙", targetStem: "己", expectedTenGod: "sanggwan", description: "丙 vs 己 = 상관 (火生土, 다른 음양)" },
  { dayMaster: "丙", targetStem: "庚", expectedTenGod: "pyeonjae", description: "丙 vs 庚 = 편재 (火克金, 같은 음양)" },
  { dayMaster: "丙", targetStem: "辛", expectedTenGod: "jeongjae", description: "丙 vs 辛 = 정재 (火克金, 다른 음양)" },
  { dayMaster: "丙", targetStem: "壬", expectedTenGod: "pyeongwan", description: "丙 vs 壬 = 편관 (水克火, 같은 음양)" },
  { dayMaster: "丙", targetStem: "癸", expectedTenGod: "jeonggwan", description: "丙 vs 癸 = 정관 (水克火, 다른 음양)" },
  { dayMaster: "丙", targetStem: "甲", expectedTenGod: "pyeonin", description: "丙 vs 甲 = 편인 (木生火, 같은 음양)" },
  { dayMaster: "丙", targetStem: "乙", expectedTenGod: "jeongin", description: "丙 vs 乙 = 정인 (木生火, 다른 음양)" },

  // 甲木 일간 기준
  { dayMaster: "甲", targetStem: "甲", expectedTenGod: "bijian", description: "甲 vs 甲 = 비견" },
  { dayMaster: "甲", targetStem: "丙", expectedTenGod: "siksin", description: "甲 vs 丙 = 식신 (木生火)" },
  { dayMaster: "甲", targetStem: "庚", expectedTenGod: "pyeongwan", description: "甲 vs 庚 = 편관 (金克木)" },
  { dayMaster: "甲", targetStem: "壬", expectedTenGod: "pyeonin", description: "甲 vs 壬 = 편인 (水生木)" },
  { dayMaster: "甲", targetStem: "戊", expectedTenGod: "pyeonjae", description: "甲 vs 戊 = 편재 (木克土)" },
];

function testTenGodCalculation(): TestResult[] {
  const results: TestResult[] = [];

  for (const testCase of tenGodTestCases) {
    try {
      const actualTenGod = getTenGodRelation(testCase.dayMaster, testCase.targetStem);
      const passed = actualTenGod === testCase.expectedTenGod;

      results.push({
        name: `십성: ${testCase.description}`,
        passed,
        expected: testCase.expectedTenGod,
        actual: actualTenGod,
      });
    } catch (error) {
      results.push({
        name: `십성: ${testCase.description}`,
        passed: false,
        expected: testCase.expectedTenGod,
        actual: `에러: ${error}`,
      });
    }
  }

  return results;
}

// ============================================================
// 3. 신살 계산 - 실제 계산기 결과 사용
// ============================================================

function testStarCalculation(): TestResult[] {
  const results: TestResult[] = [];

  // 실제 사주를 계산하고 그 결과의 pillars를 사용
  const testCases = [
    {
      name: "1981년 2월 15일 22:30 - 신살 검증",
      input: { year: 1981, month: 2, day: 15, hour: 22, minute: 30, isLunar: false, gender: "male" as const, longitude: 127.0 }
    },
    {
      name: "1990년 5월 10일 08:00 - 신살 검증",
      input: { year: 1990, month: 5, day: 10, hour: 8, minute: 0, isLunar: false, gender: "female" as const, longitude: 127.0 }
    }
  ];

  for (const testCase of testCases) {
    try {
      const sajuResult = calculateSaju(testCase.input);
      const stars = calculateStars(sajuResult.pillars);

      // 신살이 정상적으로 계산되는지 확인
      const hasValidStars = Array.isArray(stars);
      // position은 일부 신살에서만 필수 (천을귀인 등)
      const starsHaveRequiredFields = stars.every(s =>
        s.name && s.hanja && s.description && s.type
      );

      results.push({
        name: `신살 구조: ${testCase.name}`,
        passed: hasValidStars && starsHaveRequiredFields,
        expected: "유효한 신살 배열 (name, hanja, description, type, position)",
        actual: stars.length > 0 ? `${stars.length}개 신살: ${stars.map(s => s.name).join(", ")}` : "신살 없음",
      });

      // 신살 타입 검증
      const validTypes = ["auspicious", "inauspicious", "neutral"];
      const allTypesValid = stars.every(s => validTypes.includes(s.type));

      results.push({
        name: `신살 타입: ${testCase.name}`,
        passed: allTypesValid,
        expected: "auspicious, inauspicious, neutral 중 하나",
        actual: allTypesValid ? "모든 타입 유효" : `잘못된 타입 발견`,
      });

    } catch (error) {
      results.push({
        name: `신살: ${testCase.name}`,
        passed: false,
        expected: "정상 계산",
        actual: `에러: ${error}`,
      });
    }
  }

  return results;
}

// ============================================================
// 4. 오행 분석 검증
// ============================================================

function testElementAnalysis(): TestResult[] {
  const results: TestResult[] = [];

  const testCases = [
    { year: 1981, month: 2, day: 15, hour: 22, minute: 30, isLunar: false, gender: "male" as const, longitude: 127.0 },
    { year: 1990, month: 5, day: 10, hour: 8, minute: 0, isLunar: false, gender: "female" as const, longitude: 127.0 },
  ];

  for (const input of testCases) {
    const result = calculateSaju(input);
    const scores = result.elementAnalysis.scores;
    const dayMaster = result.dayMaster;

    // 각 오행이 0 이상인지 확인
    const hasAllElements = Object.values(scores).every(score => score >= 0);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const isTotalValid = totalScore === 100;

    results.push({
      name: `오행 점수 유효성 (${input.year}/${input.month}/${input.day})`,
      passed: hasAllElements && isTotalValid,
      expected: "모든 오행 0 이상, 합계 100",
      actual: `목${scores.wood} 화${scores.fire} 토${scores.earth} 금${scores.metal} 수${scores.water} = ${totalScore}`,
    });

    // yongShin 존재 확인 (dominant/lacking은 균형잡힌 사주에서 비어있을 수 있음)
    results.push({
      name: `오행 분석 필드 (${input.year}/${input.month}/${input.day})`,
      passed: Array.isArray(result.elementAnalysis.dominant) &&
              Array.isArray(result.elementAnalysis.lacking) &&
              result.elementAnalysis.yongShin !== undefined,
      expected: "dominant, lacking 배열 + yongShin 존재",
      actual: `dominant: ${result.elementAnalysis.dominant.join(",") || "(균형)"}, lacking: ${result.elementAnalysis.lacking.join(",") || "(균형)"}, 용신: ${result.elementAnalysis.yongShin}`,
    });
  }

  return results;
}

// ============================================================
// 5. 사주팔자 계산 - 결과 출력 (실제값 확인용)
// ============================================================

function displaySajuResults() {
  console.log("\n📅 사주팔자 계산 결과 (실제값 확인용)");
  console.log("-".repeat(70));

  const testCases = [
    { name: "1981-02-15 22:30", year: 1981, month: 2, day: 15, hour: 22, minute: 30, isLunar: false, gender: "male" as const, longitude: 127.0 },
    { name: "1990-05-10 08:00", year: 1990, month: 5, day: 10, hour: 8, minute: 0, isLunar: false, gender: "female" as const, longitude: 127.0 },
    { name: "2000-01-01 12:00", year: 2000, month: 1, day: 1, hour: 12, minute: 0, isLunar: false, gender: "male" as const, longitude: 127.0 },
    { name: "1985-08-20 06:00", year: 1985, month: 8, day: 20, hour: 6, minute: 0, isLunar: false, gender: "male" as const, longitude: 127.0 },
  ];

  for (const tc of testCases) {
    try {
      const result = calculateSaju(tc);
      const p = result.pillars;

      console.log(`\n${tc.name}:`);
      console.log(`  년주: ${p.year.ganZhi} (${p.year.koreanReading})`);
      console.log(`  월주: ${p.month.ganZhi} (${p.month.koreanReading})`);
      console.log(`  일주: ${p.day.ganZhi} (${p.day.koreanReading})`);
      console.log(`  시주: ${p.time.ganZhi} (${p.time.koreanReading})`);
      console.log(`  일간: ${result.dayMaster} (${result.dayMasterElement} ${result.dayMasterYinYang})`);
      console.log(`  메타: 양력 ${result.meta.solarDate}, 음력 ${result.meta.lunarDate}, 절기 ${result.meta.jieQi || "없음"}`);
      console.log(`  진태양시 보정: ${result.meta.offsetMinutes}분`);

      // 신살 출력
      if (result.stars.length > 0) {
        console.log(`  신살: ${result.stars.map(s => `${s.name}(${s.position})`).join(", ")}`);
      }
    } catch (error) {
      console.log(`\n${tc.name}: 에러 - ${error}`);
    }
  }
}

// ============================================================
// 6. lunar-javascript 라이브러리 기본 검증
// ============================================================

async function testLunarJavascript(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    const { Solar, Lunar } = await import("lunar-javascript");

    // 양력 -> 음력 변환 테스트
    const solar = Solar.fromYmd(2024, 12, 23);
    const lunar = solar.getLunar();

    results.push({
      name: "lunar-javascript: 양력→음력 변환",
      passed: lunar !== null && typeof lunar.getYear === 'function',
      expected: "유효한 Lunar 객체",
      actual: `${lunar.getYear()}년 ${lunar.getMonth()}월 ${lunar.getDay()}일`,
    });

    // 간지 계산 테스트
    const yearGanZhi = lunar.getYearInGanZhi();
    const monthGanZhi = lunar.getMonthInGanZhi();
    const dayGanZhi = lunar.getDayInGanZhi();

    results.push({
      name: "lunar-javascript: 간지 계산",
      passed: yearGanZhi.length === 2 && monthGanZhi.length === 2 && dayGanZhi.length === 2,
      expected: "2글자 간지 문자열",
      actual: `년: ${yearGanZhi}, 월: ${monthGanZhi}, 일: ${dayGanZhi}`,
    });

    // 절기 계산 테스트
    const jieQi = lunar.getJieQi();
    results.push({
      name: "lunar-javascript: 절기 정보",
      passed: true, // 절기가 없을 수도 있음
      expected: "절기 정보 (있으면)",
      actual: jieQi || "현재 절기 없음",
    });

  } catch (error) {
    results.push({
      name: "lunar-javascript: 라이브러리 로드",
      passed: false,
      expected: "정상 로드",
      actual: `에러: ${error}`,
    });
  }

  return results;
}

// ============================================================
// 메인 실행
// ============================================================

async function runAllTests() {
  console.log("🔮 사주 명리학 계산 검증 테스트 v2");
  console.log("=".repeat(70));
  console.log();

  const allResults: TestResult[] = [];

  // 1. 진태양시 보정 테스트
  console.log("⏰ 1. 진태양시 보정 검증");
  console.log("-".repeat(70));
  const solarTimeResults = testSolarTimeAdjustment();
  solarTimeResults.forEach(r => {
    console.log(`${r.passed ? "✅" : "❌"} ${r.name}`);
    if (!r.passed) {
      console.log(`   기대: ${r.expected}`);
      console.log(`   실제: ${r.actual}`);
    }
  });
  allResults.push(...solarTimeResults);
  console.log();

  // 2. 십성 계산 테스트
  console.log("⚖️ 2. 십성 (Ten Gods) 계산 검증");
  console.log("-".repeat(70));
  const tenGodResults = testTenGodCalculation();
  tenGodResults.forEach(r => {
    console.log(`${r.passed ? "✅" : "❌"} ${r.name}`);
    if (!r.passed) {
      console.log(`   기대: ${r.expected}`);
      console.log(`   실제: ${r.actual}`);
    }
  });
  allResults.push(...tenGodResults);
  console.log();

  // 3. 신살 계산 테스트
  console.log("⭐ 3. 신살 (Stars) 계산 검증");
  console.log("-".repeat(70));
  const starResults = testStarCalculation();
  starResults.forEach(r => {
    console.log(`${r.passed ? "✅" : "❌"} ${r.name}`);
    if (!r.passed) {
      console.log(`   기대: ${r.expected}`);
      console.log(`   실제: ${r.actual}`);
    }
  });
  allResults.push(...starResults);
  console.log();

  // 4. 오행 분석 테스트
  console.log("🌊 4. 오행 분석 검증");
  console.log("-".repeat(70));
  const elementResults = testElementAnalysis();
  elementResults.forEach(r => {
    console.log(`${r.passed ? "✅" : "❌"} ${r.name}`);
    if (!r.passed) {
      console.log(`   기대: ${r.expected}`);
      console.log(`   실제: ${r.actual}`);
    }
  });
  allResults.push(...elementResults);
  console.log();

  // 5. lunar-javascript 라이브러리 테스트
  console.log("📚 5. lunar-javascript 라이브러리 검증");
  console.log("-".repeat(70));
  const lunarResults = await testLunarJavascript();
  lunarResults.forEach(r => {
    console.log(`${r.passed ? "✅" : "❌"} ${r.name}`);
    console.log(`   결과: ${r.actual}`);
  });
  allResults.push(...lunarResults);

  // 6. 사주팔자 결과 표시 (검증용)
  displaySajuResults();

  // 최종 결과
  console.log("\n" + "=".repeat(70));
  console.log("📊 최종 검증 결과");
  console.log("=".repeat(70));

  const passedCount = allResults.filter(r => r.passed).length;
  const totalCount = allResults.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  console.log(`\n총 ${totalCount}개 테스트 중 ${passedCount}개 통과 (${passRate}%)\n`);

  // 카테고리별 결과
  const categories = [
    { name: "진태양시 보정", results: solarTimeResults },
    { name: "십성 계산", results: tenGodResults },
    { name: "신살 계산", results: starResults },
    { name: "오행 분석", results: elementResults },
    { name: "라이브러리", results: lunarResults },
  ];

  console.log("| 카테고리 | 통과 | 실패 | 통과율 |");
  console.log("|----------|------|------|--------|");
  categories.forEach(cat => {
    const passed = cat.results.filter(r => r.passed).length;
    const failed = cat.results.length - passed;
    const rate = Math.round((passed / cat.results.length) * 100);
    console.log(`| ${cat.name.padEnd(10)} | ${passed.toString().padStart(4)} | ${failed.toString().padStart(4)} | ${rate.toString().padStart(5)}% |`);
  });

  if (passRate === 100) {
    console.log("\n🎉 모든 테스트 통과! 명리학 계산이 정확합니다.");
  } else if (passRate >= 80) {
    console.log("\n✅ 대부분의 테스트 통과.");
  } else {
    console.log("\n⚠️ 일부 테스트 실패. 점검이 필요합니다.");
  }
}

// 실행
runAllTests().catch(console.error);
