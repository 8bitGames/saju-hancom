"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sparkle, Warning, User, Briefcase, Coins, Heart, FirstAid, Star, Calendar, ArrowRight } from "@phosphor-icons/react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { saveDetailAnalysis, getDetailAnalysis, checkAuthStatus } from "@/lib/actions/saju";

// 카테고리별 로딩 설정
const CATEGORY_LOADING_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  messages: string[];
}> = {
  dayMaster: {
    icon: <User className="w-8 h-8 text-white" weight="fill" />,
    color: "#a855f7",
    bgColor: "bg-[#a855f7]",
    messages: [
      "당신의 타고난 기질을 분석하고 있습니다...",
      "일간의 특성을 살펴보는 중...",
      "성격의 깊은 면을 탐색하고 있습니다..."
    ]
  },
  career: {
    icon: <Briefcase className="w-8 h-8 text-white" weight="fill" />,
    color: "#3b82f6",
    bgColor: "bg-[#3b82f6]",
    messages: [
      "적성과 재능을 분석하고 있습니다...",
      "직업 운세를 살펴보는 중...",
      "커리어 방향을 탐색하고 있습니다..."
    ]
  },
  wealth: {
    icon: <Coins className="w-8 h-8 text-white" weight="fill" />,
    color: "#eab308",
    bgColor: "bg-[#eab308]",
    messages: [
      "재물운의 흐름을 분석하고 있습니다...",
      "금전 운세를 살펴보는 중...",
      "부를 쌓는 방법을 탐색하고 있습니다..."
    ]
  },
  relationship: {
    icon: <Heart className="w-8 h-8 text-white" weight="fill" />,
    color: "#ec4899",
    bgColor: "bg-[#ec4899]",
    messages: [
      "인연의 흐름을 분석하고 있습니다...",
      "대인관계 운세를 살펴보는 중...",
      "소중한 관계를 탐색하고 있습니다..."
    ]
  },
  health: {
    icon: <FirstAid className="w-8 h-8 text-white" weight="fill" />,
    color: "#22c55e",
    bgColor: "bg-[#22c55e]",
    messages: [
      "건강 운세를 분석하고 있습니다...",
      "체질과 기운을 살펴보는 중...",
      "건강 관리법을 탐색하고 있습니다..."
    ]
  },
  tenGods: {
    icon: <Star className="w-8 h-8 text-white" weight="fill" />,
    color: "#f97316",
    bgColor: "bg-[#f97316]",
    messages: [
      "십성의 배치를 분석하고 있습니다...",
      "운명의 별들을 살펴보는 중...",
      "십성이 주는 의미를 탐색하고 있습니다..."
    ]
  },
  stars: {
    icon: <Sparkle className="w-8 h-8 text-white" weight="fill" />,
    color: "#8b5cf6",
    bgColor: "bg-[#8b5cf6]",
    messages: [
      "신살의 기운을 분석하고 있습니다...",
      "길신과 흉신을 살펴보는 중...",
      "특별한 별의 영향을 탐색하고 있습니다..."
    ]
  },
  fortune: {
    icon: <Calendar className="w-8 h-8 text-white" weight="fill" />,
    color: "#06b6d4",
    bgColor: "bg-[#06b6d4]",
    messages: [
      "운세의 흐름을 분석하고 있습니다...",
      "대운과 세운을 살펴보는 중...",
      "시간의 기운을 탐색하고 있습니다..."
    ]
  },
  majorYearly: {
    icon: <Calendar className="w-8 h-8 text-white" weight="fill" />,
    color: "#6366f1",
    bgColor: "bg-[#6366f1]",
    messages: [
      "대운의 큰 흐름을 분석하고 있습니다...",
      "세운과 원국의 관계를 살펴보는 중...",
      "향후 5년 전망을 탐색하고 있습니다..."
    ]
  },
  monthlyFortune: {
    icon: <Calendar className="w-8 h-8 text-white" weight="fill" />,
    color: "#14b8a6",
    bgColor: "bg-[#14b8a6]",
    messages: [
      "월별 운세를 분석하고 있습니다...",
      "12개월의 흐름을 살펴보는 중...",
      "월운의 기회와 주의점을 탐색하고 있습니다..."
    ]
  },
  // 대운 전용 상세 분석
  majorFortune: {
    icon: <Calendar className="w-8 h-8 text-white" weight="fill" />,
    color: "#6366f1",
    bgColor: "bg-[#6366f1]",
    messages: [
      "대운의 큰 흐름을 분석하고 있습니다...",
      "10년 단위 운세를 살펴보는 중...",
      "인생의 큰 파도를 탐색하고 있습니다..."
    ]
  },
  // 세운 전용 상세 분석
  yearlyFortune: {
    icon: <Calendar className="w-8 h-8 text-white" weight="fill" />,
    color: "#0ea5e9",
    bgColor: "bg-[#0ea5e9]",
    messages: [
      "세운의 흐름을 분석하고 있습니다...",
      "년도별 운세를 살펴보는 중...",
      "향후 5년 전망을 탐색하고 있습니다..."
    ]
  },
  // 종합탭 성격 분석 전용 (dayMaster와 분리)
  personality: {
    icon: <User className="w-8 h-8 text-white" weight="fill" />,
    color: "#a855f7",
    bgColor: "bg-[#a855f7]",
    messages: [
      "성격과 기질을 깊이 분석하고 있습니다...",
      "일간과 십성의 조합을 살펴보는 중...",
      "내면의 성격 발현을 탐색하고 있습니다..."
    ]
  }
};

