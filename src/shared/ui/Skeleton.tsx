import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-lg',
  className = '',
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 ${width} ${height} ${rounded} ${className}`}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
