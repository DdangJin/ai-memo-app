# 📝 Memora - AI 음성 메모장 웹서비스

AI 기술을 활용한 스마트 메모 애플리케이션입니다. 음성과 텍스트로 빠르게 메모하고, AI가 자동으로 요약 및 분류해주는 웹 메모장입니다.

## 🚀 기술 스택

### **프론트엔드 & 백엔드**

- **Framework**: Next.js 14 (풀스택 프레임워크)
- **Language**: TypeScript
- **Styling**: TailwindCSS

### **데이터베이스 & 인증**

- **Database**: Supabase (PostgreSQL 기반)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth

### **AI 서비스**

- **AI Engine**: Anthropic Claude API
- **Speech Recognition**: Web Speech API
- **Real-time**: Supabase Realtime

### **배포 & 인프라**

- **Deployment**: Vercel
- **IDE**: Cursor IDE (AI 코딩 어시스턴트)
- **Project Management**: Taskmaster (AI 기반 작업 관리)

## 🎯 주요 기능

### **MVP 기능 (Phase 1)**

- [x] Next.js 14 프로젝트 초기화
- [ ] Supabase 데이터베이스 스키마 설계 및 Drizzle ORM 설정
- [ ] Supabase Auth 기반 인증 시스템 구현
- [ ] 핵심 UI 컴포넌트 및 반응형 레이아웃 개발
- [ ] Memo CRUD 기능 구현
- [ ] 메모 목록 및 상세 페이지 구현
- [ ] 기본 검색 기능 구현

### **AI 기능 (Phase 2)**

- [ ] Anthropic Claude API 통합
- [ ] AI 기반 메모 요약 기능
- [ ] AI 기반 자동 카테고리 분류
- [ ] AI 처리 상태 관리
- [ ] Web Speech API 통합
- [ ] 실시간 음성 녹음 인터페이스 구현

### **고급 기능 (Phase 3)**

- [ ] 고급 검색 기능 구현
- [ ] 사용자 통계 및 분석 대시보드
- [ ] 메모 공유 및 실시간 협업
- [ ] 메모 데이터 내보내기/가져오기, 백업 및 복원 기능

### **품질 및 배포 (Phase 4)**

- [ ] WCAG 2.1 AA 접근성 준수 강화
- [ ] 성능 최적화 및 Vercel 배포 준비

## 🛠️ 개발 환경

### **필수 도구**

- **Cursor IDE**: AI 코딩 어시스턴트가 통합된 개발 환경
- **Taskmaster**: AI 기반 프로젝트 관리 도구
- **Node.js**: 18.0.0 이상

### **환경 변수 설정**

프로젝트 루트에 `.env.local` 파일을 생성하고 `env.example`을 참고하여 다음 변수들을 설정하세요:

#### **필수 API 키 (해당 기능을 사용하려면 필요)**

```bash
# Anthropic Claude API (필수)
ANTHROPIC_API_KEY="sk-ant-api03-..."  # Claude AI 기능 사용시

# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# 데이터베이스 연결 (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.${password}:${project-id}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

#### **선택적 API 키 (추가 기능 사용시)**

```bash
# AI 모델 선택 (하나 이상 선택)
PERPLEXITY_API_KEY="pplx-..."           # Perplexity AI 연구용
OPENAI_API_KEY="sk-proj-..."            # OpenAI 모델용
GOOGLE_API_KEY="your_google_api_key"    # Google Gemini 모델용
MISTRAL_API_KEY="your_mistral_api_key"  # Mistral AI 모델용
XAI_API_KEY="your_xai_key"              # xAI 모델용
GROQ_API_KEY="your_groq_key"            # Groq 모델용
OPENROUTER_API_KEY="your_openrouter_key" # OpenRouter 모델용
AZURE_OPENAI_API_KEY="your_azure_key"   # Azure OpenAI 모델용
OLLAMA_API_KEY="your_ollama_key"        # 원격 Ollama 서버용

# GitHub 기능 (선택적)
GITHUB_API_KEY="ghp_..."                # GitHub 가져오기/내보내기 기능용
```

### **개발 환경 설정**

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### **빌드 및 배포**

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 📁 프로젝트 구조

```text
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
│   ├── docs/             # 프로젝트 문서
│   │   └── prd.txt       # 제품 요구사항 문서
│   └── templates/        # 템플릿 파일
├── env.example           # 환경 변수 예시 파일
└── package.json           # 프로젝트 설정
```

## 📊 프로젝트 진행 상황

### **전체 태스크 현황**

- **총 태스크 수**: 19개
- **총 서브태스크 수**: 95개
- **완료된 태스크**: 1개 (Next.js 14 프로젝트 초기화)
- **진행률**: 약 5%

### **복잡도별 태스크 분류**

- **높은 복잡도 (7점)**: 5개 태스크
- **중간 복잡도 (6점)**: 2개 태스크
- **보통 복잡도 (5점)**: 12개 태스크

### **우선순위별 진행 계획**

1. **기반 구축**: 데이터베이스, 인증, UI 컴포넌트
2. **핵심 기능**: CRUD, 검색, 목록/상세 페이지
3. **AI 통합**: Claude API, 음성 인식, 요약/분류
4. **고급 기능**: 실시간 협업, 분석, 고급 검색
5. **품질 보장**: 접근성, 성능 최적화, 배포

## 🎯 AI 기반 개발 환경

### **Cursor IDE 설정**

- **MCP 서버**: AI 도구 통합을 위한 설정
- **코딩 규칙**: 일관된 코드 스타일 및 품질 관리
- **AI 어시스턴트**: 실시간 코드 제안 및 리팩토링

### **Taskmaster 설정**

- **작업 관리**: AI 기반 작업 분해 및 우선순위 설정
- **프로젝트 계획**: 체계적인 개발 로드맵 관리
- **진행 추적**: 실시간 작업 진행 상황 모니터링

## 🚀 배포

### **Vercel 배포**

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### **환경 변수 설정 (Vercel)**

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

#### **필수 환경 변수**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `DATABASE_URL`

#### **선택적 환경 변수**

- `PERPLEXITY_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`
- `MISTRAL_API_KEY`
- `XAI_API_KEY`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `AZURE_OPENAI_API_KEY`
- `OLLAMA_API_KEY`
- `GITHUB_API_KEY`

## 🤝 기여하기

1. 이슈를 생성하여 버그나 기능 요청을 알려주세요
2. Fork 후 기능 브랜치를 생성하세요 (`feature/이슈번호` 형식)
3. 변경사항을 커밋하고 Pull Request를 생성하세요

### **커밋 메시지 규칙**

- 한국어 명령조 사용 (예: "기능 추가하라", "버그 수정하라")
- 구조: `[작업내용] [목적]하라`

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔗 관련 링크

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Cursor IDE](https://cursor.sh/)
- [Taskmaster](https://github.com/taskmaster-ai/taskmaster)
- [Vercel](https://vercel.com/)

---

**Memora** - AI가 이해하는 스마트 메모장 🧠✨
