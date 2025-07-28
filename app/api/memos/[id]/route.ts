import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memos } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 인증된 사용자 확인 함수
async function getAuthenticatedUser(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      // 세션이 없으면 사용자 정보 직접 확인
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      return user;
    }

    return session.user;
  } catch (error) {
    console.error('인증 확인 오류:', error);
    return null;
  }
}

// 특정 메모 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const memo = await db
      .select()
      .from(memos)
      .where(and(eq(memos.id, params.id), eq(memos.userId, user.id)))
      .limit(1);

    if (memo.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Memo not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: memo[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 메모 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'title and content are required',
        },
        { status: 400 }
      );
    }

    const updatedMemo = await db
      .update(memos)
      .set({
        title,
        content,
        category,
        tags,
        updatedAt: new Date(),
      })
      .where(and(eq(memos.id, params.id), eq(memos.userId, user.id)))
      .returning();

    if (updatedMemo.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Memo not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedMemo[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 메모 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const deletedMemo = await db
      .delete(memos)
      .where(and(eq(memos.id, params.id), eq(memos.userId, user.id)))
      .returning();

    if (deletedMemo.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Memo not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Memo deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
