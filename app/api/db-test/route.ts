import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    const result = await db.select().from(users).limit(1);

    return NextResponse.json({
      success: true,
      message: '데이터베이스 연결 성공',
      data: {
        connection: 'OK',
        tables: ['users', 'memos'],
        sampleQuery: result,
      },
    });
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);

    return NextResponse.json(
      {
        success: false,
        message: '데이터베이스 연결 실패',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
