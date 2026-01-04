import { NextRequest, NextResponse } from "next/server";
import {
  getDetailSystemPrompt,
  getDetailPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
  type DetailCategory as PromptDetailCategory,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";
import {
  generateCareerQueries,
  generateWealthQueries,
  generateRelationshipQueries,
  generateHealthQueries,
  generateFortuneQueries,
  generateSajuProfile,
  extractSajuProfile,
  getAgeGroup,
  getGroundingPrompt,
  getGroundingIntensity,
  type GroundingContext,
  type ExtractedSajuProfile,
} from "@/lib/saju/personalized-keywords";
import type { SajuResult } from "@/lib/saju/types";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import { getPersonalizedContext } from "@/lib/saju/agents";
import { isBasicCategory } from "@/lib/saju/basic-analysis-data";

/**
 * 사주 상세 분석 API
 * Google Grounding을 활용하여 현재 시대 트렌드를 반영한 상세 분석 제공
 */

type DetailCategory =
  | "dayMaster"
  | "tenGods"
  | "stars"
  | "fortune"
  | "career"
  | "relationship"
  | "health"
  | "wealth"
  | "personality"  // 종합탭 성격 분석 전용 (dayMaster와 분리)
  | "majorYearly"  // 대운/세운 상세 분석 (combined)
  | "monthlyFortune"  // 월운 상세 분석
  | "majorFortune"  // 대운 전용 상세 분석
  | "yearlyFortune";  // 세운 전용 상세 분석

const validCategories: DetailCategory[] = [
  "dayMaster", "tenGods", "stars", "fortune",
  "career", "relationship", "health", "wealth",
  "personality",  // 종합탭 성격 분석
  "majorYearly",  // 대운/세운 상세 분석 (combined)
  "monthlyFortune",  // 월운 상세 분석
  "majorFortune",  // 대운 전용 상세 분석
  "yearlyFortune"  // 세운 전용 상세 분석
];

// Google Grounding이 필요한 카테고리
const groundingCategories: DetailCategory[] = [
  "career", "wealth", "relationship", "health", "fortune"
];

/**
 * 🆕 v1.6: 토큰 효율성 리팩토링 - 공통 패턴 추출
 * 종합 분석 탭들이 공유하는 공통 지침 (약 40% 토큰 절감)
 */
const COMMON_COMPREHENSIVE_RULES = {
  ko: `### 📌 핵심: 명리학자가 실제로 말하듯이 자연스럽게
**"아까 말씀드렸잖아요" 같은 직접적인 리마인드 금지. 그냥 자연스럽게 이어가세요.**

나쁜 예시 (금지):
- ❌ "아까 말씀드렸잖아요..." / "아까 ~볼 때..."
- ❌ "앞서 살펴본 것처럼..." / "앞서 말씀드린 것처럼..."
- ❌ "~이란 ~에서..." (개념 재설명)`,
  en: `### 📌 KEY: Speak Like a Real Fortune Teller
**No explicit reminders like "Remember when I said..." Just flow naturally.**

Bad examples (forbidden):
- ❌ "Remember when I/we mentioned..." / "Earlier when we looked at..."
- ❌ "As we saw earlier..." / "As I mentioned earlier..."
- ❌ "X means..." (re-explaining concepts)`
};

/**
 * 🆕 카테고리별 콘텐츠 분리 지침 (v1.6 - 토큰 최적화)
 * - 기본 분석: WHAT/WHY (구성 발견, 교육적 설명)
 * - 종합 분석: HOW/WHEN (개인화된 조언, 콜드 리딩)
 */
function getCategoryBoundaryInstructions(category: DetailCategory, locale: string): string {
  const currentYear = new Date().getFullYear();
  const commonRules = locale === 'ko' ? COMMON_COMPREHENSIVE_RULES.ko : COMMON_COMPREHENSIVE_RULES.en;

  // 🆕 v1.6: 카테고리별 고유 콘텐츠만 정의 (공통 부분은 템플릿으로)
  const categoryContent: Record<DetailCategory, { ko: string; en: string }> = {
    dayMaster: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 사주 DNA 발견하기"
일간이 무엇인지, 왜 중요한지 **발견형 스토리텔링**으로 설명

### ✅ 다룰 주제
- 일간의 오행 특성과 자연 상징
- 같은 오행 내 다른 천간과의 비교 (예: 甲木 vs 乙木)
- "10가지 중 이것을 타고났습니다" 식의 발견
- 일간의 기본적인 성격 경향성

### ❌ 다루지 않기
- 구체적 직업/커리어, 투자/재물, 연애/결혼, 건강 조언

### 🔗 마무리
따뜻한 격려: "이 기운을 잘 활용하시면 좋겠어요" 느낌으로.`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Discover Your Saju DNA"
Explain WHAT Day Master is and WHY it matters through **discovery storytelling**

### ✅ Topics
- Day Master's Five Element traits and natural symbols
- Comparison within same element (e.g., 甲Wood vs 乙Wood)
- "You were born with this one out of ten" discovery
- Basic personality tendencies

### ❌ DO NOT Cover
- Specific career, wealth, romance, or health advice

### 🔗 Closing
Warm encouragement: "Use this energy well" or "Your chart has exciting potential."`
    },
    personality: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 성격 심층 해석" (종합)
일간/십성/신살을 **하나의 흐름으로** 실제 삶 이야기로 풀기

${commonRules}

좋은 예시:
"기토시니까요... 땅처럼 묵묵하게 다 받아주시는 분이시잖아요. 어릴 때부터 책임감이 남달랐을 거예요."

### ✅ 다룰 주제
- 일간/십성/신살이 **실제 삶에서 어떻게 나타났는지**
- "어린 시절에는...", "학창 시절에...", "스트레스 받으면..."

### ❌ 다루지 않기
- 구체적인 직업/재테크/연애/건강 조언`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Deep Personality Interpretation" (Comprehensive)
Weave Day Master/Ten Gods/Stars into **one flowing narrative** about real life

${commonRules}

Good example:
"With your Earth energy... you're the grounded type. You probably felt a strong sense of responsibility from early on."

### ✅ Topics
- How traits **manifested in real life**
- "During childhood...", "In school...", "When stressed..."

### ❌ DO NOT Cover
- Specific career, financial, relationship, or health advice`
    },
    career: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 직업운 심층 해석" (종합)
십성/일간을 **직장 생활 이야기로** 풀기

${commonRules}

좋은 예시:
"정관이 강하시니... 직장에서 자꾸 책임지는 자리가 맡겨지셨을 거예요. '네가 좀 맡아줘'라는 말 많이 들으셨죠?"

### ✅ 다룰 주제
- 십성이 **직장에서 어떻게 나타났는지**
- "첫 직장에서...", "상사랑 관계는...", ${currentYear}년 트렌드 반영

### ❌ 다루지 않기
- 투자/재테크, 연애/결혼, 건강 조언`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Deep Career Fortune" (Comprehensive)
Weave Ten Gods/Day Master into **workplace stories** naturally

${commonRules}

Good example:
"With Official energy strong... you kept getting pushed into leadership roles. People kept saying 'You handle this,' right?"

### ✅ Topics
- How Ten Gods **manifested at work**
- "First job...", "Boss relationships...", ${currentYear} trends

### ❌ DO NOT Cover
- Investment, relationship, or health advice`
    },
    wealth: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 재물운 심층 해석" (종합)
