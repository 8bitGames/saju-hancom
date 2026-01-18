/**
 * 개인화 키워드 변환 엔진
 * 사주 데이터를 Google Grounding 검색용 개인화 키워드로 변환
 */

import type { TenGod, Element, TenGodSummary, ElementAnalysis, SajuResult, MajorFortunePeriod } from "./types";
import { TEN_GOD_INFO, ELEMENT_KOREAN } from "./constants";

// ============================================================================
// 타입 정의
// ============================================================================

export interface PersonalityKeywords {
  /** 성격 특성 */
  personality: string[];
  /** 일하는 스타일 */
  workStyle: string[];
  /** 적합 직업군 */
  careerTypes: string[];
  /** 강점 */
  strengths: string[];
}

export interface IndustryKeywords {
  /** 전통 산업 */
  traditionalIndustries: string[];
  /** 현대 산업 (2020년대 트렌드) */
  modernIndustries: string[];
  /** 투자 성향 */
  investmentStyles: string[];
}

export interface RelationshipKeywords {
  /** 연애 스타일 */
  datingStyle: string[];
  /** 이상형 특성 */
  idealPartner: string[];
  /** 관계 조언 키워드 */
  relationshipAdvice: string[];
}

export interface HealthKeywords {
  /** 주의해야 할 건강 영역 */
  vulnerableAreas: string[];
  /** 권장 건강 관리법 */
  recommendedCare: string[];
}

export interface GroundingContext {
  /** 현재 연도 */
  currentYear: number;
  /** 현재 월 */
  currentMonth: number;
  /** 나이대 */
  ageGroup: string;
  /** 현재 나이 (한국 나이) */
  currentAge?: number;
  /** 사주 결과 */
  sajuResult: SajuResult;
}

export interface PersonalizedSearchQueries {
  career: string[];
  wealth: string[];
  relationship: string[];
  health: string[];
  fortune: string[];
}

// ============================================================================
// 십성 → 성격/직업 키워드 매핑
// ============================================================================

export const TEN_GOD_KEYWORDS: Record<TenGod, PersonalityKeywords> = {
  bijian: {
    personality: ["독립적인", "자존심 강한", "리더십 있는"],
    workStyle: ["프리랜서", "1인 기업", "독립 사업"],
    careerTypes: ["창업가", "1인 크리에이터", "자영업자"],
    strengths: ["자기주도", "추진력", "경쟁력"],
  },
  gebjae: {
    personality: ["도전적인", "승부욕 강한", "적극적인"],
    workStyle: ["성과급 기반", "경쟁 환경", "도전적 업무"],
    careerTypes: ["영업", "스타트업", "투자자"],
    strengths: ["도전정신", "위기대응", "빠른 판단"],
  },
  siksin: {
    personality: ["온화한", "표현력 있는", "사교적인"],
    workStyle: ["안정적 직장", "전문직", "교육 분야"],
    careerTypes: ["교사", "상담사", "콘텐츠 크리에이터"],
    strengths: ["소통능력", "창작력", "안정추구"],
  },
  sanggwan: {
    personality: ["창의적인", "예술적인", "개성 강한"],
    workStyle: ["프리랜서 아티스트", "창작 업무", "자유로운 환경"],
    careerTypes: ["디자이너", "작가", "유튜버", "예술가"],
    strengths: ["창의성", "독창성", "예술감각"],
  },
  pyeonjae: {
    personality: ["사업수완 있는", "융통성 있는", "재테크 관심"],
    workStyle: ["투자", "무역", "유통"],
    careerTypes: ["투자자", "무역상", "부동산"],
    strengths: ["재무감각", "기회포착", "협상력"],
  },
  jeongjae: {
    personality: ["성실한", "계획적인", "안정 추구"],
    workStyle: ["정규직", "대기업", "공무원"],
    careerTypes: ["회계사", "금융권", "공기업"],
    strengths: ["꼼꼼함", "신뢰성", "계획성"],
  },
  pyeongwan: {
    personality: ["카리스마 있는", "결단력 있는", "추진력 강한"],
    workStyle: ["리더십 포지션", "도전적 환경", "변화 주도"],
    careerTypes: ["경영자", "군인", "경찰", "검사"],
    strengths: ["리더십", "결단력", "위기관리"],
  },
  jeonggwan: {
    personality: ["명예 중시", "책임감 강한", "원칙주의"],
    workStyle: ["관리직", "공직", "전문직"],
    careerTypes: ["공무원", "판사", "기업 임원"],
    strengths: ["책임감", "명예", "조직관리"],
  },
  pyeonin: {
    personality: ["학구적인", "분석적인", "연구지향"],
    workStyle: ["연구개발", "기술직", "전문분야"],
    careerTypes: ["연구원", "개발자", "분석가"],
    strengths: ["분석력", "전문성", "학습능력"],
  },
  jeongin: {
    personality: ["지적인", "학문 중시", "배움 추구"],
    workStyle: ["교육", "학술", "자격증 기반"],
    careerTypes: ["교수", "연구원", "전문가"],
    strengths: ["학습력", "지식", "자격증"],
  },
};

