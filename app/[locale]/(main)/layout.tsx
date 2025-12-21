"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CaretLeft, Buildings, ClockCounterClockwise } from "@phosphor-icons/react";
import { StarsBackground } from "@/components/aceternity/stars-background";
import { ShootingStars } from "@/components/aceternity/shooting-stars";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { CompanyModal } from "@/components/layout/company-modal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("header");
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  return (
    <div className="min-h-screen min-h-dvh bg-[#0f0a1a] relative overflow-x-hidden">
      {/* Stars Background - transparent canvas, body provides bg color */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ overflow: 'visible' }}
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

      {/* Branding - Top Left */}
      <div className="fixed top-4 sm:top-6 left-3 sm:left-6 z-50 flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white flex-shrink-0"
          aria-label="Go back"
        >
          <CaretLeft className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
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

      {/* Top Right Controls */}
      <div className="fixed top-4 sm:top-6 right-3 sm:right-6 z-50 flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={() => setIsCompanyModalOpen(true)}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white flex-shrink-0"
          aria-label="About"
        >
          <Buildings className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
        </button>
        <button
          onClick={() => router.push("/history")}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 transition-all hover:bg-white/20 hover:text-white flex-shrink-0"
          aria-label="History"
        >
          <ClockCounterClockwise className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
        </button>
        <LanguageToggle />
      </div>

      {/* Company Modal */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-16 sm:pt-20 pb-8">
        <div className="max-w-md mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
