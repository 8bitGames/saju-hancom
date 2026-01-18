"use client";

import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Star,
  Warning,
  CheckCircle,
  X,
  Info,
} from "@phosphor-icons/react";
import type {
  FortuneCalendarResult,
  CalendarDayFortune,
} from "@/lib/saju/fortune/fortune-calendar";
import type { FortuneGrade } from "@/lib/saju/fortune/types";
import {
  getDayOfWeekKorean,
  getGradeColorClass,
  getGradeBgColorClass,
} from "@/lib/saju/fortune/fortune-calendar";

// ============================================================================
// Types
// ============================================================================

interface FortuneCalendarProps {
  shareId: string;
  initialYear?: number;
  initialMonth?: number;
}

// ============================================================================
// Constants
// ============================================================================

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const GRADE_LABELS: Record<FortuneGrade, string> = {
  excellent: "대길",
  good: "길",
  normal: "평",
  caution: "주의",
};

const GRADE_COLORS: Record<FortuneGrade, { bg: string; text: string; border: string }> = {
  excellent: {
    bg: "bg-green-500",
    text: "text-white",
    border: "border-green-500",
  },
  good: {
    bg: "bg-blue-500",
    text: "text-white",
    border: "border-blue-500",
  },
  normal: {
    bg: "bg-gray-500/50",
    text: "text-white/80",
    border: "border-gray-500/50",
  },
  caution: {
    bg: "bg-orange-500",
    text: "text-white",
    border: "border-orange-500",
  },
};

// ============================================================================
// Loading Component
// ============================================================================

