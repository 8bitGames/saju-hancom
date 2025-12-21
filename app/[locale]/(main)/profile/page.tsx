import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "./ProfileContent";

export const metadata: Metadata = {
  title: "내 프로필 | 사주 한컴",
  description: "구독 정보와 저장된 사주 결과를 확인하세요",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/saju");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get saved results
  const { data: savedResults } = await supabase
    .from("saju_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <ProfileContent
      user={user}
      profile={profile}
      savedResults={savedResults || []}
    />
  );
}
