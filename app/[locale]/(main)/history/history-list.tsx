"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
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
  FunnelSimple,
} from "@phosphor-icons/react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import type { UnifiedHistoryItem, HistoryItemType } from "./page";
import { getLocalHistory, type LocalHistoryItem, type LocalSajuHistory, type LocalCompatibilityHistory, type LocalCoupleHistory, type LocalFaceReadingHistory } from "@/lib/local-history";
import { EmptyHistory } from "./empty-history";

type FilterType = "all" | HistoryItemType;

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
    color: "#C4A35A",
    bgColor: "bg-[#C4A35A]/10",
    gradient: "from-[#C4A35A] to-[#a88f4a]",
  },
  compatibility: {
    icon: Briefcase,
    color: "#22c55e",
    bgColor: "bg-[#22c55e]/10",
    gradient: "from-[#22c55e] to-[#16a34a]",
  },
  couple: {
    icon: Heart,
    color: "#ec4899",
    bgColor: "bg-[#ec4899]/10",
    gradient: "from-[#ec4899] to-[#f43f5e]",
  },
  "face-reading": {
    icon: Eye,
    color: "#f59e0b",
    bgColor: "bg-[#f59e0b]/10",
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

// Filter tabs configuration
const filterTabs: { key: FilterType; label: string; icon: typeof Sparkle; color: string }[] = [
  { key: "all", label: "전체", icon: FunnelSimple, color: "#C4A35A" },
  { key: "saju", label: "사주", icon: Sparkle, color: "#C4A35A" },
  { key: "compatibility", label: "궁합", icon: Briefcase, color: "#22c55e" },
  { key: "couple", label: "커플", icon: Heart, color: "#ec4899" },
  { key: "face-reading", label: "관상", icon: Eye, color: "#f59e0b" },
];

export function HistoryList({ initialResults, isAuthenticated }: HistoryListProps) {
  const t = useTranslations("history");
  const [results, setResults] = useState<UnifiedHistoryItem[]>(initialResults);
  const [isLoading, setIsLoading] = useState(!isAuthenticated);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // For non-authenticated users, load from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const localItems = getLocalHistory();
      const convertedItems = localItems.map(convertLocalToUnified);
      setResults(convertedItems);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Filter results based on active filter
  const filteredResults = activeFilter === "all"
    ? results
    : results.filter((item) => item.type === activeFilter);

  // Count items per type
  const typeCounts: Record<FilterType, number> = {
    all: results.length,
    saju: results.filter((r) => r.type === "saju").length,
    compatibility: results.filter((r) => r.type === "compatibility").length,
    couple: results.filter((r) => r.type === "couple").length,
    "face-reading": results.filter((r) => r.type === "face-reading").length,
  };

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
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatBirthDate(item)}</span>
                {item.isLunar && (
                  <span className="text-xs text-gray-400">({t("lunar")})</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{getGenderLabel(item.gender)}</span>
                </div>
                {item.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
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
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{item.person1Name || "사람 1"}</span>
                <span className="text-gray-400">&</span>
                <span>{item.person2Name || "사람 2"}</span>
              </div>
              {item.relationType && (
                <div className="text-sm text-gray-500">
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
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span>{getGenderLabel(item.gender)}</span>
              </div>
              {item.label && (
                <div className="text-sm text-gray-500">
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
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#C4A35A] rounded-full animate-spin" />
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.key;
          const count = typeCounts[tab.key];

          // Don't show empty tabs (except "all")
          if (tab.key !== "all" && count === 0) return null;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                isActive
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              style={{
                backgroundColor: isActive ? tab.color : undefined,
              }}
            >
              <Icon className="w-4 h-4" weight={isActive ? "fill" : "regular"} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/20" : "bg-gray-200"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 px-1">
        {t("resultCount", { count: filteredResults.length })}
      </p>

      {/* Results List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              해당 유형의 기록이 없습니다
            </div>
          ) : (
            filteredResults.map((item) => {
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
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                      <CloudArrowUp className="w-3 h-3" />
                      {t("localOnly")}
                    </span>
                  )}
                </div>

                {renderItemContent(item)}

                <p className="text-xs text-gray-400 mt-3">
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
                className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-[#C4A35A]/50 hover:shadow-md transition-all"
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm opacity-70"
            >
              {content}
            </div>
          );
        })
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-xs text-gray-400 px-4 pt-4">
        {isAuthenticated ? t("savedToAccount") : t("savedLocally")}
      </p>
    </div>
  );
}
