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
  | "wealth";

const validCategories: DetailCategory[] = [
  "dayMaster", "tenGods", "stars", "fortune",
  "career", "relationship", "health", "wealth"
];

// Google Grounding이 필요한 카테고리
const groundingCategories: DetailCategory[] = [
  "career", "wealth", "relationship", "health", "fortune"
];

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
          category // 현재 분석 중인 카테고리를 쿼리로 사용
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
