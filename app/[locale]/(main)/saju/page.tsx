"use client";

import { Sparkle } from "@/components/ui/icons";
import { BirthInputForm } from "@/components/saju/birth-input-form";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { Spotlight } from "@/components/aceternity/spotlight";

export default function SajuPage() {
  return (
    <div className="relative min-h-screen">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 -left-10 md:left-40 md:-top-20"
        fill="var(--element-fire)"
      />

      <div className="space-y-6 sm:space-y-8 animate-fade-in relative z-10">
        {/* Header with Premium Effects */}
        <div className="relative text-center space-y-3 sm:space-y-4 py-6 sm:py-8">
          {/* Sparkles Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="saju-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={40}
              particleColor="var(--element-fire)"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                <Sparkle className="w-8 h-8 sm:w-10 sm:h-10 text-white" weight="fill" />
              </div>
            </BackgroundGradient>
          </div>

          <div className="relative z-10 space-y-1.5 sm:space-y-2 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              사주 분석
            </h1>
            <TextGenerateEffect
              words="생년월일시를 입력해주세요"
              className="text-base sm:text-lg text-[var(--text-secondary)]"
              duration={0.3}
            />
          </div>
        </div>

        {/* Form Card with Glass Effect */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <BirthInputForm />
        </div>

        {/* Info with subtle animation */}
        <div className="text-center text-xs sm:text-sm text-[var(--text-tertiary)] space-y-1 sm:space-y-2 pb-6 sm:pb-8 px-4">
          <p>입력하신 정보는 사주 분석에만 사용되며</p>
          <p>별도로 저장되지 않습니다.</p>
        </div>
      </div>
    </div>
  );
}
