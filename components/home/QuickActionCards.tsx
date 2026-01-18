"use client";

import { Link } from "@/lib/i18n/navigation";
import { Sparkle, Sun, Heart } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface QuickAction {
  id: string;
  icon: React.ElementType;
  title: {
    ko: string;
    en: string;
  };
  subtitle: {
    ko: string;
    en: string;
  };
  href: string;
  gradient: string;
  iconBg: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "saju",
    icon: Sparkle,
    title: {
      ko: "내 사주 보기",
      en: "My Saju",
    },
    subtitle: {
      ko: "AI 분석",
      en: "AI Analysis",
    },
    href: "/saju",
    gradient: "from-[#0E4168] to-[#1E5A8A]",
    iconBg: "bg-[#0E4168]/80",
  },
  {
    id: "today",
    icon: Sun,
    title: {
      ko: "오늘 운세",
      en: "Today",
    },
    subtitle: {
      ko: "매일 확인",
      en: "Daily",
    },
    href: "/saju/today-fortune",
    gradient: "from-[#C4A35A] to-[#D4B86A]",
    iconBg: "bg-[#C4A35A]/80",
  },
  {
    id: "compatibility",
    icon: Heart,
    title: {
      ko: "궁합 보기",
      en: "Compatibility",
    },
    subtitle: {
      ko: "인연 분석",
      en: "Love Match",
    },
    href: "/compatibility",
    gradient: "from-[#ec4899] to-[#f43f5e]",
    iconBg: "bg-[#ec4899]/80",
  },
];

interface QuickActionCardsProps {
  locale: Locale;
  className?: string;
}

export function QuickActionCards({ locale, className }: QuickActionCardsProps) {
  return (
    <section className={cn("px-4 py-3", className)}>
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.id} href={action.href} className="block">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-4 min-h-[100px]",
                    "bg-gradient-to-br",
                    action.gradient,
                    "active:scale-95 transition-transform"
                  )}
                >
                  {/* Background decoration */}
                  <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/10" />

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-2",
                      action.iconBg
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" weight="fill" />
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-xs text-white/70 mb-0.5">
                      {action.subtitle[locale]}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {action.title[locale]}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
