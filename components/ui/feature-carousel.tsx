"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@/components/ui/icons";
import { StarsBackground } from "@/components/aceternity/stars-background";
import { ShootingStars } from "@/components/aceternity/shooting-stars";
import { CompanyModal } from "@/components/layout/company-modal";
import { Buildings, ClockCounterClockwise, List, X, Globe } from "@phosphor-icons/react";
import { usePathname, useRouter as useI18nRouter } from "@/lib/i18n/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image?: string;
  video?: string;
  poster?: string; // Thumbnail image for video
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  // Track which videos should be loaded (near viewport)
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0]));
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const pathname = usePathname();
  const t = useTranslations("header");
  const locale = useLocale() as Locale;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsLanguageExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    i18nRouter.replace(pathname, { locale: newLocale });
    setIsMenuOpen(false);
    setIsLanguageExpanded(false);
  };

  // Handle mobile viewport height (accounts for browser chrome)
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport for more accurate height on iOS Chrome/Safari
      const height = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(height);
    };

    updateViewportHeight();

    // Listen to multiple events for cross-browser compatibility
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    // visualViewport resize is most reliable on iOS
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewportHeight);
      window.visualViewport.addEventListener("scroll", updateViewportHeight);
    }

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateViewportHeight);
        window.visualViewport.removeEventListener("scroll", updateViewportHeight);
      }
    };
  }, []);

  // Detect which card is in view (horizontal scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      // 카드 너비가 85vw이므로 그에 맞게 계산
      const cardWidth = window.innerWidth * 0.85;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), cards.length - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [cards.length]);

