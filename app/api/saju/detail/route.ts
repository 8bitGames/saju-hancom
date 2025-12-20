import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  getDetailSystemPrompt,
  getDetailPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";

/**
 * 사주 상세 분석 API
 * 특정 영역에 대해 더 깊은 분석을 제공
 * Supports localized responses based on locale parameter
 */

type DetailCategory =
  | "dayMaster"      // 일간 상세
  | "tenGods"        // 십성 상세
  | "stars"          // 신살 상세
  | "fortune"        // 운세 상세
  | "career"         // 직업운 상세
  | "relationship"   // 대인관계 상세
  | "health"         // 건강운 상세
  | "wealth";        // 재물운 상세

const validCategories: DetailCategory[] = [
  "dayMaster", "tenGods", "stars", "fortune",
  "career", "relationship", "health", "wealth"
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, sajuContext, gender, locale: requestLocale } = body;

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

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      messages: [
        {
          role: "system",
          content: getDetailSystemPrompt(locale, currentYear),
        },
        {
          role: "user",
          content: locale === 'ko'
            ? `다음은 ${genderText}의 사주 정보입니다:\n\n${sajuContext}\n\n${getDetailPrompt(locale, category as DetailCategory)}`
            : `The following is the birth chart information for a ${genderText}:\n\n${sajuContext}\n\n${getDetailPrompt(locale, category as DetailCategory)}`,
        },
      ],
    });

    return NextResponse.json({
      content: result.text,
      category
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