십성/일간을 **돈과 재물 이야기로** 풀기

${commonRules}

좋은 예시:
"정재가 강하시니... 돈 문제에서 신중하신 분이에요. 충동구매? 거의 안 하시죠?"

### ✅ 다룰 주제
- 십성이 **돈 벌고 쓰는 방식에 어떻게 나타났는지**
- "저축파세요, 소비파세요?", 과거 재정 공감, ${currentYear}년 재물 방향

### ❌ 다루지 않기
- 직업/커리어, 연애/결혼, 건강 조언`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Deep Wealth Fortune" (Comprehensive)
Weave Ten Gods/Day Master into **money stories** naturally

${commonRules}

Good example:
"With Direct Wealth strong... you're careful with money. Impulse purchases? Not your thing."

### ✅ Topics
- How Ten Gods **manifested in earning/spending**
- "Saver or spender?", past finances, ${currentYear} wealth direction

### ❌ DO NOT Cover
- Career, romance, or health advice`
    },
    relationship: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 관계운 심층 해석" (종합)
십성/일간을 **연애와 인간관계 이야기로** 풀기

${commonRules}

좋은 예시:
"이렇게 다 받아주시는 분이시니... 연애할 때도 상대방을 많이 챙기셨을 거예요. 근데 가끔 힘드셨죠?"

### ✅ 다룰 주제
- 십성/성격이 **연애 패턴에 어떻게 나타났는지**
- "첫사랑 타입은...", "먼저 고백하세요?", 과거/앞으로의 인연 시기

### ❌ 다루지 않기
- 직업/커리어, 투자/재테크, 건강 조언`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Deep Relationship Fortune" (Comprehensive)
Weave Ten Gods/Day Master into **romance stories** naturally

${commonRules}

Good example:
"Since you embrace everything... you probably took good care of partners. But that was tiring sometimes, right?"

### ✅ Topics
- How traits **manifested in dating patterns**
- "First love type...", "Confess first?", past/future timing

### ❌ DO NOT Cover
- Career, financial, or health advice`
    },
    health: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 건강운 심층 해석" (종합)
일간/오행을 **건강 이야기로** 풀기

${commonRules}

좋은 예시:
"토가 강하시니... 소화기가 예민하실 거예요. 스트레스 받으면 밥맛 먼저 없어지시죠?"

### ✅ 다룰 주제
- 오행 밸런스가 **실제 건강에 어떻게 나타났는지**
- "어렸을 때 병원...", "스트레스 받으면 어디가...", 건강 주의 시기

### ❌ 다루지 않기
- 직업/커리어, 투자/재테크, 연애/결혼 조언`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Deep Health Fortune" (Comprehensive)
Weave Day Master/Five Elements into **health stories** naturally

${commonRules}

Good example:
"With Earth strong... your digestion is probably sensitive. When stressed, appetite goes first, right?"

### ✅ Topics
- How Five Elements **manifested in actual health**
- "Doctor visits as kid...", "When stressed, what first?", caution periods

### ❌ DO NOT Cover
- Career, financial, or romance advice`
    },
    fortune: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 인생 타임라인 파악하기"
