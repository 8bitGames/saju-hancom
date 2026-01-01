/**
 * 사주 분석 파이프라인 Zod 스키마 정의
 * 각 단계별 AI 응답 검증용
 */

import { z } from "zod";

// ============================================================================
// Step 1: 기초 구조 분석 스키마
// ============================================================================

const PillarSchema = z.object({
  stem: z.string().describe("천간 (갑, 을, 병 등)"),
  branch: z.string().describe("지지 (자, 축, 인 등)"),
  stemElement: z.string().describe("천간 오행 (목, 화, 토, 금, 수)"),
  branchElement: z.string().describe("지지 오행"),
  stemKorean: z.string().describe("천간 한글 설명"),
  branchKorean: z.string().describe("지지 한글 설명"),
});

export const Step1Schema = z.object({
  pillars: z.object({
    year: PillarSchema.describe("년주"),
    month: PillarSchema.describe("월주"),
    day: PillarSchema.describe("일주"),
    time: PillarSchema.describe("시주"),
  }),
  elementScores: z.object({
    wood: z.number().min(0).max(100).describe("목 점수"),
    fire: z.number().min(0).max(100).describe("화 점수"),
    earth: z.number().min(0).max(100).describe("토 점수"),
    metal: z.number().min(0).max(100).describe("금 점수"),
    water: z.number().min(0).max(100).describe("수 점수"),
  }),
  dominantElements: z.array(z.string()).describe("강한 오행 목록"),
  lackingElements: z.array(z.string()).describe("부족한 오행 목록"),
  stemRelations: z.array(z.string()).describe("천간 관계 (합, 충 등)"),
  branchRelations: z.array(z.string()).describe("지지 관계 (삼합, 육합, 충 등)"),
  summary: z.string().describe("원국 전체 요약 (2-3문장)"),
});

// ============================================================================
// Step 2: 일간 심층 분석 스키마
// ============================================================================

export const Step2Schema = z.object({
  dayMaster: z.string().describe("일간 (갑, 을, 병 등)"),
  dayMasterKorean: z.string().describe("일간 한글 설명 (예: 갑목 - 큰 나무)"),
  dayMasterElement: z.string().describe("일간 오행"),
  characteristics: z.array(z.string()).describe("일간 핵심 특성 5-7개"),
  personalityDescription: z.string().describe("일간 성격 상세 설명 (3-4문장)"),
  monthlyInfluence: z.enum(["득령", "실령"]).describe("월령 분석"),
  monthlyInfluenceReason: z.string().describe("월령 분석 이유"),
  rootStrength: z.number().min(0).max(100).describe("통근 강도 점수"),
  rootAnalysis: z.string().describe("통근 분석 설명"),
  manifestations: z.array(z.string()).describe("투출된 오행/십성 목록"),
  bodyStrength: z.enum(["신강", "신약", "중화"]).describe("신강/신약 판단"),
  bodyStrengthReason: z.string().describe("신강/신약 판단 이유 (2-3문장)"),
  usefulGod: z.object({
    primary: z.string().describe("용신 (예: 수(水))"),
    primaryElement: z.string().describe("용신 오행"),
    supporting: z.string().describe("희신"),
    supportingElement: z.string().describe("희신 오행"),
    avoiding: z.string().describe("기신"),
    avoidingElement: z.string().describe("기신 오행"),
    reasoning: z.string().describe("용신 선정 이유 (3-4문장)"),
  }),
});

// ============================================================================
// Step 3: 십성 분석 스키마
// ============================================================================

const TenGodDetailSchema = z.object({
  name: z.string().describe("십성명 (영문: 비견, 겁재 등)"),
  koreanName: z.string().describe("십성 한글명과 설명"),
  count: z.number().describe("개수"),
  positions: z.array(z.string()).describe("위치 (년주, 월주 등)"),
  influence: z.string().describe("이 십성의 영향력 설명"),
});

