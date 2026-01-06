import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import type { Locale } from "@/lib/i18n/config";
import { getLocaleFromRequest } from "@/lib/i18n/prompts";
import { ELEMENT_KOREAN } from "@/lib/saju/constants";
import type { Element } from "@/lib/saju/types";

/**
 * 궁합 스트리밍 분석 API
 * 사주 분석과 동일한 SSE 스트리밍 방식으로 실시간 해석 제공
 */

type CompatibilityCategory =
  | "summary"      // 종합 궁합 요약
  | "communication" // 소통/협업 분석
  | "synergy"      // 시너지/케미 분석
  | "challenges"   // 주의할 점
  | "advice"       // 조언 및 팁
  | "timing";      // 좋은 시기

const validCategories: CompatibilityCategory[] = [
  "summary", "communication", "synergy", "challenges", "advice", "timing"
];

// 관계 유형별 라벨
function getRelationTypeLabel(type: string | undefined, locale: Locale): string {
  const labels: Record<string, { ko: string; en: string }> = {
    colleague: { ko: "동료", en: "colleague" },
    supervisor: { ko: "선배", en: "senior" },
    subordinate: { ko: "후배", en: "junior" },
    partner: { ko: "파트너", en: "partner" },
    client: { ko: "고객", en: "client" },
    mentor: { ko: "멘토", en: "mentor" },
    mentee: { ko: "멘티", en: "mentee" },
    lover: { ko: "연인", en: "lover" },
    spouse: { ko: "배우자", en: "spouse" },
  };
  const label = labels[type || "colleague"];
  return locale === "ko" ? label?.ko || "동료" : label?.en || "colleague";
}

