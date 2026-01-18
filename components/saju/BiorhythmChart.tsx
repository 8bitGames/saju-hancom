"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  Heartbeat,
  Heart,
  Brain,
  Warning,
  Star,
  CalendarBlank,
} from "@phosphor-icons/react";
import type { BiorhythmResult, BiorhythmPoint } from "@/lib/biorhythm/calculator";
import {
  getStatusText,
  getStatusColor,
  getStatusBgColor,
  getRhythmLabel,
} from "@/lib/biorhythm/calculator";

// ============================================================================
// Types
// ============================================================================

interface BiorhythmChartProps {
  shareId: string;
  days?: number;
}

// ============================================================================
// Loading Component
// ============================================================================

function BiorhythmLoading() {
  return (
    <div className="space-y-4">
      {/* Status cards skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      {/* Info skeleton */}
      <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

const StatusCard = memo(function StatusCard({
  type,
  value,
  icon: Icon,
  color,
  delay,
}: {
  type: "physical" | "emotional" | "intellectual";
  value: number;
  icon: typeof Heartbeat;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-4 rounded-xl ${getStatusBgColor(value)} border border-white/10`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} weight="fill" />
        <span className="text-xs text-white/60">{getRhythmLabel(type)}</span>
      </div>
      <p className={`text-2xl font-bold ${getStatusColor(value)}`}>{value}%</p>
      <p className="text-xs text-white/50 mt-1">{getStatusText(value)}</p>
    </motion.div>
  );
});

const CriticalDaysAlert = memo(function CriticalDaysAlert({
  criticalDays,
}: {
  criticalDays: BiorhythmResult["criticalDays"];
}) {
  if (criticalDays.length === 0) return null;

  // 최대 5개까지만 표시
  const displayDays = criticalDays.slice(0, 5);
  const typeColors = {
    physical: "text-red-400",
    emotional: "text-green-400",
    intellectual: "text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
    >
      <div className="flex items-center gap-2 mb-2">
        <Warning className="w-4 h-4 text-yellow-400" weight="fill" />
        <span className="text-sm font-medium text-yellow-400">주의 필요일</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayDays.map((day, i) => (
          <span
            key={i}
            className={`px-2 py-1 rounded-full bg-white/5 text-xs ${
              typeColors[day.type]
            }`}
          >
            {new Date(day.date).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            })}
            ({getRhythmLabel(day.type)})
          </span>
        ))}
      </div>
      <p className="text-xs text-white/40 mt-2">
        이 날들은 바이오리듬이 0에 가까운 변환점입니다. 컨디션 관리에 주의하세요.
      </p>
    </motion.div>
  );
});

const BestDaysInfo = memo(function BestDaysInfo({
  bestDays,
}: {
  bestDays: BiorhythmResult["bestDays"];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-purple-400" weight="fill" />
        <span className="text-sm font-medium text-white">최고의 날 예측</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-white/50">종합 최고일</span>
          <p className="text-white font-medium mt-1 flex items-center gap-1">
            <CalendarBlank className="w-3 h-3" />
            {new Date(bestDays.overallBest.date).toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <span className="text-white/50">신체 최고일</span>
          <p className="text-red-300 font-medium mt-1">
            {new Date(bestDays.physicalBest.date).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            })}{" "}
            ({bestDays.physicalBest.value}%)
          </p>
        </div>
        <div>
          <span className="text-white/50">감성 최고일</span>
          <p className="text-green-300 font-medium mt-1">
            {new Date(bestDays.emotionalBest.date).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            })}{" "}
            ({bestDays.emotionalBest.value}%)
          </p>
        </div>
        <div>
          <span className="text-white/50">지성 최고일</span>
          <p className="text-blue-300 font-medium mt-1">
            {new Date(bestDays.intellectualBest.date).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            })}{" "}
            ({bestDays.intellectualBest.value}%)
          </p>
        </div>
      </div>
    </motion.div>
  );
});

// Custom tooltip for the chart
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || !label) return null;

  const date = new Date(label);
  const formattedDate = date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="bg-gray-900/95 border border-white/20 rounded-lg p-3 shadow-xl">
      <p className="text-white text-sm font-medium mb-2">{formattedDate}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const labels: Record<string, string> = {
            physical: "신체",
            emotional: "감성",
            intellectual: "지성",
          };
          return (
            <p
              key={index}
              className="text-xs flex items-center gap-2"
              style={{ color: entry.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {labels[entry.dataKey]}: {entry.value}%
            </p>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const BiorhythmChart = memo(function BiorhythmChart({
  shareId,
  days = 30,
}: BiorhythmChartProps) {
  const [data, setData] = useState<BiorhythmResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ shareId, days: days.toString() });
        const res = await fetch(`/api/saju/fortune/biorhythm?${params}`);
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("Failed to fetch biorhythm:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [shareId, days]);

  // Chart data formatting
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.forecast.map((point) => ({
      ...point,
      // Format date for display
      displayDate: new Date(point.date).getDate().toString(),
    }));
  }, [data]);

  if (loading) {
    return <BiorhythmLoading />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Today's Status */}
      <div className="grid grid-cols-3 gap-3">
        <StatusCard
          type="physical"
          value={data.today.physical}
          icon={Heartbeat}
          color="text-red-400"
          delay={0}
        />
        <StatusCard
          type="emotional"
          value={data.today.emotional}
          icon={Heart}
          color="text-green-400"
          delay={0.1}
        />
        <StatusCard
          type="intellectual"
          value={data.today.intellectual}
          icon={Brain}
          color="text-blue-400"
          delay={0.2}
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-white/5 border border-white/10"
      >
        <p className="text-xs text-white/50 mb-3">30일 바이오리듬 예측</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <YAxis
                domain={[-100, 100]}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                ticks={[-100, -50, 0, 50, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    physical: "신체",
                    emotional: "감성",
                    intellectual: "지성",
                  };
                  return (
                    <span className="text-xs text-white/70">
                      {labels[value] || value}
                    </span>
                  );
                }}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="physical"
                name="physical"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#EF4444" }}
              />
              <Line
                type="monotone"
                dataKey="emotional"
                name="emotional"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#22C55E" }}
              />
              <Line
                type="monotone"
                dataKey="intellectual"
                name="intellectual"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#3B82F6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Critical Days Alert */}
      <CriticalDaysAlert criticalDays={data.criticalDays} />

      {/* Best Days Info */}
      <BestDaysInfo bestDays={data.bestDays} />
    </div>
  );
});

export default BiorhythmChart;
