/**
 * 기본 분석 컨텍스트 생성 모듈
 *
 * 목적: 일간/십성/신살/운세 탭에서 "사주 구성 설명"에 사용
 * - 교육적/설명적 콘텐츠 중심
 * - "이 분의 사주는 이런 구성입니다" 형태
 *
 * 종합 분석(personality/career/wealth/relationship/health)과 구분됨
 * - 종합 분석은 orchestrator.ts에서 "개인화된 해석" 생성
 */

import type { SajuResult, Gan, TenGod, Star, Element } from "../types";
import type { BasicCategory, Locale } from "./types";
import {
  DAY_MASTER_DETAILED,
  DAY_MASTER_CONCEPT,
  TEN_GOD_DETAILED,
  TEN_GOD_CONCEPT,
  STAR_DETAILED,
  STAR_CONCEPT,
  FORTUNE_CONCEPT,
  isBasicCategory,
} from "../basic-analysis-data";

// ============================================================================
// 헬퍼 함수들
// ============================================================================

/**
 * 일간 비교 텍스트 생성 - 다른 일간과의 차별점을 보여줌
 */
function getComparisonText(dayMaster: Gan, locale: Locale): string {
  const comparisons: Record<Gan, { ko: string; en: string }> = {
    "甲": {
      ko: `같은 목(木)이라도 **乙木(을목)**이 유연한 덩굴이라면, 당신의 **甲木(갑목)**은 곧게 뻗는 대나무입니다.
을목이 환경에 맞춰 휘어지는 유연함이 있다면, 갑목인 당신은 꺾이더라도 굽히지 않는 강직함이 있습니다.`,
      en: `While 乙Wood is like a flexible vine, your 甲Wood is like a straight-growing bamboo.
Where 乙Wood bends with the environment, your 甲Wood stands firm with unwavering integrity.`
    },
    "乙": {
      ko: `같은 목(木)이라도 **甲木(갑목)**이 곧게 뻗는 큰 나무라면, 당신의 **乙木(을목)**은 어디서든 피어나는 꽃과 풀입니다.
갑목이 한 방향으로 성장한다면, 을목인 당신은 어떤 환경에서도 적응하며 피어납니다.`,
      en: `While 甲Wood is like a tall tree growing straight, your 乙Wood is like flowers blooming anywhere.
Where 甲Wood grows in one direction, your 乙Wood adapts and flourishes in any environment.`
    },
    "丙": {
      ko: `같은 화(火)라도 **丁火(정화)**가 은은한 촛불이라면, 당신의 **丙火(병화)**는 세상을 비추는 태양입니다.
정화가 가까이서 따뜻하게 한다면, 병화인 당신은 멀리서도 모두를 환하게 밝힙니다.`,
      en: `While 丁Fire is like a gentle candle, your 丙Fire is like the sun illuminating the world.
Where 丁Fire warms closely, your 丙Fire brightens everything from afar.`
    },
    "丁": {
      ko: `같은 화(火)라도 **丙火(병화)**가 눈부신 태양이라면, 당신의 **丁火(정화)**는 어둠을 밝히는 따뜻한 촛불입니다.
병화가 강렬하게 빛난다면, 정화인 당신은 섬세하고 깊이 있게 비춥니다.`,
      en: `While 丙Fire is like the dazzling sun, your 丁Fire is like a warm candle lighting the darkness.
Where 丙Fire shines intensely, your 丁Fire illuminates with depth and subtlety.`
    },
    "戊": {
      ko: `같은 토(土)라도 **己土(기토)**가 만물을 키우는 밭이라면, 당신의 **戊土(무토)**는 모든 것을 품는 큰 산입니다.
기토가 세심하게 돌본다면, 무토인 당신은 흔들림 없이 중심을 잡습니다.`,
      en: `While 己Earth is like fertile farmland nurturing growth, your 戊Earth is like a great mountain embracing all.
Where 己Earth cares in detail, your 戊Earth stands as an unwavering center.`
    },
    "己": {
      ko: `같은 토(土)라도 **戊土(무토)**가 듬직한 큰 산이라면, 당신의 **己土(기토)**는 생명을 키우는 기름진 밭입니다.
무토가 크게 품는다면, 기토인 당신은 세심하게 가꾸고 돌봅니다.`,
      en: `While 戊Earth is like a great mountain, your 己Earth is like fertile soil nurturing life.
Where 戊Earth embraces broadly, your 己Earth cultivates with care.`
    },
    "庚": {
      ko: `같은 금(金)이라도 **辛金(신금)**이 빛나는 보석이라면, 당신의 **庚金(경금)**은 단단한 강철입니다.
신금이 섬세하게 아름답다면, 경금인 당신은 강하고 결단력 있게 밀고 나갑니다.`,
      en: `While 辛Metal is like a shining jewel, your 庚Metal is like solid steel.
Where 辛Metal is delicately beautiful, your 庚Metal pushes forward with strength and decisiveness.`
    },
    "辛": {
      ko: `같은 금(金)이라도 **庚金(경금)**이 강철 같은 힘이라면, 당신의 **辛金(신금)**은 빛나는 보석입니다.
경금이 강하게 밀어붙인다면, 신금인 당신은 예리하게 분석하고 아름답게 표현합니다.`,
      en: `While 庚Metal is like powerful steel, your 辛Metal is like a shining gemstone.
Where 庚Metal pushes strongly, your 辛Metal analyzes sharply and expresses beautifully.`
    },
    "壬": {
      ko: `같은 수(水)라도 **癸水(계수)**가 촉촉한 비와 이슬이라면, 당신의 **壬水(임수)**는 모든 것을 품는 바다입니다.
계수가 조용히 스며든다면, 임수인 당신은 넓게 흐르며 모든 것을 아우릅니다.`,
      en: `While 癸Water is like gentle rain and dew, your 壬Water is like the ocean embracing all.
Where 癸Water seeps quietly, your 壬Water flows broadly and encompasses everything.`
    },
    "癸": {
      ko: `같은 수(水)라도 **壬水(임수)**가 넓은 바다라면, 당신의 **癸水(계수)**는 만물을 적시는 비와 이슬입니다.
임수가 크게 흐른다면, 계수인 당신은 섬세하게 스며들어 생명을 키웁니다.`,
      en: `While 壬Water is like the vast ocean, your 癸Water is like rain and dew nurturing all life.
Where 壬Water flows grandly, your 癸Water seeps gently to nurture growth.`
    },
  };

  return comparisons[dayMaster][locale];
}

