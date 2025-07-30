import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientLayout from '@/app/client-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Memora - AI 음성 메모장',
  description: 'AI 기술을 활용한 스마트 메모 애플리케이션',
  // 보안 메타데이터 (Context7 권장사항)
  referrer: 'strict-origin-when-cross-origin',
  robots: 'index, follow',
  // 추가 메타 태그로 보안 강화
  other: {
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 추가 보안 메타 태그 (Context7 OWASP 베스트 프랙티스) */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen`}
      >
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
