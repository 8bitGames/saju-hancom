"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Radix Popover hydration mismatch 방지용 훅
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
import {
  STEM_DESCRIPTIONS,
  BRANCH_DESCRIPTIONS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_COLORS,
  ELEMENT_KOREAN,
  TEN_GOD_INFO,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
} from "@/lib/saju/constants";
import type { Gan, Zhi, TenGod, Element } from "@/lib/saju/types";

type TooltipType = "stem" | "branch" | "tenGod" | "element";

interface SajuTooltipProps {
  /** 표시할 텍스트 (한자 또는 한글) */
  text: string;
  /** 툴팁 타입 */
  type: TooltipType;
  /** 오행 색상 표시 여부 */
  showElementColor?: boolean;
  /** 커스텀 설명 (기본 설명 대신 사용) */
  customDescription?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 사주 용어 툴팁 컴포넌트
 * 모바일 친화적 - 탭하면 팝오버로 설명 표시
 */
export function SajuTooltip({
  text,
  type,
  showElementColor = true,
  customDescription,
  className = "",
}: SajuTooltipProps) {
  const mounted = useIsMounted();
  const [open, setOpen] = useState(false);

  // 설명 텍스트 가져오기
  const getDescription = (): string => {
    if (customDescription) return customDescription;

    switch (type) {
      case "stem":
        return STEM_DESCRIPTIONS[text as Gan] || `${text} - 천간`;
      case "branch":
        return BRANCH_DESCRIPTIONS[text as Zhi] || `${text} - 지지`;
      case "tenGod":
        const tenGodKey = Object.keys(TEN_GOD_INFO).find(
          (key) => TEN_GOD_INFO[key as TenGod].korean === text ||
                   TEN_GOD_INFO[key as TenGod].hanja === text
        ) as TenGod | undefined;
        if (tenGodKey) {
          const info = TEN_GOD_INFO[tenGodKey];
          return `${info.korean}(${info.hanja}) - ${info.description}`;
        }
        return `${text} - 십성`;
      case "element":
        const elementKey = Object.entries(ELEMENT_KOREAN).find(
          ([, value]) => value === text || value.includes(text)
        )?.[0] as Element | undefined;
        if (elementKey) {
          return `${ELEMENT_KOREAN[elementKey]} - 오행`;
        }
        return `${text} - 오행`;
      default:
        return text;
    }
  };

  // 오행 색상 가져오기
  const getElementColor = (): string | null => {
    if (!showElementColor) return null;

    switch (type) {
      case "stem":
        if (HEAVENLY_STEMS.includes(text as Gan)) {
          return ELEMENT_COLORS[STEM_ELEMENTS[text as Gan]];
        }
        return null;
      case "branch":
        if (EARTHLY_BRANCHES.includes(text as Zhi)) {
          return ELEMENT_COLORS[BRANCH_ELEMENTS[text as Zhi]];
        }
        return null;
      case "element":
        const elementKey = Object.entries(ELEMENT_KOREAN).find(
          ([, value]) => value === text || value.includes(text)
        )?.[0] as Element | undefined;
        if (elementKey) {
          return ELEMENT_COLORS[elementKey];
        }
        return null;
      default:
        return null;
    }
  };

  const elementColor = getElementColor();
  const description = getDescription();

  const buttonEl = (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center
        px-1 py-0.5 rounded
        underline decoration-dotted decoration-gray-300 underline-offset-2
        hover:bg-gray-100 active:bg-gray-200
        transition-colors cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#C4A35A]/50
        ${className}
      `}
      style={elementColor ? { color: elementColor } : undefined}
      onClick={() => setOpen(!open)}
    >
      {text}
    </button>
  );

  if (!mounted) {
    return buttonEl;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {buttonEl}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[280px] p-3 bg-white border-gray-200 text-gray-800 shadow-lg"
        sideOffset={8}
        align="center"
      >
        <div className="space-y-1">
          {/* 오행 색상 인디케이터 */}
          {elementColor && (
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: elementColor }}
              />
              <span className="text-xs text-gray-500">
                {type === "stem" && ELEMENT_KOREAN[STEM_ELEMENTS[text as Gan]]}
                {type === "branch" && ELEMENT_KOREAN[BRANCH_ELEMENTS[text as Zhi]]}
              </span>
            </div>
          )}
          {/* 설명 */}
          <p className="text-sm leading-relaxed">{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * 텍스트 내의 사주 용어를 자동으로 툴팁으로 변환
 */
interface SajuTextWithTooltipsProps {
  text: string;
  className?: string;
}

export function SajuTextWithTooltips({ text, className = "" }: SajuTextWithTooltipsProps) {
  // 천간/지지 한자 패턴
  const stemPattern = /[甲乙丙丁戊己庚辛壬癸]/g;
  const branchPattern = /[子丑寅卯辰巳午未申酉戌亥]/g;

  // 텍스트를 파싱하여 툴팁으로 변환
  const parts: Array<{ type: "text" | "stem" | "branch"; content: string }> = [];
  let lastIndex = 0;

  // 모든 매칭 찾기
  const allMatches: Array<{ index: number; char: string; type: "stem" | "branch" }> = [];

  let match;
  while ((match = stemPattern.exec(text)) !== null) {
    allMatches.push({ index: match.index, char: match[0], type: "stem" });
  }
  while ((match = branchPattern.exec(text)) !== null) {
    allMatches.push({ index: match.index, char: match[0], type: "branch" });
  }

  // 인덱스 순으로 정렬
  allMatches.sort((a, b) => a.index - b.index);

  // 파트 생성
  for (const m of allMatches) {
    if (m.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, m.index) });
    }
    parts.push({ type: m.type, content: m.char });
    lastIndex = m.index + 1;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <span key={i}>{part.content}</span>
        ) : (
          <SajuTooltip key={i} text={part.content} type={part.type} />
        )
      )}
    </span>
  );
}
