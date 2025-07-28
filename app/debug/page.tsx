'use client';

import { useAuth } from '@/lib/auth/use-auth';
import { useEffect } from 'react';

export default function DebugPage() {
  const { user, session, loading, error, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('Debug - Auth State:', {
      user: user?.email,
      session: !!session,
      loading,
      error,
      isAuthenticated,
    });
  }, [user, session, loading, error, isAuthenticated]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">인증 상태 디버깅</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">인증 상태</h2>
          <p>로딩: {loading ? '예' : '아니오'}</p>
          <p>인증됨: {isAuthenticated ? '예' : '아니오'}</p>
          <p>사용자: {user?.email || '없음'}</p>
          <p>세션: {session ? '있음' : '없음'}</p>
          {error && <p className="text-red-600">오류: {error.message}</p>}
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">사용자 정보</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-2">세션 정보</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
