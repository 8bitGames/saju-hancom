'use client';

import { cn } from '@/lib/utils';
import { type ElementType, GUARDIANS, ELEMENT_ORDER } from '@/lib/constants/guardians';

interface ElementBarProps {
  scores: Record<ElementType, number>;
  showLabels?: boolean;
  showPercentages?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function ElementBar({
  scores,
  showLabels = true,
  showPercentages = true,
  size = 'md',
  className,
}: ElementBarProps) {
  // 총합 계산
  const total = Object.values(scores).reduce((sum, val) => sum + val, 0);

  // 각 요소의 비율 계산
  const percentages = ELEMENT_ORDER.reduce(
    (acc, element) => ({
      ...acc,
      [element]: total > 0 ? Math.round((scores[element] / total) * 100) : 0,
    }),
    {} as Record<ElementType, number>
  );

  return (
    <div className={cn('w-full', className)}>
      {/* 막대 그래프 */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden flex',
          sizeClasses[size],
          'bg-gray-100'
        )}
      >
        {ELEMENT_ORDER.map((element) => {
          const percentage = percentages[element];
          const guardian = GUARDIANS[element];

          if (percentage === 0) return null;

          return (
            <div
              key={element}
              className="h-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: guardian.color,
              }}
              title={`${guardian.element.ko}: ${percentage}%`}
            />
          );
        })}
      </div>

      {/* 레이블 */}
      {(showLabels || showPercentages) && (
        <div className="flex justify-between mt-2">
          {ELEMENT_ORDER.map((element) => {
            const percentage = percentages[element];
            const guardian = GUARDIANS[element];

            return (
              <div
                key={element}
                className={cn(
                  'flex flex-col items-center',
                  labelSizeClasses[size]
                )}
              >
                {showLabels && (
                  <span
                    className="font-medium"
                    style={{ color: guardian.color }}
                  >
                    {guardian.element.ko.charAt(0)}
                  </span>
                )}
                {showPercentages && (
                  <span className="text-text-muted">
                    {percentage}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 단일 오행 막대 (개별 표시용)
 */
export function SingleElementBar({
  element,
  value,
  maxValue = 100,
  showLabel = true,
  size = 'md',
  className,
}: {
  element: ElementType;
  value: number;
  maxValue?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const guardian = GUARDIANS[element];
  const percentage = Math.min(Math.round((value / maxValue) * 100), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span
            className={cn('font-medium', labelSizeClasses[size])}
            style={{ color: guardian.color }}
          >
            {guardian.element.ko}
          </span>
          <span className={cn('text-text-muted', labelSizeClasses[size])}>
            {percentage}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-gray-100',
          sizeClasses[size]
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: guardian.color,
          }}
        />
      </div>
    </div>
  );
}

/**
 * 오행 리스트 (세로 배열)
 */
export function ElementBarList({
  scores,
  size = 'md',
  className,
}: {
  scores: Record<ElementType, number>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const maxValue = Math.max(...Object.values(scores), 1);

  return (
    <div className={cn('space-y-3', className)}>
      {ELEMENT_ORDER.map((element) => (
        <SingleElementBar
          key={element}
          element={element}
          value={scores[element] || 0}
          maxValue={maxValue}
          size={size}
        />
      ))}
    </div>
  );
}

/**
 * 컴팩트 오행 뱃지 (인라인 표시용)
 */
export function ElementBadges({
  scores,
  maxDisplay = 3,
  className,
}: {
  scores: Record<ElementType, number>;
  maxDisplay?: number;
  className?: string;
}) {
  // 점수 순으로 정렬
  const sorted = ELEMENT_ORDER
    .map((element) => ({ element, score: scores[element] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDisplay);

  const total = Object.values(scores).reduce((sum, val) => sum + val, 0);

  return (
    <div className={cn('flex gap-2 flex-wrap', className)}>
      {sorted.map(({ element, score }) => {
        const guardian = GUARDIANS[element];
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        return (
          <span
            key={element}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: guardian.color }}
          >
            <span>{guardian.element.ko.charAt(0)}</span>
            <span className="opacity-80">{percentage}%</span>
          </span>
        );
      })}
    </div>
  );
}
