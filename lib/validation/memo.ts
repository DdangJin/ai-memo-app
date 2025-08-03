import { z } from 'zod';

/**
 * 메모 생성 요청 검증 스키마
 */
export const createMemoSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수입니다.')
    .max(200, '제목은 200자를 초과할 수 없습니다.')
    .trim(),
  content: z.string().optional().nullable(),
  categoryId: z
    .string()
    .uuid('유효한 카테고리 ID가 아닙니다.')
    .optional()
    .nullable(),
  voiceUrl: z.string().url('유효한 URL이 아닙니다.').optional().nullable(),
  durationSeconds: z
    .number()
    .positive('재생 시간은 0보다 커야 합니다.')
    .optional()
    .nullable(),
});

/**
 * 메모 수정 요청 검증 스키마
 */
export const updateMemoSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수입니다.')
    .max(200, '제목은 200자를 초과할 수 없습니다.')
    .trim()
    .optional(),
  content: z.string().optional().nullable(),
  categoryId: z
    .string()
    .uuid('유효한 카테고리 ID가 아닙니다.')
    .optional()
    .nullable(),
  isArchived: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

/**
 * UUID 매개변수 검증 스키마
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('유효한 메모 ID가 아닙니다.'),
});

/**
 * 페이지네이션 쿼리 매개변수 검증 스키마
 * robust input validation with preprocess
 */
export const paginationSchema = z.object({
  page: z.preprocess(
    val => {
      // null, undefined, 빈 문자열 처리
      if (val === null || val === undefined || val === '') return 1;
      // 숫자 문자열 변환
      const parsed = Number(val);
      return isNaN(parsed) || parsed < 1 ? 1 : Math.floor(parsed);
    },
    z.number().int().min(1, '페이지는 1 이상이어야 합니다.')
  ),
  limit: z.preprocess(
    val => {
      // null, undefined, 빈 문자열 처리
      if (val === null || val === undefined || val === '') return 10;
      // 숫자 문자열 변환
      const parsed = Number(val);
      return isNaN(parsed) || parsed < 1 || parsed > 50
        ? 10
        : Math.floor(parsed);
    },
    z
      .number()
      .int()
      .min(1, '리밋은 1 이상이어야 합니다.')
      .max(50, '리밋은 50 이하여야 합니다.')
  ),
});

// 타입 추론
export type CreateMemoInput = z.infer<typeof createMemoSchema>;
export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * 검증 오류를 처리하는 유틸리티 함수
 */
export function formatValidationErrors(error: z.ZodError): string {
  return error.issues
    .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
}
