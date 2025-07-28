-- Supabase Auth 통합 마이그레이션
-- 이 파일은 Supabase 권장 패턴 적용을 문서화합니다

-- 1. Profiles 테이블 (auth.users 참조)
-- 이미 적용됨: CREATE TABLE profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email VARCHAR(255),
--   name VARCHAR(255),
--   avatar_url TEXT,
--   website TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
-- );

-- 2. Memos 테이블 (auth.users 참조)
-- 이미 적용됨: ALTER TABLE memos ADD CONSTRAINT memos_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. RLS 정책들 (이미 적용됨)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own memos" ON memos FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own memos" ON memos FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own memos" ON memos FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own memos" ON memos FOR DELETE USING (auth.uid() = user_id);

-- 4. Auth Trigger (이미 적용됨)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, name)
--   VALUES (
--     NEW.id, 
--     NEW.email, 
--     COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. 기존 사용자 마이그레이션 (이미 적용됨)
-- INSERT INTO profiles (id, email, name)
-- SELECT id, email, COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name')
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles);

-- 6. 확인 쿼리
-- SELECT 'Profiles 테이블 구조:' as info;
-- \d profiles;
-- 
-- SELECT 'Memos 테이블 구조:' as info;
-- \d memos;
-- 
-- SELECT 'Auth.users 테이블 구조:' as info;
-- \d auth.users; 