// ============================================================================
// 일간(Day Master) 기본 분석 컨텍스트 생성
// ============================================================================

interface DayMasterBasicContext {
  /** 개념 설명 */
  conceptExplanation: string;
  /** 이 분의 일간 정보 */
  yourDayMaster: {
    gan: Gan;
    korean: string;
    naturalSymbol: string;
    shortDescription: string;
    detailedDescription: string[];
    keywords: string[];
    strengths: string[];
    weaknesses: string[];
  };
  /** 오행 관계 설명 */
  elementRelations: {
    produces: string;
    controls: string;
    producedBy: string;
    controlledBy: string;
  };
  /** AI 프롬프트용 컨텍스트 */
  promptContext: string;
}

export function generateDayMasterBasicContext(
  sajuResult: SajuResult,
  locale: Locale
): DayMasterBasicContext {
  const dayMaster = sajuResult.dayMaster;
  const dayMasterInfo = DAY_MASTER_DETAILED[dayMaster];
  const concept = locale === "ko" ? DAY_MASTER_CONCEPT.ko : DAY_MASTER_CONCEPT.en;

  // 다른 일간과의 비교 문구 생성
  const comparisonText = getComparisonText(dayMaster, locale);

  // AI 프롬프트용 컨텍스트 생성 - 발견형 스토리텔링
  const promptContext =
    locale === "ko"
      ? `
## 🧬 나의 사주 DNA - 일간 발견하기

### 당신만의 일간
사주의 핵심인 일간. **10가지 천간 중에서 당신은 단 하나를 타고났습니다.**
${concept.definition}

---

### 발견: 당신의 일간은 "${dayMasterInfo.korean}"입니다

당신의 내면에는 **${dayMasterInfo.naturalSymbol}**의 기운이 흐르고 있습니다.

> "${dayMasterInfo.shortDescription}"

이것이 바로 당신의 DNA입니다.

---

### 당신의 기운 들여다보기

${dayMasterInfo.detailedDescription.map((d, i) => `${i === 0 ? '▸' : '•'} ${d}`).join("\n")}

---

### 당신만의 강점 카드

**핵심 키워드**: \`${dayMasterInfo.keywords.join("` `")}\`

**이런 점이 강합니다**:
${dayMasterInfo.strengths.map((s) => `  • ${s}`).join("\n")}

**이런 점은 주의하세요**:
${dayMasterInfo.weaknesses.map((w) => `  • ${w}`).join("\n")}

---

### 다른 일간과 비교하면?

${comparisonText}

---

### 오행의 흐름 속 당신의 위치

당신의 ${dayMasterInfo.korean}은 오행의 순환 속에서 이렇게 작용합니다:

• **생(生)하는 관계**: ${dayMasterInfo.elementRelations.produces.description}
• **극(克)하는 관계**: ${dayMasterInfo.elementRelations.controls.description}
• **생(生)받는 관계**: ${dayMasterInfo.elementRelations.producedBy.description}
• **극(克)받는 관계**: ${dayMasterInfo.elementRelations.controlledBy.description}

---

### 이런 분야가 잘 맞아요

${dayMasterInfo.suitableFields.map((f) => `\`${f}\``).join(" • ")}

---

### 더 알아보기

> 이 일간이 **실제 성격에 어떻게 나타나는지**는 → [성격] 탭에서
> 이 일간에 맞는 **직업과 커리어**는 → [직업] 탭에서
> 이 일간의 **재물운과 투자 성향**은 → [재물] 탭에서

---

**[응답 스타일 지침]**
- 발견의 즐거움을 주는 톤으로 설명하세요
- "당신은 ~입니다"보다 "당신 안에는 ~가 있습니다" 형태로
- 딱딱한 설명보다 비유와 이미지를 활용하세요
- 마지막에 종합 분석 탭으로 자연스럽게 유도하세요
`
      : `
