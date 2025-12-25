import { NextRequest } from "next/server";
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
  shouldTriggerSearchWithContext,
  generatePersonalizedTriggerQuery,
  getMajorFortuneSummary,
  type TriggerResult,
  type PersonalizedSearchContext,
} from "@/lib/saju/search-triggers";
import {
  generateChatSearchQuery,
  generateSajuProfile,
} from "@/lib/saju/personalized-keywords";
import type { SajuResult } from "@/lib/saju/types";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import { getPersonalizedContext } from "@/lib/saju/agents";

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
    const { messages, sajuContext, sajuResult, gender, birthYear, locale: requestLocale, enableGrounding = true } = body;

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
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();

    // Get the last user message for trigger detection
    const lastUserMessage = messages.filter((m: ChatMessage) => m.role === "user").pop();
    const userMessageText = typeof lastUserMessage?.content === 'string'
      ? lastUserMessage.content
      : "";

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
          userMessageText
        );
      } catch (e) {
        console.error("Failed to generate personalized context:", e);
      }
    }

    // 기본 시스템 프롬프트 + 초개인화 컨텍스트
    let systemPrompt = getChatPrompt(locale, {
      genderText,
      currentYear,
      sajuContext,
    });

    // 현재 날짜 정보 추가
    const dateContext = locale === 'ko'
      ? `\n\n## 현재 시점\n오늘은 ${currentYear}년 ${currentMonth}월 ${currentDay}일입니다. 모든 조언은 현재 시점을 기준으로 해주세요.`
      : `\n\n## Current Date\nToday is ${currentMonth}/${currentDay}/${currentYear}. All advice should be based on the current date.`;

    systemPrompt += dateContext;

    // 초개인화 컨텍스트 추가
    if (personalizedContext) {
      systemPrompt += "\n" + personalizedContext;
    }

    // 🆕 사주 컨텍스트 기반 검색 트리거 감지 (Phase 2 개선)
    let searchContext: PersonalizedSearchContext | undefined;
    let parsedSajuForTrigger: SajuResult | undefined;

    if (sajuResult && birthYear) {
      try {
        parsedSajuForTrigger = typeof sajuResult === 'string'
          ? JSON.parse(sajuResult)
          : sajuResult;
        searchContext = {
          sajuResult: parsedSajuForTrigger!,
          birthYear,
          currentYear,
          currentAge: currentYear - birthYear + 1,
        };
      } catch (e) {
        console.error("Failed to parse saju result for trigger:", e);
      }
    }

    // 사주 컨텍스트가 있으면 개인화된 트리거 감지 사용
    const triggerCheck = enableGrounding
      ? shouldTriggerSearchWithContext(userMessageText, searchContext)
      : { shouldSearch: false, trigger: null, personalizedQueries: [], reason: "grounding_disabled" };

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

    // Dynamic import to prevent build-time evaluation
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const stream = new ReadableStream({
      async start(controller) {
        const trigger = triggerCheck.trigger as TriggerResult;

        try {
          // Build conversation contents for Gemini
          const acknowledgment = locale === 'ko'
            ? "네, 알겠습니다. 사주 상담을 시작하겠습니다."
            : "Yes, I understand. Let me begin the birth chart consultation.";

          const conversationContents = [
            {
              role: "user" as const,
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model" as const,
              parts: [{ text: acknowledgment }],
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

            // 🆕 Phase 2 개선: 개인화된 검색 쿼리 사용
            const personalizedQueries = triggerCheck.personalizedQueries;
            const searchQuery = personalizedQueries.length > 0
              ? personalizedQueries[0]
              : generateChatSearchQuery(
                  userMessageText,
                  parsedSajuResult,
                  trigger.category as "career" | "wealth" | "relationship" | "health" | "fortune",
                  currentYear
                );

            // Get saju profile for context (with current age for 대운)
            const currentAge = birthYear ? currentYear - birthYear + 1 : undefined;
            const sajuProfile = generateSajuProfile(parsedSajuResult, currentAge);

            // 🆕 대운 상태 요약 추가
            const fortuneSummary = birthYear
              ? getMajorFortuneSummary(parsedSajuResult, birthYear, currentYear)
              : null;

            // 사주 기반 맞춤 산업/투자 정보 생성
            const yongShin = parsedSajuResult.elementAnalysis?.yongShin;
            const dominantElements = parsedSajuResult.elementAnalysis?.dominant || [];
            const ELEMENT_KOREAN: Record<string, string> = {
              wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)"
            };
            const ELEMENT_INDUSTRIES: Record<string, string[]> = {
              wood: ["친환경", "ESG", "바이오", "헬스케어", "교육테크", "신재생에너지"],
              fire: ["AI", "반도체", "메타버스", "디지털콘텐츠", "전기차", "배터리"],
              earth: ["부동산", "인프라", "건설", "물류", "유통", "농식품"],
              metal: ["핀테크", "로봇", "자동화", "블록체인", "보안", "정밀기계"],
              water: ["글로벌이커머스", "물류", "여행", "유통", "미디어", "엔터테인먼트"]
            };

            const yongShinKorean = yongShin ? ELEMENT_KOREAN[yongShin] : "";
            const yongShinIndustries = yongShin ? ELEMENT_INDUSTRIES[yongShin]?.join(", ") : "";
            const dominantIndustries = dominantElements.length > 0 && ELEMENT_INDUSTRIES[dominantElements[0]]
              ? ELEMENT_INDUSTRIES[dominantElements[0]].join(", ")
              : "";

            // Build the enriched prompt (🆕 대운 정보 및 개인화 쿼리 추가)
            const enrichedPrompt = locale === 'ko'
              ? `사용자가 "${userMessageText}"라고 물었습니다.

이 분의 사주 프로필:
${sajuProfile}
${fortuneSummary ? `\n**현재 대운 상태**: ${fortuneSummary}` : ""}

**매우 중요 - 이 분에게 맞는 분야**:
- 용신(用神): ${yongShinKorean || "분석 필요"} → 추천 산업: ${yongShinIndustries || "다양한 분야"}
- 강한 오행: ${dominantElements.map(e => ELEMENT_KOREAN[e]).join(", ") || "균형"} → 관련 산업: ${dominantIndustries || "다양한 분야"}

방금 기본 답변을 드렸으니, 이제 이 분의 사주에 맞는 구체적인 조언을 드려주세요.

"참, 이 분 사주를 보면요..." 또는 "근데 말이에요, 이 분의 기운을 보면..."로 자연스럽게 시작해서:

**반드시 지켜야 할 규칙**:
1. 절대로 "AI가 유망하다", "반도체에 투자하라" 같은 뻔한 일반론 금지!
2. 반드시 이 분의 용신(${yongShinKorean || "오행"})에 맞는 산업을 추천하세요
3. 예: 용신이 木이면 ESG/바이오, 火면 AI/반도체, 土면 부동산, 金이면 핀테크, 水면 글로벌이커머스
4. ${currentYear}년 해당 산업의 실제 동향을 검색해서 구체적으로 말해주세요
5. 4-6문장으로 이 분의 사주에 딱 맞는 맞춤 조언을 해주세요
${fortuneSummary ? `6. 현재 대운 시기를 고려하여 시기적 조언도 해주세요` : ""}

검색 주제: ${personalizedQueries.length > 0 ? personalizedQueries.join(" / ") : (yongShin ? `${currentYear}년 ${yongShinIndustries?.split(",")[0]} 산업 전망` : searchQuery)}`
              : `The user asked: "${userMessageText}"

This person's BaZi profile:
${sajuProfile}
${fortuneSummary ? `\n**Current Major Fortune Period**: ${fortuneSummary}` : ""}

**Very Important - Suitable Fields for This Person**:
- Yongsin (Beneficial Element): ${yongShin || "needs analysis"} → Recommended industries: ${yongShinIndustries || "various"}
- Dominant elements: ${dominantElements.join(", ") || "balanced"} → Related industries: ${dominantIndustries || "various"}

I just gave a basic answer. Now provide advice specifically tailored to their chart.

Start naturally with "Looking at your chart..." or "Based on your energy..."

**Must Follow These Rules**:
1. NEVER give generic advice like "AI is promising" or "invest in semiconductors"!
2. MUST recommend industries aligned with their Yongsin (${yongShin || "element"})
3. Example: Wood → ESG/Bio, Fire → AI/Semiconductor, Earth → Real Estate, Metal → Fintech, Water → Global E-commerce
4. Search for ${currentYear} trends in THOSE specific industries
5. Give 4-6 sentences of personalized advice matching their chart
${fortuneSummary ? `6. Consider their current major fortune period for timing advice` : ""}

Search topic: ${personalizedQueries.length > 0 ? personalizedQueries.join(" / ") : (yongShin ? `${currentYear} ${yongShinIndustries?.split(",")[0]} industry outlook` : searchQuery)}`;

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