// ============================================================================
// 오행 → 산업/투자 키워드 매핑
// ============================================================================

export const ELEMENT_KEYWORDS: Record<Element, IndustryKeywords> = {
  wood: {
    traditionalIndustries: ["목재", "가구", "농업", "임업", "섬유", "출판"],
    modernIndustries: ["친환경", "ESG", "신재생에너지", "바이오", "헬스케어", "교육테크"],
    investmentStyles: ["성장주", "장기투자", "친환경 펀드", "바이오 주식"],
  },
  fire: {
    traditionalIndustries: ["전자", "에너지", "미디어", "광고", "요식업"],
    modernIndustries: ["AI", "반도체", "메타버스", "디지털 콘텐츠", "전기차", "배터리"],
    investmentStyles: ["성장주", "기술주", "반도체 ETF", "AI 관련주"],
  },
  earth: {
    traditionalIndustries: ["부동산", "건설", "농업", "요식업", "중개업"],
    modernIndustries: ["프롭테크", "스마트시티", "물류", "플랫폼", "인프라"],
    investmentStyles: ["부동산", "리츠", "인프라 펀드", "배당주"],
  },
  metal: {
    traditionalIndustries: ["금융", "철강", "기계", "자동차", "보석"],
    modernIndustries: ["핀테크", "로봇", "자율주행", "방산", "우주항공"],
    investmentStyles: ["금", "은", "원자재", "가치주", "배당주"],
  },
  water: {
    traditionalIndustries: ["무역", "물류", "수산업", "여행", "음료"],
    modernIndustries: ["글로벌 이커머스", "물류테크", "해양에너지", "관광테크"],
    investmentStyles: ["글로벌 분산투자", "해외주식", "ETF", "유동성 자산"],
  },
};

// ============================================================================
// 오행 → 연애/관계 키워드 매핑
// ============================================================================

export const ELEMENT_RELATIONSHIP_KEYWORDS: Record<Element, RelationshipKeywords> = {
  wood: {
    datingStyle: ["성장하는 관계", "함께 발전", "자유로운 연애"],
    idealPartner: ["성장 지향적인", "독립적인", "포용력 있는"],
    relationshipAdvice: ["소통 중심", "서로 존중", "개인 시간 확보"],
  },
  fire: {
    datingStyle: ["열정적인 연애", "활동적인 데이트", "적극적 표현"],
    idealPartner: ["활발한", "밝은", "표현 잘하는"],
    relationshipAdvice: ["감정 조절", "상대 배려", "충동 조심"],
  },
  earth: {
    datingStyle: ["안정적인 연애", "진중한 만남", "결혼 지향"],
    idealPartner: ["신뢰할 수 있는", "가정적인", "책임감 있는"],
    relationshipAdvice: ["꾸준한 노력", "현실적 계획", "가족 중시"],
  },
  metal: {
    datingStyle: ["원칙 있는 연애", "명확한 관계", "품위 있는 만남"],
    idealPartner: ["깔끔한", "원칙적인", "성실한"],
    relationshipAdvice: ["유연성 기르기", "감정 표현", "타협 연습"],
  },
  water: {
    datingStyle: ["로맨틱한 연애", "감성적 교류", "깊은 대화"],
    idealPartner: ["감성적인", "이해심 있는", "지적인"],
    relationshipAdvice: ["현실 직시", "경계 설정", "감정 정리"],
  },
};

