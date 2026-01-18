"use client";

import { useState } from "react";
import {
  Check,
  Sparkle,
  Crown,
  X,
  CaretDown,
  Star,
  Shield,
  Lightning,
} from "@phosphor-icons/react";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { cn } from "@/lib/utils";

const premiumFeatures = [
  { icon: Star, label: "매일 운세", description: "매일 새로운 운세를 확인하세요" },
  { icon: Lightning, label: "무제한 저장", description: "사주 결과를 무제한 저장" },
  { icon: Shield, label: "PDF 다운로드", description: "결과를 PDF로 저장" },
];

const comparisonFeatures = [
  { name: "사주 분석", free: true, premium: true },
  { name: "결과 저장", free: "1회", premium: "무제한" },
  { name: "PDF 다운로드", free: "1회", premium: "무제한" },
  { name: "카카오톡 공유", free: "1회", premium: "무제한" },
  { name: "매일 운세", free: false, premium: true },
  { name: "광고 없음", free: false, premium: true },
  { name: "우선 지원", free: false, premium: true },
];

const faqs = [
  {
    question: "무료 체험 기간이 있나요?",
    answer: "무료 플랜으로 각 기능을 1회씩 체험할 수 있습니다.",
  },
  {
    question: "언제든지 취소할 수 있나요?",
    answer:
      "네, 언제든지 구독을 취소할 수 있습니다. 남은 기간까지는 프리미엄 기능을 계속 이용하실 수 있습니다.",
  },
  {
    question: "환불이 가능한가요?",
    answer:
      "구독 후 7일 이내에 서비스를 사용하지 않으셨다면 전액 환불이 가능합니다.",
  },
  {
    question: "결제 수단은 무엇이 있나요?",
    answer:
      "신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등)를 지원합니다.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4">
        <span className="font-medium text-gray-800 text-[15px] pr-4">
          {question}
        </span>
        <CaretDown
          className={cn(
            "w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          weight="bold"
        />
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-40" : "max-h-0"
        )}
      >
        <p className="px-4 pb-4 text-gray-500 text-sm leading-relaxed">
          {answer}
        </p>
      </div>
    </button>
  );
}

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f5] to-white pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C4A35A]/10 via-transparent to-[#C4A35A]/5" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4A35A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C4A35A]/10 rounded-full blur-2xl" />

        <div className="relative px-5 pt-8 pb-6">
          {/* Premium Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] shadow-lg">
              <Crown className="w-5 h-5 text-white" weight="fill" />
              <span className="text-white font-bold text-sm">프리미엄</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2 leading-tight">
            무제한으로 사주를 분석하세요
          </h1>
          <p className="text-gray-500 text-center text-sm">
            연간 구독으로 모든 기능을 제한 없이
          </p>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="px-4 -mt-2">
        <div className="bg-white rounded-3xl border border-[#C4A35A]/20 shadow-xl shadow-[#C4A35A]/10 overflow-hidden">
          {/* Price Header */}
          <div className="bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] p-5 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-white">₩12,000</span>
              <span className="text-white/80 text-sm">/년</span>
            </div>
            <p className="text-white/70 text-xs mt-1">$12 USD</p>
            <p className="text-white/90 text-sm mt-2">월 ₩1,000원</p>
          </div>

          {/* Features Grid */}
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              {premiumFeatures.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A35A]/20 to-[#C4A35A]/10 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-[#C4A35A]" weight="fill" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <CheckoutButton className="w-full h-14 bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] hover:opacity-90 text-white font-bold text-base rounded-2xl shadow-lg shadow-[#C4A35A]/30" />

            <p className="text-center text-xs text-gray-400 mt-3">
              언제든지 취소 가능
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="px-4 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">
          플랜 비교
        </h2>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
            <div className="p-3" />
            <div className="p-3 text-center">
              <span className="text-sm text-gray-500">무료</span>
            </div>
            <div className="p-3 text-center">
              <span className="text-sm font-bold text-[#C4A35A]">프리미엄</span>
            </div>
          </div>

          {/* Rows */}
          {comparisonFeatures.map((feature, idx) => (
            <div
              key={feature.name}
              className={cn(
                "grid grid-cols-3 items-center",
                idx !== comparisonFeatures.length - 1 && "border-b border-gray-50"
              )}
            >
              <div className="p-3">
                <span className="text-sm text-gray-700">{feature.name}</span>
              </div>
              <div className="p-3 flex justify-center">
                {feature.free === true ? (
                  <Check className="w-5 h-5 text-green-500" weight="bold" />
                ) : feature.free === false ? (
                  <X className="w-5 h-5 text-gray-300" weight="bold" />
                ) : (
                  <span className="text-xs text-gray-500">{feature.free}</span>
                )}
              </div>
              <div className="p-3 flex justify-center">
                {feature.premium === true ? (
                  <Check className="w-5 h-5 text-[#C4A35A]" weight="bold" />
                ) : (
                  <span className="text-xs text-[#C4A35A] font-medium">
                    {feature.premium}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">
          자주 묻는 질문
        </h2>

        <div className="space-y-2">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 mt-8">
        <div className="bg-gradient-to-r from-[#C4A35A]/10 to-[#a88f4a]/10 rounded-2xl p-5 text-center border border-[#C4A35A]/20">
          <Sparkle
            className="w-8 h-8 text-[#C4A35A] mx-auto mb-2"
            weight="fill"
          />
          <p className="text-gray-700 font-medium mb-3">
            지금 프리미엄을 시작하세요
          </p>
          <CheckoutButton className="w-full h-12 bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] hover:opacity-90 text-white font-bold rounded-xl" />
        </div>
      </div>
    </div>
  );
}
