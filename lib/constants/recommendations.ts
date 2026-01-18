import type { ElementType } from "./guardians";

// ============================================
// Carelink Products
// ============================================

export interface CarelinkProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNumber: number;
  targetKeywords: string[];
  ctaUrl: string;
  icon: string; // phosphor icon name
  color: string;
}

export const CARELINK_PRODUCTS: Record<string, CarelinkProduct> = {
  genetic_comprehensive: {
    id: "genetic_comprehensive",
    name: "종합 유전자 검사",
    description: "350+ 항목 유전자 분석으로 나의 건강 설계도를 확인하세요",
    price: "299,000원",
    priceNumber: 299000,
    targetKeywords: ["건강 주의", "체질 분석", "선제적 관리", "건강", "체력"],
    ctaUrl: "https://carelink.co.kr/genetic-test",
    icon: "Dna",
    color: "#10B981",
  },
  gut_microbiome: {
    id: "gut_microbiome",
    name: "장내 미생물 검사",
    description: "장 건강 및 면역력 상태를 정밀 분석합니다",
    price: "149,000원",
    priceNumber: 149000,
    targetKeywords: ["소화기 약함", "면역력", "장 건강", "소화", "위장"],
    ctaUrl: "https://carelink.co.kr/microbiome",
    icon: "Virus",
    color: "#3B82F6",
  },
  nutrition_genetic: {
    id: "nutrition_genetic",
    name: "맞춤 영양 유전자 검사",
    description: "유전자 기반 개인 맞춤 영양 가이드를 제공합니다",
    price: "199,000원",
    priceNumber: 199000,
    targetKeywords: ["영양 불균형", "피로", "체력 관리", "에너지", "활력"],
    ctaUrl: "https://carelink.co.kr/nutrition",
    icon: "Pill",
    color: "#F59E0B",
  },
  skin_genetic: {
    id: "skin_genetic",
    name: "피부 유전자 검사",
    description: "피부 타입 및 노화 패턴을 유전자로 분석합니다",
    price: "129,000원",
    priceNumber: 129000,
    targetKeywords: ["외모운", "피부 관리", "노화", "미용", "피부"],
    ctaUrl: "https://carelink.co.kr/skin",
    icon: "Sparkle",
    color: "#EC4899",
  },
};

// ============================================
// Cheongrium Programs
// ============================================

export interface CheongriumProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  priceNumber: number;
  bookingUrl: string;
  targetElement: ElementType;
  image: string;
  highlights: string[];
}

export const CHEONGRIUM_PROGRAMS: Record<ElementType, CheongriumProgram> = {
  wood: {
    id: "herb_tour",
    name: "사상체질 약초원 투어",
    description: "150여 종의 약초와 함께하는 체질 맞춤 힐링",
    duration: "2시간",
    price: "45,000원",
    priceNumber: 45000,
    bookingUrl: "https://cheongrium.com/booking/herb-tour",
    targetElement: "wood",
    image: "/images/cheongrium/herb-garden.jpg",
    highlights: ["체질별 약초 설명", "약초차 시음", "힐링 산책"],
  },
  fire: {
    id: "tea_ceremony",
    name: "금홍차 다도 체험",
    description: "청리움 고유의 금홍차로 마음을 정화하는 시간",
    duration: "1.5시간",
    price: "35,000원",
    priceNumber: 35000,
    bookingUrl: "https://cheongrium.com/booking/tea-ceremony",
    targetElement: "fire",
    image: "/images/cheongrium/tea-ceremony.jpg",
    highlights: ["금홍차 다도", "차 명상", "다과 제공"],
  },
  earth: {
    id: "meditation_trek",
    name: "보리산 명상 트레킹",
    description: "백토 명당의 기운을 받으며 걷는 명상",
    duration: "3시간",
    price: "55,000원",
    priceNumber: 55000,
    bookingUrl: "https://cheongrium.com/booking/meditation-trek",
    targetElement: "earth",
    image: "/images/cheongrium/meditation-trek.jpg",
    highlights: ["명당 트레킹", "숲 명상", "도시락 제공"],
  },
  metal: {
    id: "tea_blending",
    name: "오하산방 차 블렌딩",
    description: "나만의 차를 직접 만들어보는 체험",
    duration: "2시간",
    price: "65,000원",
    priceNumber: 65000,
    bookingUrl: "https://cheongrium.com/booking/tea-blending",
    targetElement: "metal",
    image: "/images/cheongrium/tea-blending.jpg",
    highlights: ["차 블렌딩 체험", "포장 키트", "시음"],
  },
  water: {
    id: "singing_bowl",
    name: "싱잉볼 명상 클래스",
    description: "소리와 진동으로 내면을 정화하는 명상",
    duration: "1시간",
    price: "40,000원",
    priceNumber: 40000,
    bookingUrl: "https://cheongrium.com/booking/singing-bowl",
    targetElement: "water",
    image: "/images/cheongrium/singing-bowl.jpg",
    highlights: ["싱잉볼 체험", "명상 가이드", "차 제공"],
  },
};

// ============================================
// Cheongrium Products
// ============================================

