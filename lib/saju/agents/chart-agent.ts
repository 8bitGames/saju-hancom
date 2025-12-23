/**
 * Chart Agent (사주 축 에이전트)
 *
 * 역할: 사주팔자 분석을 통한 개인화 정보 추출
 * - 신살 분석 → 개인화 플래그 (역마살 → 결혼 조언 피하기 등)
 * - 십성 분석 → 성격/적성 프로필
 * - 오행 분석 → 건강 주의 영역
 * - 일간 분석 → 성격 특성
 */

import type {
  ChartAgentInput,
  ChartAgentOutput,
  PersonalizationFlags,
  HealthFlags,
  PersonalityProfile
} from "./types";
import type { SajuResult, Star, TenGod, Element, TenGodSummary } from "../types";

// 오행과 장기 매핑
const ELEMENT_ORGANS: Record<Element, { ko: string[]; en: string[] }> = {
  wood: { ko: ["간", "담", "눈"], en: ["liver", "gallbladder", "eyes"] },
  fire: { ko: ["심장", "소장", "혀"], en: ["heart", "small intestine", "tongue"] },
  earth: { ko: ["비장", "위", "입"], en: ["spleen", "stomach", "mouth"] },
  metal: { ko: ["폐", "대장", "피부"], en: ["lungs", "large intestine", "skin"] },
  water: { ko: ["신장", "방광", "귀"], en: ["kidneys", "bladder", "ears"] }
};

// 오행 한글
const ELEMENT_KOREAN: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)"
};

// 십성별 의미와 생활 영역
interface TenGodMeaning {
  meaning: string;
  lifeAspect: string;
  careerHint: string;
}

const TEN_GOD_MEANINGS: Record<TenGod, { ko: TenGodMeaning; en: TenGodMeaning }> = {
  bijian: {
    ko: { meaning: "나와 같은 오행, 독립심", lifeAspect: "경쟁, 형제", careerHint: "독립사업, 프리랜서" },
    en: { meaning: "Same element as me, independence", lifeAspect: "Competition, siblings", careerHint: "Independent business, freelance" }
  },
  gebjae: {
    ko: { meaning: "경쟁과 도전, 재물 유출", lifeAspect: "경쟁자, 재정 변동", careerHint: "투자, 모험적 사업" },
    en: { meaning: "Competition and challenge, wealth outflow", lifeAspect: "Competitors, financial changes", careerHint: "Investment, adventurous business" }
  },
  siksin: {
    ko: { meaning: "표현력, 창의성, 예술적 재능", lifeAspect: "자녀, 창작활동", careerHint: "예술가, 작가, 요리사" },
    en: { meaning: "Expression, creativity, artistic talent", lifeAspect: "Children, creative activities", careerHint: "Artist, writer, chef" }
  },
  sanggwan: {
    ko: { meaning: "날카로운 통찰력, 반항심", lifeAspect: "직장 변동, 이직", careerHint: "비평가, 컨설턴트, 전문직" },
    en: { meaning: "Sharp insight, rebelliousness", lifeAspect: "Job changes, career shifts", careerHint: "Critic, consultant, professional" }
  },
  pyeonjae: {
    ko: { meaning: "투기적 재물, 부수입", lifeAspect: "부업, 투자", careerHint: "투자자, 사업가, 영업" },
    en: { meaning: "Speculative wealth, side income", lifeAspect: "Side job, investment", careerHint: "Investor, entrepreneur, sales" }
  },
  jeongjae: {
    ko: { meaning: "안정적 재물, 정직한 수입", lifeAspect: "급여, 저축", careerHint: "회사원, 공무원, 은행원" },
    en: { meaning: "Stable wealth, honest income", lifeAspect: "Salary, savings", careerHint: "Employee, civil servant, banker" }
  },
  pyeongwan: {
    ko: { meaning: "권력과 통제, 압박", lifeAspect: "직장 스트레스, 권위", careerHint: "경찰, 군인, 관리자" },
    en: { meaning: "Power and control, pressure", lifeAspect: "Work stress, authority", careerHint: "Police, military, manager" }
  },
  jeonggwan: {
    ko: { meaning: "명예와 책임, 조직력", lifeAspect: "직장, 사회적 지위", careerHint: "공무원, 대기업, 리더" },
    en: { meaning: "Honor and responsibility, organization", lifeAspect: "Work, social status", careerHint: "Civil servant, corporate, leader" }
  },
  pyeonin: {
    ko: { meaning: "비전통적 학습, 영적 능력", lifeAspect: "종교, 철학, 비주류", careerHint: "역술가, 종교인, 연구자" },
    en: { meaning: "Non-traditional learning, spiritual ability", lifeAspect: "Religion, philosophy, alternative", careerHint: "Fortune teller, clergy, researcher" }
  },
  jeongin: {
    ko: { meaning: "학문과 지식, 어머니의 사랑", lifeAspect: "학업, 자격증", careerHint: "교사, 학자, 전문가" },
    en: { meaning: "Learning and knowledge, maternal love", lifeAspect: "Studies, certifications", careerHint: "Teacher, scholar, expert" }
  }
};

