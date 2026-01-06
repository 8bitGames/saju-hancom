"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkle,
  Calendar,
  MapPin,
  User,
  Users,
  Heart,
  Eye,
  Briefcase,
  CloudArrowUp,
} from "@phosphor-icons/react";
import { Link } from "@/lib/i18n/navigation";
import type { UnifiedHistoryItem, HistoryItemType } from "./page";
import { getLocalHistory, type LocalHistoryItem, type LocalSajuHistory, type LocalCompatibilityHistory, type LocalCoupleHistory, type LocalFaceReadingHistory } from "@/lib/local-history";
import { EmptyHistory } from "./empty-history";

interface HistoryListProps {
  initialResults: UnifiedHistoryItem[];
  isAuthenticated: boolean;
}

const typeConfig: Record<HistoryItemType, {
  icon: typeof Sparkle;
  color: string;
  bgColor: string;
  gradient: string;
}> = {
  saju: {
    icon: Sparkle,
    color: "#a855f7",
    bgColor: "bg-[#a855f7]/20",
    gradient: "from-[#a855f7] to-[#6366f1]",
  },
  compatibility: {
    icon: Briefcase,
    color: "#22c55e",
    bgColor: "bg-[#22c55e]/20",
    gradient: "from-[#22c55e] to-[#16a34a]",
  },
  couple: {
    icon: Heart,
    color: "#ec4899",
    bgColor: "bg-[#ec4899]/20",
    gradient: "from-[#ec4899] to-[#f43f5e]",
  },
  "face-reading": {
    icon: Eye,
    color: "#f59e0b",
    bgColor: "bg-[#f59e0b]/20",
    gradient: "from-[#f59e0b] to-[#d97706]",
  },
};

function convertLocalToUnified(item: LocalHistoryItem): UnifiedHistoryItem {
  const base = {
    id: item.id,
    createdAt: item.createdAt,
    isLocal: true,
  };

  switch (item.type) {
    case 'saju': {
      const saju = item as LocalSajuHistory;
      return {
        ...base,
        type: 'saju',
        birthYear: saju.birthData.year,
        birthMonth: saju.birthData.month,
        birthDay: saju.birthData.day,
        gender: saju.birthData.gender,
        isLunar: saju.birthData.isLunar,
        city: saju.birthData.city,
      };
    }
    case 'compatibility': {
      const compat = item as LocalCompatibilityHistory;
      return {
        ...base,
        type: 'compatibility',
        person1Name: compat.person1.name,
        person2Name: compat.person2.name,
        relationType: compat.relationType,
      };
    }
    case 'couple': {
      const couple = item as LocalCoupleHistory;
      return {
        ...base,
        type: 'couple',
        person1Name: couple.person1.name,
        person2Name: couple.person2.name,
        relationType: couple.relationType,
      };
    }
    case 'face-reading': {
      const face = item as LocalFaceReadingHistory;
      return {
        ...base,
        type: 'face-reading',
        gender: face.gender,
        label: face.label,
      };
    }
    default:
      return { ...base, type: 'saju' };
  }
}

