"use client";

import { MagnifyingGlass, House, ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
        <MagnifyingGlass className="w-12 h-12 text-purple-400" weight="fill" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        페이지를 찾을 수 없습니다
      </h2>

      <p className="text-white/60 mb-8 max-w-sm leading-relaxed">
        요청하신 페이지가 존재하지 않거나
        <br />
        이동되었을 수 있습니다.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors w-full"
        >
          <ArrowLeft className="w-5 h-5" weight="bold" />
          뒤로 가기
        </button>

        <a
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors w-full"
        >
          <House className="w-5 h-5" weight="bold" />
          홈으로
        </a>
      </div>
    </div>
  );
}
