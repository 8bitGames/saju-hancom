/**
 * 사주팔자 상수 정의 (Four Pillars Constants)
 * AI 운세 마스터 - Constants
 */

import type {
  Gan,
  Zhi,
  Element,
  YinYang,
  TenGod,
  TenGodInfo,
} from "./types";

// ============================================================================
// 천간 (Heavenly Stems) - 10개
// ============================================================================

export const HEAVENLY_STEMS: Gan[] = [
  "甲", "乙", "丙", "丁", "戊",
  "己", "庚", "辛", "壬", "癸",
];

export const STEM_KOREAN: Record<Gan, string> = {
  "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
  "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
};

export const STEM_ELEMENTS: Record<Gan, Element> = {
  "甲": "wood", "乙": "wood",
  "丙": "fire", "丁": "fire",
  "戊": "earth", "己": "earth",
  "庚": "metal", "辛": "metal",
  "壬": "water", "癸": "water",
};

export const STEM_YIN_YANG: Record<Gan, YinYang> = {
  "甲": "yang", "乙": "yin",
  "丙": "yang", "丁": "yin",
  "戊": "yang", "己": "yin",
  "庚": "yang", "辛": "yin",
  "壬": "yang", "癸": "yin",
};

export const STEM_DESCRIPTIONS: Record<Gan, string> = {
  "甲": "갑목(甲木) - 큰 나무, 리더십과 진취성",
  "乙": "을목(乙木) - 작은 나무, 유연함과 적응력",
  "丙": "병화(丙火) - 태양, 열정과 활력",
  "丁": "정화(丁火) - 촛불, 따뜻함과 섬세함",
  "戊": "무토(戊土) - 산, 안정과 신뢰",
  "己": "기토(己土) - 밭, 포용력과 현실감각",
  "庚": "경금(庚金) - 강철, 강인함과 결단력",
  "辛": "신금(辛金) - 보석, 예리함과 완벽주의",
  "壬": "임수(壬水) - 바다, 지혜와 포용력",
  "癸": "계수(癸水) - 비/이슬, 직관과 창의성",
};

// ============================================================================
// 지지 (Earthly Branches) - 12개
// ============================================================================

export const EARTHLY_BRANCHES: Zhi[] = [
  "子", "丑", "寅", "卯", "辰", "巳",
  "午", "未", "申", "酉", "戌", "亥",
];

export const BRANCH_KOREAN: Record<Zhi, string> = {
  "子": "자", "丑": "축", "寅": "인", "卯": "묘",
  "辰": "진", "巳": "사", "午": "오", "未": "미",
  "申": "신", "酉": "유", "戌": "술", "亥": "해",
};

export const BRANCH_ANIMALS: Record<Zhi, string> = {
  "子": "쥐", "丑": "소", "寅": "호랑이", "卯": "토끼",
  "辰": "용", "巳": "뱀", "午": "말", "未": "양",
  "申": "원숭이", "酉": "닭", "戌": "개", "亥": "돼지",
};

export const BRANCH_ELEMENTS: Record<Zhi, Element> = {
  "子": "water",
  "丑": "earth",
  "寅": "wood",
  "卯": "wood",
  "辰": "earth",
  "巳": "fire",
  "午": "fire",
  "未": "earth",
  "申": "metal",
  "酉": "metal",
  "戌": "earth",
  "亥": "water",
};

export const BRANCH_YIN_YANG: Record<Zhi, YinYang> = {
  "子": "yang", "丑": "yin", "寅": "yang", "卯": "yin",
  "辰": "yang", "巳": "yin", "午": "yang", "未": "yin",
  "申": "yang", "酉": "yin", "戌": "yang", "亥": "yin",
};

