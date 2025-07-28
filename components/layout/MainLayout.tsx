'use client';

import { ReactNode } from 'react';
import Header from '@/components/ui/Header';
import Navigation from '@/components/ui/Navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      <div className="flex h-[calc(100vh-4rem)] pt-16">
        {/* 사이드바 네비게이션 (데스크톱) */}
        <aside className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-0 lg:overflow-y-auto lg:border-r lg:border-gray-200 lg:bg-white">
          <div className="flex-1 flex flex-col min-h-0">
            <Navigation />
          </div>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 lg:ml-64 pt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
