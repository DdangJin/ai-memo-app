import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const result = await signOut();

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
      message: '로그아웃이 완료되었습니다.',
    });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '로그아웃 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