// 카테고리별 프롬프트
function getCategoryPrompt(
  category: CompatibilityCategory,
  locale: Locale,
  relationType: string,
  isRomantic: boolean
): string {
  const currentYear = new Date().getFullYear();

  const prompts: Record<CompatibilityCategory, { ko: string; en: string }> = {
    summary: {
      ko: `두 사람의 **${relationType} 궁합**을 종합적으로 분석해주세요.

다음 내용을 자연스러운 대화체로 풀어서 설명해주세요:
• 두 사람의 일간(日干) 조합이 만들어내는 케미
• 오행 밸런스가 서로 보완하는지, 충돌하는지
• ${isRomantic ? "연인으로서" : "업무 파트너로서"} 전체적인 궁합 평가

**응답 형식**:
- 마크다운 제목(#, ##) 없이 본문만 작성
- 3-4개의 짧은 문단으로 구성
- 각 문단은 2-3문장
- "~하시잖아요", "~셨을 거예요" 같은 따뜻한 공감 표현 사용`,
      en: `Please analyze the **${relationType} compatibility** comprehensively.

Explain the following in a natural conversational tone:
• Chemistry created by their Day Master combination
• Whether their Five Elements balance complements or conflicts
• Overall compatibility as ${isRomantic ? "romantic partners" : "work partners"}

**Response format**:
- Plain text only, no markdown headers (#, ##)
- 3-4 short paragraphs
- Each paragraph 2-3 sentences
- Use warm, empathetic expressions`
    },
    communication: {
      ko: `두 사람이 어떻게 소통하고 ${isRomantic ? "감정을 나누는지" : "협업하는지"} 분석해주세요.

다음 내용을 다뤄주세요:
• 대화 스타일 (직접적 vs 우회적, 논리적 vs 감성적)
• ${isRomantic ? "감정 표현 방식과 교류 패턴" : "업무 의사소통 패턴"}
• 오해가 생기기 쉬운 상황과 해결 방법

**응답 형식**:
- 마크다운 제목 없이 본문만
- 2-3개의 짧은 문단
- 각 문단 2-3문장
- 공감하는 따뜻한 톤으로`,
      en: `Analyze how these two communicate and ${isRomantic ? "share emotions" : "collaborate"}.

Cover the following:
• Communication styles (direct vs indirect, logical vs emotional)
• ${isRomantic ? "Emotional expression patterns" : "Work communication patterns"}
• Situations prone to misunderstanding and solutions

**Response format**:
- Plain text only, no markdown headers
- 2-3 short paragraphs
- Each paragraph 2-3 sentences
- Warm, empathetic tone`
    },
    synergy: {
      ko: `두 사람이 함께할 때 발생하는 ${isRomantic ? "케미스트리와 끌림" : "시너지 효과"}를 분석해주세요.

다음 내용을 다뤄주세요:
• 일간 조합이 만드는 에너지 (상생/상극/비화 관계)
• ${isRomantic ? "서로에게 끌리는 포인트" : "협업 시 각자의 강점이 어떻게 발휘되는지"}
• 함께할 때 증폭되는 긍정적 에너지

**응답 형식**:
- 마크다운 제목 없이 본문만
- 2-3개의 짧은 문단
- 각 문단 2-3문장
- ${currentYear}년 현재 상황 반영`,
      en: `Analyze the ${isRomantic ? "chemistry and attraction" : "synergy effect"} when these two are together.

Cover the following:
• Energy from Day Master combination (generating/controlling/same relationship)
• ${isRomantic ? "Points of mutual attraction" : "How each person's strengths shine in collaboration"}
• Positive energy amplified together

**Response format**:
- Plain text only, no markdown headers
- 2-3 short paragraphs
- Each paragraph 2-3 sentences
- Reflect current ${currentYear} context`
    },
    challenges: {
      ko: `두 사람 관계에서 주의해야 할 점을 **건설적으로** 분석해주세요.

다음 내용을 다뤄주세요:
• 오행 충돌로 인한 잠재적 갈등 포인트
• ${isRomantic ? "연애 중" : "업무 중"} 생길 수 있는 오해 상황
• 성격 차이에서 오는 마찰 가능성과 극복 방법

**중요**: 부정적인 내용도 희망적이고 건설적으로 표현해주세요.

**응답 형식**:
- 마크다운 제목 없이 본문만
- 2-3개의 짧은 문단
- 각 문단 2-3문장
- "이럴 때 조심하시면 좋아요" 같은 따뜻한 조언 톤`,
      en: `Analyze relationship challenges **constructively**.

Cover the following:
• Potential conflict points from Five Elements clashes
• Misunderstanding situations during ${isRomantic ? "dating" : "work"}
• Possible friction from personality differences and how to overcome

**Important**: Express negative aspects hopefully and constructively.

**Response format**:
- Plain text only, no markdown headers
- 2-3 short paragraphs
- Each paragraph 2-3 sentences
- Warm advisory tone`
    },
    advice: {
      ko: `두 사람의 관계가 더 좋아지기 위한 **실용적인 조언**을 제공해주세요.

다음 내용을 다뤄주세요:
• 오행 균형을 맞추기 위한 구체적 방법
• ${isRomantic ? "연인으로서" : "동료로서"} 서로를 위한 행동 팁
• 함께하면 좋은 활동이나 장소
• ${currentYear}년에 특히 신경 쓸 점

**응답 형식**:
- 마크다운 제목 없이 본문만
- 2-3개의 짧은 문단
- 각 문단 2-3문장
- 실천 가능한 구체적인 조언으로`,
      en: `Provide **practical advice** for improving their relationship.

Cover the following:
• Specific methods to balance Five Elements
• Action tips for each other as ${isRomantic ? "partners" : "colleagues"}
• Activities or places good to enjoy together
• Special considerations for ${currentYear}

**Response format**:
- Plain text only, no markdown headers
- 2-3 short paragraphs
- Each paragraph 2-3 sentences
- Actionable specific advice`
    },
    timing: {
      ko: `두 사람 관계에서 중요한 **시기와 타이밍**을 분석해주세요.

다음 내용을 다뤄주세요:
• ${currentYear}년 함께하기 좋은 달/시기
• ${isRomantic ? "중요한 결정(고백, 약속 등)" : "중요한 프로젝트"} 하기 좋은 때
• 조심해야 할 시기
• 장기적 관점에서의 관계 전망

**응답 형식**:
- 마크다운 제목 없이 본문만
- 2-3개의 짧은 문단
- 각 문단 2-3문장
- 희망적인 톤 유지`,
      en: `Analyze important **timing** for their relationship.

Cover the following:
• Good months/periods to be together in ${currentYear}
• Best times for ${isRomantic ? "important decisions (confessing, commitments)" : "important projects"}
• Periods requiring caution
• Long-term relationship outlook

**Response format**:
- Plain text only, no markdown headers
- 2-3 short paragraphs
- Each paragraph 2-3 sentences
- Maintain hopeful tone`
    }
  };

  const prompt = prompts[category];
  return locale === "ko" ? prompt.ko : prompt.en;
}

