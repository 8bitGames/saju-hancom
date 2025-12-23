/**
 * Temporal Agent (시간 축 에이전트)
 *
 * 역할: 현재 시점의 시간적 맥락을 분석
 * - 세운(歲運) 계산: 올해의 천간지지
 * - 월운 계산: 이번 달의 천간지지
 * - Google Grounding으로 월별/시즌별 관심사 검색
 * - 시기 적절한 조언 포인트 도출
 */

import { GoogleGenAI } from "@google/genai";
import type { TemporalAgentInput, TemporalAgentOutput, Season } from "./types";
import type { Element } from "../types";
import { GEMINI_MODEL } from "@/lib/constants/ai";

// 천간 (10개)
const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const STEMS_KOREAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];

// 지지 (12개)
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BRANCHES_KOREAN = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const BRANCHES_ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

// 천간 오행
const STEM_ELEMENTS: Record<string, Element> = {
  "甲": "wood", "乙": "wood",
  "丙": "fire", "丁": "fire",
  "戊": "earth", "己": "earth",
  "庚": "metal", "辛": "metal",
  "壬": "water", "癸": "water"
};

// 오행 한글
const ELEMENT_KOREAN: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)"
};

/**
 * 연도의 천간지지 계산
 */
function calculateYearlyPillar(year: number): { gan: string; zhi: string; ganKorean: string; zhiKorean: string; animal: string } {
  // 1984년은 갑자년 (甲子年)
  const baseYear = 1984;
  const diff = year - baseYear;

  const ganIndex = ((diff % 10) + 10) % 10;
  const zhiIndex = ((diff % 12) + 12) % 12;

  return {
    gan: HEAVENLY_STEMS[ganIndex],
    zhi: EARTHLY_BRANCHES[zhiIndex],
    ganKorean: STEMS_KOREAN[ganIndex],
    zhiKorean: BRANCHES_KOREAN[zhiIndex],
    animal: BRANCHES_ANIMALS[zhiIndex]
  };
}

/**
 * 월의 천간지지 계산 (간략 버전)
 * 실제로는 절기 기준으로 계산해야 하지만, 간략화하여 사용
 */
function calculateMonthlyPillar(year: number, month: number): { gan: string; zhi: string } {
  // 월지는 인월(寅月)이 1월 (입춘 기준)
  // 절기 고려하지 않은 간략 버전
  const monthBranches = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const zhiIndex = (month - 1) % 12;
  const zhi = monthBranches[zhiIndex];

  // 월간은 연간에 따라 결정 (오호둔월법)
  const yearPillar = calculateYearlyPillar(year);
  const yearGanIndex = HEAVENLY_STEMS.indexOf(yearPillar.gan);
  const monthGanBase = (yearGanIndex % 5) * 2;
  const ganIndex = (monthGanBase + (month - 1)) % 10;

  return {
    gan: HEAVENLY_STEMS[ganIndex],
    zhi
  };
}

/**
 * 월에서 계절 추출
 */
function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
}

/**
 * 계절별 시즌 키워드
 */
function getSeasonKeywords(month: number, locale: "ko" | "en"): string[] {
  const seasonKeywords: Record<number, { ko: string[]; en: string[] }> = {
    1: { ko: ["새해", "신년 계획", "겨울"], en: ["new year", "resolutions", "winter"] },
    2: { ko: ["설날", "새해 운세", "겨울"], en: ["lunar new year", "fortune", "winter"] },
    3: { ko: ["봄", "새학기", "이직"], en: ["spring", "new semester", "job change"] },
    4: { ko: ["봄", "벚꽃", "새출발"], en: ["spring", "cherry blossom", "fresh start"] },
    5: { ko: ["가정의 달", "어버이날", "봄"], en: ["family month", "parents day", "spring"] },
    6: { ko: ["여름 시작", "상반기 마무리", "휴가"], en: ["summer start", "mid-year", "vacation"] },
    7: { ko: ["여름 휴가", "장마", "더위"], en: ["summer vacation", "monsoon", "heat"] },
    8: { ko: ["여름", "휴가", "재충전"], en: ["summer", "vacation", "recharge"] },
    9: { ko: ["가을", "추석", "새학기"], en: ["autumn", "chuseok", "new semester"] },
    10: { ko: ["가을", "단풍", "결실"], en: ["autumn", "fall foliage", "harvest"] },
    11: { ko: ["연말 준비", "수능", "가을"], en: ["year-end prep", "college exam", "autumn"] },
    12: { ko: ["연말", "크리스마스", "한 해 정리"], en: ["year end", "christmas", "year review"] }
  };

  return seasonKeywords[month]?.[locale] || seasonKeywords[1][locale];
}

