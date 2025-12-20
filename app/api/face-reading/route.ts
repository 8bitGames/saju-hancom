import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import {
  getFaceReadingSystemPrompt,
  getFaceReadingUserPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";

// 관상 분석 결과 스키마
const FaceReadingResultSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("종합 점수 (0-100)"),
  overallGrade: z.enum(["excellent", "good", "normal", "caution", "challenging"]).describe("종합 등급"),
  gradeText: z.string().describe("등급 텍스트 (예: 대길, 길, 보통 등)"),

  faceShape: z.object({
    type: z.string().describe("얼굴형 타입"),
    koreanName: z.string().describe("한글 이름"),
    description: z.string().describe("얼굴형 설명"),
    characteristics: z.array(z.string()).describe("특징 목록"),
  }),

  features: z.object({
    forehead: z.object({
      koreanName: z.string().describe("이마 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("이마 분석 설명"),
      fortune: z.string().describe("이마 관련 운세"),
    }),
    eyes: z.object({
      koreanName: z.string().describe("눈 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("눈 분석 설명"),
      fortune: z.string().describe("눈 관련 운세"),
    }),
    nose: z.object({
      koreanName: z.string().describe("코 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("코 분석 설명"),
      fortune: z.string().describe("코 관련 운세"),
    }),
    mouth: z.object({
      koreanName: z.string().describe("입 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("입 분석 설명"),
      fortune: z.string().describe("입 관련 운세"),
    }),
    ears: z.object({
      koreanName: z.string().describe("귀 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("귀 분석 설명"),
      fortune: z.string().describe("귀 관련 운세"),
    }),
  }),

  fortuneAreas: z.object({
    wealth: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("재물운"),
    career: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("직업운"),
    relationship: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("대인관계"),
    health: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("건강운"),
    love: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("애정운"),
  }),

  strengths: z.array(z.string()).describe("강점 목록 (3-5개)"),
  advice: z.array(z.string()).describe("조언 목록 (3-5개)"),
  luckyElements: z.array(z.string()).describe("행운의 요소 (색상, 방향, 숫자 등 3개)"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, gender, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!imageBase64) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'imageRequired') },
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

    // Gemini를 사용한 관상 분석
    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: FaceReadingResultSchema,
      messages: [
        {
          role: "system",
          content: getFaceReadingSystemPrompt(locale),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: getFaceReadingUserPrompt(locale, genderText),
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Face reading error:", error);

    // Try to get locale from request for error message
    let locale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      locale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    // 더 자세한 에러 메시지
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
      { error: getErrorMessage(locale, 'faceReadingError') },
      { status: 500 }
    );
  }
}
