'use client';

import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
} from './auth-utils';
import type { SignUpData, SignInData, AuthError } from './auth-utils';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // 초기 인증 상태 로드
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        console.log('Loading auth state...');

        // 세션을 먼저 가져와서 인증 상태 확인
        const sessionResult = await getSession();
        console.log('Session result:', sessionResult);

        if (sessionResult.session) {
          // 세션이 있으면 사용자 정보도 가져오기
          const userResult = await getCurrentUser();
          console.log('User result:', userResult);

          setAuthState({
            user: userResult.user,
            session: sessionResult.session,
            loading: false,
            error: userResult.error || sessionResult.error,
          });
        } else {
          // 세션이 없으면 로딩 상태 해제
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: sessionResult.error,
          });
        }
      } catch (error) {
        console.error('Auth state load error:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : '인증 상태를 로드하는 중 오류가 발생했습니다.',
          },
        });
      }
    };

    loadAuthState();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);

      setAuthState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      }));

      // 세션 변경 시 페이지 새로고침으로 서버 사이드 동기화
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('Auth state changed, refreshing page...');
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 회원가입
  const handleSignUp = async (data: SignUpData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await signUp(data);

    setAuthState((prev) => ({
      ...prev,
      user: result.user,
      loading: false,
      error: result.error,
    }));

    return result;
  };

  // 로그인
  const handleSignIn = async (data: SignInData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    console.log('Signing in with:', data.email);
    const result = await signIn(data);
    console.log('Sign in result:', result);

    if (!result.error && result.user) {
      // 로그인 성공 시 세션 정보도 업데이트
      const sessionResult = await getSession();
      console.log('Session after sign in:', sessionResult);

      setAuthState((prev) => ({
        ...prev,
        user: result.user,
        session: sessionResult.session,
        loading: false,
        error: result.error,
      }));
    } else {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: result.error,
      }));
    }

    return result;
  };

  // 로그아웃
  const handleSignOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await signOut();

    setAuthState((prev) => ({
      ...prev,
      user: null,
      session: null,
      loading: false,
      error: result.error,
    }));

    return result;
  };

  // 에러 초기화
  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    clearError,
    isAuthenticated: !!authState.user && !!authState.session,
  };
}
