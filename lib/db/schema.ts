import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// Enums
export const factorTypeEnum = pgEnum('factor_type', [
  'totp',
  'webauthn',
  'phone',
]);
export const factorStatusEnum = pgEnum('factor_status', [
  'unverified',
  'verified',
]);
export const aalLevelEnum = pgEnum('aal_level', ['aal1', 'aal2', 'aal3']);
export const codeChallengeMethodEnum = pgEnum('code_challenge_method', [
  's256',
  'plain',
]);
export const oneTimeTokenTypeEnum = pgEnum('one_time_token_type', [
  'confirmation_token',
  'reauthentication_token',
  'recovery_token',
  'email_change_token_new',
  'email_change_token_current',
  'phone_change_token',
]);

// Auth Tables (Supabase Auth)
export const authUsers = pgTable('auth.users', {
  id: uuid('id').primaryKey(),
  instanceId: uuid('instance_id'),
  aud: varchar('aud'),
  role: varchar('role'),
  email: varchar('email'),
  encryptedPassword: varchar('encrypted_password'),
  emailConfirmedAt: timestamp('email_confirmed_at', { withTimezone: true }),
  invitedAt: timestamp('invited_at', { withTimezone: true }),
  confirmationToken: varchar('confirmation_token'),
  confirmationSentAt: timestamp('confirmation_sent_at', { withTimezone: true }),
  recoveryToken: varchar('recovery_token'),
  recoverySentAt: timestamp('recovery_sent_at', { withTimezone: true }),
  emailChangeTokenNew: varchar('email_change_token_new'),
  emailChange: varchar('email_change'),
  emailChangeSentAt: timestamp('email_change_sent_at', { withTimezone: true }),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
  rawAppMetaData: jsonb('raw_app_meta_data'),
  rawUserMetaData: jsonb('raw_user_meta_data'),
  isSuperAdmin: boolean('is_super_admin'),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  phone: text('phone'),
  phoneConfirmedAt: timestamp('phone_confirmed_at', { withTimezone: true }),
  phoneChange: text('phone_change'),
  phoneChangeToken: varchar('phone_change_token'),
  phoneChangeSentAt: timestamp('phone_change_sent_at', { withTimezone: true }),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  emailChangeTokenCurrent: varchar('email_change_token_current'),
  emailChangeConfirmStatus: integer('email_change_confirm_status'),
  bannedUntil: timestamp('banned_until', { withTimezone: true }),
  reauthenticationToken: varchar('reauthentication_token'),
  reauthenticationSentAt: timestamp('reauthentication_sent_at', {
    withTimezone: true,
  }),
  isSsoUser: boolean('is_sso_user').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  isAnonymous: boolean('is_anonymous').default(false),
});

// Public Tables
export const profiles = pgTable('public.profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  username: varchar('username', { length: 100 }).unique(),
  fullName: varchar('full_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  preferences: jsonb('preferences').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('public.categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentId: uuid('parent_id').references((): any => categories.id, {
    onDelete: 'cascade',
  }),
  sortOrder: integer('sort_order').default(0),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const tags = pgTable('public.tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 7 }).default('#6B7280'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const memos = pgTable('public.memos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content'),
  voiceUrl: text('voice_url'),
  durationSeconds: integer('duration_seconds'),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  isArchived: boolean('is_archived').default(false),
  isFavorite: boolean('is_favorite').default(false),
  aiSummary: text('ai_summary'),
  aiTags: text('ai_tags').array(),
  // Full-text search column (generated column in database)
  fts: text('fts'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const memoTags = pgTable('public.memo_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  memoId: uuid('memo_id')
    .notNull()
    .references(() => memos.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(authUsers, {
    fields: [profiles.userId],
    references: [authUsers.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(authUsers, {
    fields: [categories.userId],
    references: [authUsers.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_hierarchy',
  }),
  children: many(categories, { relationName: 'category_hierarchy' }),
  memos: many(memos),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(authUsers, {
    fields: [tags.userId],
    references: [authUsers.id],
  }),
  memoTags: many(memoTags),
}));

export const memosRelations = relations(memos, ({ one, many }) => ({
  user: one(authUsers, {
    fields: [memos.userId],
    references: [authUsers.id],
  }),
  category: one(categories, {
    fields: [memos.categoryId],
    references: [categories.id],
  }),
  memoTags: many(memoTags),
}));

export const memoTagsRelations = relations(memoTags, ({ one }) => ({
  memo: one(memos, {
    fields: [memoTags.memoId],
    references: [memos.id],
  }),
  tag: one(tags, {
    fields: [memoTags.tagId],
    references: [tags.id],
  }),
}));

// Types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Memo = typeof memos.$inferSelect;
export type NewMemo = typeof memos.$inferInsert;
export type MemoTag = typeof memoTags.$inferSelect;
export type NewMemoTag = typeof memoTags.$inferInsert;
