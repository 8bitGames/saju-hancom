/**
 * 세운(歲運) API 엔드포인트
 * Yearly Fortune API
 *
 * 연도별 운세 계산 및 5년 전망 제공
 */

import { NextRequest, NextResponse } from "next/server";
import { getSajuResultById } from "@/lib/supabase/usage";
import {
  analyzeYearlyFortuneRange,
  getYearlyFortuneSummary,
  gradeToKorean,
} from "@/lib/saju/fortune";
import type { Element } from "@/lib/saju/types";

/**
 * GET: 세운 조회
 *
 * Query params:
 * - shareId: 사주 분석 결과 ID (필수)
 * - years: 조회할 연도 수 (선택, 기본값: 5)
 * - startYear: 시작 연도 (선택, 기본값: 현재년도)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const yearsStr = searchParams.get("years");
    const startYearStr = searchParams.get("startYear");

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

    // 파라미터 설정
    const currentYear = new Date().getFullYear();
    const startYear = startYearStr ? parseInt(startYearStr, 10) : currentYear;
    const yearsCount = yearsStr ? parseInt(yearsStr, 10) : 5;

    // 세운 분석
    const yearlyFortunes = analyzeYearlyFortuneRange(
      startYear,
      Math.min(yearsCount, 10), // 최대 10년
      natalBranches,
      usefulGodElement
    );

    // 응답 구성
    return NextResponse.json({
      success: true,
      data: {
        currentYear,
        startYear,
        yearsCount: yearlyFortunes.yearsCount,
        bestYears: yearlyFortunes.bestYears,
        cautionYears: yearlyFortunes.cautionYears,
        fortunes: yearlyFortunes.fortunes.map((f) => ({
          year: f.year,
          pillar: {
            stem: f.pillar.stem,
            branch: f.pillar.branch,
            stemKorean: f.pillar.stemKorean,
            branchKorean: f.pillar.branchKorean,
            fullName: `${f.pillar.stemKorean}${f.pillar.branchKorean}`,
          },
          element: f.pillar.element,
          elementKorean: f.pillar.elementKorean,
          zodiacAnimal: f.zodiacAnimal,
          analysis: {
            score: f.analysis.score,
            grade: f.analysis.grade,
            gradeKorean: gradeToKorean(f.analysis.grade),
            theme: f.analysis.theme,
            description: f.analysis.description,
            opportunities: f.analysis.opportunities,
            challenges: f.analysis.challenges,
            advice: f.analysis.advice,
          },
          keywords: f.keywords,
          natalInteraction: {
            harmonies: f.natalInteraction.harmonies,
            clashes: f.natalInteraction.clashes,
            punishments: f.natalInteraction.punishments,
          },
          usefulGodRelation: f.usefulGodRelation,
        })),
        summary: `${startYear}년부터 ${startYear + yearsCount - 1}년까지 ${yearsCount}년간의 세운입니다.`,
      },
    });
  } catch (error: unknown) {
    console.error("[Yearly Fortune API] Error:", error);
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
 * POST: 세운 조회 (body로 파라미터 전달)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, years = 5, startYear } = body;

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: "shareId가 필요합니다." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    url.searchParams.set("shareId", shareId);
    url.searchParams.set("years", String(years));
    if (startYear) {
      url.searchParams.set("startYear", String(startYear));
    }

    const newRequest = new NextRequest(url.toString(), { method: "GET" });
    return GET(newRequest);
  } catch (error: unknown) {
    console.error("[Yearly Fortune API] POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류",
      },
      { status: 500 }
    );
  }
}
