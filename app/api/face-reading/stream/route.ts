import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import type { Locale } from "@/lib/i18n/config";
import { getLocaleFromRequest } from "@/lib/i18n/prompts";

/**
 * 관상 스트리밍 분석 API
 * 관상 분석 결과를 바탕으로 AI 해석을 실시간 스트리밍으로 제공
 */

type FaceReadingCategory =
  | "summary"        // 종합 해석
  | "personality"    // 성격/기질 분석
  | "fortune"        // 운세/길흉
  | "relationship"   // 대인관계/인연
  | "career"         // 직업/재물운
  | "advice";        // 조언/개운법

const validCategories: FaceReadingCategory[] = [
  "summary", "personality", "fortune", "relationship", "career", "advice"
];

// 공통 지침 (토큰 효율성)
const COMMON_RULES = {
  ko: `### 📌 핵심 원칙
**40년 경력 관상가처럼 자연스럽게 대화하세요.**

- ✅ "~이시잖아요", "~하셨을 거예요" 식의 공감 표현
- ✅ 관상에서 읽어낸 구체적인 특징과 연결
- ❌ 딱딱한 분석 톤 금지
- ❌ "위에서 말씀드린", "앞서 분석한" 같은 리마인드 금지`,
  en: `### 📌 Core Principles
**Speak naturally like a physiognomist with 40 years of experience.**

- ✅ Empathetic expressions like "You probably...", "I can see that..."
- ✅ Connect to specific features observed in face reading
- ❌ No stiff analytical tone
- ❌ No reminders like "As mentioned earlier", "As analyzed above"`
};

// 카테고리별 프롬프트
function getCategoryPrompt(
  category: FaceReadingCategory,
  locale: Locale,
  gender: string
): string {
  const currentYear = new Date().getFullYear();
  const commonRules = locale === "ko" ? COMMON_RULES.ko : COMMON_RULES.en;
  const genderText = gender === "female"
    ? (locale === "ko" ? "여성" : "female")
    : (locale === "ko" ? "남성" : "male");

  const prompts: Record<FaceReadingCategory, { ko: string; en: string }> = {
    summary: {
      ko: `## 📋 종합 관상 해석

${commonRules}

### 🎯 분석 과제
이 분의 관상을 종합적으로 해석해주세요.

### ✅ 다룰 내용
- 첫인상에서 느껴지는 기운과 분위기
- 얼굴형과 이목구비가 말해주는 전체적인 운세
- ${genderText}으로서의 관상 특징
- 타고난 복과 앞으로의 운세 흐름
- 핵심 키워드 2-3개로 관상 특성 요약

### 📏 분량
3-4 문단, 자연스러운 대화체로 작성`,
      en: `## 📋 Comprehensive Face Reading

${commonRules}

### 🎯 Analysis Task
Interpret this person's physiognomy comprehensively.

### ✅ Topics to Cover
- Energy and aura from first impression
- Overall fortune indicated by face shape and features
- Physiognomy characteristics as ${genderText}
- Innate blessings and future fortune flow
- 2-3 key words summarizing physiognomy

### 📏 Length
3-4 paragraphs in natural conversational tone`
    },
    personality: {
      ko: `## 📋 성격과 기질 분석

${commonRules}

### 🎯 분석 과제
관상에서 읽히는 성격과 내면의 기질을 분석해주세요.

### ✅ 다룰 내용
- 눈에서 읽히는 마음씨와 성정
- 입과 턱에서 보이는 의지력과 실행력
- 이마와 코에서 나타나는 사고방식
- 숨겨진 성격 (겉으로 안 보이지만 관상에서 읽히는 것)
- "이런 성격이시라 ~하셨을 거예요" 식의 공감

### 📏 분량
2-3 문단`,
      en: `## 📋 Personality and Temperament Analysis

${commonRules}

### 🎯 Analysis Task
Analyze personality and inner temperament from physiognomy.

### ✅ Topics to Cover
- Heart and disposition visible in the eyes
- Willpower and execution visible in mouth and chin
- Way of thinking shown in forehead and nose
- Hidden personality (not visible outwardly but readable in face)
- Empathetic connections like "With this personality, you probably..."

### 📏 Length
2-3 paragraphs`
    },
    fortune: {
      ko: `## 📋 운세와 길흉 분석

${commonRules}

### 🎯 분석 과제
관상에서 보이는 운세의 흐름과 길흉을 분석해주세요.

### ✅ 다룰 내용
- 삼정(상정/중정/하정)으로 보는 인생 주기별 운세
- 현재 나이대에 해당하는 부위의 운세 상태
- ${currentYear}년 현재 운세 흐름
- 타고난 복과 주의해야 할 시기
- 길상(좋은 상)과 흉상(주의할 상)

### ⚠️ 주의
흉상도 희망적이고 건설적으로 표현하세요.

### 📏 분량
2-3 문단`,
      en: `## 📋 Fortune and Auspiciousness Analysis

${commonRules}

### 🎯 Analysis Task
Analyze fortune flow and auspiciousness visible in physiognomy.

### ✅ Topics to Cover
- Life cycle fortune through Three Divisions (upper/middle/lower)
- Fortune state of features corresponding to current age
- Current fortune flow in ${currentYear}
- Innate blessings and periods requiring caution
- Auspicious signs and signs requiring attention

### ⚠️ Note
Express inauspicious signs hopefully and constructively.

### 📏 Length
2-3 paragraphs`
    },
    relationship: {
      ko: `## 📋 대인관계와 인연 분석

${commonRules}

### 🎯 분석 과제
관상에서 보이는 대인관계 운과 인연을 분석해주세요.

### ✅ 다룰 내용
- 눈과 귀에서 보이는 대인관계 스타일
- 배우자운, 자녀운에 대한 관상학적 해석
- 귀인(도움 주는 사람)과의 인연
- 직장/사회에서의 인간관계 운
- ${genderText}으로서의 이성운 특징

### 📏 분량
2-3 문단`,
      en: `## 📋 Relationships and Connections Analysis

${commonRules}

### 🎯 Analysis Task
Analyze relationship fortune and connections from physiognomy.

### ✅ Topics to Cover
- Relationship style visible in eyes and ears
- Spouse fortune and children fortune interpretation
- Connection with benefactors (helpful people)
- Workplace and social relationship fortune
- Romantic fortune characteristics as ${genderText}

### 📏 Length
2-3 paragraphs`
    },
    career: {
      ko: `## 📋 직업운과 재물운 분석

${commonRules}

### 🎯 분석 과제
관상에서 보이는 직업 적성과 재물운을 분석해주세요.

### ✅ 다룰 내용
- 코(준두)에서 보이는 재물 저장 능력
- 이마에서 읽히는 지적 능력과 리더십
- 관상에 맞는 직업/업종 추천
- 재물을 모으는 스타일과 주의점
- ${currentYear}년 재물/사업 운세

### 📏 분량
2-3 문단`,
      en: `## 📋 Career and Wealth Fortune Analysis

${commonRules}

### 🎯 Analysis Task
Analyze career aptitude and wealth fortune from physiognomy.

### ✅ Topics to Cover
- Wealth storage ability visible in nose
- Intellectual ability and leadership readable in forehead
- Recommended careers/industries matching physiognomy
- Style of accumulating wealth and cautions
- ${currentYear} wealth/business fortune

### 📏 Length
2-3 paragraphs`
    },
    advice: {
      ko: `## 📋 조언과 개운법

${commonRules}

### 🎯 분석 과제
관상을 바탕으로 실용적인 조언과 개운법을 제공해주세요.

### ✅ 다룰 내용
- 관상의 강점을 살리는 방법
- 약한 부분을 보완하는 생활 습관
- 표정 관리와 인상 개선 팁
- 행운을 부르는 색상, 방향, 숫자
- ${currentYear}년에 특히 신경 쓸 점

### 📏 분량
2-3 문단, 실천 가능한 구체적 조언으로`,
      en: `## 📋 Advice and Fortune Enhancement

${commonRules}

### 🎯 Analysis Task
Provide practical advice and fortune enhancement tips based on physiognomy.

### ✅ Topics to Cover
- How to leverage physiognomy strengths
- Lifestyle habits to compensate for weaker areas
- Expression management and impression improvement tips
- Lucky colors, directions, numbers
- Special considerations for ${currentYear}

### 📏 Length
2-3 paragraphs with actionable specific advice`
    }
  };

  const prompt = prompts[category];
  return locale === "ko" ? prompt.ko : prompt.en;
}

