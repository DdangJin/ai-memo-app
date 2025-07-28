import { User } from '@supabase/supabase-js';
import type { NavigationItem } from '../Navigation/Navigation.types';

export interface LayoutProps {
  /**
   * 메인 콘텐츠
   */
  children: React.ReactNode;

  /**
   * 현재 인증된 사용자
   */
  user?: User | null;

  /**
   * 로딩 상태
   */
  isLoading?: boolean;

  /**
   * 사이트 제목
   */
  title?: string;

  /**
   * 네비게이션 아이템들
   */
  navigationItems?: NavigationItem[];

  /**
   * 사이드바 표시 여부
   */
  showSidebar?: boolean;

  /**
   * 사이드바 콘텐츠
   */
  sidebar?: React.ReactNode;

  /**
   * 푸터 표시 여부
   */
  showFooter?: boolean;

  /**
   * 푸터 콘텐츠
   */
  footer?: React.ReactNode;

  /**
   * 컨테이너 최대 너비
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

  /**
   * 패딩 설정
   */
  padding?: boolean;

  /**
   * 로그아웃 핸들러
   */
  onSignOut?: () => void;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}
