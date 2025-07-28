# 메모 API 문서

Memora 애플리케이션의 메모 관리 API 엔드포인트에 대한 상세 문서입니다.

## 인증

모든 API 엔드포인트는 **Supabase Auth를 통한 인증이 필요**합니다.

- **인증 방법**: 세션 기반 인증 (쿠키)
- **Authorization**: Supabase Auth 세션을 통해 자동으로 처리
- **접근 제어**: 사용자는 자신의 메모에만 접근 가능

## 기본 응답 형식

### 성공 응답

```json
{
  "data": { ... },
  "success": true
}
```

### 오류 응답

```json
{
  "error": "오류 메시지",
  "code": "ERROR_CODE"
}
```

## 엔드포인트

### 1. 메모 목록 조회

**GET** `/api/memos`

인증된 사용자의 모든 메모를 페이지네이션과 함께 조회합니다.

#### Query Parameters

| 매개변수 | 타입   | 필수 | 기본값 | 설명                    |
| -------- | ------ | ---- | ------ | ----------------------- |
| `page`   | number | ❌   | 1      | 페이지 번호 (1 이상)    |
| `limit`  | number | ❌   | 10     | 페이지당 항목 수 (1-50) |

#### 성공 응답 (200)

```json
{
  "data": {
    "memos": [
      {
        "id": "uuid",
        "userId": "uuid",
        "title": "메모 제목",
        "content": "메모 내용",
        "voiceUrl": "https://example.com/audio.mp3",
        "durationSeconds": 30,
        "categoryId": "uuid",
        "isArchived": false,
        "isFavorite": true,
        "aiSummary": "AI 요약",
        "aiTags": ["태그1", "태그2"],
        "metadata": {},
        "createdAt": "2025-07-28T12:00:00Z",
        "updatedAt": "2025-07-28T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "success": true
}
```

#### 오류 응답

- **401 Unauthorized**: 인증되지 않은 사용자
- **400 Bad Request**: 잘못된 쿼리 매개변수

---

### 2. 새 메모 생성

**POST** `/api/memos`

새로운 메모를 생성합니다.

#### Request Body

```json
{
  "title": "메모 제목",
  "content": "메모 내용 (선택사항)",
  "categoryId": "uuid (선택사항)",
  "voiceUrl": "https://example.com/audio.mp3 (선택사항)",
  "durationSeconds": 30
}
```

#### 유효성 검사 규칙

| 필드              | 규칙                      |
| ----------------- | ------------------------- |
| `title`           | **필수**, 1-200자, 문자열 |
| `content`         | 선택사항, 문자열          |
| `categoryId`      | 선택사항, 유효한 UUID     |
| `voiceUrl`        | 선택사항, 유효한 URL      |
| `durationSeconds` | 선택사항, 양수            |

#### 성공 응답 (201)

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "메모 제목",
    "content": "메모 내용",
    "voiceUrl": "https://example.com/audio.mp3",
    "durationSeconds": 30,
    "categoryId": "uuid",
    "isArchived": false,
    "isFavorite": false,
    "aiSummary": null,
    "aiTags": null,
    "metadata": {},
    "createdAt": "2025-07-28T12:00:00Z",
    "updatedAt": "2025-07-28T12:00:00Z"
  },
  "success": true
}
```

#### 오류 응답

- **401 Unauthorized**: 인증되지 않은 사용자
- **400 Bad Request**: 유효성 검사 실패

---

### 3. 특정 메모 조회

**GET** `/api/memos/{id}`

특정 메모의 상세 정보를 조회합니다.

#### Path Parameters

| 매개변수 | 타입   | 필수 | 설명        |
| -------- | ------ | ---- | ----------- |
| `id`     | string | ✅   | 메모의 UUID |

#### 성공 응답 (200)

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "메모 제목",
    "content": "메모 내용",
    "voiceUrl": "https://example.com/audio.mp3",
    "durationSeconds": 30,
    "categoryId": "uuid",
    "isArchived": false,
    "isFavorite": true,
    "aiSummary": "AI 요약",
    "aiTags": ["태그1", "태그2"],
    "metadata": {},
    "createdAt": "2025-07-28T12:00:00Z",
    "updatedAt": "2025-07-28T12:00:00Z"
  },
  "success": true
}
```

#### 오류 응답

- **401 Unauthorized**: 인증되지 않은 사용자
- **403 Forbidden**: 다른 사용자의 메모에 접근 시도
- **404 Not Found**: 메모를 찾을 수 없음
- **400 Bad Request**: 잘못된 메모 ID 형식

---

### 4. 메모 수정

**PUT** `/api/memos/{id}`

기존 메모를 수정합니다.

#### Path Parameters

| 매개변수 | 타입   | 필수 | 설명        |
| -------- | ------ | ---- | ----------- |
| `id`     | string | ✅   | 메모의 UUID |

