"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { Calendar, Clock, MapPin, User, ArrowRight, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSavedAnalysisData } from "@/lib/hooks/useSajuPipelineStream";

// Haptic feedback utility for touch devices
const triggerHaptic = (style: "light" | "medium" | "heavy" = "light") => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[style]);
  }
};

type Gender = "male" | "female";

interface BirthInputFormProps {
  onSubmit?: (data: BirthData) => void;
}

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  isLunar: boolean;
  city: string;
}

const CITIES = [
  // 특별시/광역시
  { key: "seoul", longitude: 127.0 },
  { key: "busan", longitude: 129.0 },
  { key: "daegu", longitude: 128.6 },
  { key: "incheon", longitude: 126.7 },
  { key: "gwangju", longitude: 126.9 },
  { key: "daejeon", longitude: 127.4 },
  { key: "ulsan", longitude: 129.3 },
  { key: "sejong", longitude: 127.3 },
  // 도
  { key: "gyeonggi", longitude: 127.0 },
  { key: "gangwon", longitude: 127.7 },
  { key: "chungbuk", longitude: 127.5 },
  { key: "chungnam", longitude: 126.8 },
  { key: "jeonbuk", longitude: 127.1 },
  { key: "jeonnam", longitude: 126.4 },
  { key: "gyeongbuk", longitude: 128.7 },
  { key: "gyeongnam", longitude: 128.7 },
  { key: "jeju", longitude: 126.5 },
];