/**
 * Google Grounding을 통한 시즌별 관심사 검색
 */
async function searchSeasonalInterests(
  input: TemporalAgentInput
): Promise<{ topics: string[]; searchQuery: string; groundingSources?: Array<{ url: string; title: string }> }> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    // API 키 없으면 기본값 반환
    return {
      topics: getSeasonKeywords(input.currentMonth, input.locale),
      searchQuery: ""
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // 검색 쿼리 생성
  const genderText = input.locale === "ko"
    ? (input.gender === "male" ? "남성" : "여성")
    : (input.gender === "male" ? "male" : "female");

  const searchQuery = input.locale === "ko"
    ? `${input.ageGroup} ${genderText} ${input.currentYear}년 ${input.currentMonth}월 관심사 트렌드 운세`
    : `${input.ageGroup} ${genderText} ${input.currentMonth}/${input.currentYear} interests trends fortune`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        tools: [{ googleSearch: {} }]
      },
      contents: [{
        role: "user",
        parts: [{
          text: input.locale === "ko"
            ? `${searchQuery}

위 검색 결과를 바탕으로, ${input.ageGroup} ${genderText}이 ${input.currentMonth}월에 가장 관심 가질 만한 주제 5가지를 한 줄씩 나열해주세요.
형식:
1. 주제1
2. 주제2
...`
            : `${searchQuery}

Based on the search results, list 5 topics that ${input.ageGroup} ${genderText} would be most interested in during ${input.currentMonth}/${input.currentYear}.
Format:
1. Topic1
2. Topic2
...`
        }]
      }]
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    // 응답에서 토픽 추출
    const lines = text.split("\n").filter(line => line.match(/^\d+\./));
    const topics = lines.map(line => line.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);

    // 소스 추출
    const sources = groundingMetadata?.groundingChunks
      ?.filter((chunk: { web?: { uri?: string; title?: string } }) => chunk.web?.uri)
      .map((chunk: { web?: { uri?: string; title?: string } }) => ({
        url: chunk.web?.uri || "",
        title: chunk.web?.title || ""
      }))
      .slice(0, 3) || [];

    return {
      topics: topics.length > 0 ? topics : getSeasonKeywords(input.currentMonth, input.locale),
      searchQuery,
      groundingSources: sources
    };
  } catch (error) {
    console.error("Seasonal interests search failed:", error);
    return {
      topics: getSeasonKeywords(input.currentMonth, input.locale),
      searchQuery
    };
  }
}

/**
 * 시간 기반 컨텍스트 메시지 생성
 */
function generateTemporalContext(
  yearPillar: { gan: string; zhi: string; ganKorean: string; zhiKorean: string; animal: string },
  month: number,
  locale: "ko" | "en"
): string {
  const element = STEM_ELEMENTS[yearPillar.gan];
  const elementKorean = ELEMENT_KOREAN[element];

  if (locale === "ko") {
    return `올해 ${yearPillar.ganKorean}${yearPillar.zhiKorean}년(${yearPillar.animal}띠)은 ${elementKorean}의 기운이 강한 해입니다. 현재 ${month}월, ${getSeason(month)}의 기운이 흐르고 있습니다.`;
  } else {
    return `This year (${yearPillar.gan}${yearPillar.zhi}, Year of the ${yearPillar.animal}) is dominated by ${element} energy. Currently in month ${month}, ${getSeason(month)} energy is flowing.`;
  }
}

/**
 * 시기별 조언 포인트 생성
 */
