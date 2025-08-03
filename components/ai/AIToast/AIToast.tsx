import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useAIProcessing } from '@/hooks/use-ai-processing';

export interface AIToastProps {
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

// AI 처리 결과를 사용자에게 알리는 토스트 컴포넌트
export const AIToast: React.FC<AIToastProps> = ({
  autoHide = true,
  autoHideDelay = 5000,
  className,
}) => {
  const { lastError, successMessage, clearError, clearSuccess } =
    useAIProcessing();

  // 자동 숨김 처리
  useEffect(() => {
    if (!autoHide) return;

    let timeoutId: NodeJS.Timeout;

    if (lastError) {
      timeoutId = setTimeout(() => {
        clearError();
      }, autoHideDelay);
    }

    if (successMessage) {
      timeoutId = setTimeout(() => {
        clearSuccess();
      }, autoHideDelay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    lastError,
    successMessage,
    autoHide,
    autoHideDelay,
    clearError,
    clearSuccess,
  ]);

  // 에러나 성공 메시지가 없으면 렌더링하지 않음
  if (!lastError && !successMessage) {
    return null;
  }

  const isError = !!lastError;
  const message = lastError || successMessage;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border',
        'transform transition-all duration-300 ease-in-out',
        {
          'bg-red-50 border-red-200 text-red-800': isError,
          'bg-green-50 border-green-200 text-green-800': !isError,
        },
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0">
          {isError ? (
            <svg
              className="w-5 h-5 text-red-400"
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
          ) : (
            <svg
              className="w-5 h-5 text-green-400"
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
        </div>

        {/* 메시지 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {isError ? 'AI 처리 오류' : 'AI 처리 완료'}
          </p>
          <p className="mt-1 text-sm">{message}</p>
        </div>

        {/* 닫기 버튼 */}
        <button
          type="button"
          className={cn('flex-shrink-0 p-1 rounded-md transition-colors', {
            'text-red-400 hover:text-red-600 focus:ring-red-500': isError,
            'text-green-400 hover:text-green-600 focus:ring-green-500':
              !isError,
          })}
          onClick={isError ? clearError : clearSuccess}
          aria-label="알림 닫기"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

AIToast.displayName = 'AIToast';
