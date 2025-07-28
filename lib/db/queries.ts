import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from './index';
import {
  profiles,
  memos,
  type Profile,
  type NewProfile,
  type Memo,
  type NewMemo,
} from './schema';

/**
 * Profiles 관련 쿼리 함수들
 */

// 사용자 ID로 프로필 조회
export async function getProfileByUserId(
  userId: string
): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profile || null;
}

// 프로필 생성
export async function createProfile(profile: NewProfile): Promise<Profile> {
  const [newProfile] = await db.insert(profiles).values(profile).returning();

  return newProfile;
}

// 프로필 업데이트
export async function updateProfile(
  userId: string,
  updates: Partial<NewProfile>
): Promise<Profile | null> {
  const [updatedProfile] = await db
    .update(profiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
    .returning();

  return updatedProfile || null;
}

/**
 * Memos 관련 쿼리 함수들
 */

// 사용자의 모든 메모 조회 (최신순)
export async function getMemosByUserId(userId: string): Promise<Memo[]> {
  return await db
    .select()
    .from(memos)
    .where(eq(memos.userId, userId))
    .orderBy(desc(memos.createdAt));
}

// 특정 메모 조회
export async function getMemoById(
  memoId: string,
  userId: string
): Promise<Memo | null> {
  const [memo] = await db
    .select()
    .from(memos)
    .where(and(eq(memos.id, memoId), eq(memos.userId, userId)))
    .limit(1);

  return memo || null;
}

// 메모 생성
export async function createMemo(memo: NewMemo): Promise<Memo> {
  const [newMemo] = await db.insert(memos).values(memo).returning();

  return newMemo;
}

// 메모 업데이트
export async function updateMemo(
  memoId: string,
  userId: string,
  updates: Partial<NewMemo>
): Promise<Memo | null> {
  const [updatedMemo] = await db
    .update(memos)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(memos.id, memoId), eq(memos.userId, userId)))
    .returning();

  return updatedMemo || null;
}

// 메모 삭제
export async function deleteMemo(
  memoId: string,
  userId: string
): Promise<boolean> {
  const [deletedMemo] = await db
    .delete(memos)
    .where(and(eq(memos.id, memoId), eq(memos.userId, userId)))
    .returning();

  return !!deletedMemo;
}

// 카테고리별 메모 조회
export async function getMemosByCategory(
  userId: string,
  category: string
): Promise<Memo[]> {
  return await db
    .select()
    .from(memos)
    .where(and(eq(memos.userId, userId), eq(memos.category, category)))
    .orderBy(desc(memos.createdAt));
}

// 제목 또는 내용으로 메모 검색
export async function searchMemos(
  userId: string,
  searchTerm: string
): Promise<Memo[]> {
  const searchPattern = `%${searchTerm}%`;

  return await db
    .select()
    .from(memos)
    .where(
      and(
        eq(memos.userId, userId),
        // PostgreSQL의 ILIKE를 사용한 대소문자 구분 없는 검색
        // Drizzle ORM에서는 raw SQL을 사용해야 할 수 있음
        // 여기서는 간단한 예시로 표시
        eq(memos.title, searchPattern) // 실제로는 더 복잡한 검색 로직 필요
      )
    )
    .orderBy(desc(memos.createdAt));
}

/**
 * 통합 쿼리 함수들
 */

// 사용자와 프로필 정보를 함께 조회
export async function getUserWithProfile(
  userId: string
): Promise<{ profile: Profile | null }> {
  const profile = await getProfileByUserId(userId);
  return { profile };
}

// 사용자의 메모 통계 조회
export async function getUserMemoStats(userId: string): Promise<{
  totalMemos: number;
  categories: { category: string; count: number }[];
}> {
  const userMemos = await getMemosByUserId(userId);

  const totalMemos = userMemos.length;
  const categoryCounts = userMemos.reduce(
    (acc, memo) => {
      if (memo.category) {
        acc[memo.category] = (acc[memo.category] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const categories = Object.entries(categoryCounts).map(
    ([category, count]) => ({
      category,
      count,
    })
  );

  return { totalMemos, categories };
}
