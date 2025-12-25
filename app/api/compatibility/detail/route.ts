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
  const isRomantic = ["lover", "spouse"].includes(relationType);
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
    hapType: z.string().optional().describe("합의 종류 (갑기합토, 을경합금 등)"),
    hapElement: z.string().optional().describe("합으로 생성되는 오행"),
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
    ganRelation: z.enum(["상생", "상극", "비화", "합"]).describe("일간 관계"),
    zhiRelation: z.enum(["합", "충", "형", "해", "중립"]).describe("일지 관계"),
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
    solution: z.string().describe("해결책"),
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
    const isRomantic = ['lover', 'spouse'].includes(effectiveRelationType);
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

    // Google Search grounding을 포함한 프롬프트
    const groundingPrompt = locale === 'ko'
      ? `
인터넷에서 다음 주제들을 검색하여 현재 트렌드와 조언을 반영해주세요:
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

위 검색 결과를 바탕으로, 전통 명리학 분석에 현대적 관점과 실용적 조언을 결합해주세요.

${userPrompt}

응답은 반드시 유효한 JSON 형식으로만 제공해주세요. 다른 텍스트 없이 JSON만 반환하세요.
`
      : `
Please search the internet for the following topics to incorporate current trends and advice:
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Based on the search results above, combine traditional BaZi analysis with modern perspectives and practical advice.

${userPrompt}

Please respond ONLY with valid JSON format. Return only the JSON without any other text.
`;

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

    const parsedData = JSON.parse(cleanedResponse);

    // Zod 스키마로 검증
    const validatedData = DetailedCompatibilitySchema.parse(parsedData);

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
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.issues);
        return NextResponse.json(
          { error: getErrorMessage(locale, 'compatibilityError') },
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
