import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSajuResults } from "@/lib/supabase/usage";
import { HistoryList } from "./history-list";
import { EmptyHistory } from "./empty-history";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isKorean = locale === 'ko';
  const prefix = isKorean ? '' : `/${locale}`;

  return {
    title: '분석 기록 - 내 운세 히스토리',
    description: '지금까지 분석한 사주, 궁합, 관상 결과를 확인하세요. 모든 분석 기록이 저장되어 있습니다.',
    alternates: {
      canonical: `${baseUrl}${prefix}/history`,
      languages: {
        'ko-KR': `${baseUrl}/history`,
        'en-US': `${baseUrl}/en/history`,
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function HistoryPage() {
  const t = await getTranslations("history");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let results: any[] = [];

  if (user) {
    const { results: sajuResults } = await getUserSajuResults(user.id);
    results = sajuResults;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#22c55e] text-sm font-medium tracking-wider">
          分析記錄
        </p>
        <h1 className="text-2xl font-bold text-white">
          {t("title")}
        </h1>
      </div>

      {results.length > 0 ? (
        <HistoryList results={results} />
      ) : (
        <EmptyHistory />
      )}
    </div>
  );
}
