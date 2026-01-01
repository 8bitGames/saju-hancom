import { NextRequest, NextResponse } from "next/server";
import {
  getDetailSystemPrompt,
  getDetailPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
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
  | "personality";  // 종합탭 성격 분석 전용 (dayMaster와 분리)

const validCategories: DetailCategory[] = [
  "dayMaster", "tenGods", "stars", "fortune",
  "career", "relationship", "health", "wealth",
  "personality"  // 종합탭 성격 분석
];

// Google Grounding이 필요한 카테고리
const groundingCategories: DetailCategory[] = [
  "career", "wealth", "relationship", "health", "fortune"
];

/**
 * 🆕 카테고리별 콘텐츠 분리 지침 (v1.4)
 * - 기본 분석: WHAT/WHY (구성 발견, 교육적 설명)
 * - 종합 분석: HOW/WHEN (개인화된 조언, 콜드 리딩)
 */
function getCategoryBoundaryInstructions(category: DetailCategory, locale: string): string {
  const boundaries: Record<DetailCategory, { ko: string; en: string }> = {
    dayMaster: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 사주 DNA 발견하기"
**목적**: 일간이 무엇인지, 왜 중요한지 **발견형 스토리텔링**으로 설명

### ✅ 다뤄야 할 주제 (WHAT/WHY)
- 일간의 오행 특성과 자연 상징
- 같은 오행 내 다른 천간과의 비교 (예: 甲木 vs 乙木)
- "당신은 10가지 중 이것을 타고났습니다" 식의 발견 경험
- 일간의 기본적인 성격 경향성 소개

### ❌ 절대 다루지 말 것 (HOW/WHEN은 종합 탭에서)
- 구체적인 직업 추천/커리어 조언 → "더 알아보려면 [직업운] 탭으로"
- 투자/재물 관리 방법 → "재물 패턴은 [재물운] 탭에서"
- 연애/결혼 시기/방법 → "관계 패턴은 [관계운] 탭에서"
- 건강 관리 구체적 조언 → "건강 주의점은 [건강운] 탭에서"

### 🔗 마무리 안내 (필수)
분석 끝에 자연스럽게: "이 일간이 **실제 삶에서 어떻게 나타나는지** 궁금하시다면, [성격] 탭에서 더 깊이 알아보세요." 형태의 안내 포함`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Discover Your Saju DNA"
**Purpose**: Explain WHAT Day Master is and WHY it matters through **discovery storytelling**

### ✅ Topics to Cover (WHAT/WHY)
- Day Master's Five Element traits and natural symbols
- Comparison with other Heavenly Stems in same element (e.g., 甲Wood vs 乙Wood)
- "You were born with this one out of ten" discovery experience
- Basic personality tendencies of this Day Master

### ❌ DO NOT Cover (HOW/WHEN belong to comprehensive tabs)
- Specific career recommendations → "Learn more in [Career] tab"
- Investment/wealth management methods → "See wealth patterns in [Wealth] tab"
- Romance/marriage timing/methods → "See relationship patterns in [Relationship] tab"
- Specific health management advice → "See health tips in [Health] tab"

### 🔗 Closing Guide (Required)
End with natural transition: "Curious how this Day Master **manifests in real life**? Explore deeper in the [Personality] tab."`
    },
    personality: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 성격 심층 해석" (종합 분석)
**목적**: 기본 분석에서 발견한 요소들이 **실제 삶에서 어떻게 나타나는지** 콜드 리딩 스타일로 해석

### ✅ 다뤄야 할 주제 (HOW - 실제 삶 적용)
- 일간 + 십성 + 신살이 조합되어 만드는 **성격 패턴**
- "~하신 적 있으시죠?", "~한 경향이 있으셨을 거예요" 형태의 공감
- 강점/약점이 실제 상황에서 어떻게 발현되는지
- 대인관계에서의 행동 패턴

### ❌ 다루지 말 것
- 구체적인 직업 추천 → [직업운] 탭에서
- 재테크/투자 조언 → [재물운] 탭에서
- 연애/결혼 구체적 조언 → [관계운] 탭에서
- 건강 구체적 조언 → [건강운] 탭에서

### 💡 응답 스타일 (콜드 리딩)
"당신은 아마... ~하셨을 거예요", "혹시 ~한 경험이 있으신가요?" 형태로 공감 유도`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Deep Personality Interpretation" (Comprehensive Analysis)
**Purpose**: Interpret HOW the elements discovered in basic analysis **manifest in real life** using cold reading style

### ✅ Topics to Cover (HOW - Real Life Application)
- **Personality patterns** created by Day Master + Ten Gods + Stars combination
- Empathetic expressions like "You've probably experienced...", "You tend to..."
- How strengths/weaknesses manifest in actual situations
- Behavioral patterns in interpersonal relationships

### ❌ DO NOT Cover
- Specific career recommendations → [Career] tab
- Financial/investment advice → [Wealth] tab
- Specific romance/marriage advice → [Relationship] tab
- Specific health advice → [Health] tab

### 💡 Response Style (Cold Reading)
Use empathetic expressions like "You probably...", "Have you ever experienced...?"`
    },
    career: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 직업운 심층 해석" (종합 분석)
**목적**: 사주 구성이 **직업/커리어에서 구체적으로 어떻게 작용하는지** 콜드 리딩 + 현재 트렌드로 해석

### ✅ 다뤄야 할 주제 (HOW/WHEN - 직업 구체적 적용)
- 이 분에게 맞는 **구체적인 직업군/산업** 추천
- "직장에서 ~한 경험이 있으셨을 거예요" 형태의 공감
- 업무 스타일과 강점이 발휘되는 구체적 상황
- 대운/세운에 따른 **커리어 타이밍** 조언
- ${new Date().getFullYear()}년 현재 트렌드를 반영한 직업 조언

### ❌ 다루지 말 것
- 투자/재테크 조언 → [재물운] 탭에서
- 연애/결혼 조언 → [관계운] 탭에서
- 건강 관리 조언 → [건강운] 탭에서
- 기본적인 일간/십성 설명 → [일간], [십성] 탭에서 이미 다룸

### 💡 응답 스타일 (콜드 리딩 + 그라운딩)
"아마 직장에서 ~한 상황을 겪으셨을 거예요" + "요즘 ${new Date().getFullYear()}년 트렌드를 보면..."`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Deep Career Fortune Interpretation" (Comprehensive Analysis)
**Purpose**: Interpret HOW the Saju composition **specifically affects career** using cold reading + current trends

### ✅ Topics to Cover (HOW/WHEN - Career Specific Application)
- **Specific job categories/industries** suitable for this person
- Empathetic expressions like "You've probably experienced... at work"
- Specific situations where work style and strengths shine
- **Career timing** advice based on Major/Annual fortune
- Career advice reflecting ${new Date().getFullYear()} current trends

### ❌ DO NOT Cover
- Investment/financial advice → [Wealth] tab
- Romance/marriage advice → [Relationship] tab
- Health management advice → [Health] tab
- Basic Day Master/Ten Gods explanation → Already covered in [Day Master], [Ten Gods] tabs

### 💡 Response Style (Cold Reading + Grounding)
"You've probably experienced... at work" + "Looking at ${new Date().getFullYear()} trends..."`
    },
    wealth: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 재물운 심층 해석" (종합 분석)
