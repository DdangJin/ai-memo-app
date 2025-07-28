# AI 메모 애플리케이션

AI 기술을 활용한 스마트 메모 애플리케이션입니다. Next.js와 TypeScript를 기반으로 구축되었으며, Cursor IDE와 Taskmaster를 통한 AI 기반 개발 환경을 제공합니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: React 19.1.0
- **IDE**: Cursor IDE (AI 코딩 어시스턴트)
- **Project Management**: Taskmaster (AI 기반 작업 관리)

## 🛠️ 개발 환경

### 필수 도구

- **Cursor IDE**: AI 코딩 어시스턴트가 통합된 개발 환경
- **Taskmaster**: AI 기반 프로젝트 관리 도구
- **Node.js**: 18.0.0 이상

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 📁 프로젝트 구조

```
ai-memo-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 전역 스타일
├── public/                # 정적 파일
├── .cursor/               # Cursor IDE 설정
│   ├── mcp.json          # MCP 서버 설정
│   └── rules/            # AI 코딩 규칙
├── .taskmaster/           # Taskmaster 설정
│   ├── config.json       # Taskmaster 설정
│   ├── tasks/            # 작업 관리 파일
│   └── templates/        # 템플릿 파일
└── package.json           # 프로젝트 설정
```

## 🎯 주요 기능 (예정)

- [ ] AI 기반 메모 생성 및 편집
- [ ] 실시간 메모 동기화
- [ ] 태그 및 카테고리 관리
- [ ] 검색 및 필터링
- [ ] 다크 모드 지원

## 🎯 AI 기반 개발 환경

### Cursor IDE 설정

- **MCP 서버**: AI 도구 통합을 위한 설정
- **코딩 규칙**: 일관된 코드 스타일 및 품질 관리
- **AI 어시스턴트**: 실시간 코드 제안 및 리팩토링

### Taskmaster 설정

- **작업 관리**: AI 기반 작업 분해 및 우선순위 설정
- **프로젝트 계획**: 체계적인 개발 로드맵 관리
- **진행 추적**: 실시간 작업 진행 상황 모니터링

## 🤝 기여하기

1. 이슈를 생성하여 버그나 기능 요청을 알려주세요
2. Fork 후 기능 브랜치를 생성하세요 (`feature/이슈번호` 형식)
3. 변경사항을 커밋하고 Pull Request를 생성하세요

### 커밋 메시지 규칙

- 한국어 명령조 사용 (예: "기능 추가하라", "버그 수정하라")
- 구조: `[작업내용] [목적]하라`

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔗 관련 링크

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)
- [Cursor IDE](https://cursor.sh/)
- [Taskmaster](https://github.com/taskmaster-ai/taskmaster)
