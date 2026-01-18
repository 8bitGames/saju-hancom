"use client";

import { useLocale } from "next-intl";
import Image from "next/image";
import {
  TreeEvergreen,
  Fire,
  Flower,
  Mountains,
  Drop,
  ChatCircle,
  Sparkle,
  ArrowRight,
  Scroll,
  MapPin,
  Leaf,
  Coffee,
  Star,
  BookOpen,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { SACRED_PLACES } from "@/lib/constants/sacred-places";
import {
  GUARDIANS,
  getTodayGuardian,
  getTodayGuardianMessage,
  ELEMENT_ORDER,
  type ElementType,
} from "@/lib/constants/guardians";
import { SCENT_BLENDS } from "@/lib/constants/scents";
import { getTodayRecommendedTea } from "@/lib/constants/teas";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ELEMENT_ICONS: Record<ElementType, React.ElementType> = {
  wood: TreeEvergreen,
  fire: Fire,
  earth: Flower,
  metal: Mountains,
  water: Drop,
};

const LABELS = {
  ko: {
    title: "청리움",
    subtitle: "오방신이 지키는 신성한 공간",
    description: "청기운과 함께하는 청리움 힐링 여정을 경험해보세요",
    todayGuardian: "오늘의 수호신",
    todayMessage: "오늘의 메시지",
    guardians: "오방신",
    guardiansDesc: "다섯 방위를 지키는 수호신들",
    viewAllGuardians: "수호신 더 알아보기",
    guardianChat: "수호신과 대화하기",
    guardianChatDesc: "사주 분석 후 나의 수호신과 대화해보세요",
    sacredPlaces: "청리움 성지",
    sacredPlacesDesc: "다섯 수호신이 각각 지키는 신성한 장소들",
    teaRecommend: "오늘의 추천 차",
    scentRecommend: "향기 컬렉션",
    keepsakes: "운명 기록서",
    keepsakesDesc: "나의 사주와 운세를 영원히 간직하세요",
    viewKeepsakes: "기록서 보기",
    tour: "청리움 투어",
    tourDesc: "오방신의 성지를 직접 방문해보세요",
    booking: "예약하기",
    learnMore: "자세히 보기",
    viewAll: "전체 보기",
    features: "주요 특징",
    activities: "체험 활동",
    benefits: "효능",
    notes: "향기 노트",
    top: "탑",
    middle: "미들",
    base: "베이스",
    brewingTip: "우리는 방법",
    ingredients: "주요 재료",
    startSaju: "사주 분석 시작",
    chatNow: "대화 시작하기",
    discoverGuardian: "나의 수호신 찾기",
  },
  en: {
    title: "Cheongrium",
    subtitle: "Sacred Spaces Guarded by the Five Gods",
    description: "Experience a healing journey with Cheonggiun at Cheongrium",
    todayGuardian: "Today's Guardian",
    todayMessage: "Today's Message",
    guardians: "Five Guardians",
    guardiansDesc: "The guardians protecting five directions",
    viewAllGuardians: "Learn More About Guardians",
    guardianChat: "Chat with Guardian",
    guardianChatDesc: "Talk to your guardian after saju analysis",
    sacredPlaces: "Sacred Places",
    sacredPlacesDesc: "Sacred places guarded by the five elemental guardians",
    teaRecommend: "Today's Recommended Tea",
    scentRecommend: "Scent Collection",
    keepsakes: "Destiny Record",
    keepsakesDesc: "Preserve your fortune and destiny forever",
    viewKeepsakes: "View Records",
    tour: "Cheongrium Tour",
    tourDesc: "Visit the sacred places of the Five Guardians",
    booking: "Book Now",
    learnMore: "Learn More",
    viewAll: "View All",
    features: "Key Features",
    activities: "Activities",
    benefits: "Benefits",
    notes: "Scent Notes",
    top: "Top",
    middle: "Middle",
    base: "Base",
    brewingTip: "Brewing Tip",
    ingredients: "Ingredients",
    startSaju: "Start Fortune Analysis",
    chatNow: "Start Chat",
    discoverGuardian: "Find My Guardian",
  },
};

export function CheongriumContent() {
  const locale = useLocale() as Locale;
  const t = LABELS[locale];
  const todayGuardian = getTodayGuardian();
  const todayMessage = getTodayGuardianMessage(todayGuardian.id, locale);
  const todayPlace = SACRED_PLACES[todayGuardian.id];
  const todayTea = getTodayRecommendedTea();

  return (
    <div className="min-h-screen pb-24 bg-[#F5F9FC]">
      {/* Hero Section - 청기운 Style */}
      <section className="relative px-4 pt-6 pb-8 overflow-hidden">
        <div className="max-w-md mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 청기운 Logo */}
            <div className="flex justify-center mb-4">
              <Image
                src="/images/logo-cheonggiun.png"
                alt="청기운"
                width={160}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <p className="text-base text-gray-600 mb-2">{t.subtitle}</p>
            <p className="text-sm text-gray-500">{t.description}</p>
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/saju">
              <Button className="w-full sm:w-auto bg-[#0E4168] hover:bg-[#0a3152] text-white px-6">
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                {t.discoverGuardian}
              </Button>
            </Link>
            <Link href="/guardian">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-[#0E4168] text-[#0E4168] hover:bg-[#0E4168]/5"
              >
                {t.viewAllGuardians}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Today's Guardian Section */}
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <Card className="p-5 bg-white border border-gray-100 shadow-sm overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: `linear-gradient(135deg, ${todayGuardian.gradientFrom}, ${todayGuardian.gradientTo})`,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#C4A35A]" weight="fill" />
                <h2 className="text-lg font-bold text-gray-800">{t.todayGuardian}</h2>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${todayGuardian.color}15` }}
                >
                  <Image
                    src={todayGuardian.imagePath}
                    alt={todayGuardian.name[locale]}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold" style={{ color: todayGuardian.color }}>
                      {todayGuardian.name[locale]}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {todayGuardian.element[locale]} · {todayGuardian.direction[locale]}
                  </p>
                </div>
              </div>

              <div
                className="mt-4 p-4 rounded-xl"
                style={{ backgroundColor: `${todayGuardian.color}08` }}
              >
                <p className="text-xs text-gray-500 mb-1">{t.todayMessage}</p>
                <p className="text-gray-700 text-sm leading-relaxed">"{todayMessage}"</p>
              </div>

              <div className="mt-4">
                <Link href="/saju/chat">
                  <Button
                    className="w-full"
                    style={{ backgroundColor: todayGuardian.color }}
                  >
                    <ChatCircle className="w-4 h-4 mr-2" weight="fill" />
                    {t.chatNow}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Guardians Gallery Section */}
      <section className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t.guardians}</h2>
            <Link href="/guardian">
              <span className="text-sm text-[#0E4168] font-medium flex items-center gap-1">
                {t.viewAll}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-6">{t.guardiansDesc}</p>

          <div className="grid grid-cols-5 gap-2">
            {ELEMENT_ORDER.map((element) => {
              const guardian = GUARDIANS[element];
              const Icon = ELEMENT_ICONS[element];

              return (
                <Link key={element} href={`/guardian?element=${element}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-colors hover:bg-gray-50"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${guardian.color}15` }}
                    >
                      <Image
                        src={guardian.imagePath}
                        alt={guardian.name[locale]}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {guardian.name[locale]}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guardian Chat CTA */}
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <Card className="p-5 bg-white border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0E4168]/10 flex items-center justify-center">
                  <ChatCircle className="w-6 h-6 text-[#0E4168]" weight="fill" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{t.guardianChat}</h3>
                  <p className="text-sm text-gray-500">{t.guardianChatDesc}</p>
                </div>
              </div>
              <Link href="/saju">
                <Button className="w-full mt-4 bg-[#0E4168] hover:bg-[#0a3152] text-white">
                  <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                  {t.startSaju}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Sacred Places Section */}
      <section className="px-4 py-8 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-[#C4A35A]" weight="fill" />
            <h2 className="text-xl font-bold text-gray-800">{t.sacredPlaces}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">{t.sacredPlacesDesc}</p>

          <div className="space-y-3">
            {Object.values(SACRED_PLACES).map((place) => {
              const guardian = GUARDIANS[place.guardianId];
              const Icon = ELEMENT_ICONS[place.element];

              return (
                <Card
                  key={place.id}
                  className="p-4 bg-white border-none shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${place.ambientColor}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: place.ambientColor }} weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{place.name[locale]}</h3>
                        <span className="text-xs text-gray-400">{place.name.hanja}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {place.description[locale]}
                      </p>
                      <div className="flex items-center gap-2">
                        <Image
                          src={guardian.imagePath}
                          alt={guardian.name[locale]}
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                        <span className="text-xs text-gray-500">
                          {guardian.name[locale]} {locale === "ko" ? "수호" : "guards"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tea & Scent Section */}
      <section className="px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Tea */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="w-5 h-5 text-[#C4A35A]" weight="fill" />
              <h2 className="text-xl font-bold text-gray-800">{t.teaRecommend}</h2>
            </div>
            <Card className="p-5 bg-white border-none shadow-sm">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${todayTea.color}15` }}
                >
                  {todayTea.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-800">{todayTea.name[locale]}</h3>
                    {todayTea.name.hanja && (
                      <span className="text-sm text-gray-400">{todayTea.name.hanja}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{todayTea.description[locale]}</p>
                  <div className="flex flex-wrap gap-1">
                    {todayTea.benefits[locale].slice(0, 3).map((benefit, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${todayTea.color}15`, color: todayTea.color }}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Scents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#C4A35A]" weight="fill" />
                <h2 className="text-xl font-bold text-gray-800">{t.scentRecommend}</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(SCENT_BLENDS).slice(0, 4).map((scent) => {
                const guardian = GUARDIANS[scent.element];

                return (
                  <Card key={scent.id} className="p-4 bg-white border-none shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ backgroundColor: `${scent.color}15` }}
                      >
                        {scent.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-800">{scent.name[locale]}</h3>
                        <p className="text-xs text-gray-500">{guardian.name[locale]}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {scent.benefits[locale].slice(0, 2).map((benefit, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Keepsakes / Destiny Record Section */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <Card className="p-5 bg-gradient-to-br from-[#C4A35A]/10 to-[#a88f4a]/20 border-[#C4A35A]/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C4A35A]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#C4A35A]/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#C4A35A]" weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{t.keepsakes}</h3>
                  <p className="text-sm text-gray-600">{t.keepsakesDesc}</p>
                </div>
              </div>
              <Link href="/keepsakes">
                <Button className="w-full bg-[#C4A35A] hover:bg-[#a88f4a] text-white">
                  <Scroll className="w-4 h-4 mr-2" />
                  {t.viewKeepsakes}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Tour & Booking CTA (L4 Level) */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <Card className="p-6 bg-white border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10 text-center">
              {/* 청기운 Logo in Tour Section */}
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/logo-cheonggiun.png"
                  alt="청기운"
                  width={120}
                  height={45}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.tour}</h3>
              <p className="text-gray-500 mb-6">{t.tourDesc}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/tour">
                  <Button className="w-full sm:w-auto bg-[#0E4168] hover:bg-[#0a3152] text-white px-6">
                    <MapPin className="w-4 h-4 mr-2" weight="fill" />
                    {t.learnMore}
                  </Button>
                </Link>
                <a
                  href="https://cheongrium.com/booking"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-[#0E4168] text-[#0E4168] hover:bg-[#0E4168]/5 px-6"
                  >
                    {t.booking}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
