import { NextRequest, NextResponse } from "next/server";
import {
  getDetailSystemPrompt,
  getDetailPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";
import {
  generateCareerQueries,
  generateWealthQueries,
  generateRelationshipQueries,
  generateHealthQueries,
  generateFortuneQueries,
  generateSajuProfile,
  extractSajuProfile,
  getAgeGroup,
  getGroundingPrompt,
  getGroundingIntensity,
  type GroundingContext,
  type ExtractedSajuProfile,
} from "@/lib/saju/personalized-keywords";
import type { SajuResult } from "@/lib/saju/types";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import { getPersonalizedContext } from "@/lib/saju/agents";

/**
 * 사주 상세 분석 API
 * Google Grounding을 활용하여 현재 시대 트렌드를 반영한 상세 분석 제공
 */

type DetailCategory =
  | "dayMaster"
  | "tenGods"
  | "stars"
  | "fortune"
  | "career"
  | "relationship"
  | "health"
  | "wealth"
  | "personality";  // 종합탭 성격 분석 전용 (dayMaster와 분리)

const validCategories: DetailCategory[] = [
  "dayMaster", "tenGods", "stars", "fortune",
  "career", "relationship", "health", "wealth",
  "personality"  // 종합탭 성격 분석
];

// Google Grounding이 필요한 카테고리
const groundingCategories: DetailCategory[] = [
  "career", "wealth", "relationship", "health", "fortune"
];

/**
 * 🆕 카테고리별 콘텐츠 분리 지침
 * 각 카테고리는 해당 주제만 다루고 다른 영역 침범 금지
 */
function getCategoryBoundaryInstructions(category: DetailCategory, locale: string): string {
  const boundaries: Record<DetailCategory, { ko: string; en: string }> = {
    dayMaster: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '일간(日干) 상세 분석'입니다.**
✅ 다뤄야 할 주제: 일간의 오행 특성, 성격의 핵심, 자아 정체성
❌ 절대 다루지 말 것:
- 직업/커리어 조언 (→ 직업운에서 다룸)
- 투자/재물 조언 (→ 재물운에서 다룸)
- 연애/결혼 조언 (→ 관계운에서 다룸)
- 건강 조언 (→ 건강운에서 다룸)
순수하게 일간의 기본 특성만 심층 분석하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Day Master Detailed Analysis' only.**
✅ Topics to cover: Day Master's Five Element traits, core personality, self-identity
❌ DO NOT cover:
- Career/job advice (→ covered in Career section)
- Investment/wealth advice (→ covered in Wealth section)
- Romance/marriage advice (→ covered in Relationship section)
- Health advice (→ covered in Health section)
Focus purely on the fundamental characteristics of the Day Master.`
    },
    personality: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '종합 성격 분석'입니다.**
✅ 다뤄야 할 주제: 전체적인 성격 패턴, 행동 양식, 대인관계 스타일, 강점/약점
❌ 절대 다루지 말 것:
- 구체적인 직업 추천 (→ 직업운에서 다룸)
- 재테크/투자 조언 (→ 재물운에서 다룸)
- 연애/결혼 시기 조언 (→ 관계운에서 다룸)
- 건강 주의사항 (→ 건강운에서 다룸)
종합적인 성격 분석에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Comprehensive Personality Analysis' only.**
✅ Topics to cover: Overall personality patterns, behavioral styles, interpersonal dynamics, strengths/weaknesses
❌ DO NOT cover:
- Specific job recommendations (→ covered in Career section)
- Financial/investment advice (→ covered in Wealth section)
- Romance/marriage timing (→ covered in Relationship section)
- Health precautions (→ covered in Health section)
Focus only on comprehensive personality analysis.`
    },
    career: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '직업운/커리어 분석'입니다.**
✅ 다뤄야 할 주제: 적합 직업군, 업무 스타일, 직장 내 관계, 승진/성공 패턴
❌ 절대 다루지 말 것:
- 투자/재테크 조언 (→ 재물운에서 다룸)
- 연애/결혼 관련 (→ 관계운에서 다룸)
- 건강 관리 조언 (→ 건강운에서 다룸)
- 일반적인 성격 분석 (→ 일간/성격에서 다룸)
순수하게 직업과 커리어에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Career Analysis' only.**
✅ Topics to cover: Suitable careers, work style, workplace relationships, promotion patterns
❌ DO NOT cover:
- Investment/financial advice (→ covered in Wealth section)
- Romance/marriage topics (→ covered in Relationship section)
- Health management (→ covered in Health section)
- General personality analysis (→ covered in Day Master/Personality section)
Focus purely on career and professional life.`
    },
    wealth: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '재물운/재테크 분석'입니다.**
✅ 다뤄야 할 주제: 재물 패턴, 투자 성향, 돈 관리 스타일, 재물운 흐름
❌ 절대 다루지 말 것:
- 직업/커리어 조언 (→ 직업운에서 다룸)
- 연애/결혼 관련 (→ 관계운에서 다룸)
- 건강 관리 조언 (→ 건강운에서 다룸)
- 일반적인 성격 분석 (→ 일간/성격에서 다룸)
순수하게 재물과 금전에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Wealth Analysis' only.**
✅ Topics to cover: Wealth patterns, investment tendencies, money management style, financial fortune flow
❌ DO NOT cover:
- Career/job advice (→ covered in Career section)
- Romance/marriage topics (→ covered in Relationship section)
- Health management (→ covered in Health section)
- General personality analysis (→ covered in Day Master/Personality section)
Focus purely on wealth and finances.`
    },
    relationship: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '관계운/대인관계 분석'입니다.**
✅ 다뤄야 할 주제: 연애 패턴, 결혼운, 가족관계, 친구/동료 관계
❌ 절대 다루지 말 것:
- 직업/커리어 조언 (→ 직업운에서 다룸)
- 투자/재테크 조언 (→ 재물운에서 다룸)
- 건강 관리 조언 (→ 건강운에서 다룸)
- 일반적인 성격 분석 (→ 일간/성격에서 다룸)
순수하게 인간관계에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Relationship Analysis' only.**
✅ Topics to cover: Romance patterns, marriage fortune, family relationships, friendships
❌ DO NOT cover:
- Career/job advice (→ covered in Career section)
- Investment/financial advice (→ covered in Wealth section)
- Health management (→ covered in Health section)
- General personality analysis (→ covered in Day Master/Personality section)
Focus purely on relationships and interpersonal connections.`
    },
    health: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '건강운 분석'입니다.**
✅ 다뤄야 할 주제: 오행별 건강 취약점, 주의해야 할 신체 부위, 건강 관리 방향
❌ 절대 다루지 말 것:
- 직업/커리어 조언 (→ 직업운에서 다룸)
- 투자/재테크 조언 (→ 재물운에서 다룸)
- 연애/결혼 관련 (→ 관계운에서 다룸)
- 일반적인 성격 분석 (→ 일간/성격에서 다룸)
순수하게 건강에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Health Analysis' only.**
✅ Topics to cover: Health vulnerabilities by Five Elements, body areas to watch, health management directions
❌ DO NOT cover:
- Career/job advice (→ covered in Career section)
- Investment/financial advice (→ covered in Wealth section)
- Romance/marriage topics (→ covered in Relationship section)
- General personality analysis (→ covered in Day Master/Personality section)
Focus purely on health and wellness.`
    },
    fortune: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '운세 흐름 분석'입니다.**
