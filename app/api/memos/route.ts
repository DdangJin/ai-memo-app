import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db, memos, NewMemo } from '@/lib/db';
import {
  withAuth,
  createSuccessResponse,
  createBadRequestResponse,
  AuthenticatedRequest,
} from '@/lib/auth/middleware';
import {
  createMemoSchema,
  paginationSchema,
  formatValidationErrors,
} from '@/lib/validation/memo';
import { classifyMemo } from '@/lib/anthropic';

/**
 * GET /api/memos
 * 인증된 사용자의 모든 메모를 조회
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // 쿼리 매개변수 검증
    const queryValidation = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!queryValidation.success) {
      return createBadRequestResponse(
        formatValidationErrors(queryValidation.error)
      );
    }

    const { page, limit } = queryValidation.data;
    const offset = (page - 1) * limit;

    // 사용자의 메모 조회 (최신순 정렬)
    const userMemos = await db
      .select()
      .from(memos)
      .where(eq(memos.userId, req.user.id))
      .orderBy(desc(memos.createdAt))
      .limit(limit)
      .offset(offset);

    // 총 개수 조회
    const totalResult = await db
      .select({ count: memos.id })
      .from(memos)
      .where(eq(memos.userId, req.user.id));

    const total = totalResult.length;

    // 요약 상태 정보 추가
    const memosWithSummaryInfo = userMemos.map(memo => ({
      ...memo,
      hasSummary: !!memo.aiSummary,
      summaryLength: memo.aiSummary ? memo.aiSummary.length : 0,
      canSummarize: !!memo.content && memo.content.trim().length > 0,
    }));

    return createSuccessResponse({
      memos: memosWithSummaryInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return createBadRequestResponse('메모를 조회하는 중 오류가 발생했습니다.');
  }
});

/**
 * POST /api/memos
 * 새 메모 생성
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    // 요청 데이터 검증
    const validation = createMemoSchema.safeParse(body);

    if (!validation.success) {
      return createBadRequestResponse(formatValidationErrors(validation.error));
    }

    const { title, content, categoryId, voiceUrl, durationSeconds } =
      validation.data;

    // 새 메모 데이터 준비
    const newMemoData: NewMemo = {
      userId: req.user.id,
      title,
      content: content || null,
      categoryId: categoryId || null,
      voiceUrl: voiceUrl || null,
      durationSeconds: durationSeconds || null,
      isArchived: false,
      isFavorite: false,
    };

    // 메모 생성
    const [createdMemo] = await db
      .insert(memos)
      .values(newMemoData)
      .returning();

    // Context7 베스트 프랙티스: 자동 카테고리 분류 (비동기)
    // 백그라운드에서 실행하여 응답 지연을 방지
    if (createdMemo.content && createdMemo.content.trim().length > 0) {
      // 자동 분류를 백그라운드에서 실행 (Promise 체인으로 에러 핸들링)
      classifyMemo(createdMemo.content)
        .then(async classification => {
          try {
            await db
              .update(memos)
              .set({
                category: classification.category,
                updatedAt: new Date(),
              })
              .where(eq(memos.id, createdMemo.id));

            console.log(
              `[AUTO-CLASSIFY] Memo ${createdMemo.id} classified as: ${classification.category} (confidence: ${classification.confidence})`
            );
          } catch (updateError) {
            console.error(
              `[AUTO-CLASSIFY] Failed to update memo ${createdMemo.id}:`,
              updateError
            );
          }
        })
        .catch(classifyError => {
          console.error(
            `[AUTO-CLASSIFY] Failed to classify memo ${createdMemo.id}:`,
            classifyError
          );
        });
    }

    return createSuccessResponse(
      {
        ...createdMemo,
        // 메타데이터 추가
        hasSummary: false,
        summaryLength: 0,
        canSummarize:
          !!createdMemo.content && createdMemo.content.trim().length > 0,
        hasClassification: false, // 백그라운드에서 처리되므로 초기값은 false
        canClassify:
          !!createdMemo.content && createdMemo.content.trim().length > 0,
      },
      201
    );
  } catch (error) {
    console.error('메모 생성 오류:', error);
    return createBadRequestResponse('메모를 생성하는 중 오류가 발생했습니다.');
  }
});
