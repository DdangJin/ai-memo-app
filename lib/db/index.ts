import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import * as schema from './schema';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

// Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database client for Drizzle ORM with timeout configuration
const client = postgres(databaseUrl, {
  // 연결 타임아웃 설정
  connect_timeout: 30, // 연결 시도 타임아웃: 30초
  idle_timeout: 20, // 유휴 연결 타임아웃: 20초
  max_lifetime: 60 * 30, // 연결 최대 수명: 30분

  // 연결 풀 설정
  max: 10, // 최대 연결 수

  // 준비된 문 비활성화 (Supabase 권장)
  prepare: false,

  // SSL 설정 (프로덕션에서 필요)
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,

  // 연결 재시도 설정
  connection: {
    // TCP keepalive 설정 (연결 유지)
    keepalive: true,
    keepalive_initial_delay_secs: 60,
  },

  // 개발 환경에서 알림 로깅
  onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
});
export const db = drizzle(client, { schema });

// Export schema for use in other parts of the application
export * from './schema';

// 연결 재시도 헬퍼 함수
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      // Connection timeout이나 네트워크 오류인 경우에만 재시도
      const errorObj = error as { code?: string; message?: string };
      const isRetryableError =
        errorObj?.code === 'CONNECT_TIMEOUT' ||
        errorObj?.code === 'ECONNRESET' ||
        errorObj?.code === 'ENOTFOUND' ||
        errorObj?.message?.includes('timeout') ||
        errorObj?.message?.includes('connection');

      if (!isRetryableError || attempt === maxRetries) {
        throw error;
      }

      // 지수 백오프로 대기
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(
        `연결 재시도 ${attempt}/${maxRetries}, ${delay}ms 후 재시도:`,
        errorObj.message
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Maximum retry attempts reached');
}
