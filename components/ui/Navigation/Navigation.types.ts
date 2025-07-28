export interface NavigationItem {
  /**
   * 네비게이션 아이템 ID
   */
  id: string;

  /**
   * 표시될 텍스트
   */
  label: string;

  /**
   * 링크 URL
   */
  href: string;

  /**
   * 아이콘 (선택사항)
   */
  icon?: React.ReactNode;

  /**
   * 활성 상태 여부
   */
  isActive?: boolean;

  /**
   * 비활성화 여부
   */
  disabled?: boolean;

  /**
   * 하위 메뉴 아이템들
   */
  children?: NavigationItem[];

  /**
   * 외부 링크 여부
   */
  external?: boolean;

  /**
   * 접근성 설명
   */
  'aria-label'?: string;
}

export interface NavigationProps {
  /**
   * 네비게이션 아이템들
   */
  items: NavigationItem[];

  /**
   * 현재 경로 (활성 상태 판단용)
   */
  currentPath?: string;

  /**
   * 모바일 메뉴 표시 여부
   */
  isMobileMenuOpen?: boolean;

  /**
   * 세로 방향 레이아웃 여부
   */
  isVertical?: boolean;

  /**
   * 드롭다운 메뉴 표시 여부
   */
  showDropdown?: boolean;

  /**
   * 모바일 메뉴 닫기 핸들러
   */
  onMobileMenuClose?: () => void;

  /**
   * 네비게이션 아이템 클릭 핸들러
   */
  onItemClick?: (item: NavigationItem) => void;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * ARIA 라벨
   */
  'aria-label'?: string;
}
