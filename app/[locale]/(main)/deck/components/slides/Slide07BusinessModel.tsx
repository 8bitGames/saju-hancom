'use client';

import { motion } from 'framer-motion';
import {
  Crown,
  Gift,
  Check,
  X,
  CurrencyDollar,
  Megaphone,
  Book,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide07BusinessModel() {
  const plans = [
    {
      name: 'Free',
      price: '무료',
      icon: <Gift size={24} weight="duotone" />,
      color: 'gray',
      features: [
        { text: '기본 사주 분석', included: true },
        { text: '일일 운세', included: true },
        { text: '광고 포함', included: true },
        { text: 'AI 채팅 상담', included: false },
        { text: '상세 분석 리포트', included: false },
        { text: '궁합 분석', included: false },
      ],
    },
    {
      name: 'Premium',
      price: '₩12,000',
      priceUSD: '($12 USD)',
      period: '/년',
      icon: <Crown size={24} weight="duotone" />,
      color: 'purple',
      featured: true,
      features: [
        { text: '무제한 사주 분석', included: true },
        { text: 'AI 채팅 심화 상담', included: true },
        { text: '광고 제거', included: true },
        { text: '상세 분석 리포트', included: true },
        { text: '무제한 궁합 분석', included: true },
        { text: 'AI 다이어리 무제한', included: true },
      ],
    },
  ];

  const revenueStreams = [
    {
      icon: <CurrencyDollar size={20} weight="duotone" />,
      title: '구독 수익',
      description: '연간 구독 기반 안정적 ARR',
      percentage: 60,
    },
    {
      icon: <Megaphone size={20} weight="duotone" />,
      title: '광고 수익',
      description: '무료 사용자 타겟 광고',
      percentage: 25,
    },
    {
      icon: <Book size={20} weight="duotone" />,
      title: '콘텐츠 판매',
      description: 'AI 자서전 인쇄본',
      percentage: 15,
    },
  ];

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>비즈니스 모델</SlideTitle>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 text-center text-lg text-white/60"
        >
          프리미엄(Freemium) 모델 기반 다각화된 수익 구조
        </motion.p>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {/* Pricing Plans */}
          <div className="flex w-full max-w-3xl items-stretch justify-center gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                className={`relative flex-1 rounded-2xl border p-6 ${
                  plan.featured
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-4 py-1 text-xs font-bold text-white">
                    추천
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      plan.featured
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-2xl font-bold ${
                          plan.featured ? 'text-purple-400' : 'text-white'
                        }`}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-white/50">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.priceUSD && (
                      <span className="text-xs text-white/40">{plan.priceUSD}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check
                          size={16}
                          weight="bold"
                          className="text-green-400"
                        />
                      ) : (
                        <X size={16} weight="bold" className="text-white/30" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-white/80' : 'text-white/30'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Revenue Streams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full max-w-3xl"
          >
            <h3 className="mb-4 text-center text-sm font-medium text-white/50">
              수익 구성 비율
            </h3>
            <div className="flex gap-4">
              {revenueStreams.map((stream, index) => (
                <motion.div
                  key={stream.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-center gap-2 text-purple-400">
                    {stream.icon}
                    <span className="font-medium">{stream.title}</span>
                  </div>
                  <p className="mb-2 text-xs text-white/50">
                    {stream.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stream.percentage}%` }}
                        transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                        className="h-full rounded-full bg-purple-500"
                      />
                    </div>
                    <span className="text-sm font-bold text-purple-400">
                      {stream.percentage}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrapper>
  );
}
