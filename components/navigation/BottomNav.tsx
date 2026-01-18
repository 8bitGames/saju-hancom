'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  matchPaths?: string[];
}

// 홈 아이콘 (점신 로고 스타일)
function HomeIcon({ active }: { active?: boolean }) {
  return (
    <div className={cn(
      "text-2xl",
      active ? "scale-110" : ""
    )}>
      🔮
    </div>
  );
}

// 운세 아이콘 (사주/운세)
function FortuneIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className="w-6 h-6"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? "0" : "1.5"}
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

// 궁합 아이콘 (하트/커플)
function CompatibilityIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className="w-6 h-6"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? "0" : "1.5"}
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

// 기록 아이콘
function HistoryIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className="w-6 h-6"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? "0" : "1.5"}
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// 프로필 아이콘
function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className="w-6 h-6"
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? "0" : "1.5"}
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Navigation');

  const navItems: NavItem[] = [
    {
      href: `/${locale}`,
      labelKey: 'home',
      icon: <HomeIcon />,
      activeIcon: <HomeIcon active />,
      matchPaths: [`/${locale}`, `/${locale}/`],
    },
    {
      href: `/${locale}/saju`,
      labelKey: 'fortune',
      icon: <FortuneIcon />,
      activeIcon: <FortuneIcon active />,
      matchPaths: [`/${locale}/saju`, `/${locale}/face-reading`],
    },
    {
      href: `/${locale}/compatibility`,
      labelKey: 'compatibility',
      icon: <CompatibilityIcon />,
      activeIcon: <CompatibilityIcon active />,
      matchPaths: [`/${locale}/compatibility`, `/${locale}/couple`],
    },
    {
      href: `/${locale}/history`,
      labelKey: 'history',
      icon: <HistoryIcon />,
      activeIcon: <HistoryIcon active />,
      matchPaths: [`/${locale}/history`],
    },
    {
      href: `/${locale}/profile`,
      labelKey: 'profile',
      icon: <ProfileIcon />,
      activeIcon: <ProfileIcon active />,
      matchPaths: [`/${locale}/profile`, `/${locale}/premium`],
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
    }
    return pathname === item.href;
  };

  // 특정 페이지에서 네비게이션 숨기기 (채팅 페이지 등)
  const hiddenPaths = ['/chat', '/result'];
  const shouldHide = hiddenPaths.some((path) => pathname.includes(path));

  if (shouldHide) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[56px] transition-colors',
                active
                  ? 'text-amber-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active ? item.activeIcon : item.icon}
              <span className={cn(
                "text-[10px] font-medium",
                active && "text-amber-600"
              )}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * BottomNav를 위한 스페이서 컴포넌트
 * 페이지 컨텐츠가 네비게이션에 가려지지 않도록 하단에 여백 추가
 */
export function BottomNavSpacer() {
  return <div className="h-16" aria-hidden="true" />;
}
