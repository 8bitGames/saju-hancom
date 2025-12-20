/**
 * 십성 (Ten Gods) 계산
 * AI 운세 마스터 - Ten Gods Calculation
 */

import type {
  Gan,
  Element,
  YinYang,
  TenGod,
  TenGodAnalysis,
  TenGodPosition,
  TenGodSummary,
  Pillar,
} from "./types";
import {
  STEM_ELEMENTS,
  STEM_YIN_YANG,
  BRANCH_HIDDEN_STEMS,
  TEN_GOD_MATRIX,
  TEN_GOD_INFO,
  TEN_GODS,
} from "./constants";

/**
 * 두 천간 사이의 십성 관계 계산
 *
 * @param dayMaster - 일간 (본인)
 * @param targetStem - 대상 천간
 * @returns 십성
 */
export function getTenGodRelation(dayMaster: Gan, targetStem: Gan): TenGod {
  const dayMasterElement = STEM_ELEMENTS[dayMaster];
  const dayMasterYinYang = STEM_YIN_YANG[dayMaster];
  const targetElement = STEM_ELEMENTS[targetStem];
  const targetYinYang = STEM_YIN_YANG[targetStem];

  // 음양 관계 판정: 같으면 'same', 다르면 'diff'
  const yinYangRelation = dayMasterYinYang === targetYinYang ? "same" : "diff";

  // 매트릭스에서 십성 찾기
  const relation = TEN_GOD_MATRIX[dayMasterElement][targetElement];
  return relation[yinYangRelation];
}

/**
 * 지지의 정기(주된 장간)에 대한 십성 계산
 *
 * @param dayMaster - 일간
 * @param zhi - 지지
 * @returns 십성 (정기 기준)
 */
export function getTenGodForBranch(dayMaster: Gan, zhi: string): TenGod | null {
  const hiddenStems = BRANCH_HIDDEN_STEMS[zhi as keyof typeof BRANCH_HIDDEN_STEMS];
  if (!hiddenStems || hiddenStems.length === 0) {
    return null;
  }

  // 첫 번째 장간(정기)으로 십성 계산
  return getTenGodRelation(dayMaster, hiddenStems[0]);
}

/**
 * 사주 전체에서 십성 분석
 *
 * @param dayMaster - 일간
 * @param pillars - 사주 팔자
 * @returns 십성 분석 결과
 */
export function calculateTenGods(
  dayMaster: Gan,
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    time: Pillar;
  }
): TenGodAnalysis {
  const analyze = (pillar: Pillar, isDay: boolean = false): TenGodPosition => {
    // 일간 자신은 null로 표시
    const ganTenGod = isDay ? null : getTenGodRelation(dayMaster, pillar.gan);
    const zhiTenGod = getTenGodForBranch(dayMaster, pillar.zhi);

    return {
      gan: ganTenGod,
      zhi: zhiTenGod,
    };
  };

  return {
    year: analyze(pillars.year),
    month: analyze(pillars.month),
    day: analyze(pillars.day, true), // 일간은 자신
    time: analyze(pillars.time),
  };
}

/**
 * 십성 출현 빈도 계산 및 요약
 *
 * @param tenGods - 십성 분석 결과
 * @returns 십성 요약
 */
export function summarizeTenGods(tenGods: TenGodAnalysis): TenGodSummary {
  // 각 십성 출현 횟수 초기화
  const counts = TEN_GODS.reduce(
    (acc, god) => {
      acc[god] = 0;
      return acc;
    },
    {} as Record<TenGod, number>
  );

  // 출현 횟수 계산
  const positions = [tenGods.year, tenGods.month, tenGods.day, tenGods.time];
  for (const pos of positions) {
    if (pos.gan) counts[pos.gan]++;
    if (pos.zhi) counts[pos.zhi]++;
  }

  // 많이 나타나는 십성 (2회 이상)
  const dominant = TEN_GODS.filter((god) => counts[god] >= 2);

  // 없는 십성
  const lacking = TEN_GODS.filter((god) => counts[god] === 0);

  return {
    dominant,
    lacking,
    counts,
  };
}

/**
 * 십성 분석 결과를 한글 설명으로 변환
 *
 * @param tenGods - 십성 분석 결과
 * @returns 한글 설명 문자열
 */
export function formatTenGodAnalysis(tenGods: TenGodAnalysis): string {
  const formatPosition = (label: string, pos: TenGodPosition): string => {
    const ganText = pos.gan ? TEN_GOD_INFO[pos.gan].korean : "-";
    const zhiText = pos.zhi ? TEN_GOD_INFO[pos.zhi].korean : "-";
    return `${label}: ${ganText}/${zhiText}`;
  };

  return [
    formatPosition("년주", tenGods.year),
    formatPosition("월주", tenGods.month),
    formatPosition("일주", tenGods.day),
    formatPosition("시주", tenGods.time),
  ].join(", ");
}

/**
 * 십성 요약을 한글 설명으로 변환
 *
 * @param summary - 십성 요약
 * @returns 한글 설명 문자열
 */
export function formatTenGodSummary(summary: TenGodSummary): string {
  const lines: string[] = [];

  if (summary.dominant.length > 0) {
    const dominantKorean = summary.dominant
      .map((god) => TEN_GOD_INFO[god].korean)
      .join(", ");
    lines.push(`주요 십성: ${dominantKorean}`);
  }

  if (summary.lacking.length > 0) {
    const lackingKorean = summary.lacking
      .map((god) => TEN_GOD_INFO[god].korean)
      .join(", ");
    lines.push(`부재 십성: ${lackingKorean}`);
  }

  return lines.join("\n");
}

/**
 * 특정 십성에 대한 상세 설명 가져오기
 *
 * @param tenGod - 십성 코드
 * @returns 십성 정보
 */
export function getTenGodDescription(tenGod: TenGod): string {
  const info = TEN_GOD_INFO[tenGod];
  return `${info.korean}(${info.hanja}): ${info.description}`;
}
