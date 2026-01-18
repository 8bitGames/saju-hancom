import type { Metadata } from "next";
import { DreamClient } from "./dream-client";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hansa.ai.kr";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKorean = locale === "ko";
  const prefix = isKorean ? "" : `/${locale}`;

  return {
    title: "AI 해몽 - 꿈 해석 서비스",
    description:
      "꿈을 이야기해주시면 전통 동양 해몽학을 기반으로 AI가 꿈의 의미를 해석해 드립니다. 길몽과 흉몽, 숨겨진 메시지를 알아보세요.",
    keywords: ["해몽", "꿈 해석", "꿈 풀이", "꿈 점", "AI 해몽", "길몽", "흉몽"],
    alternates: {
      canonical: `${baseUrl}${prefix}/dream`,
      languages: {
        "ko-KR": `${baseUrl}/dream`,
        "en-US": `${baseUrl}/en/dream`,
      },
    },
    openGraph: {
      title: "AI 해몽 - 꿈 해석 서비스",
      description:
        "꿈을 이야기해주시면 전통 동양 해몽학을 기반으로 AI가 꿈의 의미를 해석해 드립니다.",
      images: [{ url: "/images/og-cover-dream.jpg", width: 1200, height: 630 }],
    },
  };
}

export default function DreamPage() {
  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        <DreamClient />
      </div>
    </div>
  );
}