// Intersection Observer for lazy loading videos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setLoadedVideos((prev) => {
              const newSet = new Set(prev);
              // Also preload adjacent cards
              newSet.add(index);
              if (index > 0) newSet.add(index - 1);
              if (index < cards.length - 1) newSet.add(index + 1);
              return newSet;
            });
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: "100px", // Preload when 100px away
        threshold: 0.1,
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [cards.length]);

  // 도트 클릭 시 해당 카드로 스크롤
  const scrollToCard = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = window.innerWidth * 0.85;
    container.scrollTo({
      left: cardWidth * index,
      behavior: "smooth",
    });
  };

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
        - Anchored to bottom to ensure coverage on iOS Safari
        - Extends upward from bottom to cover entire screen
      */}
      <div
        className="fixed left-0 right-0 z-0 pointer-events-none overflow-hidden"
        style={{
          top: '-100px',
          bottom: 0,
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

      <div
        className={cn("relative w-full", className)}
        style={{ height: viewportHeight ? `${viewportHeight}px` : "100dvh" }}
      >
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

        {/* Top Right Hamburger Menu */}
        <div className="fixed top-6 right-6 z-50" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white"
            aria-label={t("menu")}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" weight="bold" />
            ) : (
              <List className="w-5 h-5" weight="bold" />
            )}
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden animate-fade-in">
              {/* About / Company */}
              <button
                onClick={() => {
                  setIsCompanyModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Buildings className="w-5 h-5" weight="bold" />
                <span className="text-sm font-medium">{t("about")}</span>
              </button>

              {/* History / Record */}
              <button
                onClick={() => {
                  router.push("/history");
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors border-t border-white/10"
              >
                <ClockCounterClockwise className="w-5 h-5" weight="bold" />
                <span className="text-sm font-medium">{t("record")}</span>
              </button>

              {/* Language */}
              <div className="border-t border-white/10">
                <button
                  onClick={() => setIsLanguageExpanded(!isLanguageExpanded)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Globe className="w-5 h-5" weight="bold" />
                  <span className="text-sm font-medium">{t("language")}</span>
                  <span className="ml-auto text-xs text-white/50">{localeNames[locale]}</span>
                </button>

                {/* Language Options */}
                {isLanguageExpanded && (
                  <div className="bg-white/5">
                    {locales.map((l) => (
                      <button
                        key={l}
                        onClick={() => switchLocale(l)}
                        className={`w-full px-4 py-2 pl-12 text-left text-sm transition-colors ${
                          l === locale
                            ? "text-purple-400 font-medium bg-purple-500/10"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                        }`}
                      >
                        {localeNames[l]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Company Modal */}
        <CompanyModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
        />

        {/* Horizontal Cards Container - horizontal scroll only */}
        <div
          ref={containerRef}
          className="relative z-10 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{
            height: viewportHeight ? `${viewportHeight}px` : "100dvh",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            touchAction: "pan-x",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="flex-shrink-0 snap-center flex items-end justify-center pb-safe"
              style={{
                // 카드 너비를 85%로 해서 옆 카드가 살짝 보이게
                width: "85vw",
                height: viewportHeight ? `${viewportHeight}px` : "100dvh",
                paddingTop: "80px",
                paddingBottom: "70px", // 도트 공간 확보
                paddingLeft: index === 0 ? "calc(7.5vw)" : "2.5vw",
                paddingRight: index === cards.length - 1 ? "calc(7.5vw)" : "2.5vw",
              }}
            >
              <div
                onClick={() => handleCardClick(card.href)}
                className="relative w-full max-w-sm rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02]"
                style={{
                  height: viewportHeight ? `${Math.min(viewportHeight - 150, 680)}px` : "calc(100dvh - 150px)",
                  maxHeight: "680px",
                  boxShadow: `0 25px 60px -15px ${activeTheme?.accent}50, 0 10px 30px -10px rgba(0,0,0,0.5)`,
                }}
              >
                {/* Card Media (Video or Image) */}
                <div className="absolute inset-0">
                  {card.video && loadedVideos.has(index) ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={card.video}
                      poster={card.poster || card.image}
                      loop
                      muted
                      playsInline
                      preload={index === 0 ? "auto" : "metadata"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : card.video && !loadedVideos.has(index) && card.poster ? (
                    // Show poster image while video is not loaded
                    <Image
                      src={card.poster}
                      alt={card.title}
                      fill
                      unoptimized
                      priority={index === 0}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
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
                    <span>{card.id === "history" ? t("view") : t("start")}</span>
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

        {/* Mystical Navigation */}
        <div
          className="fixed left-0 right-0 z-50 flex justify-center items-center"
          style={{ bottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}
        >
          <div className="relative flex items-center gap-5">
            {/* Connecting Line */}
            <div
              className="absolute top-1/2 left-3 right-3 h-[1px] -translate-y-1/2 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, ${activeTheme?.accent}30 20%, ${activeTheme?.accent}30 80%, transparent)`,
              }}
            />

            {cards.map((card, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={card.id}
                  onClick={() => scrollToCard(index)}
                  className="relative flex items-center justify-center w-7 h-7"
                  aria-label={`${card.title}로 이동`}
                >
                  {/* Outer Glow Ring for Active */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute rounded-full"
                        style={{
                          width: 28,
                          height: 28,
                          background: `radial-gradient(circle, ${card.theme.accent}50 0%, transparent 70%)`,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Orbiting Particles for Active */}
                  <AnimatePresence>
                    {isActive && (
                      <>
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full"
                            style={{ backgroundColor: card.theme.accent }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: [0, 0.8, 0],
                              scale: [0.5, 1, 0.5],
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{
                              duration: 2,
                              delay: i * 0.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{
                              backgroundColor: card.theme.accent,
                              left: `calc(50% + ${Math.cos((i * 120 * Math.PI) / 180) * 14}px)`,
                              top: `calc(50% + ${Math.sin((i * 120 * Math.PI) / 180) * 14}px)`,
                              transform: "translate(-50%, -50%)",
                              boxShadow: `0 0 4px ${card.theme.accent}`,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>

                  {/* Star Core */}
                  <motion.div
                    className="relative rounded-full"
                    animate={{
                      scale: isActive ? [1, 1.15, 1] : 1,
                      width: isActive ? 10 : 6,
                      height: isActive ? 10 : 6,
                      backgroundColor: isActive ? card.theme.accent : "rgba(255,255,255,0.4)",
                    }}
                    transition={{
                      scale: {
                        duration: 2,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut",
                      },
                      width: { type: "spring", stiffness: 300, damping: 30 },
                      height: { type: "spring", stiffness: 300, damping: 30 },
                      backgroundColor: { duration: 0.3 },
                    }}
                    style={{
                      boxShadow: isActive
                        ? `0 0 10px ${card.theme.accent}, 0 0 20px ${card.theme.accent}80`
                        : "none",
                    }}
                  >
                    {/* Inner Shine */}
                    <motion.div
                      className="absolute inset-[2px] rounded-full bg-white/70"
                      animate={{ opacity: isActive ? 0.8 : 0.3 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hide scrollbar CSS and safe area support */}
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .pb-safe {
              padding-bottom: max(70px, calc(env(safe-area-inset-bottom) + 40px)) !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
