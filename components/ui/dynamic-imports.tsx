"use client";

import dynamic from "next/dynamic";

// Loading skeleton for markdown content
function MarkdownSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-4 bg-white/10 rounded w-full" />
      <div className="h-4 bg-white/10 rounded w-5/6" />
      <div className="h-4 bg-white/10 rounded w-2/3" />
    </div>
  );
}

// Loading skeleton for charts
function ChartSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-center h-full min-h-[200px]">
      <div className="w-full h-full bg-white/5 rounded-lg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}

// Dynamically imported MarkdownRenderer
export const DynamicMarkdownRenderer = dynamic(
  () => import("@/components/ui/MarkdownRenderer").then((mod) => mod.MarkdownRenderer),
  {
    loading: () => <MarkdownSkeleton />,
    ssr: false,
  }
);

// Dynamically imported Chart components
export const DynamicLineChart = dynamic(
  () => import("@/app/[locale]/(main)/deck/components/charts/ChartWrapper").then((mod) => mod.LineChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const DynamicBarChart = dynamic(
  () => import("@/app/[locale]/(main)/deck/components/charts/ChartWrapper").then((mod) => mod.BarChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const DynamicDoughnutChart = dynamic(
  () => import("@/app/[locale]/(main)/deck/components/charts/ChartWrapper").then((mod) => mod.DoughnutChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const DynamicPieChart = dynamic(
  () => import("@/app/[locale]/(main)/deck/components/charts/ChartWrapper").then((mod) => mod.PieChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