export interface CheongriumProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNumber: number;
  image: string;
  targetElements: ElementType[];
  purchaseUrl: string;
  tags: string[];
}

export const CHEONGRIUM_PRODUCTS: CheongriumProduct[] = [
  {
    id: "geumhong_tea",
    name: "금홍차 선물세트",
    description: "청리움 고유의 발효차, 깊은 풍미와 건강함",
    price: "58,000원",
    priceNumber: 58000,
    image: "/images/cheongrium/products/geumhong-tea.jpg",
    targetElements: ["fire", "metal"],
    purchaseUrl: "https://cheongrium.com/shop/geumhong-tea",
    tags: ["베스트셀러", "선물용"],
  },
  {
    id: "honey_set",
    name: "보리산 꿀 선물세트",
    description: "청리움 양봉장의 순수한 자연산 꿀",
    price: "45,000원",
    priceNumber: 45000,
    image: "/images/cheongrium/products/honey-set.jpg",
    targetElements: ["earth", "wood"],
    purchaseUrl: "https://cheongrium.com/shop/honey",
    tags: ["건강", "선물용"],
  },
  {
    id: "pine_nut_set",
    name: "잣 선물세트",
    description: "가평 청정지역에서 수확한 프리미엄 잣",
    price: "68,000원",
    priceNumber: 68000,
    image: "/images/cheongrium/products/pine-nut.jpg",
    targetElements: ["water", "metal"],
    purchaseUrl: "https://cheongrium.com/shop/pine-nut",
    tags: ["프리미엄", "건강"],
  },
  {
    id: "herb_tea_blend",
    name: "약초 블렌딩 티",
    description: "체질별 맞춤 약초를 블렌딩한 건강차",
    price: "35,000원",
    priceNumber: 35000,
    image: "/images/cheongrium/products/herb-tea.jpg",
    targetElements: ["wood", "earth"],
    purchaseUrl: "https://cheongrium.com/shop/herb-tea",
    tags: ["체질맞춤", "건강"],
  },
];

// ============================================
// Tea Recommendations by Element Deficiency
// ============================================

export interface TeaRecommendation {
  tea: string;
  benefit: string;
  cheongiumProduct: string;
  color: string;
}

export const TEA_RECOMMENDATIONS: Record<string, TeaRecommendation> = {
  wood_deficiency: {
    tea: "녹차",
    benefit: "목(木) 기운 보충, 간 기능 활성화",
    cheongiumProduct: "청리움 유기농 녹차",
    color: "#22C55E",
  },
  fire_deficiency: {
    tea: "금홍차",
    benefit: "화(火) 기운 보충, 심장 건강, 열정 증가",
    cheongiumProduct: "청리움 금홍차",
    color: "#EF4444",
  },
  earth_deficiency: {
    tea: "보이차",
    benefit: "토(土) 기운 보충, 소화 기능 개선",
    cheongiumProduct: "청리움 숙성 보이차",
    color: "#A16207",
  },
  metal_deficiency: {
    tea: "백차",
    benefit: "금(金) 기운 보충, 폐 건강, 명확한 사고",
    cheongiumProduct: "청리움 백모단",
    color: "#D1D5DB",
  },
  water_deficiency: {
    tea: "흑차",
    benefit: "수(水) 기운 보충, 신장 건강, 지혜 증가",
    cheongiumProduct: "청리움 숙성 흑차",
    color: "#1F2937",
  },
};

// ============================================
// Daily Energy Types
// ============================================

export interface DailyCheongiumEnergy {
  date: string;
  dominantElement: ElementType;
  energyScore: number;
  luckyDirections: string[];
  recommendedActivities: string[];
  message: string;
  cheongiumProgramMatch: {
    program: string;
    reason: string;
    bookingUrl: string;
  };
}

// ============================================
// Health Trigger Keywords
// ============================================

export const HEALTH_TRIGGER_KEYWORDS = [
  // 오행 불균형
  "수(水) 부족",
  "화(火) 과다",
  "토(土) 약함",
  "목(木) 부족",
  "금(金) 과다",
  // 건강 운세
  "건강 주의",
  "체력 관리 필요",
  "면역력 약화",
  "건강에 신경",
  "몸 관리",
  // 장기 관련
  "간 기능",
  "신장 기능",
  "소화기",
  "호흡기",
  "심장",
  // 일반 건강
  "피로",
  "스트레스",
  "수면",
  "휴식 필요",
];

export const STRESS_TRIGGER_KEYWORDS = [
  "스트레스",
  "긴장",
  "불안",
  "마음의 안정",
  "정신적 피로",
  "번아웃",
  "휴식",
  "재충전",
  "내면",
  "명상",
];

export const RELATIONSHIP_TRIGGER_KEYWORDS = [
  "인간관계",
  "대인관계",
  "소통",
  "갈등",
  "화합",
  "인연",
  "관계 개선",
  "사람과의",
];

export const CAREER_TRIGGER_KEYWORDS = [
  "직업운",
  "사업운",
  "승진",
  "이직",
  "성공",
  "도약",
  "기회",
  "발전",
  "성장",
];
