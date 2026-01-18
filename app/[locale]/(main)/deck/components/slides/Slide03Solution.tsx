'use client';

import { motion } from 'framer-motion';
import {
  Sparkle,
  Eye,
  Cpu,
  YinYang,
  BookOpen,
  Heart,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide03Solution() {
  const features = [
    {
      icon: <YinYang size={28} weight="duotone" />,
      title: '전통 사주명리',
      description: '2,000년 역사의 동양 철학',
    },
    {
      icon: <Cpu size={28} weight="duotone" />,
      title: 'AI 기술',
      description: '최신 NLP 및 ML 기술',
    },
    {
      icon: <Eye size={28} weight="duotone" />,
      title: '자기 성찰',
      description: '내면을 들여다보는 창',
    },
  ];

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col items-center justify-center">
        <SlideTitle>청기운 솔루션</SlideTitle>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12 text-center text-xl text-white/70"
        >
          내면을 들여다보는 창
        </motion.p>

        {/* Central Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mb-12"
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl" />

          {/* Main Circle */}
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-purple-500/40 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 lg:h-64 lg:w-64">
            {/* Inner Circle */}
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-purple-400/40 bg-gradient-to-br from-purple-500/30 to-pink-500/20 lg:h-40 lg:w-40">
              <Sparkle size={64} weight="fill" className="text-purple-300" />
            </div>

            {/* Orbiting Features */}
            {features.map((feature, i) => {
              const angle = (i * 120 - 90) * (Math.PI / 180);
              const radius = 140;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                    <div className="text-purple-300">{feature.icon}</div>
                  </div>
                  <span className="whitespace-nowrap text-xs text-white/80">
                    {feature.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            { icon: <Sparkle size={24} weight="duotone" className="text-purple-400" />, text: 'AI 기반 사주 분석' },
            { icon: <BookOpen size={24} weight="duotone" className="text-purple-400" />, text: 'AI 일기 작성 도우미' },
            { icon: <Heart size={24} weight="duotone" className="text-purple-400" />, text: '궁합 및 관계 분석' },
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              {item.icon}
              <span className="text-sm text-white/80">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SlideWrapper>
  );
}
