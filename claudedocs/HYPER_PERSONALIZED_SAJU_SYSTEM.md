# 초개인화 사주 분석 시스템 (Hyper-Personalized Saju Analysis System)

## 기술 명세서 v1.1

**작성일**: 2025년 12월 22일
**최종 수정**: 2025년 12월 23일
**목적**: AI가 진짜 역술가처럼 "지금 이 사람에게 필요한 말"을 해주는 시스템 구축

---

## 1. 개요 (Overview)

### 1.1 문제 정의

현재 시스템의 문제점:

| 문제 | 증상 | 원인 |
|-----|------|------|
| 시간 무인식 | "4월에 좋아요" (현재 12월인데) | `currentYear`만 전달, 월/일 미전달 |
| 나이 무시 | 20대에게 은퇴 조언 | 나이 기반 인생 단계 미반영 |
| 획일적 조언 | 모든 사람에게 "결혼운 좋아요" | 사주 특성(신살) 기반 개인화 없음 |
| 과거 운세 언급 | 지나간 달 운세를 현재처럼 | 시제 구분 로직 없음 |

### 1.2 목표

**"진짜 역술가처럼 상담하는 AI"**

- 시간 인식: "지금 12월이니까, 올해 정리하고 내년 얘기해줄게요"
- 나이 맞춤: "44세시니까 건강이랑 노후 준비 위주로..."
- 사주 개인화: "역마살 있으시니까 결혼보다 자유로운 삶이..."
- 세운 분석: "올해 을사년은 이랬고, 내년 병오년은..."

### 1.3 핵심 아키텍처: Multi-Agent 시스템

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        초개인화 컨텍스트 엔진 (Orchestrator)                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Context Orchestrator Agent                      │   │
│  │         (3개 축 Agent 조율 및 통합 프롬프트 생성)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│          ┌─────────────────────────┼─────────────────────────┐             │
│          │                         │                         │             │
│          ▼                         ▼                         ▼             │
│  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐      │
│  │  🕐 Temporal   │        │  👤 Age       │        │  🔮 Chart     │      │
│  │     Agent     │        │    Agent      │        │    Agent      │      │
│  ├───────────────┤        ├───────────────┤        ├───────────────┤      │
│  │ • 현재 날짜    │        │ • 나이 계산    │        │ • 신살 분석    │      │
│  │ • 세운 계산    │        │ • 인생 단계    │        │ • 십성 분석    │      │
│  │ • 시기 플래그  │        │ • 가이드라인   │        │ • 개인화 플래그│      │
│  │               │        │ • 주의사항    │        │ • 금기 주제    │      │
│  │ 🔍 Google     │        │               │        │               │      │
│  │   Grounding   │        │               │        │               │      │
│  │ (월별 관심사)  │        │               │        │               │      │
│  └───────┬───────┘        └───────┬───────┘        └───────┬───────┘      │
│          │                         │                         │             │
│          └─────────────────────────┼─────────────────────────┘             │
│                                    ▼                                        │
│                    ┌───────────────────────────┐                           │
│                    │   통합 컨텍스트 (Merged)   │                           │
│                    └─────────────┬─────────────┘                           │
│                                  │                                          │
│                                  ▼                                          │
│                    ┌───────────────────────────┐                           │
│                    │  🤖 Fortune Teller Agent  │                           │
│                    │  (최종 응답 생성 - Gemini) │                           │
│                    │   + Google Grounding      │                           │
│                    └───────────────────────────┘                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Agent 시스템 설계

### 2.1 Agent 역할 정의

| Agent | 역할 | 입력 | 출력 | 특징 |
|-------|-----|------|------|------|
| **Temporal Agent** | 시간 맥락 분석 | 현재 날짜 | 세운, 시기 플래그, 월별 관심사 | Google Grounding 사용 |
| **Age Agent** | 나이 기반 분석 | 생년월일 | 인생 단계, 관심사, 가이드라인 | 정적 매핑 |
| **Chart Agent** | 사주 특성 분석 | SajuResult | 개인화 플래그, 금기 주제 | 신살/십성 분석 |
| **Orchestrator** | Agent 조율 | 3개 Agent 결과 | 통합 컨텍스트 | 병렬 실행 후 병합 |
| **Fortune Teller** | 최종 응답 | 통합 컨텍스트 + 질문 | 사용자 응답 | Gemini + Grounding |

### 2.2 Agent 상세 설계

#### 2.2.1 Temporal Agent (시간 축 담당)

```typescript
/**
 * Temporal Agent
 *
 * 역할: 현재 시점의 시간적 맥락을 분석하고,
 *      이 시기에 사람들이 관심 있는 주제를 Google Grounding으로 검색
 *
 * 핵심 원칙:
 * - 월별 관심사는 하드코딩하지 않고 실시간 검색
 * - 세운(년운) 정보는 정확한 계산으로 제공
 * - 시기 플래그(연말, 새해 등)로 모드 결정
 */

interface TemporalAgentInput {
  currentDate: Date;
  userAge: number;        // 나이도 참고 (검색 쿼리에 활용)
  userGender: 'male' | 'female';
  locale: 'ko' | 'en';
}

interface TemporalAgentOutput {
  // 기본 날짜 정보
  date: {
    year: number;
    month: number;
    day: number;
    dayOfWeek: string;
  };

  // 세운 정보 (계산)
  yearPillar: {
    current: YearPillar;    // 올해: 을사년
    next: YearPillar;       // 내년: 병오년
    elementTransition: string;  // "목→화 전환"
  };

  // 시기 플래그
  flags: {
    isYearEnd: boolean;     // 10-12월
    isNewYear: boolean;     // 1-2월
    isLunarNewYear: boolean; // 설날 전후
    isChuseok: boolean;     // 추석 전후
    remainingMonths: number;
  };

  // 🔍 Google Grounding으로 검색한 월별 관심사
  seasonalInterests: {
    searchQuery: string;    // "40대 남성 12월 운세 관심사 2025"
    topics: string[];       // ["한해 정리", "내년 계획", "건강 검진", ...]
    trends: string[];       // 실시간 트렌드
    source: 'grounding';    // 출처 표시
  };

  // 생성된 프롬프트 섹션
  promptSection: string;
}

// Agent 시스템 프롬프트
const TEMPORAL_AGENT_SYSTEM_PROMPT = `
당신은 시간 맥락 분석 전문가입니다.

