import React from 'react';
import { AQICategory } from '@/types';

interface HazeHeroProps {
  category?: AQICategory;
  aqi?: number;
  children: React.ReactNode;
}

export const HazeHero: React.FC<HazeHeroProps> = ({
  category = 'moderate',
  children,
}) => {
  // Subtle atmospheric aura at the top of the page
  const auraGradients: Record<AQICategory, string> = {
    good: 'radial-gradient(50% 120px at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 100%)',
    moderate: 'radial-gradient(50% 120px at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 100%)',
    sensitive: 'radial-gradient(50% 120px at 50% 0%, rgba(249, 115, 22, 0.09) 0%, transparent 100%)',
    unhealthy: 'radial-gradient(50% 120px at 50% 0%, rgba(239, 68, 68, 0.10) 0%, transparent 100%)',
    very_unhealthy: 'radial-gradient(50% 120px at 50% 0%, rgba(139, 92, 246, 0.10) 0%, transparent 100%)',
    hazardous: 'radial-gradient(50% 140px at 50% 0%, rgba(153, 27, 27, 0.12) 0%, transparent 100%)',
  };

  const bg = auraGradients[category] ?? auraGradients.moderate;

  return (
    <div className="relative w-full transition-colors duration-500">
      {/* Subtle top atmospheric glow */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none transition-all duration-700"
        style={{ background: bg }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
