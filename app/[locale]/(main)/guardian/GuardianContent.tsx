"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  TreeEvergreen,
  Fire,
  Flower,
  Mountains,
  Drop,
  ChatCircle,
  Sparkle,
  Compass,
  Sun,
  Star,
  Lightning,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { SACRED_PLACES } from "@/lib/constants/sacred-places";
import {
  GUARDIANS,
  ELEMENT_ORDER,
  GUARDIAN_GREETINGS,
  GUARDIAN_PROMPTS,
  type ElementType,
} from "@/lib/constants/guardians";
import { SCENT_BLENDS } from "@/lib/constants/scents";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ELEMENT_ICONS: Record<ElementType, React.ElementType> = {
  wood: TreeEvergreen,
  fire: Fire,
  earth: Flower,
  metal: Mountains,
  water: Drop,
};

const LABELS = {
  ko: {
    title: "오방신",
    subtitle: "다섯 방위를 지키는 수호신들",
    direction: "방위",
    season: "계절",
    element: "오행",
    personality: "성격",
    strengths: "강점",
    greeting: "인사말",
    sacredPlace: "수호 성지",
    scent: "향기",
    chatWith: "과 대화하기",
    prompts: "추천 질문",
    startSaju: "사주 분석으로 나의 수호신 찾기",
    viewPlace: "성지 보기",
    selectGuardian: "수호신을 선택하세요",
  },
  en: {
    title: "Five Guardians",
    subtitle: "The guardians protecting five directions",
    direction: "Direction",
    season: "Season",
    element: "Element",
    personality: "Personality",
    strengths: "Strengths",
    greeting: "Greeting",
    sacredPlace: "Sacred Place",
    scent: "Scent",
    chatWith: "Chat with ",
    prompts: "Suggested Questions",
    startSaju: "Find My Guardian with Saju Analysis",
    viewPlace: "View Place",
    selectGuardian: "Select a Guardian",
  },
};

