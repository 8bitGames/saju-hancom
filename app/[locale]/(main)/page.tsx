"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Sparkle, Camera, ArrowRight, Star, Handshake } from "@/components/ui/icons";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { FlipWords } from "@/components/aceternity/flip-words";
import { Spotlight } from "@/components/aceternity/spotlight";
import { MovingBorder } from "@/components/aceternity/moving-border";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";
import {
  GlowingStarsBackgroundCard,
  GlowingStarsTitle,
  GlowingStarsDescription,
} from "@/components/aceternity/glowing-stars";
import { Meteors } from "@/components/aceternity/meteors";

export default function HomePage() {
  const t = useTranslations("home");
  const tElements = useTranslations("home.elements");

  const words = t.raw("flipWords") as string[];

  return (
    <div className="relative min-h-screen">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="var(--accent)"
      />

      <div className="space-y-8 sm:space-y-12 relative z-10">
        {/* Hero Section with Premium Effects */}
        <section className="relative text-center space-y-4 sm:space-y-6 py-10 sm:py-16 overflow-hidden">
          {/* Sparkles Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="hero-sparkles"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={70}
              particleColor="var(--accent)"
              className="w-full h-full"
            />
          </div>

          {/* Gradient Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)]" />

          {/* Main Icon with Background Gradient */}
          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center">
                <Star className="w-10 h-10 sm:w-14 sm:h-14 text-white" weight="fill" />
              </div>
            </BackgroundGradient>
          </div>

          {/* Animated Title */}
          <div className="relative z-10 space-y-3 sm:space-y-4 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              {t("title")}
            </h1>

            {/* Flip Words Effect */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)]">
              <span>{t("subtitle")}</span>
              <FlipWords words={words} className="text-[var(--accent)]" />
              <span>{t("subtitleSuffix")}</span>
            </div>

            {/* Text Generate Effect */}
            <TextGenerateEffect
              words={t("description")}
              className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-md mx-auto"
              duration={0.3}
            />
          </div>
        </section>

        {/* Feature Cards with Premium Effects */}
        <section className="space-y-4 sm:space-y-6 px-1">
          {/* Saju Card with Glowing Stars */}
          <Link href="/saju" className="block group">
            <GlowingStarsBackgroundCard className="relative overflow-hidden">
              <Meteors number={10} />
              <div className="relative z-10">
                <div className="flex items-start gap-3 sm:gap-5 p-1 sm:p-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-[var(--element-wood)] to-[var(--element-fire)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Sparkle className="w-6 h-6 sm:w-8 sm:h-8 text-white" weight="fill" />
                  </div>
                  <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <GlowingStarsTitle>{t("cards.saju.title")}</GlowingStarsTitle>
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-2 transition-all duration-300 flex-shrink-0" />
                    </div>
                    <GlowingStarsDescription>
                      {t("cards.saju.description")}
                    </GlowingStarsDescription>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 sm:pt-3">
                      <span className="element-badge element-badge-wood">{tElements("wood")}</span>
                      <span className="element-badge element-badge-fire">{tElements("fire")}</span>
                      <span className="element-badge element-badge-earth">{tElements("earth")}</span>
                      <span className="element-badge element-badge-metal">{tElements("metal")}</span>
                      <span className="element-badge element-badge-water">{tElements("water")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlowingStarsBackgroundCard>
          </Link>

          {/* Person Compatibility Card with Moving Border */}
          <Link href="/compatibility" className="block group">
            <MovingBorder
              duration={3000}
              className="p-4 sm:p-6 rounded-lg sm:rounded-xl"
              containerClassName="w-full"
              rx="12px"
              ry="12px"
            >
              <div className="flex items-start gap-3 sm:gap-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-[var(--element-water)] to-[var(--accent)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Handshake className="w-6 h-6 sm:w-8 sm:h-8 text-white" weight="fill" />
                </div>
                <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                      {t("cards.compatibility.title")}
                    </h2>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-2 transition-all duration-300 flex-shrink-0" />
                  </div>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {t("cards.compatibility.description")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)] flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                      <Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" weight="fill" />
                      {t("cards.compatibility.colleague")}
                    </span>
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)] text-xs sm:text-sm text-[var(--text-secondary)]">
                      {t("cards.compatibility.boss")}
                    </span>
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)] text-xs sm:text-sm text-[var(--text-secondary)]">
                      {t("cards.compatibility.partner")}
                    </span>
                  </div>
                </div>
              </div>
            </MovingBorder>
          </Link>

          {/* Face Reading Card with Background Gradient */}
          <Link href="/face-reading" className="block group">
            <BackgroundGradient className="rounded-lg sm:rounded-xl p-4 sm:p-6" containerClassName="w-full">
              <div className="flex items-start gap-3 sm:gap-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-[var(--element-metal)] to-[var(--element-water)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                      {t("cards.faceReading.title")}
                    </h2>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-2 transition-all duration-300 flex-shrink-0" />
                  </div>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {t("cards.faceReading.description")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-xs sm:text-sm text-[var(--text-secondary)]">
                      {t("cards.faceReading.forehead")}
                    </span>
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-xs sm:text-sm text-[var(--text-secondary)]">
                      {t("cards.faceReading.eyes")}
                    </span>
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-xs sm:text-sm text-[var(--text-secondary)]">
                      {t("cards.faceReading.nose")}
                    </span>
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-xs sm:text-sm text-[var(--text-secondary)]">
                      {t("cards.faceReading.mouth")}
                    </span>
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </Link>
        </section>

        {/* Quick Start Button with Hover Border Gradient */}
        <section className="pt-2 sm:pt-4 px-1">
          <Link href="/saju" className="block">
            <HoverBorderGradient
              containerClassName="w-full rounded-lg sm:rounded-xl"
              className="w-full h-12 sm:h-16 flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-xl"
              as="div"
            >
              <Sparkle className="w-5 h-5 sm:w-6 sm:h-6" weight="fill" />
              {t("startAnalysis")}
            </HoverBorderGradient>
          </Link>
        </section>

        {/* Info Footer with Text Generate Effect */}
        <section className="text-center text-xs sm:text-sm text-[var(--text-tertiary)] space-y-1 sm:space-y-2 pt-4 sm:pt-6 pb-6 sm:pb-8 px-4">
          <p>{t("footer1")}</p>
          <p>{t("footer2")}</p>
        </section>
      </div>
    </div>
  );
}