export const BRANCH_DESCRIPTIONS: Record<Zhi, string> = {
  "子": "자수(子水) - 쥐띠, 지혜와 민첩함",
  "丑": "축토(丑土) - 소띠, 성실과 인내",
  "寅": "인목(寅木) - 호랑이띠, 용맹과 리더십",
  "卯": "묘목(卯木) - 토끼띠, 온화와 예술성",
  "辰": "진토(辰土) - 용띠, 권위와 카리스마",
  "巳": "사화(巳火) - 뱀띠, 지혜와 신비로움",
  "午": "오화(午火) - 말띠, 열정과 활력",
  "未": "미토(未土) - 양띠, 온순과 예술성",
  "申": "신금(申金) - 원숭이띠, 재치와 영리함",
  "酉": "유금(酉金) - 닭띠, 자신감과 완벽주의",
  "戌": "술토(戌土) - 개띠, 충성과 정직",
  "亥": "해수(亥水) - 돼지띠, 낙천과 풍요",
};

/**
 * 지지 장간 (Hidden Stems in Branches)
 * 각 지지에 숨어있는 천간들
 */
export const BRANCH_HIDDEN_STEMS: Record<Zhi, Gan[]> = {
  "子": ["癸"],                    // 수
  "丑": ["己", "癸", "辛"],        // 토, 수, 금
  "寅": ["甲", "丙", "戊"],        // 목, 화, 토
  "卯": ["乙"],                    // 목
  "辰": ["戊", "乙", "癸"],        // 토, 목, 수
  "巳": ["丙", "庚", "戊"],        // 화, 금, 토
  "午": ["丁", "己"],              // 화, 토
  "未": ["己", "丁", "乙"],        // 토, 화, 목
  "申": ["庚", "壬", "戊"],        // 금, 수, 토
  "酉": ["辛"],                    // 금
  "戌": ["戊", "辛", "丁"],        // 토, 금, 화
  "亥": ["壬", "甲"],              // 수, 목
};

// ============================================================================
// 오행 (Five Elements)
// ============================================================================

export const ELEMENTS: Element[] = ["wood", "fire", "earth", "metal", "water"];

export const ELEMENT_KOREAN: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

export const ELEMENT_COLORS: Record<Element, string> = {
  wood: "#22c55e",   // 초록
  fire: "#ef4444",   // 빨강
  earth: "#eab308",  // 노랑
  metal: "#f8fafc",  // 흰색/은색
  water: "#3b82f6",  // 파랑
};

/**
 * 오행 상생 관계 (생하는 오행)
 * 목 → 화 → 토 → 금 → 수 → 목
 */
export const ELEMENT_PRODUCES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

/**
 * 오행 상극 관계 (극하는 오행)
 * 목 → 토 → 수 → 화 → 금 → 목
 */
export const ELEMENT_CONTROLS: Record<Element, Element> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire",
};

// ============================================================================
// 십성 (Ten Gods)
// ============================================================================

export const TEN_GODS: TenGod[] = [
  "bijian", "gebjae", "siksin", "sanggwan",
  "pyeonjae", "jeongjae", "pyeongwan", "jeonggwan",
  "pyeonin", "jeongin",
];

