# 📚 Components Usage Guide

Memora 프로젝트의 UI 컴포넌트 사용법과 접근성 기능을 설명합니다.

## 🎯 접근성 준수 상태

✅ **WCAG 2.1 AA 표준 준수**

- 색상 대비 비율 4.5:1 이상
- 키보드 네비게이션 완전 지원
- 스크린 리더 호환성
- ARIA 속성 완전 구현

## 📋 컴포넌트 목록

### 1. Layout Component

전체 페이지 구조를 관리하는 메인 레이아웃 컴포넌트입니다.

#### **Layout 기본 사용법**

```tsx
import { Layout } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function MyPage() {
  const { user, signOut } = useAuth();

  return (
    <Layout
      user={user}
      title="My App"
      showSidebar={true}
      showFooter={true}
      onSignOut={signOut}
    >
      <h1>페이지 콘텐츠</h1>
    </Layout>
  );
}
```

#### **Layout Props**

| Prop          | Type           | Default    | Description        |
| ------------- | -------------- | ---------- | ------------------ |
| `children`    | `ReactNode`    | -          | 메인 콘텐츠 (필수) |
| `user`        | `User \| null` | `null`     | 현재 사용자 정보   |
| `title`       | `string`       | `"Memora"` | 사이트 제목        |
| `showSidebar` | `boolean`      | `false`    | 사이드바 표시 여부 |
| `showFooter`  | `boolean`      | `false`    | 푸터 표시 여부     |
| `maxWidth`    | `string`       | `"full"`   | 컨테이너 최대 너비 |
| `onSignOut`   | `function`     | -          | 로그아웃 핸들러    |

#### **Layout 접근성 기능**

- ✅ **시맨틱 HTML**: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` 사용
- ✅ **Landmark 역할**: 각 영역에 적절한 ARIA 역할 설정
- ✅ **키보드 네비게이션**: Tab 순서 논리적 구성
- ✅ **스크린 리더**: 영역별 명확한 라벨 제공

### 2. Header Component

사이트 헤더와 메인 네비게이션을 담당하는 컴포넌트입니다.

#### **Header 기본 사용법**

```tsx
import { Header } from '@/components/ui';

<Header
  title="My App"
  user={user}
  showMobileMenu={isMobileMenuOpen}
  onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  onSignOut={handleSignOut}
/>;
```

#### **Header Props**

| Prop                 | Type           | Default    | Description           |
| -------------------- | -------------- | ---------- | --------------------- |
| `title`              | `string`       | `"Memora"` | 사이트 제목           |
| `user`               | `User \| null` | `null`     | 사용자 정보           |
| `showMobileMenu`     | `boolean`      | `false`    | 모바일 메뉴 열림 상태 |
| `onMobileMenuToggle` | `function`     | -          | 모바일 메뉴 토글      |
| `onSignOut`          | `function`     | -          | 로그아웃 핸들러       |

#### **Header 접근성 기능**

- ✅ **역할 속성**: `role="banner"` 설정
- ✅ **ARIA 라벨**: 모든 버튼에 설명적 라벨
- ✅ **키보드 지원**: Tab, Enter, Space 키 지원
- ✅ **포커스 관리**: 시각적 포커스 표시
- ✅ **사용자 메뉴**: Escape 키로 닫기, 외부 클릭 감지

#### **Header 키보드 단축키**

- `Tab` / `Shift+Tab`: 요소 간 이동
- `Enter` / `Space`: 버튼 활성화
- `Escape`: 드롭다운 메뉴 닫기

### 3. Navigation Component

네비게이션 메뉴를 관리하는 고급 컴포넌트입니다.

#### **Navigation 기본 사용법**

```tsx
import { Navigation } from '@/components/ui'
import type { NavigationItem } from '@/components/ui'

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    href: '/dashboard',
    icon: <DashboardIcon />
  },
  {
    id: 'settings',
    label: '설정',
    href: '#',
    children: [
      { id: 'profile', label: '프로필', href: '/profile' },
      { id: 'account', label: '계정', href: '/account' }
    ]
  }
]

<Navigation
  items={navigationItems}
  isVertical={true}
  onItemClick={handleItemClick}
