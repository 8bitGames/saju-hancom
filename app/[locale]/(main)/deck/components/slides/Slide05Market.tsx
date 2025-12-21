'use client';

import { motion } from 'framer-motion';
import {
  ChartLineUp,
  Target,
  Globe,
  Sparkle,
  TrendUp,
  Users,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide05Market() {
  const marketData = [
    {
      label: 'TAM',
      value: '$147B',
      description: '글로벌 웰니스 앱 시장',
      color: 'purple',
    },
    {
      label: 'SAM',
      value: '$12B',
      description: '정신 건강 & 명상 앱',
      color: 'blue',
    },
    {
      label: 'SOM',
      value: '$2.4B',
      description: '운세 & 점술 앱 시장',
      color: 'green',
    },
  ];

  const trends = [
    {
      icon: <ChartLineUp size={24} weight="duotone" />,
      title: 'K-컬처 성장',
      stat: '14%',
      description: '연간 성장률',
    },
    {
      icon: <Users size={24} weight="duotone" />,
      title: '한류 팬',
      stat: '1.56억+',
      description: '전 세계',
    },
    {
      icon: <Globe size={24} weight="duotone" />,
      title: '타겟 지역',
      stat: '5개국',
      description: '아시아 중심',
    },
    {
      icon: <Sparkle size={24} weight="duotone" />,
      title: '운세 앱 성장',
      stat: '12%',
      description: 'CAGR',
    },
  ];

  const targetDemos = [
    { country: '한국', flag: 'KR', share: '30%' },
    { country: '일본', flag: 'JP', share: '25%' },
    { country: '중국', flag: 'CN', share: '20%' },
    { country: '동남아', flag: 'SEA', share: '15%' },
    { country: '기타', flag: 'GLOBAL', share: '10%' },
  ];

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>시장 기회</SlideTitle>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {/* Market Size Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            {/* TAM Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex h-56 w-56 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10"
            >
              {/* SAM Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex h-40 w-40 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/15"
              >
                {/* SOM Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-green-500/50 bg-green-500/20"
                >
                  <Target size={24} className="text-green-400" />
                  <span className="text-xs font-bold text-green-400">SOM</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Labels */}
            {marketData.map((item, index) => {
              const positions = [
                { right: '-140px', top: '20px' },
                { right: '-120px', top: '80px' },
                { right: '-100px', top: '140px' },
              ];
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.2 }}
                  className="absolute"
                  style={positions[index]}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full bg-${item.color}-500`} />
                    <div>
                      <p className={`text-lg font-bold text-${item.color}-400`}>
                        {item.value}
                      </p>
                      <p className="text-xs text-white/60">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Growth Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="grid w-full max-w-3xl grid-cols-4 gap-3"
          >
            {trends.map((trend, index) => (
              <motion.div
                key={trend.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
              >
                <div className="mb-2 flex justify-center text-purple-400">
                  {trend.icon}
                </div>
                <p className="text-xl font-bold text-purple-400">{trend.stat}</p>
                <p className="text-xs text-white/60">{trend.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Target Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="w-full max-w-2xl"
          >
            <h3 className="mb-3 text-center text-sm font-medium text-white/50">
              타겟 시장 비중
            </h3>
            <div className="flex h-8 overflow-hidden rounded-full">
              {targetDemos.map((demo, index) => {
                const colors = ['bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500'];
                return (
                  <motion.div
                    key={demo.country}
                    initial={{ width: 0 }}
                    animate={{ width: demo.share }}
                    transition={{ duration: 0.8, delay: 1.6 + index * 0.1 }}
                    className={`flex items-center justify-center ${colors[index]}`}
                  >
                    <span className="text-xs font-medium text-white">{demo.country}</span>
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
