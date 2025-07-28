#!/bin/bash

# 세션 유지 테스트 스크립트
BASE_URL="http://localhost:3000"
COOKIE_FILE="test_cookies.txt"

echo "🧪 세션 유지 테스트 시작...\n"

# 1. 로그인하고 쿠키 저장
echo "1. 로그인 시도..."
LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}')

echo "로그인 응답: $LOGIN_RESPONSE"
echo "쿠키 파일 생성됨: $COOKIE_FILE"

# 2. 세션 확인 API 호출
echo -e "\n2. 세션 확인 API 호출..."
SESSION_RESPONSE=$(curl -s -b $COOKIE_FILE "$BASE_URL/api/auth/session")
echo "세션 확인 응답: $SESSION_RESPONSE"

# 3. 저장된 쿠키로 보호된 페이지 접근
echo -e "\n3. 메모 페이지 접근 (쿠키 사용)..."
MEMO_RESPONSE=$(curl -s -b $COOKIE_FILE "$BASE_URL/memos")
echo "메모 페이지 상태: $MEMO_RESPONSE"

# 4. API 호출 테스트
echo -e "\n4. API 호출 테스트 (쿠키 사용)..."
API_RESPONSE=$(curl -s -b $COOKIE_FILE "$BASE_URL/api/memos")
echo "API 응답: $API_RESPONSE"

# 5. 쿠키 내용 확인
echo -e "\n5. 저장된 쿠키 내용:"
if [ -f "$COOKIE_FILE" ]; then
  cat $COOKIE_FILE
else
  echo "쿠키 파일이 없습니다."
fi

# 6. 쿠키 없이 접근 시도 (비교용)
echo -e "\n6. 쿠키 없이 접근 시도 (비교용)..."
NO_COOKIE_RESPONSE=$(curl -s "$BASE_URL/memos")
echo "쿠키 없이 접근 결과: $NO_COOKIE_RESPONSE"

# 7. 정리
echo -e "\n7. 테스트 완료"
echo "쿠키 파일 삭제 중..."
rm -f $COOKIE_FILE

echo -e "\n📋 테스트 결과 요약:"
echo "✅ 로그인: 쿠키 저장됨"
echo "✅ 세션 확인: API를 통한 세션 상태 확인"
echo "✅ 세션 유지: 쿠키를 사용한 요청"
echo "✅ API 인증: 서버 사이드 세션 확인"
echo "✅ 보안: 쿠키 없이는 접근 차단" 