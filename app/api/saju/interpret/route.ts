import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Locale } from "@/lib/i18n/config";
import { GEMINI_MODEL } from "@/lib/constants/ai";

/**
 * 사주 기본 해석 API
 * 계산된 사주 데이터를 바탕으로 AI가 개인화된 해석을 제공
 */

// 간소화된 해석 결과 스키마
const SimplifiedInterpretationSchema = z.object({
  personality: z.string().describe("성격과 기질 해석 (3-4문장)"),
  strengths: z.array(z.string()).describe("강점 2-3개 (각 1문장)"),
  challenges: z.array(z.string()).describe("주의점 2-3개 (각 1문장)"),
  elements: z.string().describe("오행 균형이 삶에 주는 영향 (2-3문장)"),
  lifePattern: z.string().describe("십성과 신살이 보여주는 삶의 패턴 (2-3문장)"),
  message: z.string().describe("따뜻한 격려 메시지 (2-3문장)"),
});

type SimplifiedInterpretation = z.infer<typeof SimplifiedInterpretationSchema>;

// 프론트엔드 호환성을 위한 변환된 응답 타입
interface BasicInterpretation {
  personalityReading: {
    summary: string;
    coreTraits: string[];
    strengths: string[];
    challenges: string[];
  };
  elementInsight: {
    balance: string;
    recommendation: string;
  };
  tenGodInsight: {
    dominant: string;
    lifePattern: string;
  };
  starInsight: {
    positive: string;
    caution: string;
  };
  overallMessage: string;
}

function getSystemPrompt(locale: Locale): string {
  if (locale === "ko") {
    return `당신은 40년 경력의 따뜻한 역술가입니다.
전통 명리학에 정통하면서도 현대인이 이해하기 쉬운 언어로 사주를 해석합니다.

## 해석 원칙
1. **개인화**: 같은 사주라도 맥락에 따라 다르게 해석하세요. 기계적인 공식이 아닌 통합적 통찰을 제공하세요.
2. **따뜻함**: 부정적인 면도 건설적으로 표현하세요. 비난보다 조언, 걱정보다 격려.
3. **구체성**: "좋은 운"이 아니라 "무엇이 왜 좋은지" 구체적으로 설명하세요.
4. **균형**: 장점만 나열하지 말고, 주의점도 함께 언급하되 희망적으로 마무리하세요.
5. **자연스러움**: 전문 용어는 최소화하고, 일상 언어로 풀어서 설명하세요.

## 해석 시 고려사항
- 일간의 특성과 월령과의 관계 (득령/실령)
- 오행의 균형과 부족/과다한 기운
- 십성 분포가 보여주는 삶의 패턴
- 신살이 암시하는 특별한 기운

절대로 천편일률적인 해석을 하지 마세요.
이 사람만의 고유한 특성을 찾아 이야기해 주세요.`;
  }

  return `You are a warm and experienced fortune teller with 40 years of expertise.
You are well-versed in traditional Four Pillars astrology but explain in modern, accessible language.

## Interpretation Principles
1. **Personalization**: Provide integrated insights, not mechanical formulas. Same chart can mean different things in context.
2. **Warmth**: Express negative aspects constructively. Advice over criticism, encouragement over worry.
3. **Specificity**: Not just "good fortune" but explain what is good and why specifically.
4. **Balance**: Don't just list positives. Mention cautions too, but end on a hopeful note.
5. **Natural Language**: Minimize jargon, explain in everyday words.

Never give cookie-cutter interpretations.
Find and speak to this person's unique characteristics.`;
}

