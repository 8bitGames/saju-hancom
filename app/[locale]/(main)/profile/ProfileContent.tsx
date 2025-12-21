"use client";

import { useState } from "react";
import { User, Sparkle, Calendar, FilePdf, SignOut } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserProfile, SajuResult } from "@/lib/supabase/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Link } from "@/lib/i18n/navigation";

interface ProfileContentProps {
  user: SupabaseUser;
  profile: UserProfile | null;
  savedResults: SajuResult[];
}

export function ProfileContent({ user, profile, savedResults }: ProfileContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const isPremium =
    profile?.subscription_tier === "premium" &&
    profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    toast.success("로그아웃되었습니다");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">내 프로필</h1>
            <p className="text-white/60">{user.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="outline"
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <SignOut className="w-4 h-4 mr-2" />
            {loggingOut ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </div>

        {/* Subscription Status */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
                {isPremium ? (
                  <Sparkle className="w-6 h-6 text-purple-400" weight="fill" />
                ) : (
                  <User className="w-6 h-6 text-white/60" weight="fill" />
                )}
              </div>
              <div>
                <p className="text-sm text-white/60">구독 플랜</p>
                <p className="text-2xl font-bold text-white">
                  {isPremium ? "프리미엄" : "무료"}
                </p>
                {isPremium && profile?.subscription_expires_at && (
                  <p className="text-sm text-purple-300 mt-1">
                    {new Date(profile.subscription_expires_at).toLocaleDateString("ko-KR")}까지
                  </p>
                )}
              </div>
            </div>

            {!isPremium && (
              <Link href="/premium">
                <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90">
                  <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                  업그레이드
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Saved Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" weight="fill" />
            저장된 사주 결과 ({savedResults.length})
          </h2>

          {savedResults.length === 0 ? (
            <Card className="p-8 bg-white/5 border-white/10 text-center">
              <p className="text-white/60 mb-4">아직 저장된 사주 결과가 없습니다</p>
              <Link href="/saju">
                <Button className="bg-white/10 hover:bg-white/20">
                  사주 분석하러 가기
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedResults.map((result) => (
                <Card
                  key={result.id}
                  className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">
                        {result.birth_year}년 {result.birth_month}월{" "}
                        {result.birth_day}일{" "}
                        {result.gender === "male" ? "남" : "여"}
                      </p>
                      <p className="text-sm text-white/40">
                        {result.is_lunar ? "음력" : "양력"} | {result.city}
                      </p>
                      <p className="text-xs text-white/40 mt-2">
                        저장일: {new Date(result.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>

                    <Link
                      href={`/saju/result?year=${result.birth_year}&month=${result.birth_month}&day=${result.birth_day}&hour=${result.birth_hour}&minute=${result.birth_minute}&gender=${result.gender}&isLunar=${result.is_lunar}&city=${result.city}`}
                    >
                      <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                        <FilePdf className="w-4 h-4 mr-2" />
                        결과 보기
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Usage Stats (for free users) */}
        {!isPremium && (
          <Card className="p-6 bg-white/5 border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">무료 플랜 사용 현황</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">
                  {savedResults.length}/1
                </p>
                <p className="text-sm text-white/60">저장</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">?/1</p>
                <p className="text-sm text-white/60">PDF</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">?/1</p>
                <p className="text-sm text-white/60">공유</p>
              </div>
            </div>
            <p className="text-xs text-white/40 text-center mt-4">
              프리미엄으로 업그레이드하면 무제한으로 이용할 수 있습니다
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
