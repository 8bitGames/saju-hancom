/**
 * 사주 분석 전체 API
 * 모든 단계를 한 번에 실행하고 완전한 결과 반환
 */

import { NextRequest, NextResponse } from "next/server";
import { runSajuPipeline } from "@/lib/saju/pipeline-orchestrator";
import type { SajuAnalysisInput } from "@/lib/saju/pipeline-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, gender, isLunar, name } = body;

    // 입력 검증
    if (!birthDate || !birthTime || !gender) {
      return NextResponse.json(
        { error: "생년월일, 시간, 성별은 필수입니다." },
        { status: 400 }
      );
    }

    // API 키 확인
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const input: SajuAnalysisInput = {
      birthDate,
      birthTime,
      gender,
      isLunar: isLunar || false,
      name,
    };

    // 파이프라인 실행
    const result = await runSajuPipeline(input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Saju full analysis error:", error);

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
      { error: "사주 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
