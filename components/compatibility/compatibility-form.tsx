"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, User, UsersThree, Handshake } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";
import type { RelationType } from "@/lib/compatibility/types";

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

export interface CompatibilityFormData {
  person1: PersonFormData;
  person2: PersonFormData;
  relationType: RelationType;
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

const RELATION_TYPES: { value: RelationType; label: string }[] = [
  { value: "colleague", label: "동료" },
  { value: "supervisor", label: "상사" },
  { value: "subordinate", label: "부하" },
  { value: "partner", label: "파트너" },
  { value: "client", label: "고객" },
  { value: "mentor", label: "멘토" },
  { value: "mentee", label: "멘티" },
];

function PersonInputSection({
  title,
  icon: Icon,
  person,
  onChange,
  errors,
  personKey,
}: {
  title: string;
  icon: typeof User;
  person: PersonFormData;
  onChange: (field: keyof PersonFormData, value: PersonFormData[keyof PersonFormData]) => void;
  errors: Partial<Record<keyof PersonFormData, string>>;
  personKey: "person1" | "person2";
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const accentColor = personKey === "person1" ? "var(--accent)" : "var(--element-water)";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
        <Icon className="w-6 h-6" style={{ color: accentColor }} weight="fill" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
      </div>

      {/* Name Input */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <User className="w-5 h-5" />
          이름 (닉네임)
        </label>
        <input
          type="text"
          value={person.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="예: 홍길동"
          className="w-full h-14 px-4 rounded-xl glass-card text-[var(--text-primary)] text-lg bg-transparent placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        {errors.name && (
          <p className="text-sm text-[var(--error)]">{errors.name}</p>
        )}
      </div>

      {/* Gender Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          성별
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange("gender", g)}
              className={cn(
                "h-12 rounded-xl font-semibold text-base transition-all duration-200",
                person.gender === g
                  ? "text-white"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              style={person.gender === g ? { backgroundColor: accentColor } : undefined}
            >
              {g === "male" ? "남성" : "여성"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Type */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Calendar className="w-5 h-5" />
          달력 종류
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["solar", "lunar"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange("isLunar", type === "lunar")}
              className={cn(
                "h-12 rounded-xl font-semibold text-base transition-all duration-200",
                (type === "lunar") === person.isLunar
                  ? "text-white"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              style={(type === "lunar") === person.isLunar ? { backgroundColor: accentColor } : undefined}
            >
              {type === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          생년월일
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <select
              value={person.year}
              onChange={(e) => onChange("year", parseInt(e.target.value))}
              className="w-full h-12 px-3 rounded-xl glass-card text-[var(--text-primary)] text-base bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
            value={person.month}
            onChange={(e) => onChange("month", parseInt(e.target.value))}
            className="h-12 px-3 rounded-xl glass-card text-[var(--text-primary)] text-base bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-[var(--background)]">
                {m}월
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <select
              value={person.day}
              onChange={(e) => onChange("day", parseInt(e.target.value))}
              className="w-full h-12 px-3 rounded-xl glass-card text-[var(--text-primary)] text-base bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Clock className="w-5 h-5" />
          태어난 시간
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={person.hour}
            onChange={(e) => onChange("hour", parseInt(e.target.value))}
            className="h-12 px-3 rounded-xl glass-card text-[var(--text-primary)] text-base bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value} className="bg-[var(--background)]">
                {h.label}
              </option>
            ))}
          </select>
          <select
            value={person.minute}
            onChange={(e) => onChange("minute", parseInt(e.target.value))}
            className="h-12 px-3 rounded-xl glass-card text-[var(--text-primary)] text-base bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {MINUTES.map((m) => (
              <option key={m.value} value={m.value} className="bg-[var(--background)]">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Birth Location */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <MapPin className="w-5 h-5" />
          태어난 지역
        </label>
        <select
          value={person.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full h-12 px-3 rounded-xl glass-card text-[var(--text-primary)] text-base bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {CITIES.map((city) => (
            <option key={city.name} value={city.name} className="bg-[var(--background)]">
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CompatibilityForm() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<CompatibilityFormData>({
    person1: {
      name: "",
      year: 1980,
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
      year: 1985,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      gender: "female",
      isLunar: false,
      city: "서울",
    },
    relationType: "colleague",
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

    // Validate person1
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

    // Validate person2
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
      // Person 1
      p1Name: formData.person1.name,
      p1Year: formData.person1.year.toString(),
      p1Month: formData.person1.month.toString(),
      p1Day: formData.person1.day.toString(),
      p1Hour: formData.person1.hour.toString(),
      p1Minute: formData.person1.minute.toString(),
      p1Gender: formData.person1.gender,
      p1IsLunar: formData.person1.isLunar.toString(),
      p1City: formData.person1.city,
      // Person 2
      p2Name: formData.person2.name,
      p2Year: formData.person2.year.toString(),
      p2Month: formData.person2.month.toString(),
      p2Day: formData.person2.day.toString(),
      p2Hour: formData.person2.hour.toString(),
      p2Minute: formData.person2.minute.toString(),
      p2Gender: formData.person2.gender,
      p2IsLunar: formData.person2.isLunar.toString(),
      p2City: formData.person2.city,
      // Relation
      relationType: formData.relationType,
    });
    router.push(`/compatibility/result?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Person 1 Section */}
      <div className="glass-card rounded-2xl p-5 backdrop-blur-xl border border-[var(--border)]/50">
        <PersonInputSection
          title="첫 번째 사람 (나)"
          icon={User}
          person={formData.person1}
          onChange={(field, value) => handlePersonChange("person1", field, value)}
          errors={errors.person1}
          personKey="person1"
        />
      </div>

      {/* Relation Type */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3">
          <Handshake className="w-6 h-6 text-[var(--element-earth)]" weight="fill" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">상대방과의 관계</h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {RELATION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, relationType: type.value }))}
              className={cn(
                "h-11 rounded-xl font-medium text-sm transition-all duration-200",
                formData.relationType === type.value
                  ? "bg-[var(--element-earth)] text-white"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Person 2 Section */}
      <div className="glass-card rounded-2xl p-5 backdrop-blur-xl border border-[var(--border)]/50">
        <PersonInputSection
          title="두 번째 사람 (상대방)"
          icon={UsersThree}
          person={formData.person2}
          onChange={(field, value) => handlePersonChange("person2", field, value)}
          errors={errors.person2}
          personKey="person2"
        />
      </div>

      {/* Submit Button with Hover Border Gradient */}
      <HoverBorderGradient
        containerClassName="w-full rounded-xl"
        className="w-full h-16 flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--accent)] to-[var(--element-water)] text-white font-bold text-lg rounded-xl"
        as="button"
        onClick={handleSubmit}
      >
        <UsersThree className="w-6 h-6" weight="fill" />
        궁합 분석하기
      </HoverBorderGradient>
    </form>
  );
}