export function BirthInputForm({ onSubmit }: BirthInputFormProps) {
  const t = useTranslations("saju.form");
  const tCities = useTranslations("saju.cities");
  const router = useRouter();
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<BirthData>({
    year: 1982,
    month: 6,
    day: 3,
    hour: 23,
    minute: 30,
    gender: "male",
    isLunar: false,
    city: "seoul",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BirthData, string>>>(
    {}
  );
  const [isShaking, setIsShaking] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  // 저장된 데이터가 있으면 바로 fortune 페이지로 리다이렉트
  useEffect(() => {
    const data = getSavedAnalysisData();
    if (data) {
      const { input } = data;
      const [year, month, day] = input.birthDate.split('-').map(Number);
      const [hour, minute] = input.birthTime.split(':').map(Number);

      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        day: day.toString(),
        hour: hour.toString(),
        minute: minute.toString(),
        gender: input.gender,
        isLunar: (input.isLunar || false).toString(),
        city: "seoul",
      });
      // window.location을 사용하여 깔끔하게 리다이렉트
      window.location.replace(`/saju/result?${params.toString()}`);
    } else {
      setIsRedirecting(false);
    }
  }, []);

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: locale === 'ko'
      ? `${i.toString().padStart(2, "0")}시`
      : `${i.toString().padStart(2, "0")}:00`,
  }));

  const MINUTES = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: locale === 'ko'
      ? `${i.toString().padStart(2, "0")}분`
      : `:${i.toString().padStart(2, "0")}`,
  }));

  const handleChange = <K extends keyof BirthData>(
    field: K,
    value: BirthData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BirthData, string>> = {};

    if (formData.year < 1900 || formData.year > currentYear) {
      newErrors.year = t("errors.invalidYear");
    }

    const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
    if (formData.day > daysInMonth) {
      newErrors.day = t("errors.invalidDay", { month: formData.month, maxDay: daysInMonth });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerHaptic("heavy");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error("입력 정보를 확인해주세요", {
        description: "생년월일을 다시 확인해주세요",
      });
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    } else {
      const params = new URLSearchParams({
        year: formData.year.toString(),
        month: formData.month.toString(),
        day: formData.day.toString(),
        hour: formData.hour.toString(),
        minute: formData.minute.toString(),
        gender: formData.gender,
        isLunar: formData.isLunar.toString(),
        city: formData.city,
      });
      router.push(`/saju/result?${params.toString()}`);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  // 리다이렉트 확인 중일 때는 아무것도 표시하지 않음
  if (isRedirecting) {
    return null;
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        "space-y-6",
        isShaking && "animate-shake"
      )}
    >
      {/* Error Summary */}
      {hasErrors && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <Warning className="w-5 h-5 text-red-400 shrink-0 mt-0.5" weight="fill" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-400">입력 정보를 확인해주세요</p>
            <ul className="text-sm text-red-300/80 space-y-0.5">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Gender Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <User className="w-4 h-4 text-white/60" />
          {t("gender.label")}
        </label>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("gender.label")}>
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                triggerHaptic("light");
                handleChange("gender", g);
              }}
              className={cn(
                "h-12 rounded-xl font-medium text-base transition-all duration-200",
                formData.gender === g
                  ? "bg-accent-primary text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              )}
              role="radio"
              aria-checked={formData.gender === g}
            >
              {t(`gender.${g}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Type */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <Calendar className="w-4 h-4 text-white/60" />
          {t("calendar.label")}
        </label>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("calendar.label")}>
          {(["solar", "lunar"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                triggerHaptic("light");
                handleChange("isLunar", type === "lunar");
              }}
              className={cn(
                "h-12 rounded-xl font-medium text-base transition-all duration-200",
                (type === "lunar") === formData.isLunar
                  ? "bg-accent-primary text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              )}
              role="radio"
              aria-checked={(type === "lunar") === formData.isLunar}
            >
              {t(`calendar.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <Calendar className="w-4 h-4 text-white/60" />
          {t("birthDate.label")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <select
              value={formData.year}
              onChange={(e) => handleChange("year", parseInt(e.target.value))}
              className="w-full h-12 px-3 rounded-xl bg-white/5 text-white text-base border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary"
              aria-label={t("birthDate.year")}
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-background-dark text-white">
                  {y}{t("birthDate.year")}
                </option>
              ))}
            </select>
            {errors.year && (
              <p className="text-xs text-red-400">{errors.year}</p>
            )}
          </div>
          <select
            value={formData.month}
            onChange={(e) => handleChange("month", parseInt(e.target.value))}
            className="h-12 px-3 rounded-xl bg-white/5 text-white text-base border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary"
            aria-label={t("birthDate.month")}
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-background-dark text-white">
                {m}{t("birthDate.month")}
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <select
              value={formData.day}
              onChange={(e) => handleChange("day", parseInt(e.target.value))}
              className="w-full h-12 px-3 rounded-xl bg-white/5 text-white text-base border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary"
              aria-label={t("birthDate.day")}
            >
              {days.map((d) => (
                <option key={d} value={d} className="bg-background-dark text-white">
                  {d}{t("birthDate.day")}
                </option>
              ))}
            </select>
            {errors.day && (
              <p className="text-xs text-red-400">{errors.day}</p>
            )}
          </div>
        </div>
      </div>

      {/* Birth Time */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <Clock className="w-4 h-4 text-white/60" />
          {t("birthTime.label")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={formData.hour}
            onChange={(e) => handleChange("hour", parseInt(e.target.value))}
            className="h-12 px-3 rounded-xl bg-white/5 text-white text-base border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary"
            aria-label={t("birthTime.hour")}
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value} className="bg-background-dark text-white">
                {h.label}
              </option>
            ))}
          </select>
          <select
            value={formData.minute}
            onChange={(e) => handleChange("minute", parseInt(e.target.value))}
            className="h-12 px-3 rounded-xl bg-white/5 text-white text-base border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary"
            aria-label={t("birthTime.minute")}
          >
            {MINUTES.map((m) => (
              <option key={m.value} value={m.value} className="bg-background-dark text-white">
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-white/40">
          {t("birthTime.hint")}
        </p>
      </div>

      {/* Birth Location */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <MapPin className="w-4 h-4 text-white/60" />
          {t("birthPlace.label")}
        </label>
        <select
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className="w-full h-12 px-3 rounded-xl bg-white/5 text-white text-base border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary"
          aria-label={t("birthPlace.label")}
        >
          {CITIES.map((city) => (
            <option key={city.key} value={city.key} className="bg-background-dark text-white">
              {tCities(city.key)}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/40">
          {t("birthPlace.hint")}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        onClick={() => triggerHaptic("medium")}
        className="w-full h-14 flex items-center justify-center gap-2 bg-accent-primary text-white font-bold text-lg rounded-xl hover:bg-accent-primary-hover active:scale-[0.98] transition-all"
      >
        {t("submit")}
        <ArrowRight className="w-5 h-5" weight="bold" />
      </button>
    </form>
  );
}
