import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import type { Locale } from "@/lib/i18n/config";
import { getLocaleFromRequest } from "@/lib/i18n/prompts";

/**
 * 궁합 AI 해석 API
 * 두 사람의 사주 데이터를 바탕으로 AI가 개인화된 궁합 해석을 제공
 */

interface CompatibilityInterpretation {
  summary: string;
  communication: string;
  chemistry: string;
  challenges: string;
  advice: string;
}

function getSystemPrompt(locale: Locale, type: "couple" | "work"): string {
  if (locale === "ko") {
    if (type === "couple") {
      return `당신은 40년 경력의 따뜻한 역술가입니다.
두 사람의 사주를 보고 연인 궁합을 해석합니다.

## 해석 원칙
1. **따뜻함**: 부정적인 면도 건설적으로 표현하세요.
2. **구체성**: 두 사람의 관계에 대해 구체적으로 설명하세요.
3. **균형**: 좋은 점과 주의할 점을 균형있게 언급하세요.
4. **자연스러움**: 전문 용어는 최소화하고 일상 언어로 풀어서 설명하세요.

두 사람만의 고유한 관계 특성을 찾아 이야기해 주세요.`;
    }

    return `당신은 40년 경력의 따뜻한 역술가입니다.
두 사람의 사주를 보고 직장/비즈니스 관계 궁합을 해석합니다.

## 해석 원칙
1. **전문성**: 업무 관계에서의 시너지와 협업 가능성을 분석하세요.
2. **구체성**: 두 사람의 협업 스타일과 강점을 구체적으로 설명하세요.
3. **균형**: 협업의 장점과 주의할 점을 균형있게 언급하세요.
4. **자연스러움**: 전문 용어는 최소화하고 일상 언어로 풀어서 설명하세요.

두 사람의 업무적 시너지 특성을 찾아 이야기해 주세요.`;
  }

  // English prompts
  if (type === "couple") {
    return `You are a warm and experienced fortune teller with 40 years of expertise.
You analyze the compatibility between two people as romantic partners based on their birth charts.

## Interpretation Principles
1. **Warmth**: Express negative aspects constructively.
2. **Specificity**: Explain their relationship dynamics in detail.
3. **Balance**: Mention both strengths and areas to watch.
4. **Natural Language**: Minimize jargon, explain in everyday words.

Find and speak to the unique characteristics of their relationship.`;
  }

  return `You are a warm and experienced fortune teller with 40 years of expertise.
You analyze the compatibility between two people for business/work relationships based on their birth charts.

## Interpretation Principles
1. **Professionalism**: Analyze synergy and collaboration potential in work relationships.
2. **Specificity**: Explain their collaboration styles and strengths in detail.
3. **Balance**: Mention both collaboration strengths and areas to watch.
4. **Natural Language**: Minimize jargon, explain in everyday words.

Find and speak to the unique work synergy characteristics of their partnership.`;
}