export function GuardianContent() {
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  const t = LABELS[locale];

  const elementParam = searchParams.get("element") as ElementType | null;
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    elementParam && ELEMENT_ORDER.includes(elementParam) ? elementParam : null
  );

  useEffect(() => {
    if (elementParam && ELEMENT_ORDER.includes(elementParam)) {
      setSelectedElement(elementParam);
    }
  }, [elementParam]);

  const selectedGuardian = selectedElement ? GUARDIANS[selectedElement] : null;
  const selectedPlace = selectedElement ? SACRED_PLACES[selectedElement] : null;
  const selectedScent = selectedElement ? SCENT_BLENDS[selectedElement] : null;
  const selectedGreeting = selectedElement ? GUARDIAN_GREETINGS[selectedElement] : null;
  const selectedPrompts = selectedElement ? GUARDIAN_PROMPTS[selectedElement] : null;

  return (
    <div className="min-h-screen pb-24 bg-[#F5F9FC]">
      {/* Header Section - 청기운 Style */}
      <section className="px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{t.title}</h1>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
      </section>

      {/* Guardian Selector */}
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center gap-2 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            {ELEMENT_ORDER.map((element) => {
              const guardian = GUARDIANS[element];
              const isSelected = selectedElement === element;

              return (
                <motion.button
                  key={element}
                  onClick={() => setSelectedElement(element)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                    isSelected
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isSelected && "ring-2 ring-offset-2"
                    )}
                    style={{
                      backgroundColor: `${guardian.color}${isSelected ? "30" : "15"}`,
                      "--tw-ring-color": guardian.color,
                    } as React.CSSProperties}
                  >
                    <Image
                      src={guardian.imagePath}
                      alt={guardian.name[locale]}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {guardian.name[locale]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guardian Detail */}
      <AnimatePresence mode="wait">
        {selectedGuardian && selectedPlace && selectedScent && selectedGreeting && selectedPrompts ? (
          <motion.div
            key={selectedElement}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Main Info */}
            <section className="px-4 py-4">
              <div className="max-w-md mx-auto">
                <Card className="p-5 bg-white border border-gray-100 shadow-sm overflow-hidden relative">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      background: `linear-gradient(135deg, ${selectedGuardian.gradientFrom}, ${selectedGuardian.gradientTo})`,
                    }}
                  />
                  <div className="relative z-10">
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="w-24 h-24 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${selectedGuardian.color}15` }}
                      >
                        <Image
                          src={selectedGuardian.imagePath}
                          alt={selectedGuardian.name[locale]}
                          width={72}
                          height={72}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h2
                          className="text-2xl font-bold mb-1"
                          style={{ color: selectedGuardian.color }}
                        >
                          {selectedGuardian.name[locale]}
                        </h2>
                        <p className="text-gray-600">{selectedGuardian.description[locale]}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-3 rounded-xl bg-gray-50">
                        <Compass className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <p className="text-xs text-gray-500 mb-1">{t.direction}</p>
                        <p className="font-medium text-gray-800">
                          {selectedGuardian.direction[locale]}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-gray-50">
                        <Sun className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <p className="text-xs text-gray-500 mb-1">{t.season}</p>
                        <p className="font-medium text-gray-800">
                          {selectedGuardian.season[locale]}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-gray-50">
                        <Star className="w-5 h-5 mx-auto mb-1 text-gray-600" weight="fill" />
                        <p className="text-xs text-gray-500 mb-1">{t.element}</p>
                        <p className="font-medium text-gray-800">
                          {selectedGuardian.element[locale]}
                        </p>
                      </div>
                    </div>

                    {/* Personality & Strengths */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Lightning className="w-4 h-4" style={{ color: selectedGuardian.color }} />
                          {t.personality}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuardian.personality[locale].map((trait, i) => (
                            <span
                              key={i}
                              className="text-sm px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: `${selectedGuardian.color}15`,
                                color: selectedGuardian.color,
                              }}
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Sparkle className="w-4 h-4" style={{ color: selectedGuardian.color }} />
                          {t.strengths}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuardian.strengths[locale].map((strength, i) => (
                            <span
                              key={i}
                              className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Greeting */}
            <section className="px-4 py-4">
              <div className="max-w-md mx-auto">
                <Card
                  className="p-5 border border-gray-100 shadow-sm"
                  style={{ backgroundColor: `${selectedGuardian.color}08` }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{t.greeting}</h3>
                  <p className="text-gray-800 leading-relaxed italic">
                    "{selectedGreeting[locale]}"
                  </p>
                </Card>
              </div>
            </section>

            {/* Suggested Questions */}
            <section className="px-4 py-4">
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t.prompts}</h3>
                <div className="space-y-2">
                  {selectedPrompts[locale].map((prompt, i) => (
                    <Card
                      key={i}
                      className="p-3 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <p className="text-sm text-gray-700">{prompt}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Sacred Place */}
            <section className="px-4 py-4">
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t.sacredPlace}</h3>
                <Card className="p-4 bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${selectedPlace.ambientColor}15` }}
                    >
                      {(() => {
                        const Icon = ELEMENT_ICONS[selectedPlace.element];
                        return (
                          <Icon
                            className="w-6 h-6"
                            style={{ color: selectedPlace.ambientColor }}
                            weight="fill"
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800">{selectedPlace.name[locale]}</h4>
                        <span className="text-xs text-gray-400">{selectedPlace.name.hanja}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{selectedPlace.description[locale]}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPlace.activities[locale].map((activity, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${selectedPlace.ambientColor}10`,
                              color: selectedPlace.ambientColor,
                            }}
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Scent */}
            <section className="px-4 py-4">
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t.scent}</h3>
                <Card className="p-4 bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${selectedScent.color}15` }}
                    >
                      {selectedScent.emoji}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{selectedScent.name[locale]}</h4>
                      <p className="text-sm text-gray-500">{selectedScent.description[locale]}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedScent.benefits[locale].map((benefit, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            {/* Chat CTA */}
            <section className="px-4 py-6">
              <div className="max-w-md mx-auto">
                <Card className="p-5 bg-white border border-gray-100 shadow-sm overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${selectedGuardian.color}15` }}
                      >
                        <ChatCircle className="w-6 h-6" style={{ color: selectedGuardian.color }} weight="fill" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {locale === "ko"
                            ? `${selectedGuardian.name[locale]}${t.chatWith}`
                            : `${t.chatWith}${selectedGuardian.name[locale]}`}
                        </h3>
                      </div>
                    </div>
                    <Link href="/saju">
                      <Button
                        className="w-full text-white"
                        style={{ backgroundColor: selectedGuardian.color }}
                      >
                        <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                        {t.startSaju}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-16"
          >
            <div className="max-w-md mx-auto text-center">
              <p className="text-gray-500">{t.selectGuardian}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
