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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#a855f7] text-sm font-medium tracking-wider">
          四柱八字
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
        <SajuForm />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-white/40 px-4">
        {t("privacyNotice")}
      </p>
    </div>
  );
}