## 역할
현재 시점을 분석하여 사주 상담에 필요한 시간적 맥락을 제공합니다.

## 핵심 업무
1. 현재 날짜 기반 세운(年運) 계산
2. 시기 플래그 설정 (연말, 새해, 명절 등)
3. **Google 검색을 통한 실시간 월별 관심사 파악**

## Google 검색 쿼리 예시
- "{나이}대 {성별} {월}월 운세 관심사 {년도}"
- "{월}월 사주 상담 인기 주제"
- "{년도}년 {월}월 트렌드"

## 출력 형식
검색 결과를 바탕으로 이 시기에 사람들이 실제로 궁금해하는 것들을 추출하세요.
`;
```

#### 2.2.2 Age Agent (나이 축 담당)

```typescript
/**
 * Age Agent
 *
 * 역할: 사용자의 나이와 인생 단계를 분석하여
 *      적절한 조언 방향과 주의사항을 결정
 *
 * 핵심 원칙:
 * - 나이대별 일반적인 관심사와 고민 매핑
 * - 인생 단계에 맞는 조언 가이드라인 제공
 * - 민감한 주제(결혼, 자녀 등)에 대한 주의사항 설정
 */

interface AgeAgentInput {
  birthYear: number;
  currentDate: Date;
  gender: 'male' | 'female';
  locale: 'ko' | 'en';
}

interface AgeAgentOutput {
  // 나이 정보
  age: {
    korean: number;       // 한국 나이
    western: number;      // 만 나이
    birthYear: number;
  };

  // 인생 단계
  lifeStage: {
    code: LifeStageCode;
    name: string;         // "중년 전환기"
    description: string;  // "인생의 중반, 새로운 방향 모색 시기"
  };

  // 이 나이대의 전형적인 관심사
  typicalConcerns: string[];

  // AI 조언 가이드라인
  guidelines: {
    recommended: string[];  // 권장 조언 방향
    cautions: string[];     // 주의사항
    forbidden: string[];    // 금기 사항
  };

  // 생성된 프롬프트 섹션
  promptSection: string;
}

type LifeStageCode =
  | 'teenager'        // 10대
  | 'early_twenties'  // 20-24세
  | 'late_twenties'   // 25-29세
  | 'early_thirties'  // 30-34세
  | 'late_thirties'   // 35-39세
  | 'early_forties'   // 40-44세
  | 'late_forties'    // 45-49세
  | 'fifties'         // 50-59세
  | 'sixties_plus';   // 60세 이상

// Agent 시스템 프롬프트
const AGE_AGENT_SYSTEM_PROMPT = `
당신은 인생 단계 분석 전문가입니다.

## 역할
사용자의 나이를 분석하여 적절한 상담 방향을 제시합니다.

## 핵심 원칙
1. 나이에 맞는 현실적인 조언 방향 설정
2. 그 나이대의 전형적인 고민과 관심사 파악
3. 민감한 주제에 대한 주의사항 명시

## 중요 규칙
- 결혼, 자녀 유무를 가정하지 말 것
- 나이에 대한 편견 없이 객관적으로 분석
- 각 인생 단계의 다양한 경로 인정

## 나이대별 핵심 포인트
- 20대: 가능성, 도전, 진로
- 30대: 안정, 성장, 관계
- 40대: 전환, 건강, 재정비
- 50대: 성숙, 지혜, 준비
- 60대+: 여유, 건강, 가족
`;
```

#### 2.2.3 Chart Agent (사주 축 담당)

```typescript
/**
 * Chart Agent
 *
 * 역할: 사주팔자의 특성(신살, 십성)을 분석하여
 *      개인화된 조언 방향과 금기 주제를 결정
 *
 * 핵심 원칙:
 * - 신살로 결혼/가정 관련 민감도 판단
 * - 십성으로 직업/재물 성향 판단
 * - 오행으로 건강 취약점 판단
 */

interface ChartAgentInput {
  sajuResult: SajuResult;
  userAge: number;
  locale: 'ko' | 'en';
}

interface ChartAgentOutput {
  // 결혼/가정 관련 분석
  marriageAnalysis: {
    riskLevel: 'low' | 'medium' | 'high';
    avoidTopic: boolean;
    reasoning: string[];
    alternativeTopics: string[];  // 결혼 대신 추천할 주제
  };

  // 직업/커리어 분석
  careerAnalysis: {
    style: CareerStyle;
    strengths: string[];
    recommendations: string[];
  };

  // 재물/투자 분석
  wealthAnalysis: {
    style: 'conservative' | 'moderate' | 'aggressive';
    suitableTypes: string[];
    cautions: string[];
  };

  // 건강 분석
  healthAnalysis: {
    vulnerableAreas: string[];
    recommendations: string[];
  };

  // 추천/금기 주제
  topics: {
    suggested: string[];
    avoid: string[];
  };

  // 생성된 프롬프트 섹션
  promptSection: string;
}

type CareerStyle =
  | 'organizational'  // 조직형 (정관/편관)
  | 'freelance'       // 자유업 (식신/상관)
  | 'business'        // 사업가 (편재)
  | 'creative'        // 창작형 (식신/상관)
  | 'academic';       // 학자형 (인성)

// Agent 시스템 프롬프트
const CHART_AGENT_SYSTEM_PROMPT = `
당신은 사주 특성 분석 전문가입니다.

