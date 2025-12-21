"use client";

import { useTranslations } from "next-intl";
import { FaceReadingForm } from "@/components/face-reading/face-reading-form";

export default function FaceReadingPage() {
  const t = useTranslations("faceReading");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#ef4444] text-sm font-medium tracking-wider">
          觀相分析
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
        <FaceReadingForm />
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-white/40 px-4">
        관상 분석은 재미를 위한 참고용 정보입니다
      </p>
    </div>
  );
}
