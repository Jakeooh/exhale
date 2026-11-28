import React, { useEffect, useRef, useState } from 'react';

export interface NumberCounterProps {
  value: number;
  decimals?: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  decimals = 0,
  durationMs = 800,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const startValue = prevValueRef.current;
    prevValueRef.current = value;
    const diff = value - startValue;

    if (diff === 0) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, durationMs]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderedNumber = prefersReduced ? value : displayValue;

  return (
    <span className={className}>
      {prefix}
      {renderedNumber.toFixed(decimals)}
      {suffix}
    </span>
  );
};
