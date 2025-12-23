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
  getAgeGroup,
  type GroundingContext,
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

    // 초개인화 컨텍스트 추가
    if (personalizedContext) {
      prompt += "\n" + personalizedContext;
    }

    // Add grounding context if needed and sajuResult is available
    if (needsGrounding && sajuResult) {
      const parsedSajuResult: SajuResult = typeof sajuResult === 'string'
        ? JSON.parse(sajuResult)
        : sajuResult;

      const groundingContext: GroundingContext = {
        currentYear,
        currentMonth,
        ageGroup: birthYear ? getAgeGroup(birthYear, currentYear) : "30대",
        sajuResult: parsedSajuResult,
      };

      // Generate personalized search queries based on category
      let searchQueries: string[] = [];
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

      // Generate saju profile summary
      const sajuProfile = generateSajuProfile(parsedSajuResult);

      // Enhance prompt with grounding instructions
      if (locale === 'ko') {
        prompt += `\n\n## 중요: 현재 시대 상황 반영

이 분석은 Google 검색을 통해 ${currentYear}년 현재 트렌드와 시장 상황을 반영해야 합니다.

### 이 분의 사주 프로필
${sajuProfile}

### 검색할 주제
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

### 분석 가이드라인
- "요즘 시대에는...", "현재 ${currentYear}년 트렌드를 보면..." 같은 표현으로 시대상 반영
- 추상적인 사주 해석보다 현실에 적용 가능한 구체적 조언 제공
- 검색된 최신 정보와 사주 분석을 자연스럽게 결합
- 마치 세상 돌아가는 걸 다 아는 역술가처럼 현실적인 조언`;
      } else {
        prompt += `\n\n## IMPORTANT: Reflect Current Trends

This analysis should incorporate ${currentYear} current trends and market conditions through Google Search.

### This Person's BaZi Profile
${sajuProfile}

### Topics to Search
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

### Analysis Guidelines
- Use expressions like "In today's world...", "Looking at ${currentYear} trends..."
- Provide concrete, applicable advice rather than abstract interpretations
- Naturally combine search results with BaZi analysis
- Give realistic advice like a fortune teller who knows current world affairs`;
      }
    }

    // Build config with or without Google Search tool
    const config = needsGrounding ? {
      tools: [{ googleSearch: {} }],
    } : {};

    // Call Gemini API
    const response = await ai.models.generateContent({
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

    // Extract text from response
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    // Extract source URLs from grounding chunks
    const sources = groundingChunks
      .filter((chunk: { web?: { uri?: string; title?: string } }) => chunk.web?.uri)
      .map((chunk: { web?: { uri?: string; title?: string } }) => ({
        url: chunk.web?.uri,
        title: chunk.web?.title || "",
      }))
      .slice(0, 5); // Limit to 5 sources

    return NextResponse.json({
      content: responseText,
      category,
      grounded: needsGrounding,
      groundingSources: sources,
      searchQueries: webSearchQueries,
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
