/**
 * 시운(時運) API 엔드포인트
 * Hourly Fortune API
 *
 * 하루 12시진의 시운을 계산하고 분석 제공
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { getSajuResultById } from "@/lib/supabase/usage";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import {
  analyzeDailyHourlyFortunes,
  getCurrentHourFortuneSummary,
  getRecommendedHoursForActivity,
  parseStringToDate,
} from "@/lib/saju/fortune";
import type { Element } from "@/lib/saju/types";

// 시운 AI 해석 스키마
const HourlyFortuneInterpretationSchema = z.object({
  currentHourAdvice: z.string().describe("현재 시간대 조언 (2-3문장)"),
  bestHoursExplanation: z.string().describe("좋은 시간대 설명 (1-2문장)"),
  cautionHoursExplanation: z.string().describe("주의할 시간대 설명 (1-2문장)"),
  todayOverview: z.string().describe("오늘 하루 시간 흐름 요약 (2-3문장)"),
});

/**
 * GET: 시운 조회
 *
 * Query params:
 * - shareId: 사주 분석 결과 ID (필수)
 * - date: 조회할 날짜 YYYY-MM-DD (선택, 기본값: 오늘)
 * - activity: 활동 유형 (선택) - meeting, negotiation, decision, creative, rest
 * - interpret: AI 해석 여부 (선택, 기본값: true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const dateStr = searchParams.get("date");
    const activity = searchParams.get("activity") as
      | "meeting"
      | "negotiation"
      | "decision"
      | "creative"
      | "rest"
      | null;
    const interpretStr = searchParams.get("interpret");

    // 필수 파라미터 검증
    if (!shareId) {
      return NextResponse.json(
        { success: false, error: "shareId가 필요합니다." },
        { status: 400 }
      );
    }

    // 사주 결과 조회
    const sajuResult = await getSajuResultById(shareId);
    if (!sajuResult.success || !sajuResult.result) {
      return NextResponse.json(
        { success: false, error: "사주 분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const result = sajuResult.result;
    const saju = result.resultData || result;

    // 원국 지지 추출
    const natalBranches = {
      year:
        saju?.pillars?.year?.branch ||
        saju?.pillars?.year?.zhi ||
        saju?.step1?.pillars?.year?.branch ||
        "子",
      month:
        saju?.pillars?.month?.branch ||
        saju?.pillars?.month?.zhi ||
        saju?.step1?.pillars?.month?.branch ||
        "丑",
      day:
        saju?.pillars?.day?.branch ||
        saju?.pillars?.day?.zhi ||
        saju?.step1?.pillars?.day?.branch ||
        "寅",
      time:
        saju?.pillars?.time?.branch ||
        saju?.pillars?.time?.zhi ||
        saju?.step1?.pillars?.time?.branch ||
        "卯",
    };

    // 용신 추출
    const usefulGodElement: Element =
      (saju?.usefulGod?.primaryElement as Element) ||
      (saju?.step2?.usefulGod?.primaryElement as Element) ||
      "water";

    // 날짜 설정
    const targetDate = dateStr ? parseStringToDate(dateStr) : new Date();
    const shouldInterpret = interpretStr !== "false";

    // 12시진 전체 분석
    const hourlyFortunes = analyzeDailyHourlyFortunes(
      targetDate,
      natalBranches,
      usefulGodElement
    );

    // 현재 시간 요약
    const currentHourSummary = getCurrentHourFortuneSummary(
      natalBranches,
      usefulGodElement
    );

    // 활동별 추천 시간대 (옵션)
    let activityRecommendation = null;
    if (activity) {
      activityRecommendation = getRecommendedHoursForActivity(
        targetDate,
        natalBranches,
        usefulGodElement,
        activity
      );
    }

    // AI 해석 추가
    let interpretation = null;
    if (shouldInterpret && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        interpretation = await generateHourlyInterpretation(
          hourlyFortunes,
          currentHourSummary
        );
      } catch (e) {
        console.error("AI interpretation error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        date: hourlyFortunes.date,
        dailyPillar: {
          stem: hourlyFortunes.dailyPillar.stem,
          branch: hourlyFortunes.dailyPillar.branch,
          stemKorean: hourlyFortunes.dailyPillar.stemKorean,
          branchKorean: hourlyFortunes.dailyPillar.branchKorean,
          element: hourlyFortunes.dailyPillar.element,
          elementKorean: hourlyFortunes.dailyPillar.elementKorean,
        },
        currentHour: {
          time: currentHourSummary.currentTime,
          periodName: currentHourSummary.periodName,
          timeRange: currentHourSummary.timeRange,
          pillarKorean: currentHourSummary.pillarKorean,
          score: currentHourSummary.score,
          grade: currentHourSummary.grade,
          highlights: currentHourSummary.highlights,
          nextBestHour: currentHourSummary.nextBestHour,
          advice: interpretation?.currentHourAdvice || null,
        },
        hourlyFortunes: hourlyFortunes.hourlyFortunes.map((h) => ({
          timeRange: h.timeRange,
          periodName: h.periodName,
          pillar: {
            stem: h.pillar.stem,
            branch: h.pillar.branch,
            stemKorean: h.pillar.stemKorean,
            branchKorean: h.pillar.branchKorean,
          },
          pillarKorean: `${h.pillar.stemKorean}${h.pillar.branchKorean}`,
          element: h.pillar.element,
          elementKorean: h.pillar.elementKorean,
          score: h.score,
          grade: h.grade,
          gradeKorean: h.gradeKorean,
          description: getHourlyDescription(h),
          goodFor: getGoodForActivities(h),
          avoidFor: getAvoidForActivities(h),
          usefulGodRelation: h.usefulGodRelation,
          hasHarmony: h.hasHarmony,
          hasClash: h.hasClash,
        })),
        bestHours: hourlyFortunes.bestHours,
        bestPeriodNames: hourlyFortunes.bestPeriodNames,
        cautionHours: hourlyFortunes.cautionHours,
        cautionPeriodNames: hourlyFortunes.cautionPeriodNames,
        activityRecommendation,
        interpretation: interpretation
          ? {
              todayOverview: interpretation.todayOverview,
              bestHoursExplanation: interpretation.bestHoursExplanation,
              cautionHoursExplanation: interpretation.cautionHoursExplanation,
            }
          : null,
      },
    });
  } catch (error: unknown) {
    console.error("[Hourly Fortune API] Error:", error);
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
 * POST: 시운 조회 (body로 파라미터 전달)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, date, activity, interpret = true } = body;

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: "shareId가 필요합니다." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    url.searchParams.set("shareId", shareId);
    if (date) url.searchParams.set("date", date);
    if (activity) url.searchParams.set("activity", activity);
    url.searchParams.set("interpret", String(interpret));

    const newRequest = new NextRequest(url.toString(), { method: "GET" });
    return GET(newRequest);
  } catch (error: unknown) {
    console.error("[Hourly Fortune API] POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 시간대별 설명 생성
 */
