/**
 * 대화 AI 실제 테스트 스크립트
 *
 * 10가지 현실 세계 질문으로 Multi-Agent 시스템이
 * 현재 상황(2025년 12월, 연말, 을사년)을 제대로 반영하는지 테스트
 */

import { getPersonalizedContext } from "../lib/saju/agents";
import type { SajuResult, Pillar, Gan, Zhi, Element } from "../lib/saju/types";

// 천간 오행 매핑
const ganElements: Record<Gan, Element> = {
  "甲": "wood", "乙": "wood",
  "丙": "fire", "丁": "fire",
  "戊": "earth", "己": "earth",
  "庚": "metal", "辛": "metal",
  "壬": "water", "癸": "water"
};

// 지지 오행 매핑 (정기 기준)
const zhiElements: Record<Zhi, Element> = {
  "子": "water", "丑": "earth",
  "寅": "wood", "卯": "wood",
  "辰": "earth", "巳": "fire",
  "午": "fire", "未": "earth",
  "申": "metal", "酉": "metal",
  "戌": "earth", "亥": "water"
};

// Pillar 생성 헬퍼
function createPillar(gan: Gan, zhi: Zhi, koreanReading: string): Pillar {
  return {
    gan,
    zhi,
    ganZhi: `${gan}${zhi}`,
    ganElement: ganElements[gan],
    ganYinYang: ["甲", "丙", "戊", "庚", "壬"].includes(gan) ? "yang" : "yin",
    zhiElement: zhiElements[zhi],
    zhiYinYang: ["子", "寅", "辰", "午", "申", "戌"].includes(zhi) ? "yang" : "yin",
    zhiHiddenGan: [], // 간략화
    koreanReading
  };
}

// 테스트용 사주 데이터 (44세 남성, 역마살/천을귀인)
const testSajuResult: SajuResult = {
  pillars: {
    year: createPillar("辛", "酉", "신유"),
    month: createPillar("庚", "寅", "경인"),
    day: createPillar("丙", "午", "병오"),
    time: createPillar("己", "亥", "기해")
  },
  dayMaster: "丙",
  dayMasterElement: "fire",
  dayMasterYinYang: "yang",
  dayMasterDescription: "丙火는 태양과 같이 밝고 따뜻한 성격으로, 리더십이 있습니다",
  elementAnalysis: {
    scores: {
      wood: 15,
      fire: 35,
      earth: 15,
      metal: 25,
      water: 10
    },
    dominant: ["fire"],
    lacking: ["water"],
    balance: "unbalanced",
    yongShin: "water"
  },
  tenGods: {
    year: { gan: "pyeonjae", zhi: null },
    month: { gan: "pyeongwan", zhi: null },
    day: { gan: "bijian", zhi: null },
    time: { gan: "sanggwan", zhi: null }
  },
  tenGodSummary: {
    dominant: ["pyeonjae", "sanggwan"],
    lacking: ["jeongjae", "jeongin"],
    counts: {
      bijian: 1,
      gebjae: 0,
      siksin: 0,
      sanggwan: 1,
      pyeonjae: 1,
      jeongjae: 0,
      pyeongwan: 1,
      jeonggwan: 0,
      pyeonin: 0,
      jeongin: 0
    }
  },
  stars: [
    {
      name: "역마살",
      hanja: "驛馬",
      description: "이동과 변화가 많은 삶",
      type: "neutral",
      position: "year"
    },
    {
      name: "천을귀인",
      hanja: "天乙貴人",
      description: "귀인의 도움을 받는 운",
      type: "auspicious",
      position: "day"
    }
  ],
  meta: {
    solarDate: "1981-02-15",
    lunarDate: "1981-01-11",
    inputTime: "22:30",
    trueSolarTime: "22:15",
    jieQi: "입춘",
    longitude: 127.0,
    offsetMinutes: -15
  }
};

