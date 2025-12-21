'use client';

import { motion } from 'framer-motion';
import {
  UserCircle,
  Briefcase,
  Code,
  ChartPie,
  Buildings,
  Globe,
  Robot,
  Suitcase,
  GraduationCap,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide10Team() {
  const team = [
    {
      name: '정다운',
      role: 'CEO',
      icon: <Briefcase size={24} weight="duotone" />,
      background: ['MetLife 관리직', 'KB생명 코칭'],
      expertise: '비즈니스 전략',
      color: 'purple',
    },
    {
      name: '최현종',
      role: 'COO',
      icon: <ChartPie size={24} weight="duotone" />,
      background: ['패션/뷰티 CFO', '$12M 기업가치'],
      expertise: '재무 & 운영',
      color: 'blue',
    },
    {
      name: '유경진',
      role: 'CTO',
      icon: <Code size={24} weight="duotone" />,
      background: ['야나두/에듀윌 AI 강사', 'Google/Harvard 투어'],
      expertise: 'AI/ML 기술',
      color: 'green',
    },
    {
      name: '서재필',
      role: 'Lead Dev',
      icon: <Code size={24} weight="duotone" />,
      background: ['Porsche 독일 본사', '자동차 엔지니어'],
      expertise: '풀스택 개발',
      color: 'pink',
    },
  ];

  const advisors = [
    {
      title: 'AI 전문가',
      org: '대학 교수진',
      icon: <GraduationCap size={20} weight="duotone" />,
    },
    {
      title: '사주 전문가',
      org: '명리학 연구원',
      icon: <Robot size={20} weight="duotone" />,
    },
    {
      title: '투자 자문',
      org: 'VC 파트너',
      icon: <Buildings size={20} weight="duotone" />,
    },
  ];

  const colorClasses = {
    purple: {
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      icon: 'text-purple-400 bg-purple-500/20',
      role: 'text-purple-400',
    },
    blue: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400 bg-blue-500/20',
      role: 'text-blue-400',
    },
    green: {
      border: 'border-green-500/40',
      bg: 'bg-green-500/10',
      icon: 'text-green-400 bg-green-500/20',
      role: 'text-green-400',
    },
    pink: {
      border: 'border-pink-500/40',
      bg: 'bg-pink-500/10',
      icon: 'text-pink-400 bg-pink-500/20',
      role: 'text-pink-400',
    },
  };

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>팀</SlideTitle>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6 text-center text-lg text-white/60"
        >
          글로벌 경험과 기술력을 겸비한 팀
        </motion.p>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* Core Team */}
          <div className="grid w-full max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
            {team.map((member, index) => {
              const colors = colorClasses[member.color as keyof typeof colorClasses];
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`rounded-2xl border p-4 text-center ${colors.border} ${colors.bg}`}
                >
                  {/* Avatar */}
                  <div
                    className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${colors.icon}`}
                  >
                    <UserCircle size={40} weight="duotone" />
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-sm font-bold text-white">{member.name}</h3>
                  <p className={`mb-2 text-xs font-medium ${colors.role}`}>
                    {member.role}
                  </p>

                  {/* Background */}
                  <div className="mb-2 space-y-0.5">
                    {member.background.map((bg, i) => (
                      <p key={i} className="text-xs text-white/50">
                        {bg}
                      </p>
                    ))}
                  </div>

                  {/* Expertise */}
                  <div className="rounded-lg bg-white/5 px-2 py-1">
                    <p className="text-xs text-white/60">{member.expertise}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Advisors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="w-full max-w-2xl"
          >
            <h3 className="mb-3 text-center text-sm font-medium text-white/50">
              자문단
            </h3>
            <div className="flex gap-3">
              {advisors.map((advisor, index) => (
                <motion.div
                  key={advisor.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                  className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-purple-400">{advisor.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{advisor.title}</p>
                    <p className="text-xs text-white/50">{advisor.org}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Strength */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/60"
          >
            <span className="flex items-center gap-1">
              <Buildings size={16} weight="duotone" className="text-purple-400" /> 기업 경험
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <Globe size={16} weight="duotone" className="text-blue-400" /> 글로벌 네트워크
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <Robot size={16} weight="duotone" className="text-green-400" /> AI/ML 전문성
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <Suitcase size={16} weight="duotone" className="text-pink-400" /> 스타트업 경험
            </span>
          </motion.div>
        </div>
      </div>
    </SlideWrapper>
  );
}