export const TEN_GOD_INFO: Record<TenGod, TenGodInfo> = {
  bijian: {
    code: "bijian",
    korean: "비견",
    hanja: "比肩",
    english: "Companion",
    description: "나와 같은 오행, 같은 음양. 형제, 친구, 경쟁자를 의미.",
  },
  gebjae: {
    code: "gebjae",
    korean: "겁재",
    hanja: "劫財",
    english: "Rob Wealth",
    description: "나와 같은 오행, 다른 음양. 경쟁, 도전, 손재수를 의미.",
  },
  siksin: {
    code: "siksin",
    korean: "식신",
    hanja: "食神",
    english: "Eating God",
    description: "내가 생하는 오행, 같은 음양. 재능, 표현력, 자녀를 의미.",
  },
  sanggwan: {
    code: "sanggwan",
    korean: "상관",
    hanja: "傷官",
    english: "Hurting Officer",
    description: "내가 생하는 오행, 다른 음양. 창의성, 반항심, 예술성을 의미.",
  },
  pyeonjae: {
    code: "pyeonjae",
    korean: "편재",
    hanja: "偏財",
    english: "Indirect Wealth",
    description: "내가 극하는 오행, 같은 음양. 투기적 재물, 아버지를 의미.",
  },
  jeongjae: {
    code: "jeongjae",
    korean: "정재",
    hanja: "正財",
    english: "Direct Wealth",
    description: "내가 극하는 오행, 다른 음양. 정당한 재물, 아내를 의미.",
  },
  pyeongwan: {
    code: "pyeongwan",
    korean: "편관",
    hanja: "偏官",
    english: "Seven Killings",
    description: "나를 극하는 오행, 같은 음양. 권력, 도전, 위험을 의미.",
  },
  jeonggwan: {
    code: "jeonggwan",
    korean: "정관",
    hanja: "正官",
    english: "Direct Authority",
    description: "나를 극하는 오행, 다른 음양. 명예, 직장, 남편을 의미.",
  },
  pyeonin: {
    code: "pyeonin",
    korean: "편인",
    hanja: "偏印",
    english: "Indirect Seal",
    description: "나를 생하는 오행, 같은 음양. 학문, 특수재능, 계모를 의미.",
  },
  jeongin: {
    code: "jeongin",
    korean: "정인",
    hanja: "正印",
    english: "Direct Seal",
    description: "나를 생하는 오행, 다른 음양. 학문, 자격증, 어머니를 의미.",
  },
};

// ============================================================================
// 십성 판정 매트릭스
// 일간의 오행과 대상 천간의 오행으로 십성 결정
// ============================================================================

/**
 * 십성 판정 함수를 위한 관계 매트릭스
 * [일간오행][대상오행] => 기본 십성 (음양에 따라 변형)
 */
export const TEN_GOD_MATRIX: Record<Element, Record<Element, { same: TenGod; diff: TenGod }>> = {
  wood: {
    wood: { same: "bijian", diff: "gebjae" },      // 같은 오행
    fire: { same: "siksin", diff: "sanggwan" },    // 내가 생함
    earth: { same: "pyeonjae", diff: "jeongjae" }, // 내가 극함
    metal: { same: "pyeongwan", diff: "jeonggwan" }, // 나를 극함
    water: { same: "pyeonin", diff: "jeongin" },   // 나를 생함
  },
  fire: {
    wood: { same: "pyeonin", diff: "jeongin" },
    fire: { same: "bijian", diff: "gebjae" },
    earth: { same: "siksin", diff: "sanggwan" },
    metal: { same: "pyeonjae", diff: "jeongjae" },
    water: { same: "pyeongwan", diff: "jeonggwan" },
  },
  earth: {
    wood: { same: "pyeongwan", diff: "jeonggwan" },
    fire: { same: "pyeonin", diff: "jeongin" },
    earth: { same: "bijian", diff: "gebjae" },
    metal: { same: "siksin", diff: "sanggwan" },
    water: { same: "pyeonjae", diff: "jeongjae" },
  },
  metal: {
    wood: { same: "pyeonjae", diff: "jeongjae" },
    fire: { same: "pyeongwan", diff: "jeonggwan" },
    earth: { same: "pyeonin", diff: "jeongin" },
    metal: { same: "bijian", diff: "gebjae" },
    water: { same: "siksin", diff: "sanggwan" },
  },
  water: {
    wood: { same: "siksin", diff: "sanggwan" },
    fire: { same: "pyeonjae", diff: "jeongjae" },
    earth: { same: "pyeongwan", diff: "jeonggwan" },
    metal: { same: "pyeonin", diff: "jeongin" },
    water: { same: "bijian", diff: "gebjae" },
  },
};

// ============================================================================
// 시간대 매핑 (시간 → 지지)
// ============================================================================

export const HOUR_TO_BRANCH: Record<number, Zhi> = {
  0: "子", 1: "丑", 2: "丑", 3: "寅", 4: "寅", 5: "卯",
  6: "卯", 7: "辰", 8: "辰", 9: "巳", 10: "巳", 11: "午",
  12: "午", 13: "未", 14: "未", 15: "申", 16: "申", 17: "酉",
  18: "酉", 19: "戌", 20: "戌", 21: "亥", 22: "亥", 23: "子",
};

