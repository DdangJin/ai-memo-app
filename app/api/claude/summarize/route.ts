import { NextRequest, NextResponse } from 'next/server';
import { summarizeMemo } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, maxLength } = body;

    // 입력 검증
    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: '요약할 메모 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    // 내용 길이 제한 (너무 긴 텍스트 방지)
    if (content.length > 10000) {
      return NextResponse.json(
        { error: '메모 내용이 너무 깁니다. 10,000자 이하로 제한해주세요.' },
        { status: 400 }
      );
    }

    // maxLength 검증 (선택적)
    const summaryLength =
      maxLength && typeof maxLength === 'number' && maxLength > 0
        ? Math.min(maxLength, 1000) // 최대 1000자로 제한
        : 200;

    // Claude API로 메모 요약
    const summary = await summarizeMemo(content, summaryLength);

    const responseHeaders = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-RateLimit-Limit': '50', // 요약은 더 제한적
    });

    return NextResponse.json(
      {
        success: true,
        summary,
        originalLength: content.length,
        summaryLength: summary.length,
        maxLength: summaryLength,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Claude summarize API error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : '메모 요약 중 오류가 발생했습니다.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
