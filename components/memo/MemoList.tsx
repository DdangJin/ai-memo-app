'use client';

import { useState, useEffect } from 'react';
import { Memo } from '@/lib/db/schema';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MemoListProps {
  onEditMemo: (memo: Memo) => void;
  onDeleteMemo: (id: string) => void;
  onViewMemo: (memo: Memo) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  sortBy?: 'createdAt' | 'title' | 'updatedAt';
  onSortChange?: (sortBy: 'createdAt' | 'title' | 'updatedAt') => void;
}

export function MemoList({
  onEditMemo,
  onDeleteMemo,
  onViewMemo,
  currentPage = 1,
  onPageChange,
  sortBy = 'createdAt',
  onSortChange,
}: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMemos();
  }, [currentPage, sortBy]);

  const fetchMemos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        sortBy: sortBy,
        limit: '10',
      });

      const response = await fetch(`/api/memos?${params}`);
      const data = await response.json();

      if (data.success) {
        setMemos(data.data);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.error || '메모를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('메모를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMemos(memos.filter((memo) => memo.id !== id));
        // 페이지 새로고침
        fetchMemos();
      } else {
        alert('메모 삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('메모 삭제에 실패했습니다.');
    }
  };

  const handleSortChange = (newSortBy: 'createdAt' | 'title' | 'updatedAt') => {
    if (onSortChange) {
      onSortChange(newSortBy);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <Button onClick={fetchMemos} className="mt-2">
          다시 시도
        </Button>
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        <p>메모가 없습니다.</p>
        <p className="text-sm mt-2">새로운 메모를 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 정렬 컨트롤 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) =>
              handleSortChange(
                e.target.value as 'createdAt' | 'title' | 'updatedAt'
              )
            }
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">생성일</option>
            <option value="updatedAt">수정일</option>
            <option value="title">제목</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">총 {memos.length}개의 메모</div>
      </div>

      {/* 메모 목록 */}
      <div className="space-y-4">
        {memos.map((memo) => (
          <Card key={memo.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onViewMemo(memo)}
              >
                <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">
                  {memo.title}
                </h3>
                <p className="text-gray-600 mb-2 line-clamp-3">
                  {memo.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {memo.category && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {memo.category}
                    </span>
                  )}
                  <span>
                    {new Date(memo.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  {memo.updatedAt !== memo.createdAt && (
                    <span className="text-xs text-gray-400">(수정됨)</span>
                  )}
                </div>
                {memo.tags && memo.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {memo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => onViewMemo(memo)}
                  variant="outline"
                  size="sm"
                >
                  보기
                </Button>
                <Button
                  onClick={() => onEditMemo(memo)}
                  variant="outline"
                  size="sm"
                >
                  수정
                </Button>
                <Button
                  onClick={() => handleDelete(memo.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
          >
            이전
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={page === currentPage ? 'primary' : 'outline'}
                size="sm"
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            variant="outline"
            size="sm"
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
