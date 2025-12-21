'use client';

import { motion } from 'framer-motion';
import {
  Rocket,
  Users,
  Star,
  Download,
  Trophy,
  Certificate,
  Check,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export default function Slide11Traction() {
  const metrics = [
    {
      icon: <Download size={28} weight="duotone" />,
      value: 5000,
      suffix: '+',
      label: '베타 다운로드',
      color: 'purple',
    },
    {
      icon: <Users size={28} weight="duotone" />,
      value: 2500,
      suffix: '+',
      label: '활성 사용자',
      color: 'blue',
    },
    {
      icon: <Star size={28} weight="duotone" />,
      value: 4.8,
      suffix: '/5',
      label: '평균 평점',
      color: 'yellow',
    },
    {
      icon: <Trophy size={28} weight="duotone" />,
      value: 95,
      suffix: '%',
      label: '만족도',
      color: 'green',
    },
  ];

  const colorClasses = {
    purple: {
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      icon: 'text-purple-400 bg-purple-500/20',
      value: 'text-purple-400',
    },
    blue: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400 bg-blue-500/20',
      value: 'text-blue-400',
    },
    yellow: {
      border: 'border-yellow-500/40',
      bg: 'bg-yellow-500/10',
      icon: 'text-yellow-400 bg-yellow-500/20',
      value: 'text-yellow-400',
    },
    green: {
      border: 'border-green-500/40',
      bg: 'bg-green-500/10',
      icon: 'text-green-400 bg-green-500/20',
      value: 'text-green-400',
    },
  };

  const milestones = [
    {
      date: '2024 Q3',
      title: '베타 런칭',
      description: '국내 베타 서비스 출시',
      completed: true,
    },
    {
      date: '2024 Q4',
      title: '기업부설연구소',
      description: 'R&D 센터 설립',
      completed: true,
    },
    {
      date: '2025 Q1',
      title: '정식 출시',
      description: '앱스토어 정식 출시 예정',
      completed: false,
    },
    {
      date: '2025 Q2',
      title: '벤처인증',
      description: '벤처기업 인증 취득 예정',
      completed: false,
    },
  ];

  const achievements = [
    { icon: <Certificate size={20} weight="duotone" />, text: '기업부설연구소 설립' },
    { icon: <Rocket size={20} weight="duotone" />, text: '벤처인증 진행중' },
    { icon: <Trophy size={20} weight="duotone" />, text: '몽골 정부 MOU 체결' },
  ];

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>트랙션 & 마일스톤</SlideTitle>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* Key Metrics */}
          <div className="grid w-full max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((metric, index) => {
              const colors =
                colorClasses[metric.color as keyof typeof colorClasses];
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={`rounded-2xl border p-5 text-center ${colors.border} ${colors.bg}`}
                >
                  <div
                    className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${colors.icon}`}
                  >
                    {metric.icon}
                  </div>
                  <div className={`text-3xl font-bold ${colors.value}`}>
                    <AnimatedCounter
                      value={metric.value}
                      suffix={metric.suffix}
                      decimals={metric.value < 10 ? 1 : 0}
                    />
                  </div>
                  <p className="text-sm text-white/60">{metric.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="w-full max-w-4xl"
          >
            <h3 className="mb-4 text-center text-sm font-medium text-white/50">
              주요 마일스톤
            </h3>
            <div className="flex items-start justify-between">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className="flex flex-1 flex-col items-center"
                >
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                      milestone.completed
                        ? 'bg-green-500 text-white'
                        : 'border border-white/30 bg-white/5 text-white/50'
                    }`}
                  >
                    {milestone.completed ? <Check size={20} weight="bold" /> : index + 1}
                  </div>
                  <p
                    className={`text-xs font-bold ${
                      milestone.completed ? 'text-green-400' : 'text-white/50'
                    }`}
                  >
                    {milestone.date}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {milestone.title}
                  </p>
                  <p className="text-xs text-white/50">
                    {milestone.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex gap-4"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2"
              >
                <span className="text-purple-400">{achievement.icon}</span>
                <span className="text-sm text-white">{achievement.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </SlideWrapper>
  );
}