대운/세운/월운이 무엇인지 **타임라인 스토리텔링**으로 설명

### ✅ 다룰 주제
- 대운(10년), 세운(1년), 월운(1달)의 개념
- 현재 위치: "지금 몇 번째 대운인지" 시각화
- 순행/역행 흐름 방향

### ❌ 다루지 않기
- 구체적인 직업/투자/연애/건강 타이밍 조언

### 🔗 마무리
희망적 격려: "이 에너지를 믿고 가시면 됩니다" 느낌으로.`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Map Your Life Timeline"
Explain Major/Annual/Monthly fortune through **timeline storytelling**

### ✅ Topics
- Concepts: Major(10yr), Annual(1yr), Monthly(1mo) Fortune
- Current position: "Which Major Fortune period?" visualization
- Forward/backward flow direction

### ❌ DO NOT Cover
- Specific career/investment/romance/health timing

### 🔗 Closing
Hopeful encouragement: "Trust this energy and move forward."`
    },
    tenGods: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 에너지 지도 탐험하기"
십성이 무엇인지, 에너지 분포가 어떤지 **탐험형 스토리텔링**으로 설명

### ✅ 다룰 주제
- 10가지 십성의 의미와 역할
- 어떤 십성이 강하고 약한지 분포
- "풍부한 에너지 vs 보완 필요한 에너지" 발견
- 십성 간 상호작용

### ❌ 다루지 않기
- 구체적인 직업/재물/연애/건강 조언

### 🔗 마무리
따뜻한 격려: "이 에너지들이 삶에서 빛을 발할 거예요" 느낌으로.`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Explore Your Energy Map"
Explain Ten Gods and energy distribution through **exploration storytelling**

### ✅ Topics
- Meaning and role of all 10 Ten Gods
- Which are strong/weak in this chart
- "Abundant vs needs supplementing" discovery
- Ten Gods interactions

### ❌ DO NOT Cover
- Specific career/wealth/romance/health advice

### 🔗 Closing
Warm encouragement: "These energies will shine through your life."`
    },
    stars: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "나의 특수 카드 컬렉션 발견하기"
신살이 무엇인지, 어떤 특수 카드를 가졌는지 **게임형 스토리텔링**으로 설명

### ✅ 다룰 주제
- 신살이란? (사주의 특수 별자리/카드)
- 이 분이 가진 신살들
- 🌟 길신 vs ⚠️ 흉신 vs 🔮 중성 분류
- "당신의 덱 구성" 카드 컬렉션 개념

### ❌ 다루지 않기
- 구체적인 직업/재물/연애/건강 조언

### 🔗 마무리
희망적 격려: "이 특별한 기운이 좋은 순간에 빛날 거예요" 느낌으로.`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Discover Your Special Card Collection"
Explain Special Stars through **gamified storytelling**

### ✅ Topics
- What are Special Stars? (celestial markers/cards)
- Types and meanings of stars you have
- 🌟 Lucky vs ⚠️ Caution vs 🔮 Neutral classification
- "Your deck composition" concept

### ❌ DO NOT Cover
- Specific career/wealth/romance/health advice

### 🔗 Closing
Hopeful encouragement: "These special energies will shine at the right moments."`
    },
    majorYearly: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "삶의 큰 물결 읽기 - 대운과 세운"
대운(10년 주기)과 세운(연간)의 흐름을 **서사적으로** 설명

### ✅ 다룰 주제
- 대운의 의미와 현재 대운 분석
- 세운의 흐름과 올해의 위치
- 향후 5년 세운 전망
- 대운-세운의 상호작용
- 중요한 시기와 활용 전략

### ❌ 다루지 않기
- 월운/일운 등 세부 단위 분석 (별도 분석)
- 구체적 날짜 예측이나 로또 번호

### 🔗 마무리
희망적 메시지: "큰 흐름을 이해하면 작은 파도에 흔들리지 않아요"`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Reading Life's Big Waves - Major & Annual Luck"
Explain Major Luck (10-year cycles) and Annual Luck through **narrative storytelling**

### ✅ Topics
- Meaning and analysis of current Major Luck period
- Annual Luck flow and this year's position
- 5-year Annual Luck forecast
- Major-Annual Luck interactions
- Important timing and utilization strategies

### ❌ DO NOT Cover
- Monthly/daily luck details (separate analysis)
- Specific date predictions or lottery numbers

### 🔗 Closing
Hopeful message: "Understanding the big waves helps you stay steady through small ripples."`
    },
    monthlyFortune: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "12개월 월운(月運) 상세 분석"
서론/종합 분석 없이 **바로 월별 상세 분석**으로 시작

### ⚠️ 중요: 출력 형식
- 서론, 공감 문장, 상반기/하반기 요약, 종합 분석 등 **일체 생략**
- 바로 월별 분석으로 시작
- 올해(${new Date().getFullYear()}년) **12개월 전체** 상세 분석

