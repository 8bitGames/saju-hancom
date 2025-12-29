"use client";

import { ReactNode } from "react";
import {
  ClockCounterClockwise,
  MagnifyingGlass,
  FileX,
  WifiSlash,
  Warning
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type EmptyStateType = "history" | "search" | "data" | "offline" | "error" | "custom";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

const defaultContent: Record<EmptyStateType, { icon: ReactNode; title: string; description: string }> = {
  history: {
    icon: <ClockCounterClockwise className="w-10 h-10" />,
    title: "기록이 없습니다",
    description: "아직 저장된 분석 결과가 없습니다.",
  },
  search: {
    icon: <MagnifyingGlass className="w-10 h-10" />,
    title: "검색 결과가 없습니다",
    description: "다른 검색어로 다시 시도해보세요.",
  },
  data: {
    icon: <FileX className="w-10 h-10" />,
    title: "데이터가 없습니다",
    description: "표시할 데이터가 없습니다.",
  },
  offline: {
    icon: <WifiSlash className="w-10 h-10" />,
    title: "오프라인 상태",
    description: "인터넷 연결을 확인해주세요.",
  },
  error: {
    icon: <Warning className="w-10 h-10" />,
    title: "오류 발생",
    description: "문제가 발생했습니다. 다시 시도해주세요.",
  },
  custom: {
    icon: null,
    title: "",
    description: "",
  },
};

export function EmptyState({
  type = "data",
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const defaults = defaultContent[type];
  const displayIcon = icon ?? defaults.icon;
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
      role="status"
      aria-label={displayTitle}
    >
      {displayIcon && (
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/30">
          {displayIcon}
        </div>
      )}

      {displayTitle && (
        <h3 className="text-lg font-semibold text-white mb-2">{displayTitle}</h3>
      )}

      {displayDescription && (
        <p className="text-white/60 mb-6 max-w-sm">{displayDescription}</p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium transition-colors",
                action.variant === "secondary"
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              )}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Inline empty state for smaller spaces
export function InlineEmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "py-8 text-center text-white/50 text-sm",
        className
      )}
      role="status"
    >
      {message}
    </div>
  );
}
