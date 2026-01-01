/**
 * 사주 분석 파이프라인 결과 컴포넌트
 * 6단계 분석 결과를 탭으로 구분하여 표시
 * 각 탭에 상세보기 버튼 추가
 */

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { MagnifyingGlass, User, Star, Sparkle, Calendar, Lightbulb, ChartBar, Heart, Briefcase, Coins, FirstAid, Check, Warning, ArrowRight, Palette, Hash, Compass, Sun, Lightning, Lock, LockOpen, Info } from "@phosphor-icons/react";
import type { SajuPipelineResult } from "@/lib/saju/pipeline-types";
import type { SajuResult, Element, TenGod, TenGodSummary, ElementAnalysis } from "@/lib/saju/types";
import { DetailAnalysisModal, getDetailAnalysisFromStorage } from "./DetailAnalysisModal";
import { SajuChatPanel } from "./SajuChatPanel";

/**
 * 파이프라인 결과를 SajuResult 형식으로 변환 (채팅용)
 */
function convertPipelineToSajuResult(result: SajuPipelineResult): SajuResult {
  const { step1, step2, step3 } = result;

  // 오행 문자열을 Element 타입으로 변환
  const elementMap: Record<string, Element> = {
    '목': 'wood', '木': 'wood', 'wood': 'wood',
    '화': 'fire', '火': 'fire', 'fire': 'fire',
    '토': 'earth', '土': 'earth', 'earth': 'earth',
    '금': 'metal', '金': 'metal', 'metal': 'metal',
    '수': 'water', '水': 'water', 'water': 'water',
  };

  // 십성 코드를 TenGod 타입으로 변환
  const tenGodMap: Record<string, TenGod> = {
    '비견': 'bijian', '겁재': 'gebjae',
    '식신': 'siksin', '상관': 'sanggwan',
    '편재': 'pyeonjae', '정재': 'jeongjae',
    '편관': 'pyeongwan', '정관': 'jeonggwan',
    '편인': 'pyeonin', '정인': 'jeongin',
  };

  // 십성 요약 생성
  const tenGodCounts = Object.entries(step3.tenGodsCounts || {}).reduce((acc, [key, value]) => {
    const tenGod = tenGodMap[key];
    if (tenGod) acc[tenGod] = value;
    return acc;
  }, {} as Record<TenGod, number>);

  // 부족한 십성 찾기 (count가 0인 것들)
  const allTenGods: TenGod[] = ['bijian', 'gebjae', 'siksin', 'sanggwan', 'pyeonjae', 'jeongjae', 'pyeongwan', 'jeonggwan', 'pyeonin', 'jeongin'];
  const lackingTenGods = allTenGods.filter(tg => !tenGodCounts[tg] || tenGodCounts[tg] === 0);

  const tenGodSummary: TenGodSummary = {
    dominant: (step3.dominantGods || []).map(g => tenGodMap[g] || 'bijian'),
    lacking: lackingTenGods,
    counts: tenGodCounts,
  };

  // 오행 분석 생성
  const dominant = (step1.dominantElements || []).map(e => elementMap[e] || elementMap[e.toLowerCase()]).filter(Boolean) as Element[];
  const lacking = (step1.lackingElements || []).map(e => elementMap[e] || elementMap[e.toLowerCase()]).filter(Boolean) as Element[];

  const elementAnalysis: ElementAnalysis = {
    dominant,
    lacking,
    scores: step1.elementScores,
    balance: dominant.length > 0 && lacking.length > 0 ? 'unbalanced' : 'balanced',
    yongShin: elementMap[step2.usefulGod?.primaryElement?.toLowerCase()] || 'wood',
  };

  // Pillar 객체 생성 헬퍼
  const createPillar = (pillarData: typeof step1.pillars.year) => ({
    gan: pillarData.stem as any,
    zhi: pillarData.branch as any,
    ganZhi: `${pillarData.stem}${pillarData.branch}`,
    ganElement: elementMap[pillarData.stemElement] || 'wood' as Element,
    ganYinYang: 'yang' as const,
    zhiElement: elementMap[pillarData.branchElement] || 'wood' as Element,
    zhiYinYang: 'yang' as const,
    zhiHiddenGan: [],
    koreanReading: `${pillarData.stemKorean}${pillarData.branchKorean}`,
  });

  return {
    pillars: {
      year: createPillar(step1.pillars.year),
      month: createPillar(step1.pillars.month),
      day: createPillar(step1.pillars.day),
      time: createPillar(step1.pillars.time),
    },
    dayMaster: step2.dayMaster as any,
    dayMasterElement: elementMap[step2.dayMasterElement?.toLowerCase()] || 'wood' as Element,
    dayMasterYinYang: 'yang',
    dayMasterDescription: `${step2.dayMasterKorean} - ${step2.personalityDescription || ''}`,
    elementAnalysis,
    tenGods: {} as any, // 채팅에서는 상세 정보가 필요 없음
    tenGodSummary,
    stars: [], // 채팅에서는 사용하지 않음
    meta: {
      solarDate: '',
      lunarDate: '',
      inputTime: '',
      trueSolarTime: '',
      jieQi: '',
      longitude: 127.5,
      offsetMinutes: 0,
    },
  };
}

interface PipelineResultProps {
  result: SajuPipelineResult;
  gender?: string;
  birthInfo?: {
    year: string;
    month: string;
    day: string;
    hour?: string;
    minute?: string;
    isLunar?: boolean;
  };
  onTabChange?: (tab: TabType) => void;
}

