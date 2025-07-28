'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { HeaderProps } from './Header.types';

export default function Header({
  title = 'Memora',
  user,
  isLoading = false,
  showMobileMenu = false,
  showUserMenu = false,
  onMobileMenuToggle,
  onUserMenuToggle,
  onSignOut,
  className,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(showUserMenu);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  // 외부 클릭시 사용자 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Escape 키로 메뉴 닫기
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isUserMenuOpen]);

  const handleUserMenuToggle = () => {
    const newState = !isUserMenuOpen;
    setIsUserMenuOpen(newState);
    onUserMenuToggle?.();
  };

  const handleSignOut = () => {
    setIsUserMenuOpen(false);
    onSignOut?.();
  };

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60',
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 브랜드/로고 섹션 */}
        <div className="flex items-center space-x-4">
          {/* 모바일 메뉴 버튼 */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="메인 메뉴 열기"
            aria-expanded={showMobileMenu}
            aria-controls="mobile-menu"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <span className="sr-only">메인 메뉴</span>
            {showMobileMenu ? (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>

          {/* 브랜드 */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-white dark:hover:text-blue-400"
          >
            <span className="text-2xl" role="img" aria-label="메모 아이콘">
              📝
            </span>
            <h1 className="sr-only md:not-sr-only">{title}</h1>
          </Link>
        </div>

        {/* 네비게이션 (데스크톱) */}
        <nav
          role="navigation"
          aria-label="메인 네비게이션"
          className="hidden md:flex md:items-center md:space-x-6"
        >
          {user && (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:text-blue-400"
              >
                대시보드
              </Link>
              <Link
                href="/memos"
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:text-blue-400"
              >
                메모
              </Link>
            </>
          )}
        </nav>

        {/* 사용자 메뉴 */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          ) : user ? (
            <div className="relative">
              <button
                ref={userButtonRef}
                type="button"
                onClick={handleUserMenuToggle}
                aria-label="사용자 메뉴"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                className="flex items-center space-x-2 rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.user_metadata?.full_name?.[0] ||
                    user.email?.[0]?.toUpperCase() ||
                    'U'}
                </div>
                <svg
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isUserMenuOpen ? 'rotate-180' : ''
                  )}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isUserMenuOpen && (
                <div
                  ref={userMenuRef}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
                    <p className="font-medium">
                      {user.user_metadata?.full_name || '사용자'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    프로필 설정
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:text-blue-400"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
