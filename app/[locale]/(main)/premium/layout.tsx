import { Metadata } from "next";

export const metadata: Metadata = {
  title: "프리미엄 구독 | 청기운",
  description: "무제한 사주 분석과 PDF 다운로드를 누리세요",
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
