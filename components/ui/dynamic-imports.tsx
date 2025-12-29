"use client";

import dynamic from "next/dynamic";

// ================================
// Loading Skeletons
// ================================

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

function ChartSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-center h-full min-h-[200px]">
      <div className="w-full h-full bg-white/5 rounded-lg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 bg-white/10 rounded w-1/2 mx-auto" />
      <div className="h-4 bg-white/10 rounded w-3/4 mx-auto" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}

function DialogSkeleton() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-6 bg-white/10 rounded w-1/3" />
      <div className="h-4 bg-white/10 rounded w-2/3" />
      <div className="h-10 bg-white/5 rounded-lg mt-4" />
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-4">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
      <div className="h-12 bg-white/5 rounded-xl" />
    </div>
  );
}

function AceternitySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-full bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl" />
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

// ================================
// Dynamically imported Heavy Components
// ================================

// Face Reading Form - Uses camera API
export const DynamicFaceReadingForm = dynamic(
  () => import("@/components/face-reading/face-reading-form").then((mod) => mod.FaceReadingForm),
  {
    loading: () => <FormSkeleton />,
    ssr: false,
  }
);

// Saju Chat Panel - AI chat interface
export const DynamicSajuChatPanel = dynamic(
  () => import("@/components/saju/SajuChatPanel").then((mod) => mod.SajuChatPanel),
  {
    loading: () => <ChatSkeleton />,
    ssr: false,
  }
);

// Auth Dialog - Authentication modal
export const DynamicAuthDialog = dynamic(
  () => import("@/components/auth/AuthDialog").then((mod) => mod.AuthDialog),
  {
    loading: () => <DialogSkeleton />,
    ssr: false,
  }
);

// Upgrade Dialog - Premium upgrade modal
export const DynamicUpgradeDialog = dynamic(
  () => import("@/components/auth/UpgradeDialog").then((mod) => mod.UpgradeDialog),
  {
    loading: () => <DialogSkeleton />,
    ssr: false,
  }
);

// Login CTA Modal
export const DynamicLoginCTAModal = dynamic(
  () => import("@/components/auth/LoginCTAModal").then((mod) => mod.LoginCTAModal),
  {
    loading: () => <DialogSkeleton />,
    ssr: false,
  }
);

// Mystical Loader - Heavy animation component
export const DynamicMysticalLoader = dynamic(
  () => import("@/components/saju/MysticalLoader").then((mod) => mod.MysticalLoader),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

// Detail Analysis Modal
export const DynamicDetailAnalysisModal = dynamic(
  () => import("@/components/saju/DetailAnalysisModal").then((mod) => mod.DetailAnalysisModal),
  {
    loading: () => <DialogSkeleton />,
    ssr: false,
  }
);

// Company Modal
export const DynamicCompanyModal = dynamic(
  () => import("@/components/layout/company-modal").then((mod) => mod.CompanyModal),
  {
    loading: () => <DialogSkeleton />,
    ssr: false,
  }
);

// ================================
// Dynamically imported Aceternity Components (framer-motion heavy)
// ================================

export const DynamicBackgroundGradient = dynamic(
  () => import("@/components/aceternity/background-gradient").then((mod) => mod.BackgroundGradient),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicSparkles = dynamic(
  () => import("@/components/aceternity/sparkles").then((mod) => mod.SparklesCore),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicTextGenerateEffect = dynamic(
  () => import("@/components/aceternity/text-generate-effect").then((mod) => mod.TextGenerateEffect),
  {
    loading: () => <div className="animate-pulse h-6 bg-white/10 rounded" />,
    ssr: false,
  }
);

export const DynamicLamp = dynamic(
  () => import("@/components/aceternity/lamp").then((mod) => mod.LampContainer),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicSpotlight = dynamic(
  () => import("@/components/aceternity/spotlight").then((mod) => mod.Spotlight),
  {
    loading: () => null,
    ssr: false,
  }
);

export const DynamicMeteors = dynamic(
  () => import("@/components/aceternity/meteors").then((mod) => mod.Meteors),
  {
    loading: () => null,
    ssr: false,
  }
);

export const DynamicGlowingStars = dynamic(
  () => import("@/components/aceternity/glowing-stars").then((mod) => mod.GlowingStarsBackgroundCard),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicCardSpotlight = dynamic(
  () => import("@/components/aceternity/card-spotlight").then((mod) => mod.CardSpotlight),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicHoverBorderGradient = dynamic(
  () => import("@/components/aceternity/hover-border-gradient").then((mod) => mod.HoverBorderGradient),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicWobbleCard = dynamic(
  () => import("@/components/aceternity/wobble-card").then((mod) => mod.WobbleCard),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicInfiniteMovingCards = dynamic(
  () => import("@/components/aceternity/infinite-moving-cards").then((mod) => mod.InfiniteMovingCards),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

export const DynamicCardHoverEffect = dynamic(
  () => import("@/components/aceternity/card-hover-effect").then((mod) => mod.HoverEffect),
  {
    loading: () => <AceternitySkeleton />,
    ssr: false,
  }
);

// ================================
// Feature Carousel (framer-motion heavy)
// ================================

export const DynamicFeatureCarousel = dynamic(
  () => import("@/components/ui/feature-carousel").then((mod) => mod.FeatureCarousel),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-white/20 rounded-full" />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);
