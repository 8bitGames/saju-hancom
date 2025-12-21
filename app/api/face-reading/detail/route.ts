import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  getDetailedFaceReadingSystemPrompt,
  getDetailedFaceReadingUserPrompt,
  getGenderLabel,
  getErrorMessage,
  getLocaleFromRequest,
} from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";
import { GEMINI_MODEL } from "@/lib/constants/ai";

// 관상 관련 검색 쿼리 생성
function generateFaceReadingSearchQueries(locale: Locale, currentYear: number): string[] {
  if (locale === "ko") {
    return [
      `${currentYear}년 관상 트렌드 인기 이목구비`,
      `관상학 성공하는 얼굴 특징`,
      `재물운 좋은 관상 코 이마`,
      `대인관계 좋은 관상 특징`,
    ];
  } else {
    return [
      `face reading physiognomy trends ${currentYear}`,
      `facial features success personality`,
      `face shape fortune meaning`,
      `eye nose mouth personality traits`,
    ];
  }
}

// 상세 관상 분석 결과 스키마
const DetailedFaceReadingSchema = z.object({
  // 기본 정보
  overallScore: z.number().min(0).max(100).describe("종합 점수"),
  overallGrade: z.enum(["excellent", "good", "normal", "caution", "challenging"]),
  gradeText: z.string().describe("등급 텍스트"),
  summary: z.string().describe("관상 종합 요약 (3-4문장)"),

  // 삼정(三停) 분석
  samjeong: z.object({
    sangjeong: z.object({
      score: z.number().min(0).max(100),
      proportion: z.enum(["large", "medium", "small"]),
      characteristics: z.array(z.string()),
      fortune: z.string().describe("초년운 (0-30세)"),
      parentalLuck: z.string().describe("부모운"),
      intelligence: z.string().describe("지적 능력"),
    }).describe("상정 (이마 영역)"),
    jungjeong: z.object({
      score: z.number().min(0).max(100),
      proportion: z.enum(["large", "medium", "small"]),
      characteristics: z.array(z.string()),
      fortune: z.string().describe("중년운 (30-50세)"),
      socialLuck: z.string().describe("사회적 성공"),
      wealthLuck: z.string().describe("재물운"),
    }).describe("중정 (눈~코 영역)"),
    hajeong: z.object({
      score: z.number().min(0).max(100),
      proportion: z.enum(["large", "medium", "small"]),
      characteristics: z.array(z.string()),
      fortune: z.string().describe("말년운 (50세+)"),
      childrenLuck: z.string().describe("자녀운"),
      healthLuck: z.string().describe("건강운"),
    }).describe("하정 (입~턱 영역)"),
    balance: z.object({
      isBalanced: z.boolean(),
      description: z.string(),
      overallAssessment: z.string(),
    }).describe("삼정 균형"),
  }),

  // 오관(五官) 상세 분석
  detailedFeatures: z.object({
    ears: z.object({
      type: z.string().describe("귀 타입"),
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      size: z.enum(["large", "medium", "small"]),
      position: z.enum(["high", "medium", "low"]),
      earlobe: z.enum(["thick", "medium", "thin"]),
      characteristics: z.array(z.string()),
      fortune: z.string(),
      earlyLifeLuck: z.string().describe("0-15세 운"),
      wisdomLevel: z.string(),
      longevity: z.string(),
    }).describe("귀 - 채청관"),
    eyebrows: z.object({
      type: z.string().describe("눈썹 타입"),
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      length: z.enum(["long", "medium", "short"]),
      thickness: z.enum(["thick", "medium", "thin"]),
      shape: z.enum(["arched", "straight", "angled"]),
      characteristics: z.array(z.string()),
      fortune: z.string(),
      siblingLuck: z.string().describe("형제운"),
      emotionalControl: z.string(),
      friendshipLuck: z.string(),
    }).describe("눈썹 - 보수관"),
    eyes: z.object({
      type: z.string().describe("눈 타입"),
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      size: z.enum(["large", "medium", "small"]),
      brightness: z.enum(["bright", "normal", "dull"]),
      blackWhiteRatio: z.enum(["clear", "normal", "unclear"]),
      leftEye: z.string().describe("좌목 - 태양"),
      rightEye: z.string().describe("우목 - 태음"),
      characteristics: z.array(z.string()),
      fortune: z.string(),
      currentLuck: z.string().describe("35-40세 운"),
      personality: z.string(),
      intellect: z.string(),
      marriageLuck: z.string().describe("배우자운"),
    }).describe("눈 - 감찰관 (가장 중요)"),
    nose: z.object({
      type: z.string().describe("코 타입"),
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      bridge: z.enum(["high", "medium", "low"]),
      tip: z.enum(["round", "pointed", "upturned", "downturned"]),
      nostrils: z.enum(["visible", "hidden", "flared"]),
      characteristics: z.array(z.string()),
      fortune: z.string(),
      wealthStorage: z.string().describe("재물 저장능력"),
      middleAgeLuck: z.string().describe("41-50세 운"),
      prideLevel: z.string(),
      healthConnection: z.string(),
    }).describe("코 - 심판관"),
    mouth: z.object({
      type: z.string().describe("입 타입"),
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      size: z.enum(["large", "medium", "small"]),
      lipThickness: z.enum(["thick", "medium", "thin"]),
      corners: z.enum(["upturned", "straight", "downturned"]),
      characteristics: z.array(z.string()),
      fortune: z.string(),
      eloquence: z.string().describe("언변"),
      vitalityLuck: z.string().describe("생활력"),
      loveLuck: z.string().describe("애정운"),
      lateLifeLuck: z.string().describe("51-60세 운"),
    }).describe("입 - 출납관"),
  }),

  // 추가 부위 분석
  additionalFeatures: z.object({
    philtrum: z.object({
      length: z.enum(["long", "medium", "short"]),
      clarity: z.enum(["clear", "faint", "absent"]),
      shape: z.enum(["straight", "curved", "wide"]),
      score: z.number().min(0).max(100),
      description: z.string(),
      childrenFortune: z.string(),
      longevitySign: z.string(),
    }).describe("인중"),
    cheekbones: z.object({
      prominence: z.enum(["prominent", "moderate", "flat"]),
      position: z.enum(["high", "medium", "low"]),
      score: z.number().min(0).max(100),
      description: z.string(),
      powerLuck: z.string().describe("권력운"),
      socialStatus: z.string(),
    }).describe("광대뼈"),
    chin: z.object({
      shape: z.enum(["rounded", "square", "pointed", "receding", "prominent"]),
      size: z.enum(["large", "medium", "small"]),
      score: z.number().min(0).max(100),
      description: z.string(),
      lateLifeStability: z.string(),
      subordinateLuck: z.string().describe("부하운"),
    }).describe("턱"),
    nasolabialFolds: z.object({
      presence: z.enum(["deep", "moderate", "faint", "absent"]),
      length: z.enum(["long", "medium", "short"]),
      symmetry: z.enum(["symmetric", "asymmetric"]),
      score: z.number().min(0).max(100),
      description: z.string(),
      authorityLuck: z.string(),
      longevity: z.string(),
    }).describe("법령선"),
  }),

  // 오행 얼굴형
  fiveElementFace: z.object({
    primaryElement: z.enum(["wood", "fire", "earth", "metal", "water"]),
    koreanName: z.string(),
    chineseName: z.string(),
    score: z.number().min(0).max(100),
    characteristics: z.array(z.string()),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    compatibleElements: z.array(z.string()),
    careerSuggestions: z.array(z.string()),
    healthTendencies: z.array(z.string()),
  }),

  // 나이별 운세
  fortuneByAge: z.object({
    earlyLife: z.object({
      range: z.string(),
      mainFeature: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("0-15세"),
    youth: z.object({
      range: z.string(),
      mainFeature: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("16-30세"),
    earlyMiddle: z.object({
      range: z.string(),
      mainFeature: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("31-40세"),
    middleAge: z.object({
      range: z.string(),
      mainFeature: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("41-50세"),
    lateMiddle: z.object({
      range: z.string(),
      mainFeature: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("51-60세"),
    lateLife: z.object({
      range: z.string(),
      mainFeature: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("60세 이상"),
  }),

  // 종합 운세 분석
  comprehensiveFortune: z.object({
    wealthFortune: z.object({
      score: z.number().min(0).max(100),
      rank: z.string(),
      description: z.string(),
    }),
    careerFortune: z.object({
      score: z.number().min(0).max(100),
      rank: z.string(),
      description: z.string(),
    }),
    loveFortune: z.object({
      score: z.number().min(0).max(100),
      rank: z.string(),
      description: z.string(),
    }),
    healthFortune: z.object({
      score: z.number().min(0).max(100),
      rank: z.string(),
      description: z.string(),
    }),
    socialFortune: z.object({
      score: z.number().min(0).max(100),
      rank: z.string(),
      description: z.string(),
    }),
    familyFortune: z.object({
      score: z.number().min(0).max(100),
      rank: z.string(),
      description: z.string(),
    }),
  }),

  // 특별한 상
  specialFeatures: z.array(z.object({
    feature: z.string(),
    type: z.enum(["positive", "negative", "neutral"]),
    description: z.string(),
    meaning: z.string(),
  })).describe("특별한 상 2-4개"),

  // 관상 개선 조언
  improvementAdvice: z.object({
    expression: z.array(z.string()).describe("표정 관리"),
    makeup: z.array(z.string()).optional().describe("화장/스타일링"),
    grooming: z.array(z.string()).optional().describe("그루밍"),
    mindset: z.array(z.string()).describe("마음가짐"),
    lifestyle: z.array(z.string()).describe("생활습관"),
  }),

  // 한국 관상학 특수 해석
  koreanInterpretation: z.object({
    emphasis: z.string().describe("한국 관상학에서 강조하는 부분"),
    culturalContext: z.string(),
    modernApplication: z.string(),
  }),

  // 기본 정보 (기존 호환)
  faceShape: z.object({
    type: z.string(),
    koreanName: z.string(),
    description: z.string(),
    characteristics: z.array(z.string()),
  }),

  features: z.object({
    forehead: z.object({
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
      fortune: z.string(),
    }),
    eyes: z.object({
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
      fortune: z.string(),
    }),
    nose: z.object({
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
      fortune: z.string(),
    }),
    mouth: z.object({
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
      fortune: z.string(),
    }),
    ears: z.object({
      koreanName: z.string(),
      score: z.number().min(0).max(100),
      description: z.string(),
      fortune: z.string(),
    }),
  }),

  fortuneAreas: z.object({
    wealth: z.object({ score: z.number(), description: z.string() }),
    career: z.object({ score: z.number(), description: z.string() }),
    relationship: z.object({ score: z.number(), description: z.string() }),
    health: z.object({ score: z.number(), description: z.string() }),
    love: z.object({ score: z.number(), description: z.string() }),
  }),

  strengths: z.array(z.string()).describe("강점 5-7개"),
  advice: z.array(z.string()).describe("조언 5-7개"),
  luckyElements: z.array(z.string()).describe("행운의 요소 3-4개"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, gender, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    if (!imageBase64) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'imageRequired') },
        { status: 400 }
      );
    }

    // Google AI API 키 확인
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: getErrorMessage(locale, 'apiKeyMissing') },
        { status: 500 }
      );
    }

    const genderText = getGenderLabel(locale, gender === "female" ? "female" : "male");

    // 성별에 따라 grooming/makeup 필드 조정
    const isFemale = gender === "female";

    // GoogleGenAI 초기화
    const ai = new GoogleGenAI({ apiKey });

    // Google Search grounding을 위한 검색 쿼리 생성
    const currentYear = new Date().getFullYear();
    const searchQueries = generateFaceReadingSearchQueries(locale, currentYear);

    // 시스템 프롬프트와 사용자 프롬프트 생성
    const systemPrompt = getDetailedFaceReadingSystemPrompt(locale);
    const userPrompt = getDetailedFaceReadingUserPrompt(locale, genderText);

    // Google Search grounding을 포함한 프롬프트
    const groundingPrompt = locale === 'ko'
      ? `
인터넷에서 다음 주제들을 검색하여 현대적 관상학 트렌드를 반영해주세요:
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

위 검색 결과를 바탕으로, 전통 관상학 분석에 현대적 해석과 실용적 조언을 결합해주세요.

${userPrompt}

응답은 반드시 유효한 JSON 형식으로만 제공해주세요. 다른 텍스트 없이 JSON만 반환하세요.
`
      : `
Please search the internet for the following topics to incorporate modern physiognomy trends:
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Based on the search results above, combine traditional face reading analysis with modern interpretations and practical advice.

${userPrompt}

Please respond ONLY with valid JSON format. Return only the JSON without any other text.
`;

    // Base64에서 MIME 타입 추출
    let mimeType = "image/jpeg";
    let base64Data = imageBase64;
    if (imageBase64.startsWith("data:")) {
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // Gemini API 호출 (Google Search grounding + 이미지 분석)
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\n${groundingPrompt}` },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    // 응답 텍스트 추출
    let responseText = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    // JSON 파싱 (마크다운 코드 블록 제거)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    const parsedData = JSON.parse(cleanedResponse);

    // Zod 스키마로 검증
    const validatedData = DetailedFaceReadingSchema.parse(parsedData);

    // 성별에 따라 불필요한 필드 제거
    if (isFemale && validatedData.improvementAdvice) {
      delete validatedData.improvementAdvice.grooming;
    } else if (!isFemale && validatedData.improvementAdvice) {
      delete validatedData.improvementAdvice.makeup;
    }

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("Detailed face reading error:", error);

    // Try to get locale from request for error message
    let locale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      locale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("API_KEY")) {
        return NextResponse.json(
          { error: getErrorMessage(locale, 'apiKeyInvalid') },
          { status: 401 }
        );
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: getErrorMessage(locale, 'rateLimitExceeded') },
          { status: 429 }
        );
      }
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.issues);
        return NextResponse.json(
          { error: getErrorMessage(locale, 'faceReadingError') },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: getErrorMessage(locale, 'faceReadingError') },
      { status: 500 }
    );
  }
}