/**
 * 신살에서 개인화 플래그 추출
 */
function extractPersonalizationFlags(stars: Star[], locale: "ko" | "en"): PersonalizationFlags {
  const flags: PersonalizationFlags = {
    avoidMarriageAdvice: false,
    emphasizeCareer: false,
    healthCaution: false,
    emphasizeWealth: false,
    emphasizeMovement: false,
    emphasizeStudy: false,
    relationshipCaution: false,
    emphasizeLeadership: false
  };

  const starNames = stars.map(s => s.name.toLowerCase());
  const starHanja = stars.map(s => s.hanja);

  // 역마살 (驛馬殺) - 이동/변화 많음, 결혼 피하기
  if (starHanja.includes("驛馬") || starNames.some(n => n.includes("역마"))) {
    flags.avoidMarriageAdvice = true;
    flags.emphasizeMovement = true;
  }

  // 도화살 (桃花殺) - 이성 인연 많음, 대인관계 주의
  if (starHanja.includes("桃花") || starNames.some(n => n.includes("도화"))) {
    flags.relationshipCaution = true;
  }

  // 화개살 (華蓋殺) - 학문, 예술적 재능
  if (starHanja.includes("華蓋") || starNames.some(n => n.includes("화개"))) {
    flags.emphasizeStudy = true;
  }

  // 장성살 (將星殺) - 리더십, 권력
  if (starHanja.includes("將星") || starNames.some(n => n.includes("장성"))) {
    flags.emphasizeLeadership = true;
    flags.emphasizeCareer = true;
  }

  // 천을귀인 (天乙貴人) - 귀인운, 사업운
  if (starHanja.includes("天乙貴人") || starNames.some(n => n.includes("천을귀인"))) {
    flags.emphasizeCareer = true;
  }

  // 금여록 (金與祿) - 재물운
  if (starHanja.includes("金輿") || starNames.some(n => n.includes("금여") || n.includes("록"))) {
    flags.emphasizeWealth = true;
  }

  // 양인살 (羊刃殺) - 건강 주의
  if (starHanja.includes("羊刃") || starNames.some(n => n.includes("양인"))) {
    flags.healthCaution = true;
  }

  // 괴강살 (魁罡殺) - 강한 성격, 직장 변동
  if (starHanja.includes("魁罡") || starNames.some(n => n.includes("괴강"))) {
    flags.emphasizeCareer = true;
    flags.relationshipCaution = true;
  }

  return flags;
}

/**
 * 오행 분석에서 건강 플래그 추출
 */
function extractHealthFlags(
  sajuResult: SajuResult,
  locale: "ko" | "en"
): HealthFlags {
  const { elementAnalysis } = sajuResult;
  const watchAreas: string[] = [];
  const recommendations: string[] = [];

  // 부족한 오행의 관련 장기 주의
  for (const element of elementAnalysis.lacking) {
    const organs = ELEMENT_ORGANS[element]?.[locale] || [];
    watchAreas.push(...organs);
  }

  // 과다한 오행 확인
  const excessElements: Element[] = [];
  const lackingElements = elementAnalysis.lacking;

  for (const [element, score] of Object.entries(elementAnalysis.scores) as [Element, number][]) {
    if (score > 30) {
      excessElements.push(element);
    }
  }

  // 건강 권장사항 생성
  if (locale === "ko") {
    if (lackingElements.includes("water")) {
      recommendations.push("수분 섭취를 충분히 하세요");
      recommendations.push("신장 건강에 주의하세요");
    }
    if (lackingElements.includes("wood")) {
      recommendations.push("간 건강 관리가 필요합니다");
      recommendations.push("눈의 피로에 주의하세요");
    }
    if (lackingElements.includes("fire")) {
      recommendations.push("심장과 혈액순환에 주의하세요");
      recommendations.push("스트레스 관리가 중요합니다");
    }
    if (lackingElements.includes("earth")) {
      recommendations.push("소화기 건강에 주의하세요");
      recommendations.push("규칙적인 식사가 중요합니다");
    }
    if (lackingElements.includes("metal")) {
      recommendations.push("호흡기 건강에 주의하세요");
      recommendations.push("피부 관리가 필요합니다");
    }
  } else {
    if (lackingElements.includes("water")) {
      recommendations.push("Stay well hydrated");
      recommendations.push("Pay attention to kidney health");
    }
    if (lackingElements.includes("wood")) {
      recommendations.push("Liver health management needed");
      recommendations.push("Watch for eye strain");
    }
    if (lackingElements.includes("fire")) {
      recommendations.push("Pay attention to heart and circulation");
      recommendations.push("Stress management is important");
    }
    if (lackingElements.includes("earth")) {
      recommendations.push("Pay attention to digestive health");
      recommendations.push("Regular meals are important");
    }
    if (lackingElements.includes("metal")) {
      recommendations.push("Pay attention to respiratory health");
      recommendations.push("Skin care is needed");
    }
  }

  const elementImbalance = (lackingElements.length > 0 || excessElements.length > 0)
    ? {
        lacking: lackingElements,
        excess: excessElements,
        advice: locale === "ko"
          ? `${lackingElements.map(e => ELEMENT_KOREAN[e]).join(", ")} 기운이 부족하므로 보완이 필요합니다.`
          : `Need to supplement ${lackingElements.join(", ")} energy which is lacking.`
      }
    : undefined;

  return {
    watchAreas,
    recommendations,
    elementImbalance
  };
}

