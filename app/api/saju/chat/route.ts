import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
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
import { GEMINI_MODEL } from "@/lib/constants/ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
    const lastUserMessage = messages.filter((m: ChatMessage) => m.role === "user").pop();
    const userMessageText = typeof lastUserMessage?.content === 'string'
      ? lastUserMessage.content
      : "";

    // Check if we should trigger a search
    const triggerCheck = enableGrounding ? shouldTriggerSearch(userMessageText) : { shouldSearch: false, trigger: null, reason: "grounding_disabled" };

    // If no trigger or grounding disabled, use simple streaming response
    if (!triggerCheck.shouldSearch || !triggerCheck.trigger) {
      const result = streamText({
        model: google(GEMINI_MODEL),
        system: systemPrompt,
        messages: messages as Array<{ role: "user" | "assistant"; content: string }>,
      });

      return result.toTextStreamResponse();
    }

    // 2-stage response with SSE using GoogleGenAI directly for better control
    const encoder = new TextEncoder();
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiApiKey) {
      // Fallback to simple response if no API key
      const result = streamText({
        model: google(GEMINI_MODEL),
        system: systemPrompt,
        messages: messages as Array<{ role: "user" | "assistant"; content: string }>,
      });
      return result.toTextStreamResponse();
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const stream = new ReadableStream({
      async start(controller) {
        const trigger = triggerCheck.trigger as TriggerResult;

        try {
          // Build conversation contents for Gemini
          const conversationContents = [
            {
              role: "user" as const,
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model" as const,
              parts: [{ text: "네, 알겠습니다. 사주 상담을 시작하겠습니다." }],
            },
            ...(messages as ChatMessage[]).map((m) => ({
              role: m.role === "user" ? "user" as const : "model" as const,
              parts: [{ text: m.content }],
            })),
          ];

          // Stage 1: Immediate response without search (streaming)
          const primaryResponse = await ai.models.generateContentStream({
            model: GEMINI_MODEL,
            contents: conversationContents,
          });

          // Stream the primary response
          let primaryContent = "";
          for await (const chunk of primaryResponse) {
            const text = chunk.text || "";
            if (text) {
              primaryContent += text;
              controller.enqueue(encoder.encode(createSSEMessage("primary", { content: text })));
            }
          }

          // Notify that search is starting (silent - no visible message)
          controller.enqueue(encoder.encode(createSSEMessage("search_start", {
            category: trigger.category,
          })));

          // Stage 2: Background search with Google Grounding
          if (sajuResult && enableGrounding) {
            try {
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

"참, 요즘 세상 돌아가는 걸 보면요..." 또는 "근데 말이에요, 요즘은요..."로 자연스럽게 시작해서
검색된 ${currentYear}년 최신 트렌드와 이 분의 사주 특성을 결합한 구체적이고 현실적인 조언을 해주세요.

- 실제 시장 상황이나 트렌드를 언급하세요
- 이 분의 사주 특성에 맞춰서 조언하세요
- 4-6문장 정도로 충분히 설명하세요
- 역할극 묘사 없이, 대화체로 자연스럽게

검색 주제: ${searchQuery}`
              : `The user asked: "${userMessageText}"

This person's BaZi profile:
${sajuProfile}

I just gave a basic answer. Now please provide additional advice based on current trends.

Start naturally with "By the way, looking at what's happening these days..." or "You know, lately..."
Combine the ${currentYear} search results with this person's chart characteristics for specific, practical advice.

- Mention actual market conditions or trends
- Tailor advice to their chart characteristics
- Use 4-6 sentences to explain fully
- Natural conversational tone, no roleplay descriptions

Search topic: ${searchQuery}`;

            // Call Gemini with Google Search
            const searchResponse = await ai.models.generateContent({
              model: GEMINI_MODEL,
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
            } catch (groundingError) {
              // Grounding failed - just skip enriched response silently
              console.error("Grounding search failed:", groundingError);
              controller.enqueue(encoder.encode(createSSEMessage("search_complete", {
                success: false,
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
