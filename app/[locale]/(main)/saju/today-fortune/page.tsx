import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { TodayFortuneContent } from "./TodayFortuneContent";

export const metadata: Metadata = {
  title: "오늘의 운세 | 사주 한사",
  description: "오늘 하루의 기운을 미리 살펴보세요",
};

interface PageProps {
  searchParams: Promise<{ shareId?: string }>;
}

export default async function TodayFortunePage({ searchParams }: PageProps) {
  const { shareId } = await searchParams;

  if (!shareId) {
    return <TodayFortuneContent error="사주 분석 결과를 찾을 수 없습니다." />;
  }

  const supabase = await createClient();

  // Fetch user data and saju result in parallel
  const [userResult, sajuResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("saju_results")
      .select("birth_year, result_data")
      .eq("share_id", shareId)
      .single(),
  ]);

  const user = userResult.data.user;

  // Check premium status if user is logged in
  let isPremium = false;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_tier, subscription_expires_at")
      .eq("id", user.id)
      .single();

    isPremium =
      profile?.subscription_tier === "premium" &&
      profile.subscription_expires_at !== null &&
      new Date(profile.subscription_expires_at) > new Date();
  }

  if (!sajuResult.data) {
    return <TodayFortuneContent error="사주 분석 결과를 불러올 수 없습니다." />;
  }

  const birthYear = sajuResult.data.birth_year;

  return (
    <TodayFortuneContent
      shareId={shareId}
      birthYear={birthYear}
      isPremium={isPremium}
    />
  );
}
