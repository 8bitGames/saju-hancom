# 사주 분석 Google Grounding 통합 워크플로우 v2

## 📋 최종 결정 사항

| 항목 | 결정 |
|------|------|
| 개인화 방식 | 사주 데이터(십성, 오행, 격국) → 검색 키워드 변환 |
| 적용 범위 | 하이브리드 (상세보기 + 대화) |
| 대화 UX | 1차 즉답 → 백그라운드 검색 → 2차 보강 |

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    사주 개인화 검색 시스템                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [사주 데이터]                                                   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────┐                                            │
│  │ 개인화 키워드    │                                            │
│  │ 변환 엔진       │                                            │
│  │                 │                                            │
│  │ 십성 → 성향     │                                            │
│  │ 오행 → 분야     │                                            │
│  │ 격국 → 패턴     │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│     ┌─────┴─────┐                                               │
│     ▼           ▼                                               │
│  [상세보기]   [대화]                                             │
│     │           │                                               │
│     ▼           ▼                                               │
│  즉시 검색    1차 즉답                                           │
│  + 분석      → 백그라운드 검색                                   │
│              → 2차 보강 응답                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 구현 파일 목록

```
lib/saju/personalized-keywords.ts    # [신규] 사주→키워드 변환 엔진
lib/saju/search-triggers.ts          # [신규] 대화 검색 트리거 감지
app/api/saju/detail/route.ts         # [수정] 상세보기 + 개인화 검색
app/api/saju/chat/route.ts           # [수정] 1차응답 + 2차보강 스트리밍
lib/i18n/prompts/index.ts            # [수정] 시대상 반영 프롬프트
```

---

## ✅ Phase 1: 개인화 키워드 변환 엔진

**파일**: `lib/saju/personalized-keywords.ts`

### 십성 → 성향 키워드

```typescript
export const tenGodToKeywords: Record<string, PersonalityKeywords> = {
  // 비겁 (比劫)
  '비견': {
    personality: '독립적인',
    workStyle: '프리랜서',
    career: '1인 기업가',
  },
  '겁재': {
    personality: '도전적인',
    workStyle: '경쟁적인',
    career: '영업직',
  },

  // 식상 (食傷)
  '식신': {
    personality: '안정 추구하는',
    workStyle: '전문직',
    career: '요리사 셰프 기술자',
  },
  '상관': {
    personality: '창의적인',
    workStyle: '프리랜서 아티스트',
    career: '디자이너 작가 유튜버',
  },

  // 재성 (財星)
  '편재': {
    personality: '사업 수완 있는',
    workStyle: '투자자 사업가',
    career: '스타트업 창업자 트레이더',
  },
  '정재': {
    personality: '안정적인',
    workStyle: '회사원',
    career: '금융권 공기업 대기업',
  },

  // 관성 (官星)
  '편관': {
    personality: '추진력 있는',
    workStyle: '리더 관리자',
    career: '군인 경찰 운동선수',
  },
  '정관': {
    personality: '책임감 있는',
    workStyle: '공무원 임원',
    career: '공무원 변호사 의사',
  },

  // 인성 (印星)
  '편인': {
    personality: '독창적인',
    workStyle: '연구직',
    career: '개발자 연구원 역술가',
  },
  '정인': {
    personality: '학구적인',
    workStyle: '교육자',
    career: '교수 교사 작가',
  },
};
```

### 오행 → 분야 키워드

```typescript
export const elementToIndustry: Record<string, IndustryKeywords> = {
  '목(木)': {
    industries: ['교육', '출판', '패션', '가구', '의류'],
    modernIndustries: ['에듀테크', '콘텐츠', '친환경'],
    investmentAreas: ['ESG', '그린에너지'],
  },
  '화(火)': {
    industries: ['IT', '전자', '광고', '미용', '요식업'],
    modernIndustries: ['AI', '반도체', '메타버스', '유튜브'],
    investmentAreas: ['테크주', '성장주'],
  },
  '토(土)': {
    industries: ['부동산', '건설', '농업', '유통'],
    modernIndustries: ['물류 플랫폼', '프롭테크'],
    investmentAreas: ['리츠', '부동산'],
  },
  '금(金)': {
    industries: ['금융', '기계', '자동차', '의료기기'],
    modernIndustries: ['핀테크', '로봇', '전기차'],
    investmentAreas: ['배당주', '금'],
  },
  '수(水)': {
    industries: ['무역', '물류', '관광', '수산'],
    modernIndustries: ['이커머스', '여행 플랫폼', '해운'],
    investmentAreas: ['해외주식', '글로벌 ETF'],
  },
};
```

### 개인화 검색 쿼리 생성 함수

