'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchInput, { SearchResult } from '@/components/forms/SearchInput';
import TextHighlight from '@/components/common/TextHighlight';

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

// API 응답 타입
interface MemoListResponse {
  memos: Memo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 실제 API 응답 타입 (createSuccessResponse 구조)
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// 메모 카드 컴포넌트 (React.memo로 최적화)
const MemoCard = memo(
  ({ memo, searchTerms = [] }: { memo: Memo; searchTerms?: string[] }) => {
    // 메모 시간 포맷팅 (메모화)
    const formattedCreatedAt = useMemo(() => {
      return new Date(memo.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }, [memo.createdAt]);

    const formattedUpdatedAt = useMemo(() => {
      if (memo.updatedAt === memo.createdAt) return null;
      return new Date(memo.updatedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }, [memo.updatedAt, memo.createdAt]);

    return (
      <Link
        href={`/memos/${memo.id}`}
        className="block backdrop-blur-glass rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-slate-700/50 card-hover group"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {searchTerms.length > 0 ? (
                <TextHighlight text={memo.title} searchTerms={searchTerms} />
              ) : (
                memo.title
              )}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              {memo.isFavorite && (
                <div
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md"
                  aria-label="즐겨찾기"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              )}
              {memo.voiceUrl && (
                <div
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md"
                  aria-label="음성 메모"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          {memo.content && (
            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed">
              {searchTerms.length > 0 ? (
                <TextHighlight text={memo.content} searchTerms={searchTerms} />
              ) : (
                memo.content
              )}
            </p>
          )}
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formattedCreatedAt}</span>
            </div>
            {formattedUpdatedAt && (
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>{formattedUpdatedAt}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
);

MemoCard.displayName = 'MemoCard';

export default function MemosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const limit = 10; // 페이지당 메모 개수

  // 인증되지 않은 사용자 리디렉션
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // 메모 목록 가져오기 (useCallback으로 최적화)
  const fetchMemos = useCallback(
    async (page: number = 1, sort?: string, order?: string) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const response = await fetch(`/api/memos?${searchParams.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`메모를 불러오는데 실패했습니다: ${response.status}`);
        }

        const apiResponse: ApiResponse<MemoListResponse> =
          await response.json();
        const data = apiResponse.data;

        // Data validation
        if (!data || !data.memos) {
          throw new Error('API 응답에서 메모 데이터를 찾을 수 없습니다.');
        }

        // 클라이언트 사이드 정렬 (API가 정렬을 지원하지 않는 경우)
        let sortedMemos = data.memos;
        if (data.memos && data.memos.length > 0) {
          sortedMemos = [...data.memos].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if (sort || sortBy === 'title') {
              aValue = a.title.toLowerCase();
              bValue = b.title.toLowerCase();
            } else if ((sort || sortBy) === 'updatedAt') {
              aValue = new Date(a.updatedAt).getTime();
              bValue = new Date(b.updatedAt).getTime();
            } else {
              // createdAt (default)
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
            }

            const sortDirection = order || sortOrder;
            if (sortDirection === 'asc') {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
          });
        }

        setMemos(sortedMemos);
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        console.error('메모 조회 오류:', err);
        setError(
          err instanceof Error ? err.message : '메모를 불러오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    },
    [user, sortBy, sortOrder, limit]
  );

  // 초기 로드
  useEffect(() => {
    if (user) {
      fetchMemos(1);
    }
  }, [user, fetchMemos]);

  // 페이지 변경 핸들러 (useCallback으로 최적화)
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        fetchMemos(page);
      }
    },
    [totalPages, fetchMemos]
  );

  // 정렬 변경 핸들러 (useCallback으로 최적화)
  const handleSortChange = useCallback(
    (newSortBy: 'createdAt' | 'updatedAt' | 'title') => {
      // 같은 필드를 클릭하면 순서를 바꾸고, 다른 필드를 클릭하면 desc로 시작
      const newSortOrder =
        newSortBy === sortBy && sortOrder === 'desc' ? 'asc' : 'desc';

      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setCurrentPage(1); // 정렬 변경 시 첫 페이지로
      fetchMemos(1, newSortBy, newSortOrder);
    },
    [sortBy, sortOrder, fetchMemos]
  );

  // 검색 결과 처리 핸들러
  const handleSearchResults = useCallback(
    (results: SearchResult[], query: string, isSearching: boolean) => {
      setSearchResults(results);
      setSearchQuery(query);
      setIsSearchMode(!!query.trim() || isSearching);
      setSearchError(null);
    },
    []
  );

  // 검색어를 배열로 분할 (하이라이트용)
  const searchTermsArray = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchQuery
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => term.replace(/[^\w가-힣]/g, '')) // 특수문자 제거
      .filter(term => term.length > 0);
  }, [searchQuery]);

  // 검색 에러 처리 핸들러
  const handleSearchError = useCallback((error: string) => {
    setSearchError(error);
  }, []);

  // 페이지네이션 렌더링 (useMemo로 최적화)
  const renderPagination = useMemo(() => {
    if (totalPages <= 1) return null;

    return (
      <nav
        className="flex justify-center items-center space-x-2"
        aria-label="메모 목록 페이지네이션"
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 rounded-xl backdrop-blur-glass border border-white/20 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          aria-label="이전 페이지"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 페이지 번호 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          // 현재 페이지 주변의 페이지만 표시
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 2 && page <= currentPage + 2)
          ) {
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'backdrop-blur-glass border border-white/20 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800/50'
                } disabled:cursor-not-allowed`}
                aria-label={`${page}페이지로 이동`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 3 || page === currentPage + 3) {
            return (
              <span key={page} className="px-2 text-slate-500">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="px-4 py-2 rounded-xl backdrop-blur-glass border border-white/20 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          aria-label="다음 페이지"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </nav>
    );
  }, [totalPages, currentPage, handlePageChange, loading]);

  // 로딩 상태
  if (authLoading || (loading && memos.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="backdrop-blur-glass rounded-2xl border border-white/20 dark:border-slate-700/50 p-6"
                >
                  <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg w-1/2"></div>
                </div>
              ))}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                내 메모
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {isSearchMode && searchQuery
                  ? `"${searchQuery}" 검색 결과: ${(searchResults || []).length}개`
                  : `총 ${total}개의 메모`}
              </p>
            </div>
            <Link
              href="/memos/new"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 btn-active"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              새 메모 작성
            </Link>
          </div>

          {/* 검색 입력 */}
          <div className="backdrop-blur-glass rounded-2xl border border-white/20 dark:border-slate-700/50 p-4">
            <SearchInput
              onResults={handleSearchResults}
              onError={handleSearchError}
              className="max-w-md"
            />
          </div>

          {/* 정렬 컨트롤 - 검색 모드가 아닐 때만 표시 */}
          {!isSearchMode && (
            <div className="backdrop-blur-glass rounded-2xl border border-white/20 dark:border-slate-700/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  정렬:
                </span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="메모 정렬 옵션"
                >
                  {[
                    { key: 'createdAt', label: '생성일' },
                    { key: 'updatedAt', label: '수정일' },
                    { key: 'title', label: '제목' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() =>
                        handleSortChange(
                          key as 'createdAt' | 'updatedAt' | 'title'
                        )
                      }
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        sortBy === key
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70'
                      }`}
                      aria-pressed={sortBy === key}
                      aria-label={`${label}순 정렬 ${sortBy === key ? (sortOrder === 'desc' ? '내림차순' : '올림차순') : ''}`}
                    >
                      {label}
                      {sortBy === key && (
                        <span className="ml-2" aria-hidden="true">
                          {sortOrder === 'desc' ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 에러 상태 */}
        {(error || searchError) && (
          <div className="bg-red-50/90 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-8">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error || searchError}
              </p>
            </div>
          </div>
        )}

        {/* 메모 목록 */}
        {((isSearchMode ? searchResults : memos) || []).length === 0 ? (
          <div className="text-center py-16">
            <div className="backdrop-blur-glass rounded-3xl border border-white/20 dark:border-slate-700/50 p-12">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-slate-400 to-slate-500 rounded-2xl mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {isSearchMode ? '검색 결과가 없습니다' : '메모가 없습니다'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                {isSearchMode
                  ? '다른 검색어로 시도해보세요.'
                  : '첫 번째 메모를 작성해보세요!'}
              </p>
              <Link
                href="/memos/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 btn-active"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                메모 작성하기
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 메모 카드 목록 */}
            <div className="grid gap-6 mb-8">
              {((isSearchMode ? searchResults : memos) || []).map(memo => (
                <MemoCard
                  key={memo.id}
                  memo={memo}
                  searchTerms={isSearchMode ? searchTermsArray : []}
                />
              ))}
            </div>

            {/* 페이지네이션 - 검색 모드가 아닐 때만 표시 */}
            {!isSearchMode && renderPagination}
          </>
        )}
      </div>
    </div>
  );
}
