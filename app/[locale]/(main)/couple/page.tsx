import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoupleFormWrapper } from "./couple-form-wrapper";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKorean = locale === 'ko';
  const prefix = isKorean ? '' : `/${locale}`;

  return {
    title: 'AI 커플 궁합 분석 - 연인 궁합 테스트',
    description: '연인, 배우자와의 사주 궁합을 AI가 분석합니다. 천생연분 점수, 장단점 분석, 관계 개선 조언을 무료로 확인하세요.',
    keywords: ['커플 궁합', '연인 궁합', '결혼 궁합', '연애 궁합', '사주 궁합', '천생연분'],
    alternates: {
      canonical: `${baseUrl}${prefix}/couple`,
      languages: {
        'ko-KR': `${baseUrl}/couple`,
        'en-US': `${baseUrl}/en/couple`,
      },
    },
    openGraph: {
      title: 'AI 커플 궁합 분석',
      description: '연인, 배우자와의 사주 궁합을 AI가 분석합니다.',
      images: [{ url: '/images/og-cover-couple.jpg', width: 1200, height: 630 }],
    },
  };
}

export default async function CouplePage() {
  const t = await getTranslations("couple");

  return (
    <div className="space-y-4 px-4">
      {/* Header - Cheong-Giun Style */}
      <div className="bg-white rounded-2xl p-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-full mb-3">
          <span className="text-pink-600 text-xs font-semibold">緣分分析</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          {t("title")}
        </h1>
        <p className="text-gray-500 text-sm">
          {t("subtitle")}
        </p>
      </div>

      {/* Form Card - 점신 스타일 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <CoupleFormWrapper />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-gray-500 px-4 pb-4">
        {t("privacyNotice")}
      </p>
    </div>
  );
}
