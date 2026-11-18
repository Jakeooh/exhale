import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-teal-50 dark:bg-teal-950/40 text-primary-text border border-teal-200 dark:border-teal-800/60',
    secondary: 'bg-indigo-50 dark:bg-indigo-950/40 text-secondary border border-indigo-200 dark:border-indigo-800/60',
    neutral: 'bg-gray-100 dark:bg-gray-800 text-muted border border-gray-200 dark:border-gray-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60',
  };

  const sizes = {
    sm: 'text-[11px] font-semibold px-2 py-0.5 rounded-full',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 uppercase tracking-wide ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
