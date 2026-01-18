# 청기운 앱 기능 제안서: 청리움 에너지 기반 사주 분석 및 한컴 제품 연동

## 문서 개요

- **작성일**: 2025년 1월 19일
- **버전**: 1.0
- **목적**: 청리움의 풍수 에너지를 사주 분석의 핵심 기반으로 활용하고, 한컴 그룹 자회사 제품을 자연스럽게 연동하는 기능 제안

---

## 1. 핵심 컨셉: "청리움 에너지 기반 운세 시스템"

### 1.1 기본 철학

청기운 앱의 모든 운세/사주 분석은 **청리움의 풍수 에너지**를 기반으로 합니다:

- 청리움은 보리산 자락의 **백토(白土)** 명당에 위치
- 김진명 소설 "풍수전쟁"에서 소개된 실제 명당 터
- 오행(五行)에 기반한 5개의 성지(Sacred Places)와 수호신 연결
- 실제 운영 중인 시설: 오하산방(茶房), 약초원(150+ 종), 싱잉볼 명상 등

### 1.2 차별화 포인트

| 기존 사주 앱 | 청기운 앱 |
|------------|----------|
| 추상적인 운세 해석 | 청리움 에너지 기반 구체적 조언 |
| 일방적 정보 전달 | 실제 체험 가능한 O2O 연결 |
| 단순 콘텐츠 소비 | 한컴 생태계 내 맞춤형 서비스 추천 |
| 범용적 해석 | 사용자 맞춤 제품/서비스 연동 |

---

## 2. 청리움 에너지 시스템 설계

### 2.1 오행-청리움 성지 매핑 (기존 구현)

```typescript
// lib/constants/sacred-places.ts 기반
const SACRED_PLACES = {
  wood: {
    name: "녹차밭",
    guardian: "청룡",
    energy: "성장, 창의력, 새로운 시작",
    cheongrium_location: "약초원 내 녹차 구역"
  },
  fire: {
    name: "용소",
    guardian: "주작",
    energy: "열정, 인간관계, 명예",
    cheongrium_location: "계곡 폭포 인근"
  },
  earth: {
    name: "약초원",
    guardian: "황룡",
    energy: "안정, 건강, 재물",
    cheongrium_location: "사상체질 약초원"
  },
  metal: {
    name: "오하산방",
    guardian: "백호",
    energy: "결단력, 정리, 명확함",
    cheongrium_location: "금홍차 다도 체험관"
  },
  water: {
    name: "명당 기도터",
    guardian: "현무",
    energy: "지혜, 직관, 내면 탐구",
    cheongrium_location: "싱잉볼 명상 공간"
  }
};
```

### 2.2 일일 에너지 시스템 (신규)

**오늘의 청리움 에너지 지수** - 매일 변화하는 풍수 에너지를 수치화:

```typescript
interface DailyCheongiumEnergy {
  date: string;
  dominantElement: ElementType;        // 오늘의 지배 오행
  energyScore: number;                  // 0-100 에너지 지수
  luckyDirections: string[];            // 길방
  recommendedActivities: string[];      // 추천 활동
  cheongiumProgramMatch: {              // 청리움 프로그램 매칭
    program: string;
    reason: string;
    bookingUrl: string;
  };
}
```

**화면 표시 예시**:
```
┌─────────────────────────────────────┐
│  오늘의 청리움 에너지               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  🌿 목(木) 기운 우세 | 에너지 85점   │
│                                      │
│  "성장과 새로운 시작의 기운이        │
│   청리움에서 흘러나오고 있습니다"    │
│                                      │
│  📍 추천 성지: 녹차밭                │
│  🐉 수호신: 청룡                     │
│  ⏰ 길시(吉時): 오전 9시 ~ 11시      │
│                                      │
│  [청리움 녹차밭 체험 예약하기 →]     │
└─────────────────────────────────────┘
```

---

## 3. 사주 분석 결과 기반 제품 추천 시스템

### 3.1 핵심 매커니즘

사주 분석 6단계 파이프라인의 **최종 종합(Synthesis) 단계**에서 사용자의 사주 특성에 맞는 제품/서비스를 자동 추천:

```typescript
interface SajuRecommendationEngine {
  // 사주 분석 결과에서 추출한 키워드
  healthIndicators: string[];      // 건강 관련 지표
  careerIndicators: string[];      // 직업/재물 관련 지표
  relationshipIndicators: string[];// 인간관계 지표
  mindIndicators: string[];        // 정신/스트레스 지표

  // 추천 생성
  generateRecommendations(): Recommendation[];
}
```

