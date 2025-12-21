/**
 * 사주 분석 파이프라인 결과 컴포넌트
 * 6단계 분석 결과를 탭으로 구분하여 표시
 * 각 탭에 상세보기 버튼 추가
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MagnifyingGlass, User, Star, Sparkle, Calendar, Lightbulb, ChartBar, Heart, Briefcase, Coins, FirstAid, Check, Warning, ArrowRight, Palette, Hash, Compass, Sun, Lightning } from "@phosphor-icons/react";
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
}

type TabType = "overview" | "daymaster" | "tengods" | "stars" | "timing" | "advice";

type DetailCategory = "dayMaster" | "tenGods" | "stars" | "fortune" | "career" | "relationship" | "health" | "wealth";

const TABS: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "종합", icon: <ChartBar className="w-4 h-4" weight="fill" /> },
  { id: "daymaster", label: "일간", icon: <User className="w-4 h-4" weight="fill" /> },
  { id: "tengods", label: "십성", icon: <Star className="w-4 h-4" weight="fill" /> },
  { id: "stars", label: "신살", icon: <Sparkle className="w-4 h-4" weight="fill" /> },
  { id: "timing", label: "운세", icon: <Calendar className="w-4 h-4" weight="fill" /> },
  { id: "advice", label: "조언", icon: <Lightbulb className="w-4 h-4" weight="fill" /> },
];

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

export default function PipelineResult({ result, gender = "male", birthInfo }: PipelineResultProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    category: DetailCategory;
    title: string;
  }>({
    isOpen: false,
    category: "dayMaster",
    title: "",
  });
  const [detailAnalyses, setDetailAnalyses] = useState<Record<string, string>>({});

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

  const openDetailModal = (category: DetailCategory, title: string) => {
    setModalState({ isOpen: true, category, title });
  };

  const closeDetailModal = () => {
    setModalState({ ...modalState, isOpen: false });
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

        {/* 헤더 - 오늘의 운세 */}
        <div className="bg-[#a855f7] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                <Sparkle className="w-4 h-4" weight="fill" />
                <span>오늘의 운세</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold mt-1">{new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}</h2>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Star className="w-6 h-6 sm:w-8 sm:h-8" weight="fill" />
            </div>
          </div>

          {/* 오늘의 운세 요약 */}
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="text-2xl sm:text-3xl font-bold">{step6.overallScore}점</span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-white/20">
                {step6.gradeText}
              </span>
            </div>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">{step6.summary}</p>
          </div>

          {/* 오늘의 핵심 메시지 */}
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm mb-1 sm:mb-2">
              <Sparkle className="w-4 h-4" weight="fill" />
              <span>오늘의 핵심 메시지</span>
            </div>
            <p className="text-sm sm:text-lg font-medium italic">&ldquo;{step6.oneLineMessage}&rdquo;</p>
          </div>

          {/* 오늘의 행운 요소 미리보기 */}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
              <Palette className="w-3 h-3" />
              <span>{step6.luckyElements.colors[0]}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
              <Hash className="w-3 h-3" />
              <span>{step6.luckyElements.numbers[0]}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
              <Compass className="w-3 h-3" />
              <span>{step6.luckyElements.directions[0]}</span>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex overflow-x-auto gap-1.5 sm:gap-2 mb-4 sm:mb-6 pb-2 -mx-2 px-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap transition-all text-xs sm:text-base ${
                activeTab === tab.id
                  ? "bg-[#a855f7] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/10">
          {/* 종합 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              {/* 영역별 점수 */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">영역별 분석</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                  {Object.entries(step6.areas).map(([key, area]) => {
                    const areaConfig: Record<string, { name: string; category: DetailCategory }> = {
                      personality: { name: "성격", category: "dayMaster" },
                      career: { name: "직업", category: "career" },
                      wealth: { name: "재물", category: "wealth" },
                      relationship: { name: "관계", category: "relationship" },
                      health: { name: "건강", category: "health" },
                    };
                    const config = areaConfig[key];

                    return (
                      <div
                        key={key}
                        className="text-center p-2.5 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/10"
                        onClick={() => openDetailModal(config.category, `${config.name}운`)}
                      >
                        <div className="flex justify-center mb-2">
                          <div className="w-8 h-8 rounded-lg bg-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                            {areaIcons[key]}
                          </div>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold text-[#a855f7]">{area.score}</p>
                        <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1">
                          {config.name}
                        </p>
                        <span className={`inline-block mt-1.5 sm:mt-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getGradeColor(area.grade)}`}>
                          {area.grade === "excellent" ? "매우좋음" :
                           area.grade === "good" ? "좋음" :
                           area.grade === "normal" ? "보통" :
                           area.grade === "caution" ? "주의" : "도전"}
                        </span>
                        <p className="text-[10px] sm:text-xs text-[#a855f7] mt-1.5 sm:mt-2">상세보기</p>
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
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-white">일간 분석</h3>
                <DetailButton onClick={() => openDetailModal("dayMaster", "일간")} label="상세 분석" />
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
            </div>
          )}

          {/* 십성 탭 */}
          {activeTab === "tengods" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-white">십성 분석</h3>
                <DetailButton onClick={() => openDetailModal("tenGods", "십성")} label="상세 분석" />
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
            </div>
          )}

          {/* 신살 탭 */}
          {activeTab === "stars" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-white">신살 분석</h3>
                <DetailButton onClick={() => openDetailModal("stars", "신살")} label="상세 분석" />
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
            </div>
          )}

          {/* 운세 탭 */}
          {activeTab === "timing" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-white">대운/세운 분석</h3>
                <DetailButton onClick={() => openDetailModal("fortune", "운세")} label="상세 분석" />
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

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
                  <div className="p-2 sm:p-3 bg-[#22c55e]/10 rounded-lg border border-[#22c55e]/30">
                    <p className="text-xs sm:text-sm font-medium text-[#22c55e]">기회</p>
                    <ul className="mt-1 space-y-0.5 sm:space-y-1">
                      {step5.yearlyFortune.opportunities.map((o, i) => (
                        <li key={i} className="text-[10px] sm:text-xs text-[#22c55e]/80">• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2 sm:p-3 bg-[#f97316]/10 rounded-lg border border-[#f97316]/30">
                    <p className="text-xs sm:text-sm font-medium text-[#f97316]">도전</p>
                    <ul className="mt-1 space-y-0.5 sm:space-y-1">
                      {step5.yearlyFortune.challenges.map((c, i) => (
                        <li key={i} className="text-[10px] sm:text-xs text-[#f97316]/80">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 월별 하이라이트 */}
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3 text-white">월별 운세 포인트</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                  {step5.monthlyHighlights.map((m) => (
                    <div
                      key={m.month}
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border ${
                        m.rating === "excellent" ? "bg-[#a855f7]/10 border-[#a855f7]/30" :
                        m.rating === "good" ? "bg-[#22c55e]/10 border-[#22c55e]/30" :
                        m.rating === "caution" ? "bg-[#f97316]/10 border-[#f97316]/30" :
                        "bg-white/5 border-white/10"
                      }`}
                    >
                      <p className="font-bold text-sm sm:text-base text-white">{m.month}월</p>
                      <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1 line-clamp-2">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 조언 탭 */}
          {activeTab === "advice" && (
            <div className="space-y-4 sm:space-y-6">
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
