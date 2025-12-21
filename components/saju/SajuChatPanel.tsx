"use client";

import { useState, useRef, useEffect } from "react";
import { useSajuChat, type ChatMessage } from "@/lib/hooks/useSajuChat";
import {
  ChatCircleDots,
  PaperPlaneTilt,
  X,
  Sparkle,
  CaretDown,
  CheckCircle,
  Warning,
} from "@/components/ui/icons";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { getDetailAnalysisFromStorage } from "./DetailAnalysisModal";
import type { SajuResult } from "@/lib/saju/types";

interface SajuChatPanelProps {
  sajuContext: string;
  sajuResult?: SajuResult;
  gender: string;
  locale?: string;
}

// 상세 분석 카테고리 목록
const DETAIL_CATEGORIES = [
  { key: "dayMaster", name: "일간", icon: "☯️" },
  { key: "tenGods", name: "십성", icon: "⭐" },
  { key: "stars", name: "신살", icon: "🌟" },
  { key: "fortune", name: "운세", icon: "📅" },
  { key: "career", name: "직업운", icon: "💼" },
  { key: "relationship", name: "대인관계", icon: "💕" },
  { key: "health", name: "건강운", icon: "💪" },
  { key: "wealth", name: "재물운", icon: "💰" },
] as const;

const SUGGESTED_QUESTIONS = [
  "올해 연애운이 어떤가요?",
  "지금 이직을 해도 될까요?",
  "재테크는 어떻게 하면 좋을까요?",
  "건강에서 주의할 점이 있나요?",
  "올해 좋은 달은 언제인가요?",
  "나에게 맞는 직업은 뭔가요?",
];

export function SajuChatPanel({ sajuContext, sajuResult, gender, locale = "ko" }: SajuChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [showAnalysisWarning, setShowAnalysisWarning] = useState(true);
  const [detailAnalysisStatus, setDetailAnalysisStatus] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 상세 분석 현황 확인
  useEffect(() => {
    const checkDetailAnalysis = () => {
      const saved = getDetailAnalysisFromStorage();
      const status: Record<string, boolean> = {};
      DETAIL_CATEGORIES.forEach(cat => {
        status[cat.key] = !!saved[cat.key];
      });
      setDetailAnalysisStatus(status);
    };
    checkDetailAnalysis();
    // 패널이 열릴 때마다 확인
    if (isOpen) {
      checkDetailAnalysis();
    }
  }, [isOpen]);

  const completedCount = Object.values(detailAnalysisStatus).filter(Boolean).length;
  const totalCount = DETAIL_CATEGORIES.length;
  const allCompleted = completedCount === totalCount;
  const hasAnyMissing = completedCount < totalCount;

  // 새로운 useSajuChat 훅 사용 (2단계 응답 시스템)
  const { messages, sendMessage, isLoading, isSearching, error } = useSajuChat({
    sajuContext,
    sajuResult,
    gender,
    locale,
    enableGrounding: true,
  });

  // 메시지 추가시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput("");
    await sendMessage(messageText);
  };

  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading) return;
    await sendMessage(question);
  };


  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
      >
        <ChatCircleDots className="w-8 h-8" weight="fill" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[380px] bg-[var(--background-card)] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5" weight="fill" />
          <span className="font-bold">사주 AI 상담</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <CaretDown
              className={`w-4 h-4 transition-transform ${
                isMinimized ? "rotate-180" : ""
              }`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 h-[calc(600px-64px-72px)] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--element-fire)]/20 flex items-center justify-center mb-3">
                    <Sparkle
                      className="w-7 h-7 text-[var(--accent)]"
                      weight="fill"
                    />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1">
                    사주 기반 AI 상담
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    당신의 사주를 바탕으로 맞춤형 상담을 해드립니다
                  </p>
                </div>

                {/* 상세 분석 현황 알림 */}
                {showAnalysisWarning && hasAnyMissing && (
                  <div className="mx-1 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Warning className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          상세 분석을 더 확인하면 정확도가 높아져요!
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                          현재 {completedCount}/{totalCount}개 분석 완료
                        </p>

                        {/* 분석 현황 체크리스트 */}
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {DETAIL_CATEGORIES.map((cat) => (
                            <div
                              key={cat.key}
                              className={`flex items-center gap-1 text-xs ${
                                detailAnalysisStatus[cat.key]
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              {detailAnalysisStatus[cat.key] ? (
                                <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-current" />
                              )}
                              <span>{cat.icon} {cat.name}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                          💡 위 탭에서 &quot;상세 분석&quot; 버튼을 눌러주세요
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAnalysisWarning(false)}
                        className="text-amber-400 hover:text-amber-600 p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 모든 분석 완료 시 */}
                {allCompleted && (
                  <div className="mx-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          모든 상세 분석 완료!
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500">
                          최대 정확도로 상담할 수 있어요 ✨
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-[var(--text-tertiary)] px-1">
                    이런 질문을 해보세요
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm rounded-full bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white"
                      : "bg-[var(--background-elevated)] text-[var(--text-primary)]"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      <MarkdownRenderer content={message.content} variant="chat" />
                      {/* 추가 분석 진행 중일 때 자연스러운 로딩 표시 */}
                      {message.isSearching && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0.15s" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0.3s" }} />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* 로딩 인디케이터 */}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="bg-[var(--background-elevated)] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 에러 표시 */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            id="chat-form"
            onSubmit={handleSubmit}
            className="p-4 border-t border-[var(--border)]"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="궁금한 것을 물어보세요..."
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--background-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                <PaperPlaneTilt className="w-5 h-5" weight="fill" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