### 🕐 시간에 따른 톤 구분 (오늘: ${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월)
**${new Date().getMonth() + 1}월 이전의 지난 달들**: 회고적/추정 톤
- "~하셨을 거예요", "~했던 시기였을 것입니다", "아마 ~느끼셨을 수 있어요"
- 두루뭉실하고 완곡한 표현 사용
- 확정적 단언 피하기 (예: "~했습니다" ❌ → "~하셨을 가능성이 높습니다" ✅)

**${new Date().getMonth() + 1}월(현재) 및 그 이후 달들**: 기존 예측/조언 톤
- "~하시면 좋겠습니다", "~에 집중하세요", "~할 때입니다"
- 구체적이고 적극적인 조언
- 명확한 방향 제시

### ✅ 각 월별 필수 포함 항목
각 월마다 아래 항목을 **모두** 상세히 분석:
1. **월간 천간 영향**: 해당 월 천간이 일간에 미치는 작용
2. **월간 지지 영향**: 해당 월 지지와 원국 지지의 상호작용 (충/합/형 등)
3. **세운과의 복합**: 올해 세운과 해당 월운의 복합 작용
4. **적합한 활동**: 그 달에 추진하면 좋은 일 (구체적으로) - 지난 달은 "~하셨다면 좋았을 것" 형식
5. **주의 사항**: 그 달에 조심해야 할 점 (구체적으로) - 지난 달은 "~조심하셨어야 했을" 형식

### 📅 월별 출력 형식 예시
📆 1월 [己丑월]: ⭐⭐⭐⭐
- **월간 천간 영향**: ...
- **월간 지지 영향**: ...
- **세운과의 복합**: ...
- **적합한 활동**: ...
- **주의 사항**: ...

(1월부터 12월까지 12개월 모두 동일 형식으로, 단 톤은 시간에 따라 구분)

### ❌ 절대 하지 않기
- 서론 문장 (예: "올해는 ~한 해입니다", "그동안 ~하셨지요?")
- 공감/위로 문단
- 상반기/하반기 요약 문단
- 종합 정리나 마무리 코멘트 (간단한 한 줄 격려만 허용)

### 🔗 마무리
**오직 한 줄만**: "매달의 리듬을 타면 한 해가 순탄해집니다."`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "12-Month Monthly Fortune (月運) Detailed Analysis"
Start **directly with month-by-month analysis** without intro/summary

### ⚠️ Important: Output Format
- **Omit all**: introductions, empathy phrases, half-year summaries, comprehensive analysis
- Start directly with monthly analysis
- Analyze all **12 months** of this year (${new Date().getFullYear()})

### 🕐 Temporal Tone Differentiation (Today: ${new Date().getFullYear()}, Month ${new Date().getMonth() + 1})
**Months before Month ${new Date().getMonth() + 1}**: Retrospective/speculative tone
- "You may have experienced...", "It was likely a period of...", "Perhaps you felt..."
- Use vague, soft expressions
- Avoid definitive assertions (e.g., "You did X" ❌ → "You likely experienced X" ✅)

**Month ${new Date().getMonth() + 1} (current) and after**: Predictive/advisory tone
- "You should...", "Focus on...", "This is the time to..."
- Specific and proactive advice
- Clear direction

### ✅ Required Items for Each Month
Analyze each month with **all** of these items in detail:
1. **Monthly Stem Influence**: How that month's heavenly stem affects Day Master
2. **Monthly Branch Influence**: Interactions between month's branch and natal branches (clash/harmony/punishment)
3. **Combined with Annual Fortune**: Combined effect of this year's fortune and that month
4. **Suitable Activities**: What to pursue that month (specific) - for past months: "It would have been good to..."
5. **Cautions**: What to be careful about that month (specific) - for past months: "You should have been careful of..."

### 📅 Monthly Output Format Example
📆 January [己丑]: ⭐⭐⭐⭐
- **Monthly Stem Influence**: ...
- **Monthly Branch Influence**: ...
- **Combined with Annual Fortune**: ...
- **Suitable Activities**: ...
- **Cautions**: ...

(Same format for all 12 months, but tone varies based on time)

### ❌ Never Do
- Intro sentences (e.g., "This year is ~", "You have been ~")
- Empathy/comfort paragraphs
- First half/second half summary paragraphs
- Comprehensive wrap-up (only single-line encouragement allowed)

### 🔗 Closing
**Only one line**: "Riding monthly rhythms makes the year smooth."`
    },
    majorFortune: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "인생의 큰 물결 - 대운 심층 분석"
대운(10년 주기)의 흐름을 **서사적으로** 깊이 있게 분석

### 🕐 시간에 따른 톤 구분 (기준: ${new Date().getFullYear()}년)
**이미 지나간 대운들** (현재 대운 이전):
- 회고적/추정 톤: "~하셨을 거예요", "~했던 시기였을 것입니다"
- 두루뭉실하고 완곡한 표현 사용
- "그 시절에는 ~느끼셨을 수 있어요", "~하셨을 가능성이 높습니다"

**현재 대운**:
- 현재 진행형 톤: "지금은 ~하고 계실 거예요", "현재 ~한 시기를 보내고 계십니다"
- 현재 상황에 대한 공감과 조언

