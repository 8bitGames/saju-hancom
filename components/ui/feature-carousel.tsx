"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@/components/ui/icons";
import { StarsBackground } from "@/components/aceternity/stars-background";
import { ShootingStars } from "@/components/aceternity/shooting-stars";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { CompanyModal } from "@/components/layout/company-modal";
import { Buildings, ClockCounterClockwise } from "@phosphor-icons/react";

export interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image?: string;
  video?: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface FeatureCarouselProps {
  cards: FeatureCard[];
  className?: string;
}

export function FeatureCarousel({ cards, className }: FeatureCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("header");
  const locale = useLocale();

  // Detect which card is in view (horizontal scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), cards.length - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [cards.length]);

  // Control video playback - only play the active video
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        video.play().catch(() => {
          // Autoplay might be blocked, ignore error
        });
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  const activeTheme = cards[activeIndex]?.theme;

  return (
    <>
      {/*
        Stars Background Layer
        - Uses fixed large height (not viewport-based) for iOS Safari
        - 1200px minimum covers all phone screens including URL bar states
      */}
      <div
        className="fixed top-0 left-0 right-0 z-0 pointer-events-none overflow-hidden"
        style={{
          height: '1200px',
          minHeight: '100vh',
          background: '#0f0a1a',
        }}
      >
        <StarsBackground
          starDensity={0.0004}
          allStarsTwinkle
          twinkleProbability={0.8}
        />
        <ShootingStars
          starColor={activeTheme?.accent || "#8b5cf6"}
          trailColor={activeTheme?.accent || "#8b5cf6"}
          minDelay={1500}
          maxDelay={4000}
        />
      </div>

      {/* Background Glow Effect */}
      <div
        className="fixed inset-0 opacity-30 transition-all duration-700 pointer-events-none z-[1]"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${activeTheme?.accent || "#8b5cf6"}40, transparent 70%)`,
        }}
      />

      <div className={cn("relative h-screen h-dvh w-full", className)}>
        {/* Branding - Top Left */}
        <div className="fixed top-6 left-6 z-50">
          <span
            className="text-white font-bold text-4xl sm:text-5xl"
            style={{
              fontFamily: locale === "ko" ? "var(--font-noto-sans-kr), sans-serif" : "var(--font-geist-mono), monospace",
            }}
          >
            {t("title")}
          </span>
        </div>

        {/* Top Right Controls */}
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsCompanyModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white"
            aria-label="About"
          >
            <Buildings className="w-5 h-5" weight="bold" />
          </button>
          <button
            onClick={() => router.push("/history")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white"
            aria-label="History"
          >
            <ClockCounterClockwise className="w-5 h-5" weight="bold" />
          </button>
          <LanguageToggle />
        </div>

        {/* Company Modal */}
        <CompanyModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
        />

        {/* Horizontal Cards Container - horizontal scroll only */}
        <div
          ref={containerRef}
          className="relative z-10 h-screen h-dvh flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            touchAction: "pan-x",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="w-screen h-screen h-dvh flex-shrink-0 snap-center flex items-center justify-center px-4 pt-16 pb-12"
            >
              <div
                onClick={() => handleCardClick(card.href)}
                className="relative w-full max-w-sm h-[85vh] max-h-[780px] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02]"
                style={{
                  boxShadow: `0 25px 60px -15px ${activeTheme?.accent}50, 0 10px 30px -10px rgba(0,0,0,0.5)`,
                }}
              >
                {/* Card Media (Video or Image) */}
                <div className="absolute inset-0">
                  {card.video ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={card.video}
                      loop
                      muted
                      playsInline
                      preload={index === 0 ? "auto" : "metadata"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : card.image ? (
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority={index === 0}
                    />
                  ) : null}
                  {/* Gradient Overlay - Strong for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
                </div>

                {/* Card Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  {/* Text */}
                  <p
                    className="font-semibold mb-3 tracking-wide"
                    style={{
                      color: card.theme.accent,
                      fontSize: locale === "ko" ? "1.5rem" : "0.875rem",
                    }}
                  >
                    {card.subtitle}
                  </p>
                  <h2
                    className="font-bold text-white mb-4 leading-tight"
                    style={{
                      fontSize: locale === "ko" ? "2.5rem" : "1.5rem",
                    }}
                  >
                    {card.title}
                  </h2>
                  <p
                    className="text-white/75 leading-relaxed mb-6 line-clamp-3"
                    style={{
                      fontSize: locale === "ko" ? "1.25rem" : "0.875rem",
                    }}
                  >
                    {card.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 group-hover:gap-3 w-fit"
                    style={{
                      background: `linear-gradient(135deg, ${card.theme.accent}, ${card.theme.accent}cc)`,
                      boxShadow: `0 4px 15px ${card.theme.accent}40`,
                    }}
                  >
                    <span>{t("start")}</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Hover Border Glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 0 2px ${card.theme.accent}80`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Hide scrollbar CSS */}
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
}
