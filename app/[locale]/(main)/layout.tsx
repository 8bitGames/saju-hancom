"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CaretLeft, Buildings, ClockCounterClockwise, List, X, Globe, House } from "@phosphor-icons/react";
import { CompanyModal } from "@/components/layout/company-modal";
import { BottomNav } from "@/components/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import Image from "next/image";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
    router.replace(pathname, { locale: newLocale });
    setIsMenuOpen(false);
    setIsLanguageExpanded(false);
  };

  // 홈페이지가 아닌 경우에만 뒤로가기 버튼 표시
  const isHomePage = pathname === "/" || pathname === "";

  return (
    <>
      {/* Main Page Container - Cheong-Giun Style */}
      <div className="relative z-10 min-h-screen min-h-dvh bg-[#F5F9FC]">
        {/* Header - Clean white header, centered on PC */}
        <header className="fixed top-0 z-50 bg-white border-b border-gray-100 w-full max-w-[430px] left-1/2 -translate-x-1/2">
          <div className="px-4 h-14 flex items-center justify-between">
            {/* Left: Back button or Logo */}
            <div className="flex items-center gap-2">
              {!isHomePage && (
                <button
                  onClick={() => {
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push("/");
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Go back"
                >
                  <CaretLeft className="w-5 h-5" weight="bold" />
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 font-bold text-gray-800 hover:text-gray-600 transition-colors"
              >
                <Image
                  src="/icons/categories/saju.png"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span
                  className="text-lg"
                  style={{
                    fontFamily: locale === "ko" ? "var(--font-noto-sans-kr), sans-serif" : "var(--font-geist-mono), monospace",
                  }}
                >
                  {t("title")}
                </span>
              </button>
            </div>

            {/* Right: Menu Button */}
            <div ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" weight="bold" />
                ) : (
                  <List className="w-5 h-5" weight="bold" />
                )}
              </button>

              {/* Dropdown Menu - 점신 스타일 */}
              {isMenuOpen && (
                <div className="absolute top-full right-4 mt-2 w-48 rounded-xl bg-white border border-gray-100 shadow-lg overflow-hidden animate-fade-in">
                  {/* Home */}
                  <button
                    onClick={() => {
                      router.push("/");
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-[#C4A35A] transition-colors"
                  >
                    <House className="w-5 h-5" />
                    <span className="text-sm font-medium">{t("home")}</span>
                  </button>

                  {/* About / Company */}
                  <button
                    onClick={() => {
                      setIsCompanyModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-[#C4A35A] transition-colors border-t border-gray-50"
                  >
                    <Buildings className="w-5 h-5" />
                    <span className="text-sm font-medium">{t("about")}</span>
                  </button>

                  {/* History / Record */}
                  <button
                    onClick={() => {
                      router.push("/history");
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-[#C4A35A] transition-colors border-t border-gray-50"
                  >
                    <ClockCounterClockwise className="w-5 h-5" />
                    <span className="text-sm font-medium">{t("record")}</span>
                  </button>

                  {/* Language */}
                  <div className="border-t border-gray-50">
                    <button
                      onClick={() => setIsLanguageExpanded(!isLanguageExpanded)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-[#C4A35A] transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="text-sm font-medium">{t("language")}</span>
                      <span className="ml-auto text-xs text-gray-500">{localeNames[locale]}</span>
                    </button>

                    {/* Language Options */}
                    {isLanguageExpanded && (
                      <div className="bg-gray-50">
                        {locales.map((l) => (
                          <button
                            key={l}
                            onClick={() => switchLocale(l)}
                            className={`w-full px-4 py-2 pl-12 text-left text-sm transition-colors ${
                              l === locale
                                ? "text-[#C4A35A] font-medium bg-[#C4A35A]/10"
                                : "text-gray-500 hover:bg-white hover:text-gray-700"
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
          </div>
        </header>

        {/* Company Modal */}
        <CompanyModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
        />

        {/* Main Content */}
        <main className="pt-14 pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </>
  );
}