**목적**: 사주 구성이 **재물/금전에서 구체적으로 어떻게 작용하는지** 콜드 리딩 + 현재 트렌드로 해석

### ✅ 다뤄야 할 주제 (HOW/WHEN - 재물 구체적 적용)
- 이 분의 **재물 획득/관리 패턴** (정재형 vs 편재형)
- "돈과 관련해서 ~한 경험이 있으셨을 거예요" 형태의 공감
- 투자 성향과 맞는 구체적인 투자 방식
- 대운/세운에 따른 **재물운 타이밍** 조언
- ${new Date().getFullYear()}년 현재 경제 트렌드를 반영한 재테크 조언

### ❌ 다루지 말 것
- 직업/커리어 조언 → [직업운] 탭에서
- 연애/결혼 조언 → [관계운] 탭에서
- 건강 관리 조언 → [건강운] 탭에서
- 기본적인 십성 설명 → [십성] 탭에서 이미 다룸

### 💡 응답 스타일 (콜드 리딩 + 그라운딩)
"아마 돈 관리에서 ~한 경향이 있으셨을 거예요" + "요즘 ${new Date().getFullYear()}년 경제 상황을 보면..."`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Deep Wealth Fortune Interpretation" (Comprehensive Analysis)
**Purpose**: Interpret HOW the Saju composition **specifically affects wealth/money** using cold reading + current trends

### ✅ Topics to Cover (HOW/WHEN - Wealth Specific Application)
- This person's **wealth acquisition/management patterns** (Direct vs Indirect Wealth type)
- Empathetic expressions like "You've probably experienced... with money"
- Specific investment methods matching their investment tendencies
- **Wealth timing** advice based on Major/Annual fortune
- Financial advice reflecting ${new Date().getFullYear()} current economic trends

### ❌ DO NOT Cover
- Career/job advice → [Career] tab
- Romance/marriage advice → [Relationship] tab
- Health management advice → [Health] tab
- Basic Ten Gods explanation → Already covered in [Ten Gods] tab

### 💡 Response Style (Cold Reading + Grounding)
"You've probably had a tendency to... with money" + "Looking at ${new Date().getFullYear()} economic trends..."`
    },
    relationship: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 관계운 심층 해석" (종합 분석)