✅ 다뤄야 할 주제: 대운 흐름, 연운/월운, 시기별 기운의 변화, 행운의 타이밍
❌ 절대 다루지 말 것:
- 구체적인 직업 추천 (→ 직업운에서 다룸)
- 구체적인 투자 방법 (→ 재물운에서 다룸)
- 구체적인 연애 조언 (→ 관계운에서 다룸)
- 구체적인 건강 조언 (→ 건강운에서 다룸)
시간 흐름에 따른 운의 변화에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Fortune Flow Analysis' only.**
✅ Topics to cover: Major fortune periods, yearly/monthly fortune, timing changes, lucky periods
❌ DO NOT cover:
- Specific job recommendations (→ covered in Career section)
- Specific investment methods (→ covered in Wealth section)
- Specific romance advice (→ covered in Relationship section)
- Specific health advice (→ covered in Health section)
Focus only on the flow of fortune over time.`
    },
    tenGods: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '십성(十星) 상세 분석'입니다.**
✅ 다뤄야 할 주제: 십성 구성 분석, 각 십성의 의미, 십성 간 상호작용
❌ 절대 다루지 말 것:
- 구체적인 직업 추천 (→ 직업운에서 다룸)
- 구체적인 투자 조언 (→ 재물운에서 다룸)
- 구체적인 연애 시기 (→ 관계운에서 다룸)
- 구체적인 건강 조언 (→ 건강운에서 다룸)
십성의 구조와 의미에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Ten Gods Analysis' only.**
✅ Topics to cover: Ten Gods composition, meaning of each Ten God, interactions between Ten Gods
❌ DO NOT cover:
- Specific job recommendations (→ covered in Career section)
- Specific investment advice (→ covered in Wealth section)
- Specific romance timing (→ covered in Relationship section)
- Specific health advice (→ covered in Health section)
Focus only on the structure and meaning of Ten Gods.`
    },
    stars: {
      ko: `\n\n## 🚫 콘텐츠 경계 지침 (필수 준수)
**이 섹션은 '신살(神煞) 상세 분석'입니다.**
✅ 다뤄야 할 주제: 주요 신살 해석, 신살의 영향력, 신살 활용법
❌ 절대 다루지 말 것:
- 구체적인 직업 추천 (→ 직업운에서 다룸)
- 구체적인 투자 조언 (→ 재물운에서 다룸)
- 구체적인 연애 조언 (→ 관계운에서 다룸)
- 구체적인 건강 조언 (→ 건강운에서 다룸)
신살의 의미와 영향에만 집중하세요.`,
      en: `\n\n## 🚫 Content Boundary Instructions (MUST FOLLOW)
**This section is for 'Special Stars Analysis' only.**
✅ Topics to cover: Major star interpretations, influence of stars, how to utilize stars
❌ DO NOT cover:
- Specific job recommendations (→ covered in Career section)
- Specific investment advice (→ covered in Wealth section)
- Specific romance advice (→ covered in Relationship section)
- Specific health advice (→ covered in Health section)
Focus only on the meaning and influence of special stars.`
    }
  };

  const boundary = boundaries[category];
  return boundary ? (locale === 'ko' ? boundary.ko : boundary.en) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, sajuContext, sajuResult, gender, birthYear, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!category || !sajuContext) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'categoryAndContextRequired') },
        { status: 400 }
      );
    }

    if (!validCategories.includes(category as DetailCategory)) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'invalidCategory') },
        { status: 400 }
      );
    }

    const genderText = getGenderLabel(locale, gender === "female" ? "female" : "male");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();

    // Initialize Google GenAI (dynamic import to prevent build-time evaluation)
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });

    // Check if this category needs Google Grounding
    const needsGrounding = groundingCategories.includes(category as DetailCategory);

    // 초개인화 컨텍스트 생성 (Multi-Agent System)
    // 🆕 v1.2: 카테고리별 필터링으로 중복 방지
    let personalizedContext = "";
    if (sajuResult && birthYear) {
      try {
        const parsedSajuResult: SajuResult = typeof sajuResult === 'string'
          ? JSON.parse(sajuResult)
          : sajuResult;

        personalizedContext = await getPersonalizedContext(
          parsedSajuResult,
          birthYear,
          gender === "female" ? "female" : "male",
          locale,
          undefined,  // userQuery
          category as DetailCategory  // 🆕 카테고리별 콘텐츠 필터링
        );
      } catch (e) {
        console.error("Failed to generate personalized context:", e);
      }
    }

    // 현재 날짜 컨텍스트 추가
    const dateContext = locale === 'ko'
      ? `\n\n## 현재 시점\n오늘은 ${currentYear}년 ${currentMonth}월 ${currentDay}일입니다.`
      : `\n\n## Current Date\nToday is ${currentMonth}/${currentDay}/${currentYear}.`;

    // Build the prompt
    let prompt = locale === 'ko'
      ? `다음은 ${genderText}의 사주 정보입니다:\n\n${sajuContext}\n\n${getDetailPrompt(locale, category as DetailCategory)}${dateContext}`
      : `The following is the birth chart information for a ${genderText}:\n\n${sajuContext}\n\n${getDetailPrompt(locale, category as DetailCategory)}${dateContext}`;

    // 초개인화 컨텍스트 추가 (Cold Reading 스타일 필수 적용)
    if (personalizedContext) {
      if (locale === 'ko') {
        prompt += `\n\n## 🎯 초개인화 컨텍스트 (반드시 활용할 것!)

아래 내용은 이 분의 사주를 바탕으로 추론한 삶의 경험입니다.
**반드시** 아래 내용을 활용하여 "~하셨던 적이 있으시죠?", "~하셨을 거예요" 식으로 공감하며 답변하세요.

${personalizedContext}

---
위 초개인화 컨텍스트를 기반으로 콜드 리딩 스타일로 답변해주세요.`;
      } else {
        prompt += `\n\n## 🎯 Hyper-Personalized Context (MUST USE!)

The following content is inferred life experiences based on this person's birth chart.
**You MUST** use this content to show empathy like "You've probably experienced...", "Haven't you felt...?"

${personalizedContext}

---
Please respond in a cold reading style based on the above personalized context.`;
      }
    }

    // 🆕 카테고리별 콘텐츠 분리 지침 추가 (중복 방지)
    const categoryBoundaryInstructions = getCategoryBoundaryInstructions(category as DetailCategory, locale);
    if (categoryBoundaryInstructions) {
      prompt += categoryBoundaryInstructions;
    }

    // Add grounding context if needed and sajuResult is available
    let extractedProfile: ExtractedSajuProfile | null = null;
    let searchQueries: string[] = [];
    // 🆕 Phase 6: 그라운딩 강도 (전체 스코프에서 접근 가능하도록)
    const groundingIntensityLevel = getGroundingIntensity(category as string);

    if (needsGrounding && sajuResult) {
      const parsedSajuResult: SajuResult = typeof sajuResult === 'string'
        ? JSON.parse(sajuResult)
        : sajuResult;

      // 🆕 현재 나이 계산 (한국 나이)
      const currentAge = birthYear ? currentYear - birthYear + 1 : undefined;

      // 🆕 Phase 3: 구조화된 사주 프로필 추출
      extractedProfile = extractSajuProfile(parsedSajuResult);

      const groundingContext: GroundingContext = {
        currentYear,
        currentMonth,
        ageGroup: birthYear ? getAgeGroup(birthYear, currentYear) : "30대",
        currentAge,
        sajuResult: parsedSajuResult,
      };

      // Generate personalized search queries based on category
      switch (category) {
        case "career":
          searchQueries = generateCareerQueries(groundingContext);
          break;
        case "wealth":
          searchQueries = generateWealthQueries(groundingContext);
          break;
        case "relationship":
          searchQueries = generateRelationshipQueries(groundingContext);
          break;
        case "health":
          searchQueries = generateHealthQueries(groundingContext);
          break;
        case "fortune":
          searchQueries = generateFortuneQueries(groundingContext);
          break;
      }

      // Generate saju profile summary (🆕 대운 정보 포함)
      const sajuProfile = generateSajuProfile(parsedSajuResult, currentAge);

      // 🆕 Phase 3: 개인화된 특성 프롬프트에 추가
      if (locale === 'ko') {
        prompt += `\n\n## 이 분의 사주 특성 (개인화 핵심 정보)
- 성향: ${extractedProfile.personality}
- 적합 분야: ${extractedProfile.suitableIndustry}
- 투자 스타일: ${extractedProfile.investmentStyle}
- 강점: ${extractedProfile.strengths}
- 적합 직업: ${extractedProfile.careerTypes}`;
      } else {
        prompt += `\n\n## This Person's BaZi Traits (Core Personalization)
- Personality: ${extractedProfile.personality}
- Suitable Industries: ${extractedProfile.suitableIndustry}
- Investment Style: ${extractedProfile.investmentStyle}
- Strengths: ${extractedProfile.strengths}
- Career Types: ${extractedProfile.careerTypes}`;
      }

      // 🆕 Phase 6: 카테고리별 그라운딩 강도 적용
      const groundingPromptText = getGroundingPrompt(category, locale, currentYear);

      // Enhance prompt with grounding instructions
      if (locale === 'ko') {
        prompt += `\n\n## 현재 시대 상황 반영

${groundingPromptText}

### 이 분의 사주 프로필
${sajuProfile}

### 검색 고려 주제
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

### 분석 가이드라인
${groundingIntensityLevel === 'HIGH' ? `- **핵심**: 위 주제들을 반드시 검색하고, ${currentYear}년 실제 데이터와 트렌드를 인용하세요
- 구체적인 수치, 통계, 최신 뉴스를 포함해야 신뢰도가 높아집니다` :
groundingIntensityLevel === 'MEDIUM' ? `- 시의성 있는 정보가 도움이 된다면 검색 결과를 인용하세요
- "요즘 시대에는...", "현재 ${currentYear}년 트렌드를 보면..." 같은 표현으로 시대상 반영` :
`- 전통적인 사주 해석을 중심으로 답변하세요
- 최신 트렌드는 보조적으로만 활용하세요`}

⚠️ **중요**: 위의 트렌드 정보는 보조 자료입니다.
반드시 "초개인화 컨텍스트"의 삶의 경험 내용을 먼저 활용하여 콜드 리딩 스타일로 답변하세요!
"~하셨던 적이 있으시죠?", "~하셨을 거예요" 식의 공감 표현이 최우선입니다.`;
      } else {
        prompt += `\n\n## Reflect Current Trends

${groundingPromptText}

### This Person's BaZi Profile
${sajuProfile}

### Topics to Consider Searching
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

### Analysis Guidelines
${groundingIntensityLevel === 'HIGH' ? `- **KEY**: You MUST search the above topics and cite actual ${currentYear} data and trends
- Include specific numbers, statistics, and recent news for credibility` :
groundingIntensityLevel === 'MEDIUM' ? `- Cite search results when timely information would be helpful
- Use expressions like "In today's world...", "Looking at ${currentYear} trends..."` :
`- Focus on traditional birth chart interpretation
- Use current trends only as supplementary information`}

⚠️ **IMPORTANT**: The above trend info is supplementary.
You MUST first use the "Hyper-Personalized Context" life experiences with cold reading style!
Empathetic expressions like "You've probably...", "Haven't you...?" are the TOP PRIORITY.`;
      }
    }

    // Build config with or without Google Search tool
    const config = needsGrounding ? {
      tools: [{ googleSearch: {} }],
    } : {};

    // Streaming response using Server-Sent Events
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Gemini API with streaming
          const response = await ai.models.generateContentStream({
            model: GEMINI_MODEL,
            config,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${getDetailSystemPrompt(locale, currentYear)}\n\n${prompt}`,
                  },
                ],
              },
            ],
          });

          let fullText = "";

          // Stream text chunks as they arrive
          for await (const chunk of response) {
            const text = chunk.text || "";
            if (text) {
              fullText += text;
              // Send text chunk as SSE
              const data = JSON.stringify({ type: "text", content: text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            // Check for grounding metadata in the final chunk
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata) {
              const webSearchQueries = groundingMetadata.webSearchQueries || [];
              const groundingChunks = groundingMetadata.groundingChunks || [];

              const sources = groundingChunks
                .filter((c: { web?: { uri?: string; title?: string } }) => c.web?.uri)
                .map((c: { web?: { uri?: string; title?: string } }) => ({
                  url: c.web?.uri,
                  title: c.web?.title || "",
                }))
                .slice(0, 5);

              // Send grounding metadata
              if (sources.length > 0 || webSearchQueries.length > 0) {
                const metaData = JSON.stringify({
                  type: "metadata",
                  grounded: needsGrounding,
                  groundingSources: sources,
                  searchQueries: webSearchQueries,
                });
                controller.enqueue(encoder.encode(`data: ${metaData}\n\n`));
              }
            }
          }

          // Send completion event with full content (🆕 Phase 6: 그라운딩 강도 정보 추가)
          const doneData = JSON.stringify({
            type: "done",
            category,
            fullContent: fullText,
            // Phase 3: 개인화 메타데이터
            personalizedFor: extractedProfile?.summary || null,
            searchQueries: searchQueries.length > 0 ? searchQueries : null,
            // Phase 6: 그라운딩 강도 정보
            groundingIntensity: groundingIntensityLevel,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({
            type: "error",
            message: error instanceof Error ? error.message : "스트리밍 오류가 발생했습니다.",
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Saju detail analysis error:", error);

    // Try to get locale from request for error message
    let locale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      locale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    return NextResponse.json(
      { error: getErrorMessage(locale, 'detailAnalysisError') },
      { status: 500 }
    );
  }
}
