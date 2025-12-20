/**
 * 신살 (Stars/Spirits) 계산
 * AI 운세 마스터 - Stars Calculation
 */

import type { Gan, Zhi, Star, StarType, Pillar } from "./types";
import { EARTHLY_BRANCHES } from "./constants";

// ============================================================================
// 신살 정의 및 조건
// ============================================================================

interface StarDefinition {
  name: string;
  hanja: string;
  description: string;
  type: StarType;
  check: (pillars: StarCheckContext) => boolean | string | null;
}

interface StarCheckContext {
  yearGan: Gan;
  yearZhi: Zhi;
  monthGan: Gan;
  monthZhi: Zhi;
  dayGan: Gan;
  dayZhi: Zhi;
  timeGan: Gan;
  timeZhi: Zhi;
}

/**
 * 천을귀인 (天乙貴人) 조견표
 * 일간별 천을귀인이 되는 지지
 */
const TIANYI_GUIREN: Record<Gan, Zhi[]> = {
  "甲": ["丑", "未"],
  "乙": ["子", "申"],
  "丙": ["亥", "酉"],
  "丁": ["亥", "酉"],
  "戊": ["丑", "未"],
  "己": ["子", "申"],
  "庚": ["丑", "未"],
  "辛": ["寅", "午"],
  "壬": ["卯", "巳"],
  "癸": ["卯", "巳"],
};

/**
 * 도화살 (桃花煞) 조견표
 * 일지 또는 년지 기준으로 보는 지지
 */
const TAOHUA: Record<Zhi, Zhi> = {
  "子": "酉",
  "丑": "午",
  "寅": "卯",
  "卯": "子",
  "辰": "酉",
  "巳": "午",
  "午": "卯",
  "未": "子",
  "申": "酉",
  "酉": "午",
  "戌": "卯",
  "亥": "子",
};

/**
 * 역마살 (驛馬煞) 조견표
 * 년지 또는 일지 기준
 */
const YIMA: Record<Zhi, Zhi> = {
  "子": "寅",
  "丑": "亥",
  "寅": "申",
  "卯": "巳",
  "辰": "寅",
  "巳": "亥",
  "午": "申",
  "未": "巳",
  "申": "寅",
  "酉": "亥",
  "戌": "申",
  "亥": "巳",
};

/**
 * 화개살 (華蓋煞) 조견표
 * 년지 또는 일지 기준
 */
const HUAGAI: Record<Zhi, Zhi> = {
  "子": "辰",
  "丑": "丑",
  "寅": "戌",
  "卯": "未",
  "辰": "辰",
  "巳": "丑",
  "午": "戌",
  "未": "未",
  "申": "辰",
  "酉": "丑",
  "戌": "戌",
  "亥": "未",
};

/**
 * 문창귀인 (文昌貴人) 조견표
 * 일간별 문창이 되는 지지
 */
const WENCHANG: Record<Gan, Zhi> = {
  "甲": "巳",
  "乙": "午",
  "丙": "申",
  "丁": "酉",
  "戊": "申",
  "己": "酉",
  "庚": "亥",
  "辛": "子",
  "壬": "寅",
  "癸": "卯",
};

/**
 * 학당귀인 (學堂貴人) 조견표
 * 일간별 학당이 되는 지지
 */
const XUETANG: Record<Gan, Zhi> = {
  "甲": "亥",
  "乙": "午",
  "丙": "寅",
  "丁": "酉",
  "戊": "寅",
  "己": "酉",
  "庚": "巳",
  "辛": "子",
  "壬": "申",
  "癸": "卯",
};

// ============================================================================
// 신살 정의 목록
// ============================================================================

