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
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => {
      const parsed = parseInt(val || '1');
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),
  limit: z
    .string()
    .optional()
    .transform(val => {
      const parsed = parseInt(val || '10');
      return isNaN(parsed) || parsed < 1 || parsed > 50 ? 10 : parsed;
    }),
});

// 타입 추론
export type CreateMemoInput = z.infer<typeof createMemoSchema>;
export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * 검증 오류를 처리하는 유틸리티 함수
 */
export function formatValidationErrors(error: z.ZodError<any>): string {
  return error.issues
    .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
}