## 역할
사주팔자의 신살과 십성을 분석하여 개인화된 상담 방향을 제시합니다.

## 핵심 분석 영역

### 1. 결혼/가정 관련 신살 분석
아래 신살이 있으면 결혼 이야기에 주의:
- 역마살: 정착보다 이동 선호, 자유로운 삶
- 화개살: 예술/종교 성향, 비혼 가능성
- 고진살/과숙살: 독립적 성향, 배우자복 약함
- 도화살: 연애 많으나 결혼 어려움

### 2. 직업 성향 분석 (십성 기반)
- 정관/편관 강함 → 조직형, 승진 추구
- 식신/상관 강함 → 창작형, 자유업 적합
- 편재 강함 → 사업가 기질
- 인성 강함 → 학자형, 전문가

### 3. 건강 분석 (오행 기반)
부족한 오행에 따른 취약 장기 파악

## 출력 원칙
- 사주 특성에 맞지 않는 조언은 금기 목록에 추가
- 대안이 되는 긍정적 조언 방향 제시
`;
```

#### 2.2.4 Context Orchestrator (조율자)

```typescript
/**
 * Context Orchestrator
 *
 * 역할: 3개 Agent의 결과를 병합하여
 *      일관된 통합 컨텍스트 생성
 */

interface OrchestratorInput {
  temporalOutput: TemporalAgentOutput;
  ageOutput: AgeAgentOutput;
  chartOutput: ChartAgentOutput;
  locale: 'ko' | 'en';
}

interface OrchestratorOutput {
  // 통합된 컨텍스트
  mergedContext: {
    temporal: TemporalAgentOutput;
    age: AgeAgentOutput;
    chart: ChartAgentOutput;
  };

  // 최종 조언 방향
  advisoryDirection: {
    primaryFocus: string[];      // 주요 상담 방향
    secondaryFocus: string[];    // 보조 상담 방향
    avoidTopics: string[];       // 피해야 할 주제 (모든 Agent에서 수집)
  };

  // 통합 프롬프트 (Fortune Teller Agent에 전달)
  integratedPrompt: string;
}

// Orchestrator 로직
async function orchestrate(input: OrchestratorInput): Promise<OrchestratorOutput> {
  // 1. 금기 주제 통합 (중복 제거)
  const avoidTopics = new Set<string>();

  if (input.chartOutput.marriageAnalysis.avoidTopic) {
    avoidTopics.add('결혼');
    avoidTopics.add('배우자');
    avoidTopics.add('자녀');
  }

  input.ageOutput.guidelines.forbidden.forEach(t => avoidTopics.add(t));
  input.chartOutput.topics.avoid.forEach(t => avoidTopics.add(t));

  // 2. 주요 상담 방향 결정
  const primaryFocus: string[] = [];

  // 시간 기반 (연말이면 회고+전망)
  if (input.temporalOutput.flags.isYearEnd) {
    primaryFocus.push('올해 회고');
    primaryFocus.push('내년 전망');
  }

  // 나이 기반
  primaryFocus.push(...input.ageOutput.typicalConcerns.slice(0, 2));

  // 사주 기반
  primaryFocus.push(...input.chartOutput.topics.suggested.slice(0, 2));

  // 3. 통합 프롬프트 생성
  const integratedPrompt = generateIntegratedPrompt(input, primaryFocus, [...avoidTopics]);

  return {
    mergedContext: {
      temporal: input.temporalOutput,
      age: input.ageOutput,
      chart: input.chartOutput
    },
    advisoryDirection: {
      primaryFocus,
      secondaryFocus: input.chartOutput.topics.suggested,
      avoidTopics: [...avoidTopics]
    },
    integratedPrompt
  };
}
```

---

## 3. Temporal Agent 상세 (시간 축)

### 3.1 현재 날짜 정보 인터페이스

```typescript
interface TemporalContext {
  // 기본 날짜 정보
  currentYear: number;      // 2025
  currentMonth: number;     // 12
  currentDay: number;       // 22

  // 세운 (年運) 정보
  currentYearPillar: YearPillar;
  nextYearPillar: YearPillar;

  // 시기 판단 플래그
  isYearEnd: boolean;       // 10-12월이면 true
  isNewYear: boolean;       // 1-2월이면 true
  remainingMonths: number;  // 올해 남은 개월 수

  // 🔍 Google Grounding으로 실시간 검색한 월별 관심사
  seasonalInterests: SeasonalInterests;
}

interface YearPillar {
  gan: string;            // "을" (乙)
  ji: string;             // "사" (巳)
  ganHanja: string;       // "乙"
  jiHanja: string;        // "巳"
  element: string;        // "목" (木)
  animal: string;         // "뱀"
  fullName: string;       // "을사년"
  fullHanja: string;      // "乙巳年"
}
```

### 3.2 월별 관심사 - Google Grounding 실시간 검색

**기존 방식 (하드코딩) ❌**
```typescript
// 이전: 정적으로 미리 정의
const MONTHLY_TOPICS = {
  1: ['새해 운세', '토정비결'],
  12: ['한해 정리', '내년 전망']
};
```

**새로운 방식 (Google Grounding) ✅**
```typescript
interface SeasonalInterests {
  searchQuery: string;      // 실제 검색에 사용한 쿼리
  topics: string[];         // 검색 결과에서 추출한 관심사
  trends: string[];         // 실시간 트렌드
  confidence: number;       // 결과 신뢰도
  source: 'google_grounding';
  searchedAt: Date;
}

/**
 * Google Grounding을 사용하여 월별 관심사를 실시간 검색
 */
async function searchSeasonalInterests(
  age: number,
  gender: 'male' | 'female',
  month: number,
  year: number,
  locale: 'ko' | 'en'
): Promise<SeasonalInterests> {

  const ageGroup = getAgeGroup(age);  // "40대"
  const genderText = gender === 'male' ? '남성' : '여성';

  // 검색 쿼리 생성
  const searchQuery = locale === 'ko'
    ? `${ageGroup} ${genderText} ${month}월 운세 관심사 고민 ${year}년`
    : `${ageGroup} ${gender} fortune interests concerns ${getMonthName(month)} ${year}`;

  // Google Grounding API 호출
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      tools: [{ googleSearch: {} }],
    },
    contents: [{
      role: 'user',
      parts: [{
        text: `