### 3.2 한컴 그룹 제품 연동 매트릭스

| 사주 분석 결과 키워드 | 추천 제품/서비스 | 연동 회사 | 추천 메시지 예시 |
|---------------------|-----------------|----------|----------------|
| **건강 주의** | 케어링크 유전자 검사 | 한컴케어링크 | "사주에서 건강 관리의 중요성이 보입니다. 유전자 검사로 선제적 건강 관리를 시작해보세요" |
| **소화기 약함** | 케어링크 장내 미생물 검사 | 한컴케어링크 | "장 건강이 운세에 영향을 줄 수 있어요. 장내 환경을 체크해보세요" |
| **스트레스 과다** | 청리움 싱잉볼 명상 | 청리움 | "내면의 평화가 필요한 시기입니다. 싱잉볼 명상으로 기운을 정화해보세요" |
| **재물운 상승기** | 한컴 금융 서비스 | 한컴그룹 | "재물운이 상승하는 시기입니다. 체계적인 재테크를 시작해보세요" |
| **학습/성장 필요** | 한글과컴퓨터 교육 서비스 | 한컴에듀케이션 | "지식 확장의 시기입니다. 새로운 스킬을 배워보세요" |
| **인간관계 갈등** | 청리움 다도 체험 | 청리움 | "관계의 조율이 필요합니다. 차 한잔의 여유로 마음을 정리해보세요" |
| **결단력 필요** | 청리움 오하산방 | 청리움 | "백호의 기운이 필요합니다. 오하산방에서 명확한 결단의 에너지를 받으세요" |
| **체질 불균형** | 사상체질 약초원 투어 | 청리움 | "체질에 맞는 약초로 기운의 균형을 맞춰보세요" |

### 3.3 케어링크 연동 상세 설계

#### 3.3.1 건강 관련 사주 분석 트리거

```typescript
// 사주에서 건강 관련 키워드 감지
const HEALTH_TRIGGER_KEYWORDS = [
  // 오행 불균형
  "수(水) 부족", "화(火) 과다", "토(土) 약함",
  // 건강 운세
  "건강 주의", "체력 관리 필요", "면역력 약화 시기",
  // 장기 관련
  "간 기능", "신장 기능", "소화기", "호흡기",
  // 일반 건강
  "피로", "스트레스", "수면 문제"
];

function detectHealthRecommendation(sajuResult: SajuAnalysisResult): boolean {
  return HEALTH_TRIGGER_KEYWORDS.some(keyword =>
    sajuResult.synthesis.includes(keyword)
  );
}
```

#### 3.3.2 케어링크 제품 매핑

```typescript
const CARELINK_PRODUCTS = {
  genetic_comprehensive: {
    name: "종합 유전자 검사",
    description: "350+ 항목 유전자 분석",
    price: "299,000원",
    targetKeywords: ["건강 주의", "체질 분석", "선제적 관리"],
    ctaUrl: "https://carelink.co.kr/genetic-test"
  },
  gut_microbiome: {
    name: "장내 미생물 검사",
    description: "장 건강 및 면역력 분석",
    price: "149,000원",
    targetKeywords: ["소화기 약함", "면역력", "장 건강"],
    ctaUrl: "https://carelink.co.kr/microbiome"
  },
  nutrition_genetic: {
    name: "맞춤 영양 유전자 검사",
    description: "개인 맞춤 영양 가이드",
    price: "199,000원",
    targetKeywords: ["영양 불균형", "피로", "체력 관리"],
    ctaUrl: "https://carelink.co.kr/nutrition"
  },
  skin_genetic: {
    name: "피부 유전자 검사",
    description: "피부 타입 및 노화 분석",
    price: "129,000원",
    targetKeywords: ["외모운", "피부 관리", "노화"],
    ctaUrl: "https://carelink.co.kr/skin"
  }
};
```

#### 3.3.3 UI 컴포넌트 예시

```tsx
// components/saju/CarelinkRecommendation.tsx
function CarelinkRecommendation({ sajuResult, element }: Props) {
  const recommendation = getCarelinkRecommendation(sajuResult);

  if (!recommendation) return null;

  return (
    <motion.div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <Dna className="w-6 h-6 text-emerald-600" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              건강 추천
            </span>
          </div>

          <h3 className="font-bold text-gray-800 mb-1">
            {recommendation.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3">
            {recommendation.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-700">
              {recommendation.productName}
            </span>
            <Link href={recommendation.ctaUrl} target="_blank">
              <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                자세히 보기
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 청리움 연결 메시지 */}
      <div className="mt-4 pt-4 border-t border-emerald-100">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Sparkle className="w-3 h-3" />
          청리움의 {GUARDIANS[element].name[locale]} 수호신이 당신의 건강을 응원합니다
        </p>
      </div>
    </motion.div>
  );
}
```

