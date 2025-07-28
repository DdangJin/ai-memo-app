# 🧩 Component Development Guidelines

## 📁 Directory Structure

```
components/
├── ui/                 # 재사용 가능한 UI 컴포넌트
│   ├── Header/        # 헤더 컴포넌트
│   ├── Navigation/    # 네비게이션 컴포넌트
│   ├── Layout/        # 레이아웃 컴포넌트
│   ├── Button/        # 버튼 컴포넌트
│   ├── Input/         # 입력 컴포넌트
│   └── Modal/         # 모달 컴포넌트
├── forms/             # 폼 관련 컴포넌트
├── layout/            # 페이지 레이아웃 컴포넌트
└── common/            # 공통 유틸리티 컴포넌트
```

## 🏷️ Naming Conventions

### **컴포넌트 파일**

- **Format**: `PascalCase.tsx`
- **Examples**: `Header.tsx`, `NavigationMenu.tsx`, `UserProfile.tsx`

### **컴포넌트 폴더**

- **Format**: `PascalCase` (컴포넌트명과 동일)
- **Examples**: `Header/`, `Navigation/`, `UserProfile/`

### **Props 인터페이스**

- **Format**: `PascalCase` + `Props` suffix
- **Examples**: `HeaderProps`, `NavigationProps`, `UserProfileProps`

```typescript
interface HeaderProps {
  title: string;
  showUserMenu?: boolean;
  onMenuToggle?: () => void;
}
```

### **CSS Modules**

- **Format**: `component-name.module.css`
- **Examples**: `header.module.css`, `navigation-menu.module.css`

### **타입 정의**

- **Properties**: `camelCase`
- **Interfaces**: `PascalCase`
- **Enums**: `PascalCase`

```typescript
interface ButtonProps {
  variant: ButtonVariant;
  isLoading?: boolean;
  onClick?: (event: MouseEvent) => void;
}

enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
}
```

## 📂 Component Structure Template

각 컴포넌트 폴더는 다음과 같은 구조를 따릅니다:

```
ComponentName/
├── index.ts           # Barrel export
├── ComponentName.tsx  # 메인 컴포넌트
├── ComponentName.module.css  # 스타일 (필요시)
├── ComponentName.types.ts    # 타입 정의 (필요시)
└── ComponentName.stories.tsx # Storybook (필요시)
```

### **index.ts (Barrel Export)**

```typescript
export { default as ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';
```

### **컴포넌트 템플릿**

```typescript
'use client'

import { ComponentNameProps } from './ComponentName.types'
import styles from './ComponentName.module.css'

export default function ComponentName({
  prop1,
  prop2,
  ...props
}: ComponentNameProps) {
  return (
    <div className={styles.container} {...props}>
      {/* 컴포넌트 내용 */}
    </div>
  )
}
```

## 🎨 Styling Guidelines

### **TailwindCSS 우선**

- 가능한 TailwindCSS 유틸리티 클래스 사용
- 복잡한 스타일은 CSS Modules로 보완

### **반응형 디자인**

```typescript
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* 반응형 너비 */}
</div>
```

### **다크모드 지원**

```typescript
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  {/* 다크모드 대응 */}
</div>
```

## ♿ Accessibility Guidelines

### **시맨틱 HTML**

```typescript
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <button aria-expanded="false" aria-controls="menu">
      메뉴
    </button>
  </nav>
</header>
```

### **ARIA 속성**

- `aria-label`: 요소 설명
- `aria-expanded`: 확장 상태
- `aria-controls`: 제어 대상
- `aria-describedby`: 추가 설명

### **키보드 네비게이션**

- 모든 인터랙티브 요소에 `tabIndex` 설정
- `Enter`, `Space`, `Escape` 키 지원
- 포커스 표시 제공

### **색상 대비**

- WCAG 2.1 AA 기준 4.5:1 이상
- 텍스트와 배경색 대비 확인

## 🧪 Testing Guidelines

### **컴포넌트 테스트**

```typescript
import { render, screen } from '@testing-library/react'
import ComponentName from './ComponentName'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop1="value" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### **접근성 테스트**

- `@testing-library/jest-dom` 사용
- `axe-core` 자동화 테스트
- 키보드 네비게이션 테스트

## 📚 Import/Export Patterns

### **Barrel Exports**

```typescript
// components/ui/index.ts
export { Header } from './Header';
export { Navigation } from './Navigation';
export { Layout } from './Layout';
```

### **Import 순서**

```typescript
// 1. React 관련
import React, { useState, useEffect } from 'react';

// 2. 외부 라이브러리
import { clsx } from 'clsx';

// 3. 내부 컴포넌트
import { Button } from '@/components/ui';

// 4. 유틸리티 및 타입
import { cn } from '@/utils/cn';
import type { ComponentProps } from './types';

// 5. 스타일
import styles from './Component.module.css';
```

## 🔄 Component Lifecycle

1. **계획**: 컴포넌트 요구사항 정의
2. **설계**: Props 인터페이스 설계
3. **구현**: 컴포넌트 코드 작성
4. **스타일링**: TailwindCSS + CSS Modules
5. **접근성**: ARIA 속성 및 키보드 지원
6. **테스트**: 단위 테스트 및 접근성 테스트
7. **문서화**: 사용법 및 예제 작성
8. **리뷰**: 코드 리뷰 및 개선

이 가이드라인을 따라 일관성 있고 접근 가능한 컴포넌트를 개발하세요!