## Discover Your Saju DNA - The Day Master

### Your Unique Day Master
The Day Master is the core of your Saju chart. **Among 10 Heavenly Stems, you were born with just one.**
${concept.definition}

---

### Discovery: Your Day Master is "${dayMasterInfo.korean}" (${dayMasterInfo.hanja})

Within you flows the energy of **${dayMasterInfo.naturalSymbol}**.

> "${dayMasterInfo.shortDescription}"

This is your inner DNA.

---

### Looking Into Your Energy

${dayMasterInfo.detailedDescription.map((d, i) => `${i === 0 ? '▸' : '•'} ${d}`).join("\n")}

---

### Your Strength Cards

**Core Keywords**: \`${dayMasterInfo.keywords.join("` `")}\`

**Your Strengths**:
${dayMasterInfo.strengths.map((s) => `  • ${s}`).join("\n")}

**Watch Points**:
${dayMasterInfo.weaknesses.map((w) => `  • ${w}`).join("\n")}

---

### Compared to Other Day Masters

${comparisonText}

---

### Your Position in the Five Element Flow

Your ${dayMasterInfo.korean} operates within the Five Element cycle:

• **Produces**: ${dayMasterInfo.elementRelations.produces.description}
• **Controls**: ${dayMasterInfo.elementRelations.controls.description}
• **Produced by**: ${dayMasterInfo.elementRelations.producedBy.description}
• **Controlled by**: ${dayMasterInfo.elementRelations.controlledBy.description}

---

### Suitable Fields

${dayMasterInfo.suitableFields.map((f) => `\`${f}\``).join(" • ")}

---

### Explore Further

> How this Day Master **manifests in your personality** → [Personality] tab
> **Career paths** that match your Day Master → [Career] tab
> Your Day Master's **wealth patterns** → [Wealth] tab

---

**[Response Style Guidelines]**
- Use a tone that sparks the joy of discovery
- Prefer "Within you exists..." over "You are..."
- Use metaphors and imagery over dry explanations
- Naturally guide users toward comprehensive analysis tabs
`;

  return {
    conceptExplanation: concept.definition,
    yourDayMaster: {
      gan: dayMasterInfo.gan,
      korean: dayMasterInfo.korean,
      naturalSymbol: dayMasterInfo.naturalSymbol,
      shortDescription: dayMasterInfo.shortDescription,
      detailedDescription: dayMasterInfo.detailedDescription,
      keywords: dayMasterInfo.keywords,
      strengths: dayMasterInfo.strengths,
      weaknesses: dayMasterInfo.weaknesses,
    },
    elementRelations: {
      produces: dayMasterInfo.elementRelations.produces.description,
      controls: dayMasterInfo.elementRelations.controls.description,
      producedBy: dayMasterInfo.elementRelations.producedBy.description,
      controlledBy: dayMasterInfo.elementRelations.controlledBy.description,
    },
    promptContext,
  };
}

// ============================================================================
// 십성(Ten Gods) 기본 분석 컨텍스트 생성
// ============================================================================

interface TenGodsBasicContext {
  /** 개념 설명 */
  conceptExplanation: string;
  /** 이 분의 주요 십성들 */
  yourTenGods: Array<{
    code: TenGod;
    korean: string;
    group: string;
    shortDescription: string;
    position: string; // 어느 주(柱)에 있는지
    lifeAspects: {
      career: string;
      relationship: string;
      wealth: string;
    };
  }>;
  /** 십성 분포 요약 */
  distribution: {
    dominant: TenGod[];
    lacking: TenGod[];
    summary: string;
  };
  /** AI 프롬프트용 컨텍스트 */
  promptContext: string;
}

export function generateTenGodsBasicContext(
  sajuResult: SajuResult,
  locale: Locale
): TenGodsBasicContext {
  const tenGods = sajuResult.tenGods;
  const summary = sajuResult.tenGodSummary;
  const concept = locale === "ko" ? TEN_GOD_CONCEPT.ko : TEN_GOD_CONCEPT.en;

  // 이 분의 주요 십성 정보 추출
  const yourTenGods: TenGodsBasicContext["yourTenGods"] = [];

  // 각 주(柱)별 십성 추출
  const positions = [
    { key: "year", label: locale === "ko" ? "년주" : "Year" },
    { key: "month", label: locale === "ko" ? "월주" : "Month" },
    { key: "day", label: locale === "ko" ? "일주" : "Day" },
    { key: "time", label: locale === "ko" ? "시주" : "Hour" },
  ] as const;

  for (const pos of positions) {
    const tenGodKey = tenGods[pos.key];
    if (tenGodKey?.gan) {
      const tenGodInfo = TEN_GOD_DETAILED[tenGodKey.gan];
      if (tenGodInfo) {
        yourTenGods.push({
          code: tenGodKey.gan,
          korean: tenGodInfo.korean,
          group: tenGodInfo.group,
          shortDescription: tenGodInfo.shortDescription,
          position: `${pos.label} 천간`,
          lifeAspects: tenGodInfo.lifeAspects,
        });
      }
    }
    if (tenGodKey?.zhi) {
      const tenGodInfo = TEN_GOD_DETAILED[tenGodKey.zhi];
      if (tenGodInfo) {
        yourTenGods.push({
          code: tenGodKey.zhi,
          korean: tenGodInfo.korean,
          group: tenGodInfo.group,
          shortDescription: tenGodInfo.shortDescription,
          position: `${pos.label} 지지`,
          lifeAspects: tenGodInfo.lifeAspects,
        });
      }
    }
  }

  // 분포 요약 생성
  const dominantSummary =
    summary.dominant.length > 0
      ? summary.dominant
          .map((tg) => TEN_GOD_DETAILED[tg]?.korean || tg)
          .join(", ")
      : locale === "ko"
        ? "고르게 분포"
        : "evenly distributed";

  const lackingSummary =
    summary.lacking.length > 0
      ? summary.lacking
          .map((tg) => TEN_GOD_DETAILED[tg]?.korean || tg)
          .join(", ")
      : locale === "ko"
        ? "없음"
        : "none";

  const distributionSummary =
    locale === "ko"
      ? `이 분의 사주에서는 ${dominantSummary}이(가) 강하게 나타나며, ${lackingSummary}이(가) 부족합니다.`
      : `In this chart, ${dominantSummary} are dominant, while ${lackingSummary} are lacking.`;

  // 그룹별 설명 생성
  const groupExplanations =
    locale === "ko"
      ? concept.groups.map((g) => `- **${g.name}** (${g.members.join(", ")}): ${g.description}`).join("\n")
      : concept.groups.map((g) => `- **${g.name}** (${g.members.join(", ")}): ${g.description}`).join("\n");

  // 에너지 강도 시각화 생성
  const getEnergyBar = (count: number, maxCount: number = 4): string => {
    const filled = Math.min(count, maxCount);
    const empty = maxCount - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  };

  // 십성 카운트 맵 생성
  const tenGodCounts: Record<string, number> = {};
  for (const tg of yourTenGods) {
    tenGodCounts[tg.korean] = (tenGodCounts[tg.korean] || 0) + 1;
  }

  // AI 프롬프트용 컨텍스트 생성 - 에너지 지도 컨셉
  const promptContext =
    locale === "ko"
      ? `
