import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

// 환경 변수에서 Supabase 연결 정보 가져오기
const connectionString = process.env.DATABASE_URL!;

// PostgreSQL 클라이언트 생성
const client = postgres(connectionString);

// Drizzle ORM 인스턴스 생성
export const db = drizzle(client, { schema });

// 스키마 내보내기
export * from './schema';

// 쿼리 함수들 내보내기
export * from './queries';

/**
 * 데이터베이스 연결 상태 확인
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * 데이터베이스 초기화 (필요시 사용)
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // 연결 확인
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    console.log('✅ Database connection established');

    // 기본 테이블 존재 확인
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'memos')
    `);

    console.log('✅ Database tables verified:', tables);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
