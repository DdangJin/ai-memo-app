import { User } from '@supabase/supabase-js';

export interface HeaderProps {
  /**
   * 사이트 제목/브랜드명
   */
  title?: string;

  /**
   * 현재 인증된 사용자 정보
   */
  user?: User | null;

  /**
   * 로딩 상태
   */
  isLoading?: boolean;

  /**
   * 모바일 메뉴 표시 여부
   */
  showMobileMenu?: boolean;

  /**
   * 사용자 메뉴 표시 여부
   */
  showUserMenu?: boolean;

  /**
   * 모바일 메뉴 토글 핸들러
   */
  onMobileMenuToggle?: () => void;

  /**
   * 사용자 메뉴 토글 핸들러
   */
  onUserMenuToggle?: () => void;

  /**
   * 로그아웃 핸들러
   */
  onSignOut?: () => void;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}
