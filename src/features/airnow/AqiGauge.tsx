import React from 'react';
import {
  Smile,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Flame,
  Skull,
} from 'lucide-react';
import { AQICategory } from '@/types';
import { getAQIMeta } from '@/shared/lib/aqi';
import { NumberCounter } from '@/shared/ui/NumberCounter';

interface AqiGaugeProps {
  aqi: number;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ aqi }) => {
  const meta = getAQIMeta(aqi);

  // SVG semi-circle gauge math
  // Arc radius 80, stroke 14, center at (100, 100)
  const radius = 75;
  const circumference = Math.PI * radius; // half circle circumference ~235.6
  // Clamp AQI between 0 and 500 for the 180° sweep
  const clampedAqi = Math.max(0, Math.min(500, aqi));
  const strokeDashoffset = circumference - (clampedAqi / 500) * circumference;

  const getIcon = (cat: AQICategory) => {
    switch (cat) {
      case 'good':
        return <Smile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      case 'moderate':
        return <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
      case 'sensitive':
        return <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />;
      case 'unhealthy':
        return <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />;
      case 'very_unhealthy':
        return <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />;
      case 'hazardous':
        return <Skull className="w-5 h-5 text-red-700 dark:text-red-400" aria-hidden="true" />;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center text-center select-none"
      role="img"
      aria-label={`Air Quality Index is ${aqi}, categorized as ${meta.label}. ${meta.healthSummary}`}
    >
      <div className="relative w-52 h-28 sm:w-60 sm:h-32 flex items-end justify-center">
        <svg
          viewBox="0 0 200 115"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Background Track Arc */}
          <path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            className="text-gray-200 dark:text-gray-800"
          />

          {/* Active Colored Arc Sweep */}
          <path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke={meta.hex}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <div className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight text-ink">
            <NumberCounter value={aqi} durationMs={900} />
          </div>
          <span className="text-[11px] font-bold text-muted uppercase tracking-widest mt-0.5">
            US AQI
          </span>
        </div>
      </div>

      {/* Category Pill with Icon and Text (Never color alone) */}
      <div
        className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border transition-colors ${meta.badgeBg} ${meta.badgeText}`}
      >
        {getIcon(meta.category)}
        <span>{meta.label}</span>
      </div>
    </div>
  );
};