// 시스템 프롬프트
function getSystemPrompt(locale: Locale, isRomantic: boolean): string {
  const currentYear = new Date().getFullYear();

  if (locale === "ko") {
    return `당신은 40년 경력의 따뜻한 역술가 이현숙 선생님입니다.
두 사람의 사주를 보고 ${isRomantic ? "연인" : "업무"} 궁합을 해석합니다.

## 말투와 스타일
- "~하시잖아요", "~셨을 거예요" 처럼 따뜻하게 공감
- 두 사람만의 특별한 케미를 구체적으로 설명
- 어려운 점도 희망적이고 건설적으로 표현
- ${currentYear}년 현재 상황 반영

## 응답 형식 (매우 중요)
- 마크다운 제목(#, ##, ###) 절대 사용 금지
- 순수한 본문 텍스트만 작성
- 짧은 문단들로 구성 (각 문단 2-3문장)
- 문단 사이에 빈 줄로 구분
- 이모지 사용 금지`;
  }

  return `You are Master Lee, a warm fortune teller with 40 years of experience.
You interpret ${isRomantic ? "romantic" : "work"} compatibility.

## Style
- Warm, empathetic expressions like "You probably...", "I can see..."
- Explain specific chemistry unique to this pair
- Express difficulties constructively and hopefully
- Reflect ${currentYear} context

## Response Format (Very Important)
- NO markdown headers (#, ##, ###)
- Plain body text only
- Short paragraphs (2-3 sentences each)
- Separate paragraphs with blank lines
- NO emojis`;
}

