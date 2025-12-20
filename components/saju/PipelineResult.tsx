/**
 * 사주 분석 파이프라인 결과 컴포넌트
 * 6단계 분석 결과를 탭으로 구분하여 표시
 * 각 탭에 상세보기 버튼 추가
 */

"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlass } from "@/components/ui/icons";
import type { SajuPipelineResult } from "@/lib/saju/pipeline-types";
import { DetailAnalysisModal, getDetailAnalysisFromStorage } from "./DetailAnalysisModal";
import { SajuChatPanel } from "./SajuChatPanel";

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

const TABS: Array<{ id: TabType; label: string; icon: string }> = [
  { id: "overview", label: "종합", icon: "🎯" },
  { id: "daymaster", label: "일간", icon: "☯️" },
  { id: "tengods", label: "십성", icon: "⭐" },
  { id: "stars", label: "신살", icon: "🌟" },
  { id: "timing", label: "운세", icon: "📅" },
  { id: "advice", label: "조언", icon: "💡" },
];

// 상세보기 버튼 컴포넌트
function DetailButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--accent)] hover:text-white hover:bg-[var(--accent)] rounded-lg transition-all border border-[var(--accent)]"
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
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/50";
      case "good":
        return "text-green-600 bg-green-100 dark:bg-green-900/50";
      case "normal":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/50";
      case "caution":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50";
      case "challenging":
        return "text-red-600 bg-red-100 dark:bg-red-900/50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* 사용자 정보 표시 */}
        {birthInfo && (
          <div className="bg-[var(--background-elevated)] rounded-xl p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">{gender === "female" ? "👩" : "👨"}</span>
                <div>
                  <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">분석 대상</p>
                  <p className="text-sm sm:text-base font-medium text-[var(--text-primary)]">
                    {birthInfo.year}년 {birthInfo.month}월 {birthInfo.day}일
                    {birthInfo.hour && birthInfo.minute && ` ${birthInfo.hour}시 ${birthInfo.minute}분`}
                    {birthInfo.isLunar && " (음력)"}
                    <span className="hidden sm:inline">{" · "}{gender === "female" ? "여성" : "남성"}</span>
                    <span className="sm:hidden block text-xs text-[var(--text-tertiary)]">{gender === "female" ? "여성" : "남성"}</span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-9 sm:pl-0">
                <p className="text-xs text-[var(--text-tertiary)]">사주 원국</p>
                <p className="text-sm sm:text-base font-bold text-[var(--accent)]">
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white mb-4 sm:mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm">✨ 오늘의 운세</p>
              <h2 className="text-lg sm:text-2xl font-bold mt-1">{new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}</h2>
            </div>
            <div className="text-3xl sm:text-5xl">🌟</div>
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
            <p className="text-xs sm:text-sm text-purple-200 mb-1 sm:mb-2">💫 오늘의 핵심 메시지</p>
            <p className="text-sm sm:text-lg font-medium italic">&ldquo;{step6.oneLineMessage}&rdquo;</p>
          </div>

          {/* 오늘의 행운 요소 미리보기 */}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
              <span>🎨</span>
              <span>{step6.luckyElements.colors[0]}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
              <span>🔢</span>
              <span>{step6.luckyElements.numbers[0]}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
              <span>🧭</span>
              <span>{step6.luckyElements.directions[0]}</span>
            </div>
            {step6.advice.immediate[0] && (
              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                <span>💡</span>
                <span className="truncate max-w-[150px]">{step6.advice.immediate[0].substring(0, 20)}...</span>
              </div>
            )}
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
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-sm sm:text-base">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
          {/* 종합 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              {/* 영역별 점수 */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">영역별 분석</h3>
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
                        className="text-center p-2.5 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => openDetailModal(config.category, `${config.name}운`)}
                      >
                        <p className="text-xl sm:text-3xl font-bold text-purple-600">{area.score}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                          {config.name}
                        </p>
                        <span className={`inline-block mt-1.5 sm:mt-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getGradeColor(area.grade)}`}>
                          {area.grade === "excellent" ? "매우좋음" :
                           area.grade === "good" ? "좋음" :
                           area.grade === "normal" ? "보통" :
                           area.grade === "caution" ? "주의" : "도전"}
                        </span>
                        <p className="text-[10px] sm:text-xs text-[var(--accent)] mt-1.5 sm:mt-2">상세보기</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 핵심 인사이트 */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">핵심 인사이트</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      <span className="text-purple-500 flex-shrink-0">💡</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 강점 & 주의점 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl">
                  <h4 className="font-medium text-sm sm:text-base text-green-700 dark:text-green-400 mb-1.5 sm:mb-2">💪 강점</h4>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {step6.topStrengths.map((s, i) => (
                      <li key={i} className="text-xs sm:text-sm text-green-600 dark:text-green-300">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl">
                  <h4 className="font-medium text-sm sm:text-base text-amber-700 dark:text-amber-400 mb-1.5 sm:mb-2">⚠️ 주의점</h4>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {step6.areasToWatch.map((s, i) => (
                      <li key={i} className="text-xs sm:text-sm text-amber-600 dark:text-amber-300">• {s}</li>
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">일간 분석</h3>
                <DetailButton onClick={() => openDetailModal("dayMaster", "일간")} label="상세 분석" />
              </div>

              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg sm:rounded-xl">
                <p className="text-3xl sm:text-5xl mb-1 sm:mb-2">{step2.dayMaster}</p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{step2.dayMasterKorean}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{step2.dayMasterElement} 오행</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                  <h4 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2">신강/신약</h4>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{step2.bodyStrength}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">{step2.bodyStrengthReason}</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                  <h4 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2">월령</h4>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{step2.monthlyInfluence}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">{step2.monthlyInfluenceReason}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">일간 특성</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {step2.characteristics.map((c, i) => (
                    <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl">
                <h4 className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-400 mb-2 sm:mb-3">용신 체계</h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">용신</p>
                    <p className="text-base sm:text-lg font-bold text-blue-600">{step2.usefulGod.primary}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">희신</p>
                    <p className="text-base sm:text-lg font-bold text-green-600">{step2.usefulGod.supporting}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">기신</p>
                    <p className="text-base sm:text-lg font-bold text-red-600">{step2.usefulGod.avoiding}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3">{step2.usefulGod.reasoning}</p>
              </div>
            </div>
          )}

          {/* 십성 탭 */}
          {activeTab === "tengods" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">십성 분석</h3>
                <DetailButton onClick={() => openDetailModal("tenGods", "십성")} label="상세 분석" />
              </div>

              <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-gray-500">격국</p>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-600">{step3.structure}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">{step3.structureDescription}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">주요 십성</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {step3.dominantGods.map((g, i) => (
                    <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-full text-xs sm:text-sm">
                      ⭐ {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h4 className="font-medium text-sm sm:text-base">성격 특성</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{step3.personality.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                    {step3.personality.traits.map((t, i) => (
                      <span key={i} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h4 className="font-medium text-sm sm:text-base">적합 직업</h4>
                    <button
                      onClick={() => openDetailModal("career", "직업운")}
                      className="text-[10px] sm:text-xs text-[var(--accent)] hover:underline"
                    >
                      상세보기 →
                    </button>
                  </div>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {step3.careerAptitude.suitableFields.map((f, i) => (
                      <li key={i} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <h4 className="font-medium text-sm sm:text-base text-pink-700 dark:text-pink-400">💕 연애/관계 스타일</h4>
                  <button
                    onClick={() => openDetailModal("relationship", "대인관계")}
                    className="text-[10px] sm:text-xs text-[var(--accent)] hover:underline"
                  >
                    상세보기 →
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{step3.relationshipStyle.loveStyle}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">
                  <strong>이상적 파트너:</strong> {step3.relationshipStyle.idealPartnerTraits.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* 신살 탭 */}
          {activeTab === "stars" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">신살 분석</h3>
                <DetailButton onClick={() => openDetailModal("stars", "신살")} label="상세 분석" />
              </div>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{step4.overallStarInfluence}</p>

              <div>
                <h4 className="font-medium text-sm sm:text-base text-green-700 dark:text-green-400 mb-2 sm:mb-3">✨ 길신 (행운의 별)</h4>
                <div className="space-y-2 sm:space-y-3">
                  {step4.auspiciousStars.map((star, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm sm:text-base text-green-700 dark:text-green-400">{star.koreanName}</h5>
                        <span className="text-[10px] sm:text-xs text-gray-500">{star.position}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{star.meaning}</p>
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1.5 sm:mt-2">💡 활용법: {star.howToUse}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm sm:text-base text-amber-700 dark:text-amber-400 mb-2 sm:mb-3">⚡ 흉신 (주의할 별)</h4>
                <div className="space-y-2 sm:space-y-3">
                  {step4.inauspiciousStars.map((star, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm sm:text-base text-amber-700 dark:text-amber-400">{star.koreanName}</h5>
                        <span className="text-[10px] sm:text-xs text-gray-500">{star.position}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{star.meaning}</p>
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1.5 sm:mt-2">⚠️ 주의: {star.caution}</p>
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">✅ 긍정 활용: {star.positiveUse}</p>
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">대운/세운 분석</h3>
                <DetailButton onClick={() => openDetailModal("fortune", "운세")} label="상세 분석" />
              </div>

              {/* 현재 대운 */}
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg sm:rounded-xl">
                <h4 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2">현재 대운 ({step5.currentMajorFortune.period})</h4>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{step5.currentMajorFortune.theme}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">{step5.currentMajorFortune.influence}</p>
              </div>

              {/* 올해 세운 */}
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="font-medium text-sm sm:text-base">{step5.yearlyFortune.year}년 운세</h4>
                  <span className="text-xl sm:text-2xl font-bold text-purple-600">{step5.yearlyFortune.score}점</span>
                </div>
                <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">{step5.yearlyFortune.theme}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">{step5.yearlyFortune.advice}</p>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">기회</p>
                    <ul className="mt-1 space-y-0.5 sm:space-y-1">
                      {step5.yearlyFortune.opportunities.map((o, i) => (
                        <li key={i} className="text-[10px] sm:text-xs text-green-600 dark:text-green-300">• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400">도전</p>
                    <ul className="mt-1 space-y-0.5 sm:space-y-1">
                      {step5.yearlyFortune.challenges.map((c, i) => (
                        <li key={i} className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-300">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 월별 하이라이트 */}
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">월별 운세 포인트</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                  {step5.monthlyHighlights.map((m) => (
                    <div
                      key={m.month}
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                        m.rating === "excellent" ? "bg-purple-100 dark:bg-purple-900/30" :
                        m.rating === "good" ? "bg-green-100 dark:bg-green-900/30" :
                        m.rating === "caution" ? "bg-amber-100 dark:bg-amber-900/30" :
                        "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <p className="font-bold text-sm sm:text-base">{m.month}월</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">{m.description}</p>
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
              <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl">
                <h4 className="font-medium text-sm sm:text-base text-purple-700 dark:text-purple-400 mb-2 sm:mb-3">🚀 즉시 실천</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.advice.immediate.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-purple-500 flex-shrink-0">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 단기 조언 */}
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl">
                <h4 className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-400 mb-2 sm:mb-3">📆 1-3개월 내</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.advice.shortTerm.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-blue-500 flex-shrink-0">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 장기 조언 */}
              <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl">
                <h4 className="font-medium text-sm sm:text-base text-green-700 dark:text-green-400 mb-2 sm:mb-3">🌱 장기 발전</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {step6.advice.longTerm.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 flex-shrink-0">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 행운 요소 */}
              <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl">
                <h4 className="font-medium text-sm sm:text-base text-amber-700 dark:text-amber-400 mb-2 sm:mb-3">🍀 행운의 요소</h4>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">색상</p>
                    <p className="font-medium text-xs sm:text-sm">{step6.luckyElements.colors.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">숫자</p>
                    <p className="font-medium text-xs sm:text-sm">{step6.luckyElements.numbers.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">방향</p>
                    <p className="font-medium text-xs sm:text-sm">{step6.luckyElements.directions.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">계절</p>
                    <p className="font-medium text-xs sm:text-sm">{step6.luckyElements.seasons.join(", ")}</p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">추천 활동</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                    {step6.luckyElements.activities.map((a, i) => (
                      <span key={i} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs sm:text-sm">
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

      {/* AI 채팅 패널 */}
      <SajuChatPanel sajuContext={sajuContext} gender={gender} />
    </>
  );
}
