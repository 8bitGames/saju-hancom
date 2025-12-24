"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CaretLeft, Buildings, ClockCounterClockwise, List, X, Globe, House } from "@phosphor-icons/react";
import { StarsBackground } from "@/components/aceternity/stars-background";
import { ShootingStars } from "@/components/aceternity/shooting-stars";
import { CompanyModal } from "@/components/layout/company-modal";
import { usePathname, useRouter as useI18nRouter } from "@/lib/i18n/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations("header");
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          starColor="#a855f7"
          trailColor="#a855f7"
          minDelay={2000}
          maxDelay={5000}
        />
      </div>

      {/* Main Page Container */}
      <div className="relative z-10 min-h-screen min-h-dvh">
        {/* Branding - Top Left */}
        <div className="fixed top-4 sm:top-6 left-3 sm:left-6 z-50 flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              // 히스토리가 있으면 뒤로가기, 없으면 홈으로
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white flex-shrink-0"
            aria-label="Go back"
          >
            <CaretLeft className="w-5 h-5" weight="bold" />
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-white font-bold text-lg sm:text-2xl md:text-3xl hover:text-white/80 transition-colors truncate max-w-[80px] sm:max-w-none"
            style={{
              fontFamily: locale === "ko" ? "var(--font-noto-sans-kr), sans-serif" : "var(--font-geist-mono), monospace",
            }}
          >
            {t("title")}
          </button>
        </div>

        {/* Top Right Hamburger Menu */}
        <div className="fixed top-4 sm:top-6 right-3 sm:right-6 z-50" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white flex-shrink-0"
            aria-label={isMenuOpen ? t("menu") : t("menu")}
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
              {/* Home */}
              <button
                onClick={() => {
                  router.push("/");
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <House className="w-5 h-5" weight="bold" />
                <span className="text-sm font-medium">{t("home")}</span>
              </button>

              {/* About / Company */}
              <button
                onClick={() => {
                  setIsCompanyModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors border-t border-white/10"
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

        {/* Main Content */}
        <main className="pt-16 sm:pt-20 pb-8">
          <div className="max-w-md mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </>
  );
}