const STAR_DEFINITIONS: StarDefinition[] = [
  // 길신 (吉神) - Auspicious Stars
  {
    name: "천을귀인",
    hanja: "天乙貴人",
    description: "가장 강력한 귀인. 위기에서 도움을 받고, 귀인의 조력이 있음.",
    type: "auspicious",
    check: (ctx) => {
      const guirenZhi = TIANYI_GUIREN[ctx.dayGan];
      const allZhi = [ctx.yearZhi, ctx.monthZhi, ctx.dayZhi, ctx.timeZhi];
      const found = allZhi.find((zhi) => guirenZhi.includes(zhi));
      return found
        ? found === ctx.yearZhi
          ? "year"
          : found === ctx.monthZhi
          ? "month"
          : found === ctx.dayZhi
          ? "day"
          : "time"
        : null;
    },
  },
  {
    name: "문창귀인",
    hanja: "文昌貴人",
    description: "학문과 문서 운이 좋음. 시험, 자격증에 유리.",
    type: "auspicious",
    check: (ctx) => {
      const wenchangZhi = WENCHANG[ctx.dayGan];
      const allZhi = [ctx.yearZhi, ctx.monthZhi, ctx.dayZhi, ctx.timeZhi];
      return allZhi.includes(wenchangZhi);
    },
  },
  {
    name: "학당귀인",
    hanja: "學堂貴人",
    description: "학업 성취와 교육 분야에서 발전 가능성이 높음.",
    type: "auspicious",
    check: (ctx) => {
      const xuetangZhi = XUETANG[ctx.dayGan];
      const allZhi = [ctx.yearZhi, ctx.monthZhi, ctx.dayZhi, ctx.timeZhi];
      return allZhi.includes(xuetangZhi);
    },
  },
  {
    name: "화개살",
    hanja: "華蓋煞",
    description: "예술적 재능과 종교/철학적 성향. 고독하지만 독창적.",
    type: "neutral",
    check: (ctx) => {
      const huagaiZhi = HUAGAI[ctx.dayZhi];
      const allZhi = [ctx.yearZhi, ctx.monthZhi, ctx.timeZhi];
      return allZhi.includes(huagaiZhi);
    },
  },

  // 흉신/중성 (凶神/中性) - Inauspicious or Neutral Stars
  {
    name: "도화살",
    hanja: "桃花煞",
    description: "이성 인연이 많고 매력적. 과하면 바람기 주의.",
    type: "neutral",
    check: (ctx) => {
      const taohuaZhi = TAOHUA[ctx.dayZhi];
      const allZhi = [ctx.yearZhi, ctx.monthZhi, ctx.timeZhi];
      return allZhi.includes(taohuaZhi);
    },
  },
  {
    name: "역마살",
    hanja: "驛馬煞",
    description: "활동성이 강하고 이동/변동이 많음. 해외, 출장, 이사 운.",
    type: "neutral",
    check: (ctx) => {
      const yimaZhi = YIMA[ctx.dayZhi];
      const allZhi = [ctx.yearZhi, ctx.monthZhi, ctx.timeZhi];
      return allZhi.includes(yimaZhi);
    },
  },
  {
    name: "공망",
    hanja: "空亡",
    description: "허무함을 느끼기 쉬움. 영적 성장의 기회가 될 수 있음.",
    type: "inauspicious",
    check: (ctx) => {
      // 간단한 공망 체크 (일주 기준)
      // 실제로는 더 복잡한 60갑자 기반 계산 필요
      // MVP에서는 단순화
      return false;
    },
  },
  {
    name: "겁살",
    hanja: "劫煞",
    description: "재물 손실, 도난 주의. 대인관계에서 배신당할 수 있음.",
    type: "inauspicious",
    check: (ctx) => {
      // 년지 기준 겁살
      const jiebshaMap: Record<Zhi, Zhi> = {
        "子": "巳", "丑": "寅", "寅": "亥", "卯": "申",
        "辰": "巳", "巳": "寅", "午": "亥", "未": "申",
        "申": "巳", "酉": "寅", "戌": "亥", "亥": "申",
      };
      const jiebshaZhi = jiebshaMap[ctx.yearZhi];
      const allZhi = [ctx.monthZhi, ctx.dayZhi, ctx.timeZhi];
      return allZhi.includes(jiebshaZhi);
    },
  },
  {
    name: "양인살",
    hanja: "羊刃煞",
    description: "강인하고 승부욕 강함. 과하면 성급함과 사고 주의.",
    type: "inauspicious",
    check: (ctx) => {
      // 일간 기준 양인
      const yangrenMap: Record<Gan, Zhi> = {
        "甲": "卯", "乙": "辰", "丙": "午", "丁": "未",
        "戊": "午", "己": "未", "庚": "酉", "辛": "戌",
        "壬": "子", "癸": "丑",
      };
      const yangrenZhi = yangrenMap[ctx.dayGan];
      const allZhi = [ctx.yearZhi, ctx.monthZhi, ctx.dayZhi, ctx.timeZhi];
      return allZhi.includes(yangrenZhi);
    },
  },
];

// ============================================================================
// 메인 함수
// ============================================================================

/**
 * 사주에서 신살 계산
 *
 * @param pillars - 사주 팔자
 * @returns 발견된 신살 목록
 */
export function calculateStars(pillars: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  time: Pillar;
}): Star[] {
  const context: StarCheckContext = {
    yearGan: pillars.year.gan,
    yearZhi: pillars.year.zhi,
    monthGan: pillars.month.gan,
    monthZhi: pillars.month.zhi,
    dayGan: pillars.day.gan,
    dayZhi: pillars.day.zhi,
    timeGan: pillars.time.gan,
    timeZhi: pillars.time.zhi,
  };

  const stars: Star[] = [];

  for (const def of STAR_DEFINITIONS) {
    const result = def.check(context);
    if (result) {
      stars.push({
        name: def.name,
        hanja: def.hanja,
        description: def.description,
        type: def.type,
        position: typeof result === "string" ? result as Star["position"] : undefined,
      });
    }
  }

  return stars;
}

/**
 * 신살 목록을 한글 설명으로 변환
 *
 * @param stars - 신살 목록
 * @returns 한글 설명 문자열
 */
export function formatStars(stars: Star[]): string {
  if (stars.length === 0) {
    return "특별한 신살 없음";
  }

  return stars
    .map((star) => {
      const typeLabel =
        star.type === "auspicious"
          ? "길신"
          : star.type === "inauspicious"
          ? "흉신"
          : "중성";
      return `${star.name}(${star.hanja}) [${typeLabel}]`;
    })
    .join(", ");
}

/**
 * 길신만 필터링
 */
export function getAuspiciousStars(stars: Star[]): Star[] {
  return stars.filter((star) => star.type === "auspicious");
}

/**
 * 흉신만 필터링
 */
export function getInauspiciousStars(stars: Star[]): Star[] {
  return stars.filter((star) => star.type === "inauspicious");
}
