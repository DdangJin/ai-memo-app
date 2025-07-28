# 메모 CRUD API 문서

## 개요

메모 관리 기능을 위한 RESTful API입니다. 모든 엔드포인트는 인증이 필요하며, 사용자는 자신의 메모만 접근할 수 있습니다.

## 인증

모든 API 요청에는 유효한 Supabase 인증 토큰이 필요합니다. 토큰은 쿠키나 헤더를 통해 전달됩니다.

## 엔드포인트

### 1. 메모 목록 조회

**GET** `/api/memos`

현재 인증된 사용자의 모든 메모를 조회합니다.

#### 응답

**성공 (200)**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "메모 제목",
      "content": "메모 내용",
      "category": "카테고리",
      "tags": ["태그1", "태그2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**실패 (401)**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 2. 메모 생성

**POST** `/api/memos`

새로운 메모를 생성합니다.

#### 요청 본문

```json
{
  "title": "메모 제목",
  "content": "메모 내용",
  "category": "카테고리 (선택사항)",
  "tags": ["태그1", "태그2"] (선택사항)
}
```

#### 응답

**성공 (201)**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "메모 제목",
    "content": "메모 내용",
    "category": "카테고리",
    "tags": ["태그1", "태그2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**실패 (400)**

```json
{
  "success": false,
  "error": "title and content are required"
}
```

**실패 (401)**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 3. 특정 메모 조회

**GET** `/api/memos/{id}`

특정 메모의 상세 정보를 조회합니다.

#### 응답

**성공 (200)**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "메모 제목",
    "content": "메모 내용",
    "category": "카테고리",
    "tags": ["태그1", "태그2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**실패 (404)**

```json
{
  "success": false,
  "error": "Memo not found"
}
```

### 4. 메모 수정

**PUT** `/api/memos/{id}`

기존 메모를 수정합니다.

#### 요청 본문

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "category": "수정된 카테고리",
  "tags": ["수정된 태그1", "수정된 태그2"]
}
```

#### 응답

**성공 (200)**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "수정된 제목",
    "content": "수정된 내용",
    "category": "수정된 카테고리",
    "tags": ["수정된 태그1", "수정된 태그2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. 메모 삭제

**DELETE** `/api/memos/{id}`

메모를 삭제합니다.

#### 응답

**성공 (200)**

```json
{
  "success": true,
  "message": "Memo deleted successfully"
}
```

**실패 (404)**

```json
{
  "success": false,
  "error": "Memo not found"
}
```

## 에러 코드

| 상태 코드 | 설명                            |
| --------- | ------------------------------- |
| 200       | 성공                            |
| 201       | 생성 성공                       |
| 400       | 잘못된 요청 (필수 필드 누락 등) |
| 401       | 인증 실패                       |
| 404       | 리소스 없음                     |
| 500       | 서버 내부 오류                  |

## 데이터 모델

### Memo

```typescript
interface Memo {
  id: string; // UUID
  userId: string; // 사용자 ID
  title: string; // 메모 제목
  content: string; // 메모 내용
  category?: string; // 카테고리 (선택사항)
  tags?: string[]; // 태그 배열 (선택사항)
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
}
```

## 보안 고려사항

1. **인증**: 모든 엔드포인트는 Supabase 인증을 통해 사용자 검증
2. **권한**: 사용자는 자신의 메모만 접근 가능
3. **입력 검증**: 필수 필드 검증 및 데이터 타입 검증
4. **SQL 인젝션 방지**: Drizzle ORM 사용으로 자동 방지
