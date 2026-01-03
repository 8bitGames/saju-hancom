"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import {
  FeatureCarousel,
  FeatureCard,
} from "@/components/ui/feature-carousel";
import { checkFortuneEligibility } from "@/lib/actions/saju";
import { getCurrentYearPillarName } from "@/lib/saju/constants";

export default function HomePage() {
  const t = useTranslations("home");
  const [isLoading, setIsLoading] = useState(true);
  const [fortuneData, setFortuneData] = useState<{
    eligible: boolean;
    shareId?: string;
  } | null>(null);

  // 현재 연도의 간지 이름 (병오년, 정미년 등)
  const yearName = useMemo(() => getCurrentYearPillarName(), []);

  // Check fortune eligibility on mount
  useEffect(() => {
    checkFortuneEligibility()
      .then(setFortuneData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const baseCards: FeatureCard[] = [
    {
      id: "saju",
      title: t("cards.saju.title"),
      subtitle: "四柱八字",
      description: t("cards.saju.description", { yearName }),
      href: "/saju",
      video: "/output-loop/saju-four-pillars-loop.mp4",
      poster: "/images/saju-cover.jpg",
      theme: {
        primary: "#1a1033",
        secondary: "#2d1b4e",
        accent: "#a855f7",
      },
    },
    {
      id: "compatibility",
      title: t("cards.compatibility.title"),
      subtitle: "宮合分析",
      description: t("cards.compatibility.description"),
      href: "/compatibility",
      video: "/output-loop/workplace-fortune-loop.mp4",
      poster: "/images/workplace-cover.jpg",
      theme: {
        primary: "#0c1929",
        secondary: "#162d4a",
        accent: "#3b82f6",
      },
    },
    {
      id: "couple",
      title: t("cards.couple.title"),
      subtitle: "緣分分析",
      description: t("cards.couple.description"),
      href: "/couple",
      video: "/output-loop/love-compatibility-loop.mp4",
      poster: "/images/compatibility-cover.jpg",
      theme: {
        primary: "#1a0a1a",
        secondary: "#2d1533",
        accent: "#ec4899",
      },
    },
    {
      id: "face-reading",
      title: t("cards.faceReading.title"),
      subtitle: "觀相分析",
      description: t("cards.faceReading.description"),
      href: "/face-reading",
      video: "/output-loop/face-reading-loop.mp4",
      poster: "/images/face-reading-cover.jpg",
      theme: {
        primary: "#1f1a1a",
        secondary: "#3d2929",
        accent: "#ef4444",
      },
    },
    {
      id: "history",
      title: t("cards.history.title"),
      subtitle: "分析記錄",
      description: t("cards.history.description"),
      href: "/history",
      video: "/output-loop/saju-history-loop.mp4",
      poster: "/images/history-cover.jpg",
      theme: {
        primary: "#0f1f1a",
        secondary: "#1a3329",
        accent: "#22c55e",
      },
    },
  ];

  // Build feature cards with fortune card at the top if eligible
  const featureCards: FeatureCard[] = [
    // Fortune card only shows when user has completed all detail analyses
    ...(fortuneData?.eligible && fortuneData?.shareId
      ? [
          {
            id: "fortune",
            title: t("cards.fortune.title"),
            subtitle: "今日運勢",
            description: t("cards.fortune.description"),
            href: `/saju/today-fortune?shareId=${fortuneData.shareId}`,
            video: "/output-loop/saju-four-pillars-loop.mp4",
            poster: "/images/saju-cover.jpg",
            theme: {
              primary: "#1a0f2e",
              secondary: "#2d1b4e",
              accent: "#fbbf24",
            },
          } as FeatureCard,
        ]
      : []),
    ...baseCards,
  ];

  // Show loading state while checking fortune eligibility
  // This prevents the jarring experience of cards shifting after load
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0f0a1a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <FeatureCarousel cards={featureCards} />;
}
