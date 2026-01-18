"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@/lib/i18n/navigation";
import { checkFortuneEligibility } from "@/lib/actions/saju";
import { getCurrentYearPillarName } from "@/lib/saju/constants";
import { GUARDIANS, ELEMENT_ORDER } from "@/lib/constants/guardians";
import { cn } from "@/lib/utils";
import {
  Sun,
  ArrowRight,
  Crown,
} from "@phosphor-icons/react";
import {
  Sparkles,
  Users,
  Heart,
  ScanFace,
  History,
  Star,
  ChevronRight,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface ServiceCard {
  id: string;
  titleKey: string;
  href: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
}

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const [isLoading, setIsLoading] = useState(true);
  const [fortuneData, setFortuneData] = useState<{
    eligible: boolean;
    shareId?: string;
  } | null>(null);

  // 현재 연도의 간지 이름 (병오년, 정미년 등)
  const yearName = useMemo(() => getCurrentYearPillarName(), []);

  // Check fortune eligibility on mount
  useEffect(() => {
    checkFortuneEligibility()
      .then(setFortuneData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // 점신 스타일 서비스 카드
  const mainServices: ServiceCard[] = [
    {
      id: "saju",
      titleKey: "cards.saju.title",
      href: "/saju",
      icon: <Sparkles className="w-7 h-7" strokeWidth={1.5} />,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      id: "compatibility",
      titleKey: "cards.compatibility.title",
      href: "/compatibility",
      icon: <Users className="w-7 h-7" strokeWidth={1.5} />,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "couple",
      titleKey: "cards.couple.title",
      href: "/couple",
      icon: <Heart className="w-7 h-7" strokeWidth={1.5} fill="currentColor" />,
      iconColor: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      id: "face-reading",
      titleKey: "cards.faceReading.title",
      href: "/face-reading",
      icon: <ScanFace className="w-7 h-7" strokeWidth={1.5} />,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  // Show loading state while checking fortune eligibility
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header Banner - 점신 스타일 */}
      <section className="bg-gradient-to-r from-pink-100 to-pink-50 px-4 py-5">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-600 text-xs font-medium mb-1">AI 운세 서비스</p>
              <h1 className="text-lg font-bold text-gray-800">
                오늘의 운세를 확인해보세요
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI가 분석하는 정확한 사주풀이
              </p>
            </div>
            <div className="text-4xl">🔮</div>
          </div>
        </div>
      </section>

      {/* Today's Fortune Banner (if eligible) */}
      {fortuneData?.eligible && fortuneData?.shareId && (
        <section className="px-4 py-4 bg-white">
          <div className="max-w-md mx-auto">
            <Link
              href={`/saju/today-fortune?shareId=${fortuneData.shareId}`}
              className="block"
            >
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-500" weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800">
                    {t("cards.fortune.title")}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {t("cards.fortune.description")}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-500 flex-shrink-0" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Main Services Section - 점신 스타일 */}
      <section className="px-4 py-5 bg-white mt-2">
        <div className="max-w-md mx-auto">
          {/* Section Header */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">운세 서비스</p>
            <h2 className="text-base font-bold text-gray-800">AI 사주 분석</h2>
          </div>

          {/* Service Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {mainServices.map((service) => (
              <Link key={service.id} href={service.href} className="block">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 h-[120px] flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center",
                      service.bgColor
                    )}
                  >
                    <span className={service.iconColor}>{service.icon}</span>
                  </div>
                  <span className="font-medium text-gray-800 text-sm">
                    {t(service.titleKey)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Menu Section */}
      <section className="px-4 py-5 bg-white mt-2">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">바로가기</p>
            <h2 className="text-base font-bold text-gray-800">빠른 메뉴</h2>
          </div>

          <div className="flex justify-around">
            <Link href="/history" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <History className="w-6 h-6 text-green-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-gray-700 font-medium">기록</span>
            </Link>

            <Link href="/premium" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" weight="fill" />
              </div>
              <span className="text-xs text-gray-700 font-medium">프리미엄</span>
            </Link>

            <Link href="/profile" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-500" strokeWidth={1.5} fill="currentColor" />
              </div>
              <span className="text-xs text-gray-700 font-medium">내 정보</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Guardian Preview Section */}
      <section className="px-4 py-5 bg-white mt-2">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">오행 수호신</p>
            <h2 className="text-base font-bold text-gray-800">{t("guardians")}</h2>
          </div>

          <div className="flex justify-around py-3">
            {ELEMENT_ORDER.map((element) => {
              const guardian = GUARDIANS[element];
              return (
                <div key={element} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm"
                    style={{
                      backgroundColor: `${guardian.color}15`,
                      border: `2px solid ${guardian.color}30`,
                    }}
                  >
                    {guardian.emoji}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: guardian.color }}
                  >
                    {guardian.element[locale]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Banner - 점신 스타일 */}
      <section className="px-4 py-5 bg-white mt-2">
        <div className="max-w-md mx-auto">
          <Link href="/premium" className="block">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 p-5 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" weight="fill" />
                  <span className="text-yellow-400 text-xs font-semibold">PREMIUM</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{t("premium.title")}</h3>
                <p className="text-sm text-gray-300 mb-3">
                  {t("premium.description")}
                </p>
                <div className="flex items-center text-yellow-400 text-sm font-medium">
                  자세히 보기
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer Note */}
      <section className="px-4 py-8 pb-28">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("footer1")}
            <br />
            {t("footer2")}
          </p>
        </div>
      </section>
    </div>
  );
}
