import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // API 라우트는 미들웨어에서 제외
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  console.log(`🔍 미들웨어 처리: ${req.nextUrl.pathname}`);

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name);
          console.log(`쿠키 ${name}:`, cookie?.value ? '있음' : '없음');
          return cookie?.value;
        },
        set(name: string, value: string, options: any) {
          console.log(`쿠키 설정: ${name}`);
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          console.log(`쿠키 제거: ${name}`);
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // 세션 확인
    console.log('세션 확인 중...');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('세션 확인 오류:', sessionError);
    }

    if (session) {
      console.log('세션 확인됨:', session.user.email);
    } else {
      console.log('세션이 없습니다.');
    }

    // 보호된 라우트 정의
    const protectedRoutes = ['/profile', '/memos', '/memos/create'];
    const authRoutes = ['/auth'];
    const isProtectedRoute = protectedRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );
    const isAuthRoute = authRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    // 보호된 라우트에 접근하려는 경우
    if (isProtectedRoute && !session) {
      console.log('보호된 라우트 접근 시도 - 세션 없음, 리다이렉트');
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth';
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 이미 로그인된 사용자가 인증 페이지에 접근하는 경우
    if (isAuthRoute && session) {
      console.log('인증된 사용자가 인증 페이지 접근 - 홈으로 리다이렉트');
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }

    console.log('미들웨어 처리 완료');
    return res;
  } catch (error) {
    console.error('미들웨어 오류:', error);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled in middleware function)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
