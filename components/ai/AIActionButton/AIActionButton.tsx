import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAIProcessing } from '@/hooks/use-ai-processing';

export interface AIActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // AI 작업 타입
  aiType?: 'summarization' | 'classification' | 'general';
  // 특정 작업 ID (제공되면 해당 작업의 상태를 추적)
  operationId?: string;
  // 로딩 중일 때 표시할 텍스트
  loadingText?: string;
  // 버튼 변형
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  // 크기
  size?: 'sm' | 'md' | 'lg';
  // 전체 폭 사용
  fullWidth?: boolean;
}

// Context7 UX 패턴: AI 작업 상태를 반영하는 버튼 컴포넌트
export const AIActionButton = forwardRef<
  HTMLButtonElement,
  AIActionButtonProps
>(
  (
    {
      children,
      aiType,
      operationId,
      loadingText,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const { isGlobalLoading, getOperationStatus, isTypeLoading } =
      useAIProcessing();

    // 로딩 상태 결정
    let isLoading = false;
    if (operationId) {
      isLoading = getOperationStatus(operationId) === 'loading';
    } else if (aiType) {
      isLoading = isTypeLoading(aiType);
    } else {
      isLoading = isGlobalLoading;
    }

    // Context7 UX: 로딩 중이거나 disabled일 때 버튼 비활성화
    const isDisabled = disabled || isLoading;

    // 버튼 스타일 정의 (Context7 디자인 시스템)
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantClasses = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
      outline:
        'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    };

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 py-2 rounded-md',
      lg: 'h-12 px-6 text-lg rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* 로딩 상태일 때 스피너 표시 */}
        {isLoading && (
          <LoadingSpinner size="sm" className="mr-2" aria-label="처리 중" />
        )}

        {/* 버튼 텍스트 */}
        <span>{isLoading && loadingText ? loadingText : children}</span>
      </button>
    );
  }
);

AIActionButton.displayName = 'AIActionButton';
