/**
 * 대운(大運) API 엔드포인트
 * Major Fortune API
 *
 * 10년 단위 대운 주기를 계산하고 현재 대운 분석 제공
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { getSajuResultById } from "@/lib/supabase/usage";
import { GEMINI_MODEL } from "@/lib/constants/ai";
import {
  generateMajorFortuneList,
  getCurrentMajorFortuneAnalysis,
  gradeToKorean,
} from "@/lib/saju/fortune";
import type { Element } from "@/lib/saju/types";
import type { MajorFortunePillar } from "@/lib/saju/fortune/types";

// 대운 AI 해석 스키마
const MajorFortuneInterpretationSchema = z.object({
  currentFortuneTheme: z.string().describe("현재 대운의 핵심 테마 (3-5단어)"),
  currentFortuneDescription: z.string().describe("현재 대운 상세 설명 (3-4문장)"),
  lifePhaseAdvice: z.string().describe("현재 인생 단계에 대한 조언 (2-3문장)"),
  opportunitiesThisPeriod: z.array(z.string()).describe("이 대운 기간의 기회 2-3개"),
  challengesThisPeriod: z.array(z.string()).describe("이 대운 기간의 도전 2-3개"),
  transitionAdvice: z.string().describe("다음 대운 전환 준비 조언 (1-2문장)"),
});

/**
 * GET: 대운 조회
 *
 * Query params:
 * - shareId: 사주 분석 결과 ID (필수)
 * - interpret: AI 해석 여부 (선택, 기본값: true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
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

    // 생년월일 추출 (birthData는 result에 직접 있음)
    const birthYear = result.birthData?.year || saju?.birthInfo?.year || saju?.step1?.birthInfo?.year || 1990;
    const birthMonth = result.birthData?.month || saju?.birthInfo?.month || saju?.step1?.birthInfo?.month || 1;
    const birthDay = result.birthData?.day || saju?.birthInfo?.day || saju?.step1?.birthInfo?.day || 1;
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

    // 성별 추출 (birthData는 result에 직접 있음)
    const gender: "male" | "female" =
      result.birthData?.gender || saju?.birthInfo?.gender || saju?.step1?.birthInfo?.gender || "male";

    // 원국 간지 추출
    const yearStem =
      saju?.pillars?.year?.stem ||
      saju?.pillars?.year?.gan ||
      saju?.step1?.pillars?.year?.stem ||
      "甲";
    const monthStem =
      saju?.pillars?.month?.stem ||
      saju?.pillars?.month?.gan ||
      saju?.step1?.pillars?.month?.stem ||
      "甲";
    const monthBranch =
      saju?.pillars?.month?.branch ||
      saju?.pillars?.month?.zhi ||
      saju?.step1?.pillars?.month?.branch ||
      "子";

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

    const shouldInterpret = interpretStr !== "false";

    // 대운 목록 생성
    const majorFortuneList = generateMajorFortuneList(
      birthDate,
      birthYear,
      gender,
      yearStem,
      monthStem,
      monthBranch,
      natalBranches,
      usefulGodElement
    );

    // 현재 나이 계산
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear + 1;

    // 현재 대운 분석
    const currentAnalysis = getCurrentMajorFortuneAnalysis(majorFortuneList, currentAge);

    // AI 해석 추가
    let interpretation = null;
    if (
      shouldInterpret &&
      process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
      currentAnalysis.current
    ) {
      try {
        interpretation = await generateMajorFortuneInterpretation(
          currentAnalysis.current,
          currentAnalysis.next,
          currentAge,
          currentAnalysis.yearsRemaining,
          currentAnalysis.progress,
          majorFortuneList.direction
        );
      } catch (e) {
        console.error("AI interpretation error:", e);
      }
    }

    // 현재 대운 인덱스 찾기
    const currentIndex = majorFortuneList.fortunes.findIndex(
      (f: MajorFortunePillar) => f.order === currentAnalysis.current?.order
    );

    // 응답 구성
    return NextResponse.json({
      success: true,
      data: {
        // 기본 정보
        birthDate: `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
        gender: gender === "male" ? "남성" : "여성",
        direction: majorFortuneList.direction, // "forward" | "backward"
        startAge: majorFortuneList.startAge,
        calculationBasis: majorFortuneList.calculationBasis,
        currentIndex: currentIndex >= 0 ? currentIndex : 0,

        // 현재 대운
        currentFortune: currentAnalysis.current
          ? {
              order: currentAnalysis.current.order,
              ageRange: `${currentAnalysis.current.startAge}세 ~ ${currentAnalysis.current.endAge}세`,
              yearRange: `${currentAnalysis.current.startYear}년 ~ ${currentAnalysis.current.endYear}년`,
              pillarKorean: `${currentAnalysis.current.pillar.stemKorean}${currentAnalysis.current.pillar.branchKorean}`,
              element: currentAnalysis.current.pillar.element,
              elementKorean: currentAnalysis.current.pillar.elementKorean,
              score: currentAnalysis.current.analysis.score,
              grade: gradeToKorean(currentAnalysis.current.analysis.grade),
              keywords: currentAnalysis.current.keywords,
              usefulGodRelation: currentAnalysis.current.usefulGodRelation,
              natalInteraction: currentAnalysis.current.natalInteraction,
            }
          : null,

        // 현재 상태
        currentAge,
        remainingYears: currentAnalysis.yearsRemaining,
        progressPercent: currentAnalysis.progress,

        // 전체 대운 목록 (클라이언트 호환 형식)
        fortunes: majorFortuneList.fortunes.map((f: MajorFortunePillar) => ({
          order: f.order,
          startAge: f.startAge,
          endAge: f.endAge,
          startYear: f.startYear,
          endYear: f.endYear,
          pillar: {
            stem: f.pillar.stem,
            branch: f.pillar.branch,
            stemKorean: f.pillar.stemKorean,
            branchKorean: f.pillar.branchKorean,
          },
          analysis: {
            score: f.analysis.score,
            grade: f.analysis.grade,
            theme: interpretation?.currentFortuneTheme || getDefaultTheme(f),
            description: interpretation?.currentFortuneDescription || getDefaultDescription(f),
          },
          keywords: f.keywords || [],
        })),

        // 전체 대운 목록 (기존 형식 호환)
        allFortunes: majorFortuneList.fortunes.map((f: MajorFortunePillar) => ({
          order: f.order,
          ageRange: `${f.startAge}세 ~ ${f.endAge}세`,
          yearRange: `${f.startYear}년 ~ ${f.endYear}년`,
          pillarKorean: `${f.pillar.stemKorean}${f.pillar.branchKorean}`,
          element: f.pillar.element,
          elementKorean: f.pillar.elementKorean,
          score: f.analysis.score,
          grade: gradeToKorean(f.analysis.grade),
          isCurrent: f.order === currentAnalysis.current?.order,
        })),

        // AI 해석
        interpretation: interpretation
          ? {
              theme: interpretation.currentFortuneTheme,
              description: interpretation.currentFortuneDescription,
              lifePhaseAdvice: interpretation.lifePhaseAdvice,
              opportunities: interpretation.opportunitiesThisPeriod,
              challenges: interpretation.challengesThisPeriod,
              transitionAdvice: interpretation.transitionAdvice,
            }
          : null,

        // 요약
        summary: currentAnalysis.current
          ? `현재 ${currentAge}세로, ${currentAnalysis.current.order}번째 대운(${currentAnalysis.current.pillar.stemKorean}${currentAnalysis.current.pillar.branchKorean}) 기간입니다. ${currentAnalysis.yearsRemaining}년 남았습니다.`
          : `현재 ${currentAge}세입니다.`,
      },
    });
  } catch (error: unknown) {
    console.error("[Major Fortune API] Error:", error);
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
 * POST: 대운 조회 (body로 파라미터 전달)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, interpret = true } = body;

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: "shareId가 필요합니다." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    url.searchParams.set("shareId", shareId);
    url.searchParams.set("interpret", String(interpret));

    const newRequest = new NextRequest(url.toString(), { method: "GET" });
    return GET(newRequest);
  } catch (error: unknown) {
    console.error("[Major Fortune API] POST Error:", error);
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
 * 기본 테마 생성
 */