export const Step3Schema = z.object({
  tenGodsDetails: z.array(TenGodDetailSchema).describe("각 십성 상세 정보"),
  tenGodsCounts: z.object({
    비견: z.number().describe("비견 개수"),
    겁재: z.number().describe("겁재 개수"),
    식신: z.number().describe("식신 개수"),
    상관: z.number().describe("상관 개수"),
    편재: z.number().describe("편재 개수"),
    정재: z.number().describe("정재 개수"),
    편관: z.number().describe("편관 개수"),
    정관: z.number().describe("정관 개수"),
    편인: z.number().describe("편인 개수"),
    정인: z.number().describe("정인 개수"),
  }).describe("십성별 개수"),
  dominantGods: z.array(z.string()).describe("주요 십성 목록"),
  structure: z.string().describe("격국 (예: 식신격, 정관격)"),
  structureDescription: z.string().describe("격국 설명"),
  personality: z.object({
    traits: z.array(z.string()).describe("성격 특성 5-7개"),
    strengths: z.array(z.string()).describe("강점 3-5개"),
    weaknesses: z.array(z.string()).describe("약점/개선점 3-4개"),
    description: z.string().describe("성격 종합 설명 (3-4문장)"),
  }),
  careerAptitude: z.object({
    suitableFields: z.array(z.string()).describe("적합한 직업 분야 5-7개"),
    workStyle: z.string().describe("업무 스타일"),
    leadershipStyle: z.string().describe("리더십 스타일"),
    idealEnvironment: z.string().describe("이상적인 근무 환경"),
  }),
  relationshipStyle: z.object({
    socialPattern: z.string().describe("사회적 관계 패턴"),
    communicationStyle: z.string().describe("소통 스타일"),
    loveStyle: z.string().describe("연애/사랑 스타일"),
    familyRole: z.string().describe("가족 내 역할"),
    idealPartnerTraits: z.array(z.string()).describe("이상적인 파트너 특성 3-5개"),
  }),
});

// ============================================================================
// Step 4: 신살 분석 스키마
// ============================================================================

const AuspiciousStarSchema = z.object({
  name: z.string().describe("신살명"),
  koreanName: z.string().describe("한글명과 의미"),
  position: z.string().describe("위치 (년주, 월주 등)"),
  meaning: z.string().describe("의미 설명"),
  influence: z.string().describe("삶에 미치는 영향"),
  howToUse: z.string().describe("활용 방법"),
});

const InauspiciousStarSchema = z.object({
  name: z.string().describe("신살명"),
  koreanName: z.string().describe("한글명과 의미"),
  position: z.string().describe("위치"),
  meaning: z.string().describe("의미 설명"),
  caution: z.string().describe("주의할 점"),
  positiveUse: z.string().describe("긍정적으로 활용하는 방법"),
});

export const Step4Schema = z.object({
  auspiciousStars: z.array(AuspiciousStarSchema).describe("길신 목록"),
  inauspiciousStars: z.array(InauspiciousStarSchema).describe("흉신 목록"),
  overallStarInfluence: z.string().describe("신살 종합 영향력 분석 (3-4문장)"),
  auspiciousStrategy: z.string().describe("길신 활용 전략"),
  inauspiciousStrategy: z.string().describe("흉신 대처 전략"),
});

// ============================================================================
// Step 5: 대운/세운 분석 스키마
// ============================================================================

const MonthlyHighlightSchema = z.object({
  month: z.number().min(1).max(12).describe("월"),
  rating: z.enum(["excellent", "good", "normal", "caution"]).describe("등급"),
  element: z.string().describe("해당 월 오행"),
  description: z.string().describe("월별 운세 설명"),
  focus: z.string().describe("집중해야 할 것"),
  advice: z.string().describe("조언"),
});

