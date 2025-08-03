import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: 'sm' | 'md' | 'lg';
  width?: 'full' | 'half' | 'quarter' | 'auto';
  animated?: boolean;
}

// 콘텐츠 로딩을 위한 스켈레톤 로더
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  lines = 1,
  height = 'md',
  width = 'full',
  animated = true,
}) => {
  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5',
  };

  const widthClasses = {
    full: 'w-full',
    half: 'w-1/2',
    quarter: 'w-1/4',
    auto: 'w-auto',
  };

  const baseClasses = cn(
    'bg-gray-200 rounded',
    heightClasses[height],
    widthClasses[width],
    animated && 'animate-pulse',
    className
  );

  if (lines === 1) {
    return (
      <div className={baseClasses} role="status" aria-label="콘텐츠 로딩 중">
        <span className="sr-only">콘텐츠 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="status" aria-label="콘텐츠 로딩 중">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn(
            baseClasses,
            // 마지막 줄은 조금 더 짧게
            index === lines - 1 && width === 'full' && 'w-3/4'
          )}
        />
      ))}
      <span className="sr-only">콘텐츠 로딩 중...</span>
    </div>
  );
};

SkeletonLoader.displayName = 'SkeletonLoader';
