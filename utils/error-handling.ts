// Context7 에러 핸들링 유틸리티

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  TIMEOUT = 'TIMEOUT',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN',
}

export interface AIError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  operation?: string;
}

// Context7 패턴: 에러 분류 및 사용자 친화적 메시지 변환
export class ErrorHandler {
  private static errorMessages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: '네트워크 연결을 확인해주세요.',
    [ErrorType.API]:
      'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    [ErrorType.TIMEOUT]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    [ErrorType.VALIDATION]: '입력 정보를 확인해주세요.',
    [ErrorType.AUTH]: '인증이 만료되었습니다. 다시 로그인해주세요.',
    [ErrorType.UNKNOWN]:
      '예상치 못한 오류가 발생했습니다. 계속 문제가 발생하면 고객지원에 문의해주세요.',
  };

  static classifyError(error: any, operation?: string): AIError {
    const timestamp = new Date().toISOString();
    const requestId = this.generateRequestId();

    // 네트워크 에러
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: this.errorMessages[ErrorType.NETWORK],
        details: { originalError: error.message },
        timestamp,
        requestId,
        operation,
      };
    }

    // HTTP 상태 에러
    if (error.status) {
      if (error.status === 401 || error.status === 403) {
        return {
          type: ErrorType.AUTH,
          message: this.errorMessages[ErrorType.AUTH],
          code: error.status.toString(),
          details: { status: error.status },
          timestamp,
          requestId,
          operation,
        };
      }

      if (error.status === 400) {
        return {
          type: ErrorType.VALIDATION,
          message: error.message || this.errorMessages[ErrorType.VALIDATION],
          code: error.status.toString(),
          details: { status: error.status },
          timestamp,
          requestId,
          operation,
        };
      }

      if (error.status >= 500) {
        return {
          type: ErrorType.API,
          message: this.errorMessages[ErrorType.API],
          code: error.status.toString(),
          details: { status: error.status },
          timestamp,
          requestId,
          operation,
        };
      }
    }

    // 타임아웃 에러
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: this.errorMessages[ErrorType.TIMEOUT],
        details: { originalError: error.message },
        timestamp,
        requestId,
        operation,
      };
    }

    // API 키 관련 에러
    if (
      error.message?.includes('API key') ||
      error.message?.includes('authentication')
    ) {
      return {
        type: ErrorType.AUTH,
        message: 'AI 서비스 인증에 문제가 있습니다. 관리자에게 문의해주세요.',
        details: { originalError: error.message },
        timestamp,
        requestId,
        operation,
      };
    }

    // 콘텐츠 길이 관련 에러
    if (
      error.message?.includes('too long') ||
      error.message?.includes('token')
    ) {
      return {
        type: ErrorType.VALIDATION,
        message: '입력 내용이 너무 깁니다. 더 짧게 작성해주세요.',
        details: { originalError: error.message },
        timestamp,
        requestId,
        operation,
      };
    }

    // 기본 케이스
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || this.errorMessages[ErrorType.UNKNOWN],
      details: { originalError: error.message || error.toString() },
      timestamp,
      requestId,
      operation,
    };
  }

  static logError(error: AIError): void {
    // 개발 환경에서는 콘솔에 상세 로그
    if (process.env.NODE_ENV === 'development') {
      console.group(
        `🚨 AI Error [${error.type}] - ${error.operation || 'Unknown Operation'}`
      );
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Request ID:', error.requestId);
      console.error('Timestamp:', error.timestamp);
      console.error('Details:', error.details);
      console.groupEnd();
    }

    // 프로덕션 환경에서는 모니터링 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, DataDog, 또는 다른 모니터링 서비스로 전송
      // 개인정보 제거 후 전송
      const sanitizedError = {
        ...error,
        details: error.details
          ? this.sanitizeDetails(error.details)
          : undefined,
      };

      // 예시: window.gtag?('event', 'exception', { description: error.message })
      console.error('[Error Logged]', sanitizedError);
    }
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static sanitizeDetails(
    details: Record<string, any>
  ): Record<string, any> {
    const sanitized = { ...details };

    // 민감한 정보 제거
    const sensitiveKeys = ['apiKey', 'token', 'password', 'email', 'content'];
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // Context7 패턴: 재시도 가능 여부 판단
  static isRetryable(error: AIError): boolean {
    return [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.API].includes(
      error.type
    );
  }

  // Context7 패턴: 에러 복구 제안
  static getRecoveryAction(error: AIError): string | null {
    switch (error.type) {
      case ErrorType.NETWORK:
        return '네트워크 연결을 확인하고 다시 시도해보세요.';
      case ErrorType.TIMEOUT:
        return '잠시 후 다시 시도해보세요.';
      case ErrorType.API:
        return '문제가 지속되면 새로고침하거나 잠시 후 다시 시도해보세요.';
      case ErrorType.VALIDATION:
        return '입력 내용을 확인하고 수정해보세요.';
      case ErrorType.AUTH:
        return '새로고침하거나 다시 로그인해보세요.';
      default:
        return null;
    }
  }
}

// Context7 패턴: 에러 바운더리를 위한 헬퍼
export const createErrorInfo = (error: Error, errorInfo: any) => {
  return {
    error: ErrorHandler.classifyError(error, 'react-boundary'),
    errorInfo,
    userAgent:
      typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  };
};