// ============================================================================
// 오행 → 건강 키워드 매핑
// ============================================================================

export const ELEMENT_HEALTH_KEYWORDS: Record<Element, HealthKeywords> = {
  wood: {
    vulnerableAreas: ["간", "담낭", "눈", "근육", "신경계"],
    recommendedCare: ["스트레스 관리", "눈 건강", "간 보호", "근육 이완"],
  },
  fire: {
    vulnerableAreas: ["심장", "소장", "혈관", "혈압", "정신건강"],
    recommendedCare: ["심폐 운동", "혈압 관리", "멘탈 케어", "열 조절"],
  },
  earth: {
    vulnerableAreas: ["위장", "비장", "소화기", "피부", "면역력"],
    recommendedCare: ["소화 관리", "규칙적 식사", "면역력 강화", "피부 관리"],
  },
  metal: {
    vulnerableAreas: ["폐", "대장", "피부", "호흡기", "알레르기"],
    recommendedCare: ["호흡기 관리", "피부 보습", "폐 건강", "알레르기 예방"],
  },
  water: {
    vulnerableAreas: ["신장", "방광", "뼈", "귀", "생식기"],
    recommendedCare: ["수분 섭취", "신장 보호", "뼈 건강", "충분한 수면"],
  },
};

// ============================================================================
// 개인화 검색 쿼리 생성 함수
// ============================================================================

/**
 * 사주 결과에서 주요 십성 추출
 */
function getDominantTenGods(summary: TenGodSummary | undefined): TenGod[] {
  // 🛡️ 방어적 null 체크
  if (!summary) {
    return [];
  }

  // 지배적인 십성이 있으면 해당 십성 반환
  const dominant = summary.dominant || [];
  if (dominant.length > 0) {
    return dominant.slice(0, 2); // 최대 2개
  }

  // 없으면 가장 많이 나온 십성 찾기
  const counts = summary.counts || {};
  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  if (sorted.length > 0) {
    return [sorted[0][0] as TenGod];
  }

  return [];
}

/**
 * 나이대 문자열 생성
 */
export function getAgeGroup(birthYear: number, currentYear: number): string {
  const age = currentYear - birthYear + 1; // 한국 나이
  const decade = Math.floor(age / 10) * 10;
  return `${decade}대`;
}

/**
 * 현재 대운 기간 찾기
 */
export function getCurrentMajorFortune(
  sajuResult: SajuResult,
  currentAge: number
): MajorFortunePeriod | null {
  if (!sajuResult.majorFortune?.periods) return null;

  for (const period of sajuResult.majorFortune.periods) {
    if (currentAge >= period.startAge && currentAge <= period.endAge) {
      return period;
    }
  }
  return null;
}

/**
 * 대운 오행과 일간의 관계 분석
 */
export function analyzeMajorFortuneRelation(
  dayMasterElement: Element,
  fortuneElement: Element
): "생조" | "극제" | "비화" | "설기" | "중화" {
  // 오행 상생상극 관계
  const relations: Record<Element, { generates: Element; controls: Element; controlledBy: Element; generatedBy: Element }> = {
    wood: { generates: "fire", controls: "earth", controlledBy: "metal", generatedBy: "water" },
    fire: { generates: "earth", controls: "metal", controlledBy: "water", generatedBy: "wood" },
    earth: { generates: "metal", controls: "water", controlledBy: "wood", generatedBy: "fire" },
    metal: { generates: "water", controls: "wood", controlledBy: "fire", generatedBy: "earth" },
    water: { generates: "wood", controls: "fire", controlledBy: "earth", generatedBy: "metal" },
  };

  const rel = relations[dayMasterElement];

  if (fortuneElement === rel.generatedBy) return "생조"; // 대운이 나를 생해줌
  if (fortuneElement === rel.controlledBy) return "극제"; // 대운이 나를 극함
  if (fortuneElement === dayMasterElement) return "비화"; // 같은 오행
  if (fortuneElement === rel.generates) return "설기"; // 내가 대운을 생함 (기운 소모)
  return "중화"; // 내가 대운을 극함 (기운 소모)
}

