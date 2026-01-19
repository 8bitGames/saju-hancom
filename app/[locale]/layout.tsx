import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { locales, type Locale } from '@/lib/i18n/config';
import { BottomNav } from '@/components/navigation';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(14, 65, 104, 0.95)',
            border: '1px solid rgba(196, 163, 90, 0.3)',
            color: '#ffffff',
          },
          className: 'backdrop-blur-sm',
        }}
        richColors
        closeButton
      />
    </NextIntlClientProvider>
  );
}
