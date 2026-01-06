import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getDetailedCompatibilitySystemPrompt,
  getDetailedCompatibilityUserPrompt,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import type { Element } from "@/lib/saju/types";
import { ELEMENT_KOREAN } from "@/lib/saju/constants";

// 오행 상생상극 관계 분석
type ElementRelation = "상생" | "상극" | "비화" | "설기" | "극설";

function getElementRelation(element1: Element, element2: Element): ElementRelation {
  const relations: Record<Element, { generates: Element; controlledBy: Element }> = {
    wood: { generates: "fire", controlledBy: "metal" },
    fire: { generates: "earth", controlledBy: "water" },
    earth: { generates: "metal", controlledBy: "wood" },
    metal: { generates: "water", controlledBy: "fire" },
    water: { generates: "wood", controlledBy: "earth" },
  };

  if (element1 === element2) return "비화"; // 같은 오행
  if (relations[element1].generates === element2) return "설기"; // 내가 상대를 생함
  if (relations[element2].generates === element1) return "상생"; // 상대가 나를 생함
  if (relations[element1].controlledBy === element2) return "상극"; // 상대가 나를 극함
  return "극설"; // 내가 상대를 극함
}

// 🆕 오행 관계 기반 검색 쿼리 생성
function generateElementBasedQueries(
  person1Element: Element | undefined,
  person2Element: Element | undefined,
  relationType: string,
  locale: Locale,
  currentYear: number
): string[] {
  const queries: string[] = [];
  // Note: couple form uses "dating", "engaged", "married", "interested"
  const isRomantic = ["lover", "spouse", "dating", "engaged", "married", "interested"].includes(relationType);
  const isWork = ["colleague", "supervisor", "subordinate", "partner", "client", "mentor", "mentee"].includes(relationType);

  if (person1Element && person2Element) {
    const relation = getElementRelation(person1Element, person2Element);
    const el1Korean = ELEMENT_KOREAN[person1Element];
    const el2Korean = ELEMENT_KOREAN[person2Element];

    if (locale === "ko") {
      // 오행 관계에 따른 맞춤 쿼리
      switch (relation) {
        case "상생":
          queries.push(`${currentYear}년 상생 관계 시너지 내는 방법`);
          if (isRomantic) {
            queries.push(`서로 돕는 커플 관계 유지 비결`);
          } else if (isWork) {
            queries.push(`상호 보완적 팀워크 성공 사례`);
          }
          break;
        case "상극":
          queries.push(`${currentYear}년 성격 다른 두 사람 갈등 해결법`);
          if (isRomantic) {
            queries.push(`상극 오행 커플 극복 방법`);
          } else if (isWork) {
            queries.push(`의견 충돌 건설적 해결 방법`);
          }
          break;
        case "비화":
          queries.push(`${currentYear}년 비슷한 성격 관계 장단점`);
          if (isRomantic) {
            queries.push(`동류형 커플 관계 유지 팁`);
          } else if (isWork) {
            queries.push(`비슷한 성향 동료 효율적 협업 방법`);
          }
          break;
        case "설기":
        case "극설":
          queries.push(`${currentYear}년 주도적 관계 균형 잡는 방법`);
          break;
      }

      // 두 오행 조합 검색
      queries.push(`${el1Korean} ${el2Korean} 궁합 조화로운 관계`);
    } else {
      // English queries
      switch (relation) {
        case "상생":
          queries.push(`${currentYear} harmonious relationship synergy tips`);
          break;
        case "상극":
          queries.push(`${currentYear} resolving personality conflicts relationship`);
          break;
        case "비화":
          queries.push(`${currentYear} similar personality relationship pros cons`);
          break;
        default:
          queries.push(`${currentYear} balancing dominant relationship dynamics`);
      }
    }
  }

  return queries;
}