/**
 * 시간 범위 (시작 시간)
 * 子: 23:00-01:00, 丑: 01:00-03:00, ...
 */
export const BRANCH_TIME_RANGES: Record<Zhi, string> = {
  "子": "23:00-01:00",
  "丑": "01:00-03:00",
  "寅": "03:00-05:00",
  "卯": "05:00-07:00",
  "辰": "07:00-09:00",
  "巳": "09:00-11:00",
  "午": "11:00-13:00",
  "未": "13:00-15:00",
  "申": "15:00-17:00",
  "酉": "17:00-19:00",
  "戌": "19:00-21:00",
  "亥": "21:00-23:00",
};

// ============================================================================
// 60갑자 (Sexagenary Cycle)
// ============================================================================

export const SIXTY_JIAZI: string[] = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥",
];

// ============================================================================
// 경도 상수 (Longitude Constants)
// ============================================================================

/** 한국 표준시 기준 경도 */
export const KOREA_STANDARD_MERIDIAN = 135;

/** 주요 도시/지역 경도 (영문 키) */
export const CITY_LONGITUDES: Record<string, number> = {
  // 특별시/광역시
  seoul: 126.98,
  busan: 129.04,
  daegu: 128.60,
  incheon: 126.71,
  gwangju: 126.85,
  daejeon: 127.38,
  ulsan: 129.31,
  sejong: 127.29,
  // 도 (대표 도시 기준)
  gyeonggi: 127.02,    // 수원 기준
  gangwon: 127.73,     // 춘천 기준
  chungbuk: 127.49,    // 청주 기준
  chungnam: 126.80,    // 천안 기준
  jeonbuk: 127.11,     // 전주 기준
  jeonnam: 126.39,     // 목포 기준
  gyeongbuk: 129.36,   // 포항 기준
  gyeongnam: 128.68,   // 창원 기준
  jeju: 126.53,
  // 해외
  pyongyang: 125.75,
  tokyo: 139.69,
  beijing: 116.41,
  shanghai: 121.47,
  // 한글 키도 지원 (레거시 호환성)
  서울: 126.98,
  부산: 129.04,
  대구: 128.60,
  인천: 126.71,
  광주: 126.85,
  대전: 127.38,
  울산: 129.31,
  세종: 127.29,
  경기: 127.02,
  강원: 127.73,
  충북: 127.49,
  충남: 126.80,
  전북: 127.11,
  전남: 126.39,
  경북: 129.36,
  경남: 128.68,
  제주: 126.53,
};

/** 기본 경도 (서울 기준) */
export const DEFAULT_LONGITUDE = 127.0;

// ============================================================================
// 세운 (연간 운세) 계산 유틸리티
// ============================================================================

/**
 * 특정 연도의 세운 간지를 계산
 * @param year - 연도 (예: 2025, 2026)
 * @returns 세운 정보 객체
 */
export function getYearlyFortune(year: number): {
  stem: Gan;
  branch: Zhi;
  ganZhi: string;
  stemKorean: string;
  branchKorean: string;
  koreanReading: string;
  stemElement: Element;
  branchElement: Element;
  stemDescription: string;
  branchDescription: string;
} {
  // 60갑자 주기 계산 (甲子년 = 4년)
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;

  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];

  return {
    stem,
    branch,
    ganZhi: `${stem}${branch}`,
    stemKorean: STEM_KOREAN[stem],
    branchKorean: BRANCH_KOREAN[branch],
    koreanReading: `${STEM_KOREAN[stem]}${BRANCH_KOREAN[branch]}`,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    stemDescription: STEM_DESCRIPTIONS[stem],
    branchDescription: BRANCH_DESCRIPTIONS[branch],
  };
}

/**
 * 세운 간지의 특성 설명 생성
 * @param year - 연도
 * @param locale - 언어 ('ko' | 'en')
 */