## 나의 에너지 지도 - 십성 발견하기

### 사주 속 에너지의 비밀
당신의 사주에는 **10가지 에너지**가 서로 다른 비율로 담겨 있습니다.
마치 성격의 레시피처럼, 어떤 에너지가 많고 어떤 에너지가 적은지가 당신만의 특성을 만들어냅니다.

${concept.definition}

---

### 5가지 에너지 그룹

${concept.groups.map((g) => `
**${g.name}** - ${g.description}
> 구성원: \`${g.members.join("` `")}\`
`).join("\n")}

---

### 당신의 에너지 분포도

당신의 사주에서 발견된 십성들입니다:

${yourTenGods.map((tg) => `| **${tg.korean}** | ${tg.position} |
> ${tg.shortDescription}`).join("\n\n")}

---

### 에너지 밸런스 분석

${distributionSummary}

**강한 에너지**: \`${dominantSummary}\`
> 이 에너지가 당신의 성격과 행동 패턴에 가장 크게 영향을 미칩니다.

**보완이 필요한 에너지**: \`${lackingSummary}\`
> 부족하다고 나쁜 것이 아닙니다. 다른 에너지로 보완되거나, 대운에서 채워질 수 있습니다.

---

### 에너지 읽는 법

${concept.howToRead.map((h, i) => `${i + 1}. ${h}`).join("\n")}

---

### 더 깊이 알아보기

> 이 에너지들이 **실제 성격에 어떻게 나타나는지**는 → [성격] 탭에서
> 에너지 조합에 따른 **적합한 직업**은 → [직업] 탭에서
> **대인관계 스타일**에 미치는 영향은 → [관계] 탭에서

---

**[응답 스타일 지침]**
- 에너지 지도를 탐험하는 느낌으로 설명하세요
- 각 십성을 "에너지"나 "기운"으로 표현하세요
- 부족한 십성도 긍정적으로 해석할 여지를 남기세요
- 마지막에 종합 분석 탭으로 자연스럽게 유도하세요
`
      : `
## Your Energy Map - Discovering Ten Gods

### The Secret Energies in Your Saju
Your chart contains **10 types of energies** in different proportions.
Like a personality recipe, the balance of these energies creates your unique characteristics.

${concept.definition}

---

### Five Energy Groups

${concept.groups.map((g) => `
**${g.name}** - ${g.description}
> Members: \`${g.members.join("` `")}\`
`).join("\n")}

---

### Your Energy Distribution

The Ten Gods found in your chart:

${yourTenGods.map((tg) => `| **${tg.korean}** | ${tg.position} |
> ${tg.shortDescription}`).join("\n\n")}

---

### Energy Balance Analysis

${distributionSummary}