---

## 4. 청리움 O2O 전환 시스템

### 4.1 사주 결과 → 청리움 프로그램 매칭

```typescript
const CHEONGRIUM_PROGRAM_MATCHING = {
  // 오행 기반 매칭
  wood: {
    program: "사상체질 약초원 투어",
    description: "150여 종의 약초와 함께하는 체질 맞춤 힐링",
    duration: "2시간",
    price: "45,000원",
    bookingUrl: "https://cheongrium.com/booking/herb-tour"
  },
  fire: {
    program: "금홍차 다도 체험",
    description: "청리움 고유의 금홍차로 마음을 정화하는 시간",
    duration: "1.5시간",
    price: "35,000원",
    bookingUrl: "https://cheongrium.com/booking/tea-ceremony"
  },
  earth: {
    program: "보리산 명상 트레킹",
    description: "백토 명당의 기운을 받으며 걷는 명상",
    duration: "3시간",
    price: "55,000원",
    bookingUrl: "https://cheongrium.com/booking/meditation-trek"
  },
  metal: {
    program: "오하산방 차 블렌딩",
    description: "나만의 차를 직접 만들어보는 체험",
    duration: "2시간",
    price: "65,000원",
    bookingUrl: "https://cheongrium.com/booking/tea-blending"
  },
  water: {
    program: "싱잉볼 명상 클래스",
    description: "소리와 진동으로 내면을 정화하는 명상",
    duration: "1시간",
    price: "40,000원",
    bookingUrl: "https://cheongrium.com/booking/singing-bowl"
  }
};
```

### 4.2 프로그램 추천 카드 UI

```tsx
// components/cheongrium/ProgramRecommendation.tsx
function ProgramRecommendation({ element, sajuResult }: Props) {
  const program = CHEONGRIUM_PROGRAM_MATCHING[element];
  const guardian = GUARDIANS[element];

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Header with guardian */}
      <div
        className="p-4"
        style={{ backgroundColor: `${guardian.color}15` }}
      >
        <div className="flex items-center gap-3">
          <Image
            src={guardian.imagePath}
            alt={guardian.name.ko}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <p className="text-xs text-gray-500">
              {guardian.name.ko}의 추천
            </p>
            <h3 className="font-bold text-gray-800">
              {program.program}
            </h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">
          {program.description}
        </p>

        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            {program.duration}
          </span>
          <span className="font-bold text-gray-800">
            {program.price}
          </span>
        </div>

        <Link href={program.bookingUrl} target="_blank">
          <button className="w-full py-3 bg-[#0E4168] text-white font-medium rounded-xl hover:bg-[#0E4168]/90 transition-colors">
            청리움 예약하기
          </button>
        </Link>
      </div>

      {/* Footer message */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          📍 경기도 가평군 청리움 | 서울에서 1시간
        </p>
      </div>
    </div>
  );
}
```

### 4.3 청리움 제품 추천 (Gift Shop 연동)

```typescript
const CHEONGRIUM_PRODUCTS = {
  geumhong_tea: {
    name: "금홍차 선물세트",
    description: "청리움 고유의 발효차",
    price: "58,000원",
    image: "/images/products/geumhong-tea.jpg",
    targetElements: ["fire", "metal"],
    purchaseUrl: "https://cheongrium.com/shop/geumhong-tea"
  },
  honey_set: {
    name: "보리산 꿀 선물세트",
    description: "청리움 양봉장의 자연산 꿀",
    price: "45,000원",
    image: "/images/products/honey-set.jpg",
    targetElements: ["earth", "wood"],
    purchaseUrl: "https://cheongrium.com/shop/honey"
  },
  pine_nut_set: {
    name: "잣 선물세트",
    description: "가평 청정지역 잣",
    price: "68,000원",
    image: "/images/products/pine-nut.jpg",
    targetElements: ["water", "metal"],
    purchaseUrl: "https://cheongrium.com/shop/pine-nut"
  },
  herb_tea_blend: {
    name: "약초 블렌딩 티",
    description: "체질별 맞춤 약초차",
    price: "35,000원",
    image: "/images/products/herb-tea.jpg",
    targetElements: ["wood", "earth"],
    purchaseUrl: "https://cheongrium.com/shop/herb-tea"
  }
};
```

