"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import {
  X,
  Buildings,
  EnvelopeSimple,
  MapPin,
  Certificate,
  User,
  Brain,
  Books,
  Sparkle,
  Globe,
  Heart,
} from "@phosphor-icons/react";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyModal({ isOpen, onClose }: CompanyModalProps) {
  const locale = useLocale();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const content = {
    en: {
      title: "About Hansa AI",
      tagline: "Where Ancient Wisdom Meets Modern Technology",
      intro: {
        heading: "Discover Your Destiny",
        p1: "Hansa AI is a cutting-edge fortune-telling platform that bridges the gap between traditional Korean metaphysics (명리학, Myeongrihak) and state-of-the-art artificial intelligence. We've trained our AI models on over 100 comprehensive books about Saju (사주, Four Pillars of Destiny), creating the most accurate and insightful digital fortune-telling experience available today.",
        p2: "Our mission is to make the profound wisdom of Korean fortune-telling accessible to a global audience. Whether you're a Gen Z explorer curious about Korean culture, a millennial seeking guidance, or anyone fascinated by the intersection of tradition and technology, Hansa AI offers personalized insights into your life path, relationships, and future.",
      },
      features: {
        heading: "What Makes Us Special",
        items: [
          {
            icon: Brain,
            title: "Advanced AI Technology",
            desc: "Powered by the latest generative AI models trained specifically on Korean metaphysical traditions",
          },
          {
            icon: Books,
            title: "100+ Source Books",
            desc: "Our knowledge base draws from over 100 authoritative texts on Saju and Myeongrihak",
          },
          {
            icon: Globe,
            title: "Built for Global Users",
            desc: "Designed for foreigners, Gen Z, and millennials interested in authentic Korean culture",
          },
          {
            icon: Heart,
            title: "Personalized Insights",
            desc: "Get detailed readings on your personality, career, relationships, and life path",
          },
        ],
      },
      company: {
        heading: "Company Information",
        name: "ModOn AI",
        certification: "Certified Venture Company",
        ceo: "CEO: Dawoon Jung",
        registration: "Business Registration: 145-87-03354",
        address: "4F, 94 Sapyeong-daero 53-gil, Seocho-gu, Seoul, Korea",
        contact: "Contact",
      },
      close: "Close",
    },
    ko: {
      title: "한사 AI 소개",
      tagline: "고대의 지혜와 현대 기술의 만남",
      intro: {
        heading: "당신의 운명을 발견하세요",
        p1: "한사 AI는 전통 한국 명리학과 최첨단 인공지능을 결합한 혁신적인 운세 플랫폼입니다. 사주(四柱八字)에 관한 100권 이상의 전문 서적으로 AI 모델을 학습시켜, 현존하는 가장 정확하고 통찰력 있는 디지털 운세 서비스를 제공합니다.",
        p2: "저희의 미션은 한국 명리학의 깊은 지혜를 전 세계에 알리는 것입니다. 한국 문화에 관심 있는 MZ세대, 인생의 방향을 찾는 분들, 전통과 기술의 조화에 매료된 모든 분들에게 한사 AI는 인생 경로, 관계, 미래에 대한 맞춤형 인사이트를 제공합니다.",
      },
      features: {
        heading: "한사 AI의 특별함",
        items: [
          {
            icon: Brain,
            title: "최첨단 AI 기술",
            desc: "한국 명리학 전통에 특화된 최신 생성형 AI 모델 적용",
          },
          {
            icon: Books,
            title: "100권 이상의 원전 학습",
            desc: "사주명리학 관련 100권 이상의 권위 있는 서적을 바탕으로 구축",
          },
          {
            icon: Globe,
            title: "글로벌 사용자 대상",
            desc: "한국 문화에 관심 있는 외국인과 MZ세대를 위해 설계",
          },
          {
            icon: Heart,
            title: "맞춤형 인사이트",
            desc: "성격, 직업, 관계, 인생 경로에 대한 상세한 분석 제공",
          },
        ],
      },
      company: {
        heading: "회사 정보",
        name: "모드온 AI",
        certification: "벤처기업인증",
        ceo: "대표: 정다운",
        registration: "사업자등록번호: 145-87-03354",
        address: "서울특별시 서초구 사평대로53길 94, 4층",
        contact: "연락처",
      },
      close: "닫기",
    },
  };

  const t = content[locale as "en" | "ko"] || content.en;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 bg-gradient-to-br from-[#1a1033] via-[#0f0a1a] to-[#1a0a2a] rounded-3xl border border-white/10 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-white" weight="bold" />
            </motion.button>

            <motion.div
              className="p-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header with animated title */}
              <motion.div className="text-center mb-8" variants={itemVariants}>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {t.title.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ display: "inline-block" }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </h1>

                <motion.p
                  className="text-purple-300 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {t.tagline}
                </motion.p>
              </motion.div>

              {/* Introduction */}
              <motion.div className="mb-8" variants={itemVariants}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-purple-400" weight="fill" />
                  {t.intro.heading}
                </h2>
                <p className="text-white/80 leading-relaxed mb-4" style={{ fontSize: "inherit" }}>
                  {t.intro.p1}
                </p>
                <p className="text-white/80 leading-relaxed" style={{ fontSize: "inherit" }}>
                  {t.intro.p2}
                </p>
              </motion.div>

              {/* Features Grid */}
              <motion.div className="mb-8" variants={itemVariants}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Certificate className="w-5 h-5 text-purple-400" weight="fill" />
                  {t.features.heading}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {t.features.items.map((item, index) => (
                    <motion.div
                      key={index}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3"
                        whileHover={{ rotate: 10 }}
                      >
                        <item.icon className="w-5 h-5 text-purple-400" weight="duotone" />
                      </motion.div>
                      <h3 className="text-white font-medium mb-1" style={{ fontSize: "inherit" }}>{item.title}</h3>
                      <p className="text-white/60 text-sm" style={{ fontSize: "inherit" }}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Company Info */}
              <motion.div
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20"
                variants={itemVariants}
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Buildings className="w-5 h-5 text-purple-400" weight="fill" />
                  {t.company.heading}
                </h2>

                <div className="space-y-3">
                  <motion.div
                    className="flex items-center gap-3 text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Buildings className="w-4 h-4 text-purple-400 flex-shrink-0" weight="duotone" />
                    <span style={{ fontSize: "inherit" }}>{t.company.name}</span>
                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                      {t.company.certification}
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-3 text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <User className="w-4 h-4 text-purple-400 flex-shrink-0" weight="duotone" />
                    <span style={{ fontSize: "inherit" }}>{t.company.ceo}</span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-3 text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <Certificate className="w-4 h-4 text-purple-400 flex-shrink-0" weight="duotone" />
                    <span style={{ fontSize: "inherit" }}>{t.company.registration}</span>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-3 text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" weight="duotone" />
                    <span style={{ fontSize: "inherit" }}>{t.company.address}</span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-3 text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <EnvelopeSimple className="w-4 h-4 text-purple-400 flex-shrink-0" weight="duotone" />
                    <span style={{ fontSize: "inherit" }}>{t.company.contact}: info@modawn.ai</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
              >
                {t.close}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
