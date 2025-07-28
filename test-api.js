// API 테스트 스크립트
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 API 테스트 시작...\n');

  // 1. 메모 목록 조회 테스트 (인증 필요)
  console.log('1. 메모 목록 조회 테스트:');
  try {
    const response = await fetch(`${BASE_URL}/memos`);
    const data = await response.json();
    console.log(`   상태: ${response.status}`);
    console.log(`   응답:`, data);
  } catch (error) {
    console.log(`   오류:`, error.message);
  }
  console.log('');

  // 2. 메모 생성 테스트 (인증 필요)
  console.log('2. 메모 생성 테스트:');
  try {
    const response = await fetch(`${BASE_URL}/memos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '테스트 메모',
        content: '이것은 테스트 메모입니다.',
        category: '테스트',
        tags: ['테스트', 'API'],
      }),
    });
    const data = await response.json();
    console.log(`   상태: ${response.status}`);
    console.log(`   응답:`, data);
  } catch (error) {
    console.log(`   오류:`, error.message);
  }
  console.log('');

  // 3. 잘못된 데이터로 메모 생성 테스트
  console.log('3. 잘못된 데이터로 메모 생성 테스트:');
  try {
    const response = await fetch(`${BASE_URL}/memos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '', // 빈 제목
        content: '', // 빈 내용
      }),
    });
    const data = await response.json();
    console.log(`   상태: ${response.status}`);
    console.log(`   응답:`, data);
  } catch (error) {
    console.log(`   오류:`, error.message);
  }
  console.log('');

  console.log('✅ API 테스트 완료');
}

testAPI();
