"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { Calendar, Clock, MapPin, User, Sparkle } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";

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
  { key: "seoul", longitude: 127.0 },
  { key: "busan", longitude: 129.0 },
  { key: "daegu", longitude: 128.6 },
  { key: "incheon", longitude: 126.7 },
  { key: "gwangju", longitude: 126.9 },
  { key: "daejeon", longitude: 127.4 },
  { key: "ulsan", longitude: 129.3 },
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

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: locale === 'ko'
      ? `${i.toString().padStart(2, "0")}시`
      : `${i.toString().padStart(2, "0")}:00`,
  }));

  const MINUTES = [0, 15, 30, 45].map((m) => ({
    value: m,
    label: locale === 'ko'
      ? `${m.toString().padStart(2, "0")}분`
      : `:${m.toString().padStart(2, "0")}`,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* Gender Selection */}
      <div className="space-y-3 sm:space-y-4">
        <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--text-primary)]">
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("gender.label")}
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleChange("gender", g)}
              className={cn(
                "h-12 sm:h-14 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-200",
                formData.gender === g
                  ? "bg-[var(--accent)] text-white"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t(`gender.${g}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Type */}
      <div className="space-y-3 sm:space-y-4">
        <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--text-primary)]">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("calendar.label")}
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {(["solar", "lunar"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange("isLunar", type === "lunar")}
              className={cn(
                "h-12 sm:h-14 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-200",
                (type === "lunar") === formData.isLunar
                  ? "bg-[var(--accent)] text-white"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t(`calendar.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date */}
      <div className="space-y-3 sm:space-y-4">
        <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--text-primary)]">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("birthDate.label")}
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="space-y-1">
            <select
              value={formData.year}
              onChange={(e) => handleChange("year", parseInt(e.target.value))}
              className="w-full h-12 sm:h-14 px-2 sm:px-4 rounded-lg sm:rounded-xl glass-card text-[var(--text-primary)] text-sm sm:text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[var(--background)]">
                  {y}{t("birthDate.year")}
                </option>
              ))}
            </select>
            {errors.year && (
              <p className="text-xs sm:text-sm text-[var(--error)]">{errors.year}</p>
            )}
          </div>
          <select
            value={formData.month}
            onChange={(e) => handleChange("month", parseInt(e.target.value))}
            className="h-12 sm:h-14 px-2 sm:px-4 rounded-lg sm:rounded-xl glass-card text-[var(--text-primary)] text-sm sm:text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-[var(--background)]">
                {m}{t("birthDate.month")}
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <select
              value={formData.day}
              onChange={(e) => handleChange("day", parseInt(e.target.value))}
              className="w-full h-12 sm:h-14 px-2 sm:px-4 rounded-lg sm:rounded-xl glass-card text-[var(--text-primary)] text-sm sm:text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {days.map((d) => (
                <option key={d} value={d} className="bg-[var(--background)]">
                  {d}{t("birthDate.day")}
                </option>
              ))}
            </select>
            {errors.day && (
              <p className="text-xs sm:text-sm text-[var(--error)]">{errors.day}</p>
            )}
          </div>
        </div>
      </div>

      {/* Birth Time */}
      <div className="space-y-3 sm:space-y-4">
        <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--text-primary)]">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("birthTime.label")}
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <select
            value={formData.hour}
            onChange={(e) => handleChange("hour", parseInt(e.target.value))}
            className="h-12 sm:h-14 px-2 sm:px-4 rounded-lg sm:rounded-xl glass-card text-[var(--text-primary)] text-sm sm:text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value} className="bg-[var(--background)]">
                {h.label}
              </option>
            ))}
          </select>
          <select
            value={formData.minute}
            onChange={(e) => handleChange("minute", parseInt(e.target.value))}
            className="h-12 sm:h-14 px-2 sm:px-4 rounded-lg sm:rounded-xl glass-card text-[var(--text-primary)] text-sm sm:text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {MINUTES.map((m) => (
              <option key={m.value} value={m.value} className="bg-[var(--background)]">
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
          {t("birthTime.hint")}
        </p>
      </div>

      {/* Birth Location */}
      <div className="space-y-3 sm:space-y-4">
        <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--text-primary)]">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("birthPlace.label")}
        </label>
        <select
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className="w-full h-12 sm:h-14 px-3 sm:px-4 rounded-lg sm:rounded-xl glass-card text-[var(--text-primary)] text-sm sm:text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {CITIES.map((city) => (
            <option key={city.key} value={city.key} className="bg-[var(--background)]">
              {tCities(city.key)}
            </option>
          ))}
        </select>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
          {t("birthPlace.hint")}
        </p>
      </div>

      {/* Submit Button */}
      <HoverBorderGradient
        containerClassName="w-full rounded-lg sm:rounded-xl"
        className="w-full h-12 sm:h-16 flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-xl"
        as="button"
        type="submit"
      >
        <Sparkle className="w-5 h-5 sm:w-6 sm:h-6" weight="fill" />
        {t("submit")}
      </HoverBorderGradient>
    </form>
  );
}
