'use client';

import { motion } from 'framer-motion';
import {
  Globe,
  Lightning,
  Brain,
  HeartBreak,
  Broadcast,
  Sparkle,
  CheckCircle,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide02Problem() {
  const kCultureItems = ['K-Drama', 'K-Pop', 'K-Beauty', 'K-Food'];

  const problems = [
    {
      icon: <Broadcast size={28} weight="duotone" />,
      title: '정보 과부하',
      stat: '7시간+',
      statLabel: '일 평균 스크린타임',
      color: 'text-red-400',
    },
    {
      icon: <HeartBreak size={28} weight="duotone" />,
      title: '정신 건강 위기',
      stat: '34%',
      statLabel: 'MZ 치료 경험',
      color: 'text-yellow-400',
    },
    {
      icon: <Brain size={28} weight="duotone" />,
      title: '자아 탐색 니즈',
      stat: '78%',
      statLabel: '자기이해 희망',
      color: 'text-blue-400',
    },
  ];

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>문제 & 기회</SlideTitle>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {/* K-Culture Opportunity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-5xl"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Already Global */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-xl border border-green-500/30 bg-green-500/10 p-4"
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-400">
                  <CheckCircle size={18} weight="fill" />
                  이미 세계화된 K-컬처
                </h3>
                <div className="flex flex-wrap gap-2">
                  {kCultureItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* K-Saju Opportunity */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="rounded-xl border border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-pink-500/10 p-4"
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                  <Lightning size={18} weight="fill" className="text-yellow-400" />
                  아직 수출되지 않은 숨겨진 보석
                </h3>
                <div className="flex items-center gap-3">
                  <Sparkle size={32} weight="fill" className="text-purple-400" />
                  <div>
                    <p className="text-lg font-bold text-purple-300">K-사주</p>
                    <p className="text-xs text-white/60">2,000년 역사의 한국 전통 운명학</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Market Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-6 rounded-xl border border-white/10 bg-white/5 px-6 py-3"
          >
            <div className="text-center">
              <p className="text-xl font-bold text-purple-400">$12.4B</p>
              <p className="text-xs text-white/50">K-콘텐츠 시장</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-xl font-bold text-blue-400">1.56억+</p>
              <p className="text-xs text-white/50">전 세계 한류 팬</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">14%</p>
              <p className="text-xs text-white/50">연간 성장률</p>
            </div>
          </motion.div>

          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="w-full max-w-4xl"
          >
            <h3 className="mb-4 text-center text-sm font-medium text-white/50">
              디지털 시대의 역설: 연결은 늘었지만, 자신과의 연결은 끊어졌습니다
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <div className={`mb-2 ${problem.color}`}>{problem.icon}</div>
                  <p className="mb-2 text-sm font-medium text-white">{problem.title}</p>
                  <p className={`text-2xl font-bold ${problem.color}`}>{problem.stat}</p>
                  <p className="text-xs text-white/50">{problem.statLabel}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="text-center text-lg text-white/70"
          >
            <span className="font-bold text-purple-400">한사 AI</span>가 K-사주를 세계에 소개합니다
          </motion.p>
        </div>
      </div>
    </SlideWrapper>
  );
}
