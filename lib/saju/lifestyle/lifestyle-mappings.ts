/**
 * 오행(Five Elements) → 라이프스타일 매핑 데이터
 * 행운의 색상, 음식, 방향, 활동 등 일상 운세 요소
 */

import type { Element } from "../types";

// ============================================================================
// 타입 정의
// ============================================================================

export interface LuckyColor {
  name: string;
  hex: string;
  meaning: string;
}

export interface LuckyFood {
  name: string;
  category: string;
  benefit: string;
}

export interface LuckyDirection {
  name: string;
  degree: number;
  meaning: string;
}

export interface LuckyNumber {
  primary: number[];
  description: string;
}

// ============================================================================
// 오행별 행운의 색상 (Lucky Colors)
// ============================================================================

export const ELEMENT_COLORS: Record<Element, LuckyColor[]> = {
  wood: [
    { name: "초록색", hex: "#22C55E", meaning: "성장과 새로운 시작" },
    { name: "청록색", hex: "#06B6D4", meaning: "창의력과 영감" },
    { name: "연두색", hex: "#84CC16", meaning: "활력과 건강" },
    { name: "올리브", hex: "#65A30D", meaning: "안정과 균형" },
  ],
  fire: [
    { name: "빨간색", hex: "#EF4444", meaning: "열정과 성공" },
    { name: "주황색", hex: "#F97316", meaning: "자신감과 에너지" },
    { name: "분홍색", hex: "#EC4899", meaning: "사랑과 행복" },
    { name: "자주색", hex: "#BE185D", meaning: "명예와 권위" },
  ],
  earth: [
    { name: "노란색", hex: "#EAB308", meaning: "안정과 신뢰" },
    { name: "베이지", hex: "#D4A574", meaning: "조화와 균형" },
    { name: "갈색", hex: "#92400E", meaning: "든든함과 실용성" },
    { name: "황토색", hex: "#CA8A04", meaning: "풍요와 결실" },
  ],
  metal: [
    { name: "흰색", hex: "#F8FAFC", meaning: "정돈과 명확함" },
    { name: "은색", hex: "#CBD5E1", meaning: "우아함과 품격" },
    { name: "금색", hex: "#FCD34D", meaning: "부와 성취" },
    { name: "회색", hex: "#9CA3AF", meaning: "중립과 균형" },
  ],
  water: [
    { name: "검정색", hex: "#1E293B", meaning: "지혜와 깊이" },
    { name: "남색", hex: "#1E3A8A", meaning: "직관과 통찰" },
    { name: "보라색", hex: "#7C3AED", meaning: "영성과 변화" },
    { name: "짙은 파랑", hex: "#1D4ED8", meaning: "안정과 신뢰" },
  ],
};

// ============================================================================
// 오행별 행운의 음식 (Lucky Foods)
// ============================================================================

export const ELEMENT_FOODS: Record<Element, LuckyFood[]> = {
  wood: [
    { name: "시금치", category: "녹색채소", benefit: "간 기능 강화" },
    { name: "브로콜리", category: "녹색채소", benefit: "해독 효과" },
    { name: "녹차", category: "음료", benefit: "정신 맑게" },
    { name: "아보카도", category: "과일", benefit: "활력 증진" },
    { name: "상추", category: "녹색채소", benefit: "마음 안정" },
    { name: "청포도", category: "과일", benefit: "피로 회복" },
    { name: "케일", category: "녹색채소", benefit: "면역력 강화" },
    { name: "오이", category: "채소", benefit: "수분 보충" },
  ],
  fire: [
    { name: "고추", category: "향신료", benefit: "혈액순환 촉진" },
    { name: "토마토", category: "채소", benefit: "심장 건강" },
    { name: "자몽", category: "과일", benefit: "에너지 충전" },
    { name: "파프리카", category: "채소", benefit: "면역력 강화" },
    { name: "수박", category: "과일", benefit: "열기 해소" },
    { name: "딸기", category: "과일", benefit: "활력 증진" },
    { name: "양고기", category: "육류", benefit: "기력 보충" },
    { name: "대추", category: "건과류", benefit: "마음 안정" },
  ],
  earth: [
    { name: "현미", category: "곡물", benefit: "소화 기능 개선" },
    { name: "고구마", category: "뿌리채소", benefit: "기력 보충" },
    { name: "호박", category: "채소", benefit: "안정감 향상" },
    { name: "바나나", category: "과일", benefit: "에너지 공급" },
    { name: "감자", category: "뿌리채소", benefit: "포만감과 안정" },
    { name: "옥수수", category: "곡물", benefit: "기운 충전" },
    { name: "당근", category: "뿌리채소", benefit: "눈 건강" },
    { name: "단호박", category: "채소", benefit: "피부 건강" },
  ],
  metal: [
    { name: "배", category: "과일", benefit: "폐 기능 보호" },
    { name: "무", category: "뿌리채소", benefit: "호흡기 건강" },
    { name: "생강", category: "향신료", benefit: "면역력 강화" },
    { name: "양파", category: "채소", benefit: "해독과 정화" },
    { name: "마늘", category: "향신료", benefit: "살균 효과" },
    { name: "도라지", category: "뿌리채소", benefit: "기관지 건강" },
    { name: "연근", category: "뿌리채소", benefit: "지구력 향상" },
    { name: "더덕", category: "뿌리채소", benefit: "폐 기능 강화" },
  ],
  water: [
    { name: "검은콩", category: "콩류", benefit: "신장 기능 강화" },
    { name: "미역", category: "해조류", benefit: "혈액 정화" },
    { name: "블루베리", category: "과일", benefit: "뇌 기능 향상" },
    { name: "흑미", category: "곡물", benefit: "체력 보강" },
    { name: "해삼", category: "해산물", benefit: "정력 강화" },
    { name: "굴", category: "해산물", benefit: "영양 보충" },
    { name: "다시마", category: "해조류", benefit: "노폐물 배출" },
    { name: "포도", category: "과일", benefit: "피로 해소" },
  ],
};

