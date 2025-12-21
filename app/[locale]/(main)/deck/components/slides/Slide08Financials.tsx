'use client';

import { motion } from 'framer-motion';
import {
  CurrencyDollar,
  Users,
  ChartLineUp,
  Percent,
  Target,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';
import { LineChart } from '../charts/ChartWrapper';

export default function Slide08Financials() {
  const projections = [
    { year: 'Y1', users: '50K', revenue: '$200K', arr: '$150K' },
    { year: 'Y2', users: '200K', revenue: '$1.2M', arr: '$900K' },
    { year: 'Y3', users: '500K', revenue: '$4M', arr: '$3M' },
    { year: 'Y5', users: '2M', revenue: '$20M', arr: '$15M' },
  ];

  const unitEconomics = [
    {
      icon: <CurrencyDollar size={24} weight="duotone" />,
      label: 'ARPU',
      value: '₩12,000',
      subtext: '연간 구독',
      color: 'purple',
    },
    {
      icon: <Percent size={24} weight="duotone" />,
      label: 'Conversion',
      value: '8%',
      subtext: '무료→유료 전환',
      color: 'blue',
    },
    {
      icon: <Users size={24} weight="duotone" />,
      label: 'CAC',
      value: '$2.50',
      subtext: '고객 획득 비용',
      color: 'green',
    },
    {
      icon: <Target size={24} weight="duotone" />,
      label: 'LTV/CAC',
      value: '5x',
      subtext: '건전한 비율',
      color: 'pink',
    },
  ];

  const colorClasses = {
    purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    blue: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    green: { border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-400' },
    pink: { border: 'border-pink-500/40', bg: 'bg-pink-500/10', text: 'text-pink-400' },
  };

  const chartData = {
    labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
    datasets: [
      {
        label: 'Revenue ($M)',
        data: [0.2, 1.2, 4, 10, 20],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Users (100K)',
        data: [0.5, 2, 5, 10, 20],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>재무 전망</SlideTitle>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-3xl"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="h-48">
                <LineChart data={chartData} />
              </div>
            </div>
          </motion.div>

          {/* Projections Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full max-w-3xl"
          >
            <div className="grid grid-cols-4 gap-2">
              {projections.map((proj, index) => (
                <motion.div
                  key={proj.year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
                >
                  <p className="mb-2 text-sm font-bold text-purple-400">{proj.year}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-white/80">
                      <span className="text-white/50">Users: </span>{proj.users}
                    </p>
                    <p className="text-white/80">
                      <span className="text-white/50">Revenue: </span>{proj.revenue}
                    </p>
                    <p className="text-green-400">
                      <span className="text-white/50">ARR: </span>{proj.arr}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Unit Economics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="w-full max-w-3xl"
          >
            <h3 className="mb-3 text-center text-sm font-medium text-white/50">
              유닛 이코노믹스
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {unitEconomics.map((item, index) => {
                const colors = colorClasses[item.color as keyof typeof colorClasses];
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                    className={`rounded-xl border p-3 text-center ${colors.border} ${colors.bg}`}
                  >
                    <div className={`mb-2 flex justify-center ${colors.text}`}>
                      {item.icon}
                    </div>
                    <p className="text-xs text-white/50">{item.label}</p>
                    <p className={`text-xl font-bold ${colors.text}`}>{item.value}</p>
                    <p className="text-xs text-white/50">{item.subtext}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrapper>
  );
}
