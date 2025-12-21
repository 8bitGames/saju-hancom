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

export const metadata: Metadata = {
  title: "Hansa AI | AI Fortune Analysis",
  description: "Discover your destiny with AI-powered Saju (Four Pillars), compatibility analysis, and face reading. Your personal fortune guide.",
  keywords: ["saju", "fortune", "AI", "compatibility", "face reading", "four pillars", "사주", "운세", "궁합", "관상"],
  authors: [{ name: "Hansa AI" }],
  openGraph: {
    title: "Hansa AI | AI Fortune Analysis",
    description: "Discover your destiny with AI-powered Saju, compatibility analysis, and face reading.",
    siteName: "Hansa AI",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Hansa AI - AI Fortune Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hansa AI | AI Fortune Analysis",
    description: "Discover your destiny with AI-powered Saju, compatibility analysis, and face reading.",
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