// localStorage 키
const DETAIL_STORAGE_KEY = "saju_detail_analysis";

// 사주 컨텍스트에서 고유 식별자 생성 (생년월일+성별 기반)
function generateSajuFingerprint(sajuContext: string, gender: string): string {
  // 간단한 해시 생성: sajuContext의 첫 200자 + gender
  const contextPart = sajuContext.slice(0, 200);
  let hash = 0;
  const str = contextPart + gender;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// 캐시 데이터 구조
interface DetailCacheData {
  fingerprint: string;
  analyses: Record<string, string>;
}

// 상세 분석 저장/로드 유틸리티 (외부에서 호출 가능)
export function getDetailAnalysisFromStorage(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (!saved) return {};
    const cacheData = JSON.parse(saved) as DetailCacheData;
    return cacheData.analyses || {};
  } catch {
    return {};
  }
}

function getDetailFromStorage(category: string, fingerprint: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (!saved) return null;
    const cacheData = JSON.parse(saved) as DetailCacheData;
    // 지문이 다르면 다른 사람이므로 캐시 무효화
    if (cacheData.fingerprint !== fingerprint) {
      return null;
    }
    return cacheData.analyses?.[category] || null;
  } catch {
    return null;
  }
}

function saveDetailToStorage(category: string, content: string, fingerprint: string): void {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(DETAIL_STORAGE_KEY);
    let cacheData: DetailCacheData = { fingerprint, analyses: {} };

    if (saved) {
      const existing = JSON.parse(saved) as DetailCacheData;
      // 지문이 같으면 기존 데이터 유지, 다르면 새로 시작
      if (existing.fingerprint === fingerprint) {
        cacheData = existing;
      }
    }

    cacheData.fingerprint = fingerprint;
    cacheData.analyses[category] = content;
    localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(cacheData));
  } catch {
    // 저장 실패 무시
  }
}

// 카테고리별 로딩 애니메이션 컴포넌트
function CategoryLoadingAnimation({ category, messageIndex }: { category: string; messageIndex: number }) {
  const config = CATEGORY_LOADING_CONFIG[category] || CATEGORY_LOADING_CONFIG.dayMaster;

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* 애니메이션 아이콘 */}
      <div className="relative">
        {/* 회전하는 외부 링 */}
        <div
          className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: config.color,
            borderRightColor: `${config.color}40`,
            animationDuration: '1.5s'
          }}
        />
        {/* 역방향 회전 링 */}
        <div
          className="absolute inset-2 w-20 h-20 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderBottomColor: config.color,
            borderLeftColor: `${config.color}40`,
            animationDuration: '2s',
            animationDirection: 'reverse'
          }}
        />
        {/* 중앙 아이콘 */}
        <div
          className={`w-24 h-24 rounded-full ${config.bgColor} flex items-center justify-center animate-pulse`}
          style={{ animationDuration: '1.5s' }}
        >
          {config.icon}
        </div>
      </div>

      {/* 메시지 */}
      <div className="text-center space-y-2">
        <p
          className="text-base font-medium transition-all duration-500"
          style={{ color: config.color }}
        >
          {config.messages[messageIndex]}
        </p>
        <p className="text-sm text-gray-400">
          잠시만 기다려주세요
        </p>
      </div>

      {/* 프로그레스 도트 */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: config.color,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
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
  sajuResult?: unknown;  // Cold Reading을 위한 사주 결과 데이터
  birthYear?: number;    // Cold Reading을 위한 출생년도
  // 다음 상세보기 연결을 위한 props
  nextCategory?: {
    category: string;
    title: string;
  };
  onNextCategory?: () => void;
}

