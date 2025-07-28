# 데이터베이스 구조 및 사용법

## 📋 개요

이 프로젝트는 Supabase의 권장 패턴을 따라 데이터베이스를 구성했습니다.

## 🏗️ 데이터베이스 구조

### 1. auth.users (Supabase 관리)

- **역할**: 인증, 세션, JWT 토큰 처리
- **관리**: Supabase가 자동으로 관리
- **주요 필드**:
  - `id` (UUID): 사용자 고유 식별자
  - `email`: 사용자 이메일
  - `encrypted_password`: 암호화된 비밀번호

### 2. public.profiles (애플리케이션 데이터)

- **역할**: 사용자 프로필 정보 저장
- **관계**: `auth.users.id` 참조
- **주요 필드**:
  - `id` (UUID): auth.users.id 참조
  - `email`: 사용자 이메일
  - `name`: 사용자 이름
  - `avatar_url`: 프로필 이미지 URL
  - `website`: 웹사이트 URL

### 3. public.memos (사용자 데이터)

- **역할**: 사용자별 메모 데이터
- **관계**: `auth.users.id` 참조
- **주요 필드**:
  - `id` (UUID): 메모 고유 식별자
  - `user_id` (UUID): auth.users.id 참조
  - `title`: 메모 제목
  - `content`: 메모 내용
  - `category`: 메모 카테고리
  - `tags`: 메모 태그 (JSONB)

## 🔒 보안 (RLS - Row Level Security)

### Profiles 테이블 정책

- **SELECT**: 모든 사용자가 프로필을 볼 수 있음
- **INSERT**: 사용자는 자신의 프로필만 생성 가능
- **UPDATE**: 사용자는 자신의 프로필만 수정 가능

### Memos 테이블 정책

- **SELECT**: 사용자는 자신의 메모만 볼 수 있음
- **INSERT**: 사용자는 자신의 메모만 생성 가능
- **UPDATE**: 사용자는 자신의 메모만 수정 가능
- **DELETE**: 사용자는 자신의 메모만 삭제 가능

## 🔄 자동화 (Triggers)

### Auth Trigger

새 사용자가 가입할 때 자동으로 `profiles` 테이블에 레코드를 생성합니다.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📁 파일 구조

```
lib/db/
├── index.ts          # 데이터베이스 연결 및 초기화
├── schema.ts         # Drizzle ORM 스키마 정의
├── queries.ts        # 데이터베이스 쿼리 함수들
├── migrate.ts        # 마이그레이션 실행 스크립트
├── migrations/       # 마이그레이션 파일들
│   ├── 001_initial_schema.sql
│   └── 002_supabase_auth_integration.sql
└── README.md         # 이 파일
```

## 🚀 사용법

### 1. 데이터베이스 연결 확인

```typescript
import { checkDatabaseConnection } from '@/lib/db';

const isConnected = await checkDatabaseConnection();
```

### 2. 프로필 조회

```typescript
import { getProfileByUserId } from '@/lib/db';

const profile = await getProfileByUserId(userId);
```

### 3. 메모 생성

```typescript
import { createMemo } from '@/lib/db';

const newMemo = await createMemo({
  userId: 'user-uuid',
  title: '메모 제목',
  content: '메모 내용',
  category: '일반',
});
```

### 4. 사용자별 메모 조회

```typescript
import { getMemosByUserId } from '@/lib/db';

const memos = await getMemosByUserId(userId);
```

## 🔧 마이그레이션

### 마이그레이션 실행

```bash
npm run db:migrate:run
```

### 새로운 마이그레이션 생성

```bash
npm run db:generate
```

## 📝 주의사항

1. **auth.users 직접 수정 금지**: Supabase가 관리하는 테이블이므로 직접 수정하지 마세요.
2. **RLS 정책 준수**: 모든 쿼리는 RLS 정책을 준수해야 합니다.
3. **외래키 제약조건**: `profiles`와 `memos`는 `auth.users.id`를 참조합니다.
4. **CASCADE 삭제**: 사용자가 삭제되면 관련 데이터도 자동 삭제됩니다.

## 🐛 문제 해결

### 연결 문제

- `DATABASE_URL` 환경 변수 확인
- Supabase 프로젝트 설정 확인

### 권한 문제

- RLS 정책 확인
- 사용자 인증 상태 확인

### 데이터 무결성 문제

- 외래키 제약조건 확인
- Trigger 함수 확인
