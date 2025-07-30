'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [viewMemosLoading, setViewMemosLoading] = useState(false);
  const [viewSummaryLoading, setViewSummaryLoading] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  // 향상된 "Start Recording" 네비게이션 핸들러
  const handleStartRecording = async () => {
    if (isNavigating) return;
    setNavigationError(null);

    if (!user) {
      setNavigationError('로그인이 필요한 서비스입니다.');
      router.push('/auth/login');
      return;
    }

    try {
      setIsNavigating(true);
      router.push('/memos/new');
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    } catch (error) {
      setIsNavigating(false);
      setNavigationError('페이지를 로드하는 중 오류가 발생했습니다.');
      console.error('네비게이션 오류:', error);
    }
  };

  // 향상된 "View Memos" 네비게이션 핸들러
  const handleViewMemos = async () => {
    if (viewMemosLoading) return;
    setNavigationError(null);

    if (!user) {
      setNavigationError('로그인이 필요한 서비스입니다.');
      router.push('/auth/login');
      return;
    }

    try {
      setViewMemosLoading(true);
      router.push('/memos');
      setTimeout(() => {
        setViewMemosLoading(false);
      }, 500);
    } catch (error) {
      setViewMemosLoading(false);
      setNavigationError('메모 목록을 로드하는 중 오류가 발생했습니다.');
      console.error('네비게이션 오류:', error);
    }
  };

  // 향상된 "View Summary" 네비게이션 핸들러
  const handleViewSummaries = async () => {
    if (viewSummaryLoading) return;
    setNavigationError(null);

    if (!user) {
      setNavigationError('로그인이 필요한 서비스입니다.');
      router.push('/auth/login');
      return;
    }

    try {
      setViewSummaryLoading(true);
      router.push('/memos?view=summaries');
      setTimeout(() => {
        setViewSummaryLoading(false);
      }, 500);
    } catch (error) {
      setViewSummaryLoading(false);
      setNavigationError('AI 요약을 로드하는 중 오류가 발생했습니다.');
      console.error('네비게이션 오류:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl animate-spin mx-auto opacity-90"></div>
            <div className="absolute inset-0 h-16 w-16 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-2xl animate-ping mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Memora 로딩 중
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              잠시만 기다려주세요...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 리디렉션 중
  }

  return (
    <div className="min-h-[80vh] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 섹션 */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10"></div>
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                    Memora 대시보드
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    안녕하세요,{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    님! 👋
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-500/25"
                aria-label="로그아웃"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {navigationError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium text-sm">
                  {navigationError}
                </p>
              </div>
              <button
                onClick={() => setNavigationError(null)}
                className="flex-shrink-0 p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                aria-label="오류 메시지 닫기"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 메인 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 음성 메모 카드 */}
          <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 dark:from-blue-900/10 dark:to-cyan-900/10"></div>
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    음성 메모
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    빠르고 편리하게 음성으로 기록하세요
                  </p>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    실시간 음성 인식
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    자동 텍스트 변환
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    AI 요약 및 분류
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartRecording}
                disabled={isNavigating}
                className={`group/btn w-full py-3 px-4 rounded-xl font-medium text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 ${
                  isNavigating
                    ? 'bg-blue-400 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:-translate-y-0.5'
                }`}
                aria-label="새 음성 메모 녹음 시작하기"
                type="button"
              >
                {isNavigating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    연결 중...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    녹음 시작
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 메모 목록 카드 */}
          <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10"></div>
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    메모 목록
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    저장된 모든 메모를 한눈에 보세요
                  </p>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    카테고리별 정리
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    태그 기반 검색
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    편집 및 관리
                  </div>
                </div>
              </div>

              <button
                onClick={handleViewMemos}
                disabled={viewMemosLoading}
                className={`group/btn w-full py-3 px-4 rounded-xl font-medium text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/25 ${
                  viewMemosLoading
                    ? 'bg-green-400 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:-translate-y-0.5'
                }`}
                aria-label="저장된 메모 목록 보기"
                type="button"
              >
                {viewMemosLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    로딩 중...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    메모 보기
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* AI 요약 카드 */}
          <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/10 dark:to-pink-900/10"></div>
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    AI 요약
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    인공지능이 핵심만 추려낸 요약본
                  </p>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    핵심 키워드 추출
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    스마트 분류
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    트렌드 분석
                  </div>
                </div>
              </div>

              <button
                onClick={handleViewSummaries}
                disabled={viewSummaryLoading}
                className={`group/btn w-full py-3 px-4 rounded-xl font-medium text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/25 ${
                  viewSummaryLoading
                    ? 'bg-purple-400 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:-translate-y-0.5'
                }`}
                aria-label="AI 요약된 메모들 보기"
                type="button"
              >
                {viewSummaryLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    분석 중...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    요약 보기
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 최근 활동 섹션 */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 to-gray-50/30 dark:from-slate-900/10 dark:to-gray-900/10"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-tr from-slate-500 to-gray-600 rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                최근 활동
              </h2>
            </div>

            <div className="text-center py-8">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-12 w-12 bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-slate-500 dark:text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
                    아직 활동이 없습니다
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    첫 번째 음성 메모를 녹음하여 Memora의 모든 기능을
                    경험해보세요!
                  </p>
                </div>
                <button
                  onClick={handleStartRecording}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  지금 시작하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