export type TabType = "overview" | "daymaster" | "tengods" | "stars" | "timing" | "advice";

type DetailCategory = "dayMaster" | "tenGods" | "stars" | "fortune" | "career" | "relationship" | "health" | "wealth" | "personality";

// 종합 탭에서 상세보기 순서 정의 (성격 → 직업 → 재물 → 관계 → 건강)
// personality 프롬프트 사용 (dayMaster와 분리)
const OVERVIEW_DETAIL_SEQUENCE: Array<{ category: DetailCategory; title: string }> = [
  { category: "personality", title: "성격운" },
  { category: "career", title: "직업운" },
  { category: "wealth", title: "재물운" },
  { category: "relationship", title: "관계운" },
  { category: "health", title: "건강운" },
];

// 현재 카테고리의 다음 카테고리 반환 (종합 탭 시퀀스용)
function getNextCategoryInSequence(currentCategory: DetailCategory): { category: string; title: string } | undefined {
  const currentIndex = OVERVIEW_DETAIL_SEQUENCE.findIndex(item => item.category === currentCategory);
  if (currentIndex === -1 || currentIndex === OVERVIEW_DETAIL_SEQUENCE.length - 1) {
    return undefined; // 마지막이거나 시퀀스에 없으면 다음 없음
  }
  return OVERVIEW_DETAIL_SEQUENCE[currentIndex + 1];
}

// 탭 순서: 일간 → 십성 → 신살 → 운세 → 종합 → 조언
// 사용자가 개별 분석(일간/십성/신살/운세)을 먼저 본 후 종합을 볼 수 있도록 순서 조정
const TABS: Array<{ id: TabType; label: string; icon: React.ReactNode; tooltip: string }> = [
  { id: "daymaster", label: "일간", icon: <User className="w-4 h-4" weight="fill" />, tooltip: "타고난 기질과 성격의 핵심" },
  { id: "tengods", label: "십성", icon: <Star className="w-4 h-4" weight="fill" />, tooltip: "주변과의 관계와 사회적 역할" },
  { id: "stars", label: "신살", icon: <Sparkle className="w-4 h-4" weight="fill" />, tooltip: "특별한 별의 길흉 영향" },
  { id: "timing", label: "운세", icon: <Calendar className="w-4 h-4" weight="fill" />, tooltip: "대운·세운으로 보는 시간의 흐름" },
  { id: "overview", label: "종합", icon: <ChartBar className="w-4 h-4" weight="fill" />, tooltip: "영역별 종합 점수와 인사이트" },
  { id: "advice", label: "조언", icon: <Lightbulb className="w-4 h-4" weight="fill" />, tooltip: "실천 가능한 맞춤 조언" },
];

// 종합탭 상세보기 잠금 해제를 위한 필수 상세분석 카테고리
// 일간(dayMaster), 십성(tenGods), 신살(stars), 운세(fortune) 상세보기를 모두 완료해야 종합탭 상세보기 가능
const PREREQUISITE_CATEGORIES = ["dayMaster", "tenGods", "stars", "fortune"] as const;

