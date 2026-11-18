import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] min-h-[44px] min-w-[44px]';

    const variants = {
      primary:
        'bg-primary text-white hover:bg-[#0ea5e9] shadow-sm hover:shadow hover:brightness-105 active:bg-[#0B7F73]',
      secondary:
        'bg-secondary text-white hover:brightness-105 shadow-sm active:opacity-90',
      outline:
        'border border-gray-200 dark:border-gray-700 bg-surface text-ink hover:bg-gray-50 dark:hover:bg-gray-800/60 shadow-sm',
      ghost:
        'text-muted hover:text-ink hover:bg-gray-100 dark:hover:bg-gray-800/50',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:bg-rose-800',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-9 rounded-lg',
      md: 'text-sm px-4 py-2.5 h-11',
      lg: 'text-base px-6 py-3.5 h-13 rounded-2xl font-semibold',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
