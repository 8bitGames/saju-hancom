"use client";

import { useTranslations } from "next-intl";
import {
  FeatureCarousel,
  FeatureCard,
} from "@/components/ui/feature-carousel";

export default function HomePage() {
  const t = useTranslations("home");

  const featureCards: FeatureCard[] = [
    {
      id: "saju",
      title: t("cards.saju.title"),
      subtitle: "四柱八字",
      description: t("cards.saju.description"),
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

  return <FeatureCarousel cards={featureCards} />;
}
