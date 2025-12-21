'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideWrapperProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

export function SlideWrapper({
  children,
  className = '',
  gradient,
}: SlideWrapperProps) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center p-8 lg:p-16 ${className}`}
      style={
        gradient
          ? {
              background: gradient,
            }
          : undefined
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 h-full w-full max-w-7xl"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function SlideTitle({ children }: { children: ReactNode }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-8 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-center text-4xl font-bold text-transparent lg:text-5xl"
    >
      {children}
    </motion.h1>
  );
}

export function SlideSubtitle({ children }: { children: ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-12 text-center text-lg text-white/70 lg:text-xl"
    >
      {children}
    </motion.p>
  );
}

export function StatCard({
  value,
  label,
  icon,
  delay = 0,
  color = 'purple',
}: {
  value: string;
  label: string;
  icon?: ReactNode;
  delay?: number;
  color?: 'purple' | 'blue' | 'green' | 'red' | 'yellow';
}) {
  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  };

  const textColors = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 + delay }}
      className={`rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-sm ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3">
        {icon && <div className={textColors[color]}>{icon}</div>}
        <div>
          <p className={`text-3xl font-bold ${textColors[color]}`}>{value}</p>
          <p className="text-sm text-white/60">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ContentCard({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + delay }}
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
