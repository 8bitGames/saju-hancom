import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SajuForm } from "./saju-form";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKorean = locale === 'ko';
  const prefix = isKorean ? '' : `/${locale}`;

  return {
    title: 'AI 사주팔자 분석 - 무료 사주 풀이',
    description: '생년월일시를 입력하면 AI가 정확한 만세력 데이터로 사주팔자를 분석합니다. 천간, 지지, 오행 분석과 운세 풀이를 무료로 확인하세요.',
    keywords: ['사주팔자', '사주', '무료 사주', '사주 풀이', '만세력', '천간 지지', '오행', 'AI 사주'],
    alternates: {
      canonical: `${baseUrl}${prefix}/saju`,
      languages: {
        'ko-KR': `${baseUrl}/saju`,
        'en-US': `${baseUrl}/en/saju`,
      },
    },
    openGraph: {
      title: 'AI 사주팔자 분석',
      description: '생년월일시를 입력하면 AI가 정확한 만세력 데이터로 사주팔자를 분석합니다.',
      images: [{ url: '/images/og-cover-four-pillars.jpg', width: 1200, height: 630 }],
    },
  };
}

export default async function SajuPage() {
  const t = await getTranslations("saju");

  return (
    <div className="space-y-4 px-4">
      {/* Header - Cheong-Giun Style */}
      <div className="bg-white rounded-2xl p-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C4A35A]/10 rounded-full mb-3">
          <span className="text-[#C4A35A] text-xs font-semibold">四柱八字</span>
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
        <SajuForm />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-gray-500 px-4 pb-4">
        {t("privacyNotice")}
      </p>
    </div>
  );
}
