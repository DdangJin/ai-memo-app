'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl animate-spin mx-auto opacity-90"></div>
            <div className="absolute inset-0 h-16 w-16 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-2xl animate-ping mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              프로필 로딩 중
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg animate-gentle-bounce">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
              프로필 관리
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              개인 정보를 관리하고 업데이트하세요
            </p>
          </div>

          {/* 사용자 프로필 컴포넌트 */}
          <div className="mb-8">
            <UserProfile />
          </div>

          {/* 계정 정보 카드 */}
          <div className="backdrop-blur-glass rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 hover-lift">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                계정 정보
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 사용자 ID */}
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    사용자 ID
                  </label>
                </div>
                <p className="text-slate-900 dark:text-white font-mono text-sm bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  {user.id}
                </p>
              </div>

              {/* 이메일 확인 상태 */}
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    이메일 확인 상태
                  </label>
                </div>
                <div className="flex items-center">
                  {user.email_confirmed_at ? (
                    <>
                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full mr-2">
                        <svg
                          className="w-4 h-4 text-green-600 dark:text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        확인됨
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full mr-2">
                        <svg
                          className="w-4 h-4 text-red-600 dark:text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <span className="text-red-700 dark:text-red-400 font-medium">
                        미확인
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 마지막 로그인 */}
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 md:col-span-2">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 text-purple-600 mr-2"
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
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    마지막 로그인
                  </label>
                </div>
                <p className="text-slate-900 dark:text-white font-medium">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '알 수 없음'}
                </p>
              </div>
            </div>

            {/* 보안 정보 */}
            <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  귀하의 계정은 안전하게 보호되고 있습니다
                </p>
              </div>
            </div>
          </div>

          {/* 추가 액션 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              계정에 문제가 있으시거나 도움이 필요하시면 고객지원팀에
              문의해주세요
            </p>
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              고객지원 문의
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
