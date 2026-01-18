"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown } from "@phosphor-icons/react";
import { DreamInput } from "@/components/dream/DreamInput";
import { DreamResult } from "@/components/dream/DreamResult";
import { Button } from "@/components/ui/button";

interface DreamSymbol {
  symbol: string;
  meaning: string;
  fortune: "good" | "neutral" | "caution";
}

interface DreamInterpretationResult {
  symbols: DreamSymbol[];
  overallFortune: "good" | "neutral" | "caution";
  interpretation: string;
  advice: string;
  luckyNumbers: number[];
  relatedElements: string[];
}

type ViewState = "input" | "result" | "error" | "limit";

/**
 * 해몽 페이지 클라이언트 컴포넌트
 */
export function DreamClient() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DreamInterpretationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (dreamContent: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dream/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dreamContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "AUTH_REQUIRED") {
          // 로그인 필요
          router.push("/login?redirect=/dream");
          return;
        }

        if (data.code === "FREE_LIMIT_REACHED") {
          setViewState("limit");
          return;
        }

        throw new Error(data.error || "해몽에 실패했습니다.");
      }

      if (data.success && data.data) {
        setResult(data.data);
        setViewState("result");
      } else {
        throw new Error("해몽 결과를 가져올 수 없습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setViewState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setViewState("input");
  };

  const handleUpgrade = () => {
    router.push("/premium");
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">꿈 해몽</h1>
          <p className="text-sm text-gray-500">전통 동양 해몽으로 꿈을 풀이합니다</p>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <AnimatePresence mode="wait">
          {viewState === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DreamInput onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {viewState === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DreamResult result={result} onReset={handleReset} />
            </motion.div>
          )}

          {viewState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-3xl">😔</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                해몽에 실패했습니다
              </h3>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                다시 시도하기
              </Button>
            </motion.div>
          )}

          {viewState === "limit" && (
            <motion.div
              key="limit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C4A35A]/10 flex items-center justify-center">
                <Crown className="w-8 h-8 text-[#C4A35A]" weight="fill" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                오늘의 무료 해몽을 사용하셨습니다
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                프리미엄 구독으로 무제한 해몽을 이용해보세요
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] hover:from-[#b8974e] hover:to-[#9c8344] text-white"
                >
                  <Crown className="w-4 h-4 mr-2" weight="fill" />
                  프리미엄 구독하기
                </Button>
                <button
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  돌아가기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 푸터 안내 */}
      <p className="text-center text-xs text-gray-400 px-4">
        AI 해몽은 전통 해몽학을 참고한 것으로, 재미로 봐주세요.
        <br />
        중요한 결정은 전문가와 상담하시기 바랍니다.
      </p>
    </div>
  );
}
