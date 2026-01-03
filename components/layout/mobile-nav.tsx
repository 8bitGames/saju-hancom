"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Sparkle, Camera, ClockCounterClockwise, Buildings } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    {
      href: "/saju" as const,
      labelKey: "saju",
      icon: Sparkle,
    },
    {
      href: "/compatibility" as const,
      labelKey: "compatibility",
      icon: Buildings,
    },
    {
      href: "/face-reading" as const,
      labelKey: "faceReading",
      icon: Camera,
    },
    {
      href: "/history" as const,
      labelKey: "history",
      icon: ClockCounterClockwise,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[var(--nav-height)] bg-[var(--background)]/90 backdrop-blur-md border-t border-[var(--border)]">
      <div className="max-w-md mx-auto h-full px-4 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-3 px-4 min-w-[52px] rounded-lg transition-all duration-200",
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