function getDefaultTheme(f: MajorFortunePillar): string {
  const elementThemes: Record<string, string> = {
    wood: "성장과 발전의 시기",
    fire: "열정과 도약의 시기",
    earth: "안정과 축적의 시기",
    metal: "결단과 실행의 시기",
    water: "지혜와 유연성의 시기",
  };
  return elementThemes[f.pillar.element] || "변화의 시기";
}

/**
 * 기본 설명 생성
 */
function getDefaultDescription(f: MajorFortunePillar): string {
  const grade = f.analysis.grade;
  const element = f.pillar.elementKorean;

  if (grade === "excellent") {
    return `${element} 에너지가 강하게 작용하여 큰 발전이 기대되는 대운입니다.`;
  } else if (grade === "good") {
    return `${element} 기운이 긍정적으로 작용하는 좋은 대운입니다.`;
  } else if (grade === "caution") {
    return `${element} 기운에 주의가 필요한 대운입니다. 신중한 행동이 중요합니다.`;
  }
  return `${element} 에너지가 흐르는 대운입니다.`;
}

/**
 * AI를 사용한 대운 해석 생성
 */
async function generateMajorFortuneInterpretation(
  current: MajorFortunePillar,
  next: MajorFortunePillar | null,
  currentAge: number,
  remainingYears: number,
  progressPercent: number,
  direction: "forward" | "backward"
): Promise<z.infer<typeof MajorFortuneInterpretationSchema>> {
  const prompt = `## 대운 분석

**현재 나이**: ${currentAge}세
**대운 방향**: ${direction === "forward" ? "순행" : "역행"}

**현재 대운 (${current.order}번째)**:
- 기간: ${current.startAge}세 ~ ${current.endAge}세 (${current.startYear}년 ~ ${current.endYear}년)
- 간지: ${current.pillar.stemKorean}${current.pillar.branchKorean}
- 오행: ${current.pillar.elementKorean}
- 점수: ${current.analysis.score}점
- 키워드: ${current.keywords.join(", ")}
- 용신 관계: ${current.usefulGodRelation === "support" ? "지지함" : current.usefulGodRelation === "against" ? "불리함" : "중립"}

**원국과의 관계**:
- 합: ${current.natalInteraction.harmonies.join(", ") || "없음"}
- 충: ${current.natalInteraction.clashes.join(", ") || "없음"}
- 형: ${current.natalInteraction.punishments.join(", ") || "없음"}

**남은 기간**: ${remainingYears}년 (진행률 ${progressPercent}%)

**다음 대운**: ${
    next
      ? `${next.pillar.stemKorean}${next.pillar.branchKorean} (${next.pillar.elementKorean})`
      : "마지막 대운"
  }

위 정보를 바탕으로 현재 대운에 대한 깊이 있는 해석을 제공해주세요.`;

  const result = await generateObject({
    model: google(GEMINI_MODEL),
    schema: MajorFortuneInterpretationSchema,
    messages: [
      {
        role: "system",
        content: `당신은 전문 명리학자입니다. 대운(大運)을 분석하여 10년 주기의 인생 흐름에 대한 통찰을 제공합니다.
- 현재 대운의 핵심 에너지와 테마를 명확히 설명하세요.
- 이 시기의 기회와 도전을 구체적으로 제시하세요.
- 인생 단계에 맞는 실용적인 조언을 제공하세요.
- 다음 대운으로의 전환 준비에 대해 언급하세요.
- 긍정적이면서도 현실적인 관점을 유지하세요.
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