/**
 * 십성 분석에서 성격/적성 프로필 추출
 */
function extractPersonalityProfile(
  tenGodSummary: TenGodSummary,
  locale: "ko" | "en"
): PersonalityProfile {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suitableCareers: string[] = [];
  let relationshipStyle = "";

  const dominant = tenGodSummary.dominant;
  const lacking = tenGodSummary.lacking;

  // 우세한 십성에서 강점 추출
  for (const tenGod of dominant) {
    const meaning = TEN_GOD_MEANINGS[tenGod]?.[locale];
    if (meaning) {
      strengths.push(meaning.meaning);
      suitableCareers.push(meaning.careerHint);
    }
  }

  // 부족한 십성에서 약점 추출
  if (locale === "ko") {
    if (lacking.includes("jeongjae")) {
      weaknesses.push("안정적 재물 관리가 어려울 수 있음");
    }
    if (lacking.includes("jeonggwan")) {
      weaknesses.push("조직 생활에 어려움을 겪을 수 있음");
    }
    if (lacking.includes("jeongin")) {
      weaknesses.push("학업에 대한 인내가 부족할 수 있음");
    }
    if (lacking.includes("siksin")) {
      weaknesses.push("표현력이 다소 부족할 수 있음");
    }
  } else {
    if (lacking.includes("jeongjae")) {
      weaknesses.push("May struggle with stable wealth management");
    }
    if (lacking.includes("jeonggwan")) {
      weaknesses.push("May face difficulties in organizational life");
    }
    if (lacking.includes("jeongin")) {
      weaknesses.push("May lack patience in studies");
    }
    if (lacking.includes("siksin")) {
      weaknesses.push("May be somewhat lacking in expressiveness");
    }
  }

  // 대인관계 스타일
  if (dominant.includes("bijian") || dominant.includes("gebjae")) {
    relationshipStyle = locale === "ko"
      ? "독립적이고 경쟁적인 관계를 형성하는 편입니다"
      : "Tends to form independent and competitive relationships";
  } else if (dominant.includes("jeonggwan") || dominant.includes("jeongin")) {
    relationshipStyle = locale === "ko"
      ? "안정적이고 신뢰를 중시하는 관계를 선호합니다"
      : "Prefers stable relationships based on trust";
  } else if (dominant.includes("siksin") || dominant.includes("sanggwan")) {
    relationshipStyle = locale === "ko"
      ? "표현력이 풍부하고 창의적인 소통을 즐깁니다"
      : "Enjoys expressive and creative communication";
  } else {
    relationshipStyle = locale === "ko"
      ? "균형 잡힌 대인관계를 형성합니다"
      : "Forms balanced interpersonal relationships";
  }

  return {
    strengths: Array.from(new Set(strengths)),
    weaknesses: Array.from(new Set(weaknesses)),
    suitableCareers: Array.from(new Set(suitableCareers)),
    relationshipStyle
  };
}

/**
 * 주요 신살 해석 생성
 */
