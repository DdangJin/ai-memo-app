'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 메모 타입 정의
interface Memo {
  id: string;
  title: string;
  content: string | null;
  categoryId: string | null;
  voiceUrl: string | null;
  durationSeconds: number | null;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MemoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MemoDetailPage({ params }: MemoDetailPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memoId, setMemoId] = useState<string | null>(null);

  // params 해결
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setMemoId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // 인증되지 않은 사용자 리디렉션
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // 메모 상세 정보 가져오기 (useCallback으로 최적화)
  const fetchMemo = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/memos/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('메모를 찾을 수 없습니다.');
          } else if (response.status === 403) {
            throw new Error('이 메모에 접근할 권한이 없습니다.');
          } else {
            throw new Error(
              `메모를 불러오는데 실패했습니다: ${response.status}`
            );
          }
        }

        const data = await response.json();
        setMemo(data.data);
      } catch (err) {
        console.error('메모 조회 오류:', err);
        setError(
          err instanceof Error ? err.message : '메모를 불러오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // 메모 즐겨찾기 토글
  const toggleFavorite = async () => {
    if (!memo || !user) return;

    try {
      const response = await fetch(`/api/memos/${memo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isFavorite: !memo.isFavorite,
        }),
      });

      if (!response.ok) {
        throw new Error('즐겨찾기 변경에 실패했습니다.');
      }

      const data = await response.json();
      setMemo(data.data);
    } catch (err) {
      console.error('즐겨찾기 변경 오류:', err);
    }
  };

  // 메모 삭제
  const deleteMemo = async () => {
    if (!memo || !user) return;

    if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/memos/${memo.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('메모 삭제에 실패했습니다.');
      }

      // 삭제 성공 시 목록으로 이동
      router.push('/memos');
    } catch (err) {
      console.error('메모 삭제 오류:', err);
      alert('메모 삭제에 실패했습니다.');
    }
  };

  // 메모 로드
  useEffect(() => {
    if (user && memoId) {
      fetchMemo(memoId);
    }
  }, [user, memoId, fetchMemo]);

  // 메모 시간 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 재생 시간 포맷팅
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 로딩 상태
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자
  if (!user) {
    return null;
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
          <div className="mt-6">
            <Link
              href="/memos"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              메모 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 메모가 없는 경우
  if (!memo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              메모를 찾을 수 없습니다
            </h3>
            <Link
              href="/memos"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              메모 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/memos"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            메모 목록으로 돌아가기
          </Link>
        </div>

        {/* 메모 상세 내용 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {memo.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>생성: {formatDate(memo.createdAt)}</span>
                  {memo.updatedAt !== memo.createdAt && (
                    <span>수정: {formatDate(memo.updatedAt)}</span>
                  )}
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div
                className="flex items-center justify-center lg:justify-end space-x-2 lg:ml-4"
                role="group"
                aria-label="메모 액션"
              >
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    memo.isFavorite
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                  aria-label={
                    memo.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'
                  }
                  aria-pressed={memo.isFavorite}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>

                <Link
                  href={`/memos/${memo.id}/edit`}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="메모 편집"
                >
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Link>

                <button
                  onClick={deleteMemo}
                  className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="메모 삭제"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 음성 메모 섹션 */}
          {memo.voiceUrl && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                  <span className="font-medium">음성 메모</span>
                  {memo.durationSeconds && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({formatDuration(memo.durationSeconds)})
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <audio controls className="w-full">
                  <source src={memo.voiceUrl} type="audio/mpeg" />
                  브라우저에서 오디오를 지원하지 않습니다.
                </audio>
              </div>
            </div>
          )}

          {/* 메모 내용 */}
          <div className="px-6 py-6">
            {memo.content ? (
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-white leading-relaxed">
                  {memo.content}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                메모 내용이 없습니다.
              </div>
            )}
          </div>

          {/* 추가 정보 */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {memo.isArchived && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  보관됨
                </span>
              )}
              <span>메모 ID: {memo.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
