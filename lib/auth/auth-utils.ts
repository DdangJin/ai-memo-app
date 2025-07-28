import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// 회원가입 함수 (이메일 확인 필요)
export async function signUp(
  data: SignUpData
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const signUpOptions: any = {
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    };

    // 클라이언트 사이드에서만 emailRedirectTo 설정
    if (typeof window !== 'undefined') {
      signUpOptions.options.emailRedirectTo = `${window.location.origin}/auth/callback`;
    }

    const { data: authData, error } = await supabase.auth.signUp(signUpOptions);

    if (error) {
      return {
        user: null,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    return {
      user: authData.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : '회원가입 중 오류가 발생했습니다.',
      },
    };
  }
}

// Supabase Admin API를 사용하여 직접 사용자 생성 (서버 사이드에서만 사용)
export async function createUserDirectly(
  data: SignUpData
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    // 서버 사이드에서만 실행되어야 함
    if (typeof window !== 'undefined') {
      throw new Error('이 함수는 서버 사이드에서만 사용할 수 있습니다.');
    }

    // Supabase Admin 클라이언트 생성 (서버 사이드)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // 서비스 롤 키 필요
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser(
      {
        email: data.email,
        password: data.password,
        email_confirm: true, // 이메일 확인 없이 바로 활성화
        user_metadata: {
          name: data.name,
        },
      }
    );

    if (error) {
      return {
        user: null,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    return {
      user: authData.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : '사용자 생성 중 오류가 발생했습니다.',
      },
    };
  }
}

// 로그인 함수
export async function signIn(
  data: SignInData
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        user: null,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    return {
      user: authData.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : '로그인 중 오류가 발생했습니다.',
      },
    };
  }
}

// 로그아웃 함수
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : '로그아웃 중 오류가 발생했습니다.',
      },
    };
  }
}

// 현재 사용자 가져오기
export async function getCurrentUser(): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        user: null,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      },
    };
  }
}

// 세션 가져오기
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return {
        session: null,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    return {
      session,
      error: null,
    };
  } catch (error) {
    return {
      session: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : '세션을 가져오는 중 오류가 발생했습니다.',
      },
    };
  }
}

// 이메일 확인 함수
export async function confirmEmail(
  token: string,
  email: string,
  type: 'signup' | 'recovery' = 'signup'
) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token,
      email,
      type,
    });

    if (error) {
      return {
        user: null,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    return {
      user: data.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : '이메일 확인 중 오류가 발생했습니다.',
      },
    };
  }
}