export function DetailAnalysisModal({
  isOpen,
  onClose,
  category,
  categoryTitle,
  sajuContext,
  gender,
  sajuResult,
  birthYear,
  nextCategory,
  onNextCategory,
}: DetailAnalysisModalProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 인증 상태 확인
  useEffect(() => {
    checkAuthStatus().then((result) => {
      setIsAuthenticated(result.isAuthenticated);
    });
  }, []);

  // 로딩 중 메시지 순환
  useEffect(() => {
    if (!isLoading) return;

    const config = CATEGORY_LOADING_CONFIG[category];
    if (!config) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % config.messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading, category]);

  const fetchDetailAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setContent(""); // 스트리밍 시작 전 초기화

    try {
      const response = await fetch("/api/saju/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          sajuContext,
          gender,
          sajuResult,   // Cold Reading을 위한 사주 결과 데이터
          birthYear,    // Cold Reading을 위한 출생년도
        }),
      });

      if (!response.ok) {
        throw new Error("상세 분석을 불러오는데 실패했습니다.");
      }

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("스트리밍을 지원하지 않습니다.");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 이벤트 파싱
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // 마지막 불완전한 청크는 버퍼에 유지

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text") {
                // 텍스트 청크 - 실시간으로 content에 추가
                fullContent += data.content;
                setContent(fullContent);
                setIsLoading(false); // 첫 청크가 오면 로딩 상태 해제
              } else if (data.type === "done") {
                // 완료 - 저장
                const fingerprint = generateSajuFingerprint(sajuContext, gender);
                // localStorage에 저장
                saveDetailToStorage(category, data.fullContent, fingerprint);
                // DB에도 저장 (로그인 시)
                if (isAuthenticated) {
                  saveDetailAnalysis({
                    fingerprint,
                    category,
                    content: data.fullContent,
                  }).catch(console.error);
                }
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch {
              // JSON 파싱 실패 무시
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때 DB/localStorage 확인 후 데이터 불러오기
  useEffect(() => {
    if (isOpen && !initialized) {
      setInitialized(true);
      const fingerprint = generateSajuFingerprint(sajuContext, gender);

      const loadContent = async () => {
        // 1. 로그인 시 DB에서 먼저 확인
        if (isAuthenticated) {
          try {
            const dbResult = await getDetailAnalysis({ fingerprint, category });
            if (dbResult.success && dbResult.content) {
              setContent(dbResult.content);
              // localStorage에도 동기화
              saveDetailToStorage(category, dbResult.content, fingerprint);
              return;
            }
          } catch (e) {
            console.error('[DetailAnalysisModal] DB load error:', e);
          }
        }

        // 2. localStorage에서 확인
        const savedContent = getDetailFromStorage(category, fingerprint);
        if (savedContent) {
          setContent(savedContent);
          // 로그인 시 DB에도 동기화
          if (isAuthenticated) {
            saveDetailAnalysis({
              fingerprint,
              category,
              content: savedContent,
            }).catch(console.error);
          }
          return;
        }

        // 3. 둘 다 없으면 API 호출
        fetchDetailAnalysis();
      };

      loadContent();
    }
  }, [isOpen, initialized, category, sajuContext, gender, isAuthenticated]);

  // 카테고리 변경 시 초기화
  useEffect(() => {
    setInitialized(false);
    setContent("");
    setError(null);
  }, [category]);

  // 스트리밍 시작 시에만 스크롤 상단으로 (스트리밍 중에는 리셋하지 않음)
  const hasResetScroll = useRef(false);

  useEffect(() => {
    // 카테고리가 변경되면 스크롤 리셋 플래그 초기화
    hasResetScroll.current = false;
  }, [category]);

  useEffect(() => {
    // 콘텐츠가 처음 도착했을 때만 스크롤을 상단으로 (이후 스트리밍 중에는 리셋 안함)
    if (content && contentRef.current && !hasResetScroll.current) {
      contentRef.current.scrollTop = 0;
      hasResetScroll.current = true;
    }
  }, [content]);

  // 모달이 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        // 스크롤 복원
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex flex-col"
      style={{ touchAction: 'none', height: '100%', minHeight: '-webkit-fill-available' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - 모바일 전체화면, 데스크톱 중앙 정렬 */}
      <div className="relative flex flex-col w-full flex-1 min-h-0 md:flex-initial md:h-auto md:max-h-[85vh] md:max-w-2xl md:m-auto md:rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header - 항상 상단 고정 */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] z-20">
          <div className="flex items-center gap-2 md:gap-3">
            <Sparkle className="w-5 h-5 md:w-6 md:h-6 text-white" weight="fill" />
            <h2 className="text-base md:text-xl font-bold text-white">{categoryTitle} 상세 분석</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors active:bg-white/30"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content - 스크롤 가능한 영역 */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isLoading && (
            <CategoryLoadingAnimation category={category} messageIndex={messageIndex} />
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Warning className="w-8 h-8 text-red-500" weight="fill" />
              </div>
              <p className="text-gray-500">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchDetailAnalysis();
                }}
                className="px-4 py-2 rounded-lg bg-[#C4A35A] text-white font-medium hover:bg-[#a88f4a] transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {content && (
            <MarkdownRenderer content={content} variant="default" />
          )}

          {/* 하단 여백 - 푸터 영역 확보 */}
          <div className="h-4" />
        </div>

        {/* Footer - 닫기 + 다음 상세보기 버튼 */}
        {(content || error) && !isLoading && (
          <div className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
              {nextCategory && onNextCategory && (
                <button
                  onClick={onNextCategory}
                  className="flex-1 py-3 rounded-xl bg-[#C4A35A] text-white font-medium hover:bg-[#a88f4a] transition-colors flex items-center justify-center gap-2"
                >
                  <span>{nextCategory.title} 상세보기</span>
                  <ArrowRight className="w-5 h-5" weight="bold" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
