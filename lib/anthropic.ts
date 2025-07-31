import Anthropic from '@anthropic-ai/sdk';

/**
 * 토큰 추정 함수 (대략적인 계산)
 * 영어: 1 토큰 ≈ 4 문자, 한국어: 1 토큰 ≈ 2-3 문자
 */
function estimateTokens(text: string): number {
  // 한국어와 영어 혼합 텍스트에 대한 보수적인 추정
  // 한국어 문자는 더 많은 토큰을 사용할 수 있으므로 보수적으로 계산
  const koreanChars = (text.match(/[\u4E00-\u9FFF\uAC00-\uD7AF]/g) || [])
    .length;
  const otherChars = text.length - koreanChars;

  // 한국어: 1.5 토큰/문자, 기타: 0.25 토큰/문자 (보수적 추정)
  return Math.ceil(koreanChars * 1.5 + otherChars * 0.25);
}

/**
 * 긴 텍스트를 토큰 제한에 맞게 분할하는 함수
 */
function splitContentByTokens(
  content: string,
  maxTokens: number = 15000
): string[] {
  const estimatedTokens = estimateTokens(content);

  if (estimatedTokens <= maxTokens) {
    return [content];
  }

  const chunks: string[] = [];
  const sentences = content.split(/[.!?。！？]\s*/).filter(s => s.trim());

  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    // 문장 자체가 너무 크면 더 작게 분할
    if (sentenceTokens > maxTokens) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }

      // 단어 단위로 분할
      const words = sentence.split(/\s+/);
      let wordChunk = '';
      let wordTokens = 0;

      for (const word of words) {
        const wordToken = estimateTokens(word);
        if (wordTokens + wordToken > maxTokens && wordChunk) {
          chunks.push(wordChunk.trim());
          wordChunk = word;
          wordTokens = wordToken;
        } else {
          wordChunk += (wordChunk ? ' ' : '') + word;
          wordTokens += wordToken;
        }
      }

      if (wordChunk) {
        chunks.push(wordChunk.trim());
      }
    } else {
      // 현재 청크에 추가할 수 있는지 확인
      if (currentTokens + sentenceTokens > maxTokens && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
        currentTokens = sentenceTokens;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
        currentTokens += sentenceTokens;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [content];
}

/**
 * 여러 요약을 하나로 통합하는 함수
 */
async function aggregateSummaries(summaries: string[]): Promise<string> {
  if (summaries.length === 1) {
    return summaries[0];
  }

  const combinedSummaries = summaries.join('\n\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `다음은 긴 메모를 여러 부분으로 나누어 요약한 결과들입니다. 이들을 하나의 통합된 요약으로 만들어주세요:

<individual_summaries>
${combinedSummaries}
</individual_summaries>

<instructions>
1. 중복되는 내용은 제거하고 핵심만 유지하세요
2. 전체적인 맥락과 흐름을 유지하세요
3. 주요 포인트와 액션 아이템을 우선적으로 포함하세요
4. 200자 이내로 간결하게 작성하세요
5. 명확하고 이해하기 쉬운 한국어로 작성하세요
</instructions>

통합 요약:`,
      },
    ],
  });

  if (!message.content?.[0] || message.content[0].type !== 'text') {
    throw new Error('Invalid response from Claude API during aggregation');
  }

  let summary = message.content[0].text.trim();

  // "통합 요약:" 접두사 제거 (있을 경우)
  if (summary.startsWith('통합 요약:')) {
    summary = summary.substring('통합 요약:'.length).trim();
  }

  return summary;
}

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

    // 토큰 제한 확인 및 콘텐츠 분할
    const estimatedTokens = estimateTokens(content);
    const maxInputTokens = 15000; // Claude 4의 안전한 입력 토큰 제한

    console.log(
      `Content analysis: ${content.length} chars, ~${estimatedTokens} tokens`
    );

    // 토큰 제한을 초과하는 경우 분할 처리
    if (estimatedTokens > maxInputTokens) {
      console.log('Content exceeds token limit, splitting into chunks...');

      const chunks = splitContentByTokens(content, maxInputTokens);
      console.log(`Split into ${chunks.length} chunks`);

      // 각 청크를 개별적으로 요약
      const chunkSummaries: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(
          `Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`
        );

        try {
          const chunkSummary = await summarizeSingleChunk(
            chunk,
            Math.ceil(maxLength / chunks.length)
          );
          chunkSummaries.push(chunkSummary);
        } catch (chunkError) {
          console.error(`Error processing chunk ${i + 1}:`, chunkError);
          // 청크 처리 실패 시 원본 텍스트의 일부를 사용
          chunkSummaries.push(chunk.substring(0, 100) + '...');
        }
      }

      // 여러 요약을 하나로 통합
      console.log('Aggregating summaries...');
      return await aggregateSummaries(chunkSummaries);
    } else {
      // 토큰 제한 내에서는 단일 요약 처리
      return await summarizeSingleChunk(content, maxLength);
    }
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
 * 단일 청크를 요약하는 헬퍼 함수
 */
async function summarizeSingleChunk(
  content: string,
  maxLength: number
): Promise<string> {
  // Context7 베스트 프랙티스: 구조화된 프롬프트 사용
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `당신은 전문적인 메모 요약 전문가입니다. 사용자의 메모를 간결하고 유용한 요약으로 변환하는 것이 목표입니다.

다음 메모를 분석하고 요약해주세요:

<memo_content>
${content}
</memo_content>

<instructions>
요약 작성 규칙:
1. 메모의 핵심 아이디어와 주요 포인트를 3-5개의 bullet point로 추출하세요
2. 실행 가능한 항목(Action items)이 있다면 반드시 포함하세요
3. 중요한 날짜, 숫자, 이름 등의 구체적 정보는 유지하세요
4. 불필요한 수식어나 부연설명은 제거하세요
5. ${maxLength}자 이내로 작성하세요
6. 명확하고 이해하기 쉬운 한국어로 작성하세요
7. 핵심 내용과 액션 아이템을 먼저 써주세요
</instructions>

<thinking>
먼저 메모의 주요 내용을 파악하고, 핵심 포인트를 식별한 후, 간결한 요약을 작성하겠습니다.
</thinking>

메모 요약:`,
      },
    ],
  });

  if (!message.content?.[0] || message.content[0].type !== 'text') {
    throw new Error('Invalid response from Claude API');
  }

  // 응답에서 실제 요약 내용만 추출
  let summary = message.content[0].text.trim();

  // "메모 요약:" 접두사 제거 (있을 경우)
  if (summary.startsWith('메모 요약:')) {
    summary = summary.substring('메모 요약:'.length).trim();
  }

  return summary;
}

/**
 * 메모 분류 결과 타입 정의
 */
export interface MemoClassification {
  category: string;
  categoryKo: string;
  confidence: number;
  reasoning: string;
}

/**
 * 카테고리 정의 및 매핑
 */
const MEMO_CATEGORIES = {
  work: '업무',
  personal: '개인',
  study: '학습',
  idea: '아이디어',
  todo: '할일',
  meeting: '회의',
  finance: '재정',
  health: '건강',
  travel: '여행',
  other: '기타',
} as const;

type MemoCategory = keyof typeof MEMO_CATEGORIES;

/**
 * Context7 베스트 프랙티스: 구조화된 출력을 위한 도구 정의
 */
const classificationTool = {
  name: 'classify_memo_content',
  description: '메모 내용을 분석하고 적절한 카테고리로 분류합니다.',
  input_schema: {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string' as const,
        enum: Object.keys(MEMO_CATEGORIES),
        description: '분류된 카테고리 (영어)',
      },
      confidence: {
        type: 'number' as const,
        minimum: 0,
        maximum: 1,
        description: '분류 신뢰도 (0.0-1.0)',
      },
      reasoning: {
        type: 'string' as const,
        description: '분류 근거에 대한 간단한 설명',
      },
    },
    required: ['category', 'confidence', 'reasoning'],
  },
};

/**
 * 메모를 카테고리별로 분류하는 함수 (Context7 베스트 프랙티스 적용)
 * @param content - 분류할 메모 내용
 * @returns 분류된 카테고리 정보
 */
export async function classifyMemo(
  content: string
): Promise<MemoClassification> {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    // 내용 길이 제한 (10,000자)
    if (content.length > 10000) {
      throw new Error('Content too long for classification');
    }

    // Context7 베스트 프랙티스: 구조화된 프롬프트와 도구 사용
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools: [classificationTool],
      tool_choice: { type: 'tool', name: 'classify_memo_content' },
      messages: [
        {
          role: 'user',
          content: `당신은 메모 내용 분석 전문가입니다. 주어진 메모를 가장 적합한 카테고리로 분류하는 것이 목표입니다.

다음 메모 내용을 분석하고 분류해주세요:

<memo_content>
${content}
</memo_content>

<categories>
사용 가능한 카테고리와 설명:
- work (업무): 직장, 프로젝트, 업무 관련 내용
- personal (개인): 개인적인 일상, 생각, 경험
- study (학습): 공부, 연구, 교육 관련 내용
- idea (아이디어): 창의적 아이디어, 발상, 영감
- todo (할일): 해야 할 일, 계획, 일정
- meeting (회의): 회의 내용, 논의 사항, 결정 사항
- finance (재정): 금융, 예산, 투자, 지출 관련
- health (건강): 건강, 운동, 의료 관련 내용
- travel (여행): 여행 계획, 기록, 경험
- other (기타): 위 카테고리에 속하지 않는 내용
</categories>

<instructions>
분류 규칙:
1. 메모의 주요 내용과 목적을 파악하세요
2. 가장 관련성이 높은 단일 카테고리를 선택하세요
3. 신뢰도는 분류의 확실성을 반영하세요 (0.7 이상 권장)
4. 애매한 경우 'other' 카테고리를 사용하세요
5. 근거는 간단명료하게 한국어로 작성하세요
</instructions>

<thinking>
메모의 핵심 키워드와 맥락을 분석하여 가장 적합한 카테고리를 결정하겠습니다.
</thinking>

classify_memo_content 도구를 사용하여 분류 결과를 제공해주세요.`,
        },
      ],
    });

    // 도구 사용 응답 파싱
    const toolUse = message.content.find(
      block =>
        block.type === 'tool_use' && block.name === 'classify_memo_content'
    );

    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('No valid classification result from Claude API');
    }

    const result = toolUse.input as {
      category: string;
      confidence: number;
      reasoning: string;
    };

    // 유효성 검증
    if (!Object.keys(MEMO_CATEGORIES).includes(result.category)) {
      console.warn(
        `Invalid category received: ${result.category}, defaulting to 'other'`
      );
      result.category = 'other';
    }

    // 신뢰도 범위 검증
    if (result.confidence < 0 || result.confidence > 1) {
      result.confidence = Math.max(0, Math.min(1, result.confidence));
    }

    return {
      category: result.category,
      categoryKo: MEMO_CATEGORIES[result.category as MemoCategory],
      confidence: result.confidence,
      reasoning: result.reasoning,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API Error during classification:', {
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