**목적**: 사주 구성이 **대인관계/연애/결혼에서 구체적으로 어떻게 작용하는지** 콜드 리딩 + 현재 트렌드로 해석

### ✅ 다뤄야 할 주제 (HOW/WHEN - 관계 구체적 적용)
- 이 분의 **연애/결혼 패턴** (어떤 타입에게 끌리는지, 관계 스타일)
- "연애나 인간관계에서 ~한 경험이 있으셨을 거예요" 형태의 공감
- 배우자운, 이성운의 구체적 특징
- 대운/세운에 따른 **연애/결혼 타이밍** 조언
- ${new Date().getFullYear()}년 현재 MZ세대 연애 트렌드 반영

### ❌ 다루지 말 것
- 직업/커리어 조언 → [직업운] 탭에서
- 투자/재테크 조언 → [재물운] 탭에서
- 건강 관리 조언 → [건강운] 탭에서
- 기본적인 십성 설명 → [십성] 탭에서 이미 다룸

### 💡 응답 스타일 (콜드 리딩 + 그라운딩)
"아마 연애에서 ~한 경향이 있으셨을 거예요" + "요즘 ${new Date().getFullYear()}년 연애 트렌드를 보면..."`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Deep Relationship Fortune Interpretation" (Comprehensive Analysis)
**Purpose**: Interpret HOW the Saju composition **specifically affects relationships/romance/marriage** using cold reading + current trends

### ✅ Topics to Cover (HOW/WHEN - Relationship Specific Application)
- This person's **romance/marriage patterns** (what types they're attracted to, relationship style)
- Empathetic expressions like "You've probably experienced... in relationships"
- Specific characteristics of spouse fortune, attraction patterns
- **Romance/marriage timing** advice based on Major/Annual fortune
- Reflecting ${new Date().getFullYear()} current dating trends

### ❌ DO NOT Cover
- Career/job advice → [Career] tab
- Investment/financial advice → [Wealth] tab
- Health management advice → [Health] tab
- Basic Ten Gods explanation → Already covered in [Ten Gods] tab

### 💡 Response Style (Cold Reading + Grounding)
"You've probably had a tendency to... in relationships" + "Looking at ${new Date().getFullYear()} dating trends..."`
    },
    health: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 건강운 심층 해석" (종합 분석)
**목적**: 사주 구성이 **건강에서 구체적으로 어떻게 작용하는지** 콜드 리딩 + 현대 의학 관점으로 해석

### ✅ 다뤄야 할 주제 (HOW/WHEN - 건강 구체적 적용)
- 오행 밸런스에 따른 **구체적인 취약 신체 부위**
- "건강 면에서 ~한 경험이 있으셨을 거예요" 형태의 공감
- 계절별/시기별 건강 관리 포인트
- 대운/세운에 따른 **건강 주의 시기** 조언
- ${new Date().getFullYear()}년 현재 건강 트렌드 반영 (스트레스 관리, 멘탈 케어 등)

### ❌ 다루지 말 것
- 직업/커리어 조언 → [직업운] 탭에서
- 투자/재테크 조언 → [재물운] 탭에서
- 연애/결혼 조언 → [관계운] 탭에서
- 기본적인 오행 설명 → [일간] 탭에서 이미 다룸

