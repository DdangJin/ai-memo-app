'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Memo } from '@/lib/db/schema';
import { MemoList } from '@/components/memo/MemoList';
import { MemoForm } from '@/components/memo/MemoForm';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useAuth } from '@/lib/auth/use-auth';

export default function MemosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading, isAuthenticated } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  // 인증 상태 확인
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('인증되지 않은 사용자, 로그인 페이지로 리다이렉트');
      router.push('/auth?redirect=/memos');
    }
  }, [loading, isAuthenticated, router]);

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">로딩 중...</div>
          </div>
        </div>
      </Container>
    );
  }

  // 인증되지 않은 경우 빈 화면 (리다이렉트 중)
  if (!isAuthenticated) {
    return null;
  }

  // URL 파라미터에서 상태 가져오기
  const currentPage = parseInt(searchParams.get('page') || '1');
  const sortBy =
    (searchParams.get('sortBy') as 'createdAt' | 'title' | 'updatedAt') ||
    'createdAt';

  const updateURL = useCallback(
    (page: number, sort: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      params.set('sortBy', sort);
      router.push(`/memos?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateURL(page, sortBy);
    },
    [updateURL, sortBy]
  );

  const handleSortChange = useCallback(
    (newSortBy: 'createdAt' | 'title' | 'updatedAt') => {
      updateURL(1, newSortBy); // 정렬 변경 시 첫 페이지로 이동
    },
    [updateURL]
  );

  const handleCreateMemo = () => {
    setEditingMemo(null);
    setShowForm(true);
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setShowForm(true);
  };

  const handleViewMemo = (memo: Memo) => {
    router.push(`/memos/${memo.id}`);
  };

  const handleSaveMemo = async (memoData: Partial<Memo>) => {
    try {
      const url = editingMemo ? `/api/memos/${editingMemo.id}` : '/api/memos';

      const method = editingMemo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoData),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingMemo(null);
        // 페이지를 새로고침하여 목록을 업데이트
        window.location.reload();
      } else {
        alert(data.error || '메모 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('메모 저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMemo(null);
  };

  const handleDeleteMemo = async (id: string) => {
    try {
      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // 페이지를 새로고침하여 목록을 업데이트
        window.location.reload();
      } else {
        alert(data.error || '메모 삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('메모 삭제에 실패했습니다.');
    }
  };

  return (
    <Container>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">메모 관리</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              안녕하세요, {user?.email}님!
            </span>
            <Button onClick={handleCreateMemo}>새 메모 작성</Button>
          </div>
        </div>

        {showForm ? (
          <div className="mb-6">
            <MemoForm
              memo={editingMemo}
              onSave={handleSaveMemo}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <MemoList
            onEditMemo={handleEditMemo}
            onDeleteMemo={handleDeleteMemo}
            onViewMemo={handleViewMemo}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
        )}
      </div>
    </Container>
  );
}
