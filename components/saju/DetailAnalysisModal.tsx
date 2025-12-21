"use client";

import { useState, useEffect } from "react";
import { X, Sparkle, Warning } from "@phosphor-icons/react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

// localStorage 키
const DETAIL_STORAGE_KEY = "saju_detail_analysis";

// 상세 분석 저장/로드 유틸리티 (외부에서 호출 가능)
export function getDetailAnalysisFromStorage(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (!saved) return {};
    return JSON.parse(saved) as Record<string, string>;
  } catch {
    return {};
  }
}

function getDetailFromStorage(category: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (!saved) return null;
    const data: Record<string, string> = JSON.parse(saved);
    return data[category] || null;
  } catch {
    return null;
  }
}

function saveDetailToStorage(category: string, content: string): void {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(DETAIL_STORAGE_KEY);
    const data: Record<string, string> = saved ? JSON.parse(saved) : {};
    data[category] = content;
    localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 저장 실패 무시
  }
}

// 상세 분석 데이터 전체 삭제 (외부에서 호출 가능)
export function clearDetailAnalysisStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DETAIL_STORAGE_KEY);
  } catch {
    // 삭제 실패 무시
  }
}

interface DetailAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  categoryTitle: string;
  sajuContext: string;
  gender: string;
}

export function DetailAnalysisModal({
  isOpen,
  onClose,
  category,
  categoryTitle,
  sajuContext,
  gender,
}: DetailAnalysisModalProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchDetailAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/saju/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, sajuContext, gender }),
      });

      if (!response.ok) {
        throw new Error("상세 분석을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setContent(data.content);
      // localStorage에 저장
      saveDetailToStorage(category, data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때 localStorage 확인 후 데이터 불러오기
  useEffect(() => {
    if (isOpen && !initialized) {
      setInitialized(true);
      // localStorage에서 먼저 확인
      const savedContent = getDetailFromStorage(category);
      if (savedContent) {
        setContent(savedContent);
      } else {
        fetchDetailAnalysis();
      }
    }
  }, [isOpen, initialized, category]);

  // 카테고리 변경 시 초기화
  useEffect(() => {
    setInitialized(false);
    setContent("");
    setError(null);
  }, [category]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#1a1033] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#a855f7]">
          <div className="flex items-center gap-3">
            <Sparkle className="w-6 h-6 text-white" weight="fill" />
            <h2 className="text-xl font-bold text-white">{categoryTitle} 상세 분석</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#a855f7] flex items-center justify-center animate-pulse">
                <Sparkle className="w-8 h-8 text-white" weight="fill" />
              </div>
              <p className="text-white/60">
                상세 분석을 생성하고 있습니다...
              </p>
              <p className="text-sm text-white/40">
                잠시만 기다려주세요
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
                <Warning className="w-8 h-8 text-[#ef4444]" weight="fill" />
              </div>
              <p className="text-white/60">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchDetailAnalysis();
                }}
                className="px-4 py-2 rounded-lg bg-[#a855f7] text-white font-medium hover:bg-[#9333ea] transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {content && (
            <MarkdownRenderer content={content} variant="default" />
          )}
        </div>
      </div>
    </div>
  );
}
