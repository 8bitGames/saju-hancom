'use client';

import { motion } from 'framer-motion';
import {
  CurrencyDollar,
  Rocket,
  Code,
  Globe,
  Megaphone,
  Lightning,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';
import { DoughnutChart } from '../charts/ChartWrapper';

export default function Slide12Ask() {
  const allocationData = {
    labels: ['R&D / 인력', '제품 개발', '마케팅', '운영비'],
    datasets: [
      {
        data: [40, 25, 25, 10],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgb(168, 85, 247)',
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const allocations = [
    { title: 'R&D / 인력', amount: '$800K', percentage: '40%', color: 'purple' },
    { title: '제품 개발', amount: '$500K', percentage: '25%', color: 'blue' },
    { title: '마케팅', amount: '$500K', percentage: '25%', color: 'pink' },
    { title: '운영비', amount: '$200K', percentage: '10%', color: 'green' },
  ];

  const roadmap = [
    { phase: '2025 Q1', milestone: '정식 출시 & 벤처인증' },
    { phase: '2025 Q3', milestone: '일본/동남아 진출' },
    { phase: '2026', milestone: '글로벌 확장 & Series A' },
  ];

  const colorClasses = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    pink: 'text-pink-400',
    green: 'text-green-400',
  };

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>투자 제안</SlideTitle>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* Investment Amount */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-4 rounded-2xl border border-purple-500/50 bg-purple-500/20 px-8 py-5">
              <CurrencyDollar
                size={40}
                className="text-purple-400"
                weight="duotone"
              />
              <div>
                <p className="text-sm text-white/50">시드 투자 유치</p>
                <p className="text-4xl font-bold text-purple-400">$2M USD</p>
              </div>
            </div>
          </motion.div>

          {/* Allocation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex w-full max-w-4xl items-center gap-6"
          >
            {/* Chart */}
            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3">
              <DoughnutChart data={allocationData} />
            </div>

            {/* Allocation Details */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              {allocations.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className={`font-bold ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                    {item.amount}
                  </span>
                  <span className="text-xs text-white/60">{item.title}</span>
                  <span className="ml-auto text-xs text-white/40">({item.percentage})</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Roadmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="w-full max-w-3xl"
          >
            <h3 className="mb-3 text-center text-sm font-medium text-white/50">
              로드맵
            </h3>
            <div className="flex items-center justify-between">
              {roadmap.map((item, index) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-center">
                    <p className="text-xs font-bold text-purple-400">{item.phase}</p>
                    <p className="text-xs text-white/70">{item.milestone}</p>
                  </div>
                  {index < roadmap.length - 1 && (
                    <ArrowRight size={16} className="text-white/30" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Vision Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="w-full max-w-2xl text-center"
          >
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
              <Sparkle size={32} weight="fill" className="mx-auto mb-3 text-purple-400" />
              <p className="text-lg text-white/80">
                &quot;K-사주를 세계에 알리는
              </p>
              <p className="text-2xl font-bold text-purple-300">
                글로벌 No.1 AI 운명 플랫폼&quot;
              </p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="text-center"
          >
            <p className="text-sm text-white/50">
              Contact: <span className="text-purple-400">invest@hansa.ai</span>
            </p>
          </motion.div>
        </div>
      </div>
    </SlideWrapper>
  );
}
