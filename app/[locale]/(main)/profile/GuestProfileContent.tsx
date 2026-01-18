"use client";

import { useLocale } from "next-intl";
import { User, SignIn, Sparkle, ClockCounterClockwise } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { MyGuardianEmpty } from "@/components/profile/MyGuardian";
import type { Locale } from "@/lib/i18n/config";
import { useEffect, useState } from "react";
import { getLocalHistory, type LocalSajuHistory, type LocalHistoryItem } from "@/lib/local-history";

const LABELS = {
  ko: {
    title: "내 정보",
    subtitle: "로그인하여 더 많은 기능을 이용하세요",
    loginPrompt: "계정에 로그인하면 사주 결과를 클라우드에 저장하고, 다양한 기기에서 확인할 수 있습니다.",
    login: "로그인",
    signUp: "회원가입",
    or: "또는",
    localHistory: "로컬 기록",
    localHistoryDesc: "이 기기에 저장된 분석 기록입니다",
    noLocalHistory: "아직 분석 기록이 없습니다",
    viewResult: "결과 보기",
    premium: {
      title: "프리미엄 기능",
      feature1: "무제한 사주 분석",
      feature2: "PDF 다운로드",
      feature3: "클라우드 저장",
      feature4: "상세 운세 리포트",
    },
    guardian: "나의 수호신",
    startAnalysis: "사주 분석하러 가기",
  },
  en: {
    title: "My Profile",
    subtitle: "Sign in to access more features",
    loginPrompt: "Sign in to save your fortune results to the cloud and access them from any device.",
    login: "Sign In",
    signUp: "Sign Up",
    or: "or",
    localHistory: "Local History",
    localHistoryDesc: "Analysis records saved on this device",
    noLocalHistory: "No analysis records yet",
    viewResult: "View Result",
    premium: {
      title: "Premium Features",
      feature1: "Unlimited fortune analysis",
      feature2: "PDF download",
      feature3: "Cloud storage",
      feature4: "Detailed fortune reports",
    },
    guardian: "My Guardian",
    startAnalysis: "Start Fortune Analysis",
  },
};

export function GuestProfileContent() {
  const locale = useLocale() as Locale;
  const t = LABELS[locale];
  const [localHistory, setLocalHistory] = useState<LocalSajuHistory[]>([]);

  useEffect(() => {
    const history = getLocalHistory();
    const sajuHistory = history.filter((item): item is LocalSajuHistory => item.type === 'saju');
    setLocalHistory(sajuHistory.slice(0, 5));
  }, []);

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-400" weight="fill" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>

        {/* Login Prompt */}
        <Card className="p-6 mb-8 bg-white border-gray-200 shadow-sm">
          <p className="text-gray-600 text-center mb-6">{t.loginPrompt}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/login">
              <Button className="w-full sm:w-auto bg-[#0E4168] hover:bg-[#0E4168]/90 text-white">
                <SignIn className="w-4 h-4 mr-2" />
                {t.login}
              </Button>
            </Link>
            <span className="text-gray-400 text-center self-center hidden sm:block">{t.or}</span>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full sm:w-auto bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                {t.signUp}
              </Button>
            </Link>
          </div>
        </Card>

        {/* My Guardian Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t.guardian}</h2>
          <MyGuardianEmpty locale={locale} />
        </div>

        {/* Local History */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <ClockCounterClockwise className="w-6 h-6 text-[#C4A35A]" weight="fill" />
            {t.localHistory}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{t.localHistoryDesc}</p>

          {localHistory.length === 0 ? (
            <Card className="p-8 bg-white border-gray-200 text-center shadow-sm">
              <p className="text-gray-500 mb-4">{t.noLocalHistory}</p>
              <Link href="/saju">
                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  {t.startAnalysis}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {localHistory.map((result, index) => (
                <Card
                  key={result.id || index}
                  className="p-4 bg-white border-gray-200 hover:border-[#C4A35A]/50 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-medium">
                        {result.birthData.year}년 {result.birthData.month}월 {result.birthData.day}일{" "}
                        {result.birthData.gender === "male" ? "남" : "여"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(result.createdAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
                      </p>
                    </div>
                    <Link
                      href={`/saju/result?year=${result.birthData.year}&month=${result.birthData.month}&day=${result.birthData.day}&hour=${result.birthData.hour}&minute=${result.birthData.minute}&gender=${result.birthData.gender}&isLunar=${result.birthData.isLunar}&city=${result.birthData.city}`}
                    >
                      <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                        {t.viewResult}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Premium Features Preview */}
        <Card className="p-6 bg-gradient-to-br from-[#C4A35A]/10 to-[#a88f4a]/10 border-[#C4A35A]/30">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-[#C4A35A]" weight="fill" />
            {t.premium.title}
          </h3>
          <ul className="space-y-2 mb-6">
            {[t.premium.feature1, t.premium.feature2, t.premium.feature3, t.premium.feature4].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C4A35A]" />
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/premium">
            <Button className="w-full bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] hover:opacity-90 text-white">
              <Sparkle className="w-4 h-4 mr-2" weight="fill" />
              {locale === "ko" ? "프리미엄 알아보기" : "Learn About Premium"}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
