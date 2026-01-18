'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Cpu,
  Globe,
  Sparkle,
  Shield,
  Lightning,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide06Competitive() {
  const competitors = [
    { name: '점신', hasAI: false, hasGlobal: false, hasPersonal: true },
    { name: '천운', hasAI: false, hasGlobal: false, hasPersonal: true },
    { name: '사주팔자', hasAI: false, hasGlobal: false, hasPersonal: false },
    { name: 'Co-Star', hasAI: true, hasGlobal: true, hasPersonal: false },
  ];

  const moats = [
    {
      icon: <Cpu size={24} weight="duotone" />,
      title: 'AI 기술력',
      description: 'GPT-4 기반 사주 해석 엔진',
      color: 'purple',
    },
    {
      icon: <Globe size={24} weight="duotone" />,
      title: '다국어 지원',
      description: '5개 언어 현지화 완료',
      color: 'blue',
    },
    {
      icon: <Sparkle size={24} weight="duotone" />,
      title: '사주+AI 융합',
      description: '세계 최초 K-사주 AI 플랫폼',
      color: 'pink',
    },
    {
      icon: <Shield size={24} weight="duotone" />,
      title: '기업부설연구소',
      description: 'R&D 센터 설립 완료',
      color: 'green',
    },
  ];

  const colorClasses = {
    purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    blue: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    pink: { border: 'border-pink-500/40', bg: 'bg-pink-500/10', icon: 'text-pink-400' },
    green: { border: 'border-green-500/40', bg: 'bg-green-500/10', icon: 'text-green-400' },
  };

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>경쟁 우위</SlideTitle>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-3xl"
          >
            <div className="overflow-hidden rounded-xl border border-white/10">
              {/* Header */}
              <div className="grid grid-cols-4 gap-px bg-white/10">
                <div className="bg-[#0f0a1a] p-3 text-sm font-medium text-white/50">
                  서비스
                </div>
                <div className="bg-[#0f0a1a] p-3 text-center text-sm font-medium text-white/50">
                  AI 기반
                </div>
                <div className="bg-[#0f0a1a] p-3 text-center text-sm font-medium text-white/50">
                  글로벌
                </div>
                <div className="bg-[#0f0a1a] p-3 text-center text-sm font-medium text-white/50">
                  개인화
                </div>
              </div>

              {/* Competitors */}
              {competitors.map((comp, index) => (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="grid grid-cols-4 gap-px bg-white/10"
                >
                  <div className="bg-[#0f0a1a] p-3 text-sm text-white/80">
                    {comp.name}
                  </div>
                  <div className="flex items-center justify-center bg-[#0f0a1a] p-3">
                    {comp.hasAI ? (
                      <CheckCircle size={18} weight="fill" className="text-green-400" />
                    ) : (
                      <XCircle size={18} weight="fill" className="text-red-400/50" />
                    )}
                  </div>
                  <div className="flex items-center justify-center bg-[#0f0a1a] p-3">
                    {comp.hasGlobal ? (
                      <CheckCircle size={18} weight="fill" className="text-green-400" />
                    ) : (
                      <XCircle size={18} weight="fill" className="text-red-400/50" />
                    )}
                  </div>
                  <div className="flex items-center justify-center bg-[#0f0a1a] p-3">
                    {comp.hasPersonal ? (
                      <CheckCircle size={18} weight="fill" className="text-green-400" />
                    ) : (
                      <XCircle size={18} weight="fill" className="text-red-400/50" />
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Cheonggiun Row */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="grid grid-cols-4 gap-px bg-purple-500/30"
              >
                <div className="bg-purple-500/20 p-3 text-sm font-bold text-purple-300">
                  청기운
                </div>
                <div className="flex items-center justify-center bg-purple-500/20 p-3">
                  <CheckCircle size={18} weight="fill" className="text-green-400" />
                </div>
                <div className="flex items-center justify-center bg-purple-500/20 p-3">
                  <CheckCircle size={18} weight="fill" className="text-green-400" />
                </div>
                <div className="flex items-center justify-center bg-purple-500/20 p-3">
                  <CheckCircle size={18} weight="fill" className="text-green-400" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Tech Moats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="w-full max-w-4xl"
          >
            <h3 className="mb-4 text-center text-sm font-medium text-white/50">
              <Lightning size={16} className="mr-1 inline text-yellow-400" />
              기술 해자 (Tech Moats)
            </h3>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {moats.map((moat, index) => {
                const colors = colorClasses[moat.color as keyof typeof colorClasses];
                return (
                  <motion.div
                    key={moat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                    className={`rounded-xl border p-4 text-center ${colors.border} ${colors.bg}`}
                  >
                    <div className={`mb-2 flex justify-center ${colors.icon}`}>
                      {moat.icon}
                    </div>
                    <p className="text-sm font-bold text-white">{moat.title}</p>
                    <p className="text-xs text-white/60">{moat.description}</p>
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
