import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/auth-utils';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '이메일과 비밀번호는 필수입니다.',
        },
        { status: 400 }
      );
    }

    const result = await signIn({ email, password });

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.message,
        },
        { status: 400 }
      );
    }

    // 쿠키 설정을 위한 Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', options);
            } catch {
              // The `remove` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // 세션 새로고침으로 쿠키 설정
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('세션 설정 오류:', sessionError);
    } else if (session) {
      console.log('세션 설정 성공:', session.user.email);
    }

    return NextResponse.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      user: result.user
        ? {
            id: result.user.id,
            email: result.user.email,
            name: result.user.user_metadata?.name,
          }
        : null,
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