// 관계 유형별 검색 쿼리 생성 (🆕 오행 정보 추가)
function generateCompatibilitySearchQueries(
  relationType: string,
  locale: Locale,
  currentYear: number,
  person1Element?: Element,
  person2Element?: Element
): string[] {
  const queries: string[] = [];

  // 🆕 오행 기반 쿼리 먼저 추가
  const elementQueries = generateElementBasedQueries(
    person1Element,
    person2Element,
    relationType,
    locale,
    currentYear
  );
  queries.push(...elementQueries);

  const isWork = ["colleague", "supervisor", "subordinate", "partner", "client", "mentor", "mentee"].includes(relationType);
  const isRomantic = ["lover", "spouse"].includes(relationType);

  if (locale === "ko") {
    if (isWork) {
      const workQueries: Record<string, string[]> = {
        colleague: [
          `${currentYear}년 직장 동료 관계 좋게 하는 방법`,
          `팀워크 향상 방법 ${currentYear}`,
        ],
        supervisor: [
          `${currentYear}년 좋은 상사 부하 관계 만들기`,
          `직장 상하관계 소통 ${currentYear}`,
        ],
        subordinate: [
          `${currentYear}년 부하직원 관리 방법`,
          `리더십 트렌드 ${currentYear}`,
        ],
        partner: [
          `${currentYear}년 비즈니스 파트너십 성공 사례`,
          `동업자 관계 유지 방법`,
        ],
        client: [
          `${currentYear}년 고객 관계 관리 트렌드`,
          `비즈니스 네트워킹 ${currentYear}`,
        ],
        mentor: [
          `${currentYear}년 좋은 멘토링 방법`,
          `멘토 멘티 관계 성공 사례`,
        ],
        mentee: [
          `${currentYear}년 멘티 성장 방법`,
          `커리어 성장 조언 ${currentYear}`,
        ],
      };
      queries.push(...(workQueries[relationType] || workQueries.colleague));
    } else if (isRomantic) {
      queries.push(
        `${currentYear}년 연인 관계 트렌드`,
        `좋은 커플 관계 유지 비결`,
      );
    } else {
      queries.push(
        `${currentYear}년 좋은 인간관계 만들기`,
        `친구 관계 유지 방법`,
      );
    }
  } else {
    // English queries
    if (isWork) {
      queries.push(
        `workplace relationship tips ${currentYear}`,
        `professional communication trends`,
      );
    } else if (isRomantic) {
      queries.push(
        `relationship advice ${currentYear}`,
        `couple compatibility tips`,
      );
    } else {
      queries.push(
        `building good relationships ${currentYear}`,
        `friendship maintenance tips`,
      );
    }
  }

  return queries.slice(0, 4); // 최대 4개
}

