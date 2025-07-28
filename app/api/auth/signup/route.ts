import { NextRequest, NextResponse } from 'next/server';
import { createUserDirectly } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

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

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: '유효한 이메일 주소를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: '비밀번호는 최소 6자 이상이어야 합니다.',
        },
        { status: 400 }
      );
    }

    // Supabase Admin API를 사용하여 직접 사용자 생성
    const result = await createUserDirectly({
      email,
      password,
      name,
    });

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다. 바로 로그인할 수 있습니다.',
      user: result.user
        ? {
            id: result.user.id,
            email: result.user.email,
            name: result.user.user_metadata?.name,
          }
        : null,
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