**앞으로 올 대운들**:
- 예측/조언 톤: "~하시면 좋겠습니다", "~에 집중하세요", "~할 때입니다"
- 구체적이고 적극적인 조언
- 명확한 방향 제시

### ✅ 다룰 주제
- 대운의 원리와 계산 방식
- 태어난 이후부터 현재까지의 대운 흐름 회고 (회고적 톤으로)
- 현재 대운의 천간/지지 특성과 일간과의 관계 (현재 진행형 톤으로)
- 향후 대운들의 전망 (8~10개 대운 분석, 예측 톤으로)
- 대운별 10년간의 핵심 기회와 도전
- 대운 교체기(교운기)의 특성

### ❌ 다루지 않기
- 세운(연운) 분석 (별도 버튼으로 분리)
- 월운/일운 분석
- 구체적 날짜 예측

### 🔗 마무리
희망적 메시지: "큰 강물의 흐름을 알면 노를 저을 때를 알 수 있어요"`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "Life's Big Waves - Major Fortune Deep Analysis"
Analyze Major Fortune (10-year cycles) through **deep narrative storytelling**

### 🕐 Temporal Tone Differentiation (Reference: ${new Date().getFullYear()})
**Past Major Fortunes** (before current):
- Retrospective/speculative tone: "You may have experienced...", "It was likely a period of..."
- Use vague, soft expressions
- "During that time, you might have felt...", "There's a good chance you..."

**Current Major Fortune**:
- Present progressive tone: "You are currently...", "Right now you are going through..."
- Empathy and advice for current situation

**Future Major Fortunes**:
- Predictive/advisory tone: "You should...", "Focus on...", "This will be a time to..."
- Specific and proactive advice
- Clear direction

### ✅ Topics
- Principles and calculation of Major Fortune
- Retrospective from birth to current Major Fortune (in retrospective tone)
- Current Major Fortune's stem/branch traits and relationship with Day Master (in present tone)
- Future Major Fortune outlook (8-10 periods, in predictive tone)
- Core opportunities and challenges for each 10-year period
- Characteristics of Major Fortune transition periods

### ❌ DO NOT Cover
- Annual Fortune analysis (separate button)
- Monthly/daily fortune analysis
- Specific date predictions

### 🔗 Closing
Hopeful message: "Knowing the river's flow helps you know when to row."`
    },
    yearlyFortune: {
      ko: `\n\n## 📋 콘텐츠 역할 지침

### 🏷️ "10년간의 세운(歲運) 상세 분석"
서론/종합 분석 없이 **바로 년도별 상세 분석**으로 시작

### ⚠️ 중요: 출력 형식
- 서론, 공감 문장, 종합 분석 등 **일체 생략**
- 바로 년도별 분석으로 시작
- 현재 연도 기준 2년 전 ~ 8년 후 = **총 10년간** 분석

### 🕐 시간에 따른 톤 구분 (올해: ${new Date().getFullYear()}년)
**${new Date().getFullYear()}년 이전의 지난 해들**: 회고적/추정 톤
- "~하셨을 거예요", "~했던 해였을 것입니다", "아마 ~느끼셨을 수 있어요"
- 두루뭉실하고 완곡한 표현 사용
- 확정적 단언 피하기 (예: "~했습니다" ❌ → "~하셨을 가능성이 높습니다" ✅)

**${new Date().getFullYear()}년(올해) 및 그 이후 해들**: 기존 예측/조언 톤
- "~하시면 좋겠습니다", "~에 집중하세요", "~할 때입니다"
- 구체적이고 적극적인 조언
- 명확한 방향 제시

### ✅ 각 년도별 필수 포함 항목
각 년도마다 아래 항목을 **모두** 상세히 분석:
1. **천간 영향**: 해당 년도 천간이 일간에 미치는 영향
2. **지지 영향**: 해당 년도 지지와 원국 지지의 상호작용
3. **대운과의 복합**: 현재 대운과 해당 세운의 복합 작용
4. **기회 요인**: 그 해에 잡아야 할 기회 (구체적으로) - 지난 해는 "~하셨다면 좋았을 것" 형식
5. **주의 요인**: 그 해에 조심해야 할 점 (구체적으로) - 지난 해는 "~조심하셨어야 했을" 형식

### 📅 년도별 출력 형식 예시
🗓️ 2024년 [甲辰]: ⭐⭐⭐⭐
- **천간 영향**: ...
- **지지 영향**: ...
- **대운과의 복합**: ...
- **기회 요인**: ...
- **주의 요인**: ...

(10개 년도 모두 동일 형식으로, 단 톤은 시간에 따라 구분)

### ❌ 절대 하지 않기
- 서론 문장 (예: "당신은 ~입니다", "그동안 ~하셨지요?")
- 공감/위로 문단
- 종합 분석 문단
- 대운 분석 (별도 버튼)
- 월운/일운 분석

### 🔗 마무리
10개 년도 분석 후 한 줄: "한 해 한 해가 모여 인생이 됩니다. 올해를 잘 보내세요"`,
      en: `\n\n## 📋 Content Role Instructions

### 🏷️ "10-Year Annual Fortune (歲運) Detailed Analysis"
Start **directly with year-by-year analysis** without introduction

### ⚠️ Important: Output Format
- Skip introduction, empathy statements, and general analysis
- Start immediately with yearly analysis
- Analyze **10 years total**: 2 years before ~ 8 years after current year

### 🕐 Temporal Tone Differentiation (This year: ${new Date().getFullYear()})
**Years before ${new Date().getFullYear()}**: Retrospective/speculative tone
- "You may have experienced...", "It was likely a year of...", "Perhaps you felt..."
- Use vague, soft expressions
- Avoid definitive assertions (e.g., "You did X" ❌ → "You likely experienced X" ✅)

**${new Date().getFullYear()} (this year) and after**: Predictive/advisory tone
- "You should...", "Focus on...", "This is the time to..."
- Specific and proactive advice
- Clear direction

### ✅ Required Items for Each Year
Include ALL of the following for each year:
1. **Stem Influence**: Impact of that year's heavenly stem on Day Master
2. **Branch Influence**: Interaction between year's branch and birth chart branches
3. **Major Fortune Combination**: Combined effect with current Major Fortune
4. **Opportunities**: Specific opportunities to seize that year - for past years: "It would have been good to..."
5. **Cautions**: Specific things to be careful about - for past years: "You should have been careful of..."

### 📅 Year Format Example
🗓️ 2024 [甲辰]: ⭐⭐⭐⭐
- **Stem Influence**: ...
- **Branch Influence**: ...
- **Major Fortune Combination**: ...
- **Opportunities**: ...
- **Cautions**: ...

(Same format for all 10 years, but tone varies based on time)

### ❌ DO NOT Include
- Introduction sentences (e.g., "You are like a...")
- Empathy/comfort paragraphs
- General analysis paragraphs
- Major Fortune analysis (separate button)
- Monthly/daily fortune analysis

### 🔗 Closing
Single line after 10 years: "Year by year builds a life. Make this year count."`
    }
  };

  const content = categoryContent[category];
  return content ? (locale === 'ko' ? content.ko : content.en) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, sajuContext, sajuResult, gender, birthYear, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!category || !sajuContext) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'categoryAndContextRequired') },
        { status: 400 }
      );
    }

    if (!validCategories.includes(category as DetailCategory)) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'invalidCategory') },
        { status: 400 }
      );
    }

    const genderText = getGenderLabel(locale, gender === "female" ? "female" : "male");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();

    // Initialize Google GenAI (dynamic import to prevent build-time evaluation)
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });

    // Check if this category needs Google Grounding
    const needsGrounding = groundingCategories.includes(category as DetailCategory);

    // 초개인화 컨텍스트 생성 (Multi-Agent System)
    // 🆕 v1.2: 카테고리별 필터링으로 중복 방지
    let personalizedContext = "";
    if (sajuResult && birthYear) {
      try {
        const parsedSajuResult: SajuResult = typeof sajuResult === 'string'
          ? JSON.parse(sajuResult)
          : sajuResult;

        personalizedContext = await getPersonalizedContext(
          parsedSajuResult,
          birthYear,
          gender === "female" ? "female" : "male",
          locale,
          undefined,  // userQuery
          category as DetailCategory  // 🆕 카테고리별 콘텐츠 필터링
        );
      } catch (e) {
        console.error("Failed to generate personalized context:", e);
      }
    }

    // 현재 날짜 컨텍스트 추가
    const dateContext = locale === 'ko'
      ? `\n\n## 현재 시점\n오늘은 ${currentYear}년 ${currentMonth}월 ${currentDay}일입니다.`
      : `\n\n## Current Date\nToday is ${currentMonth}/${currentDay}/${currentYear}.`;

    // 🆕 v1.5: 프롬프트 순서 최적화 - 핵심 지침을 먼저 배치
    // 1. 카테고리별 콘텐츠 분리 지침 (가장 중요 - 무엇을 다룰지/다루지 않을지)
    const categoryBoundaryInstructions = getCategoryBoundaryInstructions(category as DetailCategory, locale);

    // Build the prompt (최적화된 순서)
    let prompt = locale === 'ko'
      ? `## 분석 요청\n다음은 ${genderText}의 사주 정보입니다.${categoryBoundaryInstructions}\n\n## 사주 데이터\n${sajuContext}\n\n## 분석 과제\n${getDetailPrompt(locale, category as DetailCategory)}${dateContext}`
      : `## Analysis Request\nThe following is the birth chart information for a ${genderText}.${categoryBoundaryInstructions}\n\n## Birth Chart Data\n${sajuContext}\n\n## Analysis Task\n${getDetailPrompt(locale, category as DetailCategory)}${dateContext}`;

    // 🆕 v1.3: 기본 분석 vs 종합 분석 구분
    const isBasicAnalysis = isBasicCategory(category);

    // 컨텍스트 추가 (기본 분석: 교육적 설명 / 종합 분석: Cold Reading 스타일)
    if (personalizedContext) {
      if (isBasicAnalysis) {
        // 🆕 기본 분석 카테고리: 교육적 설명 컨텍스트 (Cold Reading 아님)
        if (locale === 'ko') {
          prompt += `\n\n## 📚 사주 구성 설명 컨텍스트

${personalizedContext}

---
위 내용을 바탕으로 **교육적으로** 이 분의 사주 구성을 설명해주세요.
- "~이란 무엇인가", "이 분의 ~은/는..." 형식으로 설명
- 개인화된 조언(직업, 재물, 연애 등)은 종합 분석 탭에서 다루므로 여기서는 제외
- 순수하게 사주 구성 요소의 의미와 특성에 집중`;
        } else {
          prompt += `\n\n## 📚 Saju Composition Explanation Context

${personalizedContext}

---
Based on the above, please provide an **educational** explanation of this person's Saju composition.
- Use format: "What is...?", "This person's ... is/has..."
- Personalized advice (career, wealth, romance) is covered in comprehensive tabs, so exclude here
- Focus purely on the meaning and characteristics of the Saju components`;
        }
      } else {
        // 🆕 v1.6: 운세(Fortune) 카테고리는 Cold Reading 스타일 제외 - 순수 분석 형식만 사용
        const fortuneCategories = ['majorFortune', 'yearlyFortune', 'monthlyFortune', 'fortuneOverview'];
        const isFortuneCategory = fortuneCategories.includes(category);

        if (isFortuneCategory) {
          // 운세 카테고리: Cold Reading 없이 순수 분석만
          if (locale === 'ko') {
            prompt += `\n\n## 📊 참고 컨텍스트

${personalizedContext}

---
위 컨텍스트를 참고하여 **카테고리별 출력 형식 지침을 엄격히 따라** 분석해주세요.
서론, 공감 문장, 종합 분석 문단 없이 바로 본론(년도별/기간별 분석)으로 시작하세요.`;
          } else {
            prompt += `\n\n## 📊 Reference Context

${personalizedContext}

---
Use the above context and **strictly follow the category output format instructions**.
Start directly with the main content (year-by-year/period analysis) without introduction, empathy, or summary paragraphs.`;
          }
        } else {
          // 종합 분석 카테고리: Cold Reading 스타일 유지
          if (locale === 'ko') {
            prompt += `\n\n## 🎯 초개인화 컨텍스트 (반드시 활용할 것!)

아래 내용은 이 분의 사주를 바탕으로 추론한 삶의 경험입니다.
**반드시** 아래 내용을 활용하여 "~하셨던 적이 있으시죠?", "~하셨을 거예요" 식으로 공감하며 답변하세요.

${personalizedContext}

---
위 초개인화 컨텍스트를 기반으로 콜드 리딩 스타일로 답변해주세요.`;
          } else {
            prompt += `\n\n## 🎯 Hyper-Personalized Context (MUST USE!)

The following content is inferred life experiences based on this person's birth chart.
**You MUST** use this content to show empathy like "You've probably experienced...", "Haven't you felt...?"

${personalizedContext}

---
Please respond in a cold reading style based on the above personalized context.`;
          }
        }
      }
    }

    // 🆕 v1.5: categoryBoundaryInstructions는 이미 프롬프트 시작 부분에 포함됨 (순서 최적화)

    // Add grounding context if needed and sajuResult is available
    let extractedProfile: ExtractedSajuProfile | null = null;
    let searchQueries: string[] = [];
    // 🆕 Phase 6: 그라운딩 강도 (전체 스코프에서 접근 가능하도록)
    const groundingIntensityLevel = getGroundingIntensity(category as string);

    if (needsGrounding && sajuResult) {
      const parsedSajuResult: SajuResult = typeof sajuResult === 'string'
        ? JSON.parse(sajuResult)
        : sajuResult;

      // 🆕 현재 나이 계산 (한국 나이)
      const currentAge = birthYear ? currentYear - birthYear + 1 : undefined;

      // 🆕 Phase 3: 구조화된 사주 프로필 추출
      extractedProfile = extractSajuProfile(parsedSajuResult);

      const groundingContext: GroundingContext = {
        currentYear,
        currentMonth,
        ageGroup: birthYear ? getAgeGroup(birthYear, currentYear) : "30대",
        currentAge,
        sajuResult: parsedSajuResult,
      };

      // Generate personalized search queries based on category
      switch (category) {
        case "career":
          searchQueries = generateCareerQueries(groundingContext);
          break;
        case "wealth":
          searchQueries = generateWealthQueries(groundingContext);
          break;
        case "relationship":
          searchQueries = generateRelationshipQueries(groundingContext);
          break;
        case "health":
          searchQueries = generateHealthQueries(groundingContext);
          break;
        case "fortune":
          searchQueries = generateFortuneQueries(groundingContext);
          break;
      }

      // Generate saju profile summary (🆕 대운 정보 포함)
      const sajuProfile = generateSajuProfile(parsedSajuResult, currentAge);

      // 🆕 Phase 3: 개인화된 특성 프롬프트에 추가
      if (locale === 'ko') {
        prompt += `\n\n## 이 분의 사주 특성 (개인화 핵심 정보)
- 성향: ${extractedProfile.personality}
- 적합 분야: ${extractedProfile.suitableIndustry}
- 투자 스타일: ${extractedProfile.investmentStyle}
- 강점: ${extractedProfile.strengths}
- 적합 직업: ${extractedProfile.careerTypes}`;
      } else {
        prompt += `\n\n## This Person's BaZi Traits (Core Personalization)
- Personality: ${extractedProfile.personality}
- Suitable Industries: ${extractedProfile.suitableIndustry}
- Investment Style: ${extractedProfile.investmentStyle}
- Strengths: ${extractedProfile.strengths}
- Career Types: ${extractedProfile.careerTypes}`;
      }

      // 🆕 Phase 6: 카테고리별 그라운딩 강도 적용
      const groundingPromptText = getGroundingPrompt(category, locale, currentYear);

      // Enhance prompt with grounding instructions
      if (locale === 'ko') {
        prompt += `\n\n## 현재 시대 상황 반영

${groundingPromptText}

### 이 분의 사주 프로필
${sajuProfile}

### 검색 고려 주제
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

### 분석 가이드라인
${groundingIntensityLevel === 'HIGH' ? `- **핵심**: 위 주제들을 반드시 검색하고, ${currentYear}년 실제 데이터와 트렌드를 인용하세요
- 구체적인 수치, 통계, 최신 뉴스를 포함해야 신뢰도가 높아집니다` :
groundingIntensityLevel === 'MEDIUM' ? `- 시의성 있는 정보가 도움이 된다면 검색 결과를 인용하세요
- "요즘 시대에는...", "현재 ${currentYear}년 트렌드를 보면..." 같은 표현으로 시대상 반영` :
`- 전통적인 사주 해석을 중심으로 답변하세요
- 최신 트렌드는 보조적으로만 활용하세요`}

⚠️ **중요**: 위의 트렌드 정보는 보조 자료입니다.
반드시 "초개인화 컨텍스트"의 삶의 경험 내용을 먼저 활용하여 콜드 리딩 스타일로 답변하세요!
"~하셨던 적이 있으시죠?", "~하셨을 거예요" 식의 공감 표현이 최우선입니다.`;
      } else {
        prompt += `\n\n## Reflect Current Trends

${groundingPromptText}

### This Person's BaZi Profile
${sajuProfile}

### Topics to Consider Searching
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

### Analysis Guidelines
${groundingIntensityLevel === 'HIGH' ? `- **KEY**: You MUST search the above topics and cite actual ${currentYear} data and trends
- Include specific numbers, statistics, and recent news for credibility` :
groundingIntensityLevel === 'MEDIUM' ? `- Cite search results when timely information would be helpful
- Use expressions like "In today's world...", "Looking at ${currentYear} trends..."` :
`- Focus on traditional birth chart interpretation
- Use current trends only as supplementary information`}

⚠️ **IMPORTANT**: The above trend info is supplementary.
You MUST first use the "Hyper-Personalized Context" life experiences with cold reading style!
Empathetic expressions like "You've probably...", "Haven't you...?" are the TOP PRIORITY.`;
      }
    }

    // Build config with or without Google Search tool
    const config = needsGrounding ? {
      tools: [{ googleSearch: {} }],
    } : {};

    // Streaming response using Server-Sent Events
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Gemini API with streaming
          const response = await ai.models.generateContentStream({
            model: GEMINI_MODEL,
            config,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${getDetailSystemPrompt(locale, currentYear, category as PromptDetailCategory)}\n\n${prompt}`,
                  },
                ],
              },
            ],
          });

          let fullText = "";

          // Stream text chunks as they arrive
          for await (const chunk of response) {
            const text = chunk.text || "";
            if (text) {
              fullText += text;
              // Send text chunk as SSE
              const data = JSON.stringify({ type: "text", content: text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            // Check for grounding metadata in the final chunk
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata) {
              const webSearchQueries = groundingMetadata.webSearchQueries || [];
              const groundingChunks = groundingMetadata.groundingChunks || [];

              const sources = groundingChunks
                .filter((c: { web?: { uri?: string; title?: string } }) => c.web?.uri)
                .map((c: { web?: { uri?: string; title?: string } }) => ({
                  url: c.web?.uri,
                  title: c.web?.title || "",
                }))
                .slice(0, 5);

              // Send grounding metadata
              if (sources.length > 0 || webSearchQueries.length > 0) {
                const metaData = JSON.stringify({
                  type: "metadata",
                  grounded: needsGrounding,
                  groundingSources: sources,
                  searchQueries: webSearchQueries,
                });
                controller.enqueue(encoder.encode(`data: ${metaData}\n\n`));
              }
            }
          }

          // Send completion event with full content (🆕 Phase 6: 그라운딩 강도 정보 추가)
          const doneData = JSON.stringify({
            type: "done",
            category,
            fullContent: fullText,
            // Phase 3: 개인화 메타데이터
            personalizedFor: extractedProfile?.summary || null,
            searchQueries: searchQueries.length > 0 ? searchQueries : null,
            // Phase 6: 그라운딩 강도 정보
            groundingIntensity: groundingIntensityLevel,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({
            type: "error",
            message: error instanceof Error ? error.message : "스트리밍 오류가 발생했습니다.",
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Saju detail analysis error:", error);

    // Try to get locale from request for error message
    let locale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      locale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    return NextResponse.json(
      { error: getErrorMessage(locale, 'detailAnalysisError') },
      { status: 500 }
    );
  }
}
