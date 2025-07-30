'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Header } from '../Header';
import { Navigation } from '../Navigation';
import type { LayoutProps } from './Layout.types';
import type { NavigationItem } from '../Navigation/Navigation.types';

export default function Layout({
  children,
  user,
  isLoading = false,
  title = 'Memora',
  navigationItems = [],
  showSidebar = false,
  sidebar,
  showFooter = false,
  footer,
  maxWidth = 'full',
  padding = true,
  onSignOut,
  className,
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 기본 네비게이션 아이템들
  const defaultNavigationItems: NavigationItem[] = user
    ? [
        {
          id: 'dashboard',
          label: '대시보드',
          href: '/dashboard',
          icon: (
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          ),
        },
        {
          id: 'memos',
          label: '메모',
          href: '/memos',
          icon: (
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          ),
        },
        {
          id: 'categories',
          label: '카테고리',
          href: '/categories',
          icon: (
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
          ),
        },
      ]
    : [];

  const navItems =
    navigationItems.length > 0 ? navigationItems : defaultNavigationItems;

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigationItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  // 컨테이너 최대 너비 클래스
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-none',
  };

  return (
    <div className={cn('min-h-screen relative', className)}>
      {/* 배경 그라데이션 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10"></div>

      {/* Header */}
      <Header
        title={title}
        user={user}
        isLoading={isLoading}
        showMobileMenu={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
        onSignOut={onSignOut}
      />

      {/* 메인 레이아웃 */}
      <div className="flex min-h-[calc(100vh-5rem)]">
        {/* 사이드바 (데스크톱) */}
        {showSidebar && (
          <aside
            className="hidden lg:flex lg:w-64 lg:flex-col"
            aria-label="사이드바"
          >
            <div className="flex flex-col flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/30 shadow-lg">
              {/* 사이드바 네비게이션 */}
              {navItems.length > 0 && (
                <nav className="flex-1 px-4 py-6 space-y-1">
                  <Navigation
                    items={navItems}
                    isVertical={true}
                    onItemClick={handleNavigationItemClick}
                    aria-label="사이드바 네비게이션"
                  />
                </nav>
              )}

              {/* 사이드바 콘텐츠 */}
              {sidebar && (
                <div className="flex-shrink-0 px-4 py-4 border-t border-white/20 dark:border-slate-700/30">
                  {sidebar}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="모바일 메뉴"
          >
            <div
              className="fixed inset-0 bg-black/25 backdrop-blur-sm"
              onClick={handleMobileMenuClose}
            />
            <div className="fixed top-20 left-0 bottom-0 w-80 max-w-xs bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/30 shadow-2xl overflow-y-auto">
              <nav className="px-4 py-6">
                <Navigation
                  items={navItems}
                  isMobileMenuOpen={true}
                  isVertical={true}
                  onMobileMenuClose={handleMobileMenuClose}
                  onItemClick={handleNavigationItemClick}
                  aria-label="모바일 네비게이션"
                />
              </nav>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <main
          className={cn('flex-1 flex flex-col', showSidebar ? 'lg:pl-0' : '')}
          role="main"
        >
          <div
            className={cn(
              'flex-1 mx-auto w-full',
              maxWidthClasses[maxWidth],
              padding && 'px-4 py-6 sm:px-6 lg:px-8'
            )}
          >
            {children}
          </div>

          {/* 푸터 */}
          {showFooter && (
            <footer
              className={cn(
                'border-t border-white/20 dark:border-slate-700/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl',
                padding && 'px-4 py-6 sm:px-6 lg:px-8'
              )}
              role="contentinfo"
            >
              {footer || (
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className="text-2xl"
                        role="img"
                        aria-label="메모 아이콘"
                      >
                        📝
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        © 2024 {title}. All rights reserved.
                      </span>
                    </div>
                    <div className="flex space-x-6 text-sm text-slate-500 dark:text-slate-400">
                      <a
                        href="/privacy"
                        className="hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/25 rounded-lg px-2 py-1 transition-all duration-200"
                      >
                        개인정보처리방침
                      </a>
                      <a
                        href="/terms"
                        className="hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/25 rounded-lg px-2 py-1 transition-all duration-200"
                      >
                        이용약관
                      </a>
                      <a
                        href="/support"
                        className="hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/25 rounded-lg px-2 py-1 transition-all duration-200"
                      >
                        고객지원
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
