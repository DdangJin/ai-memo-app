import React from 'react';
import { cn } from '@/utils/cn';
import { useMemoAIProcessing } from '@/hooks/use-ai-processing';
import { AIActionButton, AIStatusIndicator } from '@/components/ai';
import { SkeletonLoader } from '@/components/ui';

export interface MemoCardProps {
  memo: {
    id: string;
    title: string;
    content: string;
    category?: string;
    aiSummary?: string | null;
    hasSummary?: boolean;
    canSummarize?: boolean;
    hasClassification?: boolean;
    canClassify?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// AI 처리 상태가 통합된 메모 카드 컴포넌트
export const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  showActions = true,
  onEdit,
  onDelete,
  className,
}) => {
  const {
    summarizeMemo,
    classifyMemo,
    isMemoSummarizing,
    isMemoClassifying,
    getOperationStatus,
  } = useMemoAIProcessing(memo.id);

  const handleSummarize = async () => {
    if (!memo.content || memo.content.trim().length === 0) return;
    await summarizeMemo(memo.content);
  };

  const handleClassify = async () => {
    if (!memo.content || memo.content.trim().length === 0) return;
    await classifyMemo(memo.content);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {memo.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">
              {formatDate(memo.createdAt)}
            </span>
            {memo.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {memo.category}
              </span>
            )}
            {/* AI 작업 상태 표시 */}
            {(() => {
              const status = getOperationStatus(memo.id);
              if (status === 'loading') {
                return (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <svg
                      className="w-3 h-3 mr-1 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isMemoSummarizing
                      ? '요약 중'
                      : isMemoClassifying
                        ? '분류 중'
                        : 'AI 처리 중'}
                  </span>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* 기본 액션 버튼들 */}
        {showActions && (
          <div className="flex items-center gap-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(memo.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="메모 수정"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(memo.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                aria-label="메모 삭제"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm line-clamp-3">{memo.content}</p>
      </div>

      {/* AI 요약 */}
      {(memo.aiSummary || isMemoSummarizing) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">AI 요약</h4>
            <AIStatusIndicator type="summarization" className="text-xs" />
          </div>
          {isMemoSummarizing ? (
            <SkeletonLoader lines={2} height="sm" className="text-blue-800" />
          ) : (
            <p className="text-sm text-blue-800">{memo.aiSummary}</p>
          )}
        </div>
      )}

      {/* AI 액션 버튼들 */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {/* 요약 버튼 */}
        {memo.canSummarize && (
          <AIActionButton
            aiType="summarization"
            size="sm"
            variant="outline"
            loadingText="요약 중..."
            onClick={handleSummarize}
            disabled={!memo.content?.trim()}
          >
            {memo.hasSummary ? '재요약' : '요약'}
          </AIActionButton>
        )}

        {/* 분류 버튼 */}
        {memo.canClassify && (
          <AIActionButton
            aiType="classification"
            size="sm"
            variant="outline"
            loadingText="분류 중..."
            onClick={handleClassify}
            disabled={!memo.content?.trim()}
          >
            {memo.hasClassification ? '재분류' : '분류'}
          </AIActionButton>
        )}

        {/* AI 처리 상태 */}
        <div className="flex-1 flex justify-end">
          {(isMemoSummarizing || isMemoClassifying) && (
            <AIStatusIndicator className="text-xs" showText={false} />
          )}
        </div>
      </div>
    </div>
  );
};

MemoCard.displayName = 'MemoCard';