### 💡 응답 스타일 (콜드 리딩 + 그라운딩)
"아마 건강 면에서 ~한 경향이 있으셨을 거예요" + "요즘 ${new Date().getFullYear()}년 건강 관리 트렌드를 보면..."`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Deep Health Fortune Interpretation" (Comprehensive Analysis)
**Purpose**: Interpret HOW the Saju composition **specifically affects health** using cold reading + modern health perspectives

### ✅ Topics to Cover (HOW/WHEN - Health Specific Application)
- **Specific vulnerable body areas** based on Five Elements balance
- Empathetic expressions like "You've probably experienced... health-wise"
- Health management points by season/timing
- **Health caution periods** advice based on Major/Annual fortune
- Reflecting ${new Date().getFullYear()} current health trends (stress management, mental care, etc.)

### ❌ DO NOT Cover
- Career/job advice → [Career] tab
- Investment/financial advice → [Wealth] tab
- Romance/marriage advice → [Relationship] tab
- Basic Five Elements explanation → Already covered in [Day Master] tab

### 💡 Response Style (Cold Reading + Grounding)
"You've probably had a tendency to... health-wise" + "Looking at ${new Date().getFullYear()} health trends..."`
    },
    fortune: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 인생 타임라인 파악하기"
**목적**: 대운/세운/월운이 무엇인지, 운의 흐름 구조를 **타임라인 스토리텔링**으로 설명

### ✅ 다뤄야 할 주제 (WHAT/WHY)
- 대운(大運)이란? 10년 단위의 큰 파도 개념
- 세운(歲運)이란? 1년 단위의 중간 파도 개념
- 월운(月運)이란? 1달 단위의 작은 파도 개념
- 이 분의 현재 위치: "지금 몇 번째 대운에 있는지" 시각화
- 순행/역행 운의 흐름 방향 설명

### ❌ 절대 다루지 말 것 (HOW/WHEN의 구체적 조언은 종합 탭에서)
- 구체적인 직업 타이밍 조언 → "직업운의 구체적 시기는 [직업운] 탭에서"
- 구체적인 투자 타이밍 조언 → "재물운의 구체적 시기는 [재물운] 탭에서"
- 구체적인 연애 타이밍 조언 → "관계운의 구체적 시기는 [관계운] 탭에서"
- 구체적인 건강 타이밍 조언 → "건강운의 구체적 시기는 [건강운] 탭에서"

### 🔗 마무리 안내 (필수)
"각 영역별 **구체적인 운세 활용법**이 궁금하시다면, [직업운], [재물운], [관계운], [건강운] 탭에서 시기별 조언을 확인하세요."`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Map Your Life Timeline"
**Purpose**: Explain WHAT Major/Annual/Monthly fortune are and HOW the fortune flow structure works through **timeline storytelling**

### ✅ Topics to Cover (WHAT/WHY)
- What is Major Fortune (大運)? Big waves in 10-year cycles
- What is Annual Fortune (歲運)? Medium waves in yearly cycles
- What is Monthly Fortune (月運)? Small waves in monthly cycles
- This person's current position: "Which Major Fortune period are you in?" visualization
- Forward/backward fortune flow direction explanation

### ❌ DO NOT Cover (Specific HOW/WHEN advice belongs to comprehensive tabs)
- Specific career timing advice → "Detailed career timing in [Career] tab"
- Specific investment timing advice → "Detailed wealth timing in [Wealth] tab"
- Specific romance timing advice → "Detailed relationship timing in [Relationship] tab"
- Specific health timing advice → "Detailed health timing in [Health] tab"

### 🔗 Closing Guide (Required)
"Curious about **specific fortune utilization** in each area? Check [Career], [Wealth], [Relationship], and [Health] tabs for timing-based advice."`
    },
    tenGods: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 에너지 지도 탐험하기"
**목적**: 십성이 무엇인지, 나의 에너지 분포가 어떤지 **탐험형 스토리텔링**으로 설명

### ✅ 다뤄야 할 주제 (WHAT/WHY)
- 10가지 십성의 의미와 역할 소개
- 이 분의 사주에 어떤 십성이 강하고 약한지 분포 분석
- "당신에게 풍부한 에너지 vs 보완이 필요한 에너지" 발견
- 십성 간 상호작용과 밸런스 설명

### ❌ 절대 다루지 말 것 (HOW/WHEN은 종합 탭에서)
- 구체적인 직업 추천 → "이 에너지가 직업에서 어떻게 발휘되는지는 [직업운] 탭에서"
- 구체적인 재물 조언 → "재물 에너지 활용법은 [재물운] 탭에서"
- 구체적인 연애 조언 → "관계 에너지 활용법은 [관계운] 탭에서"
- 구체적인 건강 조언 → "에너지 밸런스와 건강은 [건강운] 탭에서"

