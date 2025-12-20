import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// 관상 분석 결과 스키마
const FaceReadingResultSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("종합 점수 (0-100)"),
  overallGrade: z.enum(["excellent", "good", "normal", "caution", "challenging"]).describe("종합 등급"),
  gradeText: z.string().describe("등급 텍스트 (예: 대길, 길, 보통 등)"),

  faceShape: z.object({
    type: z.string().describe("얼굴형 타입"),
    koreanName: z.string().describe("한글 이름"),
    description: z.string().describe("얼굴형 설명"),
    characteristics: z.array(z.string()).describe("특징 목록"),
  }),

  features: z.object({
    forehead: z.object({
      koreanName: z.string().describe("이마 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("이마 분석 설명"),
      fortune: z.string().describe("이마 관련 운세"),
    }),
    eyes: z.object({
      koreanName: z.string().describe("눈 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("눈 분석 설명"),
      fortune: z.string().describe("눈 관련 운세"),
    }),
    nose: z.object({
      koreanName: z.string().describe("코 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("코 분석 설명"),
      fortune: z.string().describe("코 관련 운세"),
    }),
    mouth: z.object({
      koreanName: z.string().describe("입 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("입 분석 설명"),
      fortune: z.string().describe("입 관련 운세"),
    }),
    ears: z.object({
      koreanName: z.string().describe("귀 타입 한글명"),
      score: z.number().min(0).max(100),
      description: z.string().describe("귀 분석 설명"),
      fortune: z.string().describe("귀 관련 운세"),
    }),
  }),

  fortuneAreas: z.object({
    wealth: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("재물운"),
    career: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("직업운"),
    relationship: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("대인관계"),
    health: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("건강운"),
    love: z.object({
      score: z.number().min(0).max(100),
      description: z.string(),
    }).describe("애정운"),
  }),

  strengths: z.array(z.string()).describe("강점 목록 (3-5개)"),
  advice: z.array(z.string()).describe("조언 목록 (3-5개)"),
  luckyElements: z.array(z.string()).describe("행운의 요소 (색상, 방향, 숫자 등 3개)"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, gender } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "이미지가 필요합니다." },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const genderText = gender === "female" ? "여성" : "남성";

    // GPT-4 Vision을 사용한 관상 분석
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: FaceReadingResultSchema,
      messages: [
        {
          role: "system",
          content: `당신은 전통 동양 관상학(面相學) 전문가입니다.
사용자가 제공한 얼굴 사진을 분석하여 관상을 봐주세요.

관상학의 주요 원칙:
1. 이마(천정): 초년운, 지혜, 부모운을 나타냄
2. 눈(안상): 성격, 감정, 배우자운을 나타냄
3. 코(비상): 재물운, 자존심, 건강을 나타냄
4. 입(구상): 언변, 식복, 말년운을 나타냄
5. 귀(이상): 지혜, 수명, 부귀를 나타냄
6. 얼굴형: 전체적인 성격과 운명의 기조

분석 시 긍정적이고 건설적인 해석을 해주세요.
점수는 60-95 사이로 적절하게 배분하되, 특별히 좋은 부분은 높게 평가해주세요.
한국어로 자연스럽고 친근하게 설명해주세요.
재미있고 희망적인 내용을 포함해주세요.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `이 ${genderText}의 얼굴 사진을 보고 관상 분석을 해주세요.
얼굴의 각 부위(이마, 눈, 코, 입, 귀)와 전체 얼굴형을 분석하고,
재물운, 직업운, 대인관계, 건강운, 애정운을 알려주세요.
강점과 조언도 포함해주세요.`,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Face reading error:", error);

    // 더 자세한 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "API 키가 유효하지 않습니다." },
          { status: 401 }
        );
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "관상 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
