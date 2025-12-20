/**
 * 사주 분석 스트리밍 API
 * Server-Sent Events를 통해 단계별 분석 결과를 실시간 전달
 */

import { NextRequest } from "next/server";
import { runSajuPipelineGenerator, PIPELINE_STEPS } from "@/lib/saju/pipeline-orchestrator";
import type { SajuAnalysisInput } from "@/lib/saju/pipeline-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, gender, isLunar, name } = body;

    // 입력 검증
    if (!birthDate || !birthTime || !gender) {
      return new Response(
        JSON.stringify({ error: "생년월일, 시간, 성별은 필수입니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // API 키 확인
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API 키가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const input: SajuAnalysisInput = {
      birthDate,
      birthTime,
      gender,
      isLunar: isLunar || false,
      name,
    };

    // SSE 스트림 생성
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 시작 이벤트 전송
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "pipeline_start",
                totalSteps: PIPELINE_STEPS.length,
                steps: PIPELINE_STEPS,
              })}\n\n`
            )
          );

          // 파이프라인 실행
          const pipeline = runSajuPipelineGenerator(input);

          for await (const event of pipeline) {
            // 각 이벤트를 SSE 형식으로 전송
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          }

          // 완료 이벤트
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "stream_end" })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          // 에러 이벤트 전송
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Saju stream error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "스트리밍 분석 중 오류가 발생했습니다.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
