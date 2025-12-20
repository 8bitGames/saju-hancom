import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import {
  getCompatibilitySystemPrompt,
  getCompatibilityUserPrompt,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";

// 궁합 분석 결과 스키마
const CompatibilitySchema = z.object({
  overallScore: z.number().min(0).max(100).describe("종합 궁합 점수"),
  grade: z.enum(["excellent", "good", "normal", "caution", "challenging"]),
  gradeText: z.string().describe("등급 텍스트 (천생연분, 좋음, 보통, 주의, 어려움)"),
  summary: z.string().describe("궁합 종합 요약 (2-3문장)"),

  compatibility: z.object({
    communication: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("소통 스타일 분석"),
    }),
    collaboration: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("협업 능력 분석"),
    }),
    trust: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("신뢰 관계 분석"),
    }),
    growth: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("함께 성장 가능성"),
    }),
    emotionalConnection: z.object({
      score: z.number().min(0).max(100),
      description: z.string().describe("정서적 교감"),
    }),
  }),

  elementAnalysis: z.object({
    person1Dominant: z.string().describe("첫 번째 사람의 주요 오행"),
    person2Dominant: z.string().describe("두 번째 사람의 주요 오행"),
    interaction: z.string().describe("두 오행의 상호작용 (상생/상극)"),
    balanceAdvice: z.string().describe("균형을 위한 조언"),
  }),

  strengths: z.array(z.string()).describe("관계의 강점 3-5개"),
  challenges: z.array(z.string()).describe("관계의 도전 과제 2-4개"),

  relationshipAdvice: z.object({
    doList: z.array(z.string()).describe("관계 발전을 위해 할 일 3-4개"),
    dontList: z.array(z.string()).describe("피해야 할 행동 2-3개"),
    communicationTips: z.array(z.string()).describe("소통 팁 2-3개"),
  }),

  timing: z.object({
    goodPeriods: z.array(z.string()).describe("함께 하기 좋은 시기 2-3개"),
    cautionPeriods: z.array(z.string()).describe("주의가 필요한 시기 1-2개"),
  }),

  luckyElements: z.object({
    colors: z.array(z.string()).describe("함께 할 때 좋은 색상 2개"),
    activities: z.array(z.string()).describe("함께 하면 좋은 활동 3-4개"),
    places: z.array(z.string()).describe("함께 가면 좋은 장소 2-3개"),
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
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'apiKeyMissing') },
        { status: 500 }
      );
    }

    // Gemini를 사용한 궁합 분석
    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: CompatibilitySchema,
      messages: [
        {
          role: "system",
          content: getCompatibilitySystemPrompt(locale),
        },
        {
          role: "user",
          content: getCompatibilityUserPrompt(locale, {
            person1,
            person2,
            relationType: relationType || 'default',
          }),
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Compatibility analysis error:", error);

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
    }

    return NextResponse.json(
      { error: getErrorMessage(locale, 'compatibilityError') },
      { status: 500 }
    );
  }
}