**Strong Energies**: \`${dominantSummary}\`
> These energies have the greatest influence on your personality and behavior patterns.

**Energies Needing Complement**: \`${lackingSummary}\`
> Lacking doesn't mean bad. They can be complemented by other energies or fulfilled in major fortune periods.

---

### How to Read Your Energy Map

${concept.howToRead.map((h, i) => `${i + 1}. ${h}`).join("\n")}

---

### Explore Further

> How these energies **manifest in your personality** → [Personality] tab
> **Suitable careers** based on energy combinations → [Career] tab
> Impact on your **relationship style** → [Relationship] tab

---

**[Response Style Guidelines]**
- Describe as if exploring an energy map
- Express each Ten God as "energy" or "force"
- Leave room for positive interpretation of lacking energies
- Naturally guide users toward comprehensive analysis tabs
`;

  return {
    conceptExplanation: concept.definition,
    yourTenGods,
    distribution: {
      dominant: summary.dominant,
      lacking: summary.lacking,
      summary: distributionSummary,
    },
    promptContext,
  };
}

// ============================================================================
// 신살(Stars) 기본 분석 컨텍스트 생성
// ============================================================================

interface StarsBasicContext {
  /** 개념 설명 */
  conceptExplanation: string;
  /** 이 분의 신살들 */
  yourStars: Array<{
    name: string;
    hanja: string;
    type: "auspicious" | "inauspicious" | "neutral";
    category: string;
    position: string;
    shortDescription: string;
    traditionalMeaning: string;
    modernInterpretation: string;
    advice: string;
  }>;
  /** 신살 분류 요약 */
  categorySummary: {
    auspicious: string[];
    inauspicious: string[];
    neutral: string[];
  };
  /** AI 프롬프트용 컨텍스트 */
  promptContext: string;
}

export function generateStarsBasicContext(
  sajuResult: SajuResult,
  locale: Locale
): StarsBasicContext {
  const stars = sajuResult.stars || [];
  const concept = locale === "ko" ? STAR_CONCEPT.ko : STAR_CONCEPT.en;

  // 이 분의 신살 정보 추출
  const yourStars: StarsBasicContext["yourStars"] = [];
  const categorySummary = {
    auspicious: [] as string[],
    inauspicious: [] as string[],
    neutral: [] as string[],
  };

  for (const star of stars) {
    const starInfo = STAR_DETAILED[star.name];
    if (starInfo) {
      yourStars.push({
        name: star.name,
        hanja: starInfo.hanja,
        type: starInfo.type,
        category: starInfo.category,
        position: star.position || "",
        shortDescription: starInfo.shortDescription,
        traditionalMeaning: starInfo.traditionalMeaning,
        modernInterpretation: starInfo.modernInterpretation,
        advice: starInfo.advice,
      });

      // 분류별 정리
      if (starInfo.type === "auspicious") {
        categorySummary.auspicious.push(star.name);
      } else if (starInfo.type === "inauspicious") {
        categorySummary.inauspicious.push(star.name);
      } else {
        categorySummary.neutral.push(star.name);
      }
    } else {
      // STAR_DETAILED에 없는 신살도 기본 정보로 추가
      yourStars.push({
        name: star.name,
        hanja: star.hanja || "",
        type: star.type,
        category:
          star.type === "auspicious"
            ? "길신"
            : star.type === "inauspicious"
              ? "흉신"
              : "중성",
        position: star.position || "",
        shortDescription: star.description || "",
        traditionalMeaning: "",
        modernInterpretation: "",
        advice: "",
      });

      if (star.type === "auspicious") {
        categorySummary.auspicious.push(star.name);
      } else if (star.type === "inauspicious") {
        categorySummary.inauspicious.push(star.name);
      } else {
        categorySummary.neutral.push(star.name);
      }
    }
  }

  // 카테고리 설명 생성
  const categoryExplanations =
    locale === "ko"
      ? concept.categories.map((c) => `- **${c.name}**: ${c.description} (예: ${c.examples.join(", ")})`).join("\n")
      : concept.categories.map((c) => `- **${c.name}**: ${c.description} (e.g., ${c.examples.join(", ")})`).join("\n");

  // 카드 타입별 마커 생성
  const getCardMarker = (type: "auspicious" | "inauspicious" | "neutral"): string => {
    switch (type) {
      case "auspicious": return "[길]";
      case "inauspicious": return "[흉]";
      case "neutral": return "[중]";
    }
  };

  // AI 프롬프트용 컨텍스트 생성 - 특수 카드 컨셉
  const promptContext =
    locale === "ko"
      ? `
## 나의 특수 카드 - 신살 발견하기

### 사주 속 특별한 카드들
신살은 사주 안에 숨겨진 **특수 카드**와 같습니다.
어떤 카드는 행운을 가져오고, 어떤 카드는 주의가 필요하며, 어떤 카드는 특별한 재능을 나타냅니다.

${concept.definition}

---

### 카드의 종류

${concept.categories.map((c) => `
**${c.name}** ${c.name.includes("길") ? "[길]" : c.name.includes("흉") ? "[흉]" : "[중]"}
> ${c.description}
> 예시: \`${c.examples.join("` `")}\`
`).join("\n")}

---

### 당신이 가진 카드들

