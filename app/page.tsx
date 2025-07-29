'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/ui';

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <Layout onSignOut={signOut}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isLoading={loading} onSignOut={signOut}>
      <div className="min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📝 Memora
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              AI 음성 메모장 웹서비스
            </p>

            {user ? (
              // 인증된 사용자용 콘텐츠
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  환영합니다, {user.user_metadata?.full_name || '사용자'}님! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  AI 기반 음성 메모 애플리케이션에서 스마트한 메모 관리를
                  시작하세요.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
                  >
                    대시보드로 이동
                  </Link>
                  <Link
                    href="/memos"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center"
                  >
                    메모 작성하기
                  </Link>
                </div>
              </div>
            ) : (
              // 미인증 사용자용 콘텐츠
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  🚀 시작하기
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Next.js 14, TypeScript, TailwindCSS로 구축되는 AI 기반 음성
                  메모 애플리케이션입니다.
                </p>

                {/* 주요 기능 및 기술 스택 소개 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      🎯 주요 기능
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• 음성 메모 녹음</li>
                      <li>• AI 자동 요약</li>
                      <li>• 스마트 분류</li>
                      <li>• 실시간 동기화</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      🛠️ 기술 스택
                    </h3>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Next.js 14</li>
                      <li>• TypeScript</li>
                      <li>• TailwindCSS</li>
                      <li>• Supabase</li>
                    </ul>
                  </div>
                </div>

                {/* 로그인/회원가입 버튼 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
                  >
                    회원가입
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