function getUserPrompt(locale: Locale, sajuData: {
  dayMaster: string;
  dayMasterDescription: string;
  pillars: { year: string; month: string; day: string; time: string };
  elementScores: { wood: number; fire: number; earth: number; metal: number; water: number };
  elementBalance: string;
  dominantElements: string[];
  lackingElements: string[];
  yongShin?: string;
  dominantTenGods: string[];
  stars: { name: string; type: string; description: string }[];
  gender: string;
}): string {
  const starList = sajuData.stars.map(s => `${s.name} (${s.type}): ${s.description}`).join('\n');

  if (locale === "ko") {
    return `다음 사주를 분석하여 개인화된 해석을 제공해 주세요.

## 기본 정보
- 성별: ${sajuData.gender === 'male' ? '남성' : '여성'}

## 사주팔자
- 년주: ${sajuData.pillars.year}
- 월주: ${sajuData.pillars.month}
- 일주: ${sajuData.pillars.day}
- 시주: ${sajuData.pillars.time}

## 일간 (본인)
${sajuData.dayMaster} - ${sajuData.dayMasterDescription}

## 오행 점수
- 목(木): ${sajuData.elementScores.wood}점
- 화(火): ${sajuData.elementScores.fire}점
- 토(土): ${sajuData.elementScores.earth}점
- 금(金): ${sajuData.elementScores.metal}점
- 수(水): ${sajuData.elementScores.water}점

## 오행 분석
- 균형 상태: ${sajuData.elementBalance}
- 강한 오행: ${sajuData.dominantElements.join(', ') || '없음'}
- 부족한 오행: ${sajuData.lackingElements.join(', ') || '없음'}
${sajuData.yongShin ? `- 용신: ${sajuData.yongShin}` : ''}

## 십성 분석
- 주요 십성: ${sajuData.dominantTenGods.join(', ')}

## 신살
${starList || '특별한 신살 없음'}

---

위 사주를 바탕으로 해석해 주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "personality": "성격과 기질 해석 (3-4문장)",
  "strengths": ["강점1", "강점2", "강점3"],
  "challenges": ["주의점1", "주의점2"],
  "elements": "오행 균형이 삶에 주는 영향 (2-3문장)",
  "lifePattern": "십성과 신살이 보여주는 삶의 패턴 (2-3문장)",
  "message": "따뜻한 격려 메시지 (2-3문장)"
}`;
  }

  return `Please analyze the following birth chart and provide personalized interpretation.

## Basic Information
- Gender: ${sajuData.gender === 'male' ? 'Male' : 'Female'}

## Four Pillars
- Year: ${sajuData.pillars.year}
- Month: ${sajuData.pillars.month}
- Day: ${sajuData.pillars.day}
- Hour: ${sajuData.pillars.time}

## Day Master (Self)
${sajuData.dayMaster} - ${sajuData.dayMasterDescription}

## Five Elements Score
- Wood: ${sajuData.elementScores.wood}
- Fire: ${sajuData.elementScores.fire}
- Earth: ${sajuData.elementScores.earth}
- Metal: ${sajuData.elementScores.metal}
- Water: ${sajuData.elementScores.water}

## Element Analysis
- Balance: ${sajuData.elementBalance}
- Dominant: ${sajuData.dominantElements.join(', ') || 'None'}
- Lacking: ${sajuData.lackingElements.join(', ') || 'None'}
${sajuData.yongShin ? `- Useful God: ${sajuData.yongShin}` : ''}

## Ten Gods
- Dominant: ${sajuData.dominantTenGods.join(', ')}

## Special Stars
${starList || 'No special stars'}

---

Based on this chart:
1. Vividly describe this person's innate personality and temperament
2. Explain how the element balance affects their life
3. Interpret the life patterns shown by the Ten Gods distribution
4. Explain the special energy from the stars
5. End with a warm, encouraging overall message

Respond in JSON format.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sajuData, locale: requestLocale } = body;

    const locale: Locale = requestLocale === 'en' ? 'en' : 'ko';

    if (!sajuData) {
      return NextResponse.json(
        { error: locale === 'ko' ? '사주 데이터가 필요합니다.' : 'Saju data is required.' },
        { status: 400 }
      );
    }

    // Initialize Google GenAI (dynamic import to prevent build-time evaluation)
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });

    const systemPrompt = getSystemPrompt(locale);
    const userPrompt = getUserPrompt(locale, sajuData);

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192, // Prevent truncation
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`,
            },
          ],
        },
      ],
    });

    // Extract text from response
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON response - simplified 4-field schema
    let interpretation: BasicInterpretation;
    try {
      let jsonText = responseText.trim();

      // Fix truncated JSON by adding missing braces
      const openBraces = (jsonText.match(/\{/g) || []).length;
      const closeBraces = (jsonText.match(/\}/g) || []).length;
      for (let i = 0; i < openBraces - closeBraces; i++) {
        jsonText += '}';
      }

      let parsed: SimplifiedInterpretation;
      try {
        const rawParsed = JSON.parse(jsonText);
        // Handle array response
        const obj = Array.isArray(rawParsed) ? rawParsed[0] : rawParsed;

        // Extract fields with fallbacks for various key names
        parsed = {
          personality: obj.personality || obj.personality_and_temperament || obj.character || '',
          strengths: Array.isArray(obj.strengths) ? obj.strengths : [],
          challenges: Array.isArray(obj.challenges) ? obj.challenges : [],
          elements: obj.elements || obj.elemental_balance || obj.five_elements || '',
          lifePattern: obj.lifePattern || obj.life_pattern || obj.ten_gods || '',
          message: obj.message || obj.closing_message || obj.overall_message || '',
        };
      } catch {
        // Regex extraction for broken JSON
        console.log("JSON parsing failed, using regex extraction");
        const extract = (text: string, key: string): string => {
          const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, 'i');
          const match = text.match(regex);
          return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
        };

        const extractArray = (text: string, key: string): string[] => {
          const regex = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)]`, 'i');
          const match = text.match(regex);
          if (!match) return [];
          try {
            return JSON.parse(`[${match[1]}]`);
          } catch {
            // Try to extract individual strings
            const items = match[1].match(/"([^"]+)"/g);
            return items ? items.map(s => s.replace(/"/g, '')) : [];
          }
        };

        parsed = {
          personality: extract(responseText, 'personality') || extract(responseText, 'personality_and_temperament') || '',
          strengths: extractArray(responseText, 'strengths'),
          challenges: extractArray(responseText, 'challenges'),
          elements: extract(responseText, 'elements') || extract(responseText, 'elemental_balance') || '',
          lifePattern: extract(responseText, 'lifePattern') || extract(responseText, 'life_pattern') || '',
          message: extract(responseText, 'message') || extract(responseText, 'closing_message') || '',
        };
      }

      // Convert simplified response to frontend-compatible format
      interpretation = {
        personalityReading: {
          summary: parsed.personality || "타고난 성격과 기질을 분석했습니다.",
          coreTraits: [],
          strengths: parsed.strengths || [],
          challenges: parsed.challenges || [],
        },
        elementInsight: {
          balance: parsed.elements || "오행의 균형을 살펴봤습니다.",
          recommendation: "",
        },
        tenGodInsight: {
          dominant: parsed.lifePattern || "십성의 배치를 분석했습니다.",
          lifePattern: "",
        },
        starInsight: {
          positive: "",
          caution: "",
        },
        overallMessage: parsed.message || "당신의 사주에서 특별한 가능성을 발견했습니다.",
      };
    } catch (parseError) {
      console.error("Failed to parse interpretation JSON:", responseText);
      console.error("Parse error:", parseError);
      return NextResponse.json(
        { error: locale === 'ko' ? '해석 결과를 파싱할 수 없습니다.' : 'Failed to parse interpretation.' },
        { status: 500 }
      );
    }

    return NextResponse.json(interpretation);
  } catch (error) {
    console.error("Saju interpretation error:", error);

    // Try to get locale from request for error message
    let errorLocale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      errorLocale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    return NextResponse.json(
      { error: errorLocale === 'ko' ? "사주 해석 중 오류가 발생했습니다." : "An error occurred during birth chart interpretation." },
      { status: 500 }
    );
  }
}