${yourStars.length > 0 ? yourStars.map((s) => `
---
${getCardMarker(s.type)} **${s.name}** (${s.hanja})
위치: ${s.position || "전체 사주"}

> "${s.shortDescription}"

${s.traditionalMeaning ? `**전통적 의미**: ${s.traditionalMeaning}` : ""}
${s.modernInterpretation ? `**현대적 해석**: ${s.modernInterpretation}` : ""}
${s.advice ? `**활용 팁**: ${s.advice}` : ""}
`).join("\n") : "현재 분석된 특수 카드가 없습니다."}

---

### 카드 덱 요약

**행운의 카드 (길신)**: ${categorySummary.auspicious.length > 0 ? `\`${categorySummary.auspicious.join("` `")}\`` : "없음"}
> 이 카드들은 당신에게 자연스러운 행운과 재능을 부여합니다.

**주의 카드 (흉신)**: ${categorySummary.inauspicious.length > 0 ? `\`${categorySummary.inauspicious.join("` `")}\`` : "없음"}
> 나쁜 것이 아니라 **주의가 필요한 영역**을 알려주는 신호입니다.

**중성 카드**: ${categorySummary.neutral.length > 0 ? `\`${categorySummary.neutral.join("` `")}\`` : "없음"}
> 상황에 따라 다르게 작용하는 카드입니다.

---

### 카드 읽는 법

${concept.howToRead.map((h, i) => `${i + 1}. ${h}`).join("\n")}

---

### 더 깊이 알아보기

> 이 카드들이 **성격에 미치는 영향**은 → [성격] 탭에서
> **직업 선택**에 영향을 주는 카드들 → [직업] 탭에서
> **건강**과 관련된 신살의 의미 → [건강] 탭에서

---

**[응답 스타일 지침]**
- 카드 게임처럼 재미있게 설명하세요
- 흉신도 "주의 카드"로 긍정적 프레이밍하세요
- 각 카드의 독특한 의미를 강조하세요
- 마지막에 종합 분석 탭으로 자연스럽게 유도하세요
`
      : `
## Your Special Cards - Discovering Stars

### Hidden Cards in Your Saju
Stars (Shen Sha) are like **special cards** hidden in your chart.
Some bring luck, some require attention, and some reveal unique talents.

${concept.definition}

---

### Types of Cards

${concept.categories.map((c) => `
**${c.name}** ${c.name.includes("Auspicious") ? "[+]" : c.name.includes("Inauspicious") ? "[-]" : "[~]"}
> ${c.description}
> Examples: \`${c.examples.join("` `")}\`
`).join("\n")}

---

### Your Card Collection

${yourStars.length > 0 ? yourStars.map((s) => `
---
${getCardMarker(s.type)} **${s.name}** (${s.hanja})
Position: ${s.position || "Entire Chart"}

> "${s.shortDescription}"

${s.traditionalMeaning ? `**Traditional Meaning**: ${s.traditionalMeaning}` : ""}
${s.modernInterpretation ? `**Modern Interpretation**: ${s.modernInterpretation}` : ""}
${s.advice ? `**Usage Tip**: ${s.advice}` : ""}
`).join("\n") : "No special cards analyzed at this time."}

---

### Your Card Deck Summary

**Lucky Cards (Auspicious)**: ${categorySummary.auspicious.length > 0 ? `\`${categorySummary.auspicious.join("` `")}\`` : "None"}
> These cards grant you natural luck and talents.

**Caution Cards (Inauspicious)**: ${categorySummary.inauspicious.length > 0 ? `\`${categorySummary.inauspicious.join("` `")}\`` : "None"}
> Not bad - they signal **areas needing attention**.

**Neutral Cards**: ${categorySummary.neutral.length > 0 ? `\`${categorySummary.neutral.join("` `")}\`` : "None"}
> Cards that work differently depending on the situation.

---

### How to Read Your Cards

${concept.howToRead.map((h, i) => `${i + 1}. ${h}`).join("\n")}

---

### Explore Further

> How these cards **affect your personality** → [Personality] tab
> Cards influencing **career choice** → [Career] tab
> Health-related meaning of stars → [Health] tab

---

