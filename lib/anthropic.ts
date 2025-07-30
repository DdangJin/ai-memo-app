import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Claude API 클라이언트 인스턴스
 * 메모 요약 및 분류 기능을 위한 AI 서비스
 */

// 환경 변수에서 API 키 검증
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    'ANTHROPIC_API_KEY environment variable is required. ' +
      'Please add it to your .env.local file.'
  );
}

// Anthropic 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2, // 기본값 2회 재시도
  timeout: 30 * 1000, // 30초 타임아웃
});

/**
 * 메모 내용을 요약하는 함수
 * @param content - 요약할 메모 내용
 * @param maxLength - 요약 최대 길이 (기본값: 200자)
 * @returns 요약된 내용
 */
export async function summarizeMemo(
  content: string,
  maxLength: number = 200
): Promise<string> {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `다음 메모 내용을 ${maxLength}자 이내로 요약해주세요. 핵심 내용만 간결하게 정리해주세요.

메모 내용:
${content}`,
        },
      ],
    });

    const summary = message.content[0];
    if (summary.type === 'text') {
      return summary.text.trim();
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API Error:', {
        status: error.status,
        name: error.name,
        message: error.message,
      });
      throw new Error(`AI 요약 서비스 오류: ${error.message}`);
    }

    console.error('Memo summarization error:', error);
    throw new Error('메모 요약 중 오류가 발생했습니다.');
  }
}

/**
 * 메모를 카테고리별로 분류하는 함수
 * @param content - 분류할 메모 내용
 * @returns 분류된 카테고리
 */
export async function classifyMemo(content: string): Promise<string> {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `다음 메모를 적절한 카테고리로 분류해주세요. 다음 카테고리 중 하나를 선택해주세요:
- 업무 (work)
- 개인 (personal)  
- 학습 (study)
- 아이디어 (idea)
- 할일 (todo)
- 기타 (other)

메모 내용:
${content}

응답은 카테고리 이름만 영어로 답해주세요 (예: work, personal, study, idea, todo, other).`,
        },
      ],
    });

    const classification = message.content[0];
    if (classification.type === 'text') {
      const category = classification.text.trim().toLowerCase();
      const validCategories = [
        'work',
        'personal',
        'study',
        'idea',
        'todo',
        'other',
      ];

      if (validCategories.includes(category)) {
        return category;
      }

      // 기본 카테고리로 fallback
      return 'other';
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API Error:', {
        status: error.status,
        name: error.name,
        message: error.message,
      });
      throw new Error(`AI 분류 서비스 오류: ${error.message}`);
    }

    console.error('Memo classification error:', error);
    throw new Error('메모 분류 중 오류가 발생했습니다.');
  }
}

/**
 * 일반적인 Claude API 메시지 전송 함수
 * @param prompt - 전송할 프롬프트
 * @param maxTokens - 최대 토큰 수 (기본값: 1024)
 * @returns Claude의 응답
 */
export async function sendMessage(
  prompt: string,
  maxTokens: number = 1024
): Promise<string> {
  try {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      return response.text.trim();
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API Error:', {
        status: error.status,
        name: error.name,
        message: error.message,
      });
      throw new Error(`AI 서비스 오류: ${error.message}`);
    }

    console.error('Claude message error:', error);
    throw new Error('AI 메시지 전송 중 오류가 발생했습니다.');
  }
}

// 기본 클라이언트 내보내기
export default anthropic;
