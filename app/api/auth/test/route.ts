import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSession } from '@/lib/auth/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const [userResult, sessionResult] = await Promise.all([
      getCurrentUser(),
      getSession(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: userResult.user
          ? {
              id: userResult.user.id,
              email: userResult.user.email,
              name: userResult.user.user_metadata?.name,
              emailConfirmed: userResult.user.email_confirmed_at,
              createdAt: userResult.user.created_at,
            }
          : null,
        session: sessionResult.session
          ? {
              accessToken: sessionResult.session.access_token
                ? 'present'
                : 'missing',
              refreshToken: sessionResult.session.refresh_token
                ? 'present'
                : 'missing',
              expiresAt: sessionResult.session.expires_at,
            }
          : null,
        errors: {
          user: userResult.error?.message || null,
          session: sessionResult.error?.message || null,
        },
      },
    });
  } catch (error) {
    console.error('인증 테스트 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '인증 테스트 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
