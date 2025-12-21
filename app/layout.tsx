import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "한사 AI | AI 운세 분석",
  description: "AI 기반의 사주, 궁합, 관상 분석으로 당신의 운명을 알아보세요. 정확한 사주팔자 풀이와 맞춤형 운세 가이드.",
  keywords: ["사주", "운세", "궁합", "관상", "AI", "사주팔자", "saju", "fortune", "compatibility", "face reading"],
  authors: [{ name: "한사 AI" }],
  alternates: {
    canonical: '/',
    languages: {
      'ko': '/',
      'en': '/en',
    },
  },
  openGraph: {
    title: "한사 AI | AI 운세 분석",
    description: "AI 기반의 사주, 궁합, 관상 분석으로 당신의 운명을 알아보세요.",
    siteName: "한사 AI",
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "한사 AI - AI 운세 분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "한사 AI | AI 운세 분석",
    description: "AI 기반의 사주, 궁합, 관상 분석으로 당신의 운명을 알아보세요.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
