# Supabase Database Timeout Configuration

## 문제 해결

npm 서버 재시작 후 정상화된 timeout 문제의 원인과 해결책

## 1. 클라이언트 측 연결 설정 (lib/db/index.ts)

```typescript
const client = postgres(databaseUrl, {
  // 연결 타임아웃 설정
  connect_timeout: 30, // 연결 시도 타임아웃: 30초
  idle_timeout: 20, // 유휴 연결 타임아웃: 20초
  max_lifetime: 60 * 30, // 연결 최대 수명: 30분
  // 연결 풀 설정
  max: 10, // 최대 연결 수
  // 준비된 문 비활성화 (Supabase 권장)
  prepare: false,
});
```

## 2. DATABASE_URL 파라미터 설정

### Session Mode (일반 연결)

```text
postgres://postgres.project:[password]@aws-0-region.pooler.supabase.com:5432/postgres?connect_timeout=30&pool_timeout=30
```

### Transaction Mode (서버리스 환경)

```text
postgres://postgres.project:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30&pool_timeout=30&connection_limit=1
```

## 3. PostgreSQL 세션 레벨 설정

```sql
-- 사용자 역할별 timeout 설정
ALTER ROLE authenticated SET statement_timeout = '10min';
ALTER ROLE anon SET statement_timeout = '5min';
ALTER ROLE service_role SET statement_timeout = '15min';

-- PostgREST 설정 재로드
NOTIFY pgrst, 'reload config';
```

## 4. 주요 Timeout 파라미터들

| 파라미터            | 설명                  | 권장값 |
| ------------------- | --------------------- | ------ |
| `connect_timeout`   | 연결 시도 타임아웃    | 30초   |
| `pool_timeout`      | 연결 풀 대기 타임아웃 | 30초   |
| `statement_timeout` | SQL 문 실행 타임아웃  | 10분   |
| `idle_timeout`      | 유휴 연결 타임아웃    | 20초   |
| `max_lifetime`      | 연결 최대 수명        | 30분   |

## 5. 서버 재시작이 필요한 이유

- **연결 풀 초기화**: 기존 연결들이 새로운 설정으로 재생성
- **메모리 정리**: 누적된 연결 상태 초기화
- **설정 적용**: 환경 변수 변경사항 반영

## 5.1. Session Pooler 연결 시간 제한

### 🔍 **Session Pooler의 특성:**

- **Session Mode (5432)**: 클라이언트당 전용 DB 연결, 세션 전체 동안 유지
- **Transaction Mode (6543)**: 쿼리 실행 시에만 연결, 완료 후 즉시 해제

### ⚠️ **연결 끊김 문제:**

- Session Pooler는 **일정 시간 후 자동으로 연결을 종료**할 수 있음
- 기본적으로 **연결 재시도 메커니즘이 없음**
- Long-running 애플리케이션에서 연결이 끊어진 후 복구되지 않음

### 🛠️ **해결책:**

1. **Keepalive 설정**: TCP 레벨에서 연결 유지
2. **연결 재시도 로직**: 자동 재연결 메커니즘
3. **적절한 timeout 설정**: 너무 짧지 않은 연결 수명

```typescript
// lib/db/index.ts 설정 예시
const client = postgres(databaseUrl, {
  max_lifetime: 60 * 30, // 30분 연결 수명
  connection: {
    keepalive: true,
    keepalive_initial_delay_secs: 60,
  },
});
```

### 📊 **Supavisor 연결 제한:**

| 데이터베이스 크기 | default_pool_size | max_connections | default_max_clients |
| ----------------- | ----------------- | --------------- | ------------------- |
| Micro             | 15                | 60              | 200                 |
| Small             | 15                | 90              | 400                 |
| Medium            | 15                | 120             | 600                 |
| Large             | 20                | 160             | 800                 |

## 6. 모니터링 쿼리

```sql
-- 현재 timeout 설정 확인
SHOW statement_timeout;

-- 역할별 설정 확인
SELECT rolname, rolconfig FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'service_role');

-- 활성 연결 상태 확인
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
```

## 7. 추가 최적화 옵션

```typescript
// Supabase 클라이언트 옵션
const options = ClientOptions({
  function_client_timeout: 15, // Edge Functions 타임아웃
});

// SQLAlchemy의 경우
engine = create_engine(url, (pool_size = 20), (max_overflow = 15));
```