---

## 5. 신규 기능 상세 설계

### 5.1 "청리움 에너지 리포트" (신규)

사주 분석 완료 후 제공되는 개인 맞춤 리포트:

```typescript
interface CheongiumEnergyReport {
  // 기본 정보
  userName: string;
  birthInfo: BirthInfo;
  analysisDate: Date;

  // 에너지 분석
  dominantElement: ElementType;
  guardian: Guardian;
  energyBalance: {
    wood: number;  // 0-100
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };

  // 청리움 매칭
  matchedSacredPlace: SacredPlace;
  recommendedPrograms: CheongriumProgram[];

  // 한컴 제품 추천
  hancomRecommendations: {
    carelink?: CarelinkProduct[];
    education?: EducationProduct[];
    financial?: FinancialProduct[];
  };

  // 행운 아이템
  luckyItems: {
    number: number;
    color: { name: string; hex: string };
    direction: string;
    time: string;
    tea: string;        // 청리움 차 추천
    herb: string;       // 약초원 약초 추천
  };
}
```

### 5.2 "수호신과의 대화" 기능 강화

현재 음성 채팅 기능을 수호신 캐릭터와 연결:

```typescript
// 수호신 음성 페르소나
const GUARDIAN_VOICE_PERSONAS = {
  wood: {
    guardian: "청룡",
    voiceStyle: "따뜻하고 격려하는 목소리",
    greetingPrompt: "안녕하세요, 저는 청리움 녹차밭을 지키는 청룡입니다. 새로운 시작과 성장의 기운을 전해드릴게요.",
    recommendationTriggers: {
      health: "건강한 성장을 위해 케어링크 유전자 검사를 추천드려요",
      stress: "청리움 약초원에서 체질에 맞는 힐링을 경험해보세요"
    }
  },
  fire: {
    guardian: "주작",
    voiceStyle: "열정적이고 활기찬 목소리",
    greetingPrompt: "반갑습니다! 저는 청리움 용소를 지키는 주작이에요. 열정과 인연의 기운을 나눠드릴게요.",
    recommendationTriggers: {
      relationship: "소중한 인연을 위해 청리움 다도 체험을 추천드려요",
      career: "성공적인 도약을 위한 에너지를 청리움에서 받아가세요"
    }
  },
  // ... 나머지 수호신
};
```

### 5.3 "맞춤형 차(茶) 추천" 시스템

사주 오행 분석 결과에 따른 차 추천:

```typescript
const TEA_RECOMMENDATIONS = {
  // 오행 부족 보완 차
  wood_deficiency: {
    tea: "녹차 (청리움 녹차밭)",
    benefit: "목(木) 기운 보충, 간 기능 활성화",
    cheongiumProduct: "청리움 유기농 녹차"
  },
  fire_deficiency: {
    tea: "홍차 (금홍차)",
    benefit: "화(火) 기운 보충, 심장 건강, 열정 증가",
    cheongiumProduct: "청리움 금홍차"
  },
  earth_deficiency: {
    tea: "보이차",
    benefit: "토(土) 기운 보충, 소화 기능 개선",
    cheongiumProduct: "청리움 숙성 보이차"
  },
  metal_deficiency: {
    tea: "백차",
    benefit: "금(金) 기운 보충, 폐 건강, 명확한 사고",
    cheongiumProduct: "청리움 백모단"
  },
  water_deficiency: {
    tea: "흑차",
    benefit: "수(水) 기운 보충, 신장 건강, 지혜 증가",
    cheongiumProduct: "청리움 숙성 흑차"
  }
};
```

### 5.4 "계절 운세" 기능 (신규)

계절별 청리움 에너지와 연동된 운세:

```typescript
const SEASONAL_FORTUNE = {
  spring: {
    dominantElement: "wood",
    cheongiumHighlight: "약초원 새싹 투어",
    specialProgram: "봄 기운 충전 명상",
    hancomTieIn: "새해 목표 달성을 위한 한글 플래너 앱"
  },
  summer: {
    dominantElement: "fire",
    cheongiumHighlight: "용소 계곡 힐링",
    specialProgram: "여름 싱잉볼 선셋 명상",
    hancomTieIn: "케어링크 자외선 피부 유전자 검사"
  },
  autumn: {
    dominantElement: "metal",
    cheongiumHighlight: "오하산방 단풍차",
    specialProgram: "가을 다도 명상",
    hancomTieIn: "한컴오피스 정리의 계절 프로모션"
  },
  winter: {
    dominantElement: "water",
    cheongiumHighlight: "명당 기도터 동지 명상",
    specialProgram: "겨울 내면 성찰 프로그램",
    hancomTieIn: "케어링크 면역력 유전자 검사"
  }
};
```

