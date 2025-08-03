import { useCallback } from 'react';
import { useAIProcessingStore } from '@/stores/ai-processing-store';
import { ErrorHandler, type AIError } from '@/utils/error-handling';

// AI 작업을 위한 유틸리티 함수들
export const generateOperationId = (type: string, memoId?: string) => {
  const timestamp = Date.now();
  return memoId ? `${type}-${memoId}-${timestamp}` : `${type}-${timestamp}`;
};

// AI 처리를 위한 커스텀 훅
export const useAIProcessing = () => {
  const {
    operations,
    isGlobalLoading,
    lastError,
    successMessage,
    startOperation,
    completeOperation,
    failOperation,
    getOperationStatus,
    isOperationLoading,
    isTypeLoading,
    clearError,
    clearSuccess,
    cleanupCompletedOperations,
    reset,
  } = useAIProcessingStore();

  // 메모 요약 처리
  const processSummarization = useCallback(
    async (memoId: string, content: string): Promise<string | null> => {
      const operationId = generateOperationId('summarize', memoId);

      try {
        // 작업 시작
        startOperation({
          id: operationId,
          type: 'summarization',
        });

        // API 호출
        const response = await fetch(`/api/memos/${memoId}/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        // 작업 완료
        completeOperation(operationId, '메모 요약이 완료되었습니다.');

        return data.summary || null;
      } catch (error) {
        // 구조화된 에러 처리
        const aiError = ErrorHandler.classifyError(error, 'summarization');

        // 작업 실패
        failOperation(operationId, aiError.message);

        // 에러 로깅
        ErrorHandler.logError({
          ...aiError,
          details: {
            ...aiError.details,
            operationId,
            memoId,
            contentLength: content.length,
          },
        });

        return null;
      }
    },
    [startOperation, completeOperation, failOperation]
  );

  // 메모 분류 처리
  const processClassification = useCallback(
    async (memoId: string, content: string) => {
      const operationId = generateOperationId('classify', memoId);

      try {
        // 작업 시작
        startOperation({
          id: operationId,
          type: 'classification',
        });

        // API 호출
        const response = await fetch(`/api/memos/${memoId}/classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        // 작업 완료
        completeOperation(operationId, '메모 분류가 완료되었습니다.');

        return data.classification || null;
      } catch (error) {
        // 구조화된 에러 처리
        const aiError = ErrorHandler.classifyError(error, 'classification');

        // 작업 실패
        failOperation(operationId, aiError.message);

        // 에러 로깅
        ErrorHandler.logError({
          ...aiError,
          details: {
            ...aiError.details,
            operationId,
            memoId,
            contentLength: content.length,
          },
        });

        return null;
      }
    },
    [startOperation, completeOperation, failOperation]
  );

  // 일반 Claude API 메시지 처리
  const processGeneralMessage = useCallback(
    async (prompt: string, maxTokens?: number) => {
      const operationId = generateOperationId('general');

      try {
        // 작업 시작
        startOperation({
          id: operationId,
          type: 'general',
        });

        // API 호출
        const response = await fetch('/api/claude/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            maxTokens: maxTokens || 1000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        // 작업 완료
        completeOperation(operationId, 'AI 처리가 완료되었습니다.');

        return data.response || null;
      } catch (error) {
        // 구조화된 에러 처리
        const aiError = ErrorHandler.classifyError(error, 'general-message');

        // 작업 실패
        failOperation(operationId, aiError.message);

        // 에러 로깅
        ErrorHandler.logError({
          ...aiError,
          details: {
            ...aiError.details,
            operationId,
            promptLength: prompt.length,
            maxTokens: maxTokens || 1000,
          },
        });

        return null;
      }
    },
    [startOperation, completeOperation, failOperation]
  );

  // 재시도 함수
  const retryOperation = useCallback(
    async (operationId: string) => {
      const operation = operations[operationId];
      if (!operation) return false;

      try {
        switch (operation.type) {
          case 'summarization':
            // 재시도를 위해 기본 정보가 필요하므로 제한적 지원
            return false;
          case 'classification':
            // 재시도를 위해 기본 정보가 필요하므로 제한적 지원
            return false;
          case 'general':
            // 재시도를 위해 기본 정보가 필요하므로 제한적 지원
            return false;
          default:
            return false;
        }
      } catch (error) {
        console.error('Retry failed:', error);
        return false;
      }
    },
    [operations]
  );

  // 메모리 관리를 위한 정리 함수
  const cleanup = useCallback(() => {
    cleanupCompletedOperations();
  }, [cleanupCompletedOperations]);

  return {
    // 상태
    operations,
    isGlobalLoading,
    lastError,
    successMessage,

    // 작업별 상태 확인
    getOperationStatus,
    isOperationLoading,
    isTypeLoading,

    // 메시지 관리
    clearError,
    clearSuccess,

    // AI 처리 함수들
    processSummarization,
    processClassification,
    processGeneralMessage,

    // 유틸리티
    cleanup,
    reset,
    retryOperation,

    // 편의 함수들
    isSummarizationLoading: isTypeLoading('summarization'),
    isClassificationLoading: isTypeLoading('classification'),
    isGeneralMessageLoading: isTypeLoading('general'),
  };
};

// 특정 메모를 위한 AI 처리 훅
export const useMemoAIProcessing = (memoId: string) => {
  const aiProcessing = useAIProcessing();

  // 해당 메모와 관련된 작업들만 필터링
  const memoOperations = Object.entries(aiProcessing.operations)
    .filter(([id]) => id.includes(`-${memoId}-`))
    .reduce(
      (acc, [id, operation]) => {
        acc[id] = operation;
        return acc;
      },
      {} as Record<string, any>
    );

  const isMemoSummarizing = aiProcessing.isOperationLoading(
    generateOperationId('summarize', memoId).split('-').slice(0, -1).join('-') +
      '-' +
      memoId
  );

  const isMemoClassifying = aiProcessing.isOperationLoading(
    generateOperationId('classify', memoId).split('-').slice(0, -1).join('-') +
      '-' +
      memoId
  );

  return {
    ...aiProcessing,
    memoOperations,
    isMemoSummarizing,
    isMemoClassifying,

    // 편의 함수들
    summarizeMemo: (content: string) =>
      aiProcessing.processSummarization(memoId, content),
    classifyMemo: (content: string) =>
      aiProcessing.processClassification(memoId, content),
  };
};
