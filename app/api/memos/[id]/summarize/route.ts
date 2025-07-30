import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, memos } from '@/lib/db';
import { summarizeMemo } from '@/lib/anthropic';
import {
  createSuccessResponse,
  createBadRequestResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  checkOwnership,
} from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { uuidParamSchema, formatValidationErrors } from '@/lib/validation/memo';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 인증된 사용자 정보를 가져오는 헬퍼 함수
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * POST /api/memos/[id]/summarize
 * 메모 요약 생성 및 저장
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // 보안 로깅 - IP 및 요청 정보 기록
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    console.log(
      `Memo Summarize API Request - IP: ${clientIP}, Timestamp: ${new Date().toISOString()}`
    );

    const user = await getAuthenticatedUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;

    // ID 검증
    const idValidation = uuidParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return createBadRequestResponse(
        formatValidationErrors(idValidation.error)
      );
    }

    // 메모 조회
    const [memo] = await db
      .select()
      .from(memos)
      .where(eq(memos.id, id))
      .limit(1);

    if (!memo) {
      return createNotFoundResponse('메모를 찾을 수 없습니다.');
    }

    // 소유권 확인
    if (!checkOwnership(user.id, memo.userId)) {
      return createUnauthorizedResponse();
    }

    // 메모 내용 확인
    if (!memo.content || memo.content.trim().length === 0) {
      return createBadRequestResponse('요약할 메모 내용이 없습니다.');
    }

    // 메모 내용 길이 제한 (10,000자)
    if (memo.content.length > 10000) {
      return createBadRequestResponse(
        '메모 내용이 너무 깁니다. 10,000자 이하로 제한해주세요.'
      );
    }

    // Claude API로 메모 요약 생성
    try {
      const summary = await summarizeMemo(memo.content);

      // 생성된 요약을 데이터베이스에 저장
      const [updatedMemo] = await db
        .update(memos)
        .set({
          aiSummary: summary,
          updatedAt: new Date(),
        })
        .where(eq(memos.id, id))
        .returning();

      // 보안 헤더와 함께 응답
      const responseHeaders = new Headers({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-RateLimit-Limit': '20', // 요약은 제한적으로 허용
        'X-RateLimit-Remaining': '19',
      });

      return new Response(
        JSON.stringify({
          success: true,
          summary,
          memoId: id,
          originalLength: memo.content.length,
          summaryLength: summary.length,
          updatedAt: updatedMemo.updatedAt,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(responseHeaders.entries()),
          },
        }
      );
    } catch (claudeError) {
      console.error('Claude API 요약 오류:', claudeError);
      return createBadRequestResponse(
        'AI 요약 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
  } catch (error) {
    console.error('메모 요약 API 오류:', error);
    return createBadRequestResponse('메모 요약 생성 중 오류가 발생했습니다.');
  }
}

/**
 * GET /api/memos/[id]/summarize
 * 저장된 메모 요약 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // 보안 로깅
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    console.log(
      `Memo Summary GET Request - IP: ${clientIP}, Timestamp: ${new Date().toISOString()}`
    );

    const user = await getAuthenticatedUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;

    // ID 검증
    const idValidation = uuidParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return createBadRequestResponse(
        formatValidationErrors(idValidation.error)
      );
    }

    // 메모 조회 (요약 포함)
    const [memo] = await db
      .select({
        id: memos.id,
        title: memos.title,
        content: memos.content,
        aiSummary: memos.aiSummary,
        updatedAt: memos.updatedAt,
        userId: memos.userId,
      })
      .from(memos)
      .where(eq(memos.id, id))
      .limit(1);

    if (!memo) {
      return createNotFoundResponse('메모를 찾을 수 없습니다.');
    }

    // 소유권 확인
    if (!checkOwnership(user.id, memo.userId)) {
      return createUnauthorizedResponse();
    }

    // 보안 헤더와 함께 응답
    const responseHeaders = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
    });

    return new Response(
      JSON.stringify({
        success: true,
        memoId: id,
        title: memo.title,
        summary: memo.aiSummary,
        hasSummary: !!memo.aiSummary,
        originalLength: memo.content ? memo.content.length : 0,
        summaryLength: memo.aiSummary ? memo.aiSummary.length : 0,
        lastUpdated: memo.updatedAt,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(responseHeaders.entries()),
        },
      }
    );
  } catch (error) {
    console.error('메모 요약 조회 오류:', error);
    return createBadRequestResponse(
      '메모 요약을 조회하는 중 오류가 발생했습니다.'
    );
  }
}
