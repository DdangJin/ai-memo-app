// 세션 상태 확인 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrdcdnjcstjihfcxewfo.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZGNkbmpjc3RqaWhmY3hld2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODI4NjEsImV4cCI6MjA2OTI1ODg2MX0.iJVmeafOrg1vi9EdY-eN22T-0dtMS_CuN_wcY-R9qK8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSession() {
  console.log('🧪 세션 상태 확인 중...\n');

  try {
    // 현재 세션 확인
    console.log('1. 현재 세션 확인...');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.log('❌ 세션 확인 오류:', sessionError.message);
    } else if (session) {
      console.log('✅ 세션 있음:', session.user.email);
      console.log('세션 만료:', new Date(session.expires_at * 1000));
    } else {
      console.log('❌ 세션이 없습니다.');
    }

    // 현재 사용자 확인
    console.log('\n2. 현재 사용자 확인...');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.log('❌ 사용자 확인 오류:', userError.message);
    } else if (user) {
      console.log('✅ 사용자 있음:', user.email);
    } else {
      console.log('❌ 사용자가 없습니다.');
    }

    // 로그인 테스트
    console.log('\n3. 로그인 테스트...');
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123',
      });

    if (signInError) {
      console.log('❌ 로그인 오류:', signInError.message);
    } else {
      console.log('✅ 로그인 성공:', signInData.user.email);

      // 로그인 후 세션 다시 확인
      console.log('\n4. 로그인 후 세션 확인...');
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();

      if (newSession) {
        console.log('✅ 로그인 후 세션 있음:', newSession.user.email);
      } else {
        console.log('❌ 로그인 후에도 세션이 없습니다.');
      }
    }
  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

checkSession();
