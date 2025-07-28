import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

/**
 * ⚠️ 주의: 현재 프로젝트는 Supabase MCP를 통해 마이그레이션을 관리합니다.
 *
 * 이 파일은 Drizzle ORM 마이그레이션을 위한 것이지만,
 * 실제로는 Supabase MCP의 apply_migration 기능을 사용하여
 * 데이터베이스 스키마를 관리합니다.
 *
 * lib/db/migrations/ 폴더의 SQL 파일들은 문서화 목적으로만 사용됩니다.
 */

// 환경 변수에서 데이터베이스 URL 가져오기
const connectionString = process.env.DATABASE_URL!;

// PostgreSQL 클라이언트 생성
const client = postgres(connectionString, { max: 1 });

// Drizzle 인스턴스 생성
const db = drizzle(client);

// 마이그레이션 실행
async function runMigrations() {
  try {
    console.log('🔄 Drizzle 마이그레이션을 시작합니다...');
    console.log('⚠️  참고: 실제 프로덕션에서는 Supabase MCP를 사용하세요.');

    await migrate(db, { migrationsFolder: './lib/db/migrations' });

    console.log('✅ 마이그레이션이 성공적으로 완료되었습니다!');
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다:', error);
    console.log(
      '💡 해결책: Supabase MCP를 사용하여 마이그레이션을 적용하세요.'
    );
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 스크립트가 직접 실행될 때만 마이그레이션 실행
if (require.main === module) {
  runMigrations();
}
