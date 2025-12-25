/**
 * 채팅 검색 트리거 시스템
 * 사용자 메시지에서 키워드를 감지하여 Google Grounding 검색 여부 결정
 * 사주 프로필 기반 개인화 검색 쿼리 생성 지원
 */

import type { SajuResult, Element } from "./types";
import {
  TEN_GOD_KEYWORDS,
  ELEMENT_KEYWORDS,
  ELEMENT_HEALTH_KEYWORDS,
  getAgeGroup,
  getCurrentMajorFortune,
  getMajorFortuneKeywords,
} from "./personalized-keywords";

// ============================================================================
// 타입 정의
// ============================================================================

export type TriggerCategory = "career" | "wealth" | "relationship" | "health" | "fortune" | "general";

export interface TriggerConfig {
  /** 트리거 키워드들 */
  keywords: string[];
  /** 검색 우선순위 (높을수록 먼저 매칭) */
  priority: number;
  /** 검색 쿼리 템플릿 */
  queryTemplate?: string;
}

export interface TriggerResult {
  /** 감지된 카테고리 */
  category: TriggerCategory;
  /** 매칭된 키워드 */
  matchedKeyword: string;
  /** 신뢰도 (0-1) */
  confidence: number;
  /** 검색 필요 여부 */
  shouldSearch: boolean;
}

// ============================================================================
// 트리거 설정
// ============================================================================

export const SEARCH_TRIGGERS: Record<TriggerCategory, TriggerConfig> = {
  career: {
    keywords: [
      // 취업/이직
      "이직", "취업", "취직", "구직", "전직", "퇴사", "입사",
      // 직장/회사
      "회사", "직장", "사무실", "업무", "일자리", "근무",
      // 사업/창업
      "사업", "창업", "스타트업", "자영업", "가게", "개업",
      // 직업/진로
      "직업", "진로", "커리어", "경력", "적성", "분야",
      // 승진/성과
      "승진", "성과", "평가", "연봉", "인상", "보너스",
      // 구체적 질문
      "어떤 일", "무슨 일", "뭘 해야", "어울리는 직업",
    ],
    priority: 10,
    queryTemplate: "{year}년 {keyword} 트렌드 전망",
  },
  wealth: {
    keywords: [
      // 투자
      "투자", "재테크", "주식", "코인", "비트코인", "펀드", "ETF",
      // 부동산
      "부동산", "집", "아파트", "전세", "월세", "청약",
      // 돈/재물
      "돈", "재물", "돈복", "금전", "수입", "소득", "급여",
      // 저축/절약
      "저축", "적금", "예금", "절약", "저금",
      // 대출/빚
      "대출", "빚", "부채", "융자", "이자",
      // 구체적 질문
      "돈 벌", "돈이 들어", "재테크 방법", "투자 방법",
    ],
    priority: 9,
    queryTemplate: "{year}년 {keyword} 전망 추천",
  },
  relationship: {
    keywords: [
      // 연애
      "연애", "사랑", "이성", "썸", "고백", "데이트",
      // 결혼
      "결혼", "혼인", "웨딩", "신혼", "약혼", "청혼",
      // 이별/재회
      "이별", "헤어", "재회", "다시", "돌아", "잊기",
      // 만남
      "소개팅", "미팅", "앱", "맞선", "중매",
      // 배우자/파트너
      "남편", "아내", "애인", "남친", "여친", "파트너",
      // 인연
      "인연", "운명", "궁합", "인복", "이상형",
      // 구체적 질문
      "언제 만날", "연애 운", "결혼 운",
    ],
    priority: 8,
    queryTemplate: "{year}년 {keyword} 트렌드",
  },
  health: {
    keywords: [
      // 건강 일반
      "건강", "몸", "체력", "컨디션", "기력",
      // 질병/증상
      "아프", "아픔", "통증", "병원", "질병", "질환",
      // 신체 부위
      "허리", "무릎", "어깨", "목", "손목", "발목",
      "위", "간", "폐", "심장", "신장", "눈", "귀",
      // 정신건강
      "스트레스", "우울", "불안", "수면", "잠", "피로",
      // 운동/관리
      "운동", "다이어트", "식이", "영양", "보충제",
      // 구체적 질문
      "건강 관리", "어디가 아플", "건강 주의",
    ],
    priority: 7,
    queryTemplate: "{year}년 {keyword} 관리법",
  },
  fortune: {
    keywords: [
      // 운세/운
      "운세", "운", "운수", "길흉", "행운", "불운",
      // 시기
      "올해", "내년", "이번 달", "다음 달", "이번 주",
      // 방향
      "방향", "방위", "길일", "택일",
      // 색상
      "색깔", "색상", "행운색",
      // 숫자
      "숫자", "행운 번호",
      // 구체적 질문
      "언제가 좋", "시기가", "타이밍",
    ],
    priority: 5,
    queryTemplate: "{year}년 {keyword} 전망",
  },
  general: {
    keywords: [],
    priority: 0,
  },
};

