import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "./ProfileContent";

export const metadata: Metadata = {
  title: "내 프로필 | 사주 한사",
  description: "구독 정보와 저장된 사주 결과를 확인하세요",
};

const RESULTS_PER_PAGE = 10;

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/saju");
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

  return (
    <ProfileContent
      user={user}
      profile={profileResult.data}
      initialResults={savedResultsResult.data || []}
      totalCount={totalCount}
      pageSize={RESULTS_PER_PAGE}
    />
  );
}
