/**
 * 일운(日運) API 엔드포인트
 * Daily Fortune API
 *
 * 특정 날짜의 일운을 계산하고 AI로 해석 제공
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { getSajuResultById, getDailyFortune, saveDailyFortune, getUserSubscription } from "@/lib/supabase/usage";
import { createClient } from "@/lib/supabase/server";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import {
  analyzeDailyFortune,
  calculateDailyPillarsRange,
  getTodayFortuneSummary,
  parseStringToDate,
} from "@/lib/saju/fortune";
import type { Element } from "@/lib/saju/types";
import { geminiInterpretationCache } from "@/lib/utils/lru-cache";

// 일운 AI 해석 스키마
const DailyFortuneInterpretationSchema = z.object({
  theme: z.string().describe("오늘의 테마 (2-3단어)"),
  description: z.string().describe("상세 설명 (3-4문장)"),
  opportunities: z.array(z.string()).describe("좋은 기회 2-3개"),
  challenges: z.array(z.string()).describe("주의할 점 2-3개"),
  advice: z.string().describe("오늘의 조언 (1-2문장)"),
  recommendedActivities: z.array(z.string()).describe("추천 활동 3-4개"),
  activitiesToAvoid: z.array(z.string()).describe("피해야 할 활동 2-3개"),
});

/**
 * GET: 일운 조회
 *
 * Query params:
 * - shareId: 사주 분석 결과 ID (필수)
 * - date: 조회할 날짜 YYYY-MM-DD (선택, 기본값: 오늘)
 * - days: 조회할 일수 (선택, 기본값: 1, 최대: 7)
 * - interpret: AI 해석 여부 (선택, 기본값: true)
 *
 * 프리미엄 구독자만 접근 가능
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query params early for validation before DB calls
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const dateStr = searchParams.get("date");
    const daysStr = searchParams.get("days");
    const interpretStr = searchParams.get("interpret");

    // 필수 파라미터 검증 (before any DB calls)
    if (!shareId) {
      return NextResponse.json(
        { success: false, error: "shareId가 필요합니다." },
        { status: 400 }
      );
    }

    // 인증 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "로그인이 필요합니다.",
          code: "AUTH_REQUIRED"
        },
        { status: 401 }
      );
    }

    // 프리미엄 구독과 사주 결과를 병렬로 조회
    const [subscription, sajuResult] = await Promise.all([
      getUserSubscription(user.id),
      getSajuResultById(shareId),
    ]);

    if (!subscription.isPremium) {
      return NextResponse.json(
        {
          success: false,
          error: "프리미엄 구독이 필요합니다.",
          code: "PREMIUM_REQUIRED"
        },
        { status: 403 }
      );
    }

    if (!sajuResult.success || !sajuResult.result) {
      return NextResponse.json(
        { success: false, error: "사주 분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const result = sajuResult.result;
    // resultData 내부에 실제 사주 분석 결과가 있음
    const saju = result.resultData || result;

    // 원국 지지 추출
    const natalBranches = {
      year: saju?.pillars?.year?.branch || saju?.pillars?.year?.zhi || saju?.step1?.pillars?.year?.branch || "子",
      month: saju?.pillars?.month?.branch || saju?.pillars?.month?.zhi || saju?.step1?.pillars?.month?.branch || "丑",
      day: saju?.pillars?.day?.branch || saju?.pillars?.day?.zhi || saju?.step1?.pillars?.day?.branch || "寅",
      time: saju?.pillars?.time?.branch || saju?.pillars?.time?.zhi || saju?.step1?.pillars?.time?.branch || "卯",
    };

    // 용신 추출 (기본값: water)
    const usefulGodElement: Element =
      (saju?.usefulGod?.primaryElement as Element) ||
      (saju?.step2?.usefulGod?.primaryElement as Element) ||
      "water";

    // 날짜 설정
    const targetDate = dateStr ? parseStringToDate(dateStr) : new Date();
    const days = Math.min(Math.max(parseInt(daysStr || "1", 10), 1), 7);
    const shouldInterpret = interpretStr !== "false";

    // 날짜 문자열 (YYYY-MM-DD) 생성
    const dateForCache = targetDate.toISOString().split('T')[0];

    // 일운 계산
    if (days === 1) {
      // 캐시된 운세 확인 (로그인한 사용자만)
      if (user) {
        const cachedFortune = await getDailyFortune(user.id, shareId, dateForCache);
        if (cachedFortune.success && cachedFortune.data) {
          console.log('[Daily Fortune] Cache hit for', dateForCache);
          return NextResponse.json({
            success: true,
            data: cachedFortune.data,
            cached: true,
          }, {
            headers: {
              'Cache-Control': 'private, max-age=3600', // 1 hour cache
            },
          });
        }
      }

      // 단일 날짜
      const dailyResult = analyzeDailyFortune(
        targetDate,
        natalBranches,
        usefulGodElement
      );

      // AI 해석 추가
      let interpretation = null;
      if (shouldInterpret && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
          interpretation = await generateDailyInterpretation(
            dailyResult,
            saju,
            usefulGodElement
          );
        } catch (e) {
          console.error("AI interpretation error:", e);
        }
      }

      const responseData = {
        ...dailyResult,
        analysis: interpretation
          ? {
              score: dailyResult.baseAnalysis.score,
              grade: dailyResult.baseAnalysis.grade,
              theme: interpretation.theme,
              description: interpretation.description,
              opportunities: interpretation.opportunities,
              challenges: interpretation.challenges,
              advice: interpretation.advice,
            }
          : {
              score: dailyResult.baseAnalysis.score,
              grade: dailyResult.baseAnalysis.grade,
              theme: getDefaultTheme(dailyResult.baseAnalysis.grade),
              description: dailyResult.baseAnalysis.usefulGodReason,
              opportunities: [],
              challenges: [],
              advice: "",
            },
        recommendedActivities: interpretation?.recommendedActivities || [],
        activitiesToAvoid: interpretation?.activitiesToAvoid || [],
      };

      // 로그인한 사용자의 경우 캐시에 저장
      if (user && interpretation) {
        saveDailyFortune(user.id, shareId, dateForCache, responseData)
          .then((result) => {
            if (result.success) {
              console.log('[Daily Fortune] Saved to cache for', dateForCache);
            }
          })
          .catch(console.error);
      }

      return NextResponse.json({
        success: true,
        data: responseData,
        cached: false,
      }, {
        headers: {
          'Cache-Control': 'private, max-age=1800', // 30 min cache for fresh data
        },
      });
    } else {
      // 다중 날짜 (간략 버전)
      const dailyPillars = calculateDailyPillarsRange(targetDate, days);

      const results = dailyPillars.map(({ date, pillar }) => {
        const parsedDate = parseStringToDate(date);
        const result = analyzeDailyFortune(
          parsedDate,
          natalBranches,
          usefulGodElement
        );

        return {
          date: result.date,
          pillar: result.pillar,
          score: result.baseAnalysis.score,
          grade: result.baseAnalysis.grade,
          gradeKorean: result.baseAnalysis.gradeKorean,
          usefulGodRelation: result.usefulGodRelation,
          hasHarmony: result.natalInteraction.harmonies.length > 0,
          hasClash: result.natalInteraction.clashes.length > 0,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          startDate: dailyPillars[0].date,
          endDate: dailyPillars[dailyPillars.length - 1].date,
          days: results,
        },
      }, {
        headers: {
          'Cache-Control': 'private, max-age=3600', // 1 hour cache for multi-day
        },
      });
    }
  } catch (error: unknown) {
    console.error("[Daily Fortune API] Error:", error);
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
 * POST: 일운 조회 (body로 파라미터 전달)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, date, interpret = true } = body;

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: "shareId가 필요합니다." },
        { status: 400 }
      );
    }

    // GET과 동일한 로직 수행
    const url = new URL(request.url);
    url.searchParams.set("shareId", shareId);
    if (date) url.searchParams.set("date", date);
    url.searchParams.set("interpret", String(interpret));

    const newRequest = new NextRequest(url.toString(), { method: "GET" });
    return GET(newRequest);
  } catch (error: unknown) {
    console.error("[Daily Fortune API] POST Error:", error);
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
 * AI를 사용한 일운 해석 생성 (with in-memory cache)
 */