**[Response Style Guidelines]**
- Explain like a card game to make it fun
- Frame inauspicious stars as "caution cards" positively
- Emphasize the unique meaning of each card
- Naturally guide users toward comprehensive analysis tabs
`;

  return {
    conceptExplanation: concept.definition,
    yourStars,
    categorySummary,
    promptContext,
  };
}

// ============================================================================
// 운세(Fortune) 기본 분석 컨텍스트 생성
// ============================================================================

interface FortuneBasicContext {
  /** 대운/세운 개념 설명 */
  conceptExplanation: {
    majorFortune: string;
    annualFortune: string;
    monthlyFortune: string;
  };
  /** 이 분의 대운 정보 */
  yourMajorFortune: {
    startAge: number;
    direction: string;
    currentPeriod?: {
      startAge: number;
      endAge: number;
      pillar: string;
      description: string;
    };
  };
  /** 올해 세운 정보 */
  currentYearFortune: {
    year: number;
    pillar: string;
    description: string;
  };
  /** AI 프롬프트용 컨텍스트 */
  promptContext: string;
}

export function generateFortuneBasicContext(
  sajuResult: SajuResult,
  locale: Locale,
  birthYear: number
): FortuneBasicContext {
  const majorFortune = sajuResult.majorFortune;
  const concept = locale === "ko" ? FORTUNE_CONCEPT.ko : FORTUNE_CONCEPT.en;
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear + 1; // 만 나이

  // 현재 대운 기간 찾기
  let currentPeriod = undefined;
  if (majorFortune?.periods) {
    for (const period of majorFortune.periods) {
      if (currentAge >= period.startAge && currentAge < period.endAge) {
        currentPeriod = {
          startAge: period.startAge,
          endAge: period.endAge,
          pillar: period.pillar.ganZhi,
          description: `${period.pillar.koreanReading} (${period.pillar.ganZhi})`,
        };
        break;
      }
    }
  }

  // 대운 방향 설명
  const directionDesc =
    locale === "ko"
      ? majorFortune?.direction === "forward"
        ? "순행 (월주에서 앞으로 진행)"
        : "역행 (월주에서 뒤로 진행)"
      : majorFortune?.direction === "forward"
        ? "Forward (progressing from Month Pillar)"
        : "Backward (regressing from Month Pillar)";

  // 세운 정보 (간단히 현재 연도 기준)
  const currentYearFortune = {
    year: currentYear,
    pillar: "", // 세운 pillar는 별도 계산 필요
    description:
      locale === "ko" ? `${currentYear}년 세운` : `${currentYear} Annual Fortune`,
  };

  // 대운 흐름 시각화 생성
  const getFortuneTimeline = (): string => {
    if (!majorFortune?.periods || majorFortune.periods.length === 0) {
      return locale === "ko" ? "대운 정보를 불러올 수 없습니다." : "Major fortune data unavailable.";
    }

    return majorFortune.periods.slice(0, 8).map((period, index) => {
      const isCurrentPeriod = currentAge >= period.startAge && currentAge < period.endAge;
      const marker = isCurrentPeriod ? "▶" : "○";
      const highlight = isCurrentPeriod ? "**" : "";
      return `${marker} ${highlight}${period.startAge}~${period.endAge}세${highlight}: ${period.pillar.koreanReading || period.pillar.ganZhi} ${isCurrentPeriod ? "(현재)" : ""}`;
    }).join("\n");
  };

  // AI 프롬프트용 컨텍스트 생성 - 타임라인 컨셉
  const promptContext =
    locale === "ko"
      ? `
## 나의 인생 타임라인 - 운세 구조 발견하기

### 시간 속의 당신
사주에는 **인생의 시간표**가 담겨 있습니다.
10년 단위의 큰 흐름(대운)과 1년 단위의 작은 흐름(세운)이 겹쳐지며 당신의 시간을 만들어갑니다.

---

### 대운(大運) - 10년의 큰 파도

${concept.majorFortune.definition}

**대운이란?**
${concept.majorFortune.explanation.map((e, i) => `${i + 1}. ${e}`).join("\n")}

**왜 중요한가?**
${concept.majorFortune.importance.map((i) => `• ${i}`).join("\n")}

---

### 당신의 대운 타임라인

**기본 정보**
- 대운 시작 나이: **${majorFortune?.startAge || "정보 없음"}세**
- 대운 방향: **${directionDesc}**

**현재 위치**
${currentPeriod ? `지금 당신은 **${currentPeriod.startAge}~${currentPeriod.endAge}세 대운** 안에 있습니다.
> 이 시기의 주제: **${currentPeriod.description}**` : "> 현재 대운 정보를 불러올 수 없습니다."}

