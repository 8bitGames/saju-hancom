"use client";

import { useState, useEffect } from "react";
import { CaretLeft, Sun, Cloud, CloudRain, CloudSnow, Wind, MapPin, Sparkle } from "@phosphor-icons/react";
import { BottomNav } from "@/components/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import Image from "next/image";
import { SplashScreen } from "@/components/ui/SplashScreen";

// Weather condition type
type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy" | "windy";

// Get weather icon based on condition
function WeatherIcon({ condition, className }: { condition: WeatherCondition; className?: string }) {
  const iconProps = { className, weight: "fill" as const };
  switch (condition) {
    case "sunny":
      return <Sun {...iconProps} />;
    case "cloudy":
      return <Cloud {...iconProps} />;
    case "rainy":
      return <CloudRain {...iconProps} />;
    case "snowy":
      return <CloudSnow {...iconProps} />;
    case "windy":
      return <Wind {...iconProps} />;
    default:
      return <Sun {...iconProps} />;
  }
}

// Simulate weather based on current date/time
function getSimulatedWeather(): { condition: WeatherCondition; temp: number } {
  const hour = new Date().getHours();
  const month = new Date().getMonth();

  // Base temperature by season (Korean climate)
  let baseTemp = 15;
  if (month >= 5 && month <= 8) baseTemp = 28; // Summer
  else if (month >= 11 || month <= 1) baseTemp = -2; // Winter
  else if (month >= 2 && month <= 4) baseTemp = 12; // Spring
  else baseTemp = 18; // Fall

  // Add some variation
  const variation = Math.floor(Math.sin(Date.now() / 10000000) * 5);
  const temp = baseTemp + variation;

  // Determine weather condition (mostly sunny for good feng shui vibes)
  const conditions: WeatherCondition[] = ["sunny", "sunny", "sunny", "cloudy", "sunny"];
  const condition = conditions[Math.floor(Math.abs(Math.sin(Date.now() / 100000000)) * conditions.length)];

  return { condition, temp };
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const [weather, setWeather] = useState<{ condition: WeatherCondition; temp: number } | null>(null);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Initialize weather on client side
  useEffect(() => {
    setWeather(getSimulatedWeather());
  }, []);

  // 홈페이지가 아닌 경우에만 뒤로가기 버튼 표시
  const isHomePage = pathname === "/" || pathname === "";

  return (
    <>
      {/* Splash Screen - shows on every page load */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} duration={1500} />
      )}

      {/* Main Page Container - Cheong-Giun Style */}
      <div className="relative z-10 min-h-screen min-h-dvh bg-[#F5F9FC]">
        {/* Header */}
        <header className="fixed top-0 z-50 bg-white border-b border-gray-100 w-full max-w-[430px] left-1/2 -translate-x-1/2">
          {/* Weather & Feng Shui Status Bar */}
          <div className="px-4 h-7 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-50 text-[10px]">
            {/* Left: Location & Weather */}
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" weight="fill" />
                <span>청리움</span>
              </div>
              {weather && (
                <div className="flex items-center gap-0.5">
                  <WeatherIcon condition={weather.condition} className="w-3 h-3 text-amber-500" />
                  <span>{weather.temp}°</span>
                </div>
              )}
            </div>

            {/* Right: Feng Shui Status */}
            <div className="flex items-center gap-1 text-emerald-600">
              <Sparkle className="w-3 h-3" weight="fill" />
              <span className="font-medium">기운 좋음</span>
            </div>
          </div>

          {/* Main Header */}
          <div className="px-4 h-12 flex items-center justify-between">
            {/* Left: Back button (non-home only) */}
            {!isHomePage ? (
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/");
                  }
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <CaretLeft className="w-5 h-5" weight="bold" />
              </button>
            ) : (
              <div className="w-8" />
            )}

            {/* Center: Logo */}
            <button
              onClick={() => router.push("/")}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <Image
                src="/images/logo-cheonggiun-calligraphy.png"
                alt="청기운"
                width={80}
                height={28}
                className="object-contain"
                priority
              />
            </button>

            {/* Right: Spacer */}
            <div className="w-8" />
          </div>
        </header>

        {/* Main Content - pt-[76px] accounts for status bar (28px) + header (48px) */}
        <main className="pt-[76px] pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </>
  );
}
