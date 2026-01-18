"use client";

import { motion } from "framer-motion";
import {
  Star,
  Sparkle,
  Warning,
  Lightbulb,
  Hash,
  Leaf,
  Flame,
  Mountains,
  Drop,
  Coin,
} from "@phosphor-icons/react";

interface DreamSymbol {
  symbol: string;
  meaning: string;
  fortune: "good" | "neutral" | "caution";
}

interface DreamInterpretationResult {
  symbols: DreamSymbol[];
  overallFortune: "good" | "neutral" | "caution";
  interpretation: string;
  advice: string;
  luckyNumbers: number[];
  relatedElements: string[];
}

interface DreamResultProps {
  result: DreamInterpretationResult;
  onReset: () => void;
}

/**
 * 오행 요소 아이콘 매핑
 */
const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  목: <Leaf className="w-4 h-4" weight="fill" />,
  화: <Flame className="w-4 h-4" weight="fill" />,
  토: <Mountains className="w-4 h-4" weight="fill" />,
  금: <Coin className="w-4 h-4" weight="fill" />,
  수: <Drop className="w-4 h-4" weight="fill" />,
};

/**
 * 오행 요소 색상 매핑
 */
const ELEMENT_COLORS: Record<string, string> = {
  목: "bg-green-500/20 text-green-400 border-green-500/30",
  화: "bg-red-500/20 text-red-400 border-red-500/30",
  토: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  금: "bg-slate-300/20 text-slate-300 border-slate-300/30",
  수: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

/**
 * 운세 등급별 스타일
 */
const FORTUNE_STYLES = {
  good: {
    bg: "bg-green-500/20",
    border: "border-green-500/30",
    text: "text-green-400",
    label: "길몽",
    icon: <Star className="w-5 h-5" weight="fill" />,
    description: "좋은 징조의 꿈입니다",
  },
  neutral: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
    label: "평몽",
    icon: <Sparkle className="w-5 h-5" weight="fill" />,
    description: "중립적인 의미의 꿈입니다",
  },
  caution: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    text: "text-orange-400",
    label: "주의",
    icon: <Warning className="w-5 h-5" weight="fill" />,
    description: "주의가 필요한 암시가 있습니다",
  },
};

/**
 * 꿈 해석 결과 컴포넌트
 */
export function DreamResult({ result, onReset }: DreamResultProps) {
  const fortuneStyle = FORTUNE_STYLES[result.overallFortune];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 전체 운세 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl p-5 border ${fortuneStyle.bg} ${fortuneStyle.border}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full ${fortuneStyle.bg} ${fortuneStyle.text}`}>
            {fortuneStyle.icon}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${fortuneStyle.text}`}>
              {fortuneStyle.label}
            </h3>
            <p className="text-sm text-white/60">{fortuneStyle.description}</p>
          </div>
        </div>
      </motion.div>

      {/* 꿈의 상징들 */}
      {result.symbols.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-medium text-white/80">꿈의 상징</h4>
          <div className="grid grid-cols-1 gap-2">
            {result.symbols.map((symbol, index) => {
              const style = FORTUNE_STYLES[symbol.fortune];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}
                >
                  <span className={`font-semibold ${style.text}`}>
                    {symbol.symbol}
                  </span>
                  <span className="text-sm text-white/70 flex-1">
                    {symbol.meaning}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 상세 해석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <h4 className="text-sm font-medium text-white/80 mb-3">상세 해석</h4>
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
          {result.interpretation}
        </p>
      </motion.div>

      {/* 조언 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30"
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" weight="fill" />
          <div>
            <h4 className="text-sm font-medium text-indigo-400 mb-1">조언</h4>
            <p className="text-white/80 text-sm">{result.advice}</p>
          </div>
        </div>
      </motion.div>

      {/* 행운의 숫자 & 관련 오행 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-4"
      >
        {/* 행운의 숫자 */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-purple-400" weight="bold" />
            <h4 className="text-sm font-medium text-white/80">행운의 숫자</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.luckyNumbers.map((num, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium"
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* 관련 오행 */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-medium text-white/80 mb-3">관련 오행</h4>
          <div className="flex flex-wrap gap-2">
            {result.relatedElements.map((element, index) => (
              <span
                key={index}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                  ELEMENT_COLORS[element] || "bg-gray-500/20 text-gray-400"
                }`}
              >
                {ELEMENT_ICONS[element]}
                {element}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 다시 하기 버튼 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={onReset}
        className="w-full py-3 text-white/70 hover:text-white transition-colors text-sm"
      >
        다른 꿈 해석하기
      </motion.button>
    </motion.div>
  );
}
