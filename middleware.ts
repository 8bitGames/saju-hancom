import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n/config';
import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
});

export async function middleware(request: NextRequest) {
  // First update Supabase session
  const supabaseResponse = await updateSession(request);

  // Then apply i18n middleware
  const intlResponse = intlMiddleware(request);

  // Merge cookies from both middlewares
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