// ============================================================================
// 오행별 행운의 방향 (Lucky Directions)
// ============================================================================

export const ELEMENT_DIRECTIONS: Record<Element, LuckyDirection> = {
  wood: { name: "동쪽", degree: 90, meaning: "새로운 시작에 유리" },
  fire: { name: "남쪽", degree: 180, meaning: "사업과 명예에 유리" },
  earth: { name: "중앙", degree: 0, meaning: "안정과 조화에 유리" },
  metal: { name: "서쪽", degree: 270, meaning: "결실과 수확에 유리" },
  water: { name: "북쪽", degree: 360, meaning: "지혜와 재물에 유리" },
};

// ============================================================================
// 오행별 행운의 숫자 (Lucky Numbers)
// ============================================================================

export const ELEMENT_NUMBERS: Record<Element, LuckyNumber> = {
  wood: { primary: [3, 8], description: "성장과 발전을 상징하는 숫자" },
  fire: { primary: [2, 7], description: "열정과 성공을 상징하는 숫자" },
  earth: { primary: [5, 10], description: "안정과 중심을 상징하는 숫자" },
  metal: { primary: [4, 9], description: "결단과 성취를 상징하는 숫자" },
  water: { primary: [1, 6], description: "지혜와 유연성을 상징하는 숫자" },
};

// ============================================================================
// 오행별 추천 활동 (Recommended Activities)
// ============================================================================

export const ELEMENT_ACTIVITIES: Record<Element, string[]> = {
  wood: [
    "독서",
    "공부",
    "창작 활동",
    "식물 가꾸기",
    "등산",
    "산책",
    "새로운 것 배우기",
    "계획 세우기",
    "아이디어 회의",
    "목공예",
  ],
  fire: [
    "운동",
    "발표",
    "미팅",
    "파티 참석",
    "공연 관람",
    "사진 촬영",
    "요리",
    "사교 활동",
    "프레젠테이션",
    "네트워킹",
  ],
  earth: [
    "요리",
    "정리정돈",
    "계획 세우기",
    "명상",
    "휴식",
    "집안일",
    "재정 관리",
    "부동산 관련",
    "농사 관련",
    "가족 모임",
  ],
  metal: [
    "서류 작업",
    "계약 체결",
    "재정 관리",
    "청소",
    "결단",
    "정리",
    "마무리 작업",
    "협상",
    "품질 검사",
    "결제 관련",
  ],
  water: [
    "여행",
    "수영",
    "예술 감상",
    "일기 쓰기",
    "상담",
    "명상",
    "연구 활동",
    "통찰력 필요 업무",
    "창의적 사고",
    "음악 감상",
  ],
};

// ============================================================================
// 오행별 피해야 할 활동 (Activities to Avoid)
// ============================================================================

export const ELEMENT_AVOID_ACTIVITIES: Record<Element, string[]> = {
  wood: ["과도한 음주", "감정적 대응", "성급한 결정", "무리한 운동"],
  fire: ["분쟁", "과격한 행동", "무모한 도전", "과소비"],
  earth: ["급격한 변화", "모험적 투자", "장거리 여행", "불확실한 계약"],
  metal: ["감정적 결정", "새로운 시작", "무리한 약속", "과도한 비판"],
  water: ["과도한 활동", "중요한 계약", "공개적 발언", "재정 낭비"],
};

// ============================================================================
// 오행 상생/상극 관계 (Element Relations)
// ============================================================================

/** 상생 관계: A가 B를 생함 */
export const ELEMENT_GENERATES: Record<Element, Element> = {
  wood: "fire",   // 목생화
  fire: "earth",  // 화생토
  earth: "metal", // 토생금
  metal: "water", // 금생수
  water: "wood",  // 수생목
};

/** 상극 관계: A가 B를 극함 */
export const ELEMENT_CONTROLS: Record<Element, Element> = {
  wood: "earth", // 목극토
  fire: "metal", // 화극금
  earth: "water",// 토극수
  metal: "wood", // 금극목
  water: "fire", // 수극화
};

/** 피생 관계: A를 생해주는 오행 */
export const ELEMENT_GENERATED_BY: Record<Element, Element> = {
  wood: "water", // 수생목
  fire: "wood",  // 목생화
  earth: "fire", // 화생토
  metal: "earth",// 토생금
  water: "metal",// 금생수
};

/** 피극 관계: A를 극하는 오행 */
export const ELEMENT_CONTROLLED_BY: Record<Element, Element> = {
  wood: "metal", // 금극목
  fire: "water", // 수극화
  earth: "wood", // 목극토
  metal: "fire", // 화극금
  water: "earth",// 토극수
};

// ============================================================================
// 한글 변환
// ============================================================================

export const ELEMENT_KOREAN: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

export const ELEMENT_KOREAN_SHORT: Record<Element, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};
