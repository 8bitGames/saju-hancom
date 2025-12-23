'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
  CaretLeft,
  CaretRight,
  House,
  Presentation,
} from '@phosphor-icons/react';
import { StarsBackground } from '@/components/ui/aceternity/stars-background';
import { ShootingStars } from '@/components/ui/aceternity/shooting-stars';

// 12 Consolidated Slides
import Slide01Hero from './components/slides/Slide01Hero';
import Slide02Problem from './components/slides/Slide02Problem';
import Slide03Solution from './components/slides/Slide03Solution';
import Slide04Product from './components/slides/Slide04Product';
import Slide05Market from './components/slides/Slide05Market';
import Slide06Competitive from './components/slides/Slide06Competitive';
import Slide07BusinessModel from './components/slides/Slide07BusinessModel';
import Slide08Financials from './components/slides/Slide08Financials';
import Slide09GTM from './components/slides/Slide09GTM';
import Slide10Team from './components/slides/Slide10Team';
import Slide11Traction from './components/slides/Slide11Traction';
import Slide12Ask from './components/slides/Slide12Ask';

const slides = [
  { id: 1, component: Slide01Hero, title: '표지' },
  { id: 2, component: Slide02Problem, title: '문제와 기회' },
  { id: 3, component: Slide03Solution, title: '솔루션' },
  { id: 4, component: Slide04Product, title: '제품' },
  { id: 5, component: Slide05Market, title: '시장' },
  { id: 6, component: Slide06Competitive, title: '경쟁 우위' },
  { id: 7, component: Slide07BusinessModel, title: '비즈니스 모델' },
  { id: 8, component: Slide08Financials, title: '재무 전망' },
  { id: 9, component: Slide09GTM, title: 'GTM 전략' },
  { id: 10, component: Slide10Team, title: '팀' },
  { id: 11, component: Slide11Traction, title: '트랙션' },
  { id: 12, component: Slide12Ask, title: '투자 제안' },
];

export default function DeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(slides.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  const CurrentSlideComponent = slides[currentSlide].component;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#0f0a1a]"
      {...swipeHandlers}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <StarsBackground starDensity={0.0003} allStarsTwinkle />
        <ShootingStars minSpeed={10} maxSpeed={30} />
      </div>

      {/* Slide Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 z-10"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <CaretLeft size={20} weight="bold" className="text-white" />
        </button>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/70">
            {currentSlide + 1}
          </span>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm font-medium text-white/70">
            {slides.length}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <CaretRight size={20} weight="bold" className="text-white" />
        </button>
      </div>

      {/* Slide Title */}
      <div className="absolute bottom-6 right-6 z-20">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <Presentation size={16} className="text-purple-400" />
          <span className="text-sm font-medium text-white/80">
            {slides[currentSlide].title}
          </span>
        </div>
      </div>

      {/* Home Button */}
      <a
        href="/"
        className="absolute left-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20"
      >
        <House size={20} className="text-white" />
      </a>

      {/* Slide Thumbnails (hidden on mobile) */}
      <div className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-1 lg:flex">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-4 bg-purple-500'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            title={slide.title}
          />
        ))}
      </div>
    </div>
  );
}
