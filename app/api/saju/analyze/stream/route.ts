/**
 * 사주 분석 스트리밍 API
 * Server-Sent Events를 통해 단계별 분석 결과를 실시간 전달
 * Supports localized responses based on locale parameter
 */

import { NextRequest } from "next/server";
import { runSajuPipelineGenerator, PIPELINE_STEPS } from "@/lib/saju/pipeline-orchestrator";
import type { SajuAnalysisInput } from "@/lib/saju/pipeline-types";
import { getErrorMessage, getLocaleFromRequest } from "@/lib/i18n/prompts";
import type { Locale } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Localized pipeline step names
const LOCALIZED_STEPS: Record<Locale, Array<{
  step: number;
  name: string;
  description: string;
  icon: string;
}>> = {
  ko: [
    { step: 1, name: "기초 구조 분석", description: "사주 원국을 분석하고 있습니다...", icon: "" },
    { step: 2, name: "일간 심층 분석", description: "일간의 특성을 파악하고 있습니다...", icon: "" },
    { step: 3, name: "십성 분석", description: "십성의 조화를 분석하고 있습니다...", icon: "" },
    { step: 4, name: "신살 분석", description: "신살을 해석하고 있습니다...", icon: "" },
    { step: 5, name: "대운/세운 분석", description: "올해 운세를 살펴보고 있습니다...", icon: "" },
    { step: 6, name: "종합 분석", description: "종합 분석을 완성하고 있습니다...", icon: "" },
  ],
  en: [
    { step: 1, name: "Foundation Analysis", description: "Analyzing your birth chart structure...", icon: "" },
    { step: 2, name: "Day Master Analysis", description: "Examining your Day Master characteristics...", icon: "" },
    { step: 3, name: "Ten Gods Analysis", description: "Analyzing the Ten Gods harmony...", icon: "" },
    { step: 4, name: "Symbolic Stars Analysis", description: "Interpreting the symbolic stars...", icon: "" },
    { step: 5, name: "Fortune Timing Analysis", description: "Examining this year's fortune...", icon: "" },
    { step: 6, name: "Comprehensive Analysis", description: "Completing the comprehensive analysis...", icon: "" },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, gender, isLunar, name, locale: requestLocale } = body;

    // Determine locale from request body or headers
    const locale: Locale = requestLocale === 'en' ? 'en' :
                           requestLocale === 'ko' ? 'ko' :
                           getLocaleFromRequest(request) as Locale;

    const localizedSteps = LOCALIZED_STEPS[locale];

    // 입력 검증
    if (!birthDate || !birthTime || !gender) {
      return new Response(
        JSON.stringify({ error: getErrorMessage(locale, 'missingBirthInfo') }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // API 키 확인
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: getErrorMessage(locale, 'apiKeyMissing') }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const input: SajuAnalysisInput = {
      birthDate,
      birthTime,
      gender,
      isLunar: isLunar || false,
      name,
      locale, // Pass locale to pipeline for future localization
    };

    // SSE 스트림 생성
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 시작 이벤트 전송 with localized step names
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "pipeline_start",
                totalSteps: localizedSteps.length,
                steps: localizedSteps,
              })}\n\n`
            )
          );

          // 파이프라인 실행
          const pipeline = runSajuPipelineGenerator(input);

          for await (const event of pipeline) {
            // Localize step names in events
            const stepIndex = event.step - 1;
            const localizedEvent = {
              ...event,
              stepName: localizedSteps[stepIndex]?.name || event.stepName,
              progress: {
                ...event.progress,
                stepName: localizedSteps[event.progress.currentStep - 1]?.name || event.progress.stepName,
                stepDescription: localizedSteps[event.progress.currentStep - 1]?.description || event.progress.stepDescription,
              },
            };

            // Handle pipeline_complete separately
            if (event.type === 'pipeline_complete') {
              localizedEvent.stepName = locale === 'en' ? 'Analysis Complete' : '분석 완료';
            }

            // 각 이벤트를 SSE 형식으로 전송
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(localizedEvent)}\n\n`)
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

    // Try to get locale from request for error message
    let locale: Locale = 'ko';
    try {
      const body = await request.clone().json();
      locale = body.locale === 'en' ? 'en' : 'ko';
    } catch {
      // Default to Korean if we can't parse the body
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : getErrorMessage(locale, 'streamingError'),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
