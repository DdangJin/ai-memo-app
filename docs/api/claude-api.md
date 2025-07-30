# Claude API 통합 가이드

AI 메모 앱에서 Anthropic Claude API를 사용하여 메모 요약 및 분류 기능을 구현하는 방법을 설명합니다.

## 개요

Claude API는 다음과 같은 AI 기능을 제공합니다:

- **메모 요약**: 긴 메모 내용을 간결하게 요약
- **메모 분류**: 메모를 카테고리별로 자동 분류
- **일반 AI 메시지**: 자유로운 형태의 AI 대화

## 환경 설정

### 1. API 키 설정

`.env.local` 파일에 Anthropic API 키를 추가하세요:

```env
ANTHROPIC_API_KEY="sk-ant-api03-YOUR_API_KEY_HERE"
```

> ⚠️ **보안 주의사항**: API 키는 절대 클라이언트 사이드에 노출하지 마세요. `.env.local` 파일은 `.gitignore`에 포함되어 있습니다.

### 2. 의존성 설치

Anthropic SDK는 이미 설치되어 있습니다:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.57.0"
  }
}
```

## API 엔드포인트

### 1. 일반 메시지 (`/api/claude/message`)

일반적인 Claude AI 메시지를 처리합니다.

**요청:**

```typescript
POST /api/claude/message
Content-Type: application/json

{
  "prompt": "안녕하세요, Claude!",
  "maxTokens": 1024  // 선택적, 기본값: 1024, 최대: 4096
}
```

**응답:**

```typescript
{
  "success": true,
  "response": "안녕하세요! 무엇을 도와드릴까요?",
  "tokenLimit": 1024
}
```

### 2. 메모 요약 (`/api/claude/summarize`)

메모 내용을 요약합니다.

**요청:**

```typescript
POST /api/claude/summarize
Content-Type: application/json

{
  "content": "오늘 회의에서 논의된 내용...",
  "maxLength": 200  // 선택적, 기본값: 200자, 최대: 1000자
}
```

**응답:**

```typescript
{
  "success": true,
  "summary": "회의 핵심 내용 요약",
  "originalLength": 1500,
  "summaryLength": 180,
  "maxLength": 200
}
```

### 3. 메모 분류 (`/api/claude/classify`)

메모를 카테고리별로 분류합니다.

**요청:**

```typescript
POST /api/claude/classify
Content-Type: application/json

{
  "content": "프로젝트 계획서 작성하기"
}
```

**응답:**

```typescript
{
  "success": true,
  "category": "work",
  "categoryName": "업무",
  "contentLength": 12
}
```

**사용 가능한 카테고리:**

- `work` (업무)
- `personal` (개인)
- `study` (학습)
- `idea` (아이디어)
- `todo` (할일)
- `other` (기타)

## 클라이언트 사용법

### React Hook 예시

```typescript
import { useState } from 'react';

export function useClaude() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarizeMemo = async (content: string, maxLength?: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, maxLength }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '요약 실패';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const classifyMemo = async (content: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.category;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '분류 실패';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { summarizeMemo, classifyMemo, loading, error };
}
```

### 컴포넌트 사용 예시

```typescript
import { useClaude } from '@/hooks/useClaude';

export function MemoForm() {
  const { summarizeMemo, classifyMemo, loading } = useClaude();
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');

  const handleSummarize = async () => {
    try {
      const result = await summarizeMemo(content);
      setSummary(result);
    } catch (error) {
      console.error('요약 실패:', error);
    }
  };

  const handleClassify = async () => {
    try {
      const result = await classifyMemo(content);
      setCategory(result);
    } catch (error) {
      console.error('분류 실패:', error);
    }
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="메모 내용을 입력하세요..."
      />
      <button onClick={handleSummarize} disabled={loading}>
        요약하기
      </button>
      <button onClick={handleClassify} disabled={loading}>
        분류하기
      </button>
      {summary && <div>요약: {summary}</div>}
      {category && <div>카테고리: {category}</div>}
    </div>
  );
}
```

## 보안 고려사항

### 1. API 키 보호

- API 키는 서버 사이드에서만 사용됩니다
- 클라이언트에 절대 노출되지 않습니다
- 환경 변수로 안전하게 관리됩니다

### 2. 입력 검증

- 모든 입력값에 대해 타입 및 길이 검증을 수행합니다
- 빈 값 및 잘못된 형식의 데이터를 필터링합니다

### 3. 오류 처리

- API 오류와 일반 오류를 분리하여 처리합니다
- 사용자에게 친화적인 오류 메시지를 제공합니다
- 민감한 정보는 로그에서 제외됩니다

### 4. 요청 제한

- 콘텐츠 길이 제한 (요약: 10,000자, 분류: 5,000자)
- 토큰 수 제한으로 비용 관리
- 재시도 정책으로 안정성 확보

## 비용 최적화

### 1. 토큰 관리

- 요약: 최대 1,024 토큰
- 분류: 최대 512 토큰
- 일반 메시지: 최대 4,096 토큰

### 2. 모델 선택

- Claude 4 (Sonnet 4) 사용으로 최고의 성능과 정확도 제공

### 3. 재시도 정책

- 최대 2회 재시도로 실패율 감소
- 30초 타임아웃으로 무한 대기 방지

## 문제 해결

### 일반적인 오류 코드

| 상태 코드 | 설명           | 해결 방법             |
| --------- | -------------- | --------------------- |
| 400       | 잘못된 요청    | 입력 데이터 형식 확인 |
| 401       | 인증 실패      | API 키 설정 확인      |
| 429       | 요청 한도 초과 | 잠시 후 재시도        |
| 500       | 서버 오류      | 로그 확인 후 재시도   |

### 디버깅

개발 환경에서 상세한 로그를 확인할 수 있습니다:

```bash
# 개발 서버 실행
npm run dev

# 브라우저 개발자 도구에서 네트워크 탭 확인
# 서버 콘솔에서 오류 로그 확인
```

## 참고 자료

- [Anthropic API 문서](https://docs.anthropic.com/)
- [Claude 3.5 Sonnet 모델 가이드](https://docs.anthropic.com/claude/docs/models-overview)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
