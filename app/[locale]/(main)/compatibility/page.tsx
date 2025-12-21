"use client";

import { useTranslations } from "next-intl";
import { CompatibilityForm } from "@/components/compatibility/compatibility-form";

export default function CompatibilityPage() {
  const t = useTranslations("compatibility");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#3b82f6] text-sm font-medium tracking-wider">
          宮合分析
        </p>
        <h1 className="text-2xl font-bold text-white">
          {t("title")}
        </h1>
        <p className="text-white/60 text-sm">
          {t("subtitle")}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        <CompatibilityForm />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-white/40 px-4">
        입력하신 정보는 궁합 분석에만 사용됩니다
      </p>
    </div>
  );
}
