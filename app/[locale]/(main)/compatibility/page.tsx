import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CompatibilityFormWrapper } from "./compatibility-form-wrapper";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKorean = locale === 'ko';
  const prefix = isKorean ? '' : `/${locale}`;

  return {
    title: 'AI 동료 궁합 분석',
    description: '동료와의 사주 궁합을 AI가 분석합니다. 업무 스타일, 소통 방식, 협업 궁합을 확인하고 최적의 팀워크를 만들어보세요.',
    keywords: ['동료 궁합', '업무 궁합', '사주 궁합', 'AI 궁합', '팀 궁합'],
    alternates: {
      canonical: `${baseUrl}${prefix}/compatibility`,
      languages: {
        'ko-KR': `${baseUrl}/compatibility`,
        'en-US': `${baseUrl}/en/compatibility`,
      },
    },
    openGraph: {
      title: 'AI 동료 궁합 분석',
      description: '동료와의 사주 궁합을 AI가 분석합니다.',
      images: [{ url: '/images/og-cover-compatibility.jpg', width: 1200, height: 630 }],
    },
  };
}

export default async function CompatibilityPage() {
  const t = await getTranslations("compatibility");

  return (
    <div className="space-y-4 px-4">
      {/* Header - 점신 스타일 */}
      <div className="bg-white rounded-2xl p-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-3">
          <span className="text-lg">👥</span>
          <span className="text-blue-600 text-xs font-medium">宮合分析</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2 break-keep">
          {t("title")}
        </h1>
        <p className="text-gray-500 text-sm">
          {t("subtitle")}
        </p>
      </div>

      {/* Form Card - 점신 스타일 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <CompatibilityFormWrapper />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-gray-500 px-4 pb-4">
        입력하신 정보는 궁합 분석에만 사용됩니다
      </p>
    </div>
  );
}
