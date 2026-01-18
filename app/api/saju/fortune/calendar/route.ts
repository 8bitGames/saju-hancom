/**
 * 운세 캘린더 API 엔드포인트
 * Fortune Calendar API
 *
 * 월별 일일 운세 점수를 캘린더 형태로 제공
 */

import { NextRequest, NextResponse } from "next/server";
import { getSajuResultById, getUserSubscription } from "@/lib/supabase/usage";
import { createClient } from "@/lib/supabase/server";
import {
  generateFortuneCalendar,
  generateMultiMonthCalendar,
  type NatalBranches,
} from "@/lib/saju/fortune/fortune-calendar";
import type { Element } from "@/lib/saju/types";

/**
 * GET: 운세 캘린더 조회
 *
 * Query params:
 * - shareId: 사주 분석 결과 ID (필수)
 * - year: 연도 (선택, 기본값: 올해)
 * - month: 월 (선택, 기본값: 이번달)
 * - months: 조회할 월 수 (선택, 기본값: 1, 최대: 6)
 *
 * 프리미엄 구독자만 접근 가능
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const yearStr = searchParams.get("year");
    const monthStr = searchParams.get("month");
    const monthsStr = searchParams.get("months");

    // 필수 파라미터 검증
    if (!shareId) {
      return NextResponse.json(
        { success: false, error: "shareId가 필요합니다." },
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
          code: "PREMIUM_REQUIRED",
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

    // 사주 결과에서 필요한 데이터 추출
    const result = sajuResult.result;
    const resultData = result.resultData;

    // 원국 지지 추출
    const pillars = resultData?.step1?.pillars;
    if (!pillars) {
      return NextResponse.json(
        { success: false, error: "사주 원국 정보를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const natalBranches: NatalBranches = {
      year: pillars.year?.branch || "",
      month: pillars.month?.branch || "",
      day: pillars.day?.branch || "",
      time: pillars.time?.branch || "",
    };

    // 용신 추출
    const usefulGodElement: Element =
      resultData?.step2?.usefulGod?.primary ||
      resultData?.step2?.usefulGod?.element ||
      "wood"; // 기본값

    // 날짜 파라미터 파싱
    const now = new Date();
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const months = Math.min(Math.max(parseInt(monthsStr || "1", 10) || 1, 1), 6);

    // 캘린더 생성
    let data;
    if (months === 1) {
      data = generateFortuneCalendar(natalBranches, usefulGodElement, year, month);
    } else {
      data = generateMultiMonthCalendar(
        natalBranches,
        usefulGodElement,
        year,
        month,
        months
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=3600", // 1시간 캐시
        },
      }
    );
  } catch (error: unknown) {
    console.error("[Fortune Calendar API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류",
      },
      { status: 500 }
    );
  }
}
