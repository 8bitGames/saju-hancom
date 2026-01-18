"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Sun,
  NumberCircleSeven,
  Palette,
  Compass,
  Clock,
  Sparkle,
  CaretRight,
} from "@phosphor-icons/react";
import { FortunePanel } from "@/components/saju/FortunePanel";
import { RecommendationsPanel } from "@/components/recommendation";
import { GUARDIANS, type ElementType } from "@/lib/constants/guardians";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface TodayFortuneContentProps {
  shareId?: string;
  birthYear?: number;
  isPremium?: boolean;
  dominantElement?: ElementType;
  error?: string;
}

// Generate daily lucky items based on date (deterministic)
function generateLuckyItems(dateStr: string) {
  const seed = dateStr.split("-").reduce((acc, n) => acc + parseInt(n), 0);

  const numbers = [1, 3, 5, 7, 8, 9, 11, 13, 17, 21, 23, 28, 33];
  const colors = [
    { name: "빨간색", hex: "#EF4444" },
    { name: "파란색", hex: "#3B82F6" },
    { name: "노란색", hex: "#F59E0B" },
    { name: "초록색", hex: "#22C55E" },
    { name: "보라색", hex: "#8B5CF6" },
    { name: "분홍색", hex: "#EC4899" },
    { name: "하늘색", hex: "#06B6D4" },
    { name: "주황색", hex: "#F97316" },
  ];
  const directions = ["동쪽", "서쪽", "남쪽", "북쪽", "동남쪽", "서남쪽", "동북쪽", "서북쪽"];
  const times = ["오전 6시", "오전 9시", "오전 11시", "오후 1시", "오후 3시", "오후 5시", "오후 7시", "오후 9시"];

  return {
    number: numbers[seed % numbers.length],
    color: colors[seed % colors.length],
    direction: directions[seed % directions.length],
    time: times[seed % times.length],
  };
}

// Generate guardian message based on date and element
function generateGuardianMessage(element: ElementType, dateStr: string): string {
  const messages: Record<ElementType, string[]> = {
    wood: [
      "오늘은 새로운 시작에 좋은 기운이 감돌고 있어요. 도전을 두려워하지 마세요.",
      "성장과 발전의 에너지가 넘치는 하루입니다. 배움에 집중해 보세요.",
      "창의적인 아이디어가 떠오르는 날이에요. 메모해 두세요!",
    ],
    fire: [
      "열정과 활력이 넘치는 하루가 될 거예요. 자신감을 가지세요!",
      "인간관계에서 좋은 일이 생길 수 있어요. 주변 사람들에게 따뜻하게 대해주세요.",
      "적극적인 행동이 좋은 결과를 가져올 거예요.",
    ],
    earth: [
      "안정적인 에너지가 감도는 하루예요. 차분하게 일을 처리하세요.",
      "신뢰와 믿음이 중요한 날입니다. 약속을 꼭 지켜주세요.",
      "꾸준함이 빛을 발하는 날이에요. 기본에 충실하세요.",
    ],
    metal: [
      "결단력이 필요한 날이에요. 망설이지 말고 결정하세요.",
      "정리정돈과 마무리에 좋은 기운이 있어요.",
      "명확한 목표를 세우고 실행에 옮기세요.",
    ],
    water: [
      "직관과 통찰력이 높아지는 날이에요. 내면의 목소리에 귀 기울여 보세요.",
      "유연한 대처가 필요한 하루예요. 흐름에 맡겨보세요.",
      "깊이 있는 대화가 좋은 관계를 만들어줄 거예요.",
    ],
  };

  const seed = dateStr.split("-").reduce((acc, n) => acc + parseInt(n), 0);
  const elementMessages = messages[element];
  return elementMessages[seed % elementMessages.length];
}

