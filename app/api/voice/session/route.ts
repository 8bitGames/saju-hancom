import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildVoiceSystemPrompt, generateGreeting } from "@/lib/voice/voice-prompts";
import type { VoiceSessionConfig, ConversationMessage } from "@/lib/voice/types";
import { getConversation, getUserAnalysesContext } from "@/lib/actions/conversation";

const VOICE_SIDECAR_URL = process.env.VOICE_SIDECAR_API_URL || "https://hansa-voice.fly.dev";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Auth is optional - guests can use voice too
    const isAuthenticated = !!user;

    const body = await request.json();
    const { locale, primaryContext, contextId } = body as VoiceSessionConfig & { contextId?: string };

    // For authenticated users, load existing conversation and all analyses
    let existingMessages: ConversationMessage[] = [];
    let userAnalyses = undefined;

    if (isAuthenticated) {
      // Get existing conversation for this context
      const conversationResult = await getConversation({
        contextType: primaryContext.type,
        contextId,
      });
      if (conversationResult.success && conversationResult.messages) {
        existingMessages = conversationResult.messages;
      }

      // Get all user's analyses for full context
      const analysesResult = await getUserAnalysesContext();
      if (analysesResult.success) {
        userAnalyses = analysesResult.analyses;
      }
    }

    // Build system prompt with full context
    const systemPrompt = buildVoiceSystemPrompt(
      primaryContext.type,
      primaryContext.data,
      locale,
      userAnalyses
    );

    // Generate contextual greeting (only for new conversations)
    const isResuming = existingMessages.length > 0;
    const greeting = isResuming
      ? generateResumingGreeting(primaryContext.type, locale)
      : generateGreeting(primaryContext.type, locale);

    // Create session on Fly.io sidecar
    const sessionId = crypto.randomUUID();
    const sessionResponse = await fetch(`${VOICE_SIDECAR_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        systemPrompt,
        locale,
        contextType: primaryContext.type,
        greeting,
        existingMessages: existingMessages.map(m => ({
          role: m.role,
          content: m.content,
          channel: m.channel,
        })),
      }),
    });

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      console.error("[Voice Session] Sidecar error:", errorText);
      throw new Error("Failed to create session on sidecar");
    }

    // Return WebSocket URL for client to connect directly to sidecar
    const wsUrl = process.env.NEXT_PUBLIC_VOICE_SIDECAR_URL || "wss://hansa-voice.fly.dev";

    return NextResponse.json({
      success: true,
      sessionId,
      greeting,
      isResuming,
      existingMessages,
      wsUrl: `${wsUrl}/ws?sessionId=${sessionId}`,
    });
  } catch (error) {
    console.error("[Voice Session] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create voice session" },
      { status: 500 }
    );
  }
}

function generateResumingGreeting(contextType: string, locale: string): string {
  const greetings: Record<string, Record<string, string>> = {
    saju: {
      ko: "아, 다시 오셨네요. 더 궁금한 거 있으세요?",
      en: "Welcome back. What else would you like to know?",
      ja: "お帰りなさい。他に気になることはありますか？",
      zh: "欢迎回来。还有什么想问的吗？",
    },
    compatibility: {
      ko: "다시 오셨군요. 궁합에 대해 더 물어보실 거 있나요?",
      en: "You're back. Any more questions about your compatibility?",
      ja: "戻ってきましたね。相性について他に聞きたいことは？",
      zh: "你回来了。还有关于合婚的问题吗？",
    },
    faceReading: {
      ko: "관상 얘기 더 하러 오셨네요. 뭐가 궁금하세요?",
      en: "Back for more face reading insights. What's on your mind?",
      ja: "人相の話をもっと聞きたいのですね。何が気になりますか？",
      zh: "又来聊面相了。有什么想问的？",
    },
  };

  return greetings[contextType]?.[locale] || greetings[contextType]?.["ko"] || "";
}
