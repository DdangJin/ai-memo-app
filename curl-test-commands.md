# curl 세션 유지 테스트 명령어

## 1. 로그인하고 쿠키 저장

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'
```

## 2. 저장된 쿠키로 메모 페이지 접근

```bash
curl -b cookies.txt http://localhost:3000/memos
```

## 3. 저장된 쿠키로 API 호출

```bash
curl -b cookies.txt http://localhost:3000/api/memos
```

## 4. 쿠키 내용 확인

```bash
cat cookies.txt
```

## 5. 쿠키 없이 접근 시도 (비교용)

```bash
curl http://localhost:3000/memos
```

## 6. 세션 정보 확인

```bash
curl -b cookies.txt http://localhost:3000/api/auth/user
```

## 7. 로그아웃

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/auth/signout
```

## 8. 쿠키 파일 삭제

```bash
rm cookies.txt
```

## 전체 테스트 스크립트 실행

```bash
./test-session-curl.sh
```

## Node.js 테스트 실행

```bash
node test-session-node.js
```

## 주요 옵션 설명

- `-c cookies.txt`: 쿠키를 파일에 저장
- `-b cookies.txt`: 저장된 쿠키를 사용
- `-L`: 리다이렉트 따라가기
- `-s`: 조용한 모드 (진행률 표시 안함)
- `-v`: 상세한 정보 출력