/**
 * 대운 기반 검색 키워드 생성
 */
export function getMajorFortuneKeywords(
  sajuResult: SajuResult,
  currentAge: number
): { keywords: string[]; description: string } | null {
  const currentFortune = getCurrentMajorFortune(sajuResult, currentAge);
  if (!currentFortune) return null;

  const fortuneElement = currentFortune.pillar.ganElement;
  const dayMasterElement = sajuResult.dayMasterElement;
  const relation = analyzeMajorFortuneRelation(dayMasterElement, fortuneElement);

  const fortuneGan = currentFortune.pillar.gan;
  const fortuneKorean = currentFortune.pillar.koreanReading;
  const elementKorean = ELEMENT_KOREAN[fortuneElement];

  const keywords: string[] = [];
  let description = "";

  switch (relation) {
    case "생조":
      keywords.push("운세 상승기", "기회의 시기", "발전 가능성");
      description = `${fortuneKorean} 대운으로 ${elementKorean}의 기운이 도움을 주는 시기`;
      break;
    case "극제":
      keywords.push("도전의 시기", "변화 대응", "위기 관리");
      description = `${fortuneKorean} 대운으로 ${elementKorean}의 기운이 도전을 주는 시기`;
      break;
    case "비화":
      keywords.push("경쟁과 협력", "동료 관계", "자기 강화");
      description = `${fortuneKorean} 대운으로 같은 기운이 강해지는 시기`;
      break;
    case "설기":
      keywords.push("표현의 시기", "창작 활동", "에너지 분출");
      description = `${fortuneKorean} 대운으로 기운을 발산하는 시기`;
      break;
    case "중화":
      keywords.push("리더십 발휘", "통제력 향상", "주도적 활동");
      description = `${fortuneKorean} 대운으로 주도적인 역할이 강해지는 시기`;
      break;
  }

  return { keywords, description };
}

/**
 * 커리어 관련 개인화 검색 쿼리 생성
 */
export function generateCareerQueries(context: GroundingContext): string[] {
  const { currentYear, sajuResult, ageGroup, currentAge } = context;
  const queries: string[] = [];

  const dominantGods = getDominantTenGods(sajuResult.tenGodSummary);
  const dominantElement = sajuResult.elementAnalysis.dominant[0];
  const yongShin = sajuResult.elementAnalysis.yongShin;

  // 🆕 대운 기반 검색 쿼리 (최우선)
  if (currentAge) {
    const fortuneInfo = getMajorFortuneKeywords(sajuResult, currentAge);
    if (fortuneInfo) {
      const { keywords } = fortuneInfo;
      if (keywords[0]) {
        queries.push(`${currentYear}년 ${keywords[0]} 직업 변화 전략`);
      }
    }

    // 현재 대운 천간 기반 검색
    const currentFortune = getCurrentMajorFortune(sajuResult, currentAge);
    if (currentFortune) {
      const fortuneElement = currentFortune.pillar.ganElement;
      const elementKeywords = ELEMENT_KEYWORDS[fortuneElement];
      if (elementKeywords?.modernIndustries.length > 0) {
        queries.push(`${currentYear}년 ${elementKeywords.modernIndustries[0]} 진출 시기`);
      }
    }
  }

  // 십성 기반 직업 검색
  for (const god of dominantGods) {
    const keywords = TEN_GOD_KEYWORDS[god];
    if (keywords) {
      // 직업군 + 트렌드
      queries.push(`${currentYear}년 ${keywords.careerTypes[0]} 전망`);
      queries.push(`${keywords.workStyle[0]} ${ageGroup} 취업 트렌드`);
    }
  }

  // 오행 기반 산업 검색
  if (dominantElement) {
    const industryKeywords = ELEMENT_KEYWORDS[dominantElement];
    if (industryKeywords && industryKeywords.modernIndustries.length > 0) {
      queries.push(`${currentYear}년 ${industryKeywords.modernIndustries[0]} 채용 동향`);
    }
  }

  // 용신 기반 권장 산업 검색
  if (yongShin) {
    const yongShinKeywords = ELEMENT_KEYWORDS[yongShin];
    if (yongShinKeywords && yongShinKeywords.modernIndustries.length > 0) {
      queries.push(`${currentYear}년 ${yongShinKeywords.modernIndustries[0]} 성장 전망`);
    }
  }

  return queries.slice(0, 4); // 최대 4개로 확대
}

