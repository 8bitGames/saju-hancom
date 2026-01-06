import { Metadata } from "next";
import { Check, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";

export const metadata: Metadata = {
  title: "프리미엄 구독 | 사주 한사",
  description: "무제한 사주 분석과 PDF 다운로드를 누리세요",
};

const features = [
  "매일 운세",
  "무제한 사주 결과 저장",
  "무제한 PDF 다운로드",
  "무제한 카카오톡 공유",
  "모든 사주 분석 기능 이용",
  "광고 없는 깨끗한 환경",
  "우선 고객 지원",
];

export default function PremiumPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkle className="w-5 h-5 text-purple-400" weight="fill" />
            <span className="text-purple-400 font-medium">프리미엄</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            무제한으로 사주를 분석하세요
          </h1>
          <p className="text-xl text-white/60">
            연간 구독으로 모든 기능을 제한 없이 이용하세요
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free Tier */}
          <Card className="p-8 bg-white/5 border-white/10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">무료</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₩0</span>
                <span className="text-white/40">/평생</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-white/60">
                <Check className="w-5 h-5 mt-0.5 text-green-400" weight="bold" />
                <span>결과 저장 1회</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <Check className="w-5 h-5 mt-0.5 text-green-400" weight="bold" />
                <span>PDF 다운로드 1회</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <Check className="w-5 h-5 mt-0.5 text-green-400" weight="bold" />
                <span>카카오톡 공유 1회</span>
              </li>
            </ul>

            <Button
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10"
              disabled
            >
              현재 플랜
            </Button>
          </Card>

          {/* Premium Tier */}
          <Card className="p-8 bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-purple-500/30 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/30 to-violet-600/30 blur-xl" />

            <div className="relative">
              <div className="absolute top-0 right-0 px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-bold">
                인기
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">프리미엄</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₩12,000</span>
                  <span className="text-white/60">/년</span>
                </div>
                <p className="text-sm text-purple-300 mt-1">$12 USD</p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-white">
                    <Check className="w-5 h-5 mt-0.5 text-purple-400" weight="bold" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <CheckoutButton className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white font-bold" />
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            자주 묻는 질문
          </h2>

          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-2">
                무료 체험 기간이 있나요?
              </h3>
              <p className="text-white/60">
                무료 플랜으로 각 기능을 1회씩 체험할 수 있습니다.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-2">
                언제든지 취소할 수 있나요?
              </h3>
              <p className="text-white/60">
                네, 언제든지 구독을 취소할 수 있습니다. 남은 기간까지는 프리미엄
                기능을 계속 이용하실 수 있습니다.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-2">
                환불이 가능한가요?
              </h3>
              <p className="text-white/60">
                구독 후 7일 이내에 서비스를 사용하지 않으셨다면 전액 환불이
                가능합니다.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-2">
                결제 수단은 무엇이 있나요?
              </h3>
              <p className="text-white/60">
                신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이
                등)를 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
