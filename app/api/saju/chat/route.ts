import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import {
  getChatPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";
import {
  shouldTriggerSearch,
  type TriggerResult,
} from "@/lib/saju/search-triggers";
import {
  generateChatSearchQuery,
  generateSajuProfile,
} from "@/lib/saju/personalized-keywords";
import type { SajuResult } from "@/lib/saju/types";

/**
 * 사주 기반 AI 상담 채팅 API
 * 2단계 응답 시스템:
 * 1차 응답: 즉시 응답 (검색 없이)
 * 2차 응답: 트리거 감지 시 Google Grounding 검색 후 보강된 응답
 */

// SSE 메시지 타입
type MessageType = "primary" | "enriched" | "search_start" | "search_complete" | "error";

function createSSEMessage(type: MessageType, data: unknown): string {
  return `data: ${JSON.stringify({ type, ...data as Record<string, unknown> })}\n\n`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sajuContext, sajuResult, gender, locale: requestLocale, enableGrounding = true } = body;

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

    // Get the last user message for trigger detection
    const lastUserMessage = messages.filter((m: UIMessage) => m.role === "user").pop();
    const userMessageText = lastUserMessage?.content || "";

    // Check if we should trigger a search
    const triggerCheck = enableGrounding ? shouldTriggerSearch(userMessageText) : { shouldSearch: false, trigger: null, reason: "grounding_disabled" };

    // If no trigger or grounding disabled, use simple streaming response
    if (!triggerCheck.shouldSearch || !triggerCheck.trigger) {
      const result = streamText({
        model: google("gemini-2.0-flash"),
        system: systemPrompt,
        messages: convertToModelMessages(messages as UIMessage[]),
      });

      return result.toUIMessageStreamResponse();
    }

    // 2-stage response with SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const trigger = triggerCheck.trigger as TriggerResult;

        try {
          // Stage 1: Immediate response without search
          const primaryResult = await streamText({
            model: google("gemini-2.0-flash"),
            system: systemPrompt,
            messages: convertToModelMessages(messages as UIMessage[]),
          });

          // Stream the primary response
          let primaryContent = "";
          for await (const chunk of primaryResult.textStream) {
            primaryContent += chunk;
            controller.enqueue(encoder.encode(createSSEMessage("primary", { content: chunk })));
          }

          // Notify that search is starting (silent - no visible message)
          controller.enqueue(encoder.encode(createSSEMessage("search_start", {
            category: trigger.category,
          })));

          // Stage 2: Background search with Google Grounding
          if (sajuResult && enableGrounding) {
            const ai = new GoogleGenAI({
              apiKey: process.env.GEMINI_API_KEY || "",
            });

            const parsedSajuResult: SajuResult = typeof sajuResult === 'string'
              ? JSON.parse(sajuResult)
              : sajuResult;

            // Generate personalized search query
            const searchQuery = generateChatSearchQuery(
              userMessageText,
              parsedSajuResult,
              trigger.category as "career" | "wealth" | "relationship" | "health" | "fortune",
              currentYear
            );

            // Get saju profile for context
            const sajuProfile = generateSajuProfile(parsedSajuResult);

            // Build the enriched prompt
            const enrichedPrompt = locale === 'ko'
              ? `사용자가 "${userMessageText}"라고 물었습니다.

이 분의 사주 프로필:
${sajuProfile}

방금 기본 답변을 드렸으니, 이제 최신 정보를 바탕으로 추가 조언을 드려주세요.
"추가로 말씀드리자면..." 또는 "요즘 상황을 보면..."으로 시작해서
검색된 최신 트렌드와 사주 분석을 결합한 현실적인 조언을 2-3문장으로 간결하게 해주세요.

검색 주제: ${searchQuery}`
              : `The user asked: "${userMessageText}"

This person's BaZi profile:
${sajuProfile}

I just gave a basic answer. Now please provide additional advice based on current trends.
Start with "Additionally..." or "Looking at current trends..."
Provide 2-3 sentences of practical advice combining search results with BaZi analysis.

Search topic: ${searchQuery}`;

            // Call Gemini with Google Search
            const searchResponse = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              config: {
                tools: [{ googleSearch: {} }],
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: enrichedPrompt }],
                },
              ],
            });

            const enrichedContent = searchResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const groundingMetadata = searchResponse.candidates?.[0]?.groundingMetadata;

            // Notify search is complete
            controller.enqueue(encoder.encode(createSSEMessage("search_complete", {
              success: true,
            })));

            // Send enriched response
            if (enrichedContent) {
              controller.enqueue(encoder.encode(createSSEMessage("enriched", {
                content: enrichedContent,
                sources: groundingMetadata?.groundingChunks?.slice(0, 3).map((chunk: { web?: { uri?: string; title?: string } }) => ({
                  url: chunk.web?.uri,
                  title: chunk.web?.title,
                })) || [],
              })));
            }
          }

          // Close the stream
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Chat streaming error:", error);
          controller.enqueue(encoder.encode(createSSEMessage("error", {
            message: getErrorMessage(locale, 'chatError'),
          })));
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