// 시스템 프롬프트
function getSystemPrompt(locale: Locale, gender: string): string {
  const currentYear = new Date().getFullYear();
  const genderText = gender === "female"
    ? (locale === "ko" ? "여성" : "female")
    : (locale === "ko" ? "남성" : "male");

  if (locale === "ko") {
    return `당신은 40년 경력의 따뜻한 관상가입니다.
관상 분석 데이터를 바탕으로 깊이 있는 해석을 스트리밍으로 제공합니다.

## 페르소나
- 경력: 전통 관상학 40년, 삼정/오관/오행 전문
- 스타일: 따뜻하고 공감하며, 구체적인 특징과 연결해서 설명

## 핵심 원칙
1. **콜드 리딩**: "~하셨을 거예요", "~이시잖아요" 식으로 공감
2. **구체성**: 관상 데이터의 구체적 특징과 연결해서 설명
3. **희망적 톤**: 어려운 점도 건설적으로 표현
4. **현재 반영**: ${currentYear}년 현재 트렌드와 시대상 반영
5. **성별 고려**: ${genderText}분의 관상으로 해석

## 응답 형식
- 마크다운 사용 (##, **, - 등)
- 자연스러운 대화체
- 이모지는 절제해서 사용`;
  }

  return `You are a warm physiognomist with 40 years of experience.
You provide deep interpretations based on face reading data through streaming.

## Persona
- Experience: 40 years in traditional physiognomy, Three Divisions/Five Features/Five Elements expert
- Style: Warm, empathetic, explains by connecting to specific features

## Core Principles
1. **Cold Reading**: Empathetic expressions like "You probably...", "I can see..."
2. **Specificity**: Explain by connecting to specific physiognomy data features
3. **Hopeful Tone**: Express difficulties constructively
4. **Current Context**: Reflect ${currentYear} trends
5. **Gender Consideration**: Interpret as ${genderText}'s physiognomy

## Response Format
- Use markdown (##, **, - etc.)
- Natural conversational tone
- Use emojis sparingly`;
}