// JSON 스키마 가이드 생성 함수
function getJsonSchemaGuide(locale: Locale, isRomantic: boolean, isWork: boolean): string {
  if (locale === 'ko') {
    return `
## 응답 JSON 스키마 (반드시 이 형식으로 응답하세요)

{
  "overallScore": <0-100 사이의 종합 궁합 점수>,
  "grade": "<excellent|good|normal|caution|challenging 중 하나>",
  "gradeText": "<등급 설명 텍스트, 예: '천생연분', '좋은 궁합'>",
  "summary": "<궁합 종합 요약 3-4문장>",

  "cheonganHap": {
    "person1Gan": "<첫 번째 사람의 일간, 예: 甲, 乙>",
    "person2Gan": "<두 번째 사람의 일간>",
    "hasHap": <true 또는 false>,
    "hapType": "<합의 종류, 예: 갑기합토> 또는 null (합이 없으면 null)",
    "hapElement": "<합으로 생성되는 오행, 예: 土> 또는 null (합이 없으면 null)",
    "description": "<천간합 분석 설명>"
  },

  "jijiRelation": {
    "yukHap": {
      "pairs": [{"zhi1": "<지지1>", "zhi2": "<지지2>", "resultElement": "<결과 오행>"}],
      "description": "<육합 분석 설명>"
    },
    "samHap": {
      "groups": [{"zhis": ["<지지1>", "<지지2>", "<지지3>"], "resultElement": "<결과 오행>"}],
      "description": "<삼합 분석 설명>"
    },
    "chung": {
      "pairs": [{"zhi1": "<지지1>", "zhi2": "<지지2>"}],
      "description": "<충 분석 설명>"
    },
    "hyung": {
      "pairs": [{"zhi1": "<지지1>", "zhi2": "<지지2>"}],
      "description": "<형 분석 설명>"
    }
  },

  "iljuCompatibility": {
    "person1Ilju": "<첫 번째 사람의 일주, 예: 甲子>",
    "person2Ilju": "<두 번째 사람의 일주>",
    "ganRelation": "<일간 관계: 상생, 상극, 비화, 합 등>",
    "zhiRelation": "<일지 관계: 합, 충, 형, 해, 중립, 파, 원진 등>",
    "overallIljuScore": <0-100 점수>,
    "description": "<일주 궁합 설명>"
  },

  "elementBalanceAnalysis": {
    "person1Dominant": "<첫 번째 사람의 강한 오행>",
    "person2Dominant": "<두 번째 사람의 강한 오행>",
    "person1Weak": "<첫 번째 사람의 약한 오행>",
    "person2Weak": "<두 번째 사람의 약한 오행>",
    "complementary": <true 또는 false>,
    "description": "<오행 균형 분석 설명>"
  },

  "relationshipAnalysis": {
    "emotional": {"score": <0-100>, "description": "<정서적 교감 설명>"},
    "physical": {"score": <0-100>, "description": "<신체적 조화 설명>"},
    "intellectual": {"score": <0-100>, "description": "<지적 교류 설명>"},
    "spiritual": {"score": <0-100>, "description": "<정신적 유대 설명>"},
    "financial": {"score": <0-100>, "description": "<경제적 조화 설명>"}
  },

  "timingAnalysis": {
    "shortTerm": {"score": <0-100>, "description": "<단기 1-2년 전망>"},
    "midTerm": {"score": <0-100>, "description": "<중기 3-5년 전망>"},
    "longTerm": {"score": <0-100>, "description": "<장기 5년+ 전망>"}
  },

  ${isRomantic ? `"romanticAnalysis": {
    "initialAttraction": {"score": <0-100>, "description": "<첫인상/끌림 설명>"},
    "dateCompatibility": {"score": <0-100>, "description": "<데이트 궁합 설명>"},
    "marriageProspect": {"score": <0-100>, "description": "<결혼 전망 설명>"},
    "childrenFortune": {"score": <0-100>, "description": "<자녀운 설명>"}
  },` : ''}

  ${isWork ? `"workplaceAnalysis": {
    "teamwork": {"score": <0-100>, "description": "<팀워크 궁합 설명>"},
    "projectCollaboration": {"score": <0-100>, "description": "<프로젝트 협업 설명>"},
    "decisionMaking": {"score": <0-100>, "description": "<의사결정 호환성 설명>"},
    "stressHandling": {"score": <0-100>, "description": "<스트레스 대응 설명>"},
    "careerSupport": {"score": <0-100>, "description": "<커리어 성장 지원 설명>"},
    "tenGodRelation": {
      "person1Role": "<첫 번째 사람의 십성 역할>",
      "person2Role": "<두 번째 사람의 십성 역할>",
      "relationDynamic": "<십성 기반 관계 다이나믹 설명>"
    }
  },` : ''}

  "conflictPoints": [
    {"area": "<갈등 영역>", "description": "<갈등 설명>", "solution": "<해결책>"}
  ],

  "compatibility": {
    "communication": {"score": <0-100>, "description": "<소통 궁합 설명>"},
    "collaboration": {"score": <0-100>, "description": "<협력 궁합 설명>"},
    "trust": {"score": <0-100>, "description": "<신뢰 궁합 설명>"},
    "growth": {"score": <0-100>, "description": "<성장 궁합 설명>"}
  },

  "strengths": ["<강점1>", "<강점2>", "<강점3>", "<강점4>"],
  "challenges": ["<도전과제1>", "<도전과제2>", "<도전과제3>"],
  "adviceForPerson1": ["<조언1>", "<조언2>", "<조언3>"],
  "adviceForPerson2": ["<조언1>", "<조언2>", "<조언3>"],
  "recommendedActivities": ["<활동1>", "<활동2>", "<활동3>", "<활동4>"],
  "luckyDates": ["<날짜/시기1>", "<날짜/시기2>", "<날짜/시기3>"],
  "luckyElements": {
    "colors": ["<색상1>", "<색상2>"],
    "directions": ["<방향1>", "<방향2>"],
    "numbers": [<숫자1>, <숫자2>]
  }
}

중요: 위 스키마를 정확히 따라 JSON만 응답하세요. 설명 텍스트나 마크다운 없이 순수 JSON만 반환하세요.
`;
  } else {
    return `
## Response JSON Schema (You MUST respond in this exact format)

{
  "overallScore": <0-100 overall compatibility score>,
  "grade": "<one of: excellent|good|normal|caution|challenging>",
  "gradeText": "<grade description text, e.g., 'Perfect Match', 'Good Compatibility'>",
  "summary": "<3-4 sentence summary of compatibility>",

  "cheonganHap": {
    "person1Gan": "<first person's day stem, e.g., 甲, 乙>",
    "person2Gan": "<second person's day stem>",
    "hasHap": <true or false>,
    "hapType": "<combination type, e.g., Jia-Ji Earth> or null (null if no combination)",
    "hapElement": "<element created by combination, e.g., Earth> or null (null if no combination)",
    "description": "<heavenly stem combination analysis>"
  },

  "jijiRelation": {
    "yukHap": {
      "pairs": [{"zhi1": "<branch1>", "zhi2": "<branch2>", "resultElement": "<result element>"}],
      "description": "<six harmonies analysis>"
    },
    "samHap": {
      "groups": [{"zhis": ["<branch1>", "<branch2>", "<branch3>"], "resultElement": "<result element>"}],
      "description": "<three harmonies analysis>"
    },
    "chung": {
      "pairs": [{"zhi1": "<branch1>", "zhi2": "<branch2>"}],
      "description": "<clash analysis>"
    },
    "hyung": {
      "pairs": [{"zhi1": "<branch1>", "zhi2": "<branch2>"}],
      "description": "<punishment analysis>"
    }
  },

  "iljuCompatibility": {
    "person1Ilju": "<first person's day pillar, e.g., 甲子>",
    "person2Ilju": "<second person's day pillar>",
    "ganRelation": "<stem relation: 상생, 상극, 비화, 합, etc.>",
    "zhiRelation": "<branch relation: 합, 충, 형, 해, 중립, 파, 원진, etc.>",
    "overallIljuScore": <0-100 score>,
    "description": "<day pillar compatibility description>"
  },

  "elementBalanceAnalysis": {
    "person1Dominant": "<first person's dominant element>",
    "person2Dominant": "<second person's dominant element>",
    "person1Weak": "<first person's weak element>",
    "person2Weak": "<second person's weak element>",
    "complementary": <true or false>,
    "description": "<element balance analysis>"
  },

  "relationshipAnalysis": {
    "emotional": {"score": <0-100>, "description": "<emotional connection>"},
    "physical": {"score": <0-100>, "description": "<physical harmony>"},
    "intellectual": {"score": <0-100>, "description": "<intellectual exchange>"},
    "spiritual": {"score": <0-100>, "description": "<spiritual bond>"},
    "financial": {"score": <0-100>, "description": "<financial harmony>"}
  },

  "timingAnalysis": {
    "shortTerm": {"score": <0-100>, "description": "<1-2 year outlook>"},
    "midTerm": {"score": <0-100>, "description": "<3-5 year outlook>"},
    "longTerm": {"score": <0-100>, "description": "<5+ year outlook>"}
  },

  ${isRomantic ? `"romanticAnalysis": {
    "initialAttraction": {"score": <0-100>, "description": "<initial attraction>"},
    "dateCompatibility": {"score": <0-100>, "description": "<dating compatibility>"},
    "marriageProspect": {"score": <0-100>, "description": "<marriage prospect>"},
    "childrenFortune": {"score": <0-100>, "description": "<children fortune>"}
  },` : ''}

  ${isWork ? `"workplaceAnalysis": {
    "teamwork": {"score": <0-100>, "description": "<teamwork compatibility>"},
    "projectCollaboration": {"score": <0-100>, "description": "<project collaboration>"},
    "decisionMaking": {"score": <0-100>, "description": "<decision making compatibility>"},
    "stressHandling": {"score": <0-100>, "description": "<stress handling>"},
    "careerSupport": {"score": <0-100>, "description": "<career growth support>"},
    "tenGodRelation": {
      "person1Role": "<first person's ten god role>",
      "person2Role": "<second person's ten god role>",
      "relationDynamic": "<ten god based relationship dynamic>"
    }
  },` : ''}

  "conflictPoints": [
    {"area": "<conflict area>", "description": "<conflict description>", "solution": "<solution>"}
  ],

  "compatibility": {
    "communication": {"score": <0-100>, "description": "<communication compatibility>"},
    "collaboration": {"score": <0-100>, "description": "<collaboration compatibility>"},
    "trust": {"score": <0-100>, "description": "<trust compatibility>"},
    "growth": {"score": <0-100>, "description": "<growth compatibility>"}
  },

  "strengths": ["<strength1>", "<strength2>", "<strength3>", "<strength4>"],
  "challenges": ["<challenge1>", "<challenge2>", "<challenge3>"],
  "adviceForPerson1": ["<advice1>", "<advice2>", "<advice3>"],
  "adviceForPerson2": ["<advice1>", "<advice2>", "<advice3>"],
  "recommendedActivities": ["<activity1>", "<activity2>", "<activity3>", "<activity4>"],
  "luckyDates": ["<date/timing1>", "<date/timing2>", "<date/timing3>"],
  "luckyElements": {
    "colors": ["<color1>", "<color2>"],
    "directions": ["<direction1>", "<direction2>"],
    "numbers": [<number1>, <number2>]
  }
}

IMPORTANT: Follow this schema exactly and respond with pure JSON only. No explanatory text or markdown.
`;
  }
}

