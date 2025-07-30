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
        'sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-lg shadow-black/5',
        className
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* 브랜드/로고 섹션 */}
        <div className="flex items-center space-x-4">
          {/* 모바일 메뉴 버튼 */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="메인 메뉴 열기"
            aria-expanded={showMobileMenu}
            aria-controls="mobile-menu"
            className="group md:hidden inline-flex items-center justify-center rounded-xl p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all duration-300 hover:scale-105"
          >
            <span className="sr-only">메인 메뉴</span>
            {showMobileMenu ? (
              <svg
                className="h-6 w-6 transition-transform group-hover:rotate-90"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
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
                className="h-6 w-6 transition-transform group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
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
            className="group flex items-center space-x-3 text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/25 rounded-xl px-2 py-1 transition-all duration-300"
          >
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl" role="img" aria-label="메모 아이콘">
                  📝
                </span>
              </div>
              <div className="absolute inset-0 h-10 w-10 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-30 group-hover:animate-ping transition-opacity"></div>
            </div>
            <h1 className="hidden sm:block bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
              {title}
            </h1>
          </Link>
        </div>

        {/* 네비게이션 (데스크톱) */}
        <nav
          role="navigation"
          aria-label="메인 네비게이션"
          className="hidden md:flex md:items-center md:space-x-2"
        >
          {user && (
            <div className="flex items-center space-x-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-2 border border-white/20 dark:border-slate-700/30 shadow-lg">
              <Link
                href="/dashboard"
                className="group relative px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/25 rounded-xl transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
              >
                <span className="relative flex items-center gap-2">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                  대시보드
                </span>
              </Link>
              <Link
                href="/memos"
                className="group relative px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/25 rounded-xl transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
              >
                <span className="relative flex items-center gap-2">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                  메모
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* 사용자 메뉴 */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl animate-spin"></div>
              <div className="absolute inset-0 h-10 w-10 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-xl animate-ping opacity-75"></div>
            </div>
          ) : user ? (
            <div className="relative">
              <button
                ref={userButtonRef}
                type="button"
                onClick={handleUserMenuToggle}
                aria-label="사용자 메뉴"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                className="group flex items-center space-x-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 p-3 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-blue-500/25 shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg group-hover:scale-110 transition-transform">
                    {user.user_metadata?.full_name?.[0] ||
                      user.email?.[0]?.toUpperCase() ||
                      'U'}
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">
                    {user.user_metadata?.full_name || '사용자'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    온라인
                  </p>
                </div>
                <svg
                  className={cn(
                    'h-4 w-4 transition-transform duration-300',
                    isUserMenuOpen ? 'rotate-180' : ''
                  )}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
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
                  className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-2xl focus:outline-none transform transition-all duration-300 animate-in slide-in-from-top-2"
                >
                  <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg">
                        {user.user_metadata?.full_name?.[0] ||
                          user.email?.[0]?.toUpperCase() ||
                          'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {user.user_metadata?.full_name || '사용자'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="group flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 focus:bg-white/60 dark:focus:bg-slate-700/60 focus:outline-none rounded-xl transition-all duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>프로필 설정</span>
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="group flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 focus:outline-none rounded-xl transition-all duration-200"
                    >
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="group relative px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/25 rounded-xl transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="relative flex items-center gap-2">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
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
          )}
        </div>
      </div>
    </header>
  );
}
