/**
 * 바이오리듬 API 엔드포인트
 * Biorhythm API
 *
 * 생년월일 기반 23/28/33일 주기의 신체/감성/지성 리듬 데이터 제공
 */

import { NextRequest, NextResponse } from "next/server";
import { getSajuResultById, getUserSubscription } from "@/lib/supabase/usage";
import { createClient } from "@/lib/supabase/server";
import { getBiorhythmForecast } from "@/lib/biorhythm/calculator";

/**
 * GET: 바이오리듬 조회
 *
 * Query params:
 * - shareId: 사주 분석 결과 ID (필수 - 생년월일 추출용)
 * - days: 예측 일수 (선택, 기본값: 30)
 *
 * 프리미엄 구독자만 접근 가능
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const daysStr = searchParams.get("days");

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

    // 사주 결과에서 생년월일 추출
    const result = sajuResult.result;
    const birthData = result.birthData;

    if (!birthData?.year || !birthData?.month || !birthData?.day) {
      return NextResponse.json(
        { success: false, error: "생년월일 정보를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    // 생년월일로 Date 객체 생성
    const birthDate = new Date(birthData.year, birthData.month - 1, birthData.day);

    // 예측 일수 설정 (기본 30일, 최대 90일)
    const days = Math.min(parseInt(daysStr || "30", 10) || 30, 90);

    // 바이오리듬 계산
    const biorhythm = getBiorhythmForecast(birthDate, days);

    return NextResponse.json(
      {
        success: true,
        data: biorhythm,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=3600", // 1시간 캐시
        },
      }
    );
  } catch (error: unknown) {
    console.error("[Biorhythm API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류",
      },
      { status: 500 }
    );
  }
}
