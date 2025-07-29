import { NextRequest } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import { db, memos } from '@/lib/db';
import {
  withAuth,
  createSuccessResponse,
  createBadRequestResponse,
  AuthenticatedRequest,
} from '@/lib/auth/middleware';
import { z } from 'zod';

// 검색 쿼리 스키마
const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, '검색어를 입력해주세요.')
    .max(100, '검색어는 100자 이하여야 합니다.'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

/**
 * GET /api/memos/search?q=검색어&page=1&limit=10
 * 인증된 사용자의 메모에서 전문 검색 수행
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // 쿼리 매개변수 검증
    const queryValidation = searchQuerySchema.safeParse({
      q: searchParams.get('q'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!queryValidation.success) {
      return createBadRequestResponse(
        queryValidation.error.issues.map(err => err.message).join(', ')
      );
    }

    const { q: query, page, limit } = queryValidation.data;
    const offset = (page - 1) * limit;

    // 빈 검색어 처리
    if (!query.trim()) {
      return createSuccessResponse({
        memos: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // 검색어 전처리: 여러 단어를 OR 연산자로 연결
    const processedQuery = query
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.replace(/[^\w가-힣]/g, '')) // 특수문자 제거
      .filter(word => word.length > 0)
      .join(' | '); // OR 연산자로 연결

    if (!processedQuery) {
      return createSuccessResponse({
        memos: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // PostgreSQL 전문 검색 쿼리 실행
    // fts 컬럼을 사용하여 검색하고 사용자 필터링 적용
    const searchResults = await db
      .select()
      .from(memos)
      .where(
        sql`${memos.userId} = ${req.user.id} AND ${memos.fts} @@ to_tsquery('english', ${processedQuery})`
      )
      .orderBy(
        // 관련성 순으로 정렬 (ts_rank_cd 사용)
        sql`ts_rank_cd(${memos.fts}, to_tsquery('english', ${processedQuery})) DESC`,
        desc(memos.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // 총 검색 결과 개수 조회
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(memos)
      .where(
        sql`${memos.userId} = ${req.user.id} AND ${memos.fts} @@ to_tsquery('english', ${processedQuery})`
      );

    const total = countResult[0]?.count || 0;

    return createSuccessResponse({
      memos: searchResults,
      query,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('메모 검색 오류:', error);

    // PostgreSQL 전문 검색 오류 처리
    if (
      error instanceof Error &&
      error.message.includes('syntax error in tsquery')
    ) {
      return createBadRequestResponse(
        '검색어 형식이 올바르지 않습니다. 특수문자를 제거하고 다시 시도해주세요.'
      );
    }

    return createBadRequestResponse('메모를 검색하는 중 오류가 발생했습니다.');
  }
});
