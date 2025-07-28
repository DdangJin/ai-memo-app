import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}
    >
      {children}
    </div>
  );
}