function generateTimingAdvice(
  month: number,
  locale: "ko" | "en"
): string[] {
  const adviceMap: Record<number, { ko: string[]; en: string[] }> = {
    1: {
      ko: ["새해 목표를 세우기 좋은 시기", "차분히 한 해를 계획하세요", "건강 관리 시작하기 좋은 때"],
      en: ["Good time to set new year goals", "Plan your year calmly", "Good time to start health management"]
    },
    2: {
      ko: ["설 연휴 가족과의 시간을 소중히", "새해 운세를 점검하기 좋은 때", "재충전의 시간"],
      en: ["Cherish time with family during Lunar New Year", "Good time to check your fortune", "Time for recharging"]
    },
    3: {
      ko: ["새로운 시작에 좋은 시기", "이직이나 변화를 고려할 때", "봄기운으로 활력 충전"],
      en: ["Good time for new beginnings", "Consider job changes", "Recharge with spring energy"]
    },
    4: {
      ko: ["계획한 일을 실행에 옮기세요", "대인관계 확장 좋은 시기", "자기계발 시작하기 좋은 때"],
      en: ["Put your plans into action", "Good time to expand relationships", "Good time to start self-improvement"]
    },
    5: {
      ko: ["가정에 관심을 기울이세요", "부모님께 효도하기 좋은 때", "중간 점검의 시기"],
      en: ["Focus on family", "Good time to show filial piety", "Time for mid-point review"]
    },
    6: {
      ko: ["상반기 마무리 점검", "하반기 계획 수립", "휴식과 재충전 필요"],
      en: ["Review first half of the year", "Plan for second half", "Need rest and recharge"]
    },
    7: {
      ko: ["무더위 건강 관리 주의", "휴가로 재충전하세요", "가벼운 마음으로 여유를"],
      en: ["Watch your health in the heat", "Recharge with vacation", "Take it easy with a light heart"]
    },
    8: {
      ko: ["여름 마무리 준비", "가을 계획 세우기", "에너지 재충전 시기"],
      en: ["Prepare to wrap up summer", "Plan for autumn", "Time to recharge energy"]
    },
    9: {
      ko: ["추석 명절 가족 화합", "하반기 본격 시작", "결실의 계절 준비"],
      en: ["Family harmony during Chuseok", "Full start of second half", "Prepare for harvest season"]
    },
    10: {
      ko: ["결실을 맺을 시기", "성과를 점검하세요", "겨울 준비 시작"],
      en: ["Time to bear fruit", "Check your achievements", "Start preparing for winter"]
    },
    11: {
      ko: ["연말 준비 시작", "한 해 마무리 계획", "차분히 정리하는 시간"],
      en: ["Start year-end preparations", "Plan to wrap up the year", "Time to organize calmly"]
    },
    12: {
      ko: ["한 해를 돌아보는 시간", "새해 계획 미리 세우기", "감사와 마무리의 달"],
      en: ["Time to reflect on the year", "Start planning for next year", "Month of gratitude and closure"]
    }
  };

  return adviceMap[month]?.[locale] || adviceMap[1][locale];
}

/**
 * Temporal Agent 메인 함수
 */
export async function runTemporalAgent(input: TemporalAgentInput): Promise<TemporalAgentOutput> {
  // 세운 계산
  const yearPillar = calculateYearlyPillar(input.currentYear);
  const yearElement = STEM_ELEMENTS[yearPillar.gan];

  // 월운 계산
  const monthPillar = calculateMonthlyPillar(input.currentYear, input.currentMonth);
  const monthElement = STEM_ELEMENTS[monthPillar.gan];

  // 계절
  const season = getSeason(input.currentMonth);

  // Google Grounding으로 시즌별 관심사 검색
  const seasonalInterests = await searchSeasonalInterests(input);

  // 시간 기반 컨텍스트
  const temporalContext = generateTemporalContext(yearPillar, input.currentMonth, input.locale);

  // 시기별 조언
  const timingAdvice = generateTimingAdvice(input.currentMonth, input.locale);

  return {
    yearlyPillar: {
      gan: yearPillar.gan,
      zhi: yearPillar.zhi,
      element: yearElement,
      description: input.locale === "ko"
        ? `${yearPillar.ganKorean}${yearPillar.zhiKorean}년 (${yearPillar.animal}띠, ${ELEMENT_KOREAN[yearElement]})`
        : `${yearPillar.gan}${yearPillar.zhi} year (${yearPillar.animal}, ${yearElement})`
    },
    monthlyPillar: {
      gan: monthPillar.gan,
      zhi: monthPillar.zhi,
      element: monthElement
    },
    season,
    seasonalInterests,
    temporalContext,
    timingAdvice
  };
}

export default runTemporalAgent;
