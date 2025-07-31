import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { memos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { classifyMemo } from '@/lib/anthropic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memoId = params.id;
    if (!memoId || typeof memoId !== 'string') {
      return NextResponse.json({ error: 'Invalid memo ID' }, { status: 400 });
    }

    // Context7 베스트 프랙티스: 사용자 인증 확인
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 메모 존재 및 소유권 확인
    const [memo] = await db
      .select()
      .from(memos)
      .where(eq(memos.id, memoId))
      .limit(1);

    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    if (memo.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only classify your own memos' },
        { status: 403 }
      );
    }

    if (!memo.content || memo.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Cannot classify empty memo' },
        { status: 400 }
      );
    }

    // 내용 길이 제한 확인 (10,000자)
    if (memo.content.length > 10000) {
      return NextResponse.json(
        { error: 'Memo content too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    // IP 주소 로깅 (보안 모니터링)
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    console.log(
      `[${new Date().toISOString()}] Memo classification request - User: ${user.id}, Memo: ${memoId}, IP: ${clientIP}`
    );

    // Claude API를 통한 카테고리 분류
    const classification = await classifyMemo(memo.content);

    // 데이터베이스에 분류 결과 저장
    await db
      .update(memos)
      .set({
        category: classification.category,
        updatedAt: new Date(),
      })
      .where(eq(memos.id, memoId));

    // Context7 보안 헤더 적용
    const responseHeaders = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    return NextResponse.json(
      {
        success: true,
        classification: {
          category: classification.category,
          categoryKo: classification.categoryKo,
          confidence: classification.confidence,
          reasoning: classification.reasoning,
        },
        memoId,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Classification error:', error);

    // Context7 에러 처리: 상세 에러 정보 숨김
    const responseHeaders = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });

    return NextResponse.json(
      {
        error: 'Failed to classify memo',
        success: false,
      },
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memoId = params.id;
    if (!memoId || typeof memoId !== 'string') {
      return NextResponse.json({ error: 'Invalid memo ID' }, { status: 400 });
    }

    // 사용자 인증 확인
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 메모 조회 및 소유권 확인
    const [memo] = await db
      .select({ category: memos.category, userId: memos.userId })
      .from(memos)
      .where(eq(memos.id, memoId))
      .limit(1);

    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    if (memo.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const responseHeaders = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });

    return NextResponse.json(
      {
        success: true,
        category: memo.category,
        hasClassification: !!memo.category,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Get classification error:', error);

    const responseHeaders = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });

    return NextResponse.json(
      {
        error: 'Failed to get classification',
        success: false,
      },
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
}
