"use client";

import Link from "next/link";
import { Sparkle, List, X } from "@/components/ui/icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--header-height)] bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-md mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--element-fire)] flex items-center justify-center">
            <Sparkle className="w-5 h-5 text-white" weight="fill" />
          </div>
          <span className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            AI 운세
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/saju"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            사주 분석
          </Link>
          <Link
            href="/compatibility"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            회사 궁합
          </Link>
          <Link
            href="/face-reading"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            관상 분석
          </Link>
          <Link
            href="/history"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            기록
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <List className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[var(--header-height)] left-0 right-0 bg-[var(--background)] border-b border-[var(--border)] animate-fade-in">
          <nav className="max-w-md mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/saju"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              사주 분석
            </Link>
            <Link
              href="/compatibility"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              회사 궁합
            </Link>
            <Link
              href="/face-reading"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              관상 분석
            </Link>
            <Link
              href="/history"
              className="py-2 px-4 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-card)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              기록
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
