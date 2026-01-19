'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { useLocale } from 'next-intl';
import {
  House,
  Sparkle,
  Heart,
  Leaf,
  User,
} from '@phosphor-icons/react';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  href: string;
  label: { ko: string; en: string };
  icon: React.ComponentType<{ className?: string; weight?: 'fill' | 'regular' }>;
  matchPaths: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    href: '/',
    label: { ko: '홈', en: 'Home' },
    icon: House,
    matchPaths: ['/'],
  },
  {
    id: 'saju',
    href: '/saju',
    label: { ko: '운세', en: 'Fortune' },
    icon: Sparkle,
    matchPaths: ['/saju', '/face-reading'],
  },
  {
    id: 'compatibility',
    href: '/compatibility',
    label: { ko: '궁합', en: 'Match' },
    icon: Heart,
    matchPaths: ['/compatibility', '/couple'],
  },
  {
    id: 'cheongrium',
    href: '/cheongrium',
    label: { ko: '청리움', en: 'Wellness' },
    icon: Leaf,
    matchPaths: ['/cheongrium', '/guardian'],
  },
  {
    id: 'profile',
    href: '/profile',
    label: { ko: '내정보', en: 'Profile' },
    icon: User,
    matchPaths: ['/profile', '/premium', '/history'],
  },
];

// Pages where nav should be hidden
const HIDDEN_PATHS = ['/chat', '/result', '/deck'];

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;

  // Remove locale prefix for matching
  const cleanPath = pathname.replace(/^\/(ko|en)/, '') || '/';

  // Check if nav should be hidden
  const shouldHide = HIDDEN_PATHS.some((path) => cleanPath.includes(path));
  if (shouldHide) return null;

  const isActive = (item: NavItem) => {
    if (item.id === 'home') {
      return cleanPath === '/';
    }
    return item.matchPaths.some((path) => cleanPath.startsWith(path));
  };

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-[430px] mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[56px]',
                active
                  ? 'text-[#0E4168]'
                  : 'text-gray-400'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className="w-6 h-6"
                weight={active ? 'fill' : 'regular'}
              />
              <span className={cn(
                'text-[10px] font-medium',
                active && 'font-semibold'
              )}>
                {item.label[locale]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Spacer to prevent content from being hidden behind bottom nav
 */
export function BottomNavSpacer() {
  return <div className="h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-hidden="true" />;
}
