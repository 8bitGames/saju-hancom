"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Sparkle, List, X } from "@/components/ui/icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--header-height)] bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)] flex items-center justify-center">
            <Sparkle className="w-5 h-5 text-white" weight="fill" />
          </div>
          <span className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors hidden min-[400px]:block truncate max-w-[120px] sm:max-w-none">
            {t("header.title")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/saju"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            {t("nav.saju")}
          </Link>
          <Link
            href="/compatibility"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            {t("nav.compatibility")}
          </Link>
          <Link
            href="/face-reading"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            {t("nav.faceReading")}
          </Link>
          <Link
            href="/history"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            {t("nav.history")}
          </Link>
          <div className="h-4 w-px bg-[var(--border)] mx-2" />
          <LanguageSwitcher />
        </nav>

        {/* Mobile Menu Button + Language Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 md:hidden flex-shrink-0">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <List className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[var(--header-height)] left-0 right-0 bg-[var(--background)] border-b border-[var(--border)] animate-fade-in">
          <nav className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/saju"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.saju")}
            </Link>
            <Link
              href="/compatibility"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.compatibility")}
            </Link>
            <Link
              href="/face-reading"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.faceReading")}
            </Link>
            <Link
              href="/history"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.history")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
