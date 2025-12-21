'use client';

import { motion } from 'framer-motion';
import {
  Sparkle,
  Heart,
  BookOpen,
  UserFocus,
  DeviceMobile,
  Globe,
  Download,
  Star,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide04Product() {
  const features = [
    {
      icon: <Sparkle size={32} weight="duotone" />,
      title: 'AI 사주 분석',
      description: '사주팔자 기반 성격, 운세, 인생 방향 분석',
      color: 'purple',
    },
    {
      icon: <Heart size={32} weight="duotone" />,
      title: '궁합 분석',
      description: '연인, 친구, 비즈니스 파트너 궁합 확인',
      color: 'pink',
    },
    {
      icon: <BookOpen size={32} weight="duotone" />,
      title: 'AI 다이어리',
      description: 'AI가 도와주는 일기 작성 및 자기 성찰',
      color: 'blue',
    },
    {
      icon: <UserFocus size={32} weight="duotone" />,
      title: '관상 분석',
      description: '얼굴 사진으로 관상 및 성격 분석',
      color: 'green',
    },
  ];

  const colorClasses = {
    purple: {
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      icon: 'text-purple-400',
    },
    pink: {
      border: 'border-pink-500/40',
      bg: 'bg-pink-500/10',
      icon: 'text-pink-400',
    },
    blue: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400',
    },
    green: {
      border: 'border-green-500/40',
      bg: 'bg-green-500/10',
      icon: 'text-green-400',
    },
  };

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>제품</SlideTitle>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 text-center text-lg text-white/60"
        >
          AI가 당신의 운명을 읽어드립니다
        </motion.p>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {/* Core Features */}
          <div className="grid w-full max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
            {features.map((feature, index) => {
              const colors = colorClasses[feature.color as keyof typeof colorClasses];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`rounded-2xl border p-5 text-center ${colors.border} ${colors.bg}`}
                >
                  <div className={`mb-3 flex justify-center ${colors.icon}`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-white/60">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* App Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-8"
          >
            {/* Phone Mockup */}
            <div className="relative">
              <div className="relative h-64 w-32 overflow-hidden rounded-3xl border-4 border-white/20 bg-gradient-to-br from-purple-900 to-pink-900">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Sparkle size={48} weight="fill" className="mb-4 text-purple-300" />
                  <p className="text-center text-xs text-white/80">한사 AI</p>
                  <p className="text-center text-xs text-white/50">사주 분석 화면</p>
                </div>
              </div>
              {/* Notch */}
              <div className="absolute left-1/2 top-1 h-4 w-12 -translate-x-1/2 rounded-full bg-black/50" />
            </div>

            {/* App Stats */}
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <DeviceMobile size={20} className="text-purple-400" />
                <span className="text-sm text-white/80">iOS & Android</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.1 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <Globe size={20} className="text-blue-400" />
                <span className="text-sm text-white/80">5개 언어 지원</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <Download size={20} className="text-green-400" />
                <span className="text-sm text-white/80">5,000+ 베타 다운로드</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.3 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <Star size={20} className="text-yellow-400" />
                <span className="text-sm text-white/80">4.8/5 평균 평점</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrapper>
  );
}
