/**
 * 라이프스타일 운세 API 엔드포인트
 * Lifestyle Fortune API
 *
 * 용신(用神) 기반 일일 라이프스타일 운세 제공
 * - 행운의 색상, 음식, 숫자, 방향
 * - 추천/피해야 할 활동
 */

import { NextRequest, NextResponse } from "next/server";
import { getSajuResultById, getUserSubscription } from "@/lib/supabase/usage";
import { createClient } from "@/lib/supabase/server";
import { calculateLifestyleFortune } from "@/lib/saju/lifestyle/lifestyle-fortune";
import type { SajuPipelineResult } from "@/lib/saju/pipeline-types";

/**
 * GET: 라이프스타일 운세 조회
 *
 * Query params:
 * - shareId: 사주 분석 결과 ID (필수)
 * - date: 조회할 날짜 YYYY-MM-DD (선택, 기본값: 오늘)
 *
 * 프리미엄 구독자만 접근 가능
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const dateStr = searchParams.get("date");

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

    const result = sajuResult.result;
    // resultData 내부에 실제 사주 분석 결과가 있음
    const saju = (result.resultData || result) as SajuPipelineResult;

    // 날짜 설정
    const targetDate = dateStr ? new Date(dateStr) : new Date();

    // 라이프스타일 운세 계산
    const lifestyle = calculateLifestyleFortune(saju, targetDate);

    return NextResponse.json(
      {
        success: true,
        data: lifestyle,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=1800", // 30분 캐시
        },
      }
    );
  } catch (error: unknown) {
    console.error("[Lifestyle Fortune API] Error:", error);
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
 * POST: 라이프스타일 운세 조회 (body로 파라미터 전달)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, date } = body;

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

    const newRequest = new NextRequest(url.toString(), { method: "GET" });
    return GET(newRequest);
  } catch (error: unknown) {
    console.error("[Lifestyle Fortune API] POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류",
      },
      { status: 500 }
    );
  }
}
