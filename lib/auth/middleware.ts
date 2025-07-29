import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends NextRequest {
  user: User;
}

/**
 * API 라우트용 인증 미들웨어
 * Supabase Auth를 사용하여 사용자 인증 상태를 확인하고 user 정보를 제공
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const supabase = await createClient();

      // 현재 인증된 사용자 정보 가져오기
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json(
          { error: '인증이 필요합니다.', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }

      // user 정보를 request에 추가
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return await handler(authenticatedReq);
    } catch (error) {
      console.error('인증 미들웨어 오류:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }
  };
}

/**
 * 사용자가 리소스에 대한 소유권을 가지고 있는지 확인
 */
export function checkOwnership(
  userId: string,
  resourceUserId: string
): boolean {
  return userId === resourceUserId;
}

/**
 * 소유권 검사 에러 응답 생성
 */
export function createUnauthorizedResponse() {
  return NextResponse.json(
    { error: '이 리소스에 접근할 권한이 없습니다.', code: 'FORBIDDEN' },
    { status: 403 }
  );
}

/**
 * 유효하지 않은 요청 에러 응답 생성
 */
export function createBadRequestResponse(
  message: string = '잘못된 요청입니다.'
) {
  return NextResponse.json(
    { error: message, code: 'BAD_REQUEST' },
    { status: 400 }
  );
}

/**
 * 리소스를 찾을 수 없음 에러 응답 생성
 */
export function createNotFoundResponse(
  message: string = '리소스를 찾을 수 없습니다.'
) {
  return NextResponse.json(
    { error: message, code: 'NOT_FOUND' },
    { status: 404 }
  );
}

/**
 * 성공 응답 생성
 */
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ data, success: true }, { status });
}