export const Step5Schema = z.object({
  currentMajorFortune: z.object({
    period: z.string().describe("대운 기간 (예: 2020-2030)"),
    startAge: z.number().describe("시작 나이"),
    endAge: z.number().describe("끝 나이"),
    stem: z.string().describe("대운 천간"),
    branch: z.string().describe("대운 지지"),
    element: z.string().describe("대운 오행"),
    theme: z.string().describe("대운 테마/주제"),
    influence: z.string().describe("대운의 영향 (3-4문장)"),
    opportunities: z.array(z.string()).describe("기회 요소 3-4개"),
    challenges: z.array(z.string()).describe("도전 과제 2-3개"),
  }),
  nextMajorFortune: z.object({
    period: z.string().describe("다음 대운 기간"),
    theme: z.string().describe("다음 대운 테마"),
    preview: z.string().describe("다음 대운 미리보기"),
  }),
  yearlyFortune: z.object({
    year: z.number().describe("연도"),
    stem: z.string().describe("세운 천간"),
    branch: z.string().describe("세운 지지"),
    element: z.string().describe("세운 오행"),
    interaction: z.string().describe("원국과의 관계 (합, 충 등)"),
    theme: z.string().describe("올해 테마"),
    score: z.number().min(0).max(100).describe("올해 운세 점수"),
    opportunities: z.array(z.string()).describe("기회 요소 3-4개"),
    challenges: z.array(z.string()).describe("도전 과제 2-3개"),
    advice: z.string().describe("올해 종합 조언"),
  }),
  monthlyHighlights: z.array(MonthlyHighlightSchema).describe("주요 월별 포인트 4-6개"),
  timingAdvice: z.object({
    bestMonths: z.array(z.number()).describe("가장 좋은 달 2-3개"),
    cautionMonths: z.array(z.number()).describe("주의할 달 1-2개"),
    overallTimingStrategy: z.string().describe("시기별 전략 조언"),
  }),
});

// ============================================================================
// Step 6: 종합 및 조언 스키마
// ============================================================================

const AreaScoreSchema = z.object({
  score: z.number().min(0).max(100).describe("점수"),
  grade: z.enum(["excellent", "good", "normal", "caution", "challenging"]).describe("등급"),
  summary: z.string().describe("요약 (2-3문장)"),
  keyPoints: z.array(z.string()).describe("핵심 포인트 2-3개"),
});

export const Step6Schema = z.object({
  catchphrase: z.string().describe("캐치프레이즈 - 사주를 한 문장으로 표현 (예: '불꽃처럼 뜨거운 열정의 소유자', '고요한 바다 같은 깊은 지혜의 사람')"),
  tags: z.array(z.string()).min(3).max(5).describe("성격/특성 태그 3-5개 (예: ['리더십', '창의성', '도전정신', '감성적', '분석력'])"),
  overallScore: z.number().min(0).max(100).describe("종합 점수"),
  overallGrade: z.enum(["excellent", "good", "normal", "caution", "challenging"]).describe("종합 등급"),
  gradeText: z.string().describe("등급 텍스트 (대길, 길, 보통 등)"),
  summary: z.string().describe("종합 요약 (3-4문장)"),
  areas: z.object({
    personality: AreaScoreSchema.describe("성격 영역"),
    career: AreaScoreSchema.describe("직업 영역"),
    wealth: AreaScoreSchema.describe("재물 영역"),
    relationship: AreaScoreSchema.describe("대인관계 영역"),
    health: AreaScoreSchema.describe("건강 영역"),
  }),
  keyInsights: z.array(z.string()).describe("핵심 인사이트 4-5개"),
  topStrengths: z.array(z.string()).describe("가장 큰 강점 3-4개"),
  areasToWatch: z.array(z.string()).describe("주의해야 할 점 2-3개"),
  advice: z.object({
    immediate: z.array(z.string()).describe("즉시 실천할 수 있는 조언 2-3개"),
    shortTerm: z.array(z.string()).describe("1-3개월 내 조언 2-3개"),
    longTerm: z.array(z.string()).describe("장기 조언 2-3개"),
  }),
  luckyElements: z.object({
    colors: z.array(z.string()).describe("행운의 색상 2-3개"),
    numbers: z.array(z.number()).describe("행운의 숫자 2-3개"),
    directions: z.array(z.string()).describe("길한 방향 1-2개"),
    activities: z.array(z.string()).describe("행운을 부르는 활동 3-4개"),
    seasons: z.array(z.string()).describe("좋은 계절 1-2개"),
  }),
  oneLineMessage: z.string().describe("한줄 운세 메시지 (격언 스타일)"),
});

// ============================================================================
// 타입 추론
// ============================================================================

export type Step1Result = z.infer<typeof Step1Schema>;
export type Step2Result = z.infer<typeof Step2Schema>;
export type Step3Result = z.infer<typeof Step3Schema>;
export type Step4Result = z.infer<typeof Step4Schema>;
export type Step5Result = z.infer<typeof Step5Schema>;
export type Step6Result = z.infer<typeof Step6Schema>;
