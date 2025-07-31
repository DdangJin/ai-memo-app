import React from 'react';
import { SkeletonLoader } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface MemoListSkeletonProps {
  count?: number;
  className?: string;
}

// Context7 UX 패턴: 메모 리스트 로딩을 위한 스켈레톤 컴포넌트
export const MemoListSkeleton: React.FC<MemoListSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4"
          role="status"
          aria-label={`메모 ${index + 1} 로딩 중`}
        >
          {/* 헤더 스켈레톤 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <SkeletonLoader height="lg" width="half" className="mb-2" />
              <div className="flex items-center gap-2">
                <SkeletonLoader height="sm" width="quarter" />
                <SkeletonLoader
                  height="sm"
                  width="quarter"
                  className="rounded-full"
                />
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <SkeletonLoader height="sm" width="auto" className="w-4" />
              <SkeletonLoader height="sm" width="auto" className="w-4" />
            </div>
          </div>

          {/* 콘텐츠 스켈레톤 */}
          <div className="mb-4">
            <SkeletonLoader lines={3} height="sm" />
          </div>

          {/* AI 요약 스켈레톤 (랜덤하게 표시) */}
          {Math.random() > 0.5 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <SkeletonLoader height="sm" width="quarter" />
                <SkeletonLoader height="sm" width="auto" className="w-16" />
              </div>
              <SkeletonLoader lines={2} height="sm" />
            </div>
          )}

          {/* 액션 버튼 스켈레톤 */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <SkeletonLoader
              height="md"
              width="auto"
              className="w-16 rounded-md"
            />
            <SkeletonLoader
              height="md"
              width="auto"
              className="w-16 rounded-md"
            />
            <div className="flex-1 flex justify-end">
              <SkeletonLoader height="sm" width="auto" className="w-4" />
            </div>
          </div>
        </div>
      ))}

      <span className="sr-only">메모 목록 로딩 중...</span>
    </div>
  );
};

MemoListSkeleton.displayName = 'MemoListSkeleton';