function interpretStars(
  stars: Star[],
  locale: "ko" | "en"
): Array<{ star: Star; interpretation: string; advice: string }> {
  const interpretations: Array<{ star: Star; interpretation: string; advice: string }> = [];

  // 주요 신살 해석 (최대 5개)
  const importantStars = stars.slice(0, 5);

  for (const star of importantStars) {
    let interpretation = star.description;
    let advice = "";

    if (locale === "ko") {
      switch (star.type) {
        case "auspicious":
          advice = "이 길신의 기운을 적극 활용하세요";
          break;
        case "inauspicious":
          advice = "주의가 필요하지만 노력으로 극복할 수 있습니다";
          break;
        case "neutral":
          advice = "상황에 따라 좋게 작용할 수 있습니다";
          break;
      }
    } else {
      switch (star.type) {
        case "auspicious":
          advice = "Actively utilize this auspicious energy";
          break;
        case "inauspicious":
          advice = "Needs attention but can be overcome with effort";
          break;
        case "neutral":
          advice = "Can work positively depending on the situation";
          break;
      }
    }

    interpretations.push({ star, interpretation, advice });
  }

  return interpretations;
}

/**
 * 사주 기반 컨텍스트 메시지 생성
 */
function generateChartContext(
  sajuResult: SajuResult,
  personalizationFlags: PersonalizationFlags,
  locale: "ko" | "en"
): string {
  const { dayMaster, dayMasterElement, dayMasterDescription } = sajuResult;

  if (locale === "ko") {
    // dayMasterDescription이 마침표로 끝나지 않으면 추가
    const description = dayMasterDescription.endsWith(".")
      ? dayMasterDescription
      : dayMasterDescription + ".";

    let context = `일간이 ${dayMaster}(${ELEMENT_KOREAN[dayMasterElement]})로, ${description}`;

    if (personalizationFlags.emphasizeCareer) {
      context += " 사업운과 직장운이 주요 관심사입니다.";
    }
    if (personalizationFlags.emphasizeMovement) {
      context += " 이동과 변화가 많은 인생입니다.";
    }
    if (personalizationFlags.avoidMarriageAdvice) {
      context += " 자유로운 삶을 추구하는 성향이 있습니다.";
    }

    return context;
  } else {
    // Ensure description ends with period
    const description = dayMasterDescription.endsWith(".")
      ? dayMasterDescription
      : dayMasterDescription + ".";

    let context = `Day Master is ${dayMaster} (${dayMasterElement}), ${description}`;

    if (personalizationFlags.emphasizeCareer) {
      context += " Career and business fortune are key concerns.";
    }
    if (personalizationFlags.emphasizeMovement) {
      context += " A life with much movement and change.";
    }
    if (personalizationFlags.avoidMarriageAdvice) {
      context += " Tends to pursue a free lifestyle.";
    }

    return context;
  }
}

/**
 * 주요 십성 분석 생성
 */
function analyzeDominantTenGods(
  tenGodSummary: TenGodSummary,
  locale: "ko" | "en"
): Array<{ tenGod: TenGod; meaning: string; lifeAspect: string }> {
  const analysis: Array<{ tenGod: TenGod; meaning: string; lifeAspect: string }> = [];

  for (const tenGod of tenGodSummary.dominant) {
    const meanings = TEN_GOD_MEANINGS[tenGod]?.[locale];
    if (meanings) {
      analysis.push({
        tenGod,
        meaning: meanings.meaning,
        lifeAspect: meanings.lifeAspect
      });
    }
  }

  return analysis;
}

/**
 * Chart Agent 메인 함수
 */
export async function runChartAgent(input: ChartAgentInput): Promise<ChartAgentOutput> {
  const { sajuResult, locale } = input;

  // 개인화 플래그 추출
  const personalizationFlags = extractPersonalizationFlags(sajuResult.stars, locale);

  // 건강 플래그 추출
  const healthFlags = extractHealthFlags(sajuResult, locale);

  // 성격/적성 프로필 추출
  const personalityProfile = extractPersonalityProfile(sajuResult.tenGodSummary, locale);

  // 주요 신살 해석
  const significantStars = interpretStars(sajuResult.stars, locale);

  // 사주 기반 컨텍스트 메시지
  const chartContext = generateChartContext(sajuResult, personalizationFlags, locale);

  // 주요 십성 분석
  const dominantTenGods = analyzeDominantTenGods(sajuResult.tenGodSummary, locale);

  return {
    dayMaster: {
      gan: sajuResult.dayMaster,
      element: sajuResult.dayMasterElement,
      description: sajuResult.dayMasterDescription
    },
    personalizationFlags,
    healthFlags,
    personalityProfile,
    significantStars,
    chartContext,
    dominantTenGods
  };
}

export default runChartAgent;
