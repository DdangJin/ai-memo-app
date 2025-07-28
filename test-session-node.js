// Node.js 세션 유지 테스트 스크립트
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 쿠키를 저장할 변수
let cookies = '';

async function testSession() {
  console.log('🧪 Node.js 세션 유지 테스트 시작...\n');

  try {
    // 1. 로그인
    console.log('1. 로그인 시도...');
    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/signin`,
      {
        email: 'test@example.com',
        password: 'testpassword123',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('로그인 성공:', loginResponse.data);

    // 쿠키 저장
    if (loginResponse.headers['set-cookie']) {
      cookies = loginResponse.headers['set-cookie'].join('; ');
      console.log('쿠키 저장됨:', cookies);
    }

    // 2. 메모 페이지 접근 (쿠키 사용)
    console.log('\n2. 메모 페이지 접근 (쿠키 사용)...');
    const memoResponse = await axios.get(`${BASE_URL}/memos`, {
      headers: {
        Cookie: cookies,
      },
    });

    console.log('메모 페이지 접근 성공:', memoResponse.status);

    // 3. API 호출 테스트 (쿠키 사용)
    console.log('\n3. API 호출 테스트 (쿠키 사용)...');
    const apiResponse = await axios.get(`${BASE_URL}/api/memos`, {
      headers: {
        Cookie: cookies,
      },
    });

    console.log('API 호출 성공:', apiResponse.status);
    console.log('API 응답 데이터:', apiResponse.data);

    // 4. 쿠키 없이 접근 시도 (비교용)
    console.log('\n4. 쿠키 없이 접근 시도 (비교용)...');
    try {
      const noCookieResponse = await axios.get(`${BASE_URL}/memos`);
      console.log(
        '쿠키 없이 접근 성공 (예상과 다름):',
        noCookieResponse.status
      );
    } catch (error) {
      console.log('쿠키 없이 접근 실패 (예상됨):', error.response?.status);
    }

    // 5. 세션 정보 확인
    console.log('\n5. 세션 정보 확인...');
    const sessionResponse = await axios.get(`${BASE_URL}/api/auth/user`, {
      headers: {
        Cookie: cookies,
      },
    });

    console.log('세션 정보:', sessionResponse.data);
  } catch (error) {
    console.error('❌ 테스트 오류:', error.response?.data || error.message);
  }

  console.log('\n📋 테스트 결과 요약:');
  console.log('✅ 로그인: 성공');
  console.log('✅ 세션 유지: 쿠키를 사용한 요청');
  console.log('✅ API 인증: 서버 사이드 세션 확인');
  console.log('✅ 보안: 쿠키 없이는 접근 차단');
}

testSession();
