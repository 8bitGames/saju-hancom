/**
 * 관상 분석 타입 정의
 */

export interface FaceAnalysisInput {
  imageBase64: string;
  gender: "male" | "female";
}

export interface FaceFeature {
  name: string;
  koreanName: string;
  score: number; // 0-100
  description: string;
  fortune: string;
}

export interface FaceShape {
  type: FaceShapeType;
  koreanName: string;
  description: string;
  characteristics: string[];
}

export type FaceShapeType =
  | "oval"      // 계란형
  | "round"     // 둥근형
  | "square"    // 사각형
  | "heart"     // 하트형
  | "long"      // 긴 형
  | "diamond";  // 다이아몬드형

export interface ForeheadAnalysis {
  type: "wide" | "narrow" | "high" | "low" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface EyeAnalysis {
  type: "phoenix" | "dragon" | "round" | "almond" | "narrow" | "wide";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface NoseAnalysis {
  type: "straight" | "aquiline" | "button" | "wide" | "pointed" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface MouthAnalysis {
  type: "full" | "thin" | "wide" | "small" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface EarAnalysis {
  type: "large" | "small" | "attached" | "detached" | "balanced";
  koreanName: string;
  score: number;
  description: string;
  fortune: string;
}

export interface FaceReadingResult {
  overallScore: number; // 0-100
  overallGrade: FaceReadingGrade;
  gradeText: string;

  faceShape: FaceShape;

  features: {
    forehead: ForeheadAnalysis;
    eyes: EyeAnalysis;
    nose: NoseAnalysis;
    mouth: MouthAnalysis;
    ears: EarAnalysis;
  };

  fortuneAreas: {
    wealth: { score: number; description: string };      // 재물운
    career: { score: number; description: string };      // 직업운
    relationship: { score: number; description: string }; // 대인관계
    health: { score: number; description: string };       // 건강운
    love: { score: number; description: string };         // 애정운
  };

  strengths: string[];
  advice: string[];
  luckyElements: string[];
}

export type FaceReadingGrade =
  | "excellent"   // 대길
  | "good"        // 길
  | "normal"      // 보통
  | "caution"     // 주의
  | "challenging"; // 노력필요

// ========== 상세 관상 분석 타입 ==========

// 삼정 (三停) 분석 - 얼굴의 3등분
export interface SamjeongAnalysis {
  // 상정 (上停): 이마 ~ 눈썹 - 초년운, 부모운, 지성
  sangjeong: {
    score: number;
    proportion: "large" | "medium" | "small";
    characteristics: string[];
    fortune: string; // 초년운 (0-30세)
    parentalLuck: string; // 부모운
    intelligence: string; // 지적 능력
  };
  // 중정 (中停): 눈썹 ~ 코끝 - 중년운, 사회운, 재물
  jungjeong: {
    score: number;
    proportion: "large" | "medium" | "small";
    characteristics: string[];
    fortune: string; // 중년운 (30-50세)
    socialLuck: string; // 사회적 성공
    wealthLuck: string; // 재물운
  };
  // 하정 (下停): 인중 ~ 턱끝 - 말년운, 자녀운, 건강
  hajeong: {
    score: number;
    proportion: "large" | "medium" | "small";
    characteristics: string[];
    fortune: string; // 말년운 (50세+)
    childrenLuck: string; // 자녀운
    healthLuck: string; // 건강운
  };
  // 삼정 균형
  balance: {
    isBalanced: boolean;
    description: string;
    overallAssessment: string;
  };
}

// 오관 (五官) 상세 분석
export interface DetailedFiveFeatures {
  // 귀 - 채청관 (採聽官): 초년운, 지혜, 수명
  ears: {
    type: "buddha" | "rounded" | "pointed" | "attached" | "protruding" | "balanced";
    koreanName: string;
    score: number;
    size: "large" | "medium" | "small";
    position: "high" | "medium" | "low";
    earlobe: "thick" | "medium" | "thin";
    color: "bright" | "normal" | "dark";
    characteristics: string[];
    fortune: string;
    earlyLifeLuck: string; // 0-15세 운
    wisdomLevel: string;
    longevity: string;
  };
  // 눈썹 - 보수관 (保壽官): 형제운, 감정 조절
  eyebrows: {
    type: "willow" | "sword" | "crescent" | "straight" | "thick" | "thin" | "scattered";
    koreanName: string;
    score: number;
    length: "long" | "medium" | "short";
    thickness: "thick" | "medium" | "thin";
    shape: "arched" | "straight" | "angled";
    spacing: "wide" | "medium" | "narrow";
    characteristics: string[];
    fortune: string;
    siblingLuck: string; // 형제운
    emotionalControl: string;
    friendshipLuck: string;
  };
  // 눈 - 감찰관 (監察官): 현재운, 성격, 지성
  eyes: {
    type: "phoenix" | "dragon" | "tiger" | "peacock" | "round" | "almond" | "narrow" | "wide";
    koreanName: string;
    score: number;
    size: "large" | "medium" | "small";
    brightness: "bright" | "normal" | "dull";
    blackWhiteRatio: "clear" | "normal" | "unclear";
    leftEye: string; // 좌목 - 태양
    rightEye: string; // 우목 - 태음
    characteristics: string[];
    fortune: string;
    currentLuck: string; // 35-40세 운
    personality: string;
    intellect: string;
    marriageLuck: string; // 배우자운
  };
  // 코 - 심판관 (審判官): 재물운, 자존심, 건강
  nose: {
    type: "lion" | "eagle" | "straight" | "fleshy" | "pointed" | "button" | "broad";
    koreanName: string;
    score: number;
    bridge: "high" | "medium" | "low";
    tip: "round" | "pointed" | "upturned" | "downturned";
    nostrils: "visible" | "hidden" | "flared";
    width: "wide" | "medium" | "narrow";
    characteristics: string[];
    fortune: string;
    wealthStorage: string; // 재물 저장능력
    middleAgeLuck: string; // 41-50세 운
    prideLevel: string;
    healthConnection: string;
  };
  // 입 - 출납관 (出納官): 언변, 생활력, 애정
  mouth: {
    type: "cherry" | "crescent" | "wide" | "thin" | "thick" | "balanced";
    koreanName: string;
    score: number;
    size: "large" | "medium" | "small";
    lipThickness: "thick" | "medium" | "thin";
    corners: "upturned" | "straight" | "downturned";
    color: "red" | "pink" | "pale";
    characteristics: string[];
    fortune: string;
    eloquence: string; // 언변
    vitalityLuck: string; // 생활력
    loveLuck: string; // 애정운
    lateLifeLuck: string; // 51-60세 운
  };
}

// 기타 주요 부위
export interface AdditionalFeatures {
  // 인중 (人中)
  philtrum: {
    length: "long" | "medium" | "short";
    clarity: "clear" | "faint" | "absent";
    shape: "straight" | "curved" | "wide";
    score: number;
    description: string;
    childrenFortune: string;
    longevitySign: string;
  };
  // 광대뼈 (顴骨/관골)
  cheekbones: {
    prominence: "prominent" | "moderate" | "flat";
    position: "high" | "medium" | "low";
    score: number;
    description: string;
    powerLuck: string; // 권력운
    socialStatus: string;
  };
  // 턱 (地閣)
  chin: {
    shape: "rounded" | "square" | "pointed" | "receding" | "prominent";
    size: "large" | "medium" | "small";
    score: number;
    description: string;
    lateLifeStability: string;
    subordinateLuck: string; // 부하운/아랫사람운
  };
  // 법령 (法令線)
  nasolabialFolds: {
    presence: "deep" | "moderate" | "faint" | "absent";
    length: "long" | "medium" | "short";
    symmetry: "symmetric" | "asymmetric";
    score: number;
    description: string;
    authorityLuck: string;
    longevity: string;
  };
}

// 오행 얼굴형 상세
export interface FiveElementFaceShape {
  primaryElement: "wood" | "fire" | "earth" | "metal" | "water";
  koreanName: string;
  chineseName: string;
  score: number;
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
  compatibleElements: string[];
  careerSuggestions: string[];
  healthTendencies: string[];
}

// 운세 시기별 분석
export interface FortuneByAge {
  earlyLife: {
    range: "0-15세";
    mainFeature: "귀";
    score: number;
    description: string;
  };
  youth: {
    range: "16-30세";
    mainFeature: "이마";
    score: number;
    description: string;
  };
  earlyMiddle: {
    range: "31-40세";
    mainFeature: "눈썹/눈";
    score: number;
    description: string;
  };
  middleAge: {
    range: "41-50세";
    mainFeature: "코";
    score: number;
    description: string;
  };
  lateMiddle: {
    range: "51-60세";
    mainFeature: "입/인중";
    score: number;
    description: string;
  };
  lateLife: {
    range: "60세 이상";
    mainFeature: "턱/법령";
    score: number;
    description: string;
  };
}

// 상세 관상 분석 결과
export interface DetailedFaceReadingResult extends FaceReadingResult {
  // 삼정 분석
  samjeong: SamjeongAnalysis;

  // 오관 상세 분석
  detailedFeatures: DetailedFiveFeatures;

  // 추가 부위 분석
  additionalFeatures: AdditionalFeatures;

  // 오행 얼굴형
  fiveElementFace: FiveElementFaceShape;

  // 나이별 운세
  fortuneByAge: FortuneByAge;

  // 종합 운세 분석
  comprehensiveFortune: {
    wealthFortune: { score: number; rank: string; description: string };
    careerFortune: { score: number; rank: string; description: string };
    loveFortune: { score: number; rank: string; description: string };
    healthFortune: { score: number; rank: string; description: string };
    socialFortune: { score: number; rank: string; description: string };
    familyFortune: { score: number; rank: string; description: string };
  };

  // 특별한 상 (특이점)
  specialFeatures: Array<{
    feature: string;
    type: "positive" | "negative" | "neutral";
    description: string;
    meaning: string;
  }>;

  // 관상 개선 조언
  improvementAdvice: {
    expression: string[]; // 표정 관리
    makeup?: string[]; // 화장/스타일링 (여성용)
    grooming?: string[]; // 그루밍 (남성용)
    mindset: string[]; // 마음가짐
    lifestyle: string[]; // 생활습관
  };

  // 유명인 닮은꼴 (참고용)
  celebritySimilarity?: {
    name: string;
    similarity: number;
    sharedTraits: string[];
  };

  // 한국 관상학 특수 해석 (중국과 다른 점)
  koreanInterpretation: {
    emphasis: string; // 한국 관상학에서 특히 중요시하는 부분
    culturalContext: string;
    modernApplication: string;
  };
}
