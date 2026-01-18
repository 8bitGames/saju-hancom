"use client";

import { cn } from "@/lib/utils";
import { Spinner, CircleNotch } from "@phosphor-icons/react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} role="status">
      <CircleNotch
        className={cn(sizeClasses[size], "animate-spin text-[#C4A35A]")}
        weight="bold"
      />
      {label && <span className="text-gray-500 text-sm">{label}</span>}
      <span className="sr-only">{label || "로딩 중..."}</span>
    </div>
  );
}

// Full page loading state
interface FullPageLoadingProps {
  message?: string;
  submessage?: string;
}

export function FullPageLoading({
  message = "불러오는 중...",
  submessage
}: FullPageLoadingProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-[#C4A35A]/20 border-t-[#C4A35A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-[#C4A35A]/20 animate-pulse" />
        </div>
      </div>

      <p className="mt-6 text-gray-800 font-medium">{message}</p>
      {submessage && (
        <p className="mt-2 text-gray-500 text-sm">{submessage}</p>
      )}
    </div>
  );
}

// Inline loading for buttons
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function ButtonLoading({ loading, children, loadingText }: ButtonLoadingProps) {
  if (loading) {
    return (
      <span className="flex items-center gap-2">
        <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
        {loadingText || "처리 중..."}
      </span>
    );
  }
  return <>{children}</>;
}

// Progress bar for multi-step processes
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

// Skeleton pulse for content loading
export function ContentSkeleton({
  lines = 3,
  className
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)} role="status" aria-label="콘텐츠 로딩 중">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-200 rounded",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
      <span className="sr-only">콘텐츠를 불러오는 중입니다</span>
    </div>
  );
}