// 상세보기 버튼 컴포넌트
function DetailButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#a855f7] hover:text-white hover:bg-[#a855f7] rounded-lg transition-all border border-[#a855f7]"
    >
      <MagnifyingGlass className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function PipelineResult({ result, gender = "male", birthInfo, onTabChange }: PipelineResultProps) {
  // 기본 탭을 "daymaster"로 설정 (일간부터 시작하여 순차적으로 진행)
  const [activeTab, setActiveTab] = useState<TabType>("daymaster");
  // 타이틀 옆 info 버튼 툴팁 표시 상태 (표시할 탭 ID, null이면 숨김)
  const [showInfoTooltip, setShowInfoTooltip] = useState<TabType | null>(null);
  // 탭 콘텐츠 ref (탭 전환 시 스크롤 위치 조정용)
  const tabContentRef = useRef<HTMLDivElement>(null);
  // 탭별 스크롤 위치 저장 (탭 전환 시 위치 기억)
  const scrollPositionsRef = useRef<Record<TabType, number>>({
    overview: 0, daymaster: 0, tengods: 0,
    stars: 0, timing: 0, advice: 0,
  });

  // 인포 툴팁 표시 함수 (1.5초 후 자동 숨김)
  const handleInfoClick = (tabId: TabType) => {
    setShowInfoTooltip(tabId);
    setTimeout(() => setShowInfoTooltip(null), 1500);
  };

  // 탭 ID로 툴팁 텍스트 가져오기
  const getTooltipText = (tabId: TabType): string => {
    const tab = TABS.find(t => t.id === tabId);
    return tab?.tooltip || "";
  };
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    category: DetailCategory;
    title: string;
    isOverviewSequence: boolean; // 종합 탭에서 순차적으로 열린 경우
  }>({
    isOpen: false,
    category: "dayMaster",
    title: "",
    isOverviewSequence: false,
  });
  const [detailAnalyses, setDetailAnalyses] = useState<Record<string, string>>({});

  // 종합탭 상세보기 잠금 해제 상태 계산
  // 필수 카테고리(일간/십성/신살/운세)를 모두 완료했는지 확인
  const isOverviewDetailUnlocked = useMemo(() => {
    return PREREQUISITE_CATEGORIES.every(cat => detailAnalyses[cat]);
  }, [detailAnalyses]);

  // 완료된 필수 카테고리 개수
  const completedPrerequisiteCount = useMemo(() => {
    return PREREQUISITE_CATEGORIES.filter(cat => detailAnalyses[cat]).length;
  }, [detailAnalyses]);

  // 탭 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  // 상세 분석 데이터 로드 (채팅 컨텍스트에 포함시키기 위해)
  useEffect(() => {
    const loadDetailAnalyses = () => {
      const saved = getDetailAnalysisFromStorage();
      setDetailAnalyses(saved);
    };
    loadDetailAnalyses();
    // 모달이 닫힐 때마다 다시 로드 (새로운 상세 분석이 추가될 수 있음)
  }, [modalState.isOpen]);

  const { step1, step2, step3, step4, step5, step6 } = result;

  // 채팅에서 사용할 SajuResult 형식으로 변환
  const sajuResultForChat = useMemo(() => convertPipelineToSajuResult(result), [result]);

  // 사주 컨텍스트 생성 (AI에게 전달할 요약 정보)
  const sajuContext = `
## 사주 원국 정보
- 년주: ${step1.pillars.year.stem}${step1.pillars.year.branch} (${step1.pillars.year.stemKorean} ${step1.pillars.year.branchKorean})
- 월주: ${step1.pillars.month.stem}${step1.pillars.month.branch} (${step1.pillars.month.stemKorean} ${step1.pillars.month.branchKorean})
- 일주: ${step1.pillars.day.stem}${step1.pillars.day.branch} (${step1.pillars.day.stemKorean} ${step1.pillars.day.branchKorean})
- 시주: ${step1.pillars.time.stem}${step1.pillars.time.branch} (${step1.pillars.time.stemKorean} ${step1.pillars.time.branchKorean})

## 오행 분포
- 목(木): ${step1.elementScores.wood}%
- 화(火): ${step1.elementScores.fire}%
- 토(土): ${step1.elementScores.earth}%
- 금(金): ${step1.elementScores.metal}%
- 수(水): ${step1.elementScores.water}%
- 강한 오행: ${step1.dominantElements.join(", ")}
- 부족한 오행: ${step1.lackingElements.join(", ")}

## 일간 분석
- 일간: ${step2.dayMaster} (${step2.dayMasterKorean})
- 오행: ${step2.dayMasterElement}
- 신강/신약: ${step2.bodyStrength}
- 월령: ${step2.monthlyInfluence}
- 용신: ${step2.usefulGod.primary} (${step2.usefulGod.primaryElement})
- 희신: ${step2.usefulGod.supporting} (${step2.usefulGod.supportingElement})
- 기신: ${step2.usefulGod.avoiding} (${step2.usefulGod.avoidingElement})

## 십성 & 격국
- 격국: ${step3.structure}
- 주요 십성: ${step3.dominantGods.join(", ")}

## 신살
- 길신: ${step4.auspiciousStars.map(s => s.koreanName).join(", ")}
- 흉신: ${step4.inauspiciousStars.map(s => s.koreanName).join(", ")}

## 운세
- 현재 대운: ${step5.currentMajorFortune.period} - ${step5.currentMajorFortune.theme}
- ${step5.yearlyFortune.year}년 운세: ${step5.yearlyFortune.score}점 - ${step5.yearlyFortune.theme}

## 종합
- 종합 점수: ${step6.overallScore}점 (${step6.gradeText})
- 요약: ${step6.summary}

${Object.keys(detailAnalyses).length > 0 ? `
## 상세 분석 결과
${Object.entries(detailAnalyses).map(([category, content]) => {
  const categoryNames: Record<string, string> = {
    dayMaster: "일간 상세",
    tenGods: "십성 상세",
    stars: "신살 상세",
    fortune: "운세 상세",
    career: "직업운 상세",
    relationship: "대인관계 상세",
    health: "건강운 상세",
    wealth: "재물운 상세",
  };
  return `### ${categoryNames[category] || category}
${content.substring(0, 2000)}${content.length > 2000 ? '...(생략)' : ''}`;
}).join('\n\n')}
` : ''}
`.trim();

  const openDetailModal = (category: DetailCategory, title: string, isOverviewSequence = false) => {
    setModalState({ isOpen: true, category, title, isOverviewSequence });
  };

  const closeDetailModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  // 다음 상세보기 열기 (종합 탭 시퀀스용)
  const openNextCategory = () => {
    const nextCategory = getNextCategoryInSequence(modalState.category);
    if (nextCategory) {
      setModalState({
        isOpen: true,
        category: nextCategory.category as DetailCategory,
        title: nextCategory.title,
        isOverviewSequence: true,
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "excellent":
        return "text-[#a855f7] bg-[#a855f7]/20";
      case "good":
        return "text-[#22c55e] bg-[#22c55e]/20";
      case "normal":
        return "text-[#3b82f6] bg-[#3b82f6]/20";
      case "caution":
        return "text-[#f97316] bg-[#f97316]/20";
      case "challenging":
        return "text-[#ef4444] bg-[#ef4444]/20";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  const areaIcons: Record<string, React.ReactNode> = {
    personality: <User className="w-4 h-4" weight="fill" />,
    career: <Briefcase className="w-4 h-4" weight="fill" />,
    wealth: <Coins className="w-4 h-4" weight="fill" />,
    relationship: <Heart className="w-4 h-4" weight="fill" />,
    health: <FirstAid className="w-4 h-4" weight="fill" />,
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* 사용자 정보 표시 */}
        {birthInfo && (
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 mb-4 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#a855f7]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#a855f7]" weight="fill" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-white/40">분석 대상</p>
                  <p className="text-sm sm:text-base font-medium text-white">
                    {birthInfo.year}년 {birthInfo.month}월 {birthInfo.day}일
                    {birthInfo.hour && birthInfo.minute && ` ${birthInfo.hour}시 ${birthInfo.minute}분`}
                    {birthInfo.isLunar && " (음력)"}
                    <span className="hidden sm:inline">{" · "}{gender === "female" ? "여성" : "남성"}</span>
                    <span className="sm:hidden block text-xs text-white/40">{gender === "female" ? "여성" : "남성"}</span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-13 sm:pl-0">
                <p className="text-xs text-white/40">사주 원국</p>
                <p className="text-sm sm:text-base font-bold text-[#a855f7]">
                  {step1.pillars.year.stem}{step1.pillars.year.branch}{" "}
                  {step1.pillars.month.stem}{step1.pillars.month.branch}{" "}
                  {step1.pillars.day.stem}{step1.pillars.day.branch}{" "}
                  {step1.pillars.time.stem}{step1.pillars.time.branch}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 미니 요약 헤더 - 점수와 등급만 표시 */}
        <div className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] rounded-xl p-3 sm:p-4 text-white mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold">{step6.overallScore}</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/70">종합 운세 점수</p>
                <p className="text-base sm:text-lg font-bold">{step6.gradeText}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">{new Date().toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</p>
              <p className="text-xs text-white/60">{new Date().toLocaleDateString("ko-KR", { weekday: "short" })}</p>
            </div>
          </div>
        </div>

        {/* 캐치프레이즈 & 태그 */}
        {step6.catchphrase && (
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-white/10">
            {/* 캐치프레이즈 */}
            <p className="text-center text-base sm:text-lg font-medium text-white/90 italic mb-3">
              &ldquo;{step6.catchphrase}&rdquo;
            </p>
            {/* 태그 */}
            {step6.tags && step6.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {step6.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs sm:text-sm font-medium text-[#a855f7] bg-[#a855f7]/10 rounded-full border border-[#a855f7]/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 탭 네비게이션 - Sticky */}
        <div className="sticky top-[60px] sm:top-[76px] z-40 -mx-4 px-4 py-2.5 sm:py-3 bg-[#1a1033] border-y border-[#a855f7]/30 shadow-lg shadow-black/30">
          <div className="flex gap-1.5 sm:gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  // 현재 탭의 스크롤 위치 저장
                  scrollPositionsRef.current[activeTab] = window.scrollY;

                  setActiveTab(tab.id);

                  // 새 탭의 저장된 위치로 복원 (방문한 적 없으면 상단)
                  setTimeout(() => {
                    const savedPosition = scrollPositionsRef.current[tab.id];
                    if (savedPosition > 0) {
                      window.scrollTo({ top: savedPosition, behavior: 'smooth' });
                    } else {
                      tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 0);
                }}
                className={`flex-1 flex items-center justify-center px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base font-semibold ${
                  activeTab === tab.id
                    ? "bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/40"
                    : "bg-white/5 text-white/60 border border-white/20 hover:bg-white/10 hover:text-white hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 탭과 콘텐츠 사이 간격 */}
        <div className="h-2 sm:h-4" />

        {/* 탭 컨텐츠 */}
        <div ref={tabContentRef} className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/10 scroll-mt-[120px] sm:scroll-mt-[140px]">
          {/* 종합 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              {/* 오늘의 운세 상세 */}
              <div className="bg-gradient-to-br from-[#a855f7]/20 to-[#9333ea]/10 rounded-xl p-4 sm:p-5 border border-[#a855f7]/30">
                <div className="flex items-center gap-2 mb-3 relative">
                  <Sparkle className="w-5 h-5 text-[#a855f7]" weight="fill" />
                  <h3 className="text-base sm:text-lg font-semibold text-white">오늘의 운세</h3>
                  <button
                    onClick={() => handleInfoClick("overview")}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="종합 분석 설명"
                  >
                    <Info className="w-3 h-3 text-white/60" />
                  </button>
                  {showInfoTooltip === "overview" && (
                    <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-[#2a1f4e] rounded-lg text-xs text-white/80 border border-[#a855f7]/30 shadow-lg z-10 whitespace-nowrap animate-fade-in">
                      {getTooltipText("overview")}
                    </div>
                  )}
                  <span className="text-xs text-white/50">{new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}</span>
                </div>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-4">{step6.summary}</p>

                {/* 핵심 메시지 */}
                <div className="bg-white/10 rounded-lg p-3 sm:p-4 mb-4">
                  <p className="text-xs text-white/60 mb-1">✨ 오늘의 핵심 메시지</p>
                  <p className="text-sm sm:text-base font-medium text-white italic">&ldquo;{step6.oneLineMessage}&rdquo;</p>
                </div>

                {/* 행운 요소 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 text-center">
                    <Palette className="w-4 h-4 mx-auto text-[#a855f7] mb-1" />
                    <p className="text-[10px] sm:text-xs text-white/50">행운 색상</p>
                    <p className="text-xs sm:text-sm font-medium text-white">{step6.luckyElements.colors.join(", ")}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 text-center">
                    <Hash className="w-4 h-4 mx-auto text-[#a855f7] mb-1" />
                    <p className="text-[10px] sm:text-xs text-white/50">행운 숫자</p>
                    <p className="text-xs sm:text-sm font-medium text-white">{step6.luckyElements.numbers.join(", ")}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 text-center">
                    <Compass className="w-4 h-4 mx-auto text-[#a855f7] mb-1" />
                    <p className="text-[10px] sm:text-xs text-white/50">행운 방향</p>
                    <p className="text-xs sm:text-sm font-medium text-white">{step6.luckyElements.directions.join(", ")}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 text-center">
                    <Sun className="w-4 h-4 mx-auto text-[#a855f7] mb-1" />
                    <p className="text-[10px] sm:text-xs text-white/50">행운 계절</p>
                    <p className="text-xs sm:text-sm font-medium text-white">{step6.luckyElements.seasons.join(", ")}</p>
                  </div>
                </div>
              </div>

              {/* 영역별 점수 */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">영역별 분석</h3>
                  {/* 잠금 해제 진행 상태 표시 */}
                  {!isOverviewDetailUnlocked && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Lock className="w-4 h-4 text-[#f59e0b]" />
                      <span>일간/십성/신살/운세 상세분석 필요 ({completedPrerequisiteCount}/4)</span>
                    </div>
                  )}
                  {isOverviewDetailUnlocked && (
                    <div className="flex items-center gap-2 text-xs text-[#22c55e]">
                      <LockOpen className="w-4 h-4" />
                      <span>잠금 해제됨</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                  {Object.entries(step6.areas).map(([key, area]) => {
                    // 종합탭 영역별 분석 - personality 전용 프롬프트 사용 (dayMaster와 분리)
                    const areaConfig: Record<string, { name: string; category: DetailCategory }> = {
                      personality: { name: "성격", category: "personality" },
                      career: { name: "직업", category: "career" },
                      wealth: { name: "재물", category: "wealth" },
                      relationship: { name: "관계", category: "relationship" },
                      health: { name: "건강", category: "health" },
                    };
                    const config = areaConfig[key];
                    const isLocked = !isOverviewDetailUnlocked;

                    return (
                      <div
                        key={key}
                        className={`text-center p-2.5 sm:p-4 rounded-lg sm:rounded-xl transition-colors border ${
                          isLocked
                            ? "bg-white/5 border-white/5 cursor-not-allowed opacity-60"
                            : "bg-white/5 border-white/10 cursor-pointer hover:bg-white/10"
                        }`}
                        onClick={() => {
                          if (!isLocked) {
                            openDetailModal(config.category, `${config.name}운`, true);
                          }
                        }}
                      >
                        <div className="flex justify-center mb-2 relative">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isLocked ? "bg-white/10 text-white/40" : "bg-[#a855f7]/20 text-[#a855f7]"
                          }`}>
                            {isLocked ? <Lock className="w-4 h-4" weight="fill" /> : areaIcons[key]}
                          </div>
                        </div>
                        <p className={`text-xl sm:text-3xl font-bold ${
                          isLocked ? "text-white/40" : "text-[#a855f7]"
                        }`}>{isLocked ? "??" : area.score}</p>
                        <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${
                          isLocked ? "text-white/40" : "text-white/60"
                        }`}>
                          {config.name}
                        </p>
                        {isLocked ? (
                          <span className="inline-block mt-1.5 sm:mt-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                            잠금됨
                          </span>
                        ) : (
                          <span className={`inline-block mt-1.5 sm:mt-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getGradeColor(area.grade)}`}>
                            {area.grade === "excellent" ? "매우좋음" :
                             area.grade === "good" ? "좋음" :
                             area.grade === "normal" ? "보통" :
                             area.grade === "caution" ? "주의" : "도전"}
                          </span>
                        )}
                        <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${
                          isLocked ? "text-white/30" : "text-[#a855f7]"
                        }`}>{isLocked ? "🔒 상세보기" : "상세보기"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 핵심 인사이트 */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">핵심 인사이트</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-white/80">
                      <Lightbulb className="w-4 h-4 text-[#a855f7] flex-shrink-0 mt-0.5" weight="fill" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 강점 & 주의점 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-[#22c55e]/10 rounded-lg sm:rounded-xl border border-[#22c55e]/30">
                  <h4 className="font-medium text-sm sm:text-base text-[#22c55e] mb-1.5 sm:mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4" weight="bold" />
                    강점
                  </h4>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {step6.topStrengths.map((s, i) => (
                      <li key={i} className="text-xs sm:text-sm text-[#22c55e]/80">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 sm:p-4 bg-[#f97316]/10 rounded-lg sm:rounded-xl border border-[#f97316]/30">
                  <h4 className="font-medium text-sm sm:text-base text-[#f97316] mb-1.5 sm:mb-2 flex items-center gap-2">
                    <Warning className="w-4 h-4" weight="fill" />
                    주의점
                  </h4>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {step6.areasToWatch.map((s, i) => (
                      <li key={i} className="text-xs sm:text-sm text-[#f97316]/80">• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 일간 탭 */}
          {activeTab === "daymaster" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 relative">
                <h3 className="text-base sm:text-lg font-semibold text-white">일간 분석</h3>
                <button
                  onClick={() => handleInfoClick("daymaster")}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="일간 분석 설명"
                >
                  <Info className="w-3 h-3 text-white/60" />
                </button>
                {showInfoTooltip === "daymaster" && (
                  <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-[#2a1f4e] rounded-lg text-xs text-white/80 border border-[#a855f7]/30 shadow-lg z-10 whitespace-nowrap animate-fade-in">
                    {getTooltipText("daymaster")}
                  </div>
                )}
              </div>

              <div className="text-center p-4 sm:p-6 bg-[#a855f7]/10 rounded-lg sm:rounded-xl border border-[#a855f7]/30">
                <p className="text-3xl sm:text-5xl mb-1 sm:mb-2">{step2.dayMaster}</p>
                <h3 className="text-lg sm:text-xl font-bold text-white">{step2.dayMasterKorean}</h3>
                <p className="text-sm text-white/60 mt-1">{step2.dayMasterElement} 오행</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                  <h4 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2 text-white/60">신강/신약</h4>
                  <p className="text-xl sm:text-2xl font-bold text-[#a855f7]">{step2.bodyStrength}</p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1.5 sm:mt-2">{step2.bodyStrengthReason}</p>
                </div>
                <div className="p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                  <h4 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2 text-white/60">월령</h4>
                  <p className="text-xl sm:text-2xl font-bold text-[#a855f7]">{step2.monthlyInfluence}</p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1.5 sm:mt-2">{step2.monthlyInfluenceReason}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3 text-white">일간 특성</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {step2.characteristics.map((c, i) => (
                    <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#a855f7]/20 text-[#a855f7] rounded-full text-xs sm:text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[#3b82f6]/10 rounded-lg sm:rounded-xl border border-[#3b82f6]/30">
                <h4 className="font-medium text-sm sm:text-base text-[#3b82f6] mb-2 sm:mb-3">용신 체계</h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <p className="text-xs sm:text-sm text-white/60">용신</p>
                    <p className="text-base sm:text-lg font-bold text-[#3b82f6]">{step2.usefulGod.primary}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/60">희신</p>
                    <p className="text-base sm:text-lg font-bold text-[#22c55e]">{step2.usefulGod.supporting}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/60">기신</p>
                    <p className="text-base sm:text-lg font-bold text-[#ef4444]">{step2.usefulGod.avoiding}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-2 sm:mt-3">{step2.usefulGod.reasoning}</p>
              </div>

              {/* 상세 분석 버튼 */}
              <div className="flex justify-center pt-2">
                <DetailButton onClick={() => openDetailModal("dayMaster", "일간")} label="일간 상세 분석 보기" />
              </div>
            </div>
          )}

          {/* 십성 탭 */}
          {activeTab === "tengods" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 relative">
                <h3 className="text-base sm:text-lg font-semibold text-white">십성 분석</h3>
                <button
                  onClick={() => handleInfoClick("tengods")}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="십성 분석 설명"
                >
                  <Info className="w-3 h-3 text-white/60" />
                </button>
                {showInfoTooltip === "tengods" && (
                  <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-[#2a1f4e] rounded-lg text-xs text-white/80 border border-[#a855f7]/30 shadow-lg z-10 whitespace-nowrap animate-fade-in">
                    {getTooltipText("tengods")}
                  </div>
                )}
              </div>

              <div className="text-center p-3 sm:p-4 bg-[#a855f7]/10 rounded-lg sm:rounded-xl border border-[#a855f7]/30">
                <p className="text-xs sm:text-sm text-white/60">격국</p>
                <h3 className="text-xl sm:text-2xl font-bold text-[#a855f7]">{step3.structure}</h3>
                <p className="text-xs sm:text-sm text-white/60 mt-1.5 sm:mt-2">{step3.structureDescription}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3 text-white">주요 십성</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {step3.dominantGods.map((g, i) => (
                    <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#eab308]/20 text-[#eab308] rounded-full text-xs sm:text-sm flex items-center gap-1">
                      <Star className="w-3 h-3" weight="fill" /> {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h4 className="font-medium text-sm sm:text-base text-white">성격 특성</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-white/60">{step3.personality.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                    {step3.personality.traits.map((t, i) => (
                      <span key={i} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-white/10 rounded-full text-white/60">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h4 className="font-medium text-sm sm:text-base text-white">적합 직업</h4>
                    <button
                      onClick={() => openDetailModal("career", "직업운")}
                      className="text-[10px] sm:text-xs text-[#a855f7] hover:underline flex items-center gap-1"
                    >
                      상세보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {step3.careerAptitude.suitableFields.map((f, i) => (
                      <li key={i} className="text-xs sm:text-sm text-white/60">• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[#ec4899]/10 rounded-lg sm:rounded-xl border border-[#ec4899]/30">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <h4 className="font-medium text-sm sm:text-base text-[#ec4899] flex items-center gap-2">
                    <Heart className="w-4 h-4" weight="fill" />
                    연애/관계 스타일
                  </h4>
                  <button
                    onClick={() => openDetailModal("relationship", "대인관계")}
                    className="text-[10px] sm:text-xs text-[#a855f7] hover:underline flex items-center gap-1"
                  >
                    상세보기 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-white/60">{step3.relationshipStyle.loveStyle}</p>
                <p className="text-xs sm:text-sm text-white/60 mt-1.5 sm:mt-2">
                  <strong className="text-white">이상적 파트너:</strong> {step3.relationshipStyle.idealPartnerTraits.join(", ")}
                </p>
              </div>

              {/* 상세 분석 버튼 */}
              <div className="flex justify-center pt-2">
                <DetailButton onClick={() => openDetailModal("tenGods", "십성")} label="십성 상세 분석 보기" />
              </div>
            </div>
          )}

          {/* 신살 탭 */}
          {activeTab === "stars" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 relative">
                <h3 className="text-base sm:text-lg font-semibold text-white">신살 분석</h3>
                <button
                  onClick={() => handleInfoClick("stars")}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="신살 분석 설명"
                >
                  <Info className="w-3 h-3 text-white/60" />
                </button>
                {showInfoTooltip === "stars" && (
                  <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-[#2a1f4e] rounded-lg text-xs text-white/80 border border-[#a855f7]/30 shadow-lg z-10 whitespace-nowrap animate-fade-in">
                    {getTooltipText("stars")}
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-white/60">{step4.overallStarInfluence}</p>

              <div>
                <h4 className="font-medium text-sm sm:text-base text-[#22c55e] mb-2 sm:mb-3 flex items-center gap-2">
                  <Sparkle className="w-4 h-4" weight="fill" />
                  길신 (행운의 별)
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {step4.auspiciousStars.map((star, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-[#22c55e]/10 rounded-lg sm:rounded-xl border border-[#22c55e]/30">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm sm:text-base text-[#22c55e]">{star.koreanName}</h5>
                        <span className="text-[10px] sm:text-xs text-white/60">{star.position}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/60 mt-1">{star.meaning}</p>
                      <p className="text-xs sm:text-sm text-[#22c55e] mt-1.5 sm:mt-2 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" weight="fill" />
                        활용법: {star.howToUse}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm sm:text-base text-[#f97316] mb-2 sm:mb-3 flex items-center gap-2">
                  <Warning className="w-4 h-4" weight="fill" />
                  흉신 (주의할 별)
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {step4.inauspiciousStars.map((star, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-[#f97316]/10 rounded-lg sm:rounded-xl border border-[#f97316]/30">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm sm:text-base text-[#f97316]">{star.koreanName}</h5>
                        <span className="text-[10px] sm:text-xs text-white/60">{star.position}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/60 mt-1">{star.meaning}</p>
                      <p className="text-xs sm:text-sm text-[#ef4444] mt-1.5 sm:mt-2 flex items-start gap-1">
                        <Warning className="w-3 h-3 mt-0.5 flex-shrink-0" weight="fill" />
                        주의: {star.caution}
                      </p>
                      <p className="text-xs sm:text-sm text-[#22c55e] mt-1 flex items-start gap-1">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0" weight="bold" />
                        긍정 활용: {star.positiveUse}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상세 분석 버튼 */}
              <div className="flex justify-center pt-2">
                <DetailButton onClick={() => openDetailModal("stars", "신살")} label="신살 상세 분석 보기" />
              </div>
            </div>
          )}

          {/* 운세 탭 */}
          {activeTab === "timing" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 relative">
                <h3 className="text-base sm:text-lg font-semibold text-white">대운/세운 분석</h3>
                <button
                  onClick={() => handleInfoClick("timing")}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="운세 분석 설명"
                >
                  <Info className="w-3 h-3 text-white/60" />
                </button>
                {showInfoTooltip === "timing" && (
                  <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-[#2a1f4e] rounded-lg text-xs text-white/80 border border-[#a855f7]/30 shadow-lg z-10 whitespace-nowrap animate-fade-in">
                    {getTooltipText("timing")}
                  </div>
                )}
              </div>

              {/* 현재 대운 */}
              <div className="p-3 sm:p-4 bg-[#3b82f6]/10 rounded-lg sm:rounded-xl border border-[#3b82f6]/30">
                <h4 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2 text-white">현재 대운 ({step5.currentMajorFortune.period})</h4>
                <p className="text-xl sm:text-2xl font-bold text-[#a855f7]">{step5.currentMajorFortune.theme}</p>
                <p className="text-xs sm:text-sm text-white/60 mt-1.5 sm:mt-2">{step5.currentMajorFortune.influence}</p>
              </div>

              {/* 올해 세운 */}
              <div className="p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="font-medium text-sm sm:text-base text-white">{step5.yearlyFortune.year}년 운세</h4>
                  <span className="text-xl sm:text-2xl font-bold text-[#a855f7]">{step5.yearlyFortune.score}점</span>
                </div>
                <p className="text-base sm:text-lg font-medium text-white">{step5.yearlyFortune.theme}</p>
                <p className="text-xs sm:text-sm text-white/60 mt-1.5 sm:mt-2">{step5.yearlyFortune.advice}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <div className="p-3 sm:p-4 bg-[#22c55e]/10 rounded-xl border border-[#22c55e]/30">
                    <p className="text-base sm:text-lg font-bold text-[#22c55e] mb-2">✨ 기회</p>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {step5.yearlyFortune.opportunities.map((o, i) => (
                        <li key={i} className="text-sm sm:text-base text-[#22c55e]/90 leading-relaxed">• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 sm:p-4 bg-[#f97316]/10 rounded-xl border border-[#f97316]/30">
                    <p className="text-base sm:text-lg font-bold text-[#f97316] mb-2">⚡ 도전</p>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {step5.yearlyFortune.challenges.map((c, i) => (
                        <li key={i} className="text-sm sm:text-base text-[#f97316]/90 leading-relaxed">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 월별 하이라이트 */}
              <div>
                <h4 className="font-medium text-base sm:text-lg mb-3 sm:mb-4 text-white">월별 운세 포인트</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {step5.monthlyHighlights.map((m) => (
                    <div
                      key={m.month}
                      className={`p-3 sm:p-4 rounded-xl border ${
                        m.rating === "excellent" ? "bg-[#a855f7]/10 border-[#a855f7]/30" :
                        m.rating === "good" ? "bg-[#22c55e]/10 border-[#22c55e]/30" :
                        m.rating === "caution" ? "bg-[#f97316]/10 border-[#f97316]/30" :
                        "bg-white/5 border-white/10"
                      }`}
                    >
                      <p className="font-bold text-lg sm:text-xl text-white mb-1">{m.month}월</p>
                      <p className="text-sm sm:text-base text-white/70 leading-relaxed">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상세 분석 버튼 */}
              <div className="flex justify-center pt-2">
                <DetailButton onClick={() => openDetailModal("fortune", "운세")} label="운세 상세 분석 보기" />
              </div>
            </div>
          )}

          {/* 조언 탭 */}
          {activeTab === "advice" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 relative">
                <h3 className="text-base sm:text-lg font-semibold text-white">맞춤 조언</h3>
                <button
                  onClick={() => handleInfoClick("advice")}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="조언 설명"
                >
                  <Info className="w-3 h-3 text-white/60" />
                </button>
                {showInfoTooltip === "advice" && (
                  <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-[#2a1f4e] rounded-lg text-xs text-white/80 border border-[#a855f7]/30 shadow-lg z-10 whitespace-nowrap animate-fade-in">
                    {getTooltipText("advice")}
                  </div>
                )}
              </div>

              {/* 즉시 실천 */}
              <div className="p-3 sm:p-4 bg-[#a855f7]/10 rounded-lg sm:rounded-xl border border-[#a855f7]/30">
                <h4 className="font-medium text-sm sm:text-base text-[#a855f7] mb-2 sm:mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" weight="bold" />
                  즉시 실천
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.advice.immediate.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/80">
                      <ArrowRight className="w-3 h-3 text-[#a855f7] flex-shrink-0 mt-0.5" weight="bold" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 단기 조언 */}
              <div className="p-3 sm:p-4 bg-[#3b82f6]/10 rounded-lg sm:rounded-xl border border-[#3b82f6]/30">
                <h4 className="font-medium text-sm sm:text-base text-[#3b82f6] mb-2 sm:mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" weight="fill" />
                  1-3개월 내
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.advice.shortTerm.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/80">
                      <ArrowRight className="w-3 h-3 text-[#3b82f6] flex-shrink-0 mt-0.5" weight="bold" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 장기 조언 */}
              <div className="p-3 sm:p-4 bg-[#22c55e]/10 rounded-lg sm:rounded-xl border border-[#22c55e]/30">
                <h4 className="font-medium text-sm sm:text-base text-[#22c55e] mb-2 sm:mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4" weight="fill" />
                  장기 발전
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.advice.longTerm.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/80">
                      <ArrowRight className="w-3 h-3 text-[#22c55e] flex-shrink-0 mt-0.5" weight="bold" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 행운 요소 */}
              <div className="p-3 sm:p-4 bg-[#eab308]/10 rounded-lg sm:rounded-xl border border-[#eab308]/30">
                <h4 className="font-medium text-sm sm:text-base text-[#eab308] mb-2 sm:mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" weight="fill" />
                  행운의 요소
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/60 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> 색상
                    </p>
                    <p className="font-medium text-xs sm:text-sm text-white">{step6.luckyElements.colors.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/60 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> 숫자
                    </p>
                    <p className="font-medium text-xs sm:text-sm text-white">{step6.luckyElements.numbers.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/60 flex items-center gap-1">
                      <Compass className="w-3 h-3" /> 방향
                    </p>
                    <p className="font-medium text-xs sm:text-sm text-white">{step6.luckyElements.directions.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/60 flex items-center gap-1">
                      <Sun className="w-3 h-3" /> 계절
                    </p>
                    <p className="font-medium text-xs sm:text-sm text-white">{step6.luckyElements.seasons.join(", ")}</p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <p className="text-[10px] sm:text-xs text-white/60 flex items-center gap-1">
                    <Lightning className="w-3 h-3" /> 추천 활동
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                    {step6.luckyElements.activities.map((a, i) => (
                      <span key={i} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/10 rounded-full text-xs sm:text-sm text-white/80">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상세 분석 모달 */}
      <DetailAnalysisModal
        isOpen={modalState.isOpen}
        onClose={closeDetailModal}
        category={modalState.category}
        categoryTitle={modalState.title}
        sajuContext={sajuContext}
        gender={gender}
        sajuResult={sajuResultForChat}
        birthYear={birthInfo?.year ? parseInt(birthInfo.year) : undefined}
        nextCategory={modalState.isOverviewSequence ? getNextCategoryInSequence(modalState.category) : undefined}
        onNextCategory={modalState.isOverviewSequence ? openNextCategory : undefined}
      />

      {/* AI 채팅 패널 - Google Grounding 활성화 */}
      <SajuChatPanel
        sajuContext={sajuContext}
        sajuResult={sajuResultForChat}
        gender={gender}
      />
    </>
  );
}
