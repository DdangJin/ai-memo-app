import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, memos } from '@/lib/db';
import {
  createSuccessResponse,
  createBadRequestResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  checkOwnership,
} from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import {
  updateMemoSchema,
  uuidParamSchema,
  formatValidationErrors,
} from '@/lib/validation/memo';
import { classifyMemo } from '@/lib/anthropic';

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
 * GET /api/memos/[id]
 * 특정 메모 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
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

    // 요약 상태 정보 추가
    const memoWithSummaryInfo = {
      ...memo,
      hasSummary: !!memo.aiSummary,
      summaryLength: memo.aiSummary ? memo.aiSummary.length : 0,
      canSummarize: !!memo.content && memo.content.trim().length > 0,
    };

    return createSuccessResponse(memoWithSummaryInfo);
  } catch (error) {
    console.error('메모 조회 오류:', error);
    return createBadRequestResponse('메모를 조회하는 중 오류가 발생했습니다.');
  }
}

/**
 * PUT /api/memos/[id]
 * 메모 수정
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;
    const body = await req.json();

    // ID 검증
    const idValidation = uuidParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return createBadRequestResponse(
        formatValidationErrors(idValidation.error)
      );
    }

    // 요청 데이터 검증
    const validation = updateMemoSchema.safeParse(body);
    if (!validation.success) {
      return createBadRequestResponse(formatValidationErrors(validation.error));
    }

    // 기존 메모 조회
    const [existingMemo] = await db
      .select()
      .from(memos)
      .where(eq(memos.id, id))
      .limit(1);

    if (!existingMemo) {
      return createNotFoundResponse('메모를 찾을 수 없습니다.');
    }

    // 소유권 확인
    if (!checkOwnership(user.id, existingMemo.userId)) {
      return createUnauthorizedResponse();
    }

    // 검증된 데이터 사용
    const { title, content, categoryId, isArchived, isFavorite } =
      validation.data;

    // 업데이트 데이터 준비
    const updateData: Partial<typeof memos.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content || null;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);
    if (isFavorite !== undefined) updateData.isFavorite = Boolean(isFavorite);

    // 메모 업데이트
    const [updatedMemo] = await db
      .update(memos)
      .set(updateData)
      .where(eq(memos.id, id))
      .returning();

    // Context7 베스트 프랙티스: 내용이 변경된 경우 자동 재분류 (비동기)
    // 기존 내용과 다르고, 내용이 비어있지 않은 경우에만 실행
    if (
      content !== undefined &&
      updatedMemo.content &&
      updatedMemo.content.trim().length > 0 &&
      updatedMemo.content !== existingMemo.content
    ) {
      // 자동 재분류를 백그라운드에서 실행
      classifyMemo(updatedMemo.content)
        .then(async classification => {
          try {
            await db
              .update(memos)
              .set({
                category: classification.category,
                updatedAt: new Date(),
              })
              .where(eq(memos.id, updatedMemo.id));

            console.log(
              `[AUTO-RECLASSIFY] Memo ${updatedMemo.id} reclassified as: ${classification.category} (confidence: ${classification.confidence})`
            );
          } catch (updateError) {
            console.error(
              `[AUTO-RECLASSIFY] Failed to update memo ${updatedMemo.id}:`,
              updateError
            );
          }
        })
        .catch(classifyError => {
          console.error(
            `[AUTO-RECLASSIFY] Failed to classify memo ${updatedMemo.id}:`,
            classifyError
          );
        });
    }

    return createSuccessResponse({
      ...updatedMemo,
      // 메타데이터 추가
      hasSummary: !!updatedMemo.aiSummary,
      summaryLength: updatedMemo.aiSummary ? updatedMemo.aiSummary.length : 0,
      canSummarize:
        !!updatedMemo.content && updatedMemo.content.trim().length > 0,
      hasClassification: !!updatedMemo.category,
      canClassify:
        !!updatedMemo.content && updatedMemo.content.trim().length > 0,
    });
  } catch (error) {
    console.error('메모 수정 오류:', error);
    return createBadRequestResponse('메모를 수정하는 중 오류가 발생했습니다.');
  }
}

/**
 * DELETE /api/memos/[id]
 * 메모 삭제
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
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

    // 기존 메모 조회
    const [existingMemo] = await db
      .select()
      .from(memos)
      .where(eq(memos.id, id))
      .limit(1);

    if (!existingMemo) {
      return createNotFoundResponse('메모를 찾을 수 없습니다.');
    }

    // 소유권 확인
    if (!checkOwnership(user.id, existingMemo.userId)) {
      return createUnauthorizedResponse();
    }

    // 메모 삭제
    await db.delete(memos).where(eq(memos.id, id));

    return createSuccessResponse({
      message: '메모가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('메모 삭제 오류:', error);
    return createBadRequestResponse('메모를 삭제하는 중 오류가 발생했습니다.');
  }
}
