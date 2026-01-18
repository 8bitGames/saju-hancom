"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { User, Sparkle, Calendar, FilePdf, SignOut, CaretDown } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/lib/i18n/navigation";
import { toast } from "sonner";
import type { UserProfile, SajuResult } from "@/lib/supabase/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Link } from "@/lib/i18n/navigation";
import { MyGuardian, MyGuardianEmpty } from "@/components/profile/MyGuardian";
import { TeaRecommendation } from "@/components/fortune/TeaRecommendation";
import { ScentRecommendation } from "@/components/saju/ScentRecommendation";
import type { ElementType } from "@/lib/constants/guardians";
import type { Locale } from "@/lib/i18n/config";

interface ProfileContentProps {
  user: SupabaseUser;
  profile: UserProfile | null;
  initialResults: SajuResult[];
  totalCount: number;
  pageSize: number;
  dominantElement: ElementType | null;
  latestShareId?: string;
}

export function ProfileContent({ user, profile, initialResults, totalCount, pageSize, dominantElement, latestShareId }: ProfileContentProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const [results, setResults] = useState<SajuResult[]>(initialResults);
  const [loadingMore, setLoadingMore] = useState(false);

  const hasMore = results.length < totalCount;

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from("saju_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(results.length, results.length + pageSize - 1);

      if (error) throw error;
      if (data) {
        setResults((prev) => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Error loading more results:", error);
      toast.error("더 불러오는 중 오류가 발생했습니다");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, results.length, pageSize, supabase, user.id]);

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
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">내 프로필</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="outline"
            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <SignOut className="w-4 h-4 mr-2" />
            {loggingOut ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </div>

        {/* Subscription Status */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-[#C4A35A]/10 to-[#a88f4a]/10 border-[#C4A35A]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C4A35A]/20 flex items-center justify-center">
                {isPremium ? (
                  <Sparkle className="w-6 h-6 text-[#C4A35A]" weight="fill" />
                ) : (
                  <User className="w-6 h-6 text-gray-500" weight="fill" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">구독 플랜</p>
                <p className="text-2xl font-bold text-gray-800">
                  {isPremium ? "프리미엄" : "무료"}
                </p>
                {isPremium && profile?.subscription_expires_at && (
                  <p className="text-sm text-[#C4A35A] mt-1">
                    {new Date(profile.subscription_expires_at).toLocaleDateString("ko-KR")}까지
                  </p>
                )}
              </div>
            </div>

            {!isPremium && (
              <Link href="/premium">
                <Button className="bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] hover:opacity-90 text-white">
                  <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                  업그레이드
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* My Guardian Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">나의 수호신</h2>
          {dominantElement ? (
            <MyGuardian
              element={dominantElement}
              locale={locale}
              shareId={latestShareId}
            />
          ) : (
            <MyGuardianEmpty locale={locale} />
          )}
        </div>

        {/* Personalized Recommendations */}
        {dominantElement && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">맞춤 추천</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TeaRecommendation element={dominantElement} locale={locale} compact />
              <ScentRecommendation element={dominantElement} locale={locale} compact />
            </div>
          </div>
        )}

        {/* Saved Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#C4A35A]" weight="fill" />
            저장된 사주 결과 ({totalCount})
          </h2>

          {results.length === 0 ? (
            <Card className="p-8 bg-white border-gray-200 text-center shadow-sm">
              <p className="text-gray-500 mb-4">아직 저장된 사주 결과가 없습니다</p>
              <Link href="/saju">
                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  사주 분석하러 가기
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="p-6 bg-white border-gray-200 hover:border-[#C4A35A]/50 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">
                        {result.birth_year}년 {result.birth_month}월{" "}
                        {result.birth_day}일{" "}
                        {result.gender === "male" ? "남" : "여"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.is_lunar ? "음력" : "양력"} | {result.city}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        저장일: {new Date(result.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>

                    <Link
                      href={`/saju/result?year=${result.birth_year}&month=${result.birth_month}&day=${result.birth_day}&hour=${result.birth_hour}&minute=${result.birth_minute}&gender=${result.gender}&isLunar=${result.is_lunar}&city=${result.city}`}
                    >
                      <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                        <FilePdf className="w-4 h-4 mr-2" />
                        결과 보기
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-[#C4A35A] rounded-full animate-spin" />
                        불러오는 중...
                      </>
                    ) : (
                      <>
                        <CaretDown className="w-4 h-4 mr-2" />
                        더 보기 ({results.length}/{totalCount})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Usage Stats (for free users) */}
        {!isPremium && (
          <Card className="p-6 bg-white border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">무료 플랜 사용 현황</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {totalCount}/1
                </p>
                <p className="text-sm text-gray-500">저장</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">?/1</p>
                <p className="text-sm text-gray-500">PDF</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">?/1</p>
                <p className="text-sm text-gray-500">공유</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              프리미엄으로 업그레이드하면 무제한으로 이용할 수 있습니다
            </p>
          </Card>
        )}

        {/* Company Information */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
            청기운은 전통 명리학과 AI 기술을 결합하여
            <br />
            재미있는 운세 정보를 제공합니다.
          </p>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-sm font-bold text-gray-700">모드온 AI</span>
              <span className="text-[10px] text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded">벤처기업인증</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <p>대표: 정다운</p>
              <p>사업자등록번호: 145-87-03354</p>
              <p>서울특별시 서초구 사평대로53길 94, 4층</p>
              <p className="pt-2">
                <a href="mailto:info@modawn.ai" className="text-gray-500 hover:text-gray-700 transition-colors">
                  E: info@modawn.ai
                </a>
              </p>
            </div>
            <p className="text-[10px] text-gray-400 mt-6">
              © 2025 모드온 AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
