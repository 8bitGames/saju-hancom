"use client";

import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { MoonStars, PaperPlaneTilt, SpinnerGap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface DreamInputProps {
  onSubmit: (dreamContent: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

/**
 * 꿈 내용 입력 컴포넌트
 */
export function DreamInput({ onSubmit, isLoading, disabled }: DreamInputProps) {
  const [dreamContent, setDreamContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = dreamContent.trim();
    if (trimmed.length < 10) {
      setError("꿈 내용을 10자 이상 입력해주세요.");
      return;
    }

    if (trimmed.length > 2000) {
      setError("꿈 내용은 2000자를 초과할 수 없습니다.");
      return;
    }

    await onSubmit(trimmed);
  };

  const charCount = dreamContent.length;
  const isValidLength = charCount >= 10 && charCount <= 2000;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#C4A35A]/10 flex items-center justify-center">
          <MoonStars className="w-6 h-6 text-[#C4A35A]" weight="fill" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">꿈 해몽</h2>
          <p className="text-sm text-gray-500">
            꿈을 이야기해주시면 전통 해몽으로 풀이해 드립니다
          </p>
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="relative">
        <textarea
          value={dreamContent}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDreamContent(e.target.value)}
          placeholder="간밤에 꾼 꿈을 자세히 적어주세요...

예시: 높은 산 정상에서 용이 하늘로 올라가는 것을 보았습니다. 용의 몸은 황금빛으로 빛나고 있었고, 저는 그 광경을 지켜보며 큰 감동을 느꼈습니다."
          className="w-full min-h-[180px] p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 resize-none pr-16 focus:outline-none focus:ring-2 focus:ring-[#C4A35A]/50 focus:border-[#C4A35A]/50"
          disabled={isLoading || disabled}
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          <span className={charCount < 10 ? "text-orange-500" : charCount > 2000 ? "text-red-500" : "text-gray-400"}>
            {charCount}
          </span>
          /2000
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}

      {/* 안내 문구 */}
      <div className="bg-[#C4A35A]/10 rounded-lg p-3 text-sm text-gray-600">
        <p className="flex items-start gap-2">
          <span className="text-[#C4A35A]">💡</span>
          <span>
            꿈에서 본 장면, 등장인물, 느낌 등을 구체적으로 적어주시면
            더 정확한 해몽을 받을 수 있습니다.
          </span>
        </p>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={!isValidLength || isLoading || disabled}
        className="w-full bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] hover:from-[#b8974e] hover:to-[#9c8344] text-white"
      >
        {isLoading ? (
          <>
            <SpinnerGap className="w-4 h-4 mr-2 animate-spin" />
            해몽 중...
          </>
        ) : (
          <>
            <PaperPlaneTilt className="w-4 h-4 mr-2" weight="fill" />
            꿈 해석하기
          </>
        )}
      </Button>
    </motion.form>
  );
}