```typescript
export function generatePersonalizedQuery(
  category: DetailCategory,
  sajuProfile: SajuProfile,
  currentYear: number
): string[] {
  const { dominantTenGod, dominantElement, structure } = sajuProfile;

  const personality = tenGodToKeywords[dominantTenGod]?.personality || '';
  const industry = elementToIndustry[dominantElement]?.modernIndustries[0] || '';
  const career = tenGodToKeywords[dominantTenGod]?.career || '';

  switch (category) {
    case 'career':
      return [
        `${personality} 사람 적합 직업 ${currentYear}`,
        `${industry} 분야 취업 전망 ${currentYear}`,
        `${career} 연봉 전망 ${currentYear}`,
      ];

    case 'wealth':
      const investArea = elementToIndustry[dominantElement]?.investmentAreas[0] || '';
      return [
        `${personality} 투자 성향 추천 ${currentYear}`,
        `${investArea} 투자 전망 ${currentYear}`,
      ];

    case 'relationship':
      return [
        `${personality} 성격 연애 스타일`,
        `${currentYear} 결혼 트렌드`,
      ];

    case 'health':
      const weakOrgan = elementToOrgan[sajuProfile.lackingElement];
      return [
        `${weakOrgan} 건강 관리법`,
        `${sajuProfile.ageGroup}대 건강 검진 추천`,
      ];

    default:
      return [];
  }
}
```

---

## ✅ Phase 2: 대화 검색 트리거 시스템

**파일**: `lib/saju/search-triggers.ts`

```typescript
// 검색을 트리거하는 키워드 정의
export const searchTriggers: Record<string, TriggerConfig> = {
  career: {
    keywords: ['이직', '취업', '사업', '창업', '회사', '직장', '일', '커리어', '진로'],
    priority: 'high',
    queryTemplate: (saju) => `${saju.careerKeyword} 전망 ${saju.currentYear}`,
  },
  wealth: {
    keywords: ['투자', '주식', '부동산', '재테크', '돈', '저축', '코인', '펀드'],
    priority: 'high',
    queryTemplate: (saju) => `${saju.investmentStyle} 투자 전략 ${saju.currentYear}`,
  },
  relationship: {
    keywords: ['연애', '결혼', '소개팅', '이별', '썸', '애인', '남친', '여친'],
    priority: 'medium',
    queryTemplate: (saju) => `${saju.currentYear} 만남 트렌드`,
  },
  health: {
    keywords: ['건강', '아프', '병원', '운동', '다이어트', '체력'],
    priority: 'medium',
    queryTemplate: (saju) => `${saju.healthFocus} 관리법`,
  },
};

// 메시지에서 트리거 감지
export function detectSearchTrigger(message: string): TriggerResult | null {
  for (const [category, config] of Object.entries(searchTriggers)) {
    for (const keyword of config.keywords) {
      if (message.includes(keyword)) {
        return {
          category,
          keyword,
          priority: config.priority,
          queryTemplate: config.queryTemplate,
        };
      }
    }
  }
  return null;
}
```

---

## ✅ Phase 3: 상세보기 API 수정

**파일**: `app/api/saju/detail/route.ts`

```typescript
import { GoogleGenAI } from '@google/genai';
import { generatePersonalizedQuery, extractSajuProfile } from '@/lib/saju/personalized-keywords';

export async function POST(request: NextRequest) {
  const { category, sajuContext, gender, locale } = await request.json();

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const currentYear = new Date().getFullYear();

  // 1. 사주 프로필 추출
  const sajuProfile = extractSajuProfile(sajuContext);

  // 2. 개인화된 검색 쿼리 생성
  const personalizedQueries = generatePersonalizedQuery(category, sajuProfile, currentYear);

  // 3. 검색이 필요한 카테고리인지 확인
  const needsSearch = ['career', 'wealth', 'relationship', 'health', 'fortune'].includes(category);

  // 4. Gemini + Google Grounding으로 분석
  const config = {
    tools: needsSearch ? [{ googleSearch: {} }] : [],
  };

  const prompt = `
당신은 40년 경력의 전문 역술가입니다.
현재 연도는 ${currentYear}년입니다.

[이 분의 사주 특성]
- 성향: ${sajuProfile.personality}
- 적합 분야: ${sajuProfile.suitableIndustry}
- 투자 스타일: ${sajuProfile.investmentStyle}

[사주 상세 정보]
${sajuContext}

[분석 요청]
${getDetailPrompt(locale, category)}

