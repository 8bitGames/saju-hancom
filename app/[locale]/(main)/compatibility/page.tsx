import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CompatibilityFormWrapper } from "./compatibility-form-wrapper";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKorean = locale === 'ko';
  const prefix = isKorean ? '' : `/${locale}`;

  return {
    title: 'AI 직장 궁합 분석 - 동료와의 궁합',
    description: '직장 동료와의 사주 궁합을 AI가 분석합니다. 업무 스타일, 소통 방식, 협업 궁합을 확인하고 최적의 팀워크를 만들어보세요.',
    keywords: ['직장 궁합', '동료 궁합', '업무 궁합', '사주 궁합', 'AI 궁합', '팀 궁합'],
    alternates: {
      canonical: `${baseUrl}${prefix}/compatibility`,
      languages: {
        'ko-KR': `${baseUrl}/compatibility`,
        'en-US': `${baseUrl}/en/compatibility`,
      },
    },
    openGraph: {
      title: 'AI 직장 궁합 분석',
      description: '직장 동료와의 사주 궁합을 AI가 분석합니다.',
      images: [{ url: '/images/og-cover-compatibility.jpg', width: 1200, height: 630 }],
    },
  };
}

export default async function CompatibilityPage() {
  const t = await getTranslations("compatibility");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#3b82f6] text-sm font-medium tracking-wider">
          宮合分析
        </p>
        <h1 className="text-2xl font-bold text-white">
          {t("title")}
        </h1>
        <p className="text-white/60 text-sm">
          {t("subtitle")}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        <CompatibilityFormWrapper />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-white/40 px-4">
        입력하신 정보는 궁합 분석에만 사용됩니다
      </p>
    </div>
  );
}
