import React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressBarProps {
  value?: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  indeterminate?: boolean;
  className?: string;
}

// Context7 UX 패턴: 작업 진행률을 표시하는 프로그레스 바
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  indeterminate = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* 라벨 */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || '진행률'}
          </span>
          {!indeterminate && (
            <span className="text-sm text-gray-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* 프로그레스 바 */}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || '작업 진행률'}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant],
            indeterminate && 'animate-pulse'
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            animation: indeterminate
              ? 'progress-indeterminate 2s ease-in-out infinite'
              : undefined,
          }}
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
