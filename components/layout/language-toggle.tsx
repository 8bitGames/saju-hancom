"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { type Locale } from "@/lib/i18n/config";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === "ko" ? "en" : "ko";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className={`h-8 sm:h-10 px-2.5 sm:px-4 flex items-center justify-center gap-0.5 sm:gap-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-medium transition-all hover:bg-white/20 flex-shrink-0 ${className || ""}`}
      aria-label="Toggle language"
    >
      <span
        className={`transition-opacity ${locale === "en" ? "opacity-100" : "opacity-50"}`}
      >
        EN
      </span>
      <span className="text-white/40">/</span>
      <span
        className={`transition-opacity ${locale === "ko" ? "opacity-100" : "opacity-50"}`}
      >
        KO
      </span>
    </button>
  );
}
