import React from 'react';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAIProcessing } from '@/hooks/use-ai-processing';
import type { AIProcessingState } from '@/stores/ai-processing-store';

export interface AIStatusIndicatorProps {
  operationId?: string;
  type?: 'summarization' | 'classification' | 'general';
  showText?: boolean;
  className?: string;
}

// AI 처리 상태 표시 컴포넌트
export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  operationId,
  type,
  showText = true,
  className,
}) => {
  const {
    isGlobalLoading,
    getOperationStatus,
    isTypeLoading,
    lastError,
    successMessage,
  } = useAIProcessing();

  // 상태 결정 로직
  let status: AIProcessingState = 'idle';
  let isLoading = false;

  if (operationId) {
    status = getOperationStatus(operationId);
    isLoading = status === 'loading';
  } else if (type) {
    isLoading = isTypeLoading(type);
    status = isLoading ? 'loading' : 'idle';
  } else {
    isLoading = isGlobalLoading;
    status = isLoading ? 'loading' : 'idle';
  }

  // 상태별 메시지 (UX 권장사항)
  const getStatusMessage = () => {
    if (isLoading) {
      if (type === 'summarization') return '요약 생성 중...';
      if (type === 'classification') return '카테고리 분류 중...';
      if (type === 'general') return 'AI 처리 중...';
      return '처리 중...';
    }

    if (status === 'error' && lastError) {
      return lastError;
    }

    if (status === 'success' && successMessage) {
      return successMessage;
    }

    return null;
  };

  const message = getStatusMessage();

  // 로딩 중이거나 메시지가 있을 때만 표시
  if (!isLoading && !message) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-sm',
        {
          'text-blue-600': isLoading,
          'text-red-600': status === 'error',
          'text-green-600': status === 'success',
        },
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {isLoading && (
        <LoadingSpinner
          size="sm"
          aria-label="AI 처리 중"
          className="text-blue-600"
        />
      )}

      {/* 성공/에러 아이콘 */}
      {status === 'success' && (
        <svg
          className="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}

      {status === 'error' && (
        <svg
          className="w-4 h-4 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}

      {/* 텍스트 메시지 */}
      {showText && message && <span className="font-medium">{message}</span>}
    </div>
  );
};

AIStatusIndicator.displayName = 'AIStatusIndicator';
