'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { type ElementType, getGuardian } from '@/lib/constants/guardians';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GuardianAvatarProps {
  element: ElementType;
  size?: AvatarSize;
  showGlow?: boolean;
  showName?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-3xl',
  xl: 'w-28 h-28 text-4xl',
  '2xl': 'w-36 h-36 text-5xl',
};

const nameSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-xs mt-1',
  md: 'text-sm mt-1.5',
  lg: 'text-base mt-2',
  xl: 'text-lg mt-2',
  '2xl': 'text-xl mt-3',
};

export function GuardianAvatar({
  element,
  size = 'md',
  showGlow = true,
  showName = false,
  className,
  onClick,
}: GuardianAvatarProps) {
  const guardian = getGuardian(element);

  return (
    <div
      className={cn('flex flex-col items-center', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden',
          sizeClasses[size],
          showGlow && guardian.glowAnimation,
          onClick && 'cursor-pointer hover:scale-105 active:scale-95'
        )}
        style={{
          background: `linear-gradient(135deg, ${guardian.gradientFrom}, ${guardian.gradientTo})`,
        }}
      >
        <Image
          src={guardian.imagePath}
          alt={guardian.name.ko}
          width={80}
          height={80}
          className="w-[70%] h-[70%] object-contain"
        />
      </div>

      {showName && (
        <span
          className={cn(
            'font-semibold text-center',
            nameSizeClasses[size]
          )}
          style={{ color: guardian.color }}
        >
          {guardian.name.ko}
        </span>
      )}
    </div>
  );
}

/**
 * 작은 인라인 아바타 (채팅 등에서 사용)
 */
export function GuardianAvatarInline({
  element,
  className,
}: {
  element: ElementType;
  className?: string;
}) {
  const guardian = getGuardian(element);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-full overflow-hidden',
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${guardian.gradientFrom}, ${guardian.gradientTo})`,
      }}
      role="img"
      aria-label={guardian.name.ko}
    >
      <Image
        src={guardian.imagePath}
        alt={guardian.name.ko}
        width={20}
        height={20}
        className="w-[70%] h-[70%] object-contain"
      />
    </span>
  );
}

/**
 * 수호신 아이콘 뱃지 (텍스트 옆에 작게 표시)
 */
export function GuardianBadge({
  element,
  showElement = false,
  className,
}: {
  element: ElementType;
  showElement?: boolean;
  className?: string;
}) {
  const guardian = getGuardian(element);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-sm font-medium',
        className
      )}
      style={{
        backgroundColor: guardian.color,
      }}
    >
      <Image
        src={guardian.imagePath}
        alt={guardian.name.ko}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
      {showElement && <span>{guardian.element.ko}</span>}
    </span>
  );
}
