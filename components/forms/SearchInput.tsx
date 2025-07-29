'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchResult {
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

export interface SearchResponse {
  memos: SearchResult[];
  query: string;
  isStopWordQuery?: boolean;
  stopWordMessage?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SearchInputProps {
  onResults?: (
    results: SearchResult[],
    query: string,
    isSearching: boolean
  ) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export default function SearchInput({
  onResults,
  onError,
  placeholder = '메모를 검색하세요...',
  className = '',
  debounceMs = 300,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isStopWordQuery, setIsStopWordQuery] = useState(false);
  const [stopWordMessage, setStopWordMessage] = useState<string>('');

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 검색 함수
  const performSearch = useCallback(
    async (searchQuery: string) => {
      // 이전 요청이 있으면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 빈 검색어 처리
      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        onResults?.([], '', false);
        return;
      }

      // 새 AbortController 생성
      abortControllerRef.current = new AbortController();
      setIsSearching(true);

      try {
        const searchParams = new URLSearchParams({
          q: searchQuery.trim(),
          page: '1',
          limit: '20', // 검색 결과는 더 많이 보여줌
        });

        const response = await fetch(
          `/api/memos/search?${searchParams.toString()}`,
          {
            method: 'GET',
            credentials: 'include',
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(errorData.message || '검색어가 올바르지 않습니다.');
          }
          throw new Error('검색 중 오류가 발생했습니다.');
        }

        const apiResponse = await response.json();

        // createSuccessResponse 구조에 맞게 데이터 추출
        const data: SearchResponse = apiResponse.data || apiResponse;

        setResults(data.memos);
        setIsStopWordQuery(data.isStopWordQuery || false);
        setStopWordMessage(data.stopWordMessage || '');
        onResults?.(data.memos, searchQuery, false);
      } catch (error) {
        // AbortError는 무시 (의도적인 취소)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error('검색 오류:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : '검색 중 오류가 발생했습니다.';
        onError?.(errorMessage);
        setResults([]);
        setIsStopWordQuery(false);
        setStopWordMessage('');
        onResults?.([], searchQuery, false);
      } finally {
        setIsSearching(false);
      }
    },
    [onResults, onError]
  );

  // 디바운스된 검색
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      // 이전 타이머 취소
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // 새 타이머 설정
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, debounceMs);
    },
    [performSearch, debounceMs]
  );

  // 입력값 변경 핸들러
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (value.trim()) {
        setIsSearching(true);
        onResults?.(results, value, true);
      }

      debouncedSearch(value);
    },
    [debouncedSearch, results, onResults]
  );

  // 검색어 초기화
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsStopWordQuery(false);
    setStopWordMessage('');
    onResults?.([], '', false);

    // 진행 중인 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 디바운스 타이머 정리
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [onResults]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* 검색 아이콘 */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        {/* 검색 입력 */}
        <input
          type="text"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="메모 검색"
        />

        {/* 로딩 인디케이터 또는 클리어 버튼 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : query ? (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* 검색 결과 상태 텍스트 */}
      {query && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isSearching ? (
            <span>검색 중...</span>
          ) : (results || []).length > 0 ? (
            <span>
              &quot;{query}&quot;에 대한 검색 결과: {(results || []).length}개
            </span>
          ) : query.trim() ? (
            <div className="space-y-1">
              <span>&quot;{query}&quot;에 대한 검색 결과가 없습니다.</span>
              {isStopWordQuery && (
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  💡{' '}
                  {stopWordMessage ||
                    '검색하신 단어는 일반적인 단어로 검색에서 제외됩니다. 더 구체적인 키워드를 사용해보세요.'}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
