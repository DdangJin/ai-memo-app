-- 초기 스키마 마이그레이션 (Supabase 권장 패턴 적용)
-- 이 파일은 기본 테이블 구조를 정의합니다

-- Profiles 테이블 (auth.users 참조)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  name VARCHAR(255),
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Memos 테이블 (auth.users 참조)
CREATE TABLE IF NOT EXISTS memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- Profiles RLS 정책
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Memos RLS 정책
CREATE POLICY "Users can view own memos" ON memos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memos" ON memos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memos" ON memos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memos" ON memos
  FOR DELETE USING (auth.uid() = user_id); 