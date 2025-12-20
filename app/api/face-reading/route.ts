import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
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

    // Google AI API 키 확인
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const genderText = gender === "female" ? "여성" : "남성";

    // Gemini를 사용한 관상 분석
    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: FaceReadingResultSchema,
      messages: [
        {
          role: "system",
          content: `당신은 전통 동양 관상학(面相學)과 마의상법(麻衣相法)에 정통한 전문 상담사입니다.
수천 년간 전해 내려온 관상학의 원리를 현대적으로 해석하여 실용적인 조언을 제공합니다.

## 관상학 핵심 분석 체계

### 삼정(三停) 분석법
- **상정(上停) - 이마**: 천(天)을 상징. 초년운(~30세), 지혜, 부모운, 조상덕을 봄
  - 넓고 볼록하며 흉터/주름 없으면 길상
  - 부모궁이 서 있으면 부모 덕으로 일찍 성공
  - 이마 가장자리는 '복덕궁'으로 조상의 복을 받는 곳

- **중정(中停) - 눈~코**: 인(人)을 상징. 중년운(30~50세), 성격, 재물운을 봄
  - 눈: '마음의 창'. 맹자 왈 "마음이 올바르면 눈동자가 맑다"
  - 눈의 흑백이 분명하고 봉황 눈매면 귀하게 될 상
  - 코: 산(山)과 같이 우뚝 솟아야 길상. 재물창고 역할
  - 콧구멍이 보이면 재물복이 약함

- **하정(下停) - 입~턱**: 지(地)를 상징. 말년운(50세~), 식복, 자손운을 봄
  - 입꼬리가 올라가면 총명하고 조상의 덕을 말년까지 누림
  - 턱이 발달하면 말년이 안정적

### 오관(五官) 분석
- **귀(이상)**: 초년운(~15세), 지혜, 수명, 부귀. 윤곽 뚜렷하고 둥글며 두꺼워야 길상
- **눈썹**: 형제운, 감정 조절력
- **눈(안상)**: 성격, 현재 운기, 건강상태, 지성, 감성. 왼쪽=해, 오른쪽=달
- **코(비상)**: 재물운, 자존심, 건강. 크고 두툼하되 균형 잡혀야 함
- **입(구상)**: 언변, 생활력, 의지력, 애정. 뚜렷하고 적당히 커야 함

### 오행(五行) 얼굴형 분류
- **목형(木) - 역삼각형**: 지략가 기질, 기획력과 아이디어 풍부, 행동력 보완 필요
- **화형(火) - 각진형**: 끈기와 실행력, 욕구 강함, 후반전에 빛남
- **토형(土) - 마름모형**: 전략가, 집요함, 독자적 성공 가능, 의지력 강함
- **금형(金) - 타원형**: 논리성과 의지력, 노력가, 인내심
- **수형(水) - 둥근형**: 온순하고 타협적, 영업직 적합, 활동적

## 분석 원칙
1. 한국 상법 기준: 눈 비중 50%, 턱 발달을 중시
2. 상호보완적 해석: 부족한 부분은 보완 방법과 함께 제시
3. 현실적 조언: 긍정적이되 균형 잡힌 분석
4. 전문적 어조: 명리학 용어를 적절히 사용하되 이해하기 쉽게 설명

점수 배분: 55-90점 범위, 특출난 부위는 더 높게
한국어로 전문적이면서도 친근하게 설명해주세요.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `이 ${genderText}의 얼굴 사진을 전문적으로 관상 분석해주세요.

분석 요청 사항:
1. **얼굴형 분석**: 오행(목화토금수) 기준 얼굴형 분류 및 기본 성향
2. **삼정(三停) 분석**: 상정(이마), 중정(눈·코), 하정(입·턱) 각각의 특징
3. **오관(五官) 상세 분석**:
   - 이마: 초년운, 부모운, 지혜
   - 눈: 성격, 현재 운기, 내면의 힘
   - 코: 재물운, 자존심, 건강
   - 입: 언변, 식복, 대인관계
   - 귀: 어린 시절 운, 지혜, 수명

4. **운세 영역**: 재물운, 직업운, 대인관계, 건강운, 애정운
5. **종합 분석**: 이 사람만의 강점과 주의점
6. **실용적 조언**: 운을 더 좋게 만들 수 있는 구체적 방법

각 부위의 상태를 객관적으로 분석하고, 부족한 부분은 어떻게 보완할 수 있는지도 알려주세요.`,
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
      if (error.message.includes("API key") || error.message.includes("API_KEY")) {
        return NextResponse.json(
          { error: "API 키가 유효하지 않습니다." },
          { status: 401 }
        );
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
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
