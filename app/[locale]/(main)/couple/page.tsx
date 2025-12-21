"use client";

import { useTranslations } from "next-intl";
import { CoupleForm } from "@/components/couple/couple-form";

export default function CouplePage() {
  const t = useTranslations("couple");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#ec4899] text-sm font-medium tracking-wider">
          緣分分析
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
        <CoupleForm />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-white/40 px-4">
        {t("privacyNotice")}
      </p>
    </div>
  );
}
