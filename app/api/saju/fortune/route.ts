import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import {
  getFortuneSystemPrompt,
  getFortuneUserPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";
import { GEMINI_MODEL } from "@/lib/constants/ai";

// 사주 운세 해석 결과 스키마
const SajuFortuneSchema = z.object({
  overallFortune: z.object({
    score: z.number().min(0).max(100).describe("종합 운세 점수"),
    grade: z.enum(["excellent", "good", "normal", "caution", "challenging"]),
    gradeText: z.string().describe("등급 텍스트 (대길, 길, 보통, 주의, 흉)"),
    summary: z.string().describe("종합 운세 요약 (2-3문장)"),
  }),

  personality: z.object({
    traits: z.array(z.string()).describe("성격 특성 3-5개"),
    strengths: z.array(z.string()).describe("장점 3-4개"),
    weaknesses: z.array(z.string()).describe("개선점 2-3개"),
    description: z.string().describe("성격 종합 설명"),
  }),

  career: z.object({
    score: z.number().min(0).max(100),
    suitableFields: z.array(z.string()).describe("적합한 직업 분야 3-5개"),
    advice: z.string().describe("직업운 조언"),
  }),

  wealth: z.object({
    score: z.number().min(0).max(100),
    pattern: z.string().describe("재물 패턴 (저축형, 투자형 등)"),
    advice: z.string().describe("재물운 조언"),
  }),

  relationship: z.object({
    score: z.number().min(0).max(100),
    loveStyle: z.string().describe("연애 스타일"),
    idealPartner: z.string().describe("이상적인 파트너 유형"),
    advice: z.string().describe("대인관계 조언"),
  }),

  health: z.object({
    score: z.number().min(0).max(100),
    weakPoints: z.array(z.string()).describe("주의해야 할 건강 부위 2-3개"),
    advice: z.string().describe("건강 조언"),
  }),

  yearlyFortune: z.object({
    year: z.number().describe("현재 연도"),
    score: z.number().min(0).max(100),
    theme: z.string().describe("올해의 테마"),
    opportunities: z.array(z.string()).describe("기회 요소 2-3개"),
    challenges: z.array(z.string()).describe("도전 요소 2-3개"),
    monthlyHighlights: z.array(z.object({
      month: z.number(),
      description: z.string(),
    })).describe("주요 월별 포인트 3-4개"),
  }),

  luckyElements: z.object({
    colors: z.array(z.string()).describe("행운의 색상 2-3개"),
    numbers: z.array(z.number()).describe("행운의 숫자 2-3개"),
    directions: z.array(z.string()).describe("길한 방향 1-2개"),
  }),

  advice: z.array(z.string()).describe("종합 조언 3-5개"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sajuData, gender, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!sajuData) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'sajuDataRequired') },
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

    const genderText = getGenderLabel(locale, gender === "female" ? "female" : "male");
    const currentYear = new Date().getFullYear();

    // Gemini를 사용한 사주 운세 해석
    const result = await generateObject({
      model: google(GEMINI_MODEL),
      schema: SajuFortuneSchema,
      messages: [
        {
          role: "system",
          content: getFortuneSystemPrompt(locale, currentYear),
        },
        {
          role: "user",
          content: getFortuneUserPrompt(locale, {
            genderText,
            currentYear,
            sajuData,
          }),
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Saju fortune error:", error);

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
      { error: getErrorMessage(locale, 'analysisError') },
      { status: 500 }
    );
  }
}
