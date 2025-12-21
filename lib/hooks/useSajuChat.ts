"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isEnriched?: boolean;
  sources?: Array<{ url?: string; title?: string }>;
  isSearching?: boolean;
}

interface UseSajuChatOptions {
  sajuContext: string;
  sajuResult?: unknown;
  gender: string;
  locale?: string;
  enableGrounding?: boolean;
}

interface UseSajuChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  clearMessages: () => void;
}

/**
 * 사주 채팅용 커스텀 훅
 * 2단계 응답 시스템을 지원합니다:
 * 1. Primary 응답: 즉시 스트리밍
 * 2. Enriched 응답: 검색 후 추가 정보
 */
export function useSajuChat({
  sajuContext,
  sajuResult,
  gender,
  locale = "ko",
  enableGrounding = true,
}: UseSajuChatOptions): UseSajuChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);
      setIsSearching(false);

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };

      // Add placeholder for assistant message
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Prepare request body
      const body = {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        sajuContext,
        sajuResult,
        gender,
        locale,
        enableGrounding,
      };

      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/saju/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const contentType = response.headers.get("content-type") || "";
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let enrichedContent = "";
        let sources: Array<{ url?: string; title?: string }> = [];

        // Check if this is SSE or standard stream
        const isSSE = contentType.includes("text/event-stream");

        if (isSSE) {
          // Handle custom SSE format for 2-stage response
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  switch (parsed.type) {
                    case "primary":
                      accumulatedContent += parsed.content || "";
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: accumulatedContent }
                            : m
                        )
                      );
                      break;

                    case "search_start":
                      setIsSearching(true);
                      // Just set searching state - no visible message change
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, isSearching: true }
                            : m
                        )
                      );
                      break;

                    case "search_complete":
                      setIsSearching(false);
                      break;

                    case "enriched":
                      enrichedContent = parsed.content || "";
                      sources = parsed.sources || [];

                      // Update the message with enriched content
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === assistantMessageId
                            ? {
                                ...m,
                                content: accumulatedContent + "\n\n" + enrichedContent,
                                isEnriched: true,
                                sources,
                                isSearching: false,
                              }
                            : m
                        )
                      );
                      break;

                    case "error":
                      setError(parsed.message || "An error occurred");
                      break;
                  }
                } catch (parseError) {
                  // Skip invalid JSON
                  console.error("Failed to parse SSE data:", data);
                }
              }
            }
          }
        } else {
          // Handle plain text stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: accumulatedContent }
                  : m
              )
            );
          }
        }

        // Clean up any searching state after completion
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, isSearching: false }
              : m
          )
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // Request was aborted, ignore
          return;
        }
        console.error("Chat error:", err);
        setError((err as Error).message || "An error occurred");

        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
      } finally {
        setIsLoading(false);
        setIsSearching(false);
        abortControllerRef.current = null;
      }
    },
    [messages, sajuContext, sajuResult, gender, locale, enableGrounding, isLoading]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    isSearching,
    error,
    clearMessages,
  };
}