export function getYearlyFortuneDescription(year: number, locale: 'ko' | 'en' = 'ko'): string {
  const fortune = getYearlyFortune(year);

  const elementKorean: Record<Element, string> = {
    wood: '목(木)',
    fire: '화(火)',
    earth: '토(土)',
    metal: '금(金)',
    water: '수(水)',
  };

  const elementEnglish: Record<Element, string> = {
    wood: 'Wood',
    fire: 'Fire',
    earth: 'Earth',
    metal: 'Metal',
    water: 'Water',
  };

  const stemTraitsKo: Record<Gan, string> = {
    '甲': '양목, 성장과 도전',
    '乙': '음목, 유연함과 적응',
    '丙': '양화, 열정과 활력',
    '丁': '음화, 따뜻함과 섬세함',
    '戊': '양토, 안정과 중심',
    '己': '음토, 포용력과 현실감',
    '庚': '양금, 결단력과 추진력',
    '辛': '음금, 예리함과 완벽주의',
    '壬': '양수, 지혜와 포용',
    '癸': '음수, 직관과 창의성',
  };

  const stemTraitsEn: Record<Gan, string> = {
    '甲': 'Yang Wood, growth and challenge',
    '乙': 'Yin Wood, flexibility and adaptation',
    '丙': 'Yang Fire, passion and vitality',
    '丁': 'Yin Fire, warmth and delicacy',
    '戊': 'Yang Earth, stability and centeredness',
    '己': 'Yin Earth, embracing and practical',
    '庚': 'Yang Metal, decisiveness and drive',
    '辛': 'Yin Metal, sharp and perfectionist',
    '壬': 'Yang Water, wisdom and embracing',
    '癸': 'Yin Water, intuition and creativity',
  };

  const branchTraitsKo: Record<Zhi, string> = {
    '子': '수(水), 지혜와 새로운 시작',
    '丑': '토(土), 성실과 축적',
    '寅': '목(木), 용맹과 진취',
    '卯': '목(木), 성장과 발전',
    '辰': '토(土), 변화와 전환',
    '巳': '화(火), 열정과 변화',
    '午': '화(火), 절정과 성취',
    '未': '토(土), 성숙과 결실',
    '申': '금(金), 실행과 추진',
    '酉': '금(金), 수확과 완성',
    '戌': '토(土), 정리와 마무리',
    '亥': '수(水), 지혜와 준비',
  };

  const branchTraitsEn: Record<Zhi, string> = {
    '子': 'Water, wisdom and new beginnings',
    '丑': 'Earth, diligence and accumulation',
    '寅': 'Wood, courage and progress',
    '卯': 'Wood, growth and development',
    '辰': 'Earth, change and transition',
    '巳': 'Fire, passion and transformation',
    '午': 'Fire, peak and achievement',
    '未': 'Earth, maturity and fruition',
    '申': 'Metal, execution and drive',
    '酉': 'Metal, harvest and completion',
    '戌': 'Earth, organization and closure',
    '亥': 'Water, wisdom and preparation',
  };

  if (locale === 'ko') {
    return `## 세운(歲運) 분석 - ${year}년 (${fortune.koreanReading}년)
- 올해 세운: ${fortune.ganZhi} (${fortune.koreanReading})
- ${fortune.stemKorean}(${fortune.stem}): ${stemTraitsKo[fortune.stem]}
- ${fortune.branchKorean}(${fortune.branch}): ${branchTraitsKo[fortune.branch]}`;
  } else {
    return `## Annual Fortune (歲運) Analysis - ${year} (${fortune.koreanReading} year)
- This year's fortune: ${fortune.ganZhi} (${fortune.stemKorean} ${fortune.branchKorean})
- ${fortune.stem} (${fortune.stemKorean}): ${stemTraitsEn[fortune.stem]}
- ${fortune.branch} (${fortune.branchKorean}): ${branchTraitsEn[fortune.branch]}`;
  }
}
