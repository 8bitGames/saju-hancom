"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PaperPlaneTilt,
  Sparkle,
  Lightning,
  Heart,
  Briefcase,
  FirstAid,
  CurrencyCircleDollar,
  Calendar,
  Users,
} from "@phosphor-icons/react";
import { useSajuChat } from "@/lib/hooks/useSajuChat";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { STEM_KOREAN, ELEMENT_KOREAN } from "@/lib/saju";
import type { SajuResult } from "@/lib/saju/types";

// Suggested question categories with icons
const QUESTION_CATEGORIES = [
  {
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    label: "연애",
    questions: ["올해 연애운이 어떤가요?", "제 이상형은 어떤 사람인가요?"],
  },
  {
    icon: Briefcase,
    color: "from-blue-500 to-indigo-500",
    label: "직업",
    questions: ["나에게 맞는 직업은 뭔가요?", "지금 이직해도 될까요?"],
  },
  {
    icon: CurrencyCircleDollar,
    color: "from-emerald-500 to-teal-500",
    label: "재물",
    questions: ["재테크는 어떻게 하면 좋을까요?", "올해 재물운이 어떤가요?"],
  },
  {
    icon: FirstAid,
    color: "from-orange-500 to-amber-500",
    label: "건강",
    questions: ["건강에서 주의할 점이 있나요?", "어떤 운동이 나에게 좋을까요?"],
  },
  {
    icon: Calendar,
    color: "from-purple-500 to-violet-500",
    label: "운세",
    questions: ["올해 좋은 달은 언제인가요?", "이번 달 운세가 궁금해요"],
  },
  {
    icon: Users,
    color: "from-cyan-500 to-blue-500",
    label: "대인관계",
    questions: ["직장 동료와의 관계가 힘들어요", "좋은 인연을 만나려면?"],
  },
];

interface InlineSajuChatProps {
  sajuResult: SajuResult;
  gender: string;
}

// Build saju context string from result
function buildSajuContext(result: SajuResult, gender: string): string {
  const parts = [
    `일간: ${STEM_KOREAN[result.dayMaster]} (${ELEMENT_KOREAN[result.dayMasterElement]}, ${result.dayMasterYinYang === "yang" ? "양" : "음"})`,
    `년주: ${result.pillars.year.ganZhi} (${result.pillars.year.koreanReading})`,
    `월주: ${result.pillars.month.ganZhi} (${result.pillars.month.koreanReading})`,
    `일주: ${result.pillars.day.ganZhi} (${result.pillars.day.koreanReading})`,
    `시주: ${result.pillars.time.ganZhi} (${result.pillars.time.koreanReading})`,
    `오행: ${Object.entries(result.elementAnalysis.scores)
      .map(([el, score]) => `${ELEMENT_KOREAN[el as keyof typeof ELEMENT_KOREAN]}(${score})`)
      .join(", ")}`,
    `강한 오행: ${result.elementAnalysis.dominant.map((e) => ELEMENT_KOREAN[e]).join(", ")}`,
    `부족한 오행: ${result.elementAnalysis.lacking.map((e) => ELEMENT_KOREAN[e]).join(", ")}`,
    `용신: ${result.elementAnalysis.yongShin || "분석 필요"}`,
    `주요 십성: ${result.tenGodSummary.dominant.join(", ")}`,
    `신살: ${result.stars.map((s) => s.name).join(", ")}`,
    `성별: ${gender === "male" ? "남성" : "여성"}`,
  ];
  return parts.join("\n");
}

export function InlineSajuChat({ sajuResult, gender }: InlineSajuChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Build saju context for AI
  const sajuContext = useMemo(() => buildSajuContext(sajuResult, gender), [sajuResult, gender]);

  // Use chat hook
  const { messages, sendMessage, isLoading, error } = useSajuChat({
    sajuContext,
    sajuResult,
    gender,
    locale: "ko",
    enableGrounding: true,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput("");
    setSelectedCategory(null);
    await sendMessage(messageText);
  };

  const handleQuestionClick = async (question: string) => {
    if (isLoading) return;
    setSelectedCategory(null);
    await sendMessage(question);
  };

  return (
    <div className="space-y-4">
      {/* Messages Area - Scrollable Container */}
      <div className="min-h-[400px] max-h-[500px] overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
        {/* Welcome Message & Categories - Show when no messages */}
        {messages.length === 0 && (
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Welcome Card */}
            <div className="text-center py-4">
              <motion.div
                className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkle className="w-8 h-8 text-white" weight="fill" />
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-1">AI 사주 상담</h3>
              <p className="text-white/60 text-sm">
                <span className="text-blue-300 font-semibold">{STEM_KOREAN[sajuResult.dayMaster]}</span> 일간을 가진
                당신을 위한 맞춤 상담
              </p>
            </div>

            {/* Question Categories */}
            <div className="space-y-3">
              <p className="text-xs text-white/50 flex items-center gap-2 px-1">
                <Lightning className="w-4 h-4 text-yellow-400" weight="fill" />
                궁금한 분야를 선택하세요
              </p>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_CATEGORIES.map((cat, idx) => (
                  <motion.button
                    key={cat.label}
                    onClick={() => setSelectedCategory(selectedCategory === idx ? null : idx)}
                    className={`p-2.5 rounded-lg transition-all ${
                      selectedCategory === idx
                        ? `bg-gradient-to-br ${cat.color} text-white shadow-md`
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <cat.icon className="w-5 h-5 mx-auto mb-0.5" weight="fill" />
                    <p className="text-xs font-medium">{cat.label}</p>
                  </motion.button>
                ))}
              </div>

              {/* Show questions for selected category */}
              <AnimatePresence mode="wait">
                {selectedCategory !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {QUESTION_CATEGORIES[selectedCategory].questions.map((q, idx) => (
                      <motion.button
                        key={q}
                        onClick={() => handleQuestionClick(q)}
                        disabled={isLoading}
                        className={`w-full p-2.5 rounded-lg text-left text-sm bg-gradient-to-r ${QUESTION_CATEGORIES[selectedCategory].color} text-white hover:opacity-90 transition-opacity disabled:opacity-50`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {q}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        {messages.map((message, index) => (
          <motion.div
            key={message.id || index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {message.role === "assistant" ? (
                <>
                  <MarkdownRenderer content={message.content} variant="chat" />
                  {message.isSearching && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                          style={{ animationDelay: "0.15s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                      </div>
                      <span>최신 정보 검색 중...</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Loading indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="궁금한 것을 물어보세요..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <PaperPlaneTilt className="w-5 h-5" weight="fill" />
        </button>
      </form>
    </div>
  );
}
