'use client';

import React from 'react';
import { cn } from '@/utils/cn';

// Button 컴포넌트 타입 정의
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  children: React.ReactNode;
}

// 버튼 스타일 variants (현재 미사용, 향후 확장용)
// const buttonVariants = {
//   variant: {
//     default:
//       'bg-primary text-primary-foreground hover:bg-primary/90',
//     destructive:
//       'bg-destructive text-destructive-foreground hover:bg-destructive/90',
//     outline:
//       'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
//     secondary:
//       'bg-secondary text-secondary-foreground hover:bg-secondary/80',
//     ghost: 'hover:bg-accent hover:text-accent-foreground',
//     link: 'text-primary underline-offset-4 hover:underline',
//   },
//   size: {
//     default: 'h-10 px-4 py-2',
//     sm: 'h-9 rounded-md px-3',
//     lg: 'h-11 rounded-md px-8',
//     icon: 'h-10 w-10',
//   },
// };

// 실제 스타일 클래스 매핑 (TailwindCSS)
const getVariantClasses = (variant: ButtonProps['variant'] = 'default') => {
  switch (variant) {
    case 'destructive':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
    case 'outline':
      return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500';
    case 'secondary':
      return 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500';
    case 'ghost':
      return 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
    case 'link':
      return 'bg-transparent text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  }
};

const getSizeClasses = (size: ButtonProps['size'] = 'default') => {
  switch (size) {
    case 'sm':
      return 'h-9 px-3 py-2 text-sm';
    case 'lg':
      return 'h-11 px-8 py-3 text-lg';
    case 'icon':
      return 'h-10 w-10 p-0';
    default:
      return 'h-10 px-4 py-2';
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          // 기본 스타일
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          // 동적 스타일
          getVariantClasses(variant),
          getSizeClasses(size),
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
