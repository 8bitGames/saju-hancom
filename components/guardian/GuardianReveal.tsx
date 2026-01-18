'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { type ElementType, getGuardian } from '@/lib/constants/guardians';
import { GuardianAvatar } from './GuardianAvatar';

interface GuardianRevealProps {
  element: ElementType;
  locale?: 'ko' | 'en';
  autoStart?: boolean;
  onComplete?: () => void;
  className?: string;
}

type RevealStep = 'hidden' | 'glow' | 'reveal' | 'complete';

export function GuardianReveal({
  element,
  locale = 'ko',
  autoStart = true,
  onComplete,
  className,
}: GuardianRevealProps) {
  const [step, setStep] = useState<RevealStep>(autoStart ? 'hidden' : 'hidden');
  const guardian = getGuardian(element);

  useEffect(() => {
    if (!autoStart) return;

    const timers: NodeJS.Timeout[] = [];

    // Step 1: Start glow effect
    timers.push(
      setTimeout(() => {
        setStep('glow');
      }, 300)
    );

    // Step 2: Reveal guardian
    timers.push(
      setTimeout(() => {
        setStep('reveal');
      }, 1200)
    );

    // Step 3: Complete
    timers.push(
      setTimeout(() => {
        setStep('complete');
        onComplete?.();
      }, 2000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [autoStart, onComplete]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8',
        className
      )}
    >
      {/* 글로우 배경 효과 */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-1000',
          step === 'glow' || step === 'reveal' || step === 'complete'
            ? 'opacity-100'
            : 'opacity-0'
        )}
        style={{
          background: `radial-gradient(circle at center, ${guardian.colorLight}20 0%, transparent 70%)`,
        }}
      />

      {/* 수호신 아바타 */}
      <div
        className={cn(
          'relative z-10 transition-all',
          step === 'hidden' && 'opacity-0 scale-50',
          step === 'glow' && 'opacity-50 scale-75 blur-sm',
          step === 'reveal' && 'animate-guardian-reveal',
          step === 'complete' && 'opacity-100 scale-100'
        )}
      >
        <GuardianAvatar
          element={element}
          size="2xl"
          showGlow={step === 'complete'}
        />
      </div>

      {/* 수호신 이름 */}
      <div
        className={cn(
          'relative z-10 mt-6 text-center transition-all duration-500 delay-300',
          step === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: guardian.color }}
        >
          {guardian.name[locale]}
        </h2>
        <p className="text-text-secondary">
          {guardian.element[locale]} · {locale === 'ko' ? '당신의 수호신' : 'Your Guardian'}
        </p>
      </div>

      {/* 설명 텍스트 */}
      <p
        className={cn(
          'relative z-10 mt-4 text-center text-text-secondary max-w-sm px-4 transition-all duration-500 delay-500',
          step === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        {guardian.description[locale]}
      </p>
    </div>
  );
}

/**
 * 간단한 수호신 공개 (애니메이션 없이)
 */
export function GuardianRevealSimple({
  element,
  locale = 'ko',
  className,
}: {
  element: ElementType;
  locale?: 'ko' | 'en';
  className?: string;
}) {
  const guardian = getGuardian(element);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-6',
        className
      )}
    >
      <GuardianAvatar element={element} size="xl" showGlow />

      <div className="mt-4 text-center">
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: guardian.color }}
        >
          {guardian.name[locale]}
        </h2>
        <p className="text-sm text-text-secondary">
          {guardian.element[locale]}
        </p>
      </div>
    </div>
  );
}

/**
 * 로딩 중 수호신 찾기 애니메이션
 */
export function GuardianSearching({
  locale = 'ko',
  className,
}: {
  locale?: 'ko' | 'en';
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const elements: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % elements.length);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8',
        className
      )}
    >
      <div className="relative">
        {/* 회전하는 수호신들 */}
        <div className="w-24 h-24 relative">
          {elements.map((element, index) => {
            const isActive = index === currentIndex;
            const guardian = getGuardian(element);

            return (
              <div
                key={element}
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300',
                  isActive
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-50'
                )}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{
                    background: `linear-gradient(135deg, ${guardian.gradientFrom}, ${guardian.gradientTo})`,
                  }}
                >
                  {guardian.emoji}
                </div>
              </div>
            );
          })}
        </div>

        {/* 회전 링 */}
        <div className="absolute inset-0 w-24 h-24 border-4 border-brand-primary/20 rounded-full animate-spin" />
        <div
          className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-brand-primary rounded-full animate-spin"
          style={{ animationDuration: '1s' }}
        />
      </div>

      <p className="mt-6 text-text-secondary animate-pulse">
        {locale === 'ko' ? '수호신을 찾고 있습니다...' : 'Finding your guardian...'}
      </p>
    </div>
  );
}
