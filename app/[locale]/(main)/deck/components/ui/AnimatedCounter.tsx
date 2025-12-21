'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(easeOut * value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, isInView]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
}

export function AnimatedPercentage({
  value,
  duration = 2,
  className = '',
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      suffix="%"
      decimals={1}
      className={className}
    />
  );
}

export function AnimatedCurrency({
  value,
  duration = 2,
  currency = '$',
  unit = '',
  decimals = 0,
  className = '',
}: {
  value: number;
  duration?: number;
  currency?: string;
  unit?: string;
  decimals?: number;
  className?: string;
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      prefix={currency}
      suffix={unit}
      decimals={decimals}
      className={className}
    />
  );
}