/**
 * 재물운 관련 개인화 검색 쿼리 생성
 */
export function generateWealthQueries(context: GroundingContext): string[] {
  const { currentYear, sajuResult, currentAge } = context;
  const queries: string[] = [];

  const dominantGods = getDominantTenGods(sajuResult.tenGodSummary);
  const dominantElement = sajuResult.elementAnalysis.dominant[0];

  // 🆕 대운 기반 재물운 검색 쿼리 (최우선)
  if (currentAge) {
    const fortuneInfo = getMajorFortuneKeywords(sajuResult, currentAge);
    if (fortuneInfo) {
      const { keywords } = fortuneInfo;
      // 대운 상태에 따른 재물 전략
      if (keywords.includes("운세 상승기")) {
        queries.push(`${currentYear}년 상승기 재테크 투자 전략`);
      } else if (keywords.includes("도전의 시기")) {
        queries.push(`${currentYear}년 안정적 자산 보호 전략`);
      }
    }

    // 현재 대운 오행 기반 투자 분야
    const currentFortune = getCurrentMajorFortune(sajuResult, currentAge);
    if (currentFortune) {
      const fortuneElement = currentFortune.pillar.ganElement;
      const elementKeywords = ELEMENT_KEYWORDS[fortuneElement];
      if (elementKeywords?.investmentStyles.length > 0) {
        queries.push(`${currentYear}년 ${elementKeywords.investmentStyles[0]} 투자 시기`);
      }
    }
  }

  // 십성 기반 투자 성향
  for (const god of dominantGods) {
    const keywords = TEN_GOD_KEYWORDS[god];
    if (keywords) {
      if (god === "pyeonjae" || god === "gebjae") {
        // 편재, 겁재 - 적극적 투자
        queries.push(`${currentYear}년 고수익 투자 방법`);
        queries.push(`${currentYear}년 스타트업 투자 트렌드`);
      } else if (god === "jeongjae" || god === "siksin") {
        // 정재, 식신 - 안정적 투자
        queries.push(`${currentYear}년 안전한 재테크 방법`);
        queries.push(`${currentYear}년 배당주 추천`);
      }
    }
  }

  // 오행 기반 투자 분야
  if (dominantElement) {
    const elementKeywords = ELEMENT_KEYWORDS[dominantElement];
    if (elementKeywords && elementKeywords.investmentStyles.length > 0) {
      queries.push(`${currentYear}년 ${elementKeywords.investmentStyles[0]} 전망`);
    }
  }

  return queries.slice(0, 4);
}

/**
 * 연애운 관련 개인화 검색 쿼리 생성
 */
export function generateRelationshipQueries(context: GroundingContext): string[] {
  const { currentYear, sajuResult, ageGroup } = context;
  const queries: string[] = [];

  const dayMasterElement = sajuResult.dayMasterElement;

  if (dayMasterElement) {
    const relationshipKeywords = ELEMENT_RELATIONSHIP_KEYWORDS[dayMasterElement];
    if (relationshipKeywords) {
      queries.push(`${currentYear}년 ${ageGroup} 연애 트렌드`);
      queries.push(`${relationshipKeywords.datingStyle[0]} 연애 방법`);
    }
  }

  // 나이대 기반
  queries.push(`${currentYear}년 ${ageGroup} 소개팅 어플 추천`);

  return queries.slice(0, 3);
}

/**
 * 건강운 관련 개인화 검색 쿼리 생성
 */
