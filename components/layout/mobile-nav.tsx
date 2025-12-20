"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkle, Camera, ClockCounterClockwise, Buildings } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/saju",
    label: "사주",
    icon: Sparkle,
  },
  {
    href: "/compatibility",
    label: "궁합",
    icon: Buildings,
  },
  {
    href: "/face-reading",
    label: "관상",
    icon: Camera,
  },
  {
    href: "/history",
    label: "기록",
    icon: ClockCounterClockwise,
  },
];

export function MobileNav() {
  const pathname = usePathname();

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
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
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
              <span className="text-xs font-medium">{item.label}</span>
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
