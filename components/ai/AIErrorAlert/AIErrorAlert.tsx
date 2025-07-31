import React from 'react';
import { cn } from '@/utils/cn';
import { ErrorHandler, type AIError, ErrorType } from '@/utils/error-handling';

export interface AIErrorAlertProps {
  error: AIError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

// Context7 UX 패턴: AI 에러를 위한 전용 알림 컴포넌트
export const AIErrorAlert: React.FC<AIErrorAlertProps> = ({
  error,
  onRetry,
  onDismiss,
  className,
  compact = false,
}) => {
  if (!error) return null;

  const isRetryable = ErrorHandler.isRetryable(error);
  const recoveryAction = ErrorHandler.getRecoveryAction(error);

  // 에러 타입별 아이콘 결정
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v2m0 16v2m10-10h-2M4 12H2"
            />
          </svg>
        );
      case ErrorType.TIMEOUT:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case ErrorType.AUTH:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        );
      case ErrorType.VALIDATION:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        compact && 'p-3',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        {/* 에러 아이콘 */}
        <div className="flex-shrink-0">
          <div className="text-red-400">{getErrorIcon()}</div>
        </div>

        {/* 에러 내용 */}
        <div className="ml-3 flex-1">
          <h3
            className={cn(
              'text-sm font-medium text-red-800',
              compact && 'text-xs'
            )}
          >
            AI 처리 중 오류가 발생했습니다
          </h3>

          <div
            className={cn(
              'mt-2 text-sm text-red-700',
              compact && 'mt-1 text-xs'
            )}
          >
            <p>{error.message}</p>

            {/* 복구 제안 */}
            {recoveryAction && !compact && (
              <p className="mt-2 text-red-600 bg-red-100 p-2 rounded text-xs">
                💡 {recoveryAction}
              </p>
            )}

            {/* 요청 ID (개발 환경) */}
            {process.env.NODE_ENV === 'development' &&
              error.requestId &&
              !compact && (
                <p className="mt-2 text-xs text-red-500 font-mono">
                  Request ID: {error.requestId}
                </p>
              )}
          </div>

          {/* 액션 버튼들 */}
          <div className={cn('mt-4 flex gap-2', compact && 'mt-2')}>
            {isRetryable && onRetry && (
              <button
                type="button"
                className={cn(
                  'inline-flex items-center rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
                  compact && 'px-2 py-1 text-xs'
                )}
                onClick={onRetry}
              >
                다시 시도
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                className={cn(
                  'inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50',
                  compact && 'px-2 py-1 text-xs'
                )}
                onClick={onDismiss}
              >
                닫기
              </button>
            )}
          </div>
        </div>

        {/* 닫기 버튼 (우상단) */}
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                onClick={onDismiss}
                aria-label="에러 알림 닫기"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AIErrorAlert.displayName = 'AIErrorAlert';