다음 검색을 수행하고 결과를 분석해주세요:
"${searchQuery}"

이 시기에 ${ageGroup} ${genderText}이 사주/운세 상담에서 주로 관심 갖는 주제를 5개 추출해주세요.
실제 검색 결과와 트렌드를 기반으로 답변하세요.

JSON 형식으로 응답:
{
  "topics": ["주제1", "주제2", ...],
  "trends": ["트렌드1", "트렌드2", ...]
}
        `
      }]
    }]
  });

  // 응답 파싱
  const result = parseGroundingResponse(response);

  return {
    searchQuery,
    topics: result.topics,
    trends: result.trends,
    confidence: 0.85,
    source: 'google_grounding',
    searchedAt: new Date()
  };
}
```

### 3.3 검색 쿼리 예시

| 상황 | 검색 쿼리 | 예상 결과 |
|-----|----------|----------|
| 40대 남성, 12월 | "40대 남성 12월 운세 관심사 2025" | 한해 정리, 내년 계획, 건강검진, 노후준비 |
| 20대 여성, 3월 | "20대 여성 3월 운세 관심사 2025" | 취업, 연애, 새 시작, 자기개발 |
| 30대 남성, 5월 | "30대 남성 5월 운세 관심사 2025" | 결혼, 승진, 내 집 마련, 재테크 |
| 50대 여성, 9월 | "50대 여성 9월 운세 관심사 2025" | 추석, 가족 건강, 자녀 결혼, 노후 |

### 3.4 세운(年運) 계산 로직

```typescript
// 천간 (10개, 4년부터 시작)
const HEAVENLY_STEMS = {
  names: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  hanja: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  elements: ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'],
  yinYang: ['양', '음', '양', '음', '양', '음', '양', '음', '양', '음']
};

// 지지 (12개, 4년부터 시작)
const EARTHLY_BRANCHES = {
  names: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'],
  hanja: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  animals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
  elements: ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수']
};

function getYearlyPillar(year: number): YearPillar {
  const ganIndex = (year - 4) % 10;
  const jiIndex = (year - 4) % 12;

  return {
    gan: HEAVENLY_STEMS.names[ganIndex],
    ji: EARTHLY_BRANCHES.names[jiIndex],
    ganHanja: HEAVENLY_STEMS.hanja[ganIndex],
    jiHanja: EARTHLY_BRANCHES.hanja[jiIndex],
    element: HEAVENLY_STEMS.elements[ganIndex],
    animal: EARTHLY_BRANCHES.animals[jiIndex],
    fullName: `${HEAVENLY_STEMS.names[ganIndex]}${EARTHLY_BRANCHES.names[jiIndex]}년`,
    fullHanja: `${HEAVENLY_STEMS.hanja[ganIndex]}${EARTHLY_BRANCHES.hanja[jiIndex]}年`
  };
}

// 예시
// 2025년 → 을사년 (乙巳年) - 목(木) - 뱀
// 2026년 → 병오년 (丙午年) - 화(火) - 말
```

### 3.5 Temporal Agent 프롬프트 섹션 생성

```typescript
function generateTemporalPromptSection(
  temporal: TemporalAgentOutput,
  locale: 'ko' | 'en'
): string {
  if (locale === 'ko') {
    return `
═══════════════════════════════════════════════════════════════
🕐 시간 컨텍스트 (Temporal Agent 분석 결과)
═══════════════════════════════════════════════════════════════

📅 오늘: ${temporal.date.year}년 ${temporal.date.month}월 ${temporal.date.day}일 (${temporal.date.dayOfWeek})

[세운(年運) 정보]
• 올해: ${temporal.yearPillar.current.fullName} (${temporal.yearPillar.current.fullHanja}) - ${temporal.yearPillar.current.element} 기운
• 내년: ${temporal.yearPillar.next.fullName} (${temporal.yearPillar.next.fullHanja}) - ${temporal.yearPillar.next.element} 기운
• 전환: ${temporal.yearPillar.elementTransition}

[시기 플래그]
${temporal.flags.isYearEnd ? '🎄 연말 모드 활성화 - 올해 회고 + 내년 전망 중심으로' : ''}
${temporal.flags.isNewYear ? '🎍 새해 모드 - 올해 운세 전체 흐름 중심으로' : ''}
• 올해 남은 기간: ${temporal.flags.remainingMonths}개월

