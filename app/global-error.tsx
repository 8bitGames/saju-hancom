"use client";

import { useEffect } from "react";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="bg-[#0f0a1a] min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <WarningCircle className="w-12 h-12 text-red-400" weight="fill" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            심각한 오류가 발생했습니다
          </h2>

          <p className="text-white/60 mb-8 max-w-sm leading-relaxed">
            예상치 못한 오류가 발생했습니다.
            <br />
            문제가 지속되면 고객센터로 문의해주세요.
          </p>

          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
          >
            <ArrowClockwise className="w-5 h-5" weight="bold" />
            다시 시도
          </button>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-8 w-full max-w-md text-left">
              <summary className="text-sm text-white/40 cursor-pointer hover:text-white/60">
                개발자 정보 보기
              </summary>
              <pre className="mt-2 text-xs text-red-400/80 bg-red-500/10 p-3 rounded-lg overflow-auto max-h-40">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
