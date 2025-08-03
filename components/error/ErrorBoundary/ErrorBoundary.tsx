import React, { Component, ReactNode } from 'react';
import {
  ErrorHandler,
  createErrorInfo,
  type AIError,
} from '@/utils/error-handling';

interface ErrorBoundaryState {
  hasError: boolean;
  error: AIError | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: AIError; retry: () => void }>;
  onError?: (error: AIError, errorInfo: React.ErrorInfo) => void;
}

// AI 애플리케이션을 위한 에러 바운더리
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const aiError = ErrorHandler.classifyError(error, 'react-error-boundary');
    return {
      hasError: true,
      error: aiError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const aiError = ErrorHandler.classifyError(error, 'react-error-boundary');
    const fullErrorInfo = createErrorInfo(error, errorInfo);

    // 에러 로깅
    ErrorHandler.logError(aiError);

    // 부모 컴포넌트에 에러 알림
    this.props.onError?.(aiError, fullErrorInfo);

    this.setState({
      errorInfo: fullErrorInfo,
    });
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback 컴포넌트가 있으면 사용
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent error={this.state.error} retry={this.retry} />
        );
      }

      // 기본 에러 UI
      return (
        <DefaultErrorFallback error={this.state.error} retry={this.retry} />
      );
    }

    return this.props.children;
  }
}

// 기본 에러 폴백 컴포넌트
interface DefaultErrorFallbackProps {
  error: AIError;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  retry,
}) => {
  const recoveryAction = ErrorHandler.getRecoveryAction(error);
  const isRetryable = ErrorHandler.isRetryable(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* 에러 아이콘 */}
          <div className="mx-auto h-12 w-12 text-red-600 mb-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* 에러 제목 */}
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            문제가 발생했습니다
          </h2>

          {/* 에러 메시지 */}
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>

          {/* 복구 제안 */}
          {recoveryAction && (
            <p className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
              💡 {recoveryAction}
            </p>
          )}

          {/* 요청 ID (개발 환경에서만) */}
          {process.env.NODE_ENV === 'development' && error.requestId && (
            <p className="mt-2 text-xs text-gray-400">
              Request ID: {error.requestId}
            </p>
          )}

          {/* 액션 버튼들 */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {isRetryable && (
              <button
                onClick={retry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                다시 시도
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              새로고침
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 특정 영역을 위한 미니 에러 바운더리
export const MinimalErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: (error: AIError, retry: () => void) => ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ErrorBoundary
      fallback={
        fallback
          ? ({ error, retry }) => <>{fallback(error, retry)}</>
          : undefined
      }
    >
      {children}
    </ErrorBoundary>
  );
};

// Class 컴포넌트는 displayName을 직접 설정할 수 없으므로 제거
MinimalErrorBoundary.displayName = 'MinimalErrorBoundary';
