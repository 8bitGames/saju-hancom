"use client";

import { Component, ReactNode } from "react";
import { WarningCircle, ArrowClockwise, House } from "@phosphor-icons/react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service (e.g., Sentry)
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  onRetry,
  title = "문제가 발생했습니다",
  description = "일시적인 오류가 발생했습니다. 다시 시도해주세요.",
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <WarningCircle className="w-10 h-10 text-red-400" weight="fill" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/60 mb-6 max-w-sm">{description}</p>

      {process.env.NODE_ENV === "development" && error && (
        <pre className="text-xs text-red-400/80 bg-red-500/10 p-3 rounded-lg mb-6 max-w-full overflow-auto">
          {error.message}
        </pre>
      )}

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
          >
            <ArrowClockwise className="w-4 h-4" weight="bold" />
            다시 시도
          </button>
        )}
        <a
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
        >
          <House className="w-4 h-4" weight="bold" />
          홈으로
        </a>
      </div>
    </div>
  );
}

// API Error Fallback with more specific messaging
interface ApiErrorFallbackProps {
  onRetry?: () => void;
  errorType?: "network" | "server" | "timeout" | "unknown";
}

export function ApiErrorFallback({ onRetry, errorType = "unknown" }: ApiErrorFallbackProps) {
  const errorMessages = {
    network: {
      title: "네트워크 연결 오류",
      description: "인터넷 연결을 확인하고 다시 시도해주세요.",
    },
    server: {
      title: "서버 오류",
      description: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    },
    timeout: {
      title: "요청 시간 초과",
      description: "응답 시간이 너무 오래 걸립니다. 다시 시도해주세요.",
    },
    unknown: {
      title: "오류 발생",
      description: "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.",
    },
  };

  const { title, description } = errorMessages[errorType];

  return <ErrorFallback title={title} description={description} onRetry={onRetry} />;
}