// 상세 궁합 분석 결과 스키마
const DetailedCompatibilitySchema = z.object({
  // 기본 정보
  overallScore: z.number().min(0).max(100).describe("종합 궁합 점수"),
  grade: z.enum(["excellent", "good", "normal", "caution", "challenging"]),
  gradeText: z.string().describe("등급 텍스트"),
  summary: z.string().describe("궁합 종합 요약 (3-4문장)"),

  // 천간합 분석
  cheonganHap: z.object({
    person1Gan: z.string().describe("첫 번째 사람의 일간"),
    person2Gan: z.string().describe("두 번째 사람의 일간"),
    hasHap: z.boolean().describe("천간합 존재 여부"),
    hapType: z.string().nullish().describe("합의 종류 (갑기합토, 을경합금 등)"),
    hapElement: z.string().nullish().describe("합으로 생성되는 오행"),
    description: z.string().describe("천간합 분석 설명"),
  }),

  // 지지 관계 분석
  jijiRelation: z.object({
    yukHap: z.object({
      pairs: z.array(z.object({
        zhi1: z.string(),
        zhi2: z.string(),
        resultElement: z.string(),
      })),
      description: z.string(),
    }).describe("육합 분석"),
    samHap: z.object({
      groups: z.array(z.object({
        zhis: z.array(z.string()),
        resultElement: z.string(),
      })),
      description: z.string(),
    }).describe("삼합 분석"),
    chung: z.object({
      pairs: z.array(z.object({
        zhi1: z.string(),
        zhi2: z.string(),
      })),
      description: z.string(),
    }).describe("충 분석"),
    hyung: z.object({
      pairs: z.array(z.object({
        zhi1: z.string(),
        zhi2: z.string(),
      })),
      description: z.string(),
    }).describe("형 분석"),
  }),

  // 일주 궁합 분석
  iljuCompatibility: z.object({
    person1Ilju: z.string().describe("첫 번째 사람의 일주"),
    person2Ilju: z.string().describe("두 번째 사람의 일주"),
    ganRelation: z.string().describe("일간 관계 (상생, 상극, 비화, 합 등)"),
    zhiRelation: z.string().describe("일지 관계 (합, 충, 형, 해, 중립 등)"),
    overallIljuScore: z.number().min(0).max(100),
    description: z.string(),
  }),

  // 오행 균형 분석
  elementBalanceAnalysis: z.object({
    person1Dominant: z.string().describe("첫 번째 사람의 강한 오행"),
    person2Dominant: z.string().describe("두 번째 사람의 강한 오행"),
    person1Weak: z.string().describe("첫 번째 사람의 약한 오행"),
    person2Weak: z.string().describe("두 번째 사람의 약한 오행"),
    complementary: z.boolean().describe("서로 보완하는 관계인지"),
    description: z.string(),
  }),

  // 관계 영역별 상세 분석
  relationshipAnalysis: z.object({
    emotional: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("정서적 교감"),
    physical: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("신체적 조화"),
    intellectual: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("지적 교류"),
    spiritual: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("정신적 유대"),
    financial: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("경제적 조화"),
  }),

  // 시간에 따른 궁합 변화
  timingAnalysis: z.object({
    shortTerm: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("단기 (1-2년)"),
    midTerm: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("중기 (3-5년)"),
    longTerm: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("장기 (5년+)"),
  }),

  // 연애/결혼 특별 분석 (연인/부부 관계일 때만)
  romanticAnalysis: z.object({
    initialAttraction: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("첫인상/끌림"),
    dateCompatibility: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("데이트 궁합"),
    marriageProspect: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("결혼 전망"),
    childrenFortune: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("자녀운"),
  }).optional(),

  // 직장 관계 특별 분석 (직장 관계일 때만)
  workplaceAnalysis: z.object({
    teamwork: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("팀워크 궁합"),
    projectCollaboration: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("프로젝트 협업"),
    decisionMaking: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("의사결정 스타일 호환성"),
    stressHandling: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("스트레스 상황 대응"),
    careerSupport: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("커리어 성장 지원"),
    tenGodRelation: z.object({
      person1Role: z.string().describe("첫 번째 사람의 십성 역할 (비견/겁재/식신 등)"),
      person2Role: z.string().describe("두 번째 사람의 십성 역할"),
      relationDynamic: z.string().describe("십성 기반 관계 다이나믹 설명"),
    }).describe("십성(十星) 기반 업무 관계 분석"),
  }).optional(),

  // 갈등 포인트와 해결책
  conflictPoints: z.array(z.object({
    area: z.string().describe("갈등 영역"),
    description: z.string().describe("갈등 설명"),
    solution: z.string().optional().describe("해결책"),
  })).describe("갈등 포인트 3-5개"),

  // 기본 궁합 정보
  compatibility: z.object({
    communication: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }),
    collaboration: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }),
    trust: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }),
    growth: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }),
  }),

  // 조언
  strengths: z.array(z.string()).describe("관계의 강점 4-6개"),
  challenges: z.array(z.string()).describe("관계의 도전 과제 3-5개"),

  adviceForPerson1: z.array(z.string()).describe("첫 번째 사람에게 해주는 조언 3-4개"),
  adviceForPerson2: z.array(z.string()).describe("두 번째 사람에게 해주는 조언 3-4개"),

  recommendedActivities: z.array(z.string()).describe("함께하면 좋은 활동 4-5개"),
  luckyDates: z.array(z.string()).describe("함께하기 좋은 날짜/시기 3-4개"),

  luckyElements: z.object({
    colors: z.array(z.string()).describe("함께 할 때 좋은 색상 2개"),
    directions: z.array(z.string()).describe("함께 가면 좋은 방향 2개"),
    numbers: z.array(z.number()).describe("행운의 숫자 2-3개"),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2, relationType, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!person1 || !person2) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'twoPeopleRequired') },
        { status: 400 }
      );
    }

    // Google AI API 키 확인
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'apiKeyMissing') },
        { status: 500 }
      );
    }

    const effectiveRelationType = relationType || 'default';

    // 연인/부부 관계인 경우 romanticAnalysis 필드 포함
    // Note: couple form uses "dating", "engaged", "married", "interested"
    const isRomantic = ['lover', 'spouse', 'dating', 'engaged', 'married', 'interested'].includes(effectiveRelationType);
    const isWork = ['colleague', 'supervisor', 'subordinate', 'partner', 'client', 'mentor', 'mentee'].includes(effectiveRelationType);

    // GoogleGenAI 초기화 (dynamic import to prevent build-time evaluation)
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    // Google Search grounding을 위한 검색 쿼리 생성
    const currentYear = new Date().getFullYear();

    // 🆕 두 사람의 일간(日干) 오행 추출
    const person1Element = person1?.sajuResult?.dayMaster?.element as Element | undefined;
    const person2Element = person2?.sajuResult?.dayMaster?.element as Element | undefined;

    const searchQueries = generateCompatibilitySearchQueries(
      effectiveRelationType,
      locale,
      currentYear,
      person1Element,
      person2Element
    );

    // 시스템 프롬프트와 사용자 프롬프트 생성
    const systemPrompt = getDetailedCompatibilitySystemPrompt(locale, effectiveRelationType);
    const userPrompt = getDetailedCompatibilityUserPrompt(locale, {
      person1,
      person2,
      relationType: effectiveRelationType,
    });

    // JSON 스키마 가이드 생성
    const jsonSchemaGuide = getJsonSchemaGuide(locale, isRomantic, isWork);

    // Google Search grounding을 포함한 프롬프트
    const groundingPrompt = locale === 'ko'
      ? `
인터넷에서 다음 주제들을 검색하여 현재 트렌드와 조언을 반영해주세요:
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

위 검색 결과를 바탕으로, 전통 명리학 분석에 현대적 관점과 실용적 조언을 결합해주세요.

${userPrompt}

${jsonSchemaGuide}
`
      : `
Please search the internet for the following topics to incorporate current trends and advice:
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Based on the search results above, combine traditional BaZi analysis with modern perspectives and practical advice.

${userPrompt}

${jsonSchemaGuide}
`;

    // 디버깅 로그
    console.log("Compatibility analysis request:", {
      relationType: effectiveRelationType,
      isRomantic,
      isWork,
      locale,
      person1Element,
      person2Element,
    });

    // Gemini API 호출 (Google Search grounding 포함)
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${groundingPrompt}` }],
        },
      ],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    // 응답 텍스트 추출
    let responseText = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    // JSON 파싱 (마크다운 코드 블록 제거)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parse error. Raw response:", cleanedResponse.substring(0, 500));
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Zod 스키마로 검증
    let validatedData;
    try {
      validatedData = DetailedCompatibilitySchema.parse(parsedData);
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        console.error("Zod validation failed. Received fields:", Object.keys(parsedData || {}));
        console.error("First few fields of parsed data:", JSON.stringify(parsedData, null, 2).substring(0, 1000));
      }
      throw zodError;
    }

    console.log("AI response validated successfully. Overall score:", validatedData.overallScore);

    // 연인/부부 관계가 아니면 romanticAnalysis 제거
    if (!isRomantic && validatedData.romanticAnalysis) {
      delete validatedData.romanticAnalysis;
    }

    // 직장 관계가 아니면 workplaceAnalysis 제거
    if (!isWork && validatedData.workplaceAnalysis) {
      delete validatedData.workplaceAnalysis;
    }

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("Detailed compatibility analysis error:", error);

    // Try to get locale from request for error message
    let locale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      locale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    // Zod 검증 오류 먼저 확인
    if (error instanceof z.ZodError) {
      const missingFields = error.issues.map(issue => issue.path.join('.')).join(', ');
      console.error("Zod validation error - missing fields:", missingFields);
      console.error("Validation issues:", JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        {
          error: getErrorMessage(locale, 'compatibilityError'),
          details: process.env.NODE_ENV === 'development' ? `Missing fields: ${missingFields}` : undefined,
        },
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("API_KEY")) {
        return NextResponse.json(
          { error: getErrorMessage(locale, 'apiKeyInvalid') },
          { status: 401 }
        );
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: getErrorMessage(locale, 'rateLimitExceeded') },
          { status: 429 }
        );
      }
      if (error.message.includes("Failed to parse AI response")) {
        console.error("JSON parsing failed");
        return NextResponse.json(
          {
            error: getErrorMessage(locale, 'compatibilityError'),
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: getErrorMessage(locale, 'compatibilityError') },
      { status: 500 }
    );
  }
}
