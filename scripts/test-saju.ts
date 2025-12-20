/**
 * 사주 계산 테스트 스크립트
 * 실행: npx tsx scripts/test-saju.ts
 */

import { calculateSaju, summarizeSaju } from "../lib/saju";

// 테스트 케이스: 1990년 1월 15일 오후 1시 30분, 남성, 양력, 서울
const testInput = {
  year: 1990,
  month: 1,
  day: 15,
  hour: 13,
  minute: 30,
  gender: "male" as const,
  isLunar: false,
  longitude: 127.0,
};

console.log("=== 사주 계산 테스트 ===\n");
console.log("입력:", testInput);
console.log("");

try {
  const result = calculateSaju(testInput);

  console.log("=== 결과 ===\n");
  console.log(summarizeSaju(result));
  console.log("");

  console.log("=== 메타 정보 ===");
  console.log("양력:", result.meta.solarDate);
  console.log("음력:", result.meta.lunarDate);
  console.log("입력시간:", result.meta.inputTime);
  console.log("진태양시:", result.meta.trueSolarTime);
  console.log("보정시간:", result.meta.offsetMinutes, "분");
  console.log("절기:", result.meta.jieQi);
  console.log("");

  console.log("=== 십성 분석 ===");
  console.log("주요 십성:", result.tenGodSummary.dominant.join(", ") || "없음");
  console.log("부재 십성:", result.tenGodSummary.lacking.join(", ") || "없음");
  console.log("");

  console.log("=== 오행 균형 ===");
  console.log("균형 상태:", result.elementAnalysis.balance);
  console.log("강한 오행:", result.elementAnalysis.dominant.join(", ") || "없음");
  console.log("약한 오행:", result.elementAnalysis.lacking.join(", ") || "없음");
  console.log("용신:", result.elementAnalysis.yongShin || "없음");

  console.log("\n✅ 테스트 성공!");
} catch (error) {
  console.error("❌ 테스트 실패:", error);
  process.exit(1);
}
