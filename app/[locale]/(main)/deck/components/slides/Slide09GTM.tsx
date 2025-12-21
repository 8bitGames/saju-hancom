'use client';

import { motion } from 'framer-motion';
import {
  Rocket,
  Users,
  Megaphone,
  Handshake,
  Globe,
  TiktokLogo,
  YoutubeLogo,
  InstagramLogo,
} from '@phosphor-icons/react';
import { SlideWrapper, SlideTitle } from '../ui/SlideWrapper';

export default function Slide09GTM() {
  const phases = [
    {
      phase: 'Phase 1',
      title: '국내 런칭',
      period: '2025 Q1',
      items: ['앱스토어 정식 출시', '국내 마케팅 집중', 'PR 캠페인'],
      color: 'purple',
    },
    {
      phase: 'Phase 2',
      title: '아시아 확장',
      period: '2025 Q3',
      items: ['일본/동남아 진출', '현지화 완료', '파트너십 확대'],
      color: 'blue',
    },
    {
      phase: 'Phase 3',
      title: '글로벌 확장',
      period: '2026',
      items: ['미주/유럽 진출', '글로벌 인플루언서', 'B2B 채널'],
      color: 'green',
    },
  ];

  const channels = [
    {
      icon: <TiktokLogo size={24} weight="duotone" />,
      name: 'TikTok',
      strategy: '바이럴 콘텐츠',
    },
    {
      icon: <YoutubeLogo size={24} weight="duotone" />,
      name: 'YouTube',
      strategy: '인플루언서 협업',
    },
    {
      icon: <InstagramLogo size={24} weight="duotone" />,
      name: 'Instagram',
      strategy: '스토리/릴스',
    },
    {
      icon: <Globe size={24} weight="duotone" />,
      name: 'SEO/ASO',
      strategy: '오가닉 성장',
    },
  ];

  const partnerships = [
    { type: '정부', partner: '몽골 정부 MOU 체결', status: 'completed' },
    { type: '미디어', partner: 'K-콘텐츠 플랫폼', status: 'in-progress' },
    { type: '엔터', partner: '엔터테인먼트 기획사', status: 'planned' },
  ];

  const colorClasses = {
    purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-500' },
    blue: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
    green: { border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  };

  return (
    <SlideWrapper>
      <div className="flex h-full flex-col">
        <SlideTitle>GTM 전략</SlideTitle>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* Launch Phases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-4xl"
          >
            <div className="grid grid-cols-3 gap-4">
              {phases.map((phase, index) => {
                const colors = colorClasses[phase.color as keyof typeof colorClasses];
                return (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                    className={`rounded-xl border p-4 ${colors.border} ${colors.bg}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
                      <span className={`text-xs font-bold ${colors.text}`}>
                        {phase.phase}
                      </span>
                      <span className="text-xs text-white/50">{phase.period}</span>
                    </div>
                    <h3 className="mb-2 text-sm font-bold text-white">{phase.title}</h3>
                    <ul className="space-y-1">
                      {phase.items.map((item) => (
                        <li key={item} className="text-xs text-white/60">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Marketing Channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full max-w-3xl"
          >
            <h3 className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-white/50">
              <Megaphone size={16} className="text-purple-400" />
              마케팅 채널
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {channels.map((channel, index) => (
                <motion.div
                  key={channel.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
                >
                  <div className="mb-2 flex justify-center text-purple-400">
                    {channel.icon}
                  </div>
                  <p className="text-sm font-medium text-white">{channel.name}</p>
                  <p className="text-xs text-white/50">{channel.strategy}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Partnerships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="w-full max-w-2xl"
          >
            <h3 className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-white/50">
              <Handshake size={16} className="text-purple-400" />
              전략적 파트너십
            </h3>
            <div className="flex gap-3">
              {partnerships.map((p, index) => (
                <motion.div
                  key={p.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                  className={`flex-1 rounded-xl border p-3 ${
                    p.status === 'completed'
                      ? 'border-green-500/40 bg-green-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <p className="text-xs text-white/50">{p.type}</p>
                  <p className="text-sm font-medium text-white">{p.partner}</p>
                  <span
                    className={`text-xs ${
                      p.status === 'completed'
                        ? 'text-green-400'
                        : p.status === 'in-progress'
                        ? 'text-yellow-400'
                        : 'text-white/40'
                    }`}
                  >
                    {p.status === 'completed' && '완료'}
                    {p.status === 'in-progress' && '진행중'}
                    {p.status === 'planned' && '예정'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrapper>
  );
}