// 10가지 현실 세계 질문
const realWorldQuestions = [
  {
    id: 1,
    category: "이직/커리어",
    question: "올해 안에 이직해야 할까요, 내년으로 미뤄야 할까요?",
    checkPoints: ["연말", "을사년", "2026", "시기", "이직", "직업", "커리어", "12월", "겨울"]
  },
  {
    id: 2,
    category: "재물/투자",
    question: "연말 보너스를 어떻게 투자하면 좋을까요?",
    checkPoints: ["연말", "투자", "재물", "보너스", "12월", "겨울", "재테크"]
  },
  {
    id: 3,
    category: "건강",
    question: "요즘 피로감이 심한데, 건강 관리 어떻게 해야 할까요?",
    checkPoints: ["겨울", "건강", "피로", "신장", "수분", "주의", "방광"]
  },
  {
    id: 4,
    category: "연애",
    question: "크리스마스 전에 고백해도 될까요?",
    checkPoints: ["크리스마스", "12월", "연말", "고백", "연애", "겨울"]
  },
  {
    id: 5,
    category: "가족",
    question: "설 연휴에 가족 갈등이 걱정되는데 어떻게 대처할까요?",
    checkPoints: ["설", "연휴", "가족", "을사년", "2026", "새해", "겨울"]
  },
  {
    id: 6,
    category: "학업/자격증",
    question: "내년 시험을 위해 지금부터 준비해야 할까요?",
    checkPoints: ["내년", "2026", "시험", "준비", "겨울", "계획", "학업"]
  },
  {
    id: 7,
    category: "부동산",
    question: "지금 집을 사는 게 좋을까요, 기다려야 할까요?",
    checkPoints: ["부동산", "시기", "투자", "재물", "집", "매매"]
  },
  {
    id: 8,
    category: "창업/사업",
    question: "내년에 창업을 계획 중인데 타이밍이 맞을까요?",
    checkPoints: ["창업", "사업", "2026", "을사년", "타이밍", "시기", "새해"]
  },
  {
    id: 9,
    category: "대인관계",
    question: "직장 동료와 갈등이 있는데 어떻게 해결할까요?",
    checkPoints: ["동료", "갈등", "관계", "직장", "대인", "소통"]
  },
  {
    id: 10,
    category: "새해 계획",
    question: "2026년을 위해 지금 준비해야 할 것이 있을까요?",
    checkPoints: ["2026", "새해", "준비", "계획", "을사년", "연말", "겨울"]
  }
];

async function testChatWithQuestion(
  question: typeof realWorldQuestions[0],
  sajuResult: SajuResult,
  birthYear: number
): Promise<{
  question: string;
  category: string;
  personalizedContext: string;
  checkResults: { keyword: string; found: boolean }[];
  passed: boolean;
}> {
  // Multi-Agent 시스템으로 개인화 컨텍스트 생성
  const personalizedContext = await getPersonalizedContext(
    sajuResult,
    birthYear,
    "male",
    "ko",
    question.question
  );

  // 체크포인트 검증 (대소문자 무시)
  const contextLower = personalizedContext.toLowerCase();
  const checkResults = question.checkPoints.map(keyword => ({
    keyword,
    found: contextLower.includes(keyword.toLowerCase()) ||
           personalizedContext.includes(keyword)
  }));

  // 최소 2개 이상의 체크포인트가 발견되면 통과
  const foundCount = checkResults.filter(r => r.found).length;
  const passed = foundCount >= 2;

  return {
    question: question.question,
    category: question.category,
    personalizedContext,
    checkResults,
    passed
  };
}

