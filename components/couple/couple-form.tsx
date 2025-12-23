"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar, Clock, MapPin, User, Heart, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { CoupleRelationType } from "@/lib/couple/types";

type Gender = "male" | "female";

interface PersonFormData {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  isLunar: boolean;
  city: string;
}

export interface CoupleFormData {
  person1: PersonFormData;
  person2: PersonFormData;
  relationType: CoupleRelationType;
}

const CITIES = [
  // 특별시/광역시
  { name: "서울", longitude: 127.0 },
  { name: "부산", longitude: 129.0 },
  { name: "대구", longitude: 128.6 },
  { name: "인천", longitude: 126.7 },
  { name: "광주", longitude: 126.9 },
  { name: "대전", longitude: 127.4 },
  { name: "울산", longitude: 129.3 },
  { name: "세종", longitude: 127.3 },
  // 도
  { name: "경기", longitude: 127.0 },
  { name: "강원", longitude: 127.7 },
  { name: "충북", longitude: 127.5 },
  { name: "충남", longitude: 126.8 },
  { name: "전북", longitude: 127.1 },
  { name: "전남", longitude: 126.4 },
  { name: "경북", longitude: 128.7 },
  { name: "경남", longitude: 128.7 },
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

const RELATION_TYPES: { value: CoupleRelationType; label: string; labelEn: string }[] = [
  { value: "dating", label: "연애 중", labelEn: "Dating" },
  { value: "engaged", label: "약혼", labelEn: "Engaged" },
  { value: "married", label: "결혼", labelEn: "Married" },
  { value: "interested", label: "관심 상대", labelEn: "Interested" },
];

function PersonInputSection({
  title,
  person,
  onChange,
  errors,
  personKey,
  accentColor,
}: {
  title: string;
  person: PersonFormData;
  onChange: (field: keyof PersonFormData, value: PersonFormData[keyof PersonFormData]) => void;
  errors: Partial<Record<keyof PersonFormData, string>>;
  personKey: "person1" | "person2";
  accentColor: string;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Heart className="w-5 h-5" style={{ color: accentColor }} weight="fill" />
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <User className="w-4 h-4 text-white/60" />
          이름 (닉네임)
        </label>
        <input
          type="text"
          value={person.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="예: 홍길동"
          className="w-full h-12 px-3 rounded-xl bg-white/5 text-white text-base border border-white/10 placeholder:text-white/30 focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
        />
        {errors.name && (
          <p className="text-xs text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Gender Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">성별</label>
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange("gender", g)}
              className={cn(
                "h-10 rounded-xl font-medium text-sm transition-all duration-200",
                person.gender === g
                  ? "text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              )}
              style={person.gender === g ? { backgroundColor: accentColor } : undefined}
            >
              {g === "male" ? "남성" : "여성"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Type */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <Calendar className="w-4 h-4 text-white/60" />
          달력 종류
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["solar", "lunar"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange("isLunar", type === "lunar")}
              className={cn(
                "h-10 rounded-xl font-medium text-sm transition-all duration-200",
                (type === "lunar") === person.isLunar
                  ? "text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              )}
              style={(type === "lunar") === person.isLunar ? { backgroundColor: accentColor } : undefined}
            >
              {type === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">생년월일</label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <select
              value={person.year}
              onChange={(e) => onChange("year", parseInt(e.target.value))}
              className="w-full h-10 px-2 rounded-xl bg-white/5 text-white text-sm border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#1a0a1a] text-white">
                  {y}년
                </option>
              ))}
            </select>
            {errors.year && (
              <p className="text-xs text-red-400">{errors.year}</p>
            )}
          </div>
          <select
            value={person.month}
            onChange={(e) => onChange("month", parseInt(e.target.value))}
            className="h-10 px-2 rounded-xl bg-white/5 text-white text-sm border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-[#1a0a1a] text-white">
                {m}월
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <select
              value={person.day}
              onChange={(e) => onChange("day", parseInt(e.target.value))}
              className="w-full h-10 px-2 rounded-xl bg-white/5 text-white text-sm border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            >
              {days.map((d) => (
                <option key={d} value={d} className="bg-[#1a0a1a] text-white">
                  {d}일
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
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <Clock className="w-4 h-4 text-white/60" />
          태어난 시간
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={person.hour}
            onChange={(e) => onChange("hour", parseInt(e.target.value))}
            className="h-10 px-2 rounded-xl bg-white/5 text-white text-sm border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value} className="bg-[#1a0a1a] text-white">
                {h.label}
              </option>
            ))}
          </select>
          <select
            value={person.minute}
            onChange={(e) => onChange("minute", parseInt(e.target.value))}
            className="h-10 px-2 rounded-xl bg-white/5 text-white text-sm border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          >
            {MINUTES.map((m) => (
              <option key={m.value} value={m.value} className="bg-[#1a0a1a] text-white">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Birth Location */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <MapPin className="w-4 h-4 text-white/60" />
          태어난 지역
        </label>
        <select
          value={person.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full h-10 px-2 rounded-xl bg-white/5 text-white text-sm border border-white/10 appearance-none cursor-pointer focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
        >
          {CITIES.map((city) => (
            <option key={city.name} value={city.name} className="bg-[#1a0a1a] text-white">
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CoupleForm() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<CoupleFormData>({
    person1: {
      name: "",
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      gender: "male",
      isLunar: false,
      city: "서울",
    },
    person2: {
      name: "",
      year: 1992,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      gender: "female",
      isLunar: false,
      city: "서울",
    },
    relationType: "dating",
  });

  const [errors, setErrors] = useState<{
    person1: Partial<Record<keyof PersonFormData, string>>;
    person2: Partial<Record<keyof PersonFormData, string>>;
  }>({
    person1: {},
    person2: {},
  });

  const handlePersonChange = (
    personKey: "person1" | "person2",
    field: keyof PersonFormData,
    value: PersonFormData[keyof PersonFormData]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [personKey]: { ...prev[personKey], [field]: value },
    }));
    setErrors((prev) => ({
      ...prev,
      [personKey]: { ...prev[personKey], [field]: undefined },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = { person1: {}, person2: {} };

    if (!formData.person1.name.trim()) {
      newErrors.person1.name = "이름을 입력해주세요";
    }
    if (formData.person1.year < 1900 || formData.person1.year > currentYear) {
      newErrors.person1.year = "올바른 연도를 선택해주세요";
    }
    const days1InMonth = new Date(formData.person1.year, formData.person1.month, 0).getDate();
    if (formData.person1.day > days1InMonth) {
      newErrors.person1.day = `${formData.person1.month}월은 ${days1InMonth}일까지`;
    }

    if (!formData.person2.name.trim()) {
      newErrors.person2.name = "이름을 입력해주세요";
    }
    if (formData.person2.year < 1900 || formData.person2.year > currentYear) {
      newErrors.person2.year = "올바른 연도를 선택해주세요";
    }
    const days2InMonth = new Date(formData.person2.year, formData.person2.month, 0).getDate();
    if (formData.person2.day > days2InMonth) {
      newErrors.person2.day = `${formData.person2.month}월은 ${days2InMonth}일까지`;
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors.person1).length === 0 &&
      Object.keys(newErrors.person2).length === 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const params = new URLSearchParams({
      p1Name: formData.person1.name,
      p1Year: formData.person1.year.toString(),
      p1Month: formData.person1.month.toString(),
      p1Day: formData.person1.day.toString(),
      p1Hour: formData.person1.hour.toString(),
      p1Minute: formData.person1.minute.toString(),
      p1Gender: formData.person1.gender,
      p1IsLunar: formData.person1.isLunar.toString(),
      p1City: formData.person1.city,
      p2Name: formData.person2.name,
      p2Year: formData.person2.year.toString(),
      p2Month: formData.person2.month.toString(),
      p2Day: formData.person2.day.toString(),
      p2Hour: formData.person2.hour.toString(),
      p2Minute: formData.person2.minute.toString(),
      p2Gender: formData.person2.gender,
      p2IsLunar: formData.person2.isLunar.toString(),
      p2City: formData.person2.city,
      relationType: formData.relationType,
    });
    router.push(`/couple/result?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Person 1 Section */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <PersonInputSection
          title="나의 정보"
          person={formData.person1}
          onChange={(field, value) => handlePersonChange("person1", field, value)}
          errors={errors.person1}
          personKey="person1"
          accentColor="#ec4899"
        />
      </div>

      {/* Relation Type */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2">
          <Heart className="w-5 h-5 text-[#f472b6]" weight="fill" />
          <h2 className="text-base font-bold text-white">관계</h2>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {RELATION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, relationType: type.value }))}
              className={cn(
                "h-9 rounded-xl font-medium text-xs transition-all duration-200",
                formData.relationType === type.value
                  ? "bg-[#ec4899] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Person 2 Section */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <PersonInputSection
          title="상대방 정보"
          person={formData.person2}
          onChange={(field, value) => handlePersonChange("person2", field, value)}
          errors={errors.person2}
          personKey="person2"
          accentColor="#f472b6"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full h-14 flex items-center justify-center gap-2 bg-[#ec4899] text-white font-bold text-lg rounded-xl hover:bg-[#db2777] transition-colors"
      >
        궁합 분석하기
        <ArrowRight className="w-5 h-5" weight="bold" />
      </button>
    </form>
  );
}
