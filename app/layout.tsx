import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { HomePageSchema } from "@/lib/seo/structured-data";

// Pretendard font - Korean-optimized modern sans-serif
const pretendard = localFont({
  src: [
    {
      path: "../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Mono is less critical, load on demand
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover', // For safe area on notched devices
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a1033' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "한사 AI | AI 사주 운세 분석 - 사주팔자, 궁합, 관상",
    template: "%s | 한사 AI",
  },
  description: "AI 기반의 사주팔자, 궁합, 관상 분석 서비스. 정확한 만세력 데이터와 AI 기술로 당신의 운명을 분석합니다. 무료 사주 풀이, 커플 궁합, 직장 궁합, 관상 분석을 지금 바로 확인하세요.",
  keywords: [
    // Korean keywords (primary)
    "사주", "사주팔자", "운세", "궁합", "관상", "AI 운세", "AI 사주",
    "무료 사주", "오늘의 운세", "커플 궁합", "연애 궁합", "직장 궁합",
    "관상 분석", "얼굴 분석", "명리학", "만세력", "사주 풀이",
    "2024 운세", "2025 운세", "신년 운세", "토정비결",
    // English keywords (secondary)
    "saju", "fortune telling", "compatibility", "face reading", "AI fortune",
    "Korean astrology", "four pillars", "bazi", "Korean horoscope",
  ],
  authors: [{ name: "한사 AI", url: baseUrl }],
  creator: "한사 AI",
  publisher: "한사 AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Lifestyle",
  classification: "Fortune Telling, Astrology, AI Application",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'ko-KR': baseUrl,
      'en-US': `${baseUrl}/en`,
      'x-default': baseUrl,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#0a0a0a' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "한사 AI | AI 사주 운세 분석",
    description: "AI가 분석하는 정확한 사주팔자, 궁합, 관상. 무료로 당신의 운명을 확인하세요.",
    siteName: "한사 AI",
    type: "website",
    url: baseUrl,
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "한사 AI - AI 운세 분석 서비스",
        type: "image/png",
      },
      {
        url: "/images/og-cover-four-pillars.jpg",
        width: 1200,
        height: 630,
        alt: "한사 AI - 사주팔자 분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "한사 AI | AI 사주 운세 분석",
    description: "AI가 분석하는 정확한 사주팔자, 궁합, 관상. 무료로 당신의 운명을 확인하세요.",
    images: ["/api/og"],
    creator: "@hansa_ai",
    site: "@hansa_ai",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      'naver-site-verification': process.env.NAVER_SITE_VERIFICATION || '',
    },
  },
  other: {
    // AEO/GEO optimizations
    'ai-content-declaration': 'AI-assisted fortune analysis service',
    'content-language': 'ko, en',
    // Apple specific
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': '한사 AI',
    // Microsoft specific
    'msapplication-TileColor': '#0a0a0a',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HomePageSchema />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body
        className={`${pretendard.className} ${pretendard.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* PC View Wrapper - White margins on desktop, centered mobile view */}
        <div className="pc-wrapper">
          <div className="mobile-container">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