async function runAllTests() {
  const currentDate = new Date();
  console.log("🤖 대화 AI 현실 세계 질문 테스트");
  console.log(`테스트 일시: ${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`);
  console.log("=".repeat(70));
  console.log();

  console.log("👤 테스트 인물: 김철수 (44세 남성, 丙火 일간, 역마살/천을귀인)");
  console.log("=".repeat(70));
  console.log();

  const results: Array<{
    id: number;
    category: string;
    question: string;
    passed: boolean;
    foundKeywords: string[];
    missedKeywords: string[];
  }> = [];

  for (const q of realWorldQuestions) {
    console.log(`\n📝 질문 ${q.id}: [${q.category}]`);
    console.log(`   "${q.question}"`);
    console.log("-".repeat(70));

    try {
      const result = await testChatWithQuestion(q, testSajuResult, 1981);

      const foundKeywords = result.checkResults.filter(r => r.found).map(r => r.keyword);
      const missedKeywords = result.checkResults.filter(r => !r.found).map(r => r.keyword);

      console.log("\n📋 생성된 개인화 컨텍스트 (핵심 발췌):");
      // 컨텍스트에서 핵심 부분만 추출
      const contextLines = result.personalizedContext.split("\n");
      let printing = false;
      let lineCount = 0;
      for (const line of contextLines) {
        if (line.includes("현재 시점") || line.includes("프로필") || line.includes("추천") || line.includes("피해야")) {
          printing = true;
        }
        if (printing && line.trim() && lineCount < 8) {
          console.log(`   ${line.trim()}`);
          lineCount++;
        }
        if (lineCount >= 8) break;
      }

      console.log("\n✅ 발견된 키워드:", foundKeywords.length > 0 ? foundKeywords.join(", ") : "없음");
      console.log("❌ 미발견 키워드:", missedKeywords.length > 0 ? missedKeywords.join(", ") : "없음");
      console.log(`\n결과: ${result.passed ? "✅ 통과" : "⚠️ 부분 통과"}`);

      results.push({
        id: q.id,
        category: q.category,
        question: q.question,
        passed: result.passed,
        foundKeywords,
        missedKeywords
      });
    } catch (error) {
      console.error(`   ❌ 에러 발생: ${error}`);
      results.push({
        id: q.id,
        category: q.category,
        question: q.question,
        passed: false,
        foundKeywords: [],
        missedKeywords: q.checkPoints
      });
    }
  }

  // 최종 결과 요약
  console.log("\n" + "=".repeat(70));
  console.log("📊 최종 테스트 결과");
  console.log("=".repeat(70));

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log("\n| # | 카테고리 | 결과 | 발견된 키워드 |");
  console.log("|---|----------|------|---------------|");

  results.forEach(r => {
    const status = r.passed ? "✅" : "⚠️";
    const keywords = r.foundKeywords.slice(0, 4).join(", ");
    console.log(`| ${r.id.toString().padStart(2)} | ${r.category.padEnd(10)} | ${status} | ${keywords} |`);
  });

  console.log();
  console.log(`총 결과: ${passedCount}/${totalCount} 테스트 통과 (${Math.round(passedCount/totalCount*100)}%)`);

  if (passedCount === totalCount) {
    console.log("\n🎉 모든 테스트 통과! Multi-Agent 시스템이 현실 세계 질문에 적절히 대응합니다.");
  } else if (passedCount >= totalCount * 0.8) {
    console.log("\n✅ 대부분의 테스트 통과! 시스템이 정상적으로 작동합니다.");
  } else {
    console.log("\n⚠️ 일부 테스트 실패. 시스템 점검이 필요합니다.");
  }

  // 상세 분석
  console.log("\n" + "=".repeat(70));
  console.log("🔍 상세 분석");
  console.log("=".repeat(70));

  // 가장 많이 발견된 키워드
  const allFoundKeywords: Record<string, number> = {};
  results.forEach(r => {
    r.foundKeywords.forEach(k => {
      allFoundKeywords[k] = (allFoundKeywords[k] || 0) + 1;
    });
  });

  console.log("\n📈 가장 자주 반영된 컨텍스트:");
  Object.entries(allFoundKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([keyword, count]) => {
      console.log(`   - ${keyword}: ${count}회`);
    });

  // 가장 많이 누락된 키워드
  const allMissedKeywords: Record<string, number> = {};
  results.forEach(r => {
    r.missedKeywords.forEach(k => {
      allMissedKeywords[k] = (allMissedKeywords[k] || 0) + 1;
    });
  });

  if (Object.keys(allMissedKeywords).length > 0) {
    console.log("\n📉 개선이 필요한 컨텍스트:");
    Object.entries(allMissedKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([keyword, count]) => {
        console.log(`   - ${keyword}: ${count}회 누락`);
      });
  }

  console.log("\n" + "=".repeat(70));
}

// 실행
runAllTests().catch(console.error);
