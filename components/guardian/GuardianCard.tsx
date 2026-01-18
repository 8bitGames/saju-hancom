'use client';

import { cn } from '@/lib/utils';
import { type ElementType, getGuardian } from '@/lib/constants/guardians';
import { GuardianAvatar } from './GuardianAvatar';

interface GuardianCardProps {
  element: ElementType;
  locale?: 'ko' | 'en';
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

export function GuardianCard({
  element,
  locale = 'ko',
  showDetails = true,
  className,
  onClick,
}: GuardianCardProps) {
  const guardian = getGuardian(element);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-border p-6',
        'transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:translate-y-0',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 배경 그라데이션 */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${guardian.gradientFrom}, ${guardian.gradientTo})`,
        }}
      />

      {/* 컨텐츠 */}
      <div className="relative z-10">
        {/* 헤더: 아바타 + 이름 */}
        <div className="flex items-center gap-4 mb-4">
          <GuardianAvatar element={element} size="lg" showGlow />
          <div>
            <h3 className="text-xl font-bold" style={{ color: guardian.color }}>
              {guardian.name[locale]}
            </h3>
            <p className="text-sm text-text-secondary">
              {guardian.element[locale]} · {guardian.direction[locale]}
            </p>
          </div>
        </div>

        {/* 설명 */}
        <p className="text-text-secondary mb-4 leading-relaxed">
          {guardian.description[locale]}
        </p>

        {showDetails && (
          <>
            {/* 성격 특성 */}
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                {locale === 'ko' ? '성격 특성' : 'Personality Traits'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {guardian.personality[locale].map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: guardian.colorLight }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* 강점 */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                {locale === 'ko' ? '강점' : 'Strengths'}
              </h4>
              <ul className="space-y-1">
                {guardian.strengths[locale].map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: guardian.color }}
                    />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 미니 카드 - 목록에서 간략히 표시할 때 사용
 */
export function GuardianMiniCard({
  element,
  locale = 'ko',
  selected = false,
  className,
  onClick,
}: {
  element: ElementType;
  locale?: 'ko' | 'en';
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const guardian = getGuardian(element);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
        selected
          ? 'border-2 bg-white shadow-md'
          : 'border-border bg-white hover:border-gray-300',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        borderColor: selected ? guardian.color : undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <GuardianAvatar element={element} size="sm" showGlow={selected} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary truncate">
          {guardian.name[locale]}
        </p>
        <p className="text-xs text-text-muted truncate">
          {guardian.element[locale]}
        </p>
      </div>
      {selected && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: guardian.color }}
        >
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
