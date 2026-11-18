import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'flat';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variants = {
    default:
      'bg-surface border border-gray-200/70 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none',
    elevated:
      'bg-surface border border-gray-200/80 dark:border-gray-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
    outline:
      'bg-transparent border border-gray-200 dark:border-gray-800',
    flat:
      'bg-gray-50/70 dark:bg-gray-900/40 border border-gray-200/50 dark:border-gray-800/60',
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-150 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