**중요: 현재 시대 상황을 반영하세요**
- 위 사주 특성에 맞는 현재 트렌드 정보를 검색하여 반영
- "요즘 ${sajuProfile.suitableIndustry} 시장을 보면..." 식으로 현실적 조언
- 개인화된 구체적 추천 (일반적인 조언 X)
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    config,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return NextResponse.json({
    content: response.text,
    category,
    personalizedFor: sajuProfile.summary,
    searchQueries: personalizedQueries,
  });
}
```

---

## ✅ Phase 4: 대화 API - 1차 즉답 + 2차 보강

**파일**: `app/api/saju/chat/route.ts`

### 핵심 로직: 스트리밍 + 백그라운드 검색

```typescript
import { GoogleGenAI } from '@google/genai';
import { detectSearchTrigger } from '@/lib/saju/search-triggers';

export async function POST(request: NextRequest) {
  const { messages, sajuContext, gender, locale } = await request.json();
  const lastMessage = messages[messages.length - 1].content;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 1. 검색 트리거 감지
  const trigger = detectSearchTrigger(lastMessage);

  // 2. 사주 프로필 추출
  const sajuProfile = extractSajuProfile(sajuContext);

  // 3. 1차 응답 (즉시, 검색 없이)
  const firstResponsePromise = ai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    config: { tools: [] }, // 검색 없이 빠르게
    contents: buildChatContents(messages, sajuContext, locale),
  });

  // 4. 트리거가 있으면 백그라운드에서 검색 시작
  let searchResponsePromise = null;
  if (trigger) {
    const searchQuery = trigger.queryTemplate(sajuProfile);
    searchResponsePromise = ai.models.generateContent({
      model: 'gemini-2.0-flash',
      config: { tools: [{ googleSearch: {} }] },
      contents: [{
        role: 'user',
        parts: [{ text: `
${searchQuery}에 대해 현재 트렌드를 검색하고,
다음 사주 특성을 가진 사람에게 맞는 조언을 1-2문장으로 짧게 해주세요:
- 성향: ${sajuProfile.personality}
- 적합 분야: ${sajuProfile.suitableIndustry}
        `}]
      }],
    });
  }

  // 5. 스트리밍 응답 생성
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 1차 응답 스트리밍
      for await (const chunk of await firstResponsePromise) {
        if (chunk.text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'primary',
            content: chunk.text
          })}\n\n`));
        }
      }

      // 2차 응답 (검색 결과가 있으면)
      if (searchResponsePromise) {
        const searchResult = await searchResponsePromise;
        if (searchResult.text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'enriched',
            content: `\n\n참고로 ${trigger.keyword} 관련해서 요즘 시장을 보면요... ${searchResult.text}`
          })}\n\n`));
        }
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## ✅ Phase 5: 프론트엔드 2차 응답 처리

**파일**: `components/saju/SajuChatPanel.tsx`

```typescript
// 스트리밍 응답에서 primary와 enriched 구분 처리
const handleStreamResponse = async (response: Response) => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  let primaryContent = '';
  let enrichedContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.type === 'primary') {
          primaryContent += data.content;
          updateMessage(primaryContent); // 즉시 화면에 표시
        } else if (data.type === 'enriched') {
          enrichedContent = data.content;
          // 잠시 후 추가 (자연스러운 UX)
          setTimeout(() => {
            updateMessage(primaryContent + enrichedContent);
          }, 500);
        }
      }
    }
  }
};
```

---

## 📊 예상 UX 플로우

```
[사용자] "저 이직 고민이에요"

[0.5초 - 1차 응답 시작]
"음... 사주를 보니까 상관이 강하셔서
지금 회사가 좀 답답하셨을 수 있어요.
창의적인 일을 하고 싶으신 거 아니에요?"

[2-3초 후 - 2차 응답 추가]
"참고로 이직 관련해서 요즘 시장을 보면요...
IT 개발자 쪽은 AI 분야로 이직하면 연봉 20% 정도
오르는 추세예요. 상관 성향이시면 새로운 기술 배우는 거
잘하시니까 AI 쪽으로 가시는 것도 좋을 것 같아요."
```

---

## 🔄 구현 순서

| 순서 | 태스크 | 파일 | 난이도 |
|------|--------|------|-------|
| 1 | 개인화 키워드 변환 엔진 | `lib/saju/personalized-keywords.ts` | ⭐⭐ |
| 2 | 검색 트리거 시스템 | `lib/saju/search-triggers.ts` | ⭐ |
| 3 | 상세보기 API 수정 | `app/api/saju/detail/route.ts` | ⭐⭐⭐ |
| 4 | 대화 API 2단계 응답 | `app/api/saju/chat/route.ts` | ⭐⭐⭐⭐ |
| 5 | 프론트엔드 스트리밍 처리 | `components/saju/SajuChatPanel.tsx` | ⭐⭐ |
| 6 | 테스트 및 최적화 | - | ⭐⭐ |

---

## 🚀 실행 준비 완료

구현을 시작할까요?

```
"구현해줘" → 전체 구현 시작
"Phase 1부터" → 단계별 진행
```
