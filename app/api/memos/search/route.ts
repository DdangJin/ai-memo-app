import { NextRequest } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import { db, memos, withRetry } from '@/lib/db';
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
  category: z.string().optional(), // 카테고리 필터링
  hasAiSummary: z.coerce.boolean().optional(), // AI 요약 존재 여부
  sortBy: z.enum(['relevance', 'created', 'updated']).default('relevance'),
});

// POST 검색을 위한 고급 검색 스키마
const advancedSearchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z
    .object({
      categories: z.array(z.string()).optional(),
      dateRange: z
        .object({
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .optional(),
      hasAiSummary: z.boolean().optional(),
      hasAiClassification: z.boolean().optional(),
      contentLength: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  sort: z
    .object({
      field: z.enum(['relevance', 'created', 'updated']),
      order: z.enum(['asc', 'desc']).default('desc'),
    })
    .default({ field: 'relevance', order: 'desc' }),
  pagination: z
    .object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    })
    .default({ page: 1, limit: 10 }),
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
      category: searchParams.get('category'),
      hasAiSummary: searchParams.get('hasAiSummary'),
      sortBy: searchParams.get('sortBy'),
    });

    if (!queryValidation.success) {
      return createBadRequestResponse(
        queryValidation.error.issues.map(err => err.message).join(', ')
      );
    }

    const {
      q: query,
      page,
      limit,
      category,
      hasAiSummary,
      sortBy,
    } = queryValidation.data;
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

    // Stop word 여부 확인 (PostgreSQL에서 직접 체크)
    let isStopWordQuery = false;
    try {
      const stopWordCheck = await withRetry(() =>
        db.execute(
          sql`SELECT to_tsquery('english', ${processedQuery}) as result`
        )
      );
      const tsqueryResult = stopWordCheck[0]?.result;
      // to_tsquery 결과가 null이거나 빈 문자열이면 stop word
      isStopWordQuery =
        !tsqueryResult || tsqueryResult.toString().trim() === '';
    } catch {
      // 에러가 발생하면 stop word일 가능성이 높음
      isStopWordQuery = true;
    }

    // Stop word인 경우 바로 빈 결과 반환
    if (isStopWordQuery) {
      return createSuccessResponse({
        memos: [],
        query,
        isStopWordQuery: true,
        stopWordMessage:
          '검색하신 단어는 일반적인 단어로 검색에서 제외됩니다. 더 구체적인 키워드를 사용해보세요.',
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // 추가 필터링 조건 구성
    let whereCondition = sql`${memos.userId} = ${req.user.id} AND ${memos.fts} @@ to_tsquery('english', ${processedQuery})`;

    if (category) {
      whereCondition = sql`${whereCondition} AND ${memos.category} = ${category}`;
    }

    if (hasAiSummary !== undefined) {
      if (hasAiSummary) {
        whereCondition = sql`${whereCondition} AND ${memos.aiSummary} IS NOT NULL AND ${memos.aiSummary} != ''`;
      } else {
        whereCondition = sql`${whereCondition} AND (${memos.aiSummary} IS NULL OR ${memos.aiSummary} = '')`;
      }
    }

    // 정렬 조건 설정
    let orderByClause;
    switch (sortBy) {
      case 'created':
        orderByClause = [desc(memos.createdAt)];
        break;
      case 'updated':
        orderByClause = [desc(memos.updatedAt)];
        break;
      case 'relevance':
      default:
        orderByClause = [
          sql`ts_rank_cd(${memos.fts}, to_tsquery('english', ${processedQuery})) DESC`,
          desc(memos.createdAt),
        ];
        break;
    }

    // PostgreSQL 전문 검색 쿼리 실행
    // fts 컬럼을 사용하여 검색하고 사용자 필터링 적용
    const searchResults = await withRetry(() =>
      db
        .select()
        .from(memos)
        .where(whereCondition)
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset)
    );

    // 총 검색 결과 개수 조회 (동일한 조건 적용)
    const countResult = await withRetry(() =>
      db
        .select({ count: sql<number>`count(*)` })
        .from(memos)
        .where(whereCondition)
    );

    const total = countResult[0]?.count || 0;

    // 요약 상태 정보 추가
    const searchResultsWithSummaryInfo = searchResults.map(memo => ({
      ...memo,
      hasSummary: !!memo.aiSummary,
      summaryLength: memo.aiSummary ? memo.aiSummary.length : 0,
      canSummarize: !!memo.content && memo.content.trim().length > 0,
    }));

    return createSuccessResponse({
      memos: searchResultsWithSummaryInfo,
      query,
      isStopWordQuery: false, // 정상 검색인 경우
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

/**
 * POST /api/memos/search
 * 고급 검색 기능 - 복합 필터, 날짜 범위, 정렬 옵션 등을 지원
 */
export const POST = withAuth(
  async (req: AuthenticatedRequest & NextRequest) => {
    try {
      const body = await req.json();

      // 요청 본문 검증
      const validation = advancedSearchSchema.safeParse(body);
      if (!validation.success) {
        return createBadRequestResponse(
          validation.error.issues
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
        );
      }

      const { query, filters = {}, sort, pagination } = validation.data;
      const offset = (pagination.page - 1) * pagination.limit;

      // 빈 검색어 처리
      if (!query.trim()) {
        return createSuccessResponse({
          memos: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            totalPages: 0,
          },
          appliedFilters: filters,
        });
      }

      // 검색어 전처리
      const processedQuery = query
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => word.replace(/[^\w가-힣]/g, ''))
        .filter(word => word.length > 0)
        .join(' | ');

      if (!processedQuery) {
        return createSuccessResponse({
          memos: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            totalPages: 0,
          },
          appliedFilters: filters,
        });
      }

      // 기본 검색 조건
      let whereCondition = sql`${memos.userId} = ${req.user.id} AND ${memos.fts} @@ to_tsquery('english', ${processedQuery})`;

      // 카테고리 필터
      if (filters.categories && filters.categories.length > 0) {
        if (filters.categories.length === 1) {
          whereCondition = sql`${whereCondition} AND ${eq(memos.category, filters.categories[0])}`;
        } else {
          const categoryCondition = sql`${memos.category} IN ${filters.categories}`;
          whereCondition = sql`${whereCondition} AND ${categoryCondition}`;
        }
      }

      // AI 요약 필터
      if (filters.hasAiSummary !== undefined) {
        if (filters.hasAiSummary) {
          whereCondition = sql`${whereCondition} AND ${memos.aiSummary} IS NOT NULL AND ${memos.aiSummary} != ''`;
        } else {
          whereCondition = sql`${whereCondition} AND (${memos.aiSummary} IS NULL OR ${memos.aiSummary} = '')`;
        }
      }

      // AI 분류 필터
      if (filters.hasAiClassification !== undefined) {
        if (filters.hasAiClassification) {
          whereCondition = sql`${whereCondition} AND ${memos.category} IS NOT NULL AND ${memos.category} != ''`;
        } else {
          whereCondition = sql`${whereCondition} AND (${memos.category} IS NULL OR ${memos.category} = '')`;
        }
      }

      // 날짜 범위 필터
      if (filters.dateRange) {
        if (filters.dateRange.from) {
          whereCondition = sql`${whereCondition} AND ${memos.createdAt} >= ${new Date(filters.dateRange.from)}`;
        }
        if (filters.dateRange.to) {
          whereCondition = sql`${whereCondition} AND ${memos.createdAt} <= ${new Date(filters.dateRange.to)}`;
        }
      }

      // 콘텐츠 길이 필터
      if (filters.contentLength) {
        if (filters.contentLength.min !== undefined) {
          whereCondition = sql`${whereCondition} AND LENGTH(${memos.content}) >= ${filters.contentLength.min}`;
        }
        if (filters.contentLength.max !== undefined) {
          whereCondition = sql`${whereCondition} AND LENGTH(${memos.content}) <= ${filters.contentLength.max}`;
        }
      }

      // 정렬 조건 설정
      let orderByClause;
      switch (sort.field) {
        case 'created':
          orderByClause =
            sort.order === 'asc' ? [memos.createdAt] : [desc(memos.createdAt)];
          break;
        case 'updated':
          orderByClause =
            sort.order === 'asc' ? [memos.updatedAt] : [desc(memos.updatedAt)];
          break;
        case 'relevance':
        default:
          orderByClause = [
            sql`ts_rank_cd(${memos.fts}, to_tsquery('english', ${processedQuery})) DESC`,
            desc(memos.createdAt),
          ];
          break;
      }

      // 검색 실행
      const searchResults = await withRetry(() =>
        db
          .select()
          .from(memos)
          .where(whereCondition)
          .orderBy(...orderByClause)
          .limit(pagination.limit)
          .offset(offset)
      );

      // 총 결과 개수 조회
      const countResult = await withRetry(() =>
        db
          .select({ count: sql<number>`count(*)` })
          .from(memos)
          .where(whereCondition)
      );

      const total = countResult[0]?.count || 0;

      // 요약 상태 정보 추가
      const enrichedResults = searchResults.map(memo => ({
        ...memo,
        hasSummary: !!memo.aiSummary,
        hasClassification: !!memo.category,
        summaryLength: memo.aiSummary ? memo.aiSummary.length : 0,
        canSummarize: !!memo.content && memo.content.trim().length > 0,
      }));

      return createSuccessResponse({
        memos: enrichedResults,
        query,
        appliedFilters: filters,
        sort,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      });
    } catch (error) {
      console.error('고급 메모 검색 오류:', error);

      if (
        error instanceof Error &&
        error.message.includes('syntax error in tsquery')
      ) {
        return createBadRequestResponse(
          '검색어 형식이 올바르지 않습니다. 특수문자를 제거하고 다시 시도해주세요.'
        );
      }

      return createBadRequestResponse('고급 검색 중 오류가 발생했습니다.');
    }
  }
);