[🔍 실시간 검색된 이 시기 관심사] (Google Grounding)
검색어: "${temporal.seasonalInterests.searchQuery}"
${temporal.seasonalInterests.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

[시간 인식 규칙 - 필수]
• 이미 지나간 달(1~${temporal.date.month - 1}월)은 "지난 일"로만 언급
• ${temporal.date.month}월 이후와 내년 위주로 조언
• "지금 ${temporal.date.month}월이니까..." 로 자연스럽게 시작
`;
  }
  return '...'; // English version
}
```

---

## 4. Age Agent 상세 (나이 축)

### 4.1 나이대별 상세 매핑

#### 40대 초반 (40-44세): 중년 전환기 ⭐

```typescript
const EARLY_FORTIES: LifeStageData = {
  code: 'early_forties',
  name: '중년 전환기',
  description: '인생의 중반전, 새로운 방향 모색과 안정 사이의 균형',

  typicalConcerns: [
    '건강 체크 및 관리',
    '자녀 교육 (중고등학생, 있다면)',
    '직장 내 위치와 입지',
    '노후 준비 본격화',
    '부모님 건강 돌봄',
    '인생 2막 고민 시작'
  ],

  guidelines: {
    recommended: [
      '건강 검진 권유 적극적으로',
      '이직보다 안정성 또는 사업 전환 고려 조언',
      '노후 재정 계획 언급 가능',
      '자녀 진로 상담 (있다면)',
      '부모님 건강에 대한 걱정 공감'
    ],
    cautions: [
      '갱년기 언급 시 조심스럽게',
      '은퇴 너무 빨리 언급하지 말 것',
      '젊은 시절과 비교하지 말 것'
    ],
    forbidden: [
      '⛔ 결혼/자녀 유무 절대 가정 금지',
      '⛔ 사주 특성(신살)으로 결혼 성향 판단 필수',
      '⛔ 나이 많다고 기회 없다는 식 금지'
    ]
  }
};
```

#### 전체 인생 단계 매핑

```typescript
const LIFE_STAGE_DATA: Record<LifeStageCode, LifeStageData> = {
  teenager: {
    code: 'teenager',
    name: '청소년기',
    typicalConcerns: ['학업', '진로 탐색', '친구 관계', '자아 정체성'],
    guidelines: {
      recommended: ['미래 가능성 격려', '학업 스트레스 공감', '꿈과 재능 긍정'],
      cautions: ['연애/결혼 가볍게만', '먼 미래 예측 자제'],
      forbidden: ['성인 문제 언급 금지']
    }
  },

  early_twenties: {
    code: 'early_twenties',
    name: '청년 초기',
    typicalConcerns: ['취업 준비', '진로 결정', '첫 연애', '자립 준비'],
    guidelines: {
      recommended: ['가능성과 도전 강조', '사회생활 적응 조언'],
      cautions: ['결혼 압박 자제', '경제적 성공 압박 자제'],
      forbidden: ['조급함 유발 금지']
    }
  },

  late_twenties: {
    code: 'late_twenties',
    name: '청년 후기',
    typicalConcerns: ['이직', '결혼 압박', '재테크', '미래 설계'],
    guidelines: {
      recommended: ['커리어 현실적 조언', '결혼 압박 공감'],
      cautions: ['모든 사람이 결혼 원하지 않음'],
      forbidden: ['취업 못한 경우 자존감 배려']
    }
  },

  early_thirties: {
    code: 'early_thirties',
    name: '장년 초기',
    typicalConcerns: ['결혼/출산 결정', '직장 안정', '내 집 마련'],
    guidelines: {
      recommended: ['중요한 결정 시기 인식', '주거 안정 관심'],
      cautions: ['미혼/비혼 가능성 열어둘 것'],
      forbidden: ['불임/유산 민감 주제 조심']
    }
  },

  late_thirties: {
    code: 'late_thirties',
    name: '장년 후기',
    typicalConcerns: ['자녀 교육', '중간관리자', '건강 관리', '노후 인식'],
    guidelines: {
      recommended: ['건강 조언 시작', '커리어 안정성'],
      cautions: ['자녀 유무 가정 금지'],
      forbidden: ['미혼 결혼 압박 금지']
    }
  },

  early_forties: EARLY_FORTIES,  // 위에서 정의

  late_forties: {
    code: 'late_forties',
    name: '중년기',
    typicalConcerns: ['자녀 대학', '갱년기', '은퇴 계획', '인생 2막'],
    guidelines: {
      recommended: ['건강 관리 강조', '제2의 인생 설계'],
      cautions: ['자녀 없는 경우 배려'],
      forbidden: ['은퇴 불안 자극 금지']
    }
  },

  fifties: {
    code: 'fifties',
    name: '장년기',
    typicalConcerns: ['자녀 독립', '은퇴 준비', '건강', '노후 재정'],
    guidelines: {
      recommended: ['건강 최우선', '은퇴 후 삶 조언'],
      cautions: ['질병/사망 직접 언급 자제'],
      forbidden: ['자녀 없거나 미혼 배려']
    }
  },

  sixties_plus: {
    code: 'sixties_plus',
    name: '노년기',
    typicalConcerns: ['건강 유지', '가족', '여생', '손주'],
    guidelines: {
      recommended: ['건강 장수 기원', '가족 화합', '마음의 평화'],
      cautions: ['외로움 자극 금지'],
      forbidden: ['질병/죽음 직접 언급 금지', '경제적 어려움 자극 금지']
    }
  }
};
```

### 4.2 Age Agent 프롬프트 섹션 생성

```typescript
function generateAgePromptSection(age: AgeAgentOutput, locale: 'ko' | 'en'): string {
  if (locale === 'ko') {
    return `
═══════════════════════════════════════════════════════════════
👤 나이 컨텍스트 (Age Agent 분석 결과)
═══════════════════════════════════════════════════════════════

나이: ${age.age.korean}세 (${age.age.birthYear}년생)
인생 단계: ${age.lifeStage.name}
설명: ${age.lifeStage.description}

[이 나이대 주요 관심사]
${age.typicalConcerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

[✅ 권장 조언 방향]
${age.guidelines.recommended.map(g => `• ${g}`).join('\n')}

[⚠️ 주의사항]
${age.guidelines.cautions.map(c => `• ${c}`).join('\n')}

[⛔ 금기사항 - 반드시 준수]
${age.guidelines.forbidden.map(f => `• ${f}`).join('\n')}
`;
  }
  return '...'; // English version
}
```

---

## 5. Chart Agent 상세 (사주 축)

### 5.1 신살(神煞) 분석 매핑

#### 결혼/가정 관련 신살

| 신살 | 한자 | 결혼 리스크 | AI 대응 |
|-----|-----|-----------|---------|
| **역마살** | 驛馬煞 | 0.30 | 정착보다 이동, 자유로운 삶 권유 |
| **화개살** | 華蓋煞 | 0.25 | 예술/영적 성향, 일반 결혼 부적합 |
| **고진살** | 孤辰煞 | 0.30 | 독립적 성향, 혼자 있기 쉬움 |
| **과숙살** | 寡宿煞 | 0.30 | 자립심 강함, 홀로 지내기 쉬움 |
| **도화살** | 桃花煞 | 0.15 | 연애 많으나 결혼까지 어려움 |
| **홍염살** | 紅艶煞 | 0.20 | 감정 기복, 안정적 관계 어려움 |

```typescript
interface MarriageRiskStar {
  name: string;
  risk: number;  // 0-1
  message: string;
  alternativeTopics: string[];
}

const MARRIAGE_RISK_STARS: Record<string, MarriageRiskStar> = {
  '역마살': {
    name: '역마살',
    risk: 0.30,
    message: '정착보다 이동이 많은 운으로, 자유로운 삶이 더 맞을 수 있습니다',
    alternativeTopics: ['여행운', '해외운', '이직/이동운', '자기계발']
  },
  '화개살': {
    name: '화개살',
    risk: 0.25,
    message: '예술적/영적 성향이 강해 일반적인 결혼생활보다 자신만의 길을 추구합니다',
    alternativeTopics: ['예술운', '영적 성장', '창작 활동', '명상/수행']
  },
  '고진살': {
    name: '고진살',
    risk: 0.30,
    message: '독립적인 성향이 강해 혼자 있는 시간이 필요한 분입니다',
    alternativeTopics: ['독립운', '자기 성찰', '1인 사업', '개인 프로젝트']
  },
  '과숙살': {
    name: '과숙살',
    risk: 0.30,
    message: '자립심이 강하고 혼자서도 잘 지내는 성향입니다',
    alternativeTopics: ['자립운', '재정 독립', '커리어 성장', '자기 개발']
  },
  '도화살': {
    name: '도화살',
    risk: 0.15,
    message: '이성에게 인기가 많지만 진지한 관계까지 가기는 쉽지 않을 수 있습니다',
    alternativeTopics: ['대인관계', '매력 개발', '사회적 인맥', '연애운']
  },
  '홍염살': {
    name: '홍염살',
    risk: 0.20,
    message: '감정 기복이 있어 안정적인 관계 유지에 노력이 필요합니다',
    alternativeTopics: ['감정 관리', '자기 이해', '심리 안정', '취미 생활']
  }
};
```

### 5.2 십성(十星) 기반 커리어 분석

```typescript
interface TenGodCareerMapping {
  tenGod: string;
  careerStyle: CareerStyle;
  weight: number;
  strengths: string[];
  recommendations: string[];
}

const TEN_GOD_CAREER_MAP: TenGodCareerMapping[] = [
  {
    tenGod: '정관',
    careerStyle: 'organizational',
    weight: 2,
    strengths: ['조직 적응력', '규율 준수', '승진 가능성'],
    recommendations: ['대기업', '공기업', '공무원', '전문직']
  },
  {
    tenGod: '편관',
    careerStyle: 'organizational',
    weight: 2,
    strengths: ['리더십', '추진력', '권위'],
    recommendations: ['임원', '군인', '경찰', '정치']
  },
  {
    tenGod: '식신',
    careerStyle: 'creative',
    weight: 2,
    strengths: ['창의력', '표현력', '여유'],
    recommendations: ['예술가', '요리사', '교육자', '콘텐츠 크리에이터']
  },
  {
    tenGod: '상관',
    careerStyle: 'freelance',
    weight: 2,
    strengths: ['독창성', '반골 기질', '자유로움'],
    recommendations: ['프리랜서', '연예인', '작가', '1인 기업']
  },
  {
    tenGod: '편재',
    careerStyle: 'business',
    weight: 2,
    strengths: ['사업 수완', '리스크 감수', '기회 포착'],
    recommendations: ['창업', '투자', '무역', '영업']
  },
  {
    tenGod: '정재',
    careerStyle: 'organizational',
    weight: 1,
    strengths: ['안정 추구', '꼼꼼함', '저축'],
    recommendations: ['회계', '금융', '행정', '관리직']
  },
  {
    tenGod: '정인',
    careerStyle: 'academic',
    weight: 2,
    strengths: ['학습 능력', '연구력', '전문성'],
    recommendations: ['교수', '연구원', '전문가', '학자']
  },
  {
    tenGod: '편인',
    careerStyle: 'academic',
    weight: 2,
    strengths: ['탐구심', '비정통', '독특함'],
    recommendations: ['IT', '철학', '종교', '대안 분야']
  },
  {
    tenGod: '비견',
    careerStyle: 'business',
    weight: 1,
    strengths: ['독립심', '경쟁력', '추진력'],
    recommendations: ['자영업', '스포츠', '경쟁 분야']
  },
  {
    tenGod: '겁재',
    careerStyle: 'freelance',
    weight: 1,
    strengths: ['적극성', '도전 정신', '행동력'],
    recommendations: ['영업', '스타트업', '모험적 분야']
  }
];
```

### 5.3 오행(五行) 기반 건강 분석

```typescript
const ELEMENT_HEALTH_MAP: Record<string, {
  organs: string[];
  vulnerabilities: string[];
  recommendations: string[];
}> = {
  '목': {
    organs: ['간', '담', '눈', '근육', '손발톱'],
    vulnerabilities: ['간 기능 저하', '눈 피로', '근육 경직', '두통'],
    recommendations: ['녹색 채소', '눈 휴식', '스트레칭', '산책']
  },
  '화': {
    organs: ['심장', '소장', '혀', '혈관', '얼굴'],
    vulnerabilities: ['심장 질환', '혈압', '불면', '열감'],
    recommendations: ['유산소 운동', '스트레스 관리', '충분한 수면', '명상']
  },
  '토': {
    organs: ['비장', '위', '입술', '살', '근육'],
    vulnerabilities: ['소화 장애', '체중 문제', '당뇨', '부종'],
    recommendations: ['규칙적 식사', '과식 주의', '단 음식 조절', '걷기']
  },
  '금': {
    organs: ['폐', '대장', '코', '피부', '체모'],
    vulnerabilities: ['호흡기', '피부 트러블', '알레르기', '변비'],
    recommendations: ['금연', '공기 좋은 환경', '피부 보습', '심호흡']
  },
  '수': {
    organs: ['신장', '방광', '귀', '뼈', '골수'],
    vulnerabilities: ['신장', '관절', '청력', '요통', '생식기'],
    recommendations: ['충분한 수분', '허리 관리', '관절 운동', '충분한 휴식']
  }
};
```

### 5.4 Chart Agent 개인화 플래그 추출

```typescript
function extractChartPersonalization(
  sajuResult: SajuResult,
  userAge: number
): ChartAgentOutput {

  const stars = sajuResult.stars || [];
  const tenGods = sajuResult.dominantTenGods || [];
  const lackingElements = sajuResult.lackingElements || [];

  // 1. 결혼 분석
  const marriageAnalysis = analyzeMarriageRisk(stars, userAge);

  // 2. 커리어 분석
  const careerAnalysis = analyzeCareerStyle(tenGods);

  // 3. 건강 분석
  const healthAnalysis = analyzeHealth(lackingElements);

  // 4. 추천/금기 주제 결정
  const topics = determineTopics(marriageAnalysis, careerAnalysis, healthAnalysis);

  return {
    marriageAnalysis,
    careerAnalysis,
    wealthAnalysis: analyzeWealth(tenGods),
    healthAnalysis,
    topics,
    promptSection: generateChartPromptSection(...)
  };
}

function analyzeMarriageRisk(stars: string[], age: number): MarriageAnalysis {
  let totalRisk = 0;
  const reasoning: string[] = [];
  const alternativeTopics: string[] = [];

  for (const star of stars) {
    if (MARRIAGE_RISK_STARS[star]) {
      const riskData = MARRIAGE_RISK_STARS[star];
      totalRisk += riskData.risk;
      reasoning.push(`${star}: ${riskData.message}`);
      alternativeTopics.push(...riskData.alternativeTopics);
    }
  }

  // 나이 팩터: 35세 이상 + 역마/화개살이면 리스크 증가
  if (age >= 35 && (stars.includes('역마살') || stars.includes('화개살'))) {
    totalRisk += 0.2;
    reasoning.push('35세 이상 + 이동/독립 성향 신살 조합');
  }

  const riskLevel = totalRisk >= 0.5 ? 'high' : totalRisk >= 0.3 ? 'medium' : 'low';
  const avoidTopic = riskLevel === 'high' || (riskLevel === 'medium' && age >= 40);

  return {
    riskLevel,
    avoidTopic,
    reasoning,
    alternativeTopics: [...new Set(alternativeTopics)]
  };
}
```

### 5.5 Chart Agent 프롬프트 섹션 생성

```typescript
function generateChartPromptSection(output: ChartAgentOutput, locale: 'ko' | 'en'): string {
  if (locale === 'ko') {
    let prompt = `
═══════════════════════════════════════════════════════════════
🔮 사주 개인화 컨텍스트 (Chart Agent 분석 결과)
═══════════════════════════════════════════════════════════════
`;

    // 결혼 관련 분석
    if (output.marriageAnalysis.avoidTopic || output.marriageAnalysis.riskLevel !== 'low') {
      prompt += `
[⚠️ 결혼/가정 관련 분석]
리스크 레벨: ${output.marriageAnalysis.riskLevel === 'high' ? '🔴 높음' : '🟡 중간'}
${output.marriageAnalysis.avoidTopic ? '→ 결혼/배우자/자녀 이야기 피하기' : '→ 조심스럽게 접근'}

판단 근거:
${output.marriageAnalysis.reasoning.map(r => `• ${r}`).join('\n')}

대안 주제:
${output.marriageAnalysis.alternativeTopics.map(t => `• ${t}`).join('\n')}
`;
    }

    // 커리어 분석
    prompt += `
[💼 직업/커리어 분석]
유형: ${getCareerStyleName(output.careerAnalysis.style)}
강점: ${output.careerAnalysis.strengths.join(', ')}
추천: ${output.careerAnalysis.recommendations.join(', ')}
`;

    // 건강 분석
    if (output.healthAnalysis.vulnerableAreas.length > 0) {
      prompt += `
[🏥 건강 분석]
주의 부위: ${output.healthAnalysis.vulnerableAreas.join(', ')}
권장 사항: ${output.healthAnalysis.recommendations.join(', ')}
`;
    }

    // 추천/금기 주제
    prompt += `
[📋 상담 주제 가이드]
✅ 추천: ${output.topics.suggested.join(', ')}
❌ 피할 것: ${output.topics.avoid.join(', ')}
`;

    return prompt;
  }
  return '...'; // English version
}
```

---

## 6. Context Orchestrator (통합 조율)

### 6.1 Agent 실행 흐름

```typescript
/**
 * 전체 Agent 실행 흐름
 *
 * 1. 3개 Agent 병렬 실행
 * 2. 결과 수집 및 병합
 * 3. 통합 프롬프트 생성
 * 4. Fortune Teller Agent에 전달
 */

async function runPersonalizationEngine(
  sajuResult: SajuResult,
  birthYear: number,
  gender: 'male' | 'female',
  locale: 'ko' | 'en'
): Promise<OrchestratorOutput> {

  const currentDate = new Date();

  // 1. 3개 Agent 병렬 실행
  const [temporalOutput, ageOutput, chartOutput] = await Promise.all([
    runTemporalAgent({
      currentDate,
      userAge: currentDate.getFullYear() - birthYear + 1,
      userGender: gender,
      locale
    }),
    runAgeAgent({
      birthYear,
      currentDate,
      gender,
      locale
    }),
    runChartAgent({
      sajuResult,
      userAge: currentDate.getFullYear() - birthYear + 1,
      locale
    })
  ]);

  // 2. Orchestrator에서 병합
  const orchestratorOutput = await orchestrate({
    temporalOutput,
    ageOutput,
    chartOutput,
    locale
  });

  return orchestratorOutput;
}
```

### 6.2 통합 프롬프트 생성

```typescript
function generateIntegratedPrompt(
  input: OrchestratorInput,
  primaryFocus: string[],
  avoidTopics: string[]
): string {

  const { temporalOutput, ageOutput, chartOutput } = input;

  return `
당신은 40년 경력의 역술가입니다.
수많은 사람들의 운명을 읽어온 노련한 상담가로서,
지금 앞에 있는 분의 상황에 맞는 현실적인 조언을 해주세요.

${temporalOutput.promptSection}

${ageOutput.promptSection}

${chartOutput.promptSection}

═══════════════════════════════════════════════════════════════
🎯 통합 상담 방향 (Orchestrator 결정)
═══════════════════════════════════════════════════════════════

[주요 상담 방향]
${primaryFocus.map((f, i) => `${i + 1}. ${f}`).join('\n')}

[⛔ 금기 주제 - 절대 언급 금지]
${avoidTopics.map(t => `• ${t}`).join('\n')}

═══════════════════════════════════════════════════════════════
💬 대화 규칙
═══════════════════════════════════════════════════════════════

**시간 인식 (필수)**
• "지금 ${temporalOutput.date.month}월이니까..." 로 자연스럽게 시작
• "올해는 이랬고, 내년에는..." 식으로 시제 명확히

**나이 맞춤 (필수)**
• ${ageOutput.age.korean}세에게 현실적인 조언
• 위에 명시된 주의사항 반드시 준수

**사주 개인화 (필수)**
• 분석된 사주 특성 반영한 맞춤 조언
• 금기 주제는 대안 주제로 전환

**말투**
• "음, 보니까요..." "아, 그래서 그런 거예요"
• 따뜻하고 자연스러운 대화체
• 2-3문장으로 핵심만

대화하세요. 설명하지 마세요.
진짜 역술가처럼, 지금 이 사람에게 필요한 말을 해주세요.
`;
}
```

---

## 7. API 수정 명세

### 7.1 Chat API 수정

```typescript
// app/api/saju/chat/route.ts

import { runPersonalizationEngine } from '@/lib/saju/personalization-engine';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, sajuResult, gender, birthYear, locale } = body;

  // 🆕 Multi-Agent 개인화 엔진 실행
  const personalizationContext = await runPersonalizationEngine(
    sajuResult,
    birthYear,
    gender,
    locale
  );

  // 통합 프롬프트를 시스템 프롬프트로 사용
  const systemPrompt = personalizationContext.integratedPrompt;

  // Gemini API 호출
  const response = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '네, 알겠습니다. 상담을 시작하겠습니다.' }] },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ]
  });

  // ...
}
```

### 7.2 새로 생성할 파일 목록

| 파일 | 역할 |
|-----|------|
| `lib/saju/agents/temporal-agent.ts` | Temporal Agent 구현 |
| `lib/saju/agents/age-agent.ts` | Age Agent 구현 |
| `lib/saju/agents/chart-agent.ts` | Chart Agent 구현 |
| `lib/saju/agents/orchestrator.ts` | Context Orchestrator 구현 |
| `lib/saju/personalization-engine.ts` | Agent 실행 엔진 (통합) |
| `lib/saju/constants/life-stages.ts` | 인생 단계 상수 |
| `lib/saju/constants/stars.ts` | 신살 매핑 상수 |
| `lib/saju/constants/ten-gods.ts` | 십성 매핑 상수 |

---

## 8. 예상 결과 비교

### Before (현재)

> 사용자: "내 운세 어때?"
>
> AI: "4월에 직장 운이 좋아집니다. 결혼운도 좋은 시기네요."

**문제점**:
- ❌ 12월인데 4월 언급
- ❌ 역마살 있는데 결혼 언급
- ❌ 44세 맥락 없음

### After (Multi-Agent 시스템)

> 사용자: "내 운세 어때?"
>
> AI: "음, 지금 12월이니까 올해 정리하면서 말씀드릴게요.
>
> 올해 을사년은 이동이 많으셨죠? 역마 기운이 있으셔서 여기저기 바쁘셨을 거예요.
>
> 내년 병오년은 화 기운이 강해지는데, 44세 중반이시니 건강 체크 한번 하시는 게 좋겠어요. 특히 심장이나 혈압 쪽으로요.
>
> 내년 상반기는 좀 보수적으로 가시고, 하반기에 새로운 프로젝트나 이동 계획 잡으시면 잘 맞을 것 같네요."

**개선점**:
- ✅ 현재 12월 인식 (Temporal Agent)
- ✅ 올해 회고 + 내년 전망 (Temporal Agent - 연말 모드)
- ✅ 역마살 특성 반영 (Chart Agent)
- ✅ 44세 맞춤 건강 조언 (Age Agent)
- ✅ 결혼 언급 없음 (Chart Agent - 금기 주제)
- ✅ 구체적 시기 조언 (Orchestrator 통합)

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|-----|------|----------|
| 1.0 | 2025-12-22 | 초기 문서 작성 |
| 1.1 | 2025-12-23 | Multi-Agent 시스템 도입, 월별 관심사 Google Grounding으로 변경 |
