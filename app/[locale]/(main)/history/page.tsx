import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserSajuResults,
  getUserCompatibilityResults,
  getUserCoupleResults,
  getUserFaceReadingResults,
} from "@/lib/supabase/usage";
import { HistoryList } from "./history-list";
import { EmptyHistory } from "./empty-history";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export type HistoryItemType = 'saju' | 'compatibility' | 'couple' | 'face-reading';

export interface UnifiedHistoryItem {
  id: string;
  type: HistoryItemType;
  createdAt: string;
  // Saju specific
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  gender?: string;
  isLunar?: boolean;
  city?: string;
  // Compatibility/Couple specific
  person1Name?: string;
  person2Name?: string;
  relationType?: string;
  // Face-reading specific
  label?: string;
  // Local storage flag
  isLocal?: boolean;
}

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

  let results: UnifiedHistoryItem[] = [];

  if (user) {
    // Fetch all result types in parallel
    const [sajuData, compatibilityData, coupleData, faceReadingData] = await Promise.all([
      getUserSajuResults(user.id),
      getUserCompatibilityResults(user.id),
      getUserCoupleResults(user.id),
      getUserFaceReadingResults(user.id),
    ]);

    // Convert saju results to unified format
    const sajuItems: UnifiedHistoryItem[] = sajuData.results.map((r: any) => ({
      id: r.id,
      type: 'saju' as const,
      createdAt: r.created_at,
      birthYear: r.birth_year,
      birthMonth: r.birth_month,
      birthDay: r.birth_day,
      gender: r.gender,
      isLunar: r.is_lunar,
      city: r.city,
    }));

    // Convert compatibility results to unified format
    const compatibilityItems: UnifiedHistoryItem[] = compatibilityData.results.map((r: any) => ({
      id: r.id,
      type: 'compatibility' as const,
      createdAt: r.created_at,
      person1Name: r.p1_name,
      person2Name: r.p2_name,
      relationType: r.relation_type,
    }));

    // Convert couple results to unified format
    const coupleItems: UnifiedHistoryItem[] = coupleData.results.map((r: any) => ({
      id: r.id,
      type: 'couple' as const,
      createdAt: r.created_at,
      person1Name: r.p1_name,
      person2Name: r.p2_name,
      relationType: r.relation_type,
    }));

    // Convert face-reading results to unified format
    const faceReadingItems: UnifiedHistoryItem[] = faceReadingData.results.map((r: any) => ({
      id: r.id,
      type: 'face-reading' as const,
      createdAt: r.created_at,
      gender: r.gender,
      label: r.label,
    }));

    // Combine and sort by date
    results = [...sajuItems, ...compatibilityItems, ...coupleItems, ...faceReadingItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#C4A35A] text-sm font-medium tracking-wider">
          分析記錄
        </p>
        <h1 className="text-2xl font-bold text-gray-800">
          {t("title")}
        </h1>
      </div>

      <HistoryList initialResults={results} isAuthenticated={!!user} />
    </div>
  );
}