---

## 6. 구현 우선순위 및 로드맵

### Phase 1: 즉시 구현 (1-2주)

| 기능 | 설명 | 난이도 |
|-----|------|-------|
| 사주 결과 → 케어링크 추천 | 건강 키워드 감지 시 케어링크 배너 표시 | ★★☆ |
| 청리움 프로그램 추천 카드 | 오행에 맞는 청리움 프로그램 추천 | ★★☆ |
| 일일 청리움 에너지 지수 | 홈 화면에 오늘의 에너지 표시 | ★☆☆ |

### Phase 2: 단기 구현 (3-4주)

| 기능 | 설명 | 난이도 |
|-----|------|-------|
| 맞춤 차 추천 시스템 | 사주 결과 기반 차 추천 | ★★☆ |
| 청리움 제품 쇼핑 연동 | 기프트샵 제품 추천 및 구매 링크 | ★★★ |
| 수호신 음성 페르소나 | 음성 채팅에 수호신 캐릭터 적용 | ★★★ |

### Phase 3: 중기 구현 (1-2개월)

| 기능 | 설명 | 난이도 |
|-----|------|-------|
| 청리움 에너지 리포트 PDF | 개인 맞춤 리포트 생성 및 다운로드 | ★★★ |
| 계절 운세 콘텐츠 | 계절별 특화 운세 및 프로그램 | ★★☆ |
| 청리움 예약 API 연동 | 앱 내 직접 예약 기능 | ★★★★ |

### Phase 4: 장기 구현 (3개월+)

| 기능 | 설명 | 난이도 |
|-----|------|-------|
| 한컴 생태계 통합 로그인 | 한컴 SSO 연동 | ★★★★ |
| AR 청리움 투어 | 앱에서 가상으로 청리움 체험 | ★★★★★ |
| 케어링크 결과 연동 | 유전자 검사 결과 → 사주 분석 반영 | ★★★★ |

---

## 7. 비즈니스 모델 및 수익 구조

### 7.1 수익 모델

```
┌─────────────────────────────────────────────────────────────┐
│                     청기운 수익 구조                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [앱 내 직접 수익]                                           │
│  ├── 프리미엄 구독: ₩9,900/월                                │
│  ├── 상세 분석 리포트: ₩5,900/건                            │
│  └── 궁합/관상 등 추가 서비스: ₩2,900~₩9,900                │
│                                                              │
│  [한컴 그룹 연계 수익]                                       │
│  ├── 케어링크 제휴 수수료: 10-15%                           │
│  ├── 청리움 예약 제휴 수수료: 5-10%                         │
│  ├── 청리움 제품 판매 수수료: 10-20%                        │
│  └── 한컴 서비스 연계 수수료: 협의                          │
│                                                              │
│  [마케팅/광고 수익]                                          │
│  ├── 네이티브 광고 (청리움, 케어링크)                       │
│  └── 제휴 프로모션                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 전환율 예상

| 퍼널 단계 | 예상 전환율 | 비고 |
|----------|-----------|------|
| 앱 사용자 → 사주 분석 | 60% | 핵심 기능 |
| 사주 분석 → 추천 클릭 | 15-20% | 관련성 높은 추천 시 |
| 추천 클릭 → 케어링크 전환 | 3-5% | 건강 관심 사용자 |
| 추천 클릭 → 청리움 예약 | 1-3% | 오프라인 전환 |
| 무료 → 프리미엄 전환 | 5-8% | 업계 평균 |

---

## 8. 마케팅 시너지

### 8.1 청리움 방문객 → 앱 사용자 전환

```
┌────────────────────────────────────────────────────────┐
│  청리움 현장 QR 코드 설치                               │
│                                                         │
│  "오늘 청리움의 에너지를 받으셨습니다!                  │
│   앱으로 나만의 수호신을 만나보세요"                    │
│                                                         │
│  [QR 코드] → 앱 다운로드 + 청리움 특별 프로모션        │
│                                                         │
│  혜택: 청리움 방문 인증 시 프리미엄 1주일 무료         │
└────────────────────────────────────────────────────────┘
```

### 8.2 케어링크 연계 프로모션

```
"청기운 앱 사용자 전용 케어링크 할인"

