'use client';

import { motion } from 'framer-motion';
import { Sparkle, Star } from '@phosphor-icons/react';
import { SlideWrapper } from '../ui/SlideWrapper';

export default function Slide01Hero() {
  return (
    <SlideWrapper className="flex flex-col items-center justify-center text-center">
      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 overflow-hidden"
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 + i * 0.2 }}
            className="absolute"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
            }}
          >
            <Star size={24} weight="fill" className="text-purple-400" />
          </motion.div>
        ))}
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          type: 'spring',
          stiffness: 100,
        }}
        className="mb-8 flex items-center gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/30 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm lg:h-32 lg:w-32">
            <Sparkle size={48} weight="fill" className="text-purple-400" />
          </div>
        </div>
      </motion.div>

      {/* Brand Name */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-4 text-6xl font-bold lg:text-8xl"
      >
        <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
          청기운
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-2 text-xl text-purple-300 lg:text-2xl"
      >
        青 · 氣 · 運
      </motion.p>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mb-12 text-2xl text-white/80 lg:text-3xl"
      >
        AI가 읽어주는 당신의 운명
      </motion.p>

      {/* Value Proposition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-8 py-4 backdrop-blur-sm"
      >
        <p className="text-lg text-white/90 lg:text-xl">
          세계 최초 AI 기반 K-사주 플랫폼
        </p>
      </motion.div>

      {/* Presenter Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-sm text-white/50">투자 제안서 2024</p>
      </motion.div>
    </SlideWrapper>
  );
}