function getUserPrompt(locale: Locale, type: "couple" | "work", data: {
  person1: { name: string; pillars: string; dayMaster: string; elements: string };
  person2: { name: string; pillars: string; dayMaster: string; elements: string };
  score: number;
  relationType?: string;
}): string {
  if (locale === "ko") {
    const relationLabel = type === "couple" ? "연인" : "직장 동료";

    return `다음 두 사람의 ${relationLabel} 궁합을 분석해 주세요.

## 첫 번째: ${data.person1.name}
- 사주: ${data.person1.pillars}
- 일간: ${data.person1.dayMaster}
- 오행: ${data.person1.elements}

## 두 번째: ${data.person2.name}
- 사주: ${data.person2.pillars}
- 일간: ${data.person2.dayMaster}
- 오행: ${data.person2.elements}

## 궁합 점수: ${data.score}점
${data.relationType ? `## 관계 유형: ${data.relationType}` : ''}

---

반드시 아래 JSON 형식으로만 응답하세요:
{
  "summary": "두 사람의 궁합 총평 (3-4문장)",
  "communication": "${type === 'couple' ? '소통과 감정 교류' : '소통과 협업'} 분석 (2-3문장)",
  "chemistry": "${type === 'couple' ? '애정과 케미스트리' : '업무 시너지'} 분석 (2-3문장)",
  "challenges": "함께할 때 주의할 점 (2-3문장)",
  "advice": "두 사람을 위한 조언 (2-3문장)"
}`;
  }

  // English
  const relationLabel = type === "couple" ? "romantic partners" : "work colleagues";

  return `Please analyze the compatibility between these two ${relationLabel}.

## First Person: ${data.person1.name}
- Birth Chart: ${data.person1.pillars}
- Day Master: ${data.person1.dayMaster}
- Five Elements: ${data.person1.elements}

## Second Person: ${data.person2.name}
- Birth Chart: ${data.person2.pillars}
- Day Master: ${data.person2.dayMaster}
- Five Elements: ${data.person2.elements}

## Compatibility Score: ${data.score} points
${data.relationType ? `## Relationship Type: ${data.relationType}` : ''}

---

Respond ONLY in the following JSON format:
{
  "summary": "Overall compatibility summary (3-4 sentences)",
  "communication": "${type === 'couple' ? 'Communication and emotional exchange' : 'Communication and collaboration'} analysis (2-3 sentences)",
  "chemistry": "${type === 'couple' ? 'Affection and chemistry' : 'Work synergy'} analysis (2-3 sentences)",
  "challenges": "Areas to be mindful of together (2-3 sentences)",
  "advice": "Advice for the two (2-3 sentences)"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2, score, type, relationType, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!person1 || !person2) {
      return NextResponse.json(
        { error: locale === 'ko' ? '두 사람의 정보가 필요합니다.' : 'Information for both people is required.' },
        { status: 400 }
      );
    }

    const compatibilityType = type === "couple" ? "couple" : "work";

    // Initialize Google GenAI (dynamic import to prevent build-time evaluation)
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });

    const systemPrompt = getSystemPrompt(locale, compatibilityType);
    const userPrompt = getUserPrompt(locale, compatibilityType, {
      person1,
      person2,
      score: score || 50,
      relationType,
    });

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
    });

    // Extract text from response
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON response
    let interpretation: CompatibilityInterpretation;
    try {
      let jsonText = responseText.trim();

      // Fix truncated JSON
      const openBraces = (jsonText.match(/\{/g) || []).length;
      const closeBraces = (jsonText.match(/\}/g) || []).length;
      for (let i = 0; i < openBraces - closeBraces; i++) {
        jsonText += '}';
      }

      const parsed = JSON.parse(jsonText);

      interpretation = {
        summary: parsed.summary || (locale === 'ko' ? "두 분의 궁합을 분석했습니다." : "We have analyzed your compatibility."),
        communication: parsed.communication || "",
        chemistry: parsed.chemistry || "",
        challenges: parsed.challenges || "",
        advice: parsed.advice || "",
      };
    } catch {
      // Regex extraction fallback
      const extract = (text: string, key: string): string => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, 'i');
        const match = text.match(regex);
        return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
      };

      interpretation = {
        summary: extract(responseText, 'summary') || (locale === 'ko' ? "두 분의 궁합을 분석했습니다." : "We have analyzed your compatibility."),
        communication: extract(responseText, 'communication') || "",
        chemistry: extract(responseText, 'chemistry') || "",
        challenges: extract(responseText, 'challenges') || "",
        advice: extract(responseText, 'advice') || "",
      };
    }

    return NextResponse.json(interpretation);
  } catch (error) {
    console.error("Compatibility interpretation error:", error);

    // Try to get locale from request for error message
    let errorLocale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      errorLocale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    return NextResponse.json(
      { error: errorLocale === 'ko' ? "궁합 해석 중 오류가 발생했습니다." : "An error occurred during compatibility interpretation." },
      { status: 500 }
    );
  }
}
