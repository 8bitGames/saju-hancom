"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, User, Sparkle } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";

type Gender = "male" | "female";
type CalendarType = "solar" | "lunar";

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
  { name: "서울", longitude: 127.0 },
  { name: "부산", longitude: 129.0 },
  { name: "대구", longitude: 128.6 },
  { name: "인천", longitude: 126.7 },
  { name: "광주", longitude: 126.9 },
  { name: "대전", longitude: 127.4 },
  { name: "울산", longitude: 129.3 },
  { name: "제주", longitude: 126.5 },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}시`,
}));

const MINUTES = [0, 15, 30, 45].map((m) => ({
  value: m,
  label: `${m.toString().padStart(2, "0")}분`,
}));

export function BirthInputForm({ onSubmit }: BirthInputFormProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<BirthData>({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    gender: "male",
    isLunar: false,
    city: "서울",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BirthData, string>>>(
    {}
  );

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleChange = <K extends keyof BirthData>(
    field: K,
    value: BirthData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BirthData, string>> = {};

    // Basic validation
    if (formData.year < 1900 || formData.year > currentYear) {
      newErrors.year = "올바른 연도를 선택해주세요";
    }

    // Check valid day for month
    const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
    if (formData.day > daysInMonth) {
      newErrors.day = `${formData.month}월은 ${daysInMonth}일까지만 있습니다`;
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
      // Navigate to result page with query params
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Gender Selection - Larger for 40-60대 */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <User className="w-5 h-5" />
          성별
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleChange("gender", g)}
              className={cn(
                "h-14 rounded-xl font-semibold text-lg transition-all duration-200",
                formData.gender === g
                  ? "bg-[var(--accent)] text-white"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {g === "male" ? "남성" : "여성"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Type */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Calendar className="w-5 h-5" />
          달력 종류
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(["solar", "lunar"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange("isLunar", type === "lunar")}
              className={cn(
                "h-14 rounded-xl font-semibold text-lg transition-all duration-200",
                (type === "lunar") === formData.isLunar
                  ? "bg-[var(--accent)] text-white"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {type === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Calendar className="w-5 h-5" />
          생년월일
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <select
              value={formData.year}
              onChange={(e) => handleChange("year", parseInt(e.target.value))}
              className="w-full h-14 px-4 rounded-xl glass-card text-[var(--text-primary)] text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[var(--background)]">
                  {y}년
                </option>
              ))}
            </select>
            {errors.year && (
              <p className="text-sm text-[var(--error)]">{errors.year}</p>
            )}
          </div>
          <select
            value={formData.month}
            onChange={(e) => handleChange("month", parseInt(e.target.value))}
            className="h-14 px-4 rounded-xl glass-card text-[var(--text-primary)] text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-[var(--background)]">
                {m}월
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <select
              value={formData.day}
              onChange={(e) => handleChange("day", parseInt(e.target.value))}
              className="w-full h-14 px-4 rounded-xl glass-card text-[var(--text-primary)] text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {days.map((d) => (
                <option key={d} value={d} className="bg-[var(--background)]">
                  {d}일
                </option>
              ))}
            </select>
            {errors.day && (
              <p className="text-sm text-[var(--error)]">{errors.day}</p>
            )}
          </div>
        </div>
      </div>

      {/* Birth Time */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Clock className="w-5 h-5" />
          태어난 시간
        </label>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.hour}
            onChange={(e) => handleChange("hour", parseInt(e.target.value))}
            className="h-14 px-4 rounded-xl glass-card text-[var(--text-primary)] text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
            className="h-14 px-4 rounded-xl glass-card text-[var(--text-primary)] text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {MINUTES.map((m) => (
              <option key={m.value} value={m.value} className="bg-[var(--background)]">
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          정확한 시간을 모르면 대략적인 시간을 선택해주세요
        </p>
      </div>

      {/* Birth Location */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <MapPin className="w-5 h-5" />
          태어난 지역
        </label>
        <select
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className="w-full h-14 px-4 rounded-xl glass-card text-[var(--text-primary)] text-lg bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {CITIES.map((city) => (
            <option key={city.name} value={city.name} className="bg-[var(--background)]">
              {city.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-[var(--text-tertiary)]">
          진태양시 보정을 위해 태어난 지역을 선택해주세요
        </p>
      </div>

      {/* Submit Button with Hover Border Gradient */}
      <HoverBorderGradient
        containerClassName="w-full rounded-xl"
        className="w-full h-16 flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white font-bold text-lg rounded-xl"
        as="button"
        onClick={handleSubmit}
      >
        <Sparkle className="w-6 h-6" weight="fill" />
        사주 분석하기
      </HoverBorderGradient>
    </form>
  );
}
