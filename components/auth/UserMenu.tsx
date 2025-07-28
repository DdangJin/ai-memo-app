'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      setIsOpen(false);
      router.push('/auth');
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    // 프로필 페이지로 이동 (향후 구현)
    router.push('/profile');
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/auth')}
          className="text-gray-700 hover:text-gray-900 font-medium"
        >
          로그인
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          {user.user_metadata?.name?.[0]?.toUpperCase() ||
            user.email?.[0]?.toUpperCase() ||
            'U'}
        </div>
        <span className="hidden md:block text-sm font-medium">
          {user.user_metadata?.name || user.email}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {user.user_metadata?.name || '사용자'}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          <button
            onClick={handleProfileClick}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
          >
            프로필
          </button>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      )}
    </div>
  );
}
