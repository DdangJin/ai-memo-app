import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const result = await getCurrentUser();

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.message,
        },
        { status: 400 }
      );
    }

    if (!result.user) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.user_metadata?.name,
        createdAt: result.user.created_at,
        updatedAt: result.user.updated_at,
      },
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