export function generateHealthQueries(context: GroundingContext): string[] {
  const { currentYear, sajuResult, ageGroup } = context;
  const queries: string[] = [];

  // 부족한 오행의 건강 주의점
  const lackingElements = sajuResult.elementAnalysis.lacking;
  for (const element of lackingElements.slice(0, 1)) {
    const healthKeywords = ELEMENT_HEALTH_KEYWORDS[element];
    if (healthKeywords && healthKeywords.vulnerableAreas.length > 0) {
      queries.push(`${healthKeywords.vulnerableAreas[0]} 건강 관리법 ${currentYear}`);
    }
  }

  // 일간 오행 건강
  const dayMasterElement = sajuResult.dayMasterElement;
  if (dayMasterElement) {
    const healthKeywords = ELEMENT_HEALTH_KEYWORDS[dayMasterElement];
    if (healthKeywords && healthKeywords.recommendedCare.length > 0) {
      queries.push(`${ageGroup} ${healthKeywords.recommendedCare[0]} 방법`);
    }
  }

  // 나이대 건강
  queries.push(`${currentYear}년 ${ageGroup} 건강검진 추천`);

  return queries.slice(0, 3);
}

/**
 * 전체 운세 관련 개인화 검색 쿼리 생성
 */
export function generateFortuneQueries(context: GroundingContext): string[] {
  const { currentYear, currentMonth, sajuResult, currentAge, ageGroup } = context;
  const queries: string[] = [];

  // 🆕 대운 기반 종합운 검색 쿼리 (최우선)
  if (currentAge) {
    const fortuneInfo = getMajorFortuneKeywords(sajuResult, currentAge);
    if (fortuneInfo) {
      const { description } = fortuneInfo;
      // 대운 시기에 맞는 조언 검색
      const currentFortune = getCurrentMajorFortune(sajuResult, currentAge);
      if (currentFortune) {
        const fortuneKorean = currentFortune.pillar.koreanReading;
        queries.push(`${fortuneKorean}운 시기 인생 조언`);
      }
    }
  }

  // 일간 오행 기반 월별 운세
  const dayMasterElement = sajuResult.dayMasterElement;
  if (dayMasterElement) {
    const elementKorean = ELEMENT_KOREAN[dayMasterElement];
    queries.push(`${currentYear}년 ${currentMonth}월 ${elementKorean}일간 운세`);
  }

  queries.push(`${currentYear}년 ${currentMonth}월 경제 전망`);
  queries.push(`${currentYear}년 ${ageGroup} 라이프스타일 트렌드`);

  return queries.slice(0, 3);
}

/**
 * 모든 카테고리의 개인화 검색 쿼리 생성
 */
export function generateAllPersonalizedQueries(context: GroundingContext): PersonalizedSearchQueries {
  return {
    career: generateCareerQueries(context),
    wealth: generateWealthQueries(context),
    relationship: generateRelationshipQueries(context),
    health: generateHealthQueries(context),
    fortune: generateFortuneQueries(context),
  };
}

/**
 * 사주 프로필 요약 생성 (검색 컨텍스트용)
 */
export function generateSajuProfile(sajuResult: SajuResult, currentAge?: number): string {
  const parts: string[] = [];

  // 일간 성향
  const dayMasterDesc = sajuResult?.dayMasterDescription || "알 수 없음";
  parts.push(`일간: ${dayMasterDesc}`);

  // 주요 십성
  const dominantGods = getDominantTenGods(sajuResult?.tenGodSummary);
  if (dominantGods.length > 0) {
    // 🛡️ 방어적 null 체크: TEN_GOD_INFO에 해당 키가 있는지 확인
    const godNames = dominantGods
      .map(g => TEN_GOD_INFO[g]?.korean || g)
      .join(", ");
    parts.push(`주요 십성: ${godNames}`);

    // 십성별 성격
    const personalities = dominantGods
      .flatMap(g => TEN_GOD_KEYWORDS[g]?.personality || [])
      .slice(0, 3);
    if (personalities.length > 0) {
      parts.push(`성격 특성: ${personalities.join(", ")}`);
    }
  }

  // 강한 오행
  // 🛡️ 방어적 null 체크
  const elementAnalysis = sajuResult?.elementAnalysis;
  const dominantElements = elementAnalysis?.dominant || [];
  if (dominantElements.length > 0) {
    const elements = dominantElements
      .map(e => ELEMENT_KOREAN[e] || e)
      .join(", ");
    parts.push(`강한 오행: ${elements}`);
  }

  // 부족한 오행
  // 🛡️ 방어적 null 체크
  const lackingElements = elementAnalysis?.lacking || [];
  if (lackingElements.length > 0) {
    const elements = lackingElements
      .map(e => ELEMENT_KOREAN[e] || e)
      .join(", ");
    parts.push(`부족한 오행: ${elements}`);
  }

  // 용신
  const yongShin = elementAnalysis?.yongShin;
  if (yongShin) {
    parts.push(`용신(필요한 기운): ${ELEMENT_KOREAN[yongShin] || yongShin}`);
  }

  // 🆕 대운 정보 추가
  if (currentAge) {
    const fortuneInfo = getMajorFortuneKeywords(sajuResult, currentAge);
    if (fortuneInfo) {
      parts.push(`현재 대운: ${fortuneInfo.description}`);
    }
  }

  return parts.join("\n");
}