function getHourlyDescription(h: {
  periodName: string;
  score: number;
  grade: string;
  gradeKorean: string;
  hasHarmony: boolean;
  hasClash: boolean;
  usefulGodRelation: string;
  pillar: { elementKorean: string };
}): string {
  const parts: string[] = [];

  if (h.hasHarmony) {
    parts.push("원국과 조화로운 기운");
  }
  if (h.hasClash) {
    parts.push("충돌 기운 주의");
  }
  if (h.usefulGodRelation === "support") {
    parts.push("용신을 돕는 시간");
  } else if (h.usefulGodRelation === "against") {
    parts.push("용신에 불리한 시간");
  }

  if (parts.length === 0) {
    parts.push(`${h.pillar.elementKorean} 기운이 흐르는 시간`);
  }

  return parts.join(". ") + ".";
}

/**
 * 좋은 활동 목록 생성
 */
function getGoodForActivities(h: {
  grade: string;
  hasHarmony: boolean;
  usefulGodRelation: string;
  pillar: { element: string };
}): string[] {
  const activities: string[] = [];

  if (h.grade === "excellent" || h.grade === "good") {
    activities.push("중요한 의사결정");
    activities.push("새로운 시작");
  }

  if (h.hasHarmony) {
    activities.push("대인관계");
    activities.push("협상/계약");
  }

  if (h.usefulGodRelation === "support") {
    activities.push("핵심 업무");
  }

  // 오행별 추천 활동
  switch (h.pillar.element) {
    case "wood":
      activities.push("창의적 작업");
      break;
    case "fire":
      activities.push("발표/프레젠테이션");
      break;
    case "earth":
      activities.push("안정적 업무");
      break;
    case "metal":
      activities.push("분석/정리");
      break;
    case "water":
      activities.push("학습/연구");
      break;
  }

  return activities.slice(0, 3);
}

/**
 * 피해야 할 활동 목록 생성
 */
function getAvoidForActivities(h: {
  grade: string;
  hasClash: boolean;
  usefulGodRelation: string;
}): string[] {
  const activities: string[] = [];

  if (h.hasClash) {
    activities.push("중요한 결정");
    activities.push("갈등 상황");
  }

  if (h.grade === "caution") {
    activities.push("새로운 계약");
    activities.push("위험한 투자");
  }

  if (h.usefulGodRelation === "against") {
    activities.push("과도한 업무");
  }

  return activities.slice(0, 2);
}

/**
 * AI를 사용한 시운 해석 생성
 */
async function generateHourlyInterpretation(
  hourlyFortunes: ReturnType<typeof analyzeDailyHourlyFortunes>,
  currentHourSummary: ReturnType<typeof getCurrentHourFortuneSummary>
): Promise<z.infer<typeof HourlyFortuneInterpretationSchema>> {
  const prompt = `## 오늘의 시운 분석

**현재 시간**: ${currentHourSummary.currentTime} (${currentHourSummary.periodName})
**현재 시주**: ${currentHourSummary.pillarKorean}
**점수**: ${currentHourSummary.score}점 (${currentHourSummary.grade})
**특징**: ${currentHourSummary.highlights.join(", ") || "특별한 특징 없음"}

**좋은 시간대**: ${hourlyFortunes.bestPeriodNames.join(", ") || "없음"}
**주의할 시간대**: ${hourlyFortunes.cautionPeriodNames.join(", ") || "없음"}

**12시진 요약**:
${hourlyFortunes.hourlyFortunes
  .map(
    (h) =>
      `- ${h.periodName}(${h.timeRange}): ${h.gradeKorean} ${h.hasHarmony ? "[합]" : ""} ${h.hasClash ? "[충]" : ""}`
  )
  .join("\n")}

위 정보를 바탕으로 시운 해석을 제공해주세요.`;

  const result = await generateObject({
    model: google(GEMINI_MODEL),
    schema: HourlyFortuneInterpretationSchema,
    messages: [
      {
        role: "system",
        content: `당신은 전문 명리학자입니다. 시운(時運)을 분석하여 실용적인 시간 활용 조언을 제공합니다.
- 현재 시간대에 맞는 구체적인 조언을 제공하세요.
- 좋은 시간대와 주의할 시간대의 특징을 설명하세요.
- 하루의 시간 흐름에 따른 에너지 변화를 설명하세요.
- 한국어로 응답하세요.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return result.object;
}
