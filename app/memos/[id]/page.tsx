'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Memo } from '@/lib/db/schema';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';

interface MemoDetailPageProps {
  params: {
    id: string;
  };
}

export default function MemoDetailPage({ params }: MemoDetailPageProps) {
  const router = useRouter();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemo();
  }, [params.id]);

  const fetchMemo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/memos/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setMemo(data.data);
      } else {
        setError(data.error || '메모를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('메모를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/memos?edit=${params.id}`);
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/memos/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/memos');
      } else {
        alert(data.error || '메모 삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('메모 삭제에 실패했습니다.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center text-red-600 p-4">
          <p>{error}</p>
          <Button onClick={handleBack} className="mt-2">
            뒤로 가기
          </Button>
        </div>
      </Container>
    );
  }

  if (!memo) {
    return (
      <Container>
        <div className="text-center text-gray-500 p-8">
          <p>메모를 찾을 수 없습니다.</p>
          <Button onClick={handleBack} className="mt-2">
            뒤로 가기
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <Button onClick={handleBack} variant="outline">
            ← 뒤로 가기
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline">
              수정
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              삭제
            </Button>
          </div>
        </div>

        {/* 메모 상세 내용 */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {memo.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  생성일: {new Date(memo.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {memo.updatedAt !== memo.createdAt && (
                  <span>
                    수정일:{' '}
                    {new Date(memo.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>
            </div>

            {/* 카테고리 */}
            {memo.category && (
              <div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {memo.category}
                </span>
              </div>
            )}

            {/* 태그 */}
            {memo.tags && memo.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {memo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 내용 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">내용</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {memo.content}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
