import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    console.log('🔍 세션 확인 API 호출됨');

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name);
            console.log(`쿠키 ${name}:`, cookie?.value ? '있음' : '없음');
            return cookie?.value;
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

    // 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('세션 확인 오류:', sessionError);
      return NextResponse.json(
        {
          success: false,
          error: sessionError.message,
        },
        { status: 500 }
      );
    }

    if (session) {
      console.log('세션 확인됨:', session.user.email);
      return NextResponse.json({
        success: true,
        session: {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name,
          },
          expires_at: session.expires_at,
        },
      });
    } else {
      console.log('세션이 없습니다.');
      return NextResponse.json({
        success: false,
        message: '세션이 없습니다.',
      });
    }
  } catch (error) {
    console.error('세션 확인 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '세션 확인 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