/>
```

#### **NavigationItem 인터페이스**

```tsx
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  children?: NavigationItem[];
  external?: boolean;
  'aria-label'?: string;
}
```

#### **Navigation Props**

| Prop               | Type               | Default             | Description            |
| ------------------ | ------------------ | ------------------- | ---------------------- |
| `items`            | `NavigationItem[]` | `[]`                | 네비게이션 아이템 배열 |
| `isVertical`       | `boolean`          | `false`             | 세로 방향 레이아웃     |
| `isMobileMenuOpen` | `boolean`          | `false`             | 모바일 메뉴 상태       |
| `onItemClick`      | `function`         | -                   | 아이템 클릭 핸들러     |
| `aria-label`       | `string`           | `"메인 네비게이션"` | ARIA 라벨              |

#### **Navigation 접근성 기능**

- ✅ **ARIA 역할**: `navigation`, `menubar`, `menu`, `menuitem`
- ✅ **키보드 네비게이션**: 화살표 키로 이동
- ✅ **상태 관리**: `aria-expanded`, `aria-current` 속성
- ✅ **포커스 트래핑**: 드롭다운 내 포커스 관리
- ✅ **스크린 리더**: 구조적 정보 제공

#### **Navigation 키보드 단축키**

- `ArrowDown` / `ArrowRight`: 다음 아이템으로 이동
- `ArrowUp` / `ArrowLeft`: 이전 아이템으로 이동
- `Enter` / `Space`: 아이템 선택/드롭다운 토글
- `Escape`: 드롭다운 닫기
- `Tab`: 네비게이션 영역 나가기

## 🎨 스타일링 가이드

### **TailwindCSS 클래스**

컴포넌트들은 TailwindCSS 유틸리티 클래스를 사용합니다:

```tsx
// 반응형 디자인
className = 'w-full md:w-1/2 lg:w-1/3';

// 다크모드 지원
className = 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

// 접근성 포커스
className =
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
```

### **색상 대비**

모든 텍스트와 배경색 조합이 WCAG 2.1 AA 기준을 충족합니다:

- **일반 텍스트**: 4.5:1 이상
- **대형 텍스트**: 3:1 이상
- **그래픽 요소**: 3:1 이상

## 🧪 테스트 가이드

### **접근성 테스트**

#### **자동화 도구**

```bash
# Lighthouse 접근성 감사
npm run lighthouse

# axe-core 테스트 (개발 도구에서)
# Chrome DevTools > Lighthouse > Accessibility
```

#### **수동 테스트**

1. **키보드 전용 테스트**
   - Tab 키만으로 모든 인터랙티브 요소 접근
   - Enter/Space로 버튼 활성화
   - Escape로 모달/드롭다운 닫기

2. **스크린 리더 테스트**
   - NVDA (Windows)
   - VoiceOver (macOS)
   - JAWS (Windows)

3. **시각적 테스트**
   - 고대비 모드에서 가독성 확인
   - 200% 확대에서 레이아웃 확인
   - 포커스 표시 명확성 확인

### **반응형 테스트**

```bash
# 다양한 화면 크기에서 테스트
# - Mobile: 320px - 768px
# - Tablet: 768px - 1024px
# - Desktop: 1024px+

# Chrome DevTools Device Toolbar 사용
```

## 🔧 커스터마이징

### **테마 확장**

TailwindCSS 설정을 통해 컴포넌트 스타일을 커스터마이징할 수 있습니다:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
};
```

### **컴포넌트 확장**

기본 컴포넌트를 확장하여 프로젝트별 요구사항을 충족할 수 있습니다:

```tsx
import { Layout as BaseLayout, LayoutProps } from '@/components/ui';

interface CustomLayoutProps extends LayoutProps {
  customFeature?: boolean;
}

export function CustomLayout(props: CustomLayoutProps) {
  return (
    <BaseLayout {...props} className={cn(props.className, 'custom-layout')} />
  );
}
```

## 📱 모바일 고려사항

### **터치 인터페이스**

- 최소 터치 영역: 44px × 44px (Apple HIG 기준)
- 터치 요소 간 최소 간격: 8px
- 스와이프 제스처 지원

### **성능 최적화**

- 모바일에서 불필요한 애니메이션 최소화
- 터치 지연(300ms) 방지
- 뷰포트 메타 태그 적용

## 🚀 Best Practices

### **개발 시 주의사항**

1. **접근성 우선**: 시각적 디자인보다 접근성을 우선 고려
2. **의미론적 HTML**: 적절한 HTML 요소 사용
3. **키보드 지원**: 모든 기능이 키보드로 접근 가능해야 함
4. **에러 처리**: 명확한 에러 메시지와 복구 방법 제공
5. **일관성**: 컴포넌트 간 동일한 패턴 사용

### **코드 리뷰 체크리스트**

- [ ] ARIA 속성이 올바르게 설정되었는가?
- [ ] 키보드 네비게이션이 작동하는가?
- [ ] 색상 대비가 충분한가?
- [ ] 반응형 디자인이 적용되었는가?
- [ ] 에러 상태가 처리되었는가?
- [ ] 로딩 상태가 표시되는가?

이 가이드를 따라 일관성 있고 접근 가능한 사용자 인터페이스를 구축하세요! 🎉
