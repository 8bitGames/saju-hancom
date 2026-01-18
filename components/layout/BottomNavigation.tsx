"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { useLocale } from "next-intl";
import {
  House,
  Sparkle,
  Calendar,
  ClockCounterClockwise,
  User,
} from "@phosphor-icons/react";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  href: string;
  label: {
    ko: string;
    en: string;
  };
  icon: React.ComponentType<{ className?: string; weight?: "fill" | "regular" }>;
  matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    href: "/",
    label: { ko: "홈", en: "Home" },
    icon: House,
    matchPaths: ["/"],
  },
  {
    id: "saju",
    href: "/saju",
    label: { ko: "사주", en: "Saju" },
    icon: Sparkle,
    matchPaths: ["/saju", "/saju/fortune", "/saju/result"],
  },
  {
    id: "fortune",
    href: "/saju/today-fortune",
    label: { ko: "오늘운세", en: "Today" },
    icon: Calendar,
    matchPaths: ["/saju/today-fortune"],
  },
  {
    id: "history",
    href: "/history",
    label: { ko: "기록", en: "History" },
    icon: ClockCounterClockwise,
    matchPaths: ["/history"],
  },
  {
    id: "profile",
    href: "/profile",
    label: { ko: "내정보", en: "Profile" },
    icon: User,
    matchPaths: ["/profile", "/premium"],
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;

  // Remove locale prefix from pathname for matching
  const cleanPathname = pathname.replace(/^\/(ko|en)/, "") || "/";

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => {
        if (path === "/") {
          return cleanPathname === "/";
        }
        return cleanPathname.startsWith(path);
      });
    }
    return cleanPathname === item.href;
  };

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "bottom-nav-item",
              active && "active"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className="w-6 h-6"
              weight={active ? "fill" : "regular"}
            />
            <span className="bottom-nav-label">
              {item.label[locale]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