async function generateDailyInterpretation(
  dailyResult: ReturnType<typeof analyzeDailyFortune>,
  saju: Record<string, unknown>,
  usefulGodElement: Element
): Promise<z.infer<typeof DailyFortuneInterpretationSchema>> {
  // Create cache key based on unique combination of date, pillar, and useful god
  const cacheKey = `daily-interp:${dailyResult.date}:${dailyResult.pillar.stem}${dailyResult.pillar.branch}:${usefulGodElement}:${dailyResult.baseAnalysis.grade}`;

  // Check cache first
  const cached = geminiInterpretationCache.get(cacheKey) as z.infer<typeof DailyFortuneInterpretationSchema> | undefined;
  if (cached) {
    console.log('[Daily Fortune] Gemini cache hit for', cacheKey);
    return cached;
  }

  const prompt = buildInterpretationPrompt(dailyResult, saju, usefulGodElement);

  const result = await generateObject({
    model: google(GEMINI_MODEL),
    schema: DailyFortuneInterpretationSchema,
    messages: [
      {
        role: "system",
        content: `당신은 전문 명리학자입니다. 사주팔자와 일진의 관계를 분석하여 실용적인 조언을 제공합니다.
- 긍정적이면서도 현실적인 조언을 제공하세요.
- 구체적인 활동과 행동 지침을 포함하세요.
- 합(合)과 충(沖), 용신 관계를 고려하여 분석하세요.
- 한국어로 응답하세요.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Cache the result
  geminiInterpretationCache.set(cacheKey, result.object);
  console.log('[Daily Fortune] Gemini cache miss, stored for', cacheKey);

  return result.object;
}

/**
 * 해석 프롬프트 구성
 */
function buildInterpretationPrompt(
  dailyResult: ReturnType<typeof analyzeDailyFortune>,
  saju: Record<string, unknown>,
  usefulGodElement: Element
): string {
  const { pillar, natalInteraction, usefulGodRelation, baseAnalysis } = dailyResult;

  const elementKorean: Record<Element, string> = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)",
  };

  return `## 오늘의 일진 분석

**일진**: ${pillar.stem}${pillar.branch} (${pillar.stemKorean}${pillar.branchKorean})
**오행**: ${pillar.elementKorean}
**점수**: ${baseAnalysis.score}점
**등급**: ${baseAnalysis.gradeKorean}

## 원국과의 관계
${natalInteraction.harmonies.length > 0 ? `- 합: ${natalInteraction.harmonies.join(", ")}` : ""}
${natalInteraction.clashes.length > 0 ? `- 충: ${natalInteraction.clashes.join(", ")}` : ""}
${natalInteraction.punishments.length > 0 ? `- 형: ${natalInteraction.punishments.join(", ")}` : ""}
${natalInteraction.harms.length > 0 ? `- 해: ${natalInteraction.harms.join(", ")}` : ""}
${natalInteraction.destructions.length > 0 ? `- 파: ${natalInteraction.destructions.join(", ")}` : ""}

## 용신과의 관계
- 용신 오행: ${elementKorean[usefulGodElement]}
- 관계: ${usefulGodRelation === "support" ? "지지함" : usefulGodRelation === "against" ? "불리함" : "중립"}
- 상세: ${baseAnalysis.usefulGodReason}

위 정보를 바탕으로 오늘의 운세를 해석해주세요.`;
}

/**
 * 기본 테마 (AI 해석 없을 때)
 */
function getDefaultTheme(grade: string): string {
  const themes: Record<string, string> = {
    excellent: "대길한 하루",
    good: "순조로운 하루",
    normal: "평온한 하루",
    caution: "조심이 필요한 하루",
  };
  return themes[grade] || "평범한 하루";
}
