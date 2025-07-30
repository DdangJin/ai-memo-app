import { NextRequest, NextResponse } from 'next/server';
import { classifyMemo } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    // 입력 검증
    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: '분류할 메모 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    // 내용 길이 제한 (너무 긴 텍스트 방지)
    if (content.length > 5000) {
      return NextResponse.json(
        { error: '메모 내용이 너무 깁니다. 5,000자 이하로 제한해주세요.' },
        { status: 400 }
      );
    }

    // Claude API로 메모 분류
    const category = await classifyMemo(content);

    // 카테고리 한국어 이름 매핑
    const categoryNames = {
      work: '업무',
      personal: '개인',
      study: '학습',
      idea: '아이디어',
      todo: '할일',
      other: '기타',
    };

    const responseHeaders = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-RateLimit-Limit': '100',
    });

    return NextResponse.json(
      {
        success: true,
        category,
        categoryName:
          categoryNames[category as keyof typeof categoryNames] || '기타',
        contentLength: content.length,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Claude classify API error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : '메모 분류 중 오류가 발생했습니다.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