- 유전자 검사 20% 할인
- 사주 분석 결과 기반 맞춤 검사 추천
- 검사 결과 → 앱 연동하여 운세에 반영
```

### 8.3 콘텐츠 마케팅

```
"청리움의 풍수 이야기" 시리즈

1. 김진명 작가의 '풍수전쟁'과 청리움
2. 백토 명당의 비밀
3. 오방신과 청리움 5대 성지
4. 사상체질과 약초원
5. 금홍차의 탄생 스토리
```

---

## 9. 기술 구현 상세

### 9.1 추천 엔진 아키텍처

```typescript
// lib/recommendation/engine.ts

interface RecommendationEngine {
  // 입력: 사주 분석 결과
  processInput(sajuResult: SajuAnalysisResult): ProcessedInput;

  // 키워드 추출
  extractKeywords(processed: ProcessedInput): Keywords;

  // 추천 매칭
  matchRecommendations(keywords: Keywords): Recommendation[];

  // 우선순위 정렬
  prioritizeRecommendations(recs: Recommendation[]): Recommendation[];

  // 최종 출력
  generateOutput(recs: Recommendation[]): RecommendationOutput;
}

// 추천 카테고리
type RecommendationCategory =
  | 'health'       // 케어링크
  | 'wellness'     // 청리움 프로그램
  | 'product'      // 청리움 제품
  | 'education'    // 한컴 교육
  | 'financial';   // 한컴 금융
```

### 9.2 API 엔드포인트 설계

```typescript
// app/api/recommendations/route.ts

// POST /api/recommendations
// 사주 분석 결과 기반 추천 생성
interface RecommendationRequest {
  sajuResultId: string;
  userId?: string;
  categories?: RecommendationCategory[];
}

interface RecommendationResponse {
  success: boolean;
  recommendations: {
    carelink?: CarelinkRecommendation[];
    cheongrium?: CheongriumRecommendation[];
    products?: ProductRecommendation[];
  };
  cheongiumEnergy: DailyCheongiumEnergy;
}
```

### 9.3 데이터베이스 스키마 확장

```sql
-- 추천 이력 테이블
CREATE TABLE recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  saju_result_id UUID REFERENCES saju_results(id),
  recommendation_type TEXT NOT NULL, -- 'carelink', 'cheongrium', 'product'
  recommendation_data JSONB NOT NULL,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 청리움 에너지 로그
CREATE TABLE cheongrium_energy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  dominant_element TEXT NOT NULL,
  energy_score INTEGER NOT NULL,
  energy_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. 결론 및 기대 효과

### 10.1 핵심 가치 제안

1. **차별화된 사주 서비스**: 청리움의 실제 풍수 에너지를 기반으로 한 독보적인 콘텐츠
2. **O2O 시너지**: 온라인 앱 → 오프라인 청리움 방문 → 제품 구매의 완결된 퍼널
3. **한컴 생태계 통합**: 그룹 차원의 시너지를 통한 사용자 가치 극대화
4. **데이터 기반 개인화**: 사주 + 유전자 데이터 결합을 통한 차세대 웰니스 서비스

### 10.2 기대 효과

| 지표 | 현재 | 목표 (6개월) | 목표 (1년) |
|-----|-----|------------|-----------|
| MAU | - | 50,000 | 150,000 |
| 프리미엄 전환율 | - | 5% | 8% |
| 케어링크 전환 | - | 500건/월 | 2,000건/월 |
| 청리움 예약 | - | 200건/월 | 1,000건/월 |
| 청리움 제품 판매 | - | ₩5M/월 | ₩20M/월 |

### 10.3 Next Steps

1. **Phase 1 개발 착수**: 케어링크 추천 및 청리움 프로그램 추천 카드 구현
2. **제휴 계약 체결**: 케어링크, 청리움과의 수수료 구조 확정
3. **A/B 테스트 설계**: 추천 알고리즘 최적화를 위한 실험 계획
4. **마케팅 캠페인 기획**: 청리움 현장 QR 코드 및 프로모션 준비

---

*본 제안서는 청기운 앱의 전략적 방향성을 제시하며, 세부 구현은 개발팀과 비즈니스팀의 협의를 통해 조정될 수 있습니다.*