export function TodayFortuneContent({
  shareId,
  birthYear,
  isPremium = false,
  dominantElement = "wood",
  error,
}: TodayFortuneContentProps) {
  const locale = useLocale() as Locale;
  const [luckyItems, setLuckyItems] = useState<ReturnType<typeof generateLuckyItems> | null>(null);
  const [guardianMessage, setGuardianMessage] = useState<string>("");

  const guardian = GUARDIANS[dominantElement];

  // Get today's date info
  const today = new Date();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const dateDisplay = `${today.getMonth() + 1}월 ${today.getDate()}일 ${weekdays[today.getDay()]}요일`;

  useEffect(() => {
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    setLuckyItems(generateLuckyItems(dateStr));
    setGuardianMessage(generateGuardianMessage(dominantElement, dateStr));
  }, [dominantElement]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <Sun className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{error}</p>
          <Link href="/saju">
            <button className="px-6 py-3 rounded-xl bg-[#0E4168] text-white font-medium hover:bg-[#0E4168]/90 transition-colors">
              사주 분석하러 가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FC]">
      {/* Header Section with Date */}
      <div className="bg-white px-4 pt-4 pb-5">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-gray-400 mb-1">{dateDisplay}</p>
          <h1 className="text-xl font-bold text-gray-800">오늘의 운세</h1>
        </div>
      </div>

      {/* Guardian Message Card */}
      <div className="px-4 py-3">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex gap-3">
              {/* Guardian Avatar */}
              <div className="flex-shrink-0">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: `${guardian.color}15`,
                    border: `2px solid ${guardian.color}40`,
                  }}
                >
                  <Image
                    src={guardian.imagePath}
                    alt={guardian.name[locale]}
                    width={42}
                    height={42}
                    className="object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: guardian.color }}
                  >
                    {guardian.name[locale]}
                  </span>
                  <Sparkle
                    className="w-4 h-4"
                    style={{ color: guardian.color }}
                    weight="fill"
                  />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {guardianMessage || "오늘의 메시지를 불러오는 중..."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lucky Items Grid */}
      <div className="px-4 py-2">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              오늘의 행운
            </h3>

            {luckyItems ? (
              <div className="grid grid-cols-4 gap-2">
                {/* Lucky Number */}
                <div className="flex flex-col items-center p-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-1.5">
                    <NumberCircleSeven className="w-5 h-5 text-purple-500" weight="fill" />
                  </div>
                  <p className="text-[10px] text-gray-400">숫자</p>
                  <p className="text-sm font-bold text-gray-800">{luckyItems.number}</p>
                </div>

                {/* Lucky Color */}
                <div className="flex flex-col items-center p-2">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center mb-1.5">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: luckyItems.color.hex }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">색상</p>
                  <p className="text-sm font-bold text-gray-800">{luckyItems.color.name}</p>
                </div>

                {/* Lucky Direction */}
                <div className="flex flex-col items-center p-2">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-1.5">
                    <Compass className="w-5 h-5 text-green-500" weight="fill" />
                  </div>
                  <p className="text-[10px] text-gray-400">방향</p>
                  <p className="text-sm font-bold text-gray-800">{luckyItems.direction}</p>
                </div>

                {/* Lucky Time */}
                <div className="flex flex-col items-center p-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-1.5">
                    <Clock className="w-5 h-5 text-amber-500" weight="fill" />
                  </div>
                  <p className="text-[10px] text-gray-400">시간</p>
                  <p className="text-sm font-bold text-gray-800 text-center text-[11px]">{luckyItems.time}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center p-2 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 mb-1.5" />
                    <div className="w-8 h-2 bg-gray-100 rounded mb-1" />
                    <div className="w-10 h-3 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Fortune Panel */}
      <div className="px-4 py-2">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FortunePanel
              shareId={shareId}
              birthYear={birthYear || new Date().getFullYear() - 30}
              isPremium={isPremium}
              isLoadingShareId={false}
            />
          </motion.div>
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      <div className="px-4 py-4 bg-white mt-2">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RecommendationsPanel
              dominantElement={dominantElement}
              locale={locale}
              showTitle={true}
            />
          </motion.div>
        </div>
      </div>

      {/* Premium Upgrade CTA (if not premium) */}
      {!isPremium && (
        <div className="px-4 py-3">
          <div className="max-w-md mx-auto">
            <Link href="/premium">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-[#0E4168] to-[#1a5a8a] rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white/80 text-xs mb-0.5">더 자세한 분석이 궁금하다면</p>
                  <p className="text-white font-bold">프리미엄 구독하기</p>
                </div>
                <CaretRight className="w-5 h-5 text-white/60" />
              </motion.div>
            </Link>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <p className="text-center text-xs text-gray-400">
            본 운세는 전통 명리학을 기반으로 한 재미용 콘텐츠입니다
          </p>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
}
