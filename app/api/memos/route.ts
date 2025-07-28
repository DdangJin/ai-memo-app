import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memos } from '@/lib/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 인증된 사용자 확인 함수
async function getAuthenticatedUser(request: Request) {
  try {
    console.log('🔍 API 인증 확인 시작...');

    const cookieStore = await cookies();
    console.log('쿠키 개수:', cookieStore.getAll().length);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name);
            console.log(`쿠키 ${name}:`, cookie?.value ? '있음' : '없음');
            return cookie?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', options);
            } catch {
              // The `remove` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // 세션 확인
    console.log('세션 확인 중...');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('세션 확인 오류:', sessionError);
      return null;
    }

    if (!session) {
      console.log('세션이 없습니다.');

      // 사용자 정보 직접 확인 시도
      console.log('사용자 정보 직접 확인 시도...');
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('사용자 정보 확인 오류:', userError);
        return null;
      }

      if (!user) {
        console.log('사용자 정보도 없습니다.');
        return null;
      }

      console.log('사용자 정보 확인됨:', user.email);
      return user;
    }

    console.log('세션 확인됨:', session.user.email);
    return session.user;
  } catch (error) {
    console.error('인증 확인 오류:', error);
    return null;
  }
}

// 메모 목록 조회 (인증된 사용자의 메모만)
export async function GET(request: Request) {
  try {
    console.log('📝 GET /api/memos 요청 처리 중...');
    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log('❌ 인증되지 않은 사용자');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    console.log('✅ 인증된 사용자:', user.email);

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 정렬 조건 설정
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = sortOrder === 'desc' ? desc(memos.title) : asc(memos.title);
        break;
      case 'updatedAt':
        orderBy =
          sortOrder === 'desc' ? desc(memos.updatedAt) : asc(memos.updatedAt);
        break;
      default:
        orderBy =
          sortOrder === 'desc' ? desc(memos.createdAt) : asc(memos.createdAt);
    }

    // 전체 메모 수 조회
    const totalCount = await db
      .select({ count: memos.id })
      .from(memos)
      .where(eq(memos.userId, user.id));

    // 페이지네이션된 메모 조회
    const userMemos = await db
      .select()
      .from(memos)
      .where(eq(memos.userId, user.id))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount.length / limit);

    console.log(`✅ 메모 조회 성공: ${userMemos.length}개`);

    return NextResponse.json({
      success: true,
      data: userMemos,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: totalCount.length,
        limit,
      },
    });
  } catch (error) {
    console.error('메모 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 새 메모 생성
export async function POST(request: Request) {
  try {
    console.log('📝 POST /api/memos 요청 처리 중...');
    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log('❌ 인증되지 않은 사용자');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    console.log('✅ 인증된 사용자:', user.email);

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

    const newMemo = await db
      .insert(memos)
      .values({
        userId: user.id,
        title,
        content,
        category,
        tags,
      })
      .returning();

    console.log('✅ 메모 생성 성공:', newMemo[0].id);

    return NextResponse.json(
      {
        success: true,
        data: newMemo[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('메모 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
