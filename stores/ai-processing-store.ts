import { create } from 'zustand';
import { combine } from 'zustand/middleware';

// AI 처리 상태 타입 정의 (타입 안전성)
export type AIProcessingState = 'idle' | 'loading' | 'success' | 'error';

export interface AIOperation {
  id: string;
  type: 'summarization' | 'classification' | 'general';
  status: AIProcessingState;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface AIProcessingStoreState {
  // 개별 AI 작업들을 추적
  operations: Record<string, AIOperation>;
  // 전역 로딩 상태 (하나라도 로딩 중이면 true)
  isGlobalLoading: boolean;
  // 마지막 에러 메시지
  lastError: string | null;
  // 성공 메시지 (UX 최적화)
  successMessage: string | null;
}

export interface AIProcessingStoreActions {
  // 작업 시작
  startOperation: (
    operation: Omit<AIOperation, 'status' | 'startTime'>
  ) => void;
  // 작업 성공
  completeOperation: (id: string, successMessage?: string) => void;
  // 작업 실패
  failOperation: (id: string, error: string) => void;
  // 작업 상태 확인
  getOperationStatus: (id: string) => AIProcessingState;
  // 작업이 진행 중인지 확인
  isOperationLoading: (id: string) => boolean;
  // 특정 타입의 작업이 로딩 중인지 확인
  isTypeLoading: (type: AIOperation['type']) => boolean;
  // 에러 메시지 지우기
  clearError: () => void;
  // 성공 메시지 지우기
  clearSuccess: () => void;
  // 작업 정리 (완료된 작업 제거)
  cleanupCompletedOperations: () => void;
  // 전체 상태 리셋
  reset: () => void;
}

// combine 미들웨어를 사용한 깔끔한 상태 정의
export const useAIProcessingStore = create(
  combine(
    {
      operations: {} as Record<string, AIOperation>,
      isGlobalLoading: false,
      lastError: null as string | null,
      successMessage: null as string | null,
    } as AIProcessingStoreState,
    (set, get) => ({
      startOperation: (
        operation: Omit<AIOperation, 'status' | 'startTime'>
      ) => {
        const id = operation.id;
        const startTime = Date.now();

        set(state => {
          const newOperations = {
            ...state.operations,
            [id]: {
              ...operation,
              status: 'loading' as AIProcessingState,
              startTime,
            },
          };

          return {
            operations: newOperations,
            isGlobalLoading: true,
            lastError: null, // 새 작업 시작 시 이전 에러 클리어
            successMessage: null, // 새 작업 시작 시 이전 성공 메시지 클리어
          };
        });
      },

      completeOperation: (id: string, successMessage?: string) => {
        set(state => {
          const operation = state.operations[id];
          if (!operation) return state;

          const endTime = Date.now();
          const newOperations = {
            ...state.operations,
            [id]: {
              ...operation,
              status: 'success' as AIProcessingState,
              endTime,
              error: undefined,
            },
          };

          // 다른 로딩 중인 작업이 있는지 확인
          const hasLoadingOperations = Object.values(newOperations).some(
            op => op.status === 'loading'
          );

          return {
            operations: newOperations,
            isGlobalLoading: hasLoadingOperations,
            lastError: null,
            successMessage: successMessage || null,
          };
        });
      },

      failOperation: (id: string, error: string) => {
        set(state => {
          const operation = state.operations[id];
          if (!operation) return state;

          const endTime = Date.now();
          const newOperations = {
            ...state.operations,
            [id]: {
              ...operation,
              status: 'error' as AIProcessingState,
              endTime,
              error,
            },
          };

          // 다른 로딩 중인 작업이 있는지 확인
          const hasLoadingOperations = Object.values(newOperations).some(
            op => op.status === 'loading'
          );

          return {
            operations: newOperations,
            isGlobalLoading: hasLoadingOperations,
            lastError: error,
            successMessage: null,
          };
        });
      },

      getOperationStatus: (id: string): AIProcessingState => {
        const operation = get().operations[id];
        return operation?.status || 'idle';
      },

      isOperationLoading: (id: string): boolean => {
        return get().operations[id]?.status === 'loading';
      },

      isTypeLoading: (type: AIOperation['type']): boolean => {
        const operations = get().operations;
        return Object.values(operations).some(
          op => op.type === type && op.status === 'loading'
        );
      },

      clearError: () => {
        set(state => ({
          ...state,
          lastError: null,
        }));
      },

      clearSuccess: () => {
        set(state => ({
          ...state,
          successMessage: null,
        }));
      },

      cleanupCompletedOperations: () => {
        set(state => {
          const newOperations: Record<string, AIOperation> = {};

          // 로딩 중이거나 최근 완료된 작업만 유지 (5분 이내)
          const cutoffTime = Date.now() - 5 * 60 * 1000; // 5분

          Object.entries(state.operations).forEach(([id, operation]) => {
            const shouldKeep =
              operation.status === 'loading' ||
              (operation.endTime && operation.endTime > cutoffTime);

            if (shouldKeep) {
              newOperations[id] = operation;
            }
          });

          return {
            ...state,
            operations: newOperations,
          };
        });
      },

      reset: () => {
        set({
          operations: {},
          isGlobalLoading: false,
          lastError: null,
          successMessage: null,
        });
      },
    })
  )
);

// 타입 추출을 위한 유틸리티
export type AIProcessingStore = ReturnType<
  typeof useAIProcessingStore.getState
>;

// 개발자 도구 지원 (개발 환경에서만)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.aiProcessingStore = useAIProcessingStore;
}
