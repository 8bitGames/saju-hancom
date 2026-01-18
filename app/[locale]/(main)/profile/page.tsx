import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "./ProfileContent";
import { GuestProfileContent } from "./GuestProfileContent";
import { getDominantElement, type ElementType } from "@/lib/constants/guardians";

export const metadata: Metadata = {
  title: "내 프로필 | 청기운",
  description: "구독 정보와 저장된 사주 결과를 확인하세요",
};

const RESULTS_PER_PAGE = 10;

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <GuestProfileContent />;
  }

  // Get user profile and saved results count in parallel
  const [profileResult, countResult, savedResultsResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("saju_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("saju_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(RESULTS_PER_PAGE),
  ]);

  const totalCount = countResult.count || 0;
  const savedResults = savedResultsResult.data || [];

  // Extract dominant element from the most recent saju result
  let dominantElement: ElementType | null = null;
  let latestShareId: string | undefined;

  if (savedResults.length > 0) {
    const latestResult = savedResults[0];
    latestShareId = latestResult.share_id;
    const resultData = latestResult.result_data as Record<string, unknown> | null;
    if (resultData?.elementScores) {
      const scores = resultData.elementScores as Record<string, number>;
      dominantElement = getDominantElement(scores);
    }
  }

  return (
    <ProfileContent
      user={user}
      profile={profileResult.data}
      initialResults={savedResults}
      totalCount={totalCount}
      pageSize={RESULTS_PER_PAGE}
      dominantElement={dominantElement}
      latestShareId={latestShareId}
    />
  );
}
