/**
 * 해몽 API 엔드포인트
 * Dream Interpretation API
 *
 * 사용자의 꿈 내용을 분석하여 전통 동양 해몽 기반 해석 제공
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/supabase/usage";
import { GEMINI_MODEL } from "@/lib/constants/ai";

/**
 * 해몽 결과 타입
 */
interface DreamSymbol {
  symbol: string;
  meaning: string;
  fortune: "good" | "neutral" | "caution";
}

interface DreamInterpretation {
  symbols: DreamSymbol[];
  overallFortune: "good" | "neutral" | "caution";
  interpretation: string;
  advice: string;
  luckyNumbers: number[];
  relatedElements: string[];
}

/**
 * POST: 꿈 해석 요청
 *
 * Body:
 * - dreamContent: 꿈 내용 (필수, 10자 이상)
 *
 * 무료: 1일 1회 / 프리미엄: 무제한
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dreamContent } = body;

    // 필수 파라미터 검증
    if (!dreamContent || typeof dreamContent !== "string") {
      return NextResponse.json(
        { success: false, error: "꿈 내용이 필요합니다." },
        { status: 400 }
      );
    }

    if (dreamContent.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "꿈 내용을 10자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "로그인이 필요합니다.",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    // 구독 상태 확인
    const subscription = await getUserSubscription(user.id);

    // 무료 사용자: 일일 사용량 체크
    if (!subscription.isPremium) {
      const today = new Date().toISOString().split("T")[0];

      // 오늘 해몽 사용 기록 조회
      const { data: usageData } = await supabase
        .from("dream_interpretations")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`);

      if (usageData && usageData.length >= 1) {
        return NextResponse.json(
          {
            success: false,
            error: "무료 사용자는 하루 1회만 해몽을 이용할 수 있습니다.",
            code: "FREE_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    // Gemini API로 해몽 분석
    const interpretation = await interpretDream(dreamContent);

    // 해몽 기록 저장
    await supabase.from("dream_interpretations").insert({
      user_id: user.id,
      dream_content: dreamContent,
      interpretation_data: interpretation,
    });

    return NextResponse.json({
      success: true,
      data: interpretation,
    });
  } catch (error: unknown) {
    console.error("[Dream Interpret API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류",
      },
      { status: 500 }
    );
  }
}

/**
 * Gemini를 사용한 꿈 해석
 */
async function interpretDream(dreamContent: string): Promise<DreamInterpretation> {
  const { GoogleGenAI } = await import("@google/genai");

  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
  });

  const systemPrompt = `당신은 동양 전통 해몽에 정통한 해몽 전문가입니다.
사용자의 꿈을 분석하여 JSON 형식으로 다음을 제공하세요:

1. symbols: 꿈에 나타난 주요 상징들 배열
   - symbol: 상징 이름 (예: "용", "물", "산")
   - meaning: 그 상징의 의미 (30자 이내)
   - fortune: 길흉 판단 ("good" | "neutral" | "caution")

2. overallFortune: 전체적인 길흉 ("good" | "neutral" | "caution")

3. interpretation: 상세한 해몽 해석 (200-300자)
   - 전통 동양 해몽학의 관점에서 해석
   - 현대적이고 긍정적인 관점 포함

4. advice: 현실에서의 조언 (100자 이내)

5. luckyNumbers: 관련된 행운의 숫자 6개 (1-45 범위)

6. relatedElements: 관련된 오행 요소들 (["목", "화", "토", "금", "수"] 중 선택)

응답 형식:
{
  "symbols": [{"symbol": "...", "meaning": "...", "fortune": "good|neutral|caution"}],
  "overallFortune": "good|neutral|caution",
  "interpretation": "...",
  "advice": "...",
  "luckyNumbers": [1, 2, 3, 4, 5, 6],
  "relatedElements": ["목", "화"]
}`;

  const userPrompt = `다음 꿈을 해석해주세요:

"${dreamContent}"`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
    },
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      },
    ],
  });

  // 응답 파싱
  const responseText = response.text || "";
  let parsedResult: DreamInterpretation;

  try {
    parsedResult = JSON.parse(responseText);
  } catch {
    // JSON 파싱 실패 시 정규식으로 추출 시도
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedResult = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("AI 응답을 파싱할 수 없습니다.");
    }
  }

  // 응답 검증 및 기본값 처리
  return {
    symbols: Array.isArray(parsedResult.symbols) ? parsedResult.symbols : [],
    overallFortune: parsedResult.overallFortune || "neutral",
    interpretation: parsedResult.interpretation || "해석을 생성할 수 없습니다.",
    advice: parsedResult.advice || "긍정적인 마음가짐을 유지하세요.",
    luckyNumbers: Array.isArray(parsedResult.luckyNumbers)
      ? parsedResult.luckyNumbers.slice(0, 6)
      : [7, 14, 21, 28, 35, 42],
    relatedElements: Array.isArray(parsedResult.relatedElements)
      ? parsedResult.relatedElements
      : ["목"],
  };
}
