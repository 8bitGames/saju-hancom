import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaceReadingFormWrapper } from "./face-reading-form-wrapper";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKorean = locale === 'ko';
  const prefix = isKorean ? '' : `/${locale}`;

  return {
    title: 'AI 관상 분석 - 얼굴로 보는 운세',
    description: '사진 한 장으로 관상을 분석합니다. AI가 얼굴 특징을 분석하여 성격, 재물운, 건강운, 인연운을 알려드립니다.',
    keywords: ['관상', '관상 분석', 'AI 관상', '얼굴 분석', '관상학', '얼굴 운세'],
    alternates: {
      canonical: `${baseUrl}${prefix}/face-reading`,
      languages: {
        'ko-KR': `${baseUrl}/face-reading`,
        'en-US': `${baseUrl}/en/face-reading`,
      },
    },
    openGraph: {
      title: 'AI 관상 분석',
      description: '사진 한 장으로 관상을 분석합니다. AI가 얼굴 특징을 분석하여 운세를 알려드립니다.',
      images: [{ url: '/images/og-cover-face-reading.jpg', width: 1200, height: 630 }],
    },
  };
}

export default async function FaceReadingPage() {
  const t = await getTranslations("faceReading");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#ef4444] text-sm font-medium tracking-wider">
          觀相分析
        </p>
        <h1 className="text-2xl font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="text-text-secondary text-sm">
          {t("subtitle")}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
        <FaceReadingFormWrapper />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-text-muted px-4">
        관상 분석은 재미를 위한 참고용 정보입니다
      </p>
    </div>
  );
}
