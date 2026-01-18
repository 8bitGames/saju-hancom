"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import { checkFortuneEligibility } from "@/lib/actions/saju";
import { GUARDIANS, ELEMENT_ORDER } from "@/lib/constants/guardians";
import {
  MAIN_CATEGORIES,
  SECONDARY_CATEGORIES,
  MORE_CATEGORIES,
  PREMIUM_CATEGORIES,
  RELATIONSHIP_CATEGORIES,
  FUN_CATEGORIES,
  getPopularCategories,
  getNewCategories,
  type CategoryIcon,
} from "@/lib/constants/category-icons";
import { cn } from "@/lib/utils";
import {
  Sun,
  ArrowRight,
  Crown,
  CaretRight,
} from "@phosphor-icons/react";
import type { Locale } from "@/lib/i18n/config";

// Category section component
function CategorySection({
  title,
  subtitle,
  categories,
  locale,
  columns = 4,
}: {
  title: string;
  subtitle?: string;
  categories: CategoryIcon[];
  locale: Locale;
  columns?: 4 | 5;
}) {
  return (
    <section className="px-4 py-4 bg-white mt-2">
      <div className="max-w-md mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {subtitle && (
              <p className="text-xs text-gray-400 font-medium mb-0.5">{subtitle}</p>
            )}
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
          </div>
        </div>

        {/* Category Grid */}
        <div className={cn(
          "grid gap-2",
          columns === 4 ? "grid-cols-4" : "grid-cols-5"
        )}>
          {categories.map((category) => (
            <Link key={category.id} href={category.href} className="block">
              <div className="flex flex-col items-center py-2 active:scale-95 transition-transform">
                <div className="relative w-14 h-14 mb-1.5">
                  <div className="w-full h-full rounded-2xl bg-[#F5F9FC] flex items-center justify-center overflow-hidden">
                    <Image
                      src={category.imagePath}
                      alt={category.name[locale]}
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                  {/* NEW badge - small dot style */}
                  {category.isNew && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[8px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                      N
                    </span>
                  )}
                  {/* HOT badge - small dot style */}
                  {category.isPopular && !category.isNew && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs text-gray-700 font-medium text-center leading-tight line-clamp-2">
                  {category.name[locale]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const [isLoading, setIsLoading] = useState(true);
  const [fortuneData, setFortuneData] = useState<{
    eligible: boolean;
    shareId?: string;
  } | null>(null);

  // Check fortune eligibility on mount
  useEffect(() => {
    checkFortuneEligibility()
      .then(setFortuneData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Show loading state while checking fortune eligibility
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FC]">
      {/* Header Banner - Clean Mobile Style */}
      <section className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-cheonggiun.png"
              alt="청기운"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            AI가 분석하는 정확한 사주풀이
          </p>
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

      {/* Main Services Section - Category Icons Grid */}
      <CategorySection
        title="AI 사주 분석"
        subtitle="운세 서비스"
        categories={MAIN_CATEGORIES}
        locale={locale}
        columns={4}
      />

      {/* Secondary Categories - Daily Fortune */}
      <CategorySection
        title="일일 운세"
        subtitle="매일 확인"
        categories={SECONDARY_CATEGORIES}
        locale={locale}
        columns={4}
      />

      {/* More Categories - Divination Services */}
      <CategorySection
        title="점술 서비스"
        subtitle="다양한 운세"
        categories={MORE_CATEGORIES}
        locale={locale}
        columns={4}
      />

      {/* Premium Categories */}
      <CategorySection
        title="인기 서비스"
        subtitle="프리미엄"
        categories={PREMIUM_CATEGORIES}
        locale={locale}
        columns={4}
      />

      {/* Relationship Categories */}
      <CategorySection
        title="연애/궁합"
        subtitle="인연 분석"
        categories={RELATIONSHIP_CATEGORIES}
        locale={locale}
        columns={4}
      />

      {/* Fun Categories */}
      <CategorySection
        title="행운 서비스"
        subtitle="재미로 보기"
        categories={FUN_CATEGORIES}
        locale={locale}
        columns={4}
      />

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
                    className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-sm"
                    style={{
                      backgroundColor: `${guardian.color}15`,
                      border: `2px solid ${guardian.color}30`,
                    }}
                  >
                    <Image
                      src={guardian.imagePath}
                      alt={guardian.name[locale]}
                      width={40}
                      height={40}
                      className="object-cover rounded-full"
                    />
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

      {/* Premium Banner - Clean Mobile Style */}
      <section className="px-4 py-4 bg-white mt-2">
        <div className="max-w-md mx-auto">
          <Link href="/premium" className="block">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" weight="fill" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">PREMIUM</span>
                </div>
                <h3 className="font-bold text-gray-900">{t("premium.title")}</h3>
                <p className="text-sm text-gray-500 truncate">
                  {t("premium.description")}
                </p>
              </div>
              <CaretRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer - Company Information */}
      <footer className="px-4 py-8 pb-28 bg-[#1A5A8A]">
        <div className="max-w-md mx-auto">
          {/* Disclaimer */}
          <p className="text-xs text-white/70 text-center leading-relaxed mb-6">
            AI 운세 마스터는 전통 명리학과 AI 기술을 결합하여
            <br />
            재미있는 운세 정보를 제공합니다.
          </p>

          {/* Company Info */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-white">모드온 AI</span>
              <span className="text-[10px] text-white/60 border border-white/30 px-1.5 py-0.5 rounded">벤처기업인증</span>
            </div>
            <div className="space-y-1 text-xs text-white/60">
              <p>대표: 정다운</p>
              <p>사업자등록번호: 145-87-03354</p>
              <p>서울특별시 서초구 사평대로53길 94, 4층</p>
              <p className="pt-2">
                <a href="mailto:info@modawn.ai" className="text-white/80 hover:text-white">
                  E: info@modawn.ai
                </a>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-white/40 text-center mt-6">
            © 2025 모드온 AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
