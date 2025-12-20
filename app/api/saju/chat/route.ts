import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import {
  getChatPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";

/**
 * 사주 기반 AI 상담 채팅 API
 * 사용자의 사주를 컨텍스트로 가지고 대화
 * Supports localized responses based on locale parameter
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sajuContext, gender, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!messages || !sajuContext) {
      return new Response(
        JSON.stringify({ error: getErrorMessage(locale, 'missingContext') }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const genderText = getGenderLabel(locale, gender === "female" ? "female" : "male");
    const currentYear = new Date().getFullYear();

    const systemPrompt = getChatPrompt(locale, {
      genderText,
      currentYear,
      sajuContext,
    });

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: convertToModelMessages(messages as UIMessage[]),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Saju chat error:", error);

    // Try to get locale from request for error message
    let locale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      locale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    return new Response(
      JSON.stringify({ error: getErrorMessage(locale, 'chatError') }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
