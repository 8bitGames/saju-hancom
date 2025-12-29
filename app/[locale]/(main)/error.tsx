"use client";

import { useEffect } from "react";
import { WarningCircle, ArrowClockwise, House } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error tracking service (e.g., Sentry)
    console.error("Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <WarningCircle className="w-12 h-12 text-red-400" weight="fill" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        문제가 발생했습니다
      </h2>

      <p className="text-white/60 mb-8 max-w-sm leading-relaxed">
        일시적인 오류가 발생했습니다.
        <br />
        잠시 후 다시 시도해주세요.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors w-full"
        >
          <ArrowClockwise className="w-5 h-5" weight="bold" />
          다시 시도
        </button>

        <a
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors w-full"
        >
          <House className="w-5 h-5" weight="bold" />
          홈으로
        </a>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 w-full max-w-sm text-left">
          <summary className="text-sm text-white/40 cursor-pointer hover:text-white/60">
            개발자 정보 보기
          </summary>
          <pre className="mt-2 text-xs text-red-400/80 bg-red-500/10 p-3 rounded-lg overflow-auto max-h-32">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>
      )}
    </div>
  );
}