// 관상 데이터를 컨텍스트 문자열로 변환
function buildFaceReadingContext(
  faceData: Record<string, unknown>,
  gender: string,
  locale: Locale
): string {
  const genderText = gender === "female"
    ? (locale === "ko" ? "여성" : "female")
    : (locale === "ko" ? "남성" : "male");

  if (locale === "ko") {
    let context = `## 관상 분석 데이터\n\n`;
    context += `### 기본 정보\n`;
    context += `- 성별: ${genderText}\n`;
    context += `- 종합 점수: ${faceData.overallScore || 0}점\n`;
    context += `- 등급: ${faceData.gradeText || ""}\n\n`;

    // 얼굴형
    if (faceData.faceShape) {
      const shape = faceData.faceShape as Record<string, unknown>;
      context += `### 얼굴형\n`;
      context += `- 유형: ${shape.koreanName || ""}\n`;
      context += `- 설명: ${shape.description || ""}\n\n`;
    }

    // 오관 분석
    if (faceData.features) {
      const features = faceData.features as Record<string, Record<string, unknown>>;
      context += `### 오관(五官) 분석\n`;
      for (const [key, feature] of Object.entries(features)) {
        context += `- ${feature.koreanName || key}: ${feature.score || 0}점 - ${feature.description || ""}\n`;
      }
      context += `\n`;
    }

    // 운세 영역
    if (faceData.fortuneAreas) {
      const areas = faceData.fortuneAreas as Record<string, Record<string, unknown>>;
      context += `### 운세 영역\n`;
      const areaLabels: Record<string, string> = {
        wealth: "재물운",
        career: "직업운",
        relationship: "대인관계",
        health: "건강운",
        love: "애정운"
      };
      for (const [key, area] of Object.entries(areas)) {
        context += `- ${areaLabels[key] || key}: ${area.score || 0}점 - ${area.description || ""}\n`;
      }
      context += `\n`;
    }

    // 강점
    if (faceData.strengths && Array.isArray(faceData.strengths)) {
      context += `### 강점\n`;
      for (const strength of faceData.strengths as string[]) {
        context += `- ${strength}\n`;
      }
      context += `\n`;
    }

    // 행운 요소
    if (faceData.luckyElements && Array.isArray(faceData.luckyElements)) {
      context += `### 행운의 요소\n`;
      context += `${(faceData.luckyElements as string[]).join(", ")}\n\n`;
    }

    return context;
  }

  // English context
  let context = `## Face Reading Analysis Data\n\n`;
  context += `### Basic Info\n`;
  context += `- Gender: ${genderText}\n`;
  context += `- Overall Score: ${faceData.overallScore || 0}\n`;
  context += `- Grade: ${faceData.gradeText || ""}\n\n`;

  if (faceData.faceShape) {
    const shape = faceData.faceShape as Record<string, unknown>;
    context += `### Face Shape\n`;
    context += `- Type: ${shape.koreanName || ""}\n`;
    context += `- Description: ${shape.description || ""}\n\n`;
  }

  if (faceData.features) {
    const features = faceData.features as Record<string, Record<string, unknown>>;
    context += `### Five Features Analysis\n`;
    for (const [key, feature] of Object.entries(features)) {
      context += `- ${key}: ${feature.score || 0} - ${feature.description || ""}\n`;
    }
    context += `\n`;
  }

  return context;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      faceData,
      gender,
      locale: requestLocale
    } = body;

    // Determine locale
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    // Validate required fields
    if (!category || !faceData) {
      return NextResponse.json(
        { error: locale === "ko" ? "카테고리와 관상 데이터가 필요합니다." : "Category and face data required." },
        { status: 400 }
      );
    }

    if (!validCategories.includes(category as FaceReadingCategory)) {
      return NextResponse.json(
        { error: locale === "ko" ? "잘못된 카테고리입니다." : "Invalid category." },
        { status: 400 }
      );
    }

    const genderValue = gender || "male";

    // Initialize Google GenAI
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });

    // Build context from face data
    const contextInfo = buildFaceReadingContext(faceData, genderValue, locale);

    // Build prompt
    const systemPrompt = getSystemPrompt(locale, genderValue);
    const categoryPrompt = getCategoryPrompt(
      category as FaceReadingCategory,
      locale,
      genderValue
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
    console.error("Face reading stream error:", error);

    let locale: Locale = "ko";
    try {
      const body = await request.clone().json();
      locale = body.locale === "en" ? "en" : "ko";
    } catch {
      // Default Korean
    }

    return NextResponse.json(
      { error: locale === "ko" ? "관상 분석 중 오류가 발생했습니다." : "Error during face reading analysis." },
      { status: 500 }
    );
  }
}