export function HistoryList({ initialResults, isAuthenticated }: HistoryListProps) {
  const t = useTranslations("history");
  const [results, setResults] = useState<UnifiedHistoryItem[]>(initialResults);
  const [isLoading, setIsLoading] = useState(!isAuthenticated);

  // For non-authenticated users, load from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const localItems = getLocalHistory();
      const convertedItems = localItems.map(convertLocalToUnified);
      setResults(convertedItems);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatBirthDate = (item: UnifiedHistoryItem) => {
    if (item.birthYear && item.birthMonth && item.birthDay) {
      return `${item.birthYear}.${item.birthMonth}.${item.birthDay}`;
    }
    return null;
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return "";
    return gender === "male" ? t("male") : t("female");
  };

  const getTypeLabel = (type: HistoryItemType) => {
    const labels: Record<HistoryItemType, string> = {
      saju: t("sajuAnalysis"),
      compatibility: t("compatibilityAnalysis"),
      couple: t("coupleAnalysis"),
      "face-reading": t("faceReading"),
    };
    return labels[type];
  };

  const getRelationTypeLabel = (relationType?: string) => {
    if (!relationType) return "";
    const labels: Record<string, string> = {
      "boss-employee": "상사-부하",
      "colleague": "동료",
      "business-partner": "비즈니스 파트너",
      "mentor-mentee": "멘토-멘티",
      "senior-junior": "선배-후배",
      "friend": "친구",
      "family": "가족",
      "dating": "연인",
      "married": "부부",
      "potential": "관심 상대",
    };
    return labels[relationType] || relationType;
  };

  const getItemLink = (item: UnifiedHistoryItem): string => {
    // For local items, we need to reconstruct the query params
    if (item.isLocal) {
      switch (item.type) {
        case 'saju':
          return `/saju/result?year=${item.birthYear}&month=${item.birthMonth}&day=${item.birthDay}&hour=12&minute=0&gender=${item.gender}&isLunar=${item.isLunar}&city=${encodeURIComponent(item.city || 'Seoul')}`;
        case 'compatibility':
        case 'couple':
        case 'face-reading':
          // For these types, local storage doesn't have enough context for result page
          // Just show the local ID, user would need to re-run analysis
          return `#`;
        default:
          return '#';
      }
    }

    // For DB items
    switch (item.type) {
      case 'saju':
        return `/history/${item.id}`;
      case 'compatibility':
        return `/compatibility/history/${item.id}`;
      case 'couple':
        return `/couple/history/${item.id}`;
      case 'face-reading':
        return `/face-reading/history/${item.id}`;
      default:
        return '#';
    }
  };

  const renderItemContent = (item: UnifiedHistoryItem) => {
    const config = typeConfig[item.type];
    const IconComponent = config.icon;

    switch (item.type) {
      case 'saju':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Calendar className="w-4 h-4 text-white/40" />
                <span>{formatBirthDate(item)}</span>
                {item.isLunar && (
                  <span className="text-xs text-white/40">({t("lunar")})</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-white/40" />
                  <span>{getGenderLabel(item.gender)}</span>
                </div>
                {item.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-white/40" />
                    <span>{item.city}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'compatibility':
      case 'couple':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Users className="w-4 h-4 text-white/40" />
                <span>{item.person1Name || "사람 1"}</span>
                <span className="text-white/40">&</span>
                <span>{item.person2Name || "사람 2"}</span>
              </div>
              {item.relationType && (
                <div className="text-sm text-white/60">
                  {getRelationTypeLabel(item.relationType)}
                </div>
              )}
            </div>
          </>
        );

      case 'face-reading':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <User className="w-4 h-4 text-white/40" />
                <span>{getGenderLabel(item.gender)}</span>
              </div>
              {item.label && (
                <div className="text-sm text-white/60">
                  {item.label}
                </div>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#a855f7] rounded-full animate-spin" />
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60 px-1">
        {t("resultCount", { count: results.length })}
      </p>

      <div className="space-y-3">
        {results.map((item) => {
          const config = typeConfig[item.type];
          const IconComponent = config.icon;
          const link = getItemLink(item);
          const isClickable = link !== '#';

          const content = (
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-6 h-6 text-white" weight="fill" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor}`} style={{ color: config.color }}>
                    {getTypeLabel(item.type)}
                  </span>
                  {item.isLocal && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 flex items-center gap-1">
                      <CloudArrowUp className="w-3 h-3" />
                      {t("localOnly")}
                    </span>
                  )}
                </div>

                {renderItemContent(item)}

                <p className="text-xs text-white/40 mt-3">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          );

          if (isClickable) {
            return (
              <Link
                key={item.id}
                href={link}
                className="block bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-[#a855f7]/50 transition-colors"
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              className="block bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 opacity-70"
            >
              {content}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/40 px-4 pt-4">
        {isAuthenticated ? t("savedToAccount") : t("savedLocally")}
      </p>
    </div>
  );
}
