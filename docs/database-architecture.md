# 📊 Memora Database Architecture

## 🏗️ Overview

Memora는 Supabase PostgreSQL 데이터베이스를 기반으로 하며, Drizzle ORM을 통해 타입 안전한 데이터베이스 상호작용을 제공합니다.

## 🗄️ Database Schema

### Core Tables

#### 1. `auth.users` (Supabase Auth)

Supabase Auth의 기본 사용자 테이블입니다.

**Key Fields:**

- `id` (UUID, Primary Key)
- `email` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. `public.profiles`

사용자 프로필 정보를 저장합니다.

**Fields:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, FK → auth.users.id)
- `username` (VARCHAR(100), Unique)
- `full_name` (VARCHAR(100))
- `avatar_url` (TEXT)
- `bio` (TEXT)
- `preferences` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. `public.categories`

메모 카테고리를 관리합니다. 계층 구조를 지원합니다.

**Fields:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, FK → auth.users.id)
- `name` (VARCHAR(100), NOT NULL)
- `description` (TEXT)
- `color` (VARCHAR(7), Default: '#3B82F6')
- `parent_id` (UUID, FK → categories.id, Self-referencing)
- `sort_order` (INTEGER, Default: 0)
- `is_default` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 4. `public.tags`

메모 태그를 관리합니다.

**Fields:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, FK → auth.users.id)
- `name` (VARCHAR(50), NOT NULL)
- `color` (VARCHAR(7), Default: '#6B7280')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 5. `public.memos`

메모 데이터를 저장합니다. 음성 녹음, AI 요약, 메타데이터를 포함합니다.

**Fields:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, FK → auth.users.id)
- `title` (VARCHAR(200), NOT NULL)
- `content` (TEXT)
- `voice_url` (TEXT, Supabase Storage URL)
- `duration_seconds` (INTEGER)
- `category_id` (UUID, FK → categories.id)
- `is_archived` (BOOLEAN, Default: false)
- `is_favorite` (BOOLEAN, Default: false)
- `ai_summary` (TEXT)
- `ai_tags` (TEXT[])
- `metadata` (JSONB, Default: '{}')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 6. `public.memo_tags`

메모와 태그 간의 다대다 관계를 관리합니다.

**Fields:**

- `id` (UUID, Primary Key)
- `memo_id` (UUID, FK → memos.id)
- `tag_id` (UUID, FK → tags.id)
- `created_at` (TIMESTAMP)

## 🔗 Relationships

### One-to-One

- `profiles.user_id` → `auth.users.id`

### One-to-Many

- `auth.users.id` → `categories.user_id`
- `auth.users.id` → `tags.user_id`
- `auth.users.id` → `memos.user_id`
- `categories.id` → `memos.category_id`
- `categories.id` → `categories.parent_id` (Self-referencing)

### Many-to-Many

- `memos` ↔ `tags` (via `memo_tags`)

## 🛠️ Drizzle ORM Configuration

### Setup

```bash
# Install dependencies
npm install drizzle-orm @supabase/supabase-js postgres
npm install -D drizzle-kit

# Generate migrations
npm run db:generate

# Push schema changes
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database URL for Drizzle ORM
DATABASE_URL=your_database_url
```

### Usage Example

```typescript
import { db } from '@/lib/db';
import { memos, categories, tags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Get user's memos
const userMemos = await db.select().from(memos).where(eq(memos.userId, userId));

// Get memo with category and tags
const memoWithRelations = await db
  .select({
    memo: memos,
    category: categories,
    tags: tags,
  })
  .from(memos)
  .leftJoin(categories, eq(memos.categoryId, categories.id))
  .leftJoin(memoTags, eq(memos.id, memoTags.memoId))
  .leftJoin(tags, eq(memoTags.tagId, tags.id))
  .where(eq(memos.id, memoId));
```

## 🔐 Row Level Security (RLS)

모든 public 테이블에 RLS가 활성화되어 있으며, 사용자는 자신의 데이터만 접근할 수 있습니다.

### RLS Policies

- `profiles`: 사용자는 자신의 프로필만 읽기/쓰기 가능
- `categories`: 사용자는 자신의 카테고리만 관리 가능
- `tags`: 사용자는 자신의 태그만 관리 가능
- `memos`: 사용자는 자신의 메모만 관리 가능
- `memo_tags`: 사용자는 자신의 메모에 연결된 태그만 관리 가능

## 📈 Performance Considerations

### Indexes

- `user_id` 컬럼에 인덱스 생성
- `created_at` 컬럼에 인덱스 생성 (정렬 최적화)
- `title` 컬럼에 Full-Text Search 인덱스

### Query Optimization

- 필요한 컬럼만 선택하여 네트워크 트래픽 최소화
- 페이지네이션을 통한 대용량 데이터 처리
- 적절한 JOIN 사용으로 N+1 문제 방지

## 🔄 Migration Strategy

### Development

1. 스키마 변경사항을 `lib/db/schema.ts`에 반영
2. `npm run db:generate`로 마이그레이션 파일 생성
3. `npm run db:push`로 변경사항 적용

### Production

1. 마이그레이션 파일을 버전 관리에 포함
2. CI/CD 파이프라인에서 자동 마이그레이션 실행
3. 롤백 전략 준비

## 🧪 Testing

### Unit Tests

```typescript
import { db } from '@/lib/db';
import { memos } from '@/lib/db/schema';

describe('Memo CRUD Operations', () => {
  it('should create a new memo', async () => {
    const newMemo = await db.insert(memos).values({
      userId: 'test-user-id',
      title: 'Test Memo',
      content: 'Test content',
    });

    expect(newMemo).toBeDefined();
  });
});
```

### Integration Tests

- 실제 데이터베이스 연결 테스트
- RLS 정책 검증
- 트랜잭션 처리 테스트

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
