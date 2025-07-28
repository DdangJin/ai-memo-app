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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 리디렉션 중
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              프로필 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              개인 정보를 관리하고 업데이트하세요
            </p>
          </div>

          <UserProfile />

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              계정 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  사용자 ID
                </label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">
                  {user.id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  이메일 확인 상태
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user.email_confirmed_at ? '✅ 확인됨' : '❌ 미확인'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  마지막 로그인
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString('ko-KR')
                    : '알 수 없음'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
