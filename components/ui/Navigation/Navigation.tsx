'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import type { NavigationProps, NavigationItem } from './Navigation.types';

export default function Navigation({
  items,
  currentPath,
  isMobileMenuOpen = false,
  isVertical = false,
  showDropdown = true,
  onMobileMenuClose,
  onItemClick,
  className,
  'aria-label': ariaLabel = '메인 네비게이션',
}: NavigationProps) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navigationRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const activePath = currentPath || pathname;

  // 드롭다운 토글
  const toggleDropdown = useCallback((itemId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // 모든 드롭다운 닫기
  const closeAllDropdowns = useCallback(() => {
    setOpenDropdowns(new Set());
  }, []);

  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;
      const flatItems = items.flatMap(item =>
        item.children ? [item, ...item.children] : [item]
      );

      switch (key) {
        case 'Escape':
          closeAllDropdowns();
          setFocusedIndex(-1);
          break;

        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          setFocusedIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : 0));
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : flatItems.length - 1));
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) {
            const item = flatItems[focusedIndex];
            if (item.children) {
              toggleDropdown(item.id);
            } else {
              onItemClick?.(item);
              onMobileMenuClose?.();
            }
          }
          break;

        case 'Tab':
          closeAllDropdowns();
          break;
      }
    },
    [
      items,
      focusedIndex,
      toggleDropdown,
      closeAllDropdowns,
      onItemClick,
      onMobileMenuClose,
    ]
  );

  // 포커스 관리
  useEffect(() => {
    const flatItems = items.flatMap(item =>
      item.children ? [item, ...item.children] : [item]
    );

    if (focusedIndex >= 0 && focusedIndex < flatItems.length) {
      const item = flatItems[focusedIndex];
      const element = itemRefs.current.get(item.id);
      element?.focus();
    }
  }, [focusedIndex, items]);

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        closeAllDropdowns();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAllDropdowns]);

  // 아이템이 활성 상태인지 확인
  const isItemActive = useCallback(
    (item: NavigationItem): boolean => {
      if (item.isActive !== undefined) {
        return item.isActive;
      }
      return activePath === item.href || activePath.startsWith(item.href + '/');
    },
    [activePath]
  );

  // ref 콜백 함수
  const setItemRef = useCallback((id: string) => {
    return (el: HTMLElement | null) => {
      if (el) {
        itemRefs.current.set(id, el);
      } else {
        itemRefs.current.delete(id);
      }
    };
  }, []);

  // 네비게이션 아이템 렌더링
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = openDropdowns.has(item.id);

    const handleItemClick = (e: React.MouseEvent) => {
      if (item.disabled) {
        e.preventDefault();
        return;
      }

      if (hasChildren) {
        e.preventDefault();
        toggleDropdown(item.id);
      } else {
        onItemClick?.(item);
        onMobileMenuClose?.();
      }
    };

    const linkClasses = cn(
      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      {
        'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20':
          isActive,
        'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800':
          !isActive && !item.disabled,
        'text-gray-400 cursor-not-allowed dark:text-gray-600': item.disabled,
        'justify-between': hasChildren,
      },
      level > 0 && 'ml-4 pl-6'
    );

    const content = (
      <>
        <span className="flex items-center space-x-2">
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
        </span>
        {hasChildren && (
          <svg
            className={cn(
              'ml-2 h-4 w-4 transition-transform',
              isDropdownOpen ? 'rotate-180' : ''
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        )}
      </>
    );

    return (
      <li key={item.id} role="none">
        {hasChildren ? (
          <button
            ref={setItemRef(item.id)}
            type="button"
            onClick={handleItemClick}
            disabled={item.disabled}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label={item['aria-label'] || `${item.label} 메뉴`}
            className={linkClasses}
          >
            {content}
          </button>
        ) : (
          <Link
            ref={setItemRef(item.id)}
            href={item.href}
            onClick={handleItemClick}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            aria-label={item['aria-label']}
            aria-current={isActive ? 'page' : undefined}
            className={linkClasses}
          >
            {content}
          </Link>
        )}

        {/* 하위 메뉴 */}
        {hasChildren && isDropdownOpen && item.children && (
          <ul
            role="menu"
            aria-orientation="vertical"
            className={cn(
              'mt-1 space-y-1',
              isVertical
                ? 'ml-4'
                : 'absolute top-full left-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700'
            )}
          >
            {item.children.map(child => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      ref={navigationRef}
      role="navigation"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative',
        {
          'hidden md:block': !isMobileMenuOpen && !isVertical,
          block: isMobileMenuOpen || isVertical,
        },
        className
      )}
    >
      <ul
        role="menubar"
        aria-orientation={isVertical ? 'vertical' : 'horizontal'}
        className={cn('space-y-1', {
          'md:flex md:space-x-6 md:space-y-0': !isVertical,
          'flex flex-col space-y-2': isVertical,
        })}
      >
        {items.map(item => renderNavigationItem(item))}
      </ul>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && !isVertical && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