### 🔗 마무리 안내 (필수)
"이 에너지들이 **실제 삶에서 어떻게 작용하는지** 궁금하시다면, [성격], [직업운], [관계운] 탭에서 더 깊이 알아보세요."`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Explore Your Energy Map"
**Purpose**: Explain WHAT Ten Gods are and HOW your energy is distributed through **exploration storytelling**

### ✅ Topics to Cover (WHAT/WHY)
- Introduction to the meaning and role of all 10 Ten Gods
- Analysis of which Ten Gods are strong or weak in this person's chart
- "Your abundant energies vs energies that need supplementing" discovery
- Explanation of Ten Gods interactions and balance

### ❌ DO NOT Cover (HOW/WHEN belong to comprehensive tabs)
- Specific career recommendations → "See how this energy manifests at work in [Career] tab"
- Specific wealth advice → "See wealth energy utilization in [Wealth] tab"
- Specific romance advice → "See relationship energy utilization in [Relationship] tab"
- Specific health advice → "See energy balance and health in [Health] tab"

### 🔗 Closing Guide (Required)
"Curious how these energies **work in real life**? Explore deeper in [Personality], [Career], and [Relationship] tabs."`
    },
    stars: {
      ko: `\n\n## 📋 콘텐츠 역할 지침 (필수 준수)

### 🏷️ 이 탭의 역할: "나의 특수 카드 컬렉션 발견하기"
**목적**: 신살이 무엇인지, 내가 어떤 특수 카드를 가졌는지 **게임형 스토리텔링**으로 설명

### ✅ 다뤄야 할 주제 (WHAT/WHY)
- 신살이란 무엇인가? (사주의 특수 별자리/카드)
- 이 분이 가진 신살들의 종류와 의미
- 🌟 길신(행운 카드) vs ⚠️ 흉신(주의 카드) vs 🔮 중성(상황 카드) 분류
- "당신의 덱 구성"을 보여주는 카드 컬렉션 개념

### ❌ 절대 다루지 말 것 (HOW/WHEN은 종합 탭에서)
- 구체적인 직업 추천 → "이 카드가 커리어에 미치는 영향은 [직업운] 탭에서"
- 구체적인 재물 조언 → "재물 관련 카드 활용법은 [재물운] 탭에서"
- 구체적인 연애 조언 → "연애 관련 카드 활용법은 [관계운] 탭에서"
- 구체적인 건강 조언 → "건강 관련 카드 활용법은 [건강운] 탭에서"

### 🔗 마무리 안내 (필수)
"이 특수 카드들이 **실제 삶에서 어떻게 발동하는지** 궁금하시다면, 각 종합 분석 탭에서 자세히 알아보세요."`,
      en: `\n\n## 📋 Content Role Instructions (MUST FOLLOW)

### 🏷️ This Tab's Role: "Discover Your Special Card Collection"
**Purpose**: Explain WHAT Special Stars are and WHICH special cards you have through **gamified storytelling**

### ✅ Topics to Cover (WHAT/WHY)
- What are Special Stars? (Special celestial markers/cards in Saju)
- Types and meanings of stars this person has
- 🌟 Lucky cards vs ⚠️ Caution cards vs 🔮 Neutral cards classification
- "Your deck composition" as a card collection concept

### ❌ DO NOT Cover (HOW/WHEN belong to comprehensive tabs)
- Specific career recommendations → "See how these cards affect career in [Career] tab"
- Specific wealth advice → "See wealth card utilization in [Wealth] tab"
- Specific romance advice → "See romance card utilization in [Relationship] tab"
- Specific health advice → "See health card utilization in [Health] tab"

### 🔗 Closing Guide (Required)
"Curious how these special cards **activate in real life**? Explore each comprehensive analysis tab for details."`
    }
  };

  const boundary = boundaries[category];
  return boundary ? (locale === 'ko' ? boundary.ko : boundary.en) : '';
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

    // Build the prompt
    let prompt = locale === 'ko'
      ? `다음은 ${genderText}의 사주 정보입니다:\n\n${sajuContext}\n\n${getDetailPrompt(locale, category as DetailCategory)}${dateContext}`
      : `The following is the birth chart information for a ${genderText}:\n\n${sajuContext}\n\n${getDetailPrompt(locale, category as DetailCategory)}${dateContext}`;

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

    // 🆕 카테고리별 콘텐츠 분리 지침 추가 (중복 방지)
    const categoryBoundaryInstructions = getCategoryBoundaryInstructions(category as DetailCategory, locale);
    if (categoryBoundaryInstructions) {
      prompt += categoryBoundaryInstructions;
    }

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
                    text: `${getDetailSystemPrompt(locale, currentYear)}\n\n${prompt}`,
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