#### Request Body

```json
{
  "title": "수정된 제목 (선택사항)",
  "content": "수정된 내용 (선택사항)",
  "categoryId": "uuid (선택사항)",
  "isArchived": false,
  "isFavorite": true
}
```

#### 유효성 검사 규칙

| 필드         | 규칙                      |
| ------------ | ------------------------- |
| `title`      | 선택사항, 1-200자, 문자열 |
| `content`    | 선택사항, 문자열          |
| `categoryId` | 선택사항, 유효한 UUID     |
| `isArchived` | 선택사항, 불린            |
| `isFavorite` | 선택사항, 불린            |

#### 성공 응답 (200)

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "수정된 제목",
    "content": "수정된 내용",
    "voiceUrl": "https://example.com/audio.mp3",
    "durationSeconds": 30,
    "categoryId": "uuid",
    "isArchived": false,
    "isFavorite": true,
    "aiSummary": "AI 요약",
    "aiTags": ["태그1", "태그2"],
    "metadata": {},
    "createdAt": "2025-07-28T12:00:00Z",
    "updatedAt": "2025-07-28T12:30:00Z"
  },
  "success": true
}
```

#### 오류 응답

- **401 Unauthorized**: 인증되지 않은 사용자
- **403 Forbidden**: 다른 사용자의 메모 수정 시도
- **404 Not Found**: 메모를 찾을 수 없음
- **400 Bad Request**: 잘못된 요청 데이터 또는 메모 ID

---

### 5. 메모 삭제

**DELETE** `/api/memos/{id}`

메모를 영구적으로 삭제합니다.

#### Path Parameters

| 매개변수 | 타입   | 필수 | 설명        |
| -------- | ------ | ---- | ----------- |
| `id`     | string | ✅   | 메모의 UUID |

#### 성공 응답 (200)

```json
{
  "data": {
    "message": "메모가 성공적으로 삭제되었습니다."
  },
  "success": true
}
```

#### 오류 응답

- **401 Unauthorized**: 인증되지 않은 사용자
- **403 Forbidden**: 다른 사용자의 메모 삭제 시도
- **404 Not Found**: 메모를 찾을 수 없음
- **400 Bad Request**: 잘못된 메모 ID 형식

## HTTP 상태 코드

| 코드 | 설명          |
| ---- | ------------- |
| 200  | 성공          |
| 201  | 생성됨        |
| 400  | 잘못된 요청   |
| 401  | 인증되지 않음 |
| 403  | 권한 없음     |
| 404  | 찾을 수 없음  |
| 500  | 서버 오류     |

## 오류 코드

| 코드             | 설명                         |
| ---------------- | ---------------------------- |
| `UNAUTHORIZED`   | 인증이 필요함                |
| `FORBIDDEN`      | 리소스 접근 권한 없음        |
| `BAD_REQUEST`    | 잘못된 요청 데이터           |
| `NOT_FOUND`      | 요청한 리소스를 찾을 수 없음 |
| `INTERNAL_ERROR` | 서버 내부 오류               |

## 사용 예시

### cURL 예시

```bash
# 메모 목록 조회
curl -X GET "http://localhost:3000/api/memos?page=1&limit=5" \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN"

# 새 메모 생성
curl -X POST "http://localhost:3000/api/memos" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "새 메모",
    "content": "메모 내용입니다."
  }'

# 메모 수정
curl -X PUT "http://localhost:3000/api/memos/uuid-here" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "수정된 제목",
    "isFavorite": true
  }'

# 메모 삭제
curl -X DELETE "http://localhost:3000/api/memos/uuid-here" \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN"
```

### JavaScript/TypeScript 예시

```typescript
// 메모 목록 조회
const getMemos = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/memos?page=${page}&limit=${limit}`, {
    credentials: 'include',
  });
  return response.json();
};

// 새 메모 생성
const createMemo = async (memo: { title: string; content?: string }) => {
  const response = await fetch('/api/memos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(memo),
  });
  return response.json();
};

// 메모 수정
const updateMemo = async (id: string, updates: Partial<Memo>) => {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return response.json();
};

// 메모 삭제
const deleteMemo = async (id: string) => {
  const response = await fetch(`/api/memos/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
};
```

## 참고사항

1. **인증**: 모든 요청에서 Supabase Auth 세션이 유효해야 합니다.
2. **소유권**: 사용자는 자신이 생성한 메모에만 접근할 수 있습니다.
3. **페이지네이션**: 메모 목록 조회 시 페이지네이션이 자동으로 적용됩니다.
4. **유효성 검사**: 모든 입력 데이터는 Zod 스키마를 통해 검증됩니다.
5. **오류 처리**: 모든 오류는 표준화된 형식으로 반환됩니다.
