"use client";

import { useTranslations } from "next-intl";
import { BirthInputForm } from "@/components/saju/birth-input-form";

export default function SajuPage() {
  const t = useTranslations("saju");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#a855f7] text-sm font-medium tracking-wider">
          四柱八字
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
        <BirthInputForm />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-white/40 px-4">
        {t("privacyNotice")}
      </p>
    </div>
  );
}