// ============================================================================
// 트리거 감지 함수
// ============================================================================

/**
 * 메시지에서 검색 트리거 감지
 */
export function detectSearchTrigger(message: string): TriggerResult | null {
  const normalizedMessage = message.toLowerCase().trim();

  // 우선순위 순으로 카테고리 체크
  const sortedCategories = Object.entries(SEARCH_TRIGGERS)
    .filter(([cat]) => cat !== "general")
    .sort(([, a], [, b]) => b.priority - a.priority) as [TriggerCategory, TriggerConfig][];

  for (const [category, config] of sortedCategories) {
    for (const keyword of config.keywords) {
      if (normalizedMessage.includes(keyword)) {
        return {
          category,
          matchedKeyword: keyword,
          confidence: calculateConfidence(normalizedMessage, keyword, config.keywords),
          shouldSearch: true,
        };
      }
    }
  }

  return null;
}

/**
 * 복수 트리거 감지 (여러 카테고리가 매칭될 수 있음)
 */
export function detectMultipleTriggers(message: string): TriggerResult[] {
  const normalizedMessage = message.toLowerCase().trim();
  const results: TriggerResult[] = [];

  for (const [category, config] of Object.entries(SEARCH_TRIGGERS)) {
    if (category === "general") continue;

    for (const keyword of config.keywords) {
      if (normalizedMessage.includes(keyword)) {
        results.push({
          category: category as TriggerCategory,
          matchedKeyword: keyword,
          confidence: calculateConfidence(normalizedMessage, keyword, config.keywords),
          shouldSearch: true,
        });
        break; // 카테고리당 하나만
      }
    }
  }

  // 우선순위 순 정렬
  return results.sort((a, b) => {
    const priorityA = SEARCH_TRIGGERS[a.category].priority;
    const priorityB = SEARCH_TRIGGERS[b.category].priority;
    return priorityB - priorityA;
  });
}

/**
 * 신뢰도 계산
 */
