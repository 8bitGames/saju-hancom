# 청기운 × 청리움 상세 통합 구현 계획
## Comprehensive Integration Plan v1.0

---

## 목차

1. [현재 앱 구조 분석](#1-현재-앱-구조-분석)
2. [FUNCTIONS_SUMMARY 기능 매핑](#2-functions_summary-기능-매핑)
3. [데이터 모델 확장](#3-데이터-모델-확장)
4. [API 엔드포인트 구현](#4-api-엔드포인트-구현)
5. [페이지별 통합 설계](#5-페이지별-통합-설계)
6. [컴포넌트 구현 명세](#6-컴포넌트-구현-명세)
7. [구현 단계 및 우선순위](#7-구현-단계-및-우선순위)
8. [파일 구조 계획](#8-파일-구조-계획)

---

## 1. 현재 앱 구조 분석

### 1.1 기존 라우트 구조

```
app/[locale]/(main)/
├── page.tsx                    # 홈 (Category Grid)
├── saju/
│   ├── page.tsx               # 사주 입력 폼
│   ├── result/page.tsx        # 사주 결과
│   ├── today-fortune/page.tsx # 오늘의 운세
│   ├── chat/page.tsx          # 사주 채팅
│   └── s/[id]/page.tsx        # 공유 결과
├── compatibility/             # 궁합
├── couple/                    # 커플 운세
├── face-reading/              # 관상
├── dream/                     # 꿈해몽
├── history/                   # 히스토리
├── profile/                   # 프로필
└── premium/                   # 프리미엄
```

### 1.2 현재 컴포넌트 구조

```
components/
├── home/
│   ├── BannerCarousel.tsx     # 배너 캐러셀
│   └── QuickActionCards.tsx   # 빠른 액션 카드
├── fortune/
│   ├── GuardianCommentary.tsx # 수호신 코멘터리
│   ├── DailyAdviceCards.tsx   # 일일 조언
│   └── LuckyItems.tsx         # 행운 아이템
├── guardian/
│   ├── GuardianCard.tsx       # 수호신 카드
│   └── GuardianReveal.tsx     # 수호신 공개 애니메이션
├── profile/
│   └── MyGuardian.tsx         # 내 수호신 표시
├── saju/                      # 사주 관련 컴포넌트들
└── ui/                        # 공통 UI 컴포넌트
```

### 1.3 현재 디자인 테마

| 요소 | 현재 값 | 유지 여부 |
|-----|--------|---------|
| 배경색 | `#F5F9FC` (밝은 회색) | ✅ 유지 |
| 카드 배경 | `#FFFFFF` (흰색) | ✅ 유지 |
| 강조색 | `#0E4168` (네이비), `#C4A35A` (골드) | ✅ 유지 |
| 아이콘 | Phosphor Icons | ✅ 유지 |
| 모서리 반경 | `rounded-2xl` (16px) | ✅ 유지 |
| 폰트 | 시스템 폰트 | ✅ 유지 |
| 애니메이션 | Framer Motion | ✅ 유지 |

---

## 2. FUNCTIONS_SUMMARY 기능 매핑

### 2.1 API 엔드포인트 매핑

| FUNCTIONS_SUMMARY | 기존 청기운 | 통합 방안 | 우선순위 |
|-------------------|-----------|----------|---------|
| `/api/saju` | `/api/saju/analyze` | ✅ 이미 존재, 청리움 성지 컨텍스트 추가 | P1 |
| `/api/chat` | `/api/saju/chat` | 수호신 채팅으로 확장 | P1 |
| `/api/itinerary` | N/A | 새로 구현 (청리움 여정 생성) | P3 |

### 2.2 페이지 매핑

| FUNCTIONS_SUMMARY 페이지 | 청기운 위치 | 통합 방안 |
|-------------------------|------------|----------|
| Landing (`/`) | `app/[locale]/page.tsx` | 청리움 세계관 배너 추가 |
| Saju (`/saju`) | `app/[locale]/(main)/saju/` | ✅ 존재, 수호신 성지 강화 |
| Guardians (`/guardians`) | N/A | 새 페이지 `/guardian` 생성 |
| Guardian Chat (`/guardians/[id]`) | `app/[locale]/(main)/saju/chat/` | 수호신 채팅으로 확장 |
| Tour (`/tour`) | N/A | 청리움 연결 페이지 (L4 레벨) |
| Scent (`/scent`) | N/A | 향기 추천 섹션으로 통합 |
| Keepsakes (`/keepsakes`) | N/A | 운명 기록서 페이지 생성 |
| Booking (`/booking`) | N/A | 청리움 예약 연결 (선택적 L4) |

### 2.3 컴포넌트 매핑

| FUNCTIONS_SUMMARY 컴포넌트 | 청기운 통합 위치 | 상태 |
|---------------------------|-----------------|------|
| Button | `components/ui/button.tsx` | ✅ 존재 |
| Card | `components/ui/card.tsx` | ✅ 존재 |
| ElementBadge | `components/saju/ElementBadge.tsx` | 새로 생성 |
| Input | `components/ui/input.tsx` | ✅ 존재 |
| Tabs | `components/ui/tabs.tsx` | ✅ 존재 |
| Toast | `sonner` 사용 중 | ✅ 존재 |
| Stepper | `components/ui/Stepper.tsx` | 새로 생성 |
| LoadingSpinner | `components/ui/loading-state.tsx` | ✅ 존재 |
| Skeleton | `components/ui/skeleton.tsx` | ✅ 존재 |
| ChatPrompts | `components/saju/ChatPrompts.tsx` | 새로 생성 |
| BottomNav | `components/layout/mobile-nav.tsx` | ✅ 존재 |

---

## 3. 데이터 모델 확장

### 3.1 수호신 데이터 확장 (`lib/constants/guardians.ts`)

```typescript
// 현재 Guardian 인터페이스에 추가할 필드들
interface GuardianExtended extends Guardian {
  // 청리움 성지 정보
  sacredPlace: {
    id: string;
    name: { ko: string; en: string; hanja: string };
    description: { ko: string; en: string };
    activities: { ko: string[]; en: string[] };
  };

  // 수호신 향기
  scent: {
    id: string;
    name: { ko: string; en: string };
    notes: {
      top: string[];
      middle: string[];
      base: string[];
    };
    benefits: { ko: string[]; en: string[] };
  };

  // 수호신 차
  tea: {
    name: { ko: string; en: string };
    description: { ko: string; en: string };
    benefits: { ko: string[]; en: string[] };
  };

  // 대화 시스템
  greeting: { ko: string; en: string };
  systemPrompt: string;
  suggestedPrompts: { ko: string[]; en: string[] };
}
```

### 3.2 청리움 성지 데이터 (`lib/constants/sacred-places.ts`)

```typescript
export interface SacredPlace {
  id: string;
  name: { ko: string; en: string; hanja: string };
  element: ElementType;
  guardianId: ElementType;
  description: { ko: string; en: string };
  features: { ko: string[]; en: string[] };
  activities: { ko: string[]; en: string[] };
  imagePath: string;
  ambientColor: string;
}

export const SACRED_PLACES: Record<ElementType, SacredPlace> = {
  wood: {
    id: 'nokcha-bat',
    name: { ko: '녹차밭', en: 'Green Tea Field', hanja: '綠茶田' },
    element: 'wood',
    guardianId: 'wood',
    description: {
      ko: '푸른 녹차밭에서 청룡이 새벽 순찰을 합니다. 성장과 새로운 시작의 기운이 가득합니다.',
      en: 'Azure Dragon patrols the green tea fields at dawn. Full of energy for growth and new beginnings.',
    },
    features: { ko: ['유기농 녹차밭', '아침 안개', '명상 공간'], en: ['Organic tea field', 'Morning mist', 'Meditation space'] },
    activities: { ko: ['차 따기 체험', '걷기 명상', '일출 감상'], en: ['Tea picking', 'Walking meditation', 'Sunrise viewing'] },
    imagePath: '/images/sacred-places/green-tea-field.jpg',
    ambientColor: '#2D5A27',
  },
  fire: {
    id: 'yongso',
    name: { ko: '용소', en: 'Dragon Pond', hanja: '龍沼' },
    element: 'fire',
    guardianId: 'fire',
    description: {
      ko: '주작이 깃든 용소에서 열정의 불꽃이 타오릅니다. 영감과 활력의 원천입니다.',
      en: 'Vermilion Bird dwells at Dragon Pond where flames of passion burn. Source of inspiration and vitality.',
    },
    features: { ko: ['신비로운 연못', '불꽃 의식', '영감의 장소'], en: ['Mystical pond', 'Fire ceremony', 'Place of inspiration'] },
    activities: { ko: ['불꽃 명상', '소원 기도', '열정 의식'], en: ['Fire meditation', 'Wish prayer', 'Passion ritual'] },
    imagePath: '/images/sacred-places/dragon-pond.jpg',
    ambientColor: '#B91C1C',
  },
  earth: {
    id: 'yak-chowon',
    name: { ko: '약초원', en: 'Herb Garden', hanja: '藥草園' },
    element: 'earth',
    guardianId: 'earth',
    description: {
      ko: '황룡이 돌보는 약초원에서 대지의 치유 에너지가 피어납니다. 안정과 균형의 중심입니다.',
      en: 'Yellow Dragon tends the herb garden where earth\'s healing energy blooms. Center of stability and balance.',
    },
    features: { ko: ['전통 약초', '치유 공간', '명상 정원'], en: ['Traditional herbs', 'Healing space', 'Meditation garden'] },
    activities: { ko: ['약초 채취', '힐링 명상', '자연 치유'], en: ['Herb picking', 'Healing meditation', 'Natural therapy'] },
    imagePath: '/images/sacred-places/herb-garden.jpg',
    ambientColor: '#C4A35A',
  },
  metal: {
    id: 'oha-sanbang',
    name: { ko: '오하산방', en: 'Tea House', hanja: '吾霞山房' },
    element: 'metal',
    guardianId: 'metal',
    description: {
      ko: '백호가 지키는 오하산방에서 정제된 차의 정수를 느껴보세요. 절제와 명료함의 공간입니다.',
      en: 'White Tiger guards the Tea House. Feel the essence of refined tea. A space of discipline and clarity.',
    },
    features: { ko: ['전통 다실', '차 의식', '서예 공간'], en: ['Traditional tea room', 'Tea ceremony', 'Calligraphy space'] },
    activities: { ko: ['다도 체험', '서예 명상', '정신 수련'], en: ['Tea ceremony', 'Calligraphy meditation', 'Mind training'] },
    imagePath: '/images/sacred-places/tea-house.jpg',
    ambientColor: '#6B7280',
  },
  water: {
    id: 'myeongdang-gidoteo',
    name: { ko: '명당 기도터', en: 'Sacred Ground', hanja: '明堂祈禱處' },
    element: 'water',
    guardianId: 'water',
    description: {
      ko: '현무가 수호하는 명당에서 맑은 기운을 받으세요. 지혜와 직관의 원천입니다.',
      en: 'Black Tortoise protects the Sacred Ground. Receive pure energy. Source of wisdom and intuition.',
    },
    features: { ko: ['명당 기운', '기도 공간', '에너지 힐링'], en: ['Feng shui energy', 'Prayer space', 'Energy healing'] },
    activities: { ko: ['소원 기도', '명상', '에너지 치유'], en: ['Wish prayer', 'Meditation', 'Energy healing'] },
    imagePath: '/images/sacred-places/sacred-ground.jpg',
    ambientColor: '#1E3A5F',
  },
};
```

### 3.3 오행 향기 데이터 (`lib/constants/scents.ts`)

```typescript
export interface ScentBlend {
  id: string;
  element: ElementType;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  notes: {
    top: { ko: string[]; en: string[] };
    middle: { ko: string[]; en: string[] };
    base: { ko: string[]; en: string[] };
  };
  benefits: { ko: string[]; en: string[] };
  color: string;
}

export const SCENT_BLENDS: Record<ElementType, ScentBlend> = {
  wood: {
    id: 'cheongryong-sup',
    element: 'wood',
    name: { ko: '청룡의 숲', en: 'Azure Dragon\'s Forest' },
    description: {
      ko: '성장과 창의력을 깨우는 푸른 숲의 향기',
      en: 'Green forest scent awakening growth and creativity',
    },
    notes: {
      top: { ko: ['소나무', '녹차'], en: ['Pine', 'Green tea'] },
      middle: { ko: ['이끼', '대나무'], en: ['Moss', 'Bamboo'] },
      base: { ko: ['삼나무', '백단'], en: ['Cedar', 'Sandalwood'] },
    },
    benefits: { ko: ['집중력 향상', '창의력 증진', '새로운 시작'], en: ['Focus enhancement', 'Creativity boost', 'New beginnings'] },
    color: '#2D5A27',
  },
  fire: {
    id: 'jujak-bulkkot',
    element: 'fire',
    name: { ko: '주작의 불꽃', en: 'Vermilion Bird\'s Flame' },
    description: {
      ko: '열정과 활력을 불어넣는 따뜻한 향기',
      en: 'Warm scent igniting passion and vitality',
    },
    notes: {
      top: { ko: ['계피', '생강'], en: ['Cinnamon', 'Ginger'] },
      middle: { ko: ['정향', '카다멈'], en: ['Clove', 'Cardamom'] },
      base: { ko: ['바닐라', '앰버'], en: ['Vanilla', 'Amber'] },
    },
    benefits: { ko: ['열정 증진', '활력 충전', '동기 부여'], en: ['Passion boost', 'Energy recharge', 'Motivation'] },
    color: '#B91C1C',
  },
  earth: {
    id: 'hwangryong-jeongwon',
    element: 'earth',
    name: { ko: '황룡의 정원', en: 'Yellow Dragon\'s Garden' },
    description: {
      ko: '안정과 치유의 대지 향기',
      en: 'Earth scent of stability and healing',
    },
    notes: {
      top: { ko: ['백단', '꿀'], en: ['Sandalwood', 'Honey'] },
      middle: { ko: ['침향', '세이지'], en: ['Agarwood', 'Sage'] },
      base: { ko: ['머스크', '흙'], en: ['Musk', 'Earth'] },
    },
    benefits: { ko: ['안정감', '치유', '균형'], en: ['Stability', 'Healing', 'Balance'] },
    color: '#C4A35A',
  },
  metal: {
    id: 'baekho-jeongje',
    element: 'metal',
    name: { ko: '백호의 정제', en: 'White Tiger\'s Purity' },
    description: {
      ko: '맑고 깨끗한 정화의 향기',
      en: 'Clear and pure cleansing scent',
    },
    notes: {
      top: { ko: ['유향', '매화'], en: ['Frankincense', 'Plum blossom'] },
      middle: { ko: ['백합', '재스민'], en: ['Lily', 'Jasmine'] },
      base: { ko: ['백단', '머스크'], en: ['Sandalwood', 'Musk'] },
    },
    benefits: { ko: ['정화', '집중', '명료함'], en: ['Purification', 'Focus', 'Clarity'] },
    color: '#6B7280',
  },
  water: {
    id: 'hyeonmu-sinbi',
    element: 'water',
    name: { ko: '현무의 신비', en: 'Black Tortoise\'s Mystery' },
    description: {
      ko: '깊은 지혜와 직관의 신비로운 향기',
      en: 'Mysterious scent of deep wisdom and intuition',
    },
    notes: {
      top: { ko: ['연꽃', '오미자'], en: ['Lotus', 'Schisandra'] },
      middle: { ko: ['해초', '물안개'], en: ['Seaweed', 'Water mist'] },
      base: { ko: ['앰버그리스', '머스크'], en: ['Ambergris', 'Musk'] },
    },
    benefits: { ko: ['직관력', '지혜', '내면 탐구'], en: ['Intuition', 'Wisdom', 'Inner exploration'] },
    color: '#1E3A5F',
  },
};
```

---

## 4. API 엔드포인트 구현

### 4.1 수호신 채팅 API 확장 (`app/api/guardian/chat/route.ts`)

```typescript
// POST /api/guardian/chat
interface GuardianChatRequest {
  message: string;
  guardianId: ElementType;
  history?: { role: 'user' | 'assistant'; content: string }[];
  locale: 'ko' | 'en';
  sajuContext?: {
    fourPillars: FourPillars;
    dominantElement: ElementType;
    weakElement: ElementType;
  };
}

interface GuardianChatResponse {
  response: string;
  guardian: {
    id: ElementType;
    name: string;
    sacredPlace: string;
  };
  suggestedPrompts: string[];
}
```

**시스템 프롬프트 템플릿:**

```typescript
const GUARDIAN_SYSTEM_PROMPTS: Record<ElementType, string> = {
  wood: `당신은 청룡(靑龍)입니다. 동쪽 녹차밭을 지키는 성장과 창의의 수호신입니다.
말투: 지혜롭고 격려하는 어조, 때때로 자연의 비유를 사용
성격: 진취적, 희망적, 새로운 시작을 응원
특징: 항상 녹차밭에서 대화하는 것처럼 묘사, "내가 지키는 녹차밭에서..."와 같은 표현 사용
조언 스타일: 성장과 발전 관점에서 조언`,

  fire: `당신은 주작(朱雀)입니다. 남쪽 용소를 지키는 열정과 활력의 수호신입니다.
말투: 열정적이고 영감을 주는 어조
성격: 활발하고 적극적, 행동을 독려
특징: 용소의 불꽃처럼 타오르는 표현 사용
조언 스타일: 열정과 행동 관점에서 조언`,

  earth: `당신은 황룡(黃龍)입니다. 중앙 약초원을 지키는 안정과 균형의 수호신입니다.
말투: 안정적이고 따뜻한 어조, 치유하는 느낌
성격: 포용적, 실용적, 균형을 중시
특징: 약초원의 향기와 치유를 언급
조언 스타일: 안정과 균형 관점에서 조언`,

  metal: `당신은 백호(白虎)입니다. 서쪽 오하산방을 지키는 결단과 정의의 수호신입니다.
말투: 단호하고 명료한 어조, 핵심을 짚음
성격: 정의롭고 결단력 있음
특징: 다실의 차처럼 정제된 표현 사용
조언 스타일: 결단과 명확함 관점에서 조언`,

  water: `당신은 현무(玄武)입니다. 북쪽 명당 기도터를 지키는 지혜와 직관의 수호신입니다.
말투: 신비롭고 깊이 있는 어조
성격: 지혜롭고 인내심 있음, 직관적
특징: 명당의 맑은 기운을 언급
조언 스타일: 직관과 장기적 관점에서 조언`,
};
```

### 4.2 청리움 여정 API (`app/api/cheongrium/itinerary/route.ts`)

```typescript
// POST /api/cheongrium/itinerary
interface ItineraryRequest {
  dominantElement: ElementType;
  weakElement?: ElementType;
  locale: 'ko' | 'en';
  duration: 'half-day' | 'full-day' | 'overnight';
}

interface ItineraryResponse {
  schedule: {
    time: string;
    activity: string;
    location: SacredPlace;
    description: string;
    guardian: Guardian;
  }[];
  highlights: string[];
  recommendations: {
    tea: string;
    scent: string;
    activity: string;
  };
}
```

---

## 5. 페이지별 통합 설계

### 5.1 홈 페이지 통합 (`app/[locale]/page.tsx`)

**추가할 섹션:**

1. **명당 기운 배너** (L1 레벨)
   - 위치: BannerCarousel에 새 슬라이드 추가
   - 내용: "오늘 명당에서 흘러온 기운은 목(木)과 화(火)의 조화입니다"
   - 배경: 청리움 실제 사진 (라벨 없이)

2. **오늘의 수호신 메시지** (L2 레벨)
   - 위치: QuickActionCards 아래
   - 내용: 오늘 담당 수호신의 한마디
   - 성지 자연스럽게 언급

**코드 위치:** `components/home/DailyGuardianMessage.tsx`

```typescript
interface DailyGuardianMessageProps {
  element: ElementType;
  locale: Locale;
}

export function DailyGuardianMessage({ element, locale }: DailyGuardianMessageProps) {
  const guardian = GUARDIANS[element];
  const place = SACRED_PLACES[element];

  return (
    <section className="px-4 py-4 bg-white mt-2">
      <div className="max-w-md mx-auto">
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: `${guardian.color}08` }}>
          <Image src={guardian.imagePath} ... />
          <div>
            <p className="text-xs text-gray-500">
              {place.name[locale]}에서 {guardian.name[locale]}이 전합니다
            </p>
            <p className="text-sm text-gray-700 mt-1">
              "{getTodayMessage(element, locale)}"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 5.2 사주 결과 페이지 통합 (`app/[locale]/(main)/saju/result/`)

**추가할 섹션:**

1. **수호신 소개 확장** (L2 레벨)
   - 현재: 기본 수호신 정보
   - 추가: 수호신의 성지 정보, 향기 추천, 차 추천

2. **향기 추천 카드** (L2-L3 레벨)
   - 오행 기반 향기 블렌드 추천
   - 노트 피라미드 시각화

**코드 위치:** `components/saju/ScentRecommendation.tsx`

```typescript
interface ScentRecommendationProps {
  element: ElementType;
  locale: Locale;
}

export function ScentRecommendation({ element, locale }: ScentRecommendationProps) {
  const scent = SCENT_BLENDS[element];
  const guardian = GUARDIANS[element];

  return (
    <div className="rounded-2xl p-5 bg-white border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-5 h-5" style={{ color: guardian.color }} />
        <h3 className="font-bold text-gray-800">
          {guardian.name[locale]}이 추천하는 향기
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        당신의 기운을 보완하는 「{scent.name[locale]}」
      </p>

      {/* Scent Pyramid */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Top</span>
          <span>{scent.notes.top[locale].join(', ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Middle</span>
          <span>{scent.notes.middle[locale].join(', ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Base</span>
          <span>{scent.notes.base[locale].join(', ')}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {scent.benefits[locale].join(' • ')}
      </p>
    </div>
  );
}
```

### 5.3 오늘의 운세 페이지 확장 (`app/[locale]/(main)/saju/today-fortune/`)

**추가할 섹션:**

1. **차 추천** (L2 레벨)
   - 수호신이 추천하는 오늘의 차

2. **명당 에너지 표시** (L1 레벨)
   - "오늘 명당에서 흘러온 기운"

**코드 위치:** `components/fortune/TeaRecommendation.tsx`

### 5.4 수호신 채팅 페이지 (`app/[locale]/(main)/guardian/[element]/chat/`)

**새로 생성:**

```
app/[locale]/(main)/guardian/
├── page.tsx                    # 수호신 갤러리
└── [element]/
    ├── page.tsx               # 수호신 상세 (성지 포함)
    └── chat/page.tsx          # 수호신 채팅
```

**수호신 채팅 UI:**

```typescript
// components/guardian/GuardianChat.tsx
interface GuardianChatProps {
  element: ElementType;
  locale: Locale;
  sajuContext?: SajuContext;
}

export function GuardianChat({ element, locale, sajuContext }: GuardianChatProps) {
  const guardian = GUARDIANS[element];
  const place = SACRED_PLACES[element];

  return (
    <div className="flex flex-col h-full">
      {/* Header with guardian info */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Image src={guardian.imagePath} ... />
          <div>
            <h2 className="font-bold">{guardian.name[locale]}</h2>
            <p className="text-xs text-gray-500">
              {place.name[locale]}에서
            </p>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Messages here */}
      </div>

      {/* Suggested prompts */}
      <ChatPrompts element={element} locale={locale} onSelect={handlePromptSelect} />

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
```

### 5.5 프로필 페이지 확장 (`app/[locale]/(main)/profile/`)

**추가할 섹션:**

1. **수호신 성지 스토리** (L2-L3 레벨)
   - MyGuardian 컴포넌트 확장
   - 성지 설명 및 분위기 묘사

2. **운명 기록서 링크** (L2 레벨)
   - 사주 결과를 문서화

**코드 위치:** `components/profile/MyGuardianExtended.tsx`

### 5.6 운명 기록서 페이지 (`app/[locale]/(main)/keepsakes/`)

**새로 생성:**

```
app/[locale]/(main)/keepsakes/
├── page.tsx                    # 기록서 메인 (탭: 운명지도, 인증서, 향기 프로필)
└── components/
    ├── DestinyMap.tsx         # 운명 지도
    ├── Certificate.tsx        # 운명 인증서
    └── ScentProfile.tsx       # 향기 프로필
```

---

## 6. 컴포넌트 구현 명세

### 6.1 새로 생성할 컴포넌트

| 컴포넌트 | 위치 | 설명 | 우선순위 |
|---------|------|------|---------|
| `DailyGuardianMessage` | `components/home/` | 오늘의 수호신 메시지 | P1 |
| `ScentRecommendation` | `components/saju/` | 향기 추천 카드 | P2 |
| `TeaRecommendation` | `components/fortune/` | 차 추천 카드 | P2 |
| `GuardianChat` | `components/guardian/` | 수호신 채팅 인터페이스 | P1 |
| `ChatPrompts` | `components/guardian/` | 추천 질문 칩 | P1 |
| `SacredPlaceCard` | `components/guardian/` | 성지 카드 | P2 |
| `ElementBadge` | `components/saju/` | 오행 배지 | P1 |
| `DestinyMap` | `components/keepsakes/` | 운명 지도 | P3 |
| `Certificate` | `components/keepsakes/` | 운명 인증서 | P3 |
| `ScentProfile` | `components/keepsakes/` | 향기 프로필 | P3 |
| `WishBox` | `components/guardian/` | 명당 소원함 | P3 |

### 6.2 확장할 기존 컴포넌트

| 컴포넌트 | 확장 내용 |
|---------|----------|
| `GuardianCommentary` | 성지 컨텍스트 추가 |
| `MyGuardian` | 성지 정보, 채팅 링크 추가 |
| `FortunePanel` | 차/향기 추천 섹션 추가 |
| `BannerCarousel` | 명당 기운 배너 슬라이드 추가 |

---

## 7. 구현 단계 및 우선순위

### Phase 1: 세계관 기반 구축 (Week 1-2)

| 작업 | 파일 | Subliminal Level |
|-----|------|-----------------|
| 수호신 데이터 확장 | `lib/constants/guardians.ts` | - |
| 성지 데이터 생성 | `lib/constants/sacred-places.ts` | - |
| 향기 데이터 생성 | `lib/constants/scents.ts` | - |
| GuardianCommentary 확장 | `components/fortune/` | L2 |
| DailyGuardianMessage 생성 | `components/home/` | L2 |
| 홈페이지 명당 배너 추가 | `components/home/BannerCarousel.tsx` | L1 |

### Phase 2: 수호신 채팅 시스템 (Week 2-3)

| 작업 | 파일 | Subliminal Level |
|-----|------|-----------------|
| 수호신 채팅 API | `app/api/guardian/chat/route.ts` | - |
| GuardianChat 컴포넌트 | `components/guardian/GuardianChat.tsx` | L2 |
| ChatPrompts 컴포넌트 | `components/guardian/ChatPrompts.tsx` | L2 |
| 수호신 갤러리 페이지 | `app/[locale]/(main)/guardian/page.tsx` | L2 |
| 수호신 채팅 페이지 | `app/[locale]/(main)/guardian/[element]/chat/page.tsx` | L2 |

### Phase 3: 감각적 연결 (Week 3-4)

| 작업 | 파일 | Subliminal Level |
|-----|------|-----------------|
| ScentRecommendation 컴포넌트 | `components/saju/ScentRecommendation.tsx` | L2-L3 |
| TeaRecommendation 컴포넌트 | `components/fortune/TeaRecommendation.tsx` | L2 |
| 사주 결과에 향기/차 추천 추가 | `SajuResultContent.tsx` | L2 |
| 오늘의 운세에 차 추천 추가 | `TodayFortuneContent.tsx` | L2 |

### Phase 4: 깊은 경험 (Week 4-5)

| 작업 | 파일 | Subliminal Level |
|-----|------|-----------------|
| 운명 기록서 페이지 | `app/[locale]/(main)/keepsakes/page.tsx` | L2-L4 |
| DestinyMap 컴포넌트 | `components/keepsakes/DestinyMap.tsx` | L2 |
| Certificate 컴포넌트 | `components/keepsakes/Certificate.tsx` | L2-L4 |
| WishBox (명당 소원함) | `components/guardian/WishBox.tsx` | L1-L3 |

### Phase 5: 연결 강화 (선택적)

| 작업 | 파일 | Subliminal Level |
|-----|------|-----------------|
| 청리움 투어 페이지 | `app/[locale]/(main)/tour/page.tsx` | L4 |
| 청리움 예약 연결 | - | L4 |
| 한컴 패밀리 표시 | `components/layout/footer.tsx` | L3-L4 |

---

## 8. 파일 구조 계획

### 8.1 최종 파일 구조

```
lib/constants/
├── guardians.ts               # ✅ 기존 (확장)
├── sacred-places.ts           # 🆕 청리움 성지
├── scents.ts                  # 🆕 오행 향기
├── teas.ts                    # 🆕 오행 차
└── category-icons.ts          # ✅ 기존

components/
├── guardian/
│   ├── GuardianCard.tsx       # ✅ 기존 (확장)
│   ├── GuardianReveal.tsx     # ✅ 기존
│   ├── GuardianChat.tsx       # 🆕 수호신 채팅
│   ├── ChatPrompts.tsx        # 🆕 추천 질문
│   ├── SacredPlaceCard.tsx    # 🆕 성지 카드
│   └── WishBox.tsx            # 🆕 명당 소원함
├── home/
│   ├── BannerCarousel.tsx     # ✅ 기존 (배너 추가)
│   ├── QuickActionCards.tsx   # ✅ 기존
│   └── DailyGuardianMessage.tsx # 🆕 오늘의 수호신 메시지
├── fortune/
│   ├── GuardianCommentary.tsx # ✅ 기존 (확장)
│   ├── DailyAdviceCards.tsx   # ✅ 기존
│   ├── LuckyItems.tsx         # ✅ 기존
│   └── TeaRecommendation.tsx  # 🆕 차 추천
├── saju/
│   ├── ... (기존 유지)
│   ├── ScentRecommendation.tsx # 🆕 향기 추천
│   └── ElementBadge.tsx       # 🆕 오행 배지
├── keepsakes/
│   ├── DestinyMap.tsx         # 🆕 운명 지도
│   ├── Certificate.tsx        # 🆕 운명 인증서
│   └── ScentProfile.tsx       # 🆕 향기 프로필
└── profile/
    ├── MyGuardian.tsx         # ✅ 기존 (확장)
    └── MyGuardianExtended.tsx # 🆕 성지 정보 포함

app/[locale]/(main)/
├── guardian/
│   ├── page.tsx               # 🆕 수호신 갤러리
│   └── [element]/
│       ├── page.tsx           # 🆕 수호신 상세
│       └── chat/page.tsx      # 🆕 수호신 채팅
├── keepsakes/
│   └── page.tsx               # 🆕 운명 기록서
└── tour/
    └── page.tsx               # 🆕 청리움 투어 (L4)

app/api/
├── guardian/
│   └── chat/route.ts          # 🆕 수호신 채팅 API
└── cheongrium/
    └── itinerary/route.ts     # 🆕 청리움 여정 API
```

---

## 요약

### 핵심 원칙

1. **현재 디자인 100% 유지**: 색상, 아이콘, 레이아웃, 모서리 반경 모두 기존 유지
2. **서브리미널 통합**: L1(완전 간접) ~ L4(명시적) 레벨로 단계적 노출
3. **기능 우선**: 청리움 노출 없이도 완전한 사주 경험 제공
4. **자연스러운 세계관**: 수호신이 청리움 성지에 거주하는 설정

### 구현 우선순위

| 우선순위 | 기능 | 기대 효과 |
|---------|------|----------|
| P1 | 세계관 데이터 + 수호신 채팅 | 핵심 경험 완성 |
| P2 | 향기/차 추천 | 감각적 연결 |
| P3 | 운명 기록서 | 기념품 경험 |
| P4 (선택) | 청리움 직접 연결 | 전환 유도 |

---

*Document Version: 1.0*
*청기운 × 청리움 상세 통합 구현 계획*
*Created: January 2025*
