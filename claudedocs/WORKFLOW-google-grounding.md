# 사주 상세 분석 Google Grounding 통합 워크플로우

## 📋 개요

**목표**: 사주 상세 분석 시 Google Search Grounding을 활용하여 현재 시대 트렌드/시장 상황을 실시간 검색하고, 사주 해석과 결합한 현실적 조언 제공

**핵심 아이디어**:
- 실제 역술가처럼 현재 세상 상황을 알고 조언
- 사주 분석 + 실시간 정보 = 실용적 맞춤 조언

## 🔧 기술 스택

| 현재 | 변경 |
|------|------|
| `@ai-sdk/google` (Vercel AI SDK) | `@google/genai` (Google 공식 SDK) |
| `generateText()` | `GoogleGenAI.models.generateContent()` |
| 단순 텍스트 생성 | `tools: [{ googleSearch: {} }]` 활성화 |

## 📁 영향 받는 파일

```
app/api/saju/detail/route.ts     # 주요 수정 대상
lib/saju/grounding-queries.ts    # 신규 생성 - 카테고리별 검색 쿼리
lib/i18n/prompts/index.ts        # 프롬프트에 시대상 반영 지시 추가
```

---

## ✅ 구현 태스크

### Phase 1: 카테고리별 검색 쿼리 매핑

**파일**: `lib/saju/grounding-queries.ts`

```typescript
// 각 분석 카테고리별로 현재 시대 정보를 검색할 쿼리 정의
export const groundingQueries: Record<DetailCategory, (context: GroundingContext) => string[]> = {
  career: (ctx) => [
    `${ctx.currentYear}년 유망 직업 트렌드`,
    `${ctx.dominantElement} 오행 관련 직종 전망`,
    `${ctx.tenGodStrength} 성향 적합 직업 ${ctx.currentYear}`,
  ],

  wealth: (ctx) => [
    `${ctx.currentYear}년 투자 트렌드 전망`,
    `${ctx.currentYear}년 부동산 시장 동향`,
    `${ctx.currentYear}년 재테크 추천`,
  ],

  relationship: (ctx) => [
    `${ctx.currentYear}년 연애 트렌드`,
    `${ctx.ageGroup}대 결혼 시장 현황`,
    `${ctx.currentYear}년 소개팅 앱 트렌드`,
  ],

  health: (ctx) => [
    `${ctx.weakElement} 오행 부족 건강 관리법`,
    `${ctx.currentYear}년 건강 트렌드`,
    `${ctx.ageGroup}대 주의해야 할 건강 문제`,
  ],

  fortune: (ctx) => [
    `${ctx.currentYear}년 ${ctx.currentMonth}월 경제 전망`,
    `${ctx.zodiacYear}년 운세 트렌드`,
  ],

  // 나머지 카테고리는 검색 없이 진행
  dayMaster: () => [],
  tenGods: () => [],
  stars: () => [],
};
```

### Phase 2: 상세 분석 API 수정

**파일**: `app/api/saju/detail/route.ts`

```typescript
import { GoogleGenAI } from '@google/genai';
import { getGroundingQueries } from '@/lib/saju/grounding-queries';

export async function POST(request: NextRequest) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  // 검색이 필요한 카테고리인지 확인
  const needsGrounding = ['career', 'wealth', 'relationship', 'health', 'fortune'].includes(category);

  // 검색 쿼리 생성
  const queries = needsGrounding
    ? getGroundingQueries(category, { currentYear, sajuContext, ... })
    : [];

  const config = {
    // Google Search Grounding 활성화
    tools: needsGrounding ? [{ googleSearch: {} }] : [],
  };

  const prompt = buildPromptWithGrounding(category, sajuContext, queries);

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    config,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return NextResponse.json({
    content: response.text,
    category,
    groundingSources: response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [],
  });
}
```

### Phase 3: 프롬프트 개선

**파일**: `lib/i18n/prompts/index.ts`

각 상세 분석 프롬프트에 시대상 반영 지시 추가:

```typescript
career: `직업운과 사업운에 대해 전문 명리학 기반으로 깊이 분석해주세요.

**중요: 현재 시대 상황을 반영하세요**
- 검색된 현재 트렌드 정보를 사주 분석과 결합
- "요즘 AI 시대니까...", "현재 취업 시장을 보면..." 등 현실적 조언
- 추상적인 사주 해석이 아닌 구체적인 현재 상황 적용

... (기존 내용)
`,
```

---

## 🔄 구현 순서

| 순서 | 태스크 | 예상 난이도 |
|------|--------|------------|
| 1 | `lib/saju/grounding-queries.ts` 생성 | ⭐ |
| 2 | `app/api/saju/detail/route.ts` 수정 | ⭐⭐⭐ |
| 3 | 프롬프트에 시대상 반영 지시 추가 | ⭐ |
| 4 | 에러 핸들링 및 폴백 로직 | ⭐⭐ |
| 5 | 테스트 및 검증 | ⭐⭐ |

---

## 📝 예상 결과

### Before (현재)
```
직업운 분석:
"편재가 강하시니 사업 수완이 좋습니다. 금융, 무역 분야가 적합합니다."
```

### After (Google Grounding 적용)
```
직업운 분석:
"편재가 강하시니 사업 수완이 좋으신데요, 요즘 AI 스타트업 붐이
일고 있어서 이쪽으로 창업하시면 좋을 것 같아요.
2025년 투자 트렌드를 보면 AI/로봇 분야가 뜨고 있거든요.
편재 성향이시면 이런 새로운 분야에서 빠르게 치고 나가실 수 있어요."
```

---

## ⚠️ 주의사항

1. **API 비용**: Google Search Grounding은 추가 비용 발생 가능
2. **속도**: 검색 추가로 응답 시간 증가 (약 1-2초)
3. **폴백**: 검색 실패 시 기존 방식으로 폴백 필요
4. **캐싱**: 동일 쿼리는 캐싱하여 비용/속도 최적화 고려

---

## 🚀 실행 명령

```
구현을 시작하시겠습니까?
"구현해줘" 또는 "Phase 1부터 시작해줘"
```