/**
 * 사주 프로필 구조화된 추출 (Phase 3)
 * 성격, 적합 산업, 투자 스타일을 명확하게 추출
 */
export interface ExtractedSajuProfile {
  /** 성격 특성 */
  personality: string;
  /** 적합한 현대 산업 */
  suitableIndustry: string;
  /** 투자 스타일 */
  investmentStyle: string;
  /** 적합 직업군 */
  careerTypes: string;
  /** 강점 */
  strengths: string;
  /** 요약 설명 */
  summary: string;
}

export function extractSajuProfile(sajuResult: SajuResult): ExtractedSajuProfile {
  const dominantGods = getDominantTenGods(sajuResult?.tenGodSummary);
  // 🛡️ 방어적 null 체크
  const elementAnalysis = sajuResult?.elementAnalysis;
  const dominantElement = elementAnalysis?.dominant?.[0];
  const yongShin = elementAnalysis?.yongShin;

  // 주요 십성에서 성격/직업 키워드 추출
  let personality = "균형 잡힌";
  let careerTypes = "다양한 분야";
  let strengths = "적응력";

  if (dominantGods.length > 0) {
    const mainGod = dominantGods[0];
    const godKeywords = TEN_GOD_KEYWORDS[mainGod];
    if (godKeywords) {
      personality = godKeywords.personality.slice(0, 2).join(", ");
      careerTypes = godKeywords.careerTypes.slice(0, 3).join(", ");
      strengths = godKeywords.strengths.slice(0, 2).join(", ");
    }
  }

  // 용신 또는 강한 오행에서 산업/투자 스타일 추출
  const targetElement = yongShin || dominantElement;
  let suitableIndustry = "다양한 분야";
  let investmentStyle = "분산 투자";

  if (targetElement && ELEMENT_KEYWORDS[targetElement]) {
    const elementKeywords = ELEMENT_KEYWORDS[targetElement];
    suitableIndustry = elementKeywords.modernIndustries.slice(0, 3).join(", ");
    investmentStyle = elementKeywords.investmentStyles.slice(0, 2).join(", ");
  }

  // 요약 생성
  const summary = `${personality} 성향으로 ${suitableIndustry} 분야에 적합하며, ${investmentStyle} 스타일 선호`;

  return {
    personality,
    suitableIndustry,
    investmentStyle,
    careerTypes,
    strengths,
    summary,
  };
}

/**
 * 채팅용 상세 검색 쿼리 생성
 * 사용자의 질문과 사주 프로필을 결합
 */
export function generateChatSearchQuery(
  userMessage: string,
  sajuResult: SajuResult,
  category: "career" | "wealth" | "relationship" | "health" | "fortune",
  currentYear: number
): string {
  const profile = generateSajuProfile(sajuResult);
  const dominantGods = getDominantTenGods(sajuResult.tenGodSummary);

  // 카테고리별 키워드 추출
  let categoryKeywords: string[] = [];

  switch (category) {
    case "career":
      if (dominantGods.length > 0) {
        categoryKeywords = TEN_GOD_KEYWORDS[dominantGods[0]]?.careerTypes || [];
      }
      break;
    case "wealth":
      const dominant = sajuResult.elementAnalysis.dominant[0];
      if (dominant) {
        categoryKeywords = ELEMENT_KEYWORDS[dominant]?.investmentStyles || [];
      }
      break;
    case "relationship":
      if (sajuResult.dayMasterElement) {
        categoryKeywords = ELEMENT_RELATIONSHIP_KEYWORDS[sajuResult.dayMasterElement]?.datingStyle || [];
      }
      break;
    case "health":
      if (sajuResult.dayMasterElement) {
        categoryKeywords = ELEMENT_HEALTH_KEYWORDS[sajuResult.dayMasterElement]?.recommendedCare || [];
      }
      break;
    default:
      break;
  }

  // 검색 쿼리 조합
  const keywordPart = categoryKeywords.length > 0 ? categoryKeywords[0] : "";

  return `${currentYear}년 ${keywordPart} ${userMessage}`.trim();
}

