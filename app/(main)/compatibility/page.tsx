"use client";

import { Users } from "@/components/ui/icons";
import { CompatibilityForm } from "@/components/compatibility/compatibility-form";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { Spotlight } from "@/components/aceternity/spotlight";

export default function CompatibilityPage() {
  return (
    <div className="relative min-h-screen">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 -right-10 md:right-40 md:-top-20"
        fill="var(--element-water)"
      />

      <div className="space-y-8 animate-fade-in relative z-10">
        {/* Header with Premium Effects */}
        <div className="relative text-center space-y-4 py-8">
          {/* Sparkles Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="compatibility-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={40}
              particleColor="var(--element-water)"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-2xl p-5"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-20 h-20 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" weight="fill" />
              </div>
            </BackgroundGradient>
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              직장 동료 궁합
            </h1>
            <TextGenerateEffect
              words="두 사람의 사주로 직장 내 관계를 분석합니다"
              className="text-lg text-[var(--text-secondary)]"
              duration={0.3}
            />
          </div>
        </div>

        {/* Form Card with Glass Effect */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-[var(--border)]/50">
          <CompatibilityForm />
        </div>

        {/* Info with subtle animation */}
        <div className="text-center text-sm text-[var(--text-tertiary)] space-y-2 pb-8">
          <p>동료, 상사, 부하, 파트너와의 직장 궁합을 분석합니다</p>
          <p>입력하신 정보는 궁합 분석에만 사용됩니다</p>
        </div>
      </div>
    </div>
  );
}
