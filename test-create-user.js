// 테스트용 사용자 생성 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrdcdnjcstjihfcxewfo.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZGNkbmpjc3RqaWhmY3hld2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODI4NjEsImV4cCI6MjA2OTI1ODg2MX0.iJVmeafOrg1vi9EdY-eN22T-0dtMS_CuN_wcY-R9qK8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('🧪 테스트 사용자 생성 중...\n');

  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: '테스트 사용자',
  };

  try {
    console.log('1. 회원가입 시도...');
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
        },
      },
    });

    if (error) {
      console.log('❌ 회원가입 오류:', error.message);

      // 이미 존재하는 사용자인지 확인
      if (error.message.includes('already registered')) {
        console.log('✅ 사용자가 이미 존재합니다. 로그인 테스트를 진행합니다.');

        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: testUser.email,
            password: testUser.password,
          });

        if (signInError) {
          console.log('❌ 로그인 오류:', signInError.message);
        } else {
          console.log('✅ 로그인 성공:', signInData.user.email);
        }
      }
    } else {
      console.log('✅ 회원가입 성공:', data.user.email);
    }

    console.log('\n📋 테스트 계정 정보:');
    console.log(`이메일: ${testUser.email}`);
    console.log(`비밀번호: ${testUser.password}`);
    console.log('\n💡 이 계정으로 로그인 테스트를 진행하세요.');
  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

createTestUser();