// ============================================================================
// 그라운딩 강도 설정 (Phase 6 최적화)
// ============================================================================

/**
 * 그라운딩 강도 레벨
 * - HIGH: 시의성 필수 (career, wealth) - 명시적 검색 지시
 * - MEDIUM: 트렌드 참고 가치 (health, fortune) - 조건부 검색
 * - LOW: 전통 해석 중심 (relationship, dayMaster, tenGods, stars) - 선택적 검색
 */
export type GroundingIntensity = "HIGH" | "MEDIUM" | "LOW";

/**
 * 카테고리별 그라운딩 강도 매핑
 */
export const CATEGORY_GROUNDING_INTENSITY: Record<string, GroundingIntensity> = {
  career: "HIGH",
  wealth: "HIGH",
  health: "MEDIUM",
  fortune: "MEDIUM",
  relationship: "LOW",
  dayMaster: "LOW",
  tenGods: "LOW",
  stars: "LOW",
};

/**
 * 그라운딩 강도별 프롬프트 템플릿 (한국어)
 */
export const GROUNDING_PROMPTS_KO: Record<GroundingIntensity, string> = {
  HIGH: `**중요: 반드시 검색을 활용하세요!**
이 카테고리는 시의성 있는 정보가 핵심입니다.
반드시 {year}년 최신 정보를 Google 검색하여 구체적인 데이터와 트렌드를 인용하세요.
검색 없이는 정확한 조언이 불가능합니다.`,

  MEDIUM: `**최신 트렌드 참고 권장**
{year}년 관련 트렌드나 통계가 답변 품질을 높일 수 있다면 검색을 활용하세요.
전통적 해석과 현대 트렌드를 적절히 조화시켜 답변해주세요.`,

  LOW: `**전통적 해석 중심**
사주의 전통적 해석을 중심으로 답변하세요.
최신 트렌드 검색은 특별히 필요한 경우에만 활용하세요.`,
};

/**
 * 그라운딩 강도별 프롬프트 템플릿 (영어)
 */
export const GROUNDING_PROMPTS_EN: Record<GroundingIntensity, string> = {
  HIGH: `**IMPORTANT: You MUST use search!**
This category requires timely information.
You MUST search for {year} latest data and trends using Google Search.
Accurate advice is impossible without searching.`,

  MEDIUM: `**Recommended: Reference Current Trends**
If {year} trends or statistics would improve your answer quality, use search.
Balance traditional interpretation with modern trends in your response.`,

  LOW: `**Traditional Interpretation Focus**
Focus on traditional birth chart interpretation.
Use trend searching only when specifically needed.`,
};

/**
 * 카테고리에 맞는 그라운딩 프롬프트 생성
 */
export function getGroundingPrompt(
  category: string,
  locale: "ko" | "en",
  currentYear: number
): string {
  const intensity = CATEGORY_GROUNDING_INTENSITY[category] || "LOW";
  const templates = locale === "ko" ? GROUNDING_PROMPTS_KO : GROUNDING_PROMPTS_EN;

  return templates[intensity].replace("{year}", currentYear.toString());
}

/**
 * 카테고리의 그라운딩 강도 확인
 */
export function getGroundingIntensity(category: string): GroundingIntensity {
  return CATEGORY_GROUNDING_INTENSITY[category] || "LOW";
}

/**
 * 그라운딩이 필요한 카테고리인지 확인
 */
export function needsGrounding(category: string): boolean {
  const intensity = getGroundingIntensity(category);
  return intensity === "HIGH" || intensity === "MEDIUM";
}
