'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 rounded-3xl overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* 메인 로고 및 타이틀 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-20 w-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl animate-gentle-bounce">
              <span className="text-4xl">📝</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Memora
              </h1>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2"></div>
            </div>
          </div>

          <p className="text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 font-light mb-4">
            AI 음성 메모장 웹서비스
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            음성을 텍스트로 변환하고, AI가 자동으로 요약하고 분류하는 스마트한
            메모 시스템
          </p>
        </div>

        {user ? (
          // 인증된 사용자용 콘텐츠
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30 p-8 lg:p-12 mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 dark:from-blue-400/5 dark:to-indigo-500/5"></div>
              <div className="relative text-center">
                <div className="h-16 w-16 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                  환영합니다,{' '}
                  <span className="text-gradient">
                    {user.user_metadata?.full_name || '사용자'}
                  </span>
                  님! 👋
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  AI 기반 음성 메모 애플리케이션에서 스마트한 메모 관리를
                  시작하세요. Memora와 함께 생산성을 한 단계 끌어올려보세요.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Link
                    href="/dashboard"
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      <svg
                        className="w-6 h-6 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      대시보드로 이동
                    </span>
                  </Link>

                  <Link
                    href="/memos"
                    className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-green-500/25"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      <svg
                        className="w-6 h-6 group-hover:scale-110 transition-transform"
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
                      음성 메모 시작
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 기능 미리보기 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  음성 인식
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  실시간으로 음성을 텍스트로 변환합니다
                </p>
              </div>

              <div className="group relative overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  AI 요약
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  AI가 자동으로 핵심 내용을 요약합니다
                </p>
              </div>

              <div className="group relative overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  스마트 분류
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  자동으로 카테고리별로 메모를 정리합니다
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 미인증 사용자용 콘텐츠
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30 p-8 lg:p-12 mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 dark:from-blue-400/5 dark:to-indigo-500/5"></div>
              <div className="relative text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                  🎤 음성으로 메모하고, AI가 정리해드려요
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  복잡한 메모 관리는 이제 그만! Memora와 함께 스마트하게
                  기록하고 체계적으로 관리하세요.
                </p>

                {/* 기능 하이라이트 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
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
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                      실시간 음성인식
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      정확한 음성 → 텍스트 변환
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
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
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                      AI 자동 요약
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      핵심만 골라 간단하게
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                      스마트 분류
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      자동 카테고리 정리
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                      빠른 검색
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      키워드로 즉시 검색
                    </p>
                  </div>
                </div>

                {/* 로그인/회원가입 버튼 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/login"
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      <svg
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      로그인
                    </span>
                  </Link>

                  <Link
                    href="/auth/signup"
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-500/25"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      <svg
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      회원가입
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 추가 정보 섹션 */}
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                ✨ 무료로 시작하여 AI의 도움을 받아보세요
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  무료 가입
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  즉시 사용 가능
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  데이터 보안
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
