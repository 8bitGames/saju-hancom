import { Metadata } from "next";
import { CheongriumContent } from "./CheongriumContent";

export const metadata: Metadata = {
  title: "청리움 | 청기운",
  description: "오방신이 지키는 성지에서 영감을 얻으세요. 녹차밭, 용소, 약초원, 오하산방, 명당 기도터에서 전해지는 힐링 경험.",
};

export default function CheongriumPage() {
  return <CheongriumContent />;
}
