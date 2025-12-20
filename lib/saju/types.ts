/**
 * 사주팔자 (Four Pillars of Destiny) Type Definitions
 * AI 운세 마스터 - Core Types
 */

// ============================================================================
// 기본 타입 (Basic Types)
// ============================================================================

/** 천간 (Heavenly Stems) - 10 Stems */
export type Gan =
  | "甲"
  | "乙"
  | "丙"
  | "丁"
  | "戊"
  | "己"
  | "庚"
  | "辛"
  | "壬"
  | "癸";

/** 지지 (Earthly Branches) - 12 Branches */
export type Zhi =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

/** 오행 (Five Elements) */
export type Element = "wood" | "fire" | "earth" | "metal" | "water";

/** 음양 (Yin-Yang) */
export type YinYang = "yin" | "yang";

/** 성별 */
export type Gender = "male" | "female";

// ============================================================================
// 십성 (Ten Gods)
// ============================================================================

export type TenGod =
  | "bijian" // 비견 (比肩) - Companion
  | "gebjae" // 겁재 (劫財) - Rob Wealth
  | "siksin" // 식신 (食神) - Eating God
  | "sanggwan" // 상관 (傷官) - Hurting Officer
  | "pyeonjae" // 편재 (偏財) - Indirect Wealth
  | "jeongjae" // 정재 (正財) - Direct Wealth
  | "pyeongwan" // 편관 (偏官) - Indirect Authority (Seven Killings)
  | "jeonggwan" // 정관 (正官) - Direct Authority
  | "pyeonin" // 편인 (偏印) - Indirect Seal
  | "jeongin"; // 정인 (正印) - Direct Seal

export interface TenGodInfo {
  code: TenGod;
  korean: string;
  hanja: string;
  english: string;
  description: string;
}

// ============================================================================
// 입력 타입 (Input Types)
// ============================================================================

export interface SajuInput {
  /** 출생 연도 (1900-2100) */
  year: number;
  /** 출생 월 (1-12) */
  month: number;
  /** 출생 일 (1-31) */
  day: number;
  /** 출생 시 (0-23) */
  hour: number;
  /** 출생 분 (0-59) */
  minute: number;
  /** 성별 */
  gender: Gender;
  /** 음력 여부 (default: false = 양력) */
  isLunar?: boolean;
  /** 윤달 여부 (isLunar=true일 때만 유효) */
  isLeapMonth?: boolean;
  /** 출생지 경도 (진태양시 보정용, default: 127.5 = 서울) */
  longitude?: number;
}

// ============================================================================
// 주 (Pillar) 타입
// ============================================================================

export interface Pillar {
  /** 천간 */
  gan: Gan;
  /** 지지 */
  zhi: Zhi;
  /** 간지 조합 (예: "甲子") */
  ganZhi: string;
  /** 천간 오행 */
  ganElement: Element;
  /** 천간 음양 */
  ganYinYang: YinYang;
  /** 지지 오행 (정기) */
  zhiElement: Element;
  /** 지지 음양 */
  zhiYinYang: YinYang;
  /** 지지 장간 (숨은 천간) */
  zhiHiddenGan: Gan[];
  /** 한글 발음 */
  koreanReading: string;
}

// ============================================================================
// 오행 분석 (Element Analysis)
// ============================================================================

export interface ElementScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface ElementAnalysis {
  /** 오행 점수 (0-100 스케일) */
  scores: ElementScores;
  /** 가장 강한 오행 */
  dominant: Element[];
  /** 부족한 오행 */
  lacking: Element[];
  /** 균형 상태 */
  balance: "balanced" | "unbalanced";
  /** 용신 (필요한 오행) */
  yongShin?: Element;
}

// ============================================================================
// 십성 분석 (Ten Gods Analysis)
// ============================================================================

export interface TenGodPosition {
  gan: TenGod | null;
  zhi: TenGod | null;
}

export interface TenGodAnalysis {
  year: TenGodPosition;
  month: TenGodPosition;
  day: TenGodPosition;
  time: TenGodPosition;
}

export interface TenGodSummary {
  /** 많이 나타나는 십성 */
  dominant: TenGod[];
  /** 없거나 적은 십성 */
  lacking: TenGod[];
  /** 십성별 출현 횟수 */
  counts: Record<TenGod, number>;
}

// ============================================================================
// 신살 (Stars/Spirits)
// ============================================================================

export type StarType = "auspicious" | "inauspicious" | "neutral";

export interface Star {
  /** 신살 이름 */
  name: string;
  /** 한자 */
  hanja: string;
  /** 설명 */
  description: string;
  /** 길흉 */
  type: StarType;
  /** 위치 (어느 주에서 발생했는지) */
  position?: "year" | "month" | "day" | "time";
}

// ============================================================================
// 대운 (Major Fortune)
// ============================================================================

export interface MajorFortunePeriod {
  /** 시작 나이 */
  startAge: number;
  /** 종료 나이 */
  endAge: number;
  /** 대운 간지 */
  pillar: Pillar;
}

export interface MajorFortune {
  /** 대운 시작 나이 */
  startAge: number;
  /** 순행/역행 */
  direction: "forward" | "backward";
  /** 대운 기간들 */
  periods: MajorFortunePeriod[];
}

// ============================================================================
// 메타 정보 (Meta Information)
// ============================================================================

export interface SajuMeta {
  /** 양력 날짜 */
  solarDate: string;
  /** 음력 날짜 */
  lunarDate: string;
  /** 입력 시간 */
  inputTime: string;
  /** 진태양시 보정 후 시간 */
  trueSolarTime: string;
  /** 해당 절기 */
  jieQi: string;
  /** 적용된 경도 */
  longitude: number;
  /** 보정 시간 (분) */
  offsetMinutes: number;
}

// ============================================================================
// 최종 결과 (Final Result)
// ============================================================================

export interface SajuResult {
  /** 사주 팔자 (네 개의 주) */
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    time: Pillar;
  };

  /** 일간 (Day Master) - 본인을 나타내는 핵심 */
  dayMaster: Gan;
  dayMasterElement: Element;
  dayMasterYinYang: YinYang;
  dayMasterDescription: string;

  /** 오행 분석 */
  elementAnalysis: ElementAnalysis;

  /** 십성 분석 */
  tenGods: TenGodAnalysis;
  tenGodSummary: TenGodSummary;

  /** 신살 */
  stars: Star[];

  /** 대운 (선택적) */
  majorFortune?: MajorFortune;

  /** 메타 정보 */
  meta: SajuMeta;
}

// ============================================================================
// 프롬프트용 단순화된 타입 (For LLM Prompts)
// ============================================================================

export interface SajuPromptData {
  dayMaster: string;
  dayMasterDescription: string;
  pillars: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  elementScores: ElementScores;
  dominantElements: string[];
  lackingElements: string[];
  dominantTenGods: string[];
  stars: string[];
}