function CalendarLoading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 rounded bg-white/5 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-white/5 animate-pulse" />
          <div className="h-8 w-8 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
      {/* Weekday header skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-6 rounded bg-white/5 animate-pulse" />
        ))}
      </div>
      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

const CalendarHeader = memo(function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
}: {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <CalendarBlank className="w-5 h-5 text-purple-400" weight="fill" />
        {year}년 {month}월
      </h3>
      <div className="flex gap-1">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="이전 달"
        >
          <CaretLeft className="w-5 h-5 text-white/70" />
        </button>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="다음 달"
        >
          <CaretRight className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </div>
  );
});

const WeekdayHeader = memo(function WeekdayHeader() {
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {WEEKDAYS.map((day, i) => (
        <div
          key={day}
          className={`text-center text-xs font-medium py-1 ${
            i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-white/60"
          }`}
        >
          {day}
        </div>
      ))}
    </div>
  );
});

const DayCell = memo(function DayCell({
  day,
  isToday,
  onClick,
}: {
  day: CalendarDayFortune;
  isToday: boolean;
  onClick: () => void;
}) {
  const colors = GRADE_COLORS[day.grade];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        aspect-square rounded-lg text-xs font-medium
        flex flex-col items-center justify-center gap-0.5
        transition-all cursor-pointer relative
        ${getGradeBgColorClass(day.grade)}
        ${isToday ? "ring-2 ring-purple-400 ring-offset-1 ring-offset-gray-900" : ""}
        hover:ring-2 hover:ring-white/30
      `}
    >
      <span
        className={`
          ${day.dayOfWeek === 0 ? "text-red-300" : day.dayOfWeek === 6 ? "text-blue-300" : "text-white"}
        `}
      >
        {day.dayOfMonth}
      </span>
      <span className={`text-[10px] px-1 rounded ${colors.bg} ${colors.text}`}>
        {day.score}
      </span>
    </motion.button>
  );
});

const EmptyCell = memo(function EmptyCell() {
  return <div className="aspect-square" />;
});

const DayDetailModal = memo(function DayDetailModal({
  day,
  onClose,
}: {
  day: CalendarDayFortune;
  onClose: () => void;
}) {
  const colors = GRADE_COLORS[day.grade];
  const date = new Date(day.date);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white font-bold text-lg">
              {date.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </p>
            <p className="text-white/50 text-sm">
              {day.pillar.ganZhiKorean} ({day.pillar.ganZhi})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Score and Grade */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`px-4 py-2 rounded-xl ${colors.bg} ${colors.text} font-bold text-xl`}
          >
            {day.score}점
          </div>
          <div>
            <p className={`font-semibold ${colors.text.replace("text-white", "text-white")}`}>
              {day.gradeKorean}
            </p>
            <p className="text-white/50 text-xs">
              용신 관계:{" "}
              {day.usefulGodRelation === "support"
                ? "💪 강화"
                : day.usefulGodRelation === "against"
                ? "🔻 약화"
                : "➖ 중립"}
            </p>
          </div>
        </div>

        {/* Highlights */}
        {day.highlights.length > 0 && (
          <div className="mb-4">
            <p className="text-white/70 text-xs mb-2 flex items-center gap-1">
              <Info className="w-3 h-3" /> 오늘의 특징
            </p>
            <div className="flex flex-wrap gap-1">
              {day.highlights.map((highlight, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/80"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Good For */}
        {day.goodFor.length > 0 && (
          <div className="mb-3">
            <p className="text-green-400 text-xs mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" weight="fill" /> 좋은 일
            </p>
            <div className="flex flex-wrap gap-1">
              {day.goodFor.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bad For */}
        {day.badFor.length > 0 && (
          <div>
            <p className="text-orange-400 text-xs mb-2 flex items-center gap-1">
              <Warning className="w-3 h-3" weight="fill" /> 피할 일
            </p>
            <div className="flex flex-wrap gap-1">
              {day.badFor.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});

const CalendarLegend = memo(function CalendarLegend() {
  return (
    <div className="flex justify-center gap-3 mt-4 text-xs">
      {(Object.keys(GRADE_LABELS) as FortuneGrade[]).map((grade) => (
        <span key={grade} className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${GRADE_COLORS[grade].bg}`} />
          <span className="text-white/60">{GRADE_LABELS[grade]}</span>
        </span>
      ))}
    </div>
  );
});

const MonthStatistics = memo(function MonthStatistics({
  calendar,
}: {
  calendar: FortuneCalendarResult;
}) {
  const { statistics, excellentDays, goodDays, cautionDays } = calendar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-purple-400" weight="fill" />
        <span className="text-sm font-medium text-white">이달의 운세 요약</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-white/50">평균 점수</span>
          <p className="text-white font-semibold text-lg">{statistics.averageScore}점</p>
        </div>
        <div>
          <span className="text-white/50">최고/최저</span>
          <p className="text-white font-medium">
            <span className="text-green-400">{statistics.maxScore}</span>
            {" / "}
            <span className="text-orange-400">{statistics.minScore}</span>
          </p>
        </div>
        <div>
          <span className="text-white/50">대길일</span>
          <p className="text-green-400 font-medium">{statistics.excellentCount}일</p>
        </div>
        <div>
          <span className="text-white/50">주의일</span>
          <p className="text-orange-400 font-medium">{statistics.cautionCount}일</p>
        </div>
      </div>

      {excellentDays.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-white/50 text-xs mb-1">🌟 대길일</p>
          <p className="text-green-300 text-xs">
            {excellentDays.slice(0, 5).map((d) => {
              const date = new Date(d);
              return `${date.getDate()}일`;
            }).join(", ")}
            {excellentDays.length > 5 && ` 외 ${excellentDays.length - 5}일`}
          </p>
        </div>
      )}
    </motion.div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const FortuneCalendar = memo(function FortuneCalendar({
  shareId,
  initialYear,
  initialMonth,
}: FortuneCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(initialYear || now.getFullYear());
  const [month, setMonth] = useState(initialMonth || now.getMonth() + 1);
  const [calendar, setCalendar] = useState<FortuneCalendarResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDayFortune | null>(null);

  // Fetch calendar data
  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          shareId,
          year: year.toString(),
          month: month.toString(),
        });

        const res = await fetch(`/api/saju/fortune/calendar?${params}`);
        const json = await res.json();

        if (json.success) {
          setCalendar(json.data);
        } else {
          setError(json.error || "캘린더를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("Failed to fetch calendar:", err);
        setError("캘린더를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchCalendar();
  }, [shareId, year, month]);

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  // Calculate calendar grid with empty cells for alignment
  const calendarGrid = useMemo(() => {
    if (!calendar) return [];

    const firstDay = calendar.days[0];
    const firstDayOfWeek = new Date(firstDay.date).getDay();

    const grid: (CalendarDayFortune | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }

    // Add actual days
    grid.push(...calendar.days);

    return grid;
  }, [calendar]);

  // Check if a day is today
  const isToday = useCallback((date: string) => {
    const today = new Date();
    const dayDate = new Date(date);
    return (
      today.getFullYear() === dayDate.getFullYear() &&
      today.getMonth() === dayDate.getMonth() &&
      today.getDate() === dayDate.getDate()
    );
  }, []);

  if (loading) {
    return <CalendarLoading />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!calendar) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Header with navigation */}
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Weekday headers */}
      <WeekdayHeader />

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.map((day, i) =>
          day ? (
            <DayCell
              key={day.date}
              day={day}
              isToday={isToday(day.date)}
              onClick={() => setSelectedDay(day)}
            />
          ) : (
            <EmptyCell key={`empty-${i}`} />
          )
        )}
      </div>

      {/* Legend */}
      <CalendarLegend />

      {/* Statistics */}
      <MonthStatistics calendar={calendar} />

      {/* Day detail modal */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
        )}
      </AnimatePresence>
    </div>
  );
});

export default FortuneCalendar;
