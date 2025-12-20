"use client";

import Link from "next/link";
import { Sparkle, Camera, ArrowRight, Star, Handshake } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
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
  const words = ["운명", "사주", "관상", "궁합"];

  return (
    <div className="relative min-h-screen">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="var(--accent)"
      />

      <div className="space-y-12 relative z-10">
        {/* Hero Section with Premium Effects */}
        <section className="relative text-center space-y-6 py-16 overflow-hidden">
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
              className="rounded-3xl p-6"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-24 h-24 flex items-center justify-center">
                <Star className="w-14 h-14 text-white" weight="fill" />
              </div>
            </BackgroundGradient>
          </div>

          {/* Animated Title */}
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              AI 운세 마스터
            </h1>

            {/* Flip Words Effect */}
            <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-[var(--text-secondary)]">
              <span>나의</span>
              <FlipWords words={words} className="text-[var(--accent)]" />
              <span>을 알아보세요</span>
            </div>

            {/* Text Generate Effect */}
            <TextGenerateEffect
              words="사주팔자와 관상으로 알아보는 나만의 AI 운세 분석"
              className="text-base md:text-lg text-[var(--text-secondary)] max-w-md mx-auto"
              duration={0.3}
            />
          </div>
        </section>

        {/* Feature Cards with Premium Effects */}
        <section className="space-y-6 px-1">
          {/* Saju Card with Glowing Stars */}
          <Link href="/saju" className="block group">
            <GlowingStarsBackgroundCard className="relative overflow-hidden">
              <Meteors number={10} />
              <div className="relative z-10">
                <div className="flex items-start gap-5 p-2">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--element-wood)] to-[var(--element-fire)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Sparkle className="w-8 h-8 text-white" weight="fill" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <GlowingStarsTitle>사주 분석</GlowingStarsTitle>
                      <ArrowRight className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-2 transition-all duration-300" />
                    </div>
                    <GlowingStarsDescription>
                      생년월일시를 입력하면 AI가 사주팔자를 분석하고 운세를 알려드립니다.
                    </GlowingStarsDescription>
                    <div className="flex gap-2 pt-3">
                      <span className="element-badge element-badge-wood">목</span>
                      <span className="element-badge element-badge-fire">화</span>
                      <span className="element-badge element-badge-earth">토</span>
                      <span className="element-badge element-badge-metal">금</span>
                      <span className="element-badge element-badge-water">수</span>
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
              className="p-6 rounded-xl"
              containerClassName="w-full"
              rx="12px"
              ry="12px"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--element-water)] to-[var(--accent)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Handshake className="w-8 h-8 text-white" weight="fill" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                      직장 동료 궁합
                    </h2>
                    <ArrowRight className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    직장 동료, 상사, 부하직원과의 궁합을 분석하여 관계운을 확인하세요.
                  </p>
                  <div className="flex items-center gap-3 pt-3">
                    <span className="px-3 py-1.5 rounded-full bg-[var(--background-elevated)] flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                      <Handshake className="w-4 h-4" weight="fill" />
                      동료
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[var(--background-elevated)] text-sm text-[var(--text-secondary)]">
                      상사
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[var(--background-elevated)] text-sm text-[var(--text-secondary)]">
                      파트너
                    </span>
                  </div>
                </div>
              </div>
            </MovingBorder>
          </Link>

          {/* Face Reading Card with Background Gradient */}
          <Link href="/face-reading" className="block group">
            <BackgroundGradient className="rounded-xl p-6" containerClassName="w-full">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--element-metal)] to-[var(--element-water)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                      관상 분석
                    </h2>
                    <ArrowRight className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    얼굴 사진을 업로드하면 AI가 관상을 분석하고 특징을 알려드립니다.
                  </p>
                  <div className="flex items-center gap-3 pt-3">
                    <span className="px-3 py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-sm text-[var(--text-secondary)]">
                      이마
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-sm text-[var(--text-secondary)]">
                      눈
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-sm text-[var(--text-secondary)]">
                      코
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[var(--background-elevated)]/50 text-sm text-[var(--text-secondary)]">
                      입
                    </span>
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </Link>
        </section>

        {/* Quick Start Button with Hover Border Gradient */}
        <section className="pt-4 px-1">
          <Link href="/saju" className="block">
            <HoverBorderGradient
              containerClassName="w-full rounded-xl"
              className="w-full h-16 flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white font-bold text-lg rounded-xl"
              as="div"
            >
              <Sparkle className="w-6 h-6" weight="fill" />
              사주 분석 시작하기
            </HoverBorderGradient>
          </Link>
        </section>

        {/* Info Footer with Text Generate Effect */}
        <section className="text-center text-sm text-[var(--text-tertiary)] space-y-2 pt-6 pb-8">
          <p>AI 운세 마스터는 전통 명리학과 AI 기술을 결합하여</p>
          <p>재미있는 운세 정보를 제공합니다.</p>
        </section>
      </div>
    </div>
  );
}