// 오행 관계 분석
function getElementRelation(e1: Element, e2: Element, locale: Locale): string {
  const relations: Record<Element, { generates: Element; controls: Element }> = {
    wood: { generates: "fire", controls: "earth" },
    fire: { generates: "earth", controls: "metal" },
    earth: { generates: "metal", controls: "water" },
    metal: { generates: "water", controls: "wood" },
    water: { generates: "wood", controls: "fire" },
  };

  if (e1 === e2) {
    return locale === "ko" ? "비화(比和) - 같은 기운으로 조화" : "Same energy - harmonious";
  }
  if (relations[e1].generates === e2) {
    return locale === "ko"
      ? `상생(相生) - ${ELEMENT_KOREAN[e1]}이 ${ELEMENT_KOREAN[e2]}를 생함`
      : `Generating - ${e1} generates ${e2}`;
  }
  if (relations[e2].generates === e1) {
    return locale === "ko"
      ? `상생(相生) - ${ELEMENT_KOREAN[e2]}가 ${ELEMENT_KOREAN[e1]}를 생함`
      : `Generating - ${e2} generates ${e1}`;
  }
  if (relations[e1].controls === e2) {
    return locale === "ko"
      ? `상극(相剋) - ${ELEMENT_KOREAN[e1]}이 ${ELEMENT_KOREAN[e2]}를 극함`
      : `Controlling - ${e1} controls ${e2}`;
  }
  if (relations[e2].controls === e1) {
    return locale === "ko"
      ? `상극(相剋) - ${ELEMENT_KOREAN[e2]}가 ${ELEMENT_KOREAN[e1]}를 극함`
      : `Controlling - ${e2} controls ${e1}`;
  }
  return locale === "ko" ? "중립 관계" : "Neutral relationship";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      person1,
      person2,
      compatibilityData,
      relationType,
      locale: requestLocale
    } = body;

    // Determine locale
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    // Validate required fields
    if (!category || !person1 || !person2) {
      return NextResponse.json(
        { error: locale === "ko" ? "카테고리와 두 사람 정보가 필요합니다." : "Category and both people's info required." },
        { status: 400 }
      );
    }

    if (!validCategories.includes(category as CompatibilityCategory)) {
      return NextResponse.json(
        { error: locale === "ko" ? "잘못된 카테고리입니다." : "Invalid category." },
        { status: 400 }
      );
    }

    // Determine if romantic relationship
    const romanticTypes = ["lover", "spouse", "dating", "engaged", "interested", "exPartner"];
    const isRomantic = romanticTypes.includes(relationType || "");

    const relationLabel = getRelationTypeLabel(relationType, locale);
    const currentYear = new Date().getFullYear();

    // Initialize Google GenAI
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });

    // Build context from compatibility data
    let contextInfo = "";
    if (compatibilityData) {
      const p1DayMaster = compatibilityData.person1Pillars?.day?.gan || person1.dayMaster;
      const p2DayMaster = compatibilityData.person2Pillars?.day?.gan || person2.dayMaster;

      // Element relationship
      const p1Element = person1.dayMasterElement as Element;
      const p2Element = person2.dayMasterElement as Element;
      const elementRelation = p1Element && p2Element
        ? getElementRelation(p1Element, p2Element, locale)
        : "";

      if (locale === "ko") {
        contextInfo = `
## 두 사람의 사주 정보

### ${person1.name}
- 사주: ${person1.pillars || ""}
- 일간: ${p1DayMaster} (${ELEMENT_KOREAN[p1Element] || ""})
- 오행 분포: ${person1.elements || ""}

### ${person2.name}
- 사주: ${person2.pillars || ""}
- 일간: ${p2DayMaster} (${ELEMENT_KOREAN[p2Element] || ""})
- 오행 분포: ${person2.elements || ""}

### 관계 정보
- 관계 유형: ${relationLabel}
- 궁합 점수: ${compatibilityData.score || 0}점 (${compatibilityData.gradeText || ""})
- 일간 관계: ${elementRelation}
- 분석 시점: ${currentYear}년`;
      } else {
        contextInfo = `
## Both People's Birth Chart Info

### ${person1.name}
- Birth Chart: ${person1.pillars || ""}
- Day Master: ${p1DayMaster} (${p1Element || ""})
- Five Elements: ${person1.elements || ""}

### ${person2.name}
- Birth Chart: ${person2.pillars || ""}
- Day Master: ${p2DayMaster} (${p2Element || ""})
- Five Elements: ${person2.elements || ""}

### Relationship Info
- Type: ${relationLabel}
- Score: ${compatibilityData.score || 0} (${compatibilityData.gradeText || ""})
- Day Master Relation: ${elementRelation}
- Analysis Date: ${currentYear}`;
      }
    }

    // Build prompt
    const systemPrompt = getSystemPrompt(locale, isRomantic);
    const categoryPrompt = getCategoryPrompt(
      category as CompatibilityCategory,
      locale,
      relationLabel,
      isRomantic
    );

    const fullPrompt = `${systemPrompt}\n\n${contextInfo}\n\n${categoryPrompt}`;

    // Streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: GEMINI_MODEL,
            config: {
              tools: [{ googleSearch: {} }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: fullPrompt }],
              },
            ],
          });

          let fullText = "";

          for await (const chunk of response) {
            const text = chunk.text || "";
            if (text) {
              fullText += text;
              const data = JSON.stringify({ type: "text", content: text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            // Check for grounding metadata
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata) {
              const groundingChunks = groundingMetadata.groundingChunks || [];
              const sources = groundingChunks
                .filter((c: { web?: { uri?: string; title?: string } }) => c.web?.uri)
                .map((c: { web?: { uri?: string; title?: string } }) => ({
                  url: c.web?.uri,
                  title: c.web?.title || "",
                }))
                .slice(0, 3);

              if (sources.length > 0) {
                const metaData = JSON.stringify({
                  type: "metadata",
                  groundingSources: sources,
                });
                controller.enqueue(encoder.encode(`data: ${metaData}\n\n`));
              }
            }
          }

          // Send completion
          const doneData = JSON.stringify({
            type: "done",
            category,
            fullContent: fullText,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({
            type: "error",
            message: error instanceof Error ? error.message : "스트리밍 오류",
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
    console.error("Compatibility stream error:", error);

    let locale: Locale = "ko";
    try {
      const body = await request.clone().json();
      locale = body.locale === "en" ? "en" : "ko";
    } catch {
      // Default Korean
    }

    return NextResponse.json(
      { error: locale === "ko" ? "궁합 분석 중 오류가 발생했습니다." : "Error during compatibility analysis." },
      { status: 500 }
    );
  }
}
