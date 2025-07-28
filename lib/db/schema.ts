import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core';

/**
 * Supabase 권장 패턴에 따른 스키마 정의
 *
 * auth.users (Supabase 관리)
 * ├── id (UUID) - 인증, 세션, JWT 토큰 처리
 * ├── email
 * ├── encrypted_password
 * └── ...
 *
 * public.profiles (애플리케이션 데이터)
 * ├── id (auth.users.id 참조)
 * ├── email
 * ├── name
 * ├── avatar_url
 * └── ...
 *
 * public.memos (사용자 데이터)
 * ├── id
 * ├── user_id (auth.users.id 참조)
 * ├── title
 * ├── content
 * └── ...
 */

// Profiles 테이블 정의 (auth.users를 참조)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // auth.users.id를 참조
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  website: varchar('website', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Memos 테이블 정의 (auth.users를 참조)
export const memos = pgTable('memos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // auth.users.id를 참조
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 타입 정의
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Memo = typeof memos.$inferSelect;
export type NewMemo = typeof memos.$inferInsert;

// 관계 정의 (Drizzle ORM에서 사용)
export const profilesRelations = {
  // profiles는 auth.users와 1:1 관계
  // memos와 1:다 관계
};

export const memosRelations = {
  // memos는 auth.users와 다:1 관계
  // profiles와 다:1 관계
};