**대운 흐름도**
\`\`\`
${getFortuneTimeline()}
\`\`\`

---

### 세운(歲運) - 1년의 작은 파도

${concept.annualFortune.definition}

**세운이란?**
${concept.annualFortune.explanation.map((e, i) => `${i + 1}. ${e}`).join("\n")}

**왜 중요한가?**
${concept.annualFortune.importance.map((i) => `• ${i}`).join("\n")}

---

### 월운(月運) - 달의 리듬

${concept.monthlyFortune.definition}

---

### 운세 읽는 법

${concept.howToRead.map((h, i) => `${i + 1}. ${h}`).join("\n")}

---

### 알아두세요

> 이 탭은 **운세의 구조**를 보여드립니다
> 대운/세운이 무엇인지, 당신의 타임라인이 어떻게 구성되어 있는지를 이해하는 곳입니다.

> **올해/내년 구체적 운세 해석**은 종합 분석 탭에서 더 깊이 다룹니다!

---

### 더 깊이 알아보기

> **올해의 운세**가 구체적으로 궁금하다면 → [성격] 탭 또는 다른 종합 분석 참조
> **직업운과 재물운** 타이밍 → [직업], [재물] 탭에서
> **건강에 주의해야 할 시기** → [건강] 탭에서

---

**[응답 스타일 지침]**
- 타임라인을 여행하는 느낌으로 설명하세요
- 대운을 "인생의 계절"이나 "큰 파도"로 비유하세요
- 현재 위치를 지도에서 찾아주는 것처럼 명확히 표시하세요
- 구체적 해석은 종합 분석 탭으로 자연스럽게 유도하세요
`
      : `
## Your Life Timeline - Discovering Fortune Structure

### You in Time
Your Saju contains a **life timetable**.
The big waves of 10-year cycles (Major Fortune) and small waves of yearly cycles (Annual Fortune) overlap to create your time.

---

### Major Fortune - The 10-Year Wave

${concept.majorFortune.definition}

**What is Major Fortune?**
${concept.majorFortune.explanation.map((e, i) => `${i + 1}. ${e}`).join("\n")}

**Why is it important?**
${concept.majorFortune.importance.map((i) => `• ${i}`).join("\n")}

---

### Your Major Fortune Timeline

**Basic Info**
- Major Fortune starts at: **age ${majorFortune?.startAge || "N/A"}**
- Direction: **${directionDesc}**

**Current Position**
${currentPeriod ? `You are currently in the **${currentPeriod.startAge}~${currentPeriod.endAge} age Major Fortune**.
> Theme of this period: **${currentPeriod.description}**` : "> Current major fortune info unavailable."}

**Fortune Flow Chart**
\`\`\`
${getFortuneTimeline()}
\`\`\`

---

### Annual Fortune - The Yearly Wave

${concept.annualFortune.definition}

**What is Annual Fortune?**
${concept.annualFortune.explanation.map((e, i) => `${i + 1}. ${e}`).join("\n")}

**Why is it important?**
${concept.annualFortune.importance.map((i) => `• ${i}`).join("\n")}

---

### Monthly Fortune - The Moon's Rhythm

${concept.monthlyFortune.definition}

---

### How to Read Fortune

${concept.howToRead.map((h, i) => `${i + 1}. ${h}`).join("\n")}

---

### Keep in Mind

> This tab shows the **structure of fortune**
> It's for understanding what Major/Annual Fortune is and how your timeline is structured.

> **Specific fortune interpretation for this year/next year** is covered in depth in comprehensive analysis tabs!

---

### Explore Further

> Curious about **this year's fortune** specifically → [Personality] tab or other comprehensive analysis
> **Career and wealth timing** → [Career], [Wealth] tabs
> **Health caution periods** → [Health] tab

---

**[Response Style Guidelines]**
- Describe as if traveling through a timeline
- Compare Major Fortune to "life seasons" or "big waves"
- Clearly mark current position like finding yourself on a map
- Naturally guide to comprehensive analysis tabs for specific interpretations
`;

  return {
    conceptExplanation: {
      majorFortune: concept.majorFortune.definition,
      annualFortune: concept.annualFortune.definition,
      monthlyFortune: concept.monthlyFortune.definition,
    },
    yourMajorFortune: {
      startAge: majorFortune?.startAge || 0,
      direction: directionDesc,
      currentPeriod,
    },
    currentYearFortune,
    promptContext,
  };
}

// ============================================================================
// 통합 기본 분석 컨텍스트 생성 함수
// ============================================================================

export interface BasicAnalysisContext {
  category: BasicCategory;
  promptContext: string;
  rawData: unknown;
}

/**
 * 기본 분석 카테고리에 대한 컨텍스트 생성
 * @param category 기본 분석 카테고리 (dayMaster, tenGods, stars, fortune)
 * @param sajuResult 사주 분석 결과
 * @param locale 언어
 * @param birthYear 출생년도 (운세 분석에 필요)
 */
export function generateBasicAnalysisContext(
  category: string,
  sajuResult: SajuResult,
  locale: Locale,
  birthYear?: number
): BasicAnalysisContext | null {
  if (!isBasicCategory(category)) {
    return null;
  }

  switch (category) {
    case "dayMaster": {
      const context = generateDayMasterBasicContext(sajuResult, locale);
      return {
        category: "dayMaster",
        promptContext: context.promptContext,
        rawData: context,
      };
    }
    case "tenGods": {
      const context = generateTenGodsBasicContext(sajuResult, locale);
      return {
        category: "tenGods",
        promptContext: context.promptContext,
        rawData: context,
      };
    }
    case "stars": {
      const context = generateStarsBasicContext(sajuResult, locale);
      return {
        category: "stars",
        promptContext: context.promptContext,
        rawData: context,
      };
    }
    case "fortune": {
      const context = generateFortuneBasicContext(
        sajuResult,
        locale,
        birthYear || new Date().getFullYear() - 30
      );
      return {
        category: "fortune",
        promptContext: context.promptContext,
        rawData: context,
      };
    }
    default:
      return null;
  }
}

/**
 * 기본 분석 vs 종합 분석 구분 도우미
 */
export function getAnalysisTypeDescription(
  category: string,
  locale: Locale
): { type: "basic" | "comprehensive"; description: string } {
  if (isBasicCategory(category)) {
    return {
      type: "basic",
      description:
        locale === "ko"
          ? "이 탭은 사주의 구성 요소를 교육적으로 설명합니다. 개인화된 해석은 종합 분석 탭을 참조하세요."
          : "This tab provides educational explanation of Saju components. For personalized interpretation, see comprehensive analysis tabs.",
    };
  } else {
    return {
      type: "comprehensive",
      description:
        locale === "ko"
          ? "이 탭은 이 분의 사주 전체를 종합하여 개인화된 분석을 제공합니다."
          : "This tab provides personalized analysis based on the complete Saju chart.",
    };
  }
}
