import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    // 보안 로깅 - IP 및 요청 정보 기록
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    console.log(
      `Claude API Request - IP: ${clientIP}, Timestamp: ${new Date().toISOString()}`
    );

    const body = await request.json();
    const { prompt, maxTokens } = body;

    // 입력 검증
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // maxTokens 검증 (선택적)
    const tokenLimit =
      maxTokens && typeof maxTokens === 'number' && maxTokens > 0
        ? Math.min(maxTokens, 4096) // 최대 4096 토큰으로 제한
        : 1024;

    // Claude API 호출
    const response = await sendMessage(prompt, tokenLimit);

    const responseHeaders = new Headers({
      'X-RateLimit-Limit': '100', // 시간당 요청 제한
      'X-RateLimit-Remaining': '99', // 남은 요청 수
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });

    return NextResponse.json(
      {
        success: true,
        response,
        tokenLimit,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Claude message API error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'AI 메시지 처리 중 오류가 발생했습니다.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