function calculateConfidence(
  message: string,
  matchedKeyword: string,
  allKeywords: string[]
): number {
  let confidence = 0.5; // 기본값

  // 키워드가 길수록 높은 신뢰도
  if (matchedKeyword.length >= 3) {
    confidence += 0.1;
  }

  // 여러 키워드가 매칭되면 높은 신뢰도
  const matchCount = allKeywords.filter(kw => message.includes(kw)).length;
  confidence += Math.min(matchCount * 0.1, 0.3);

  // 질문 형태면 높은 신뢰도
  if (message.includes("?") || message.includes("어떻게") || message.includes("언제") || message.includes("뭐")) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

// ============================================================================
// 검색 쿼리 생성
// ============================================================================

/**
 * 트리거 결과를 기반으로 검색 쿼리 생성
 */
export function buildSearchQuery(
  trigger: TriggerResult,
  userMessage: string,
  currentYear: number
): string {
  const config = SEARCH_TRIGGERS[trigger.category];

  if (config.queryTemplate) {
    return config.queryTemplate
      .replace("{year}", String(currentYear))
      .replace("{keyword}", trigger.matchedKeyword);
  }

  // 기본 쿼리
  return `${currentYear}년 ${trigger.matchedKeyword} ${userMessage}`.slice(0, 100);
}

/**
 * 카테고리별 고정 검색 쿼리 (상세 분석용)
 */
export function getDetailCategoryQueries(
  category: "career" | "wealth" | "relationship" | "health" | "fortune",
  currentYear: number
): string[] {
  const queries: Record<string, string[]> = {
    career: [
      `${currentYear}년 취업 시장 동향`,
      `${currentYear}년 유망 직업 전망`,
      `${currentYear}년 이직 트렌드`,
    ],
    wealth: [
      `${currentYear}년 재테크 방법 추천`,
      `${currentYear}년 투자 전망`,
      `${currentYear}년 부동산 시장 동향`,
    ],
    relationship: [
      `${currentYear}년 연애 트렌드`,
      `${currentYear}년 결혼 시장 현황`,
      `${currentYear}년 소개팅 앱 인기`,
    ],
    health: [
      `${currentYear}년 건강 트렌드`,
      `${currentYear}년 건강검진 추천`,
      `${currentYear}년 운동 트렌드`,
    ],
    fortune: [
      `${currentYear}년 경제 전망`,
      `${currentYear}년 하반기 트렌드`,
    ],
  };

  return queries[category] || [];
}

// ============================================================================
// 검색 필요 여부 결정
// ============================================================================

/**
 * 메시지가 단순 인사/대화인지 체크
 */
export function isSimpleGreeting(message: string): boolean {
  const greetings = [
    "안녕", "하이", "헬로", "좋은 아침", "좋은 저녁",
    "반가워", "반갑", "만나서",
    "ㅎㅇ", "ㅂㄱ",
    "고마워", "감사",
    "네", "응", "ㅇㅇ", "ㅇㅋ", "ok", "okay",
    "아니", "ㄴㄴ", "no",
  ];

  const normalizedMessage = message.toLowerCase().trim();

  // 너무 짧은 메시지
  if (normalizedMessage.length <= 3) {
    return true;
  }

  // 인사만 있는 경우
  return greetings.some(g => normalizedMessage === g || normalizedMessage.startsWith(g + " "));
}

/**
 * 검색이 필요한 메시지인지 종합 판단
 */
export function shouldTriggerSearch(message: string): {
  shouldSearch: boolean;
  trigger: TriggerResult | null;
  reason: string;
} {
  // 너무 짧은 메시지
  if (message.trim().length < 5) {
    return {
      shouldSearch: false,
      trigger: null,
      reason: "message_too_short",
    };
  }

  // 단순 인사
  if (isSimpleGreeting(message)) {
    return {
      shouldSearch: false,
      trigger: null,
      reason: "simple_greeting",
    };
  }

  // 트리거 감지
  const trigger = detectSearchTrigger(message);

  if (trigger && trigger.confidence >= 0.5) {
    return {
      shouldSearch: true,
      trigger,
      reason: "trigger_detected",
    };
  }

  // 트리거 없음
  return {
    shouldSearch: false,
    trigger: null,
    reason: "no_trigger",
  };
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 카테고리 한글 이름
 */
export function getCategoryKoreanName(category: TriggerCategory): string {
  const names: Record<TriggerCategory, string> = {
    career: "직업운",
    wealth: "재물운",
    relationship: "연애운",
    health: "건강운",
    fortune: "운세",
    general: "일반",
  };
  return names[category];
}

/**
 * 검색 결과 요약을 위한 프롬프트 컨텍스트 생성
 */
export function buildSearchContextPrompt(
  trigger: TriggerResult,
  searchResults: string
): string {
  const categoryName = getCategoryKoreanName(trigger.category);

  return `
[실시간 검색 정보 - ${categoryName} 관련]
사용자가 "${trigger.matchedKeyword}"에 대해 물었습니다.
아래 최신 정보를 참고하여 사주 분석과 결합해 답변해주세요:

${searchResults}

위 정보를 바탕으로 현재 시대 상황을 반영한 실질적인 조언을 해주세요.
`.trim();
}

// ============================================================================
// 사주 기반 개인화 검색 쿼리 생성 (Phase 2 개선)
// ============================================================================

export interface PersonalizedSearchContext {
  /** 사주 결과 */
  sajuResult: SajuResult;
  /** 출생년도 */
  birthYear: number;
  /** 현재 연도 */
  currentYear: number;
  /** 현재 나이 (한국식) */
  currentAge?: number;
}

/**
 * 사주 프로필에서 주요 십성 추출 (내부 헬퍼)
 */
function getDominantTenGods(sajuResult: SajuResult): string[] {
  const summary = sajuResult.tenGodSummary;
  if (summary.dominant.length > 0) {
    return summary.dominant.slice(0, 2);
  }
  const sorted = Object.entries(summary.counts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);
  return sorted.length > 0 ? [sorted[0][0]] : [];
}

/**
 * 트리거 + 사주 기반 개인화 검색 쿼리 생성
 * 검색 트리거가 감지되었을 때 사주 프로필을 활용하여 맞춤형 검색 쿼리 생성
 */
export function generatePersonalizedTriggerQuery(
  trigger: TriggerResult,
  context: PersonalizedSearchContext,
  userMessage: string
): string[] {
  const { sajuResult, currentYear, birthYear } = context;
  const currentAge = currentYear - birthYear + 1;
  const ageGroup = getAgeGroup(birthYear, currentYear);
  const queries: string[] = [];

  // 대운 정보 추출
  const fortuneInfo = getMajorFortuneKeywords(sajuResult, currentAge);
  const currentFortune = getCurrentMajorFortune(sajuResult, currentAge);

  // 주요 십성 추출
  const dominantGods = getDominantTenGods(sajuResult);
  const dominantElement = sajuResult.elementAnalysis?.dominant?.[0];
  const yongShin = sajuResult.elementAnalysis?.yongShin;

  switch (trigger.category) {
    case "career":
      // 대운 기반 직업 변화 쿼리
      if (fortuneInfo?.keywords[0]) {
        queries.push(`${currentYear}년 ${fortuneInfo.keywords[0]} 직업 전환 전략`);
      }
      // 현재 대운 오행 기반 산업
      if (currentFortune) {
        const fortuneElement = currentFortune.pillar.ganElement;
        const elementKeywords = ELEMENT_KEYWORDS[fortuneElement];
        if (elementKeywords?.modernIndustries[0]) {
          queries.push(`${currentYear}년 ${elementKeywords.modernIndustries[0]} 취업 동향`);
        }
      }
      // 십성 기반 직업군
      for (const god of dominantGods.slice(0, 1)) {
        const keywords = TEN_GOD_KEYWORDS[god as keyof typeof TEN_GOD_KEYWORDS];
        if (keywords?.careerTypes[0]) {
          queries.push(`${ageGroup} ${keywords.careerTypes[0]} 전망 ${currentYear}`);
        }
      }
      // 용신 기반 권장 산업
      if (yongShin) {
        const yongShinKeywords = ELEMENT_KEYWORDS[yongShin];
        if (yongShinKeywords?.modernIndustries[0]) {
          queries.push(`${currentYear}년 ${yongShinKeywords.modernIndustries[0]} 채용 시장`);
        }
      }
      break;

    case "wealth":
      // 대운 상태에 따른 재물 전략
      if (fortuneInfo?.keywords.includes("운세 상승기")) {
        queries.push(`${currentYear}년 상승기 공격적 투자 전략`);
      } else if (fortuneInfo?.keywords.includes("도전의 시기")) {
        queries.push(`${currentYear}년 안정적 자산 관리 방법`);
      }
      // 대운 오행 기반 투자 분야
      if (currentFortune) {
        const fortuneElement = currentFortune.pillar.ganElement;
        const elementKeywords = ELEMENT_KEYWORDS[fortuneElement];
        if (elementKeywords?.investmentStyles[0]) {
          queries.push(`${currentYear}년 ${elementKeywords.investmentStyles[0]} 전망`);
        }
      }
      // 십성 기반 투자 성향
      for (const god of dominantGods.slice(0, 1)) {
        if (god === "pyeonjae" || god === "gebjae") {
          queries.push(`${currentYear}년 고수익 투자 방법 ${ageGroup}`);
        } else if (god === "jeongjae" || god === "siksin") {
          queries.push(`${currentYear}년 안전한 재테크 ${ageGroup}`);
        }
      }
      // 용신 기반 투자
      if (yongShin) {
        const yongShinKeywords = ELEMENT_KEYWORDS[yongShin];
        if (yongShinKeywords?.investmentStyles[0]) {
          queries.push(`${yongShinKeywords.investmentStyles[0]} 투자 시기 ${currentYear}`);
        }
      }
      break;

    case "relationship":
      // 나이대 + 대운 기반 연애 트렌드
      if (fortuneInfo?.keywords[0]) {
        queries.push(`${currentYear}년 ${fortuneInfo.keywords[0]} 연애운`);
      }
      // 일간 오행 기반 연애 스타일
      const dayMasterElement = sajuResult.dayMasterElement;
      if (dayMasterElement) {
        queries.push(`${currentYear}년 ${ageGroup} 연애 트렌드`);
      }
      queries.push(`${currentYear}년 ${ageGroup} 만남 어플 추천`);
      break;

    case "health":
      // 부족한 오행 기반 건강 주의점
      const lackingElements = sajuResult.elementAnalysis?.lacking || [];
      for (const element of lackingElements.slice(0, 1)) {
        const healthKeywords = ELEMENT_HEALTH_KEYWORDS[element];
        if (healthKeywords?.vulnerableAreas[0]) {
          queries.push(`${healthKeywords.vulnerableAreas[0]} 건강 관리법 ${currentYear}`);
        }
      }
      // 일간 오행 기반 건강 케어
      if (sajuResult.dayMasterElement) {
        const healthKeywords = ELEMENT_HEALTH_KEYWORDS[sajuResult.dayMasterElement];
        if (healthKeywords?.recommendedCare[0]) {
          queries.push(`${ageGroup} ${healthKeywords.recommendedCare[0]} 추천`);
        }
      }
      queries.push(`${currentYear}년 ${ageGroup} 건강검진 가이드`);
      break;

    case "fortune":
      // 대운 기반 종합운
      if (currentFortune) {
        const fortuneKorean = currentFortune.pillar.koreanReading;
        queries.push(`${fortuneKorean}운 시기 인생 조언`);
      }
      queries.push(`${currentYear}년 경제 전망 트렌드`);
      queries.push(`${currentYear}년 ${ageGroup} 라이프스타일`);
      break;

    default:
      // 일반 키워드 기반
      queries.push(`${currentYear}년 ${trigger.matchedKeyword} 트렌드`);
      break;
  }

  // 사용자 메시지에서 추가 키워드 추출하여 보강
  if (userMessage.length > 10 && queries.length < 3) {
    queries.push(`${trigger.matchedKeyword} ${userMessage.slice(0, 20)} ${currentYear}`);
  }

  return queries.slice(0, 3); // 최대 3개
}

/**
 * 사주 기반 대운 상태 요약 (2차 응답용)
 */
export function getMajorFortuneSummary(
  sajuResult: SajuResult,
  birthYear: number,
  currentYear: number
): string | null {
  const currentAge = currentYear - birthYear + 1;
  const fortuneInfo = getMajorFortuneKeywords(sajuResult, currentAge);
  const currentFortune = getCurrentMajorFortune(sajuResult, currentAge);

  if (!fortuneInfo || !currentFortune) return null;

  return `현재 ${currentFortune.pillar.koreanReading}운(${currentFortune.startAge}~${currentFortune.endAge}세)으로 ${fortuneInfo.description}`;
}

/**
 * 검색 트리거와 사주 컨텍스트를 결합한 종합 판단
 */
export function shouldTriggerSearchWithContext(
  message: string,
  context?: PersonalizedSearchContext
): {
  shouldSearch: boolean;
  trigger: TriggerResult | null;
  personalizedQueries: string[];
  reason: string;
} {
  // 기본 트리거 검사
  const baseResult = shouldTriggerSearch(message);

  if (!baseResult.shouldSearch || !baseResult.trigger) {
    return {
      shouldSearch: false,
      trigger: null,
      personalizedQueries: [],
      reason: baseResult.reason,
    };
  }

  // 사주 컨텍스트가 있으면 개인화 쿼리 생성
  let personalizedQueries: string[] = [];
  if (context) {
    personalizedQueries = generatePersonalizedTriggerQuery(
      baseResult.trigger,
      context,
      message
    );
  }

  return {
    shouldSearch: true,
    trigger: baseResult.trigger,
    personalizedQueries,
    reason: "trigger_detected_with_personalization",
  };
}
