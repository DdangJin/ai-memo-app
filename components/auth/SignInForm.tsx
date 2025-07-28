'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export default function SignInForm({
  onSuccess,
  onSwitchToSignUp,
}: SignInFormProps) {
  const { loading, error, clearError } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 이메일 검증
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    console.log('Submitting login form...');

    try {
      // 클라이언트 사이드에서 직접 Supabase 로그인
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (signInError) {
        console.log('Login failed:', signInError);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('Login successful, redirecting...');
        onSuccess?.();

        // 로그인 성공 시 페이지 새로고침으로 서버 사이드 동기화
        window.location.href = '/memos';
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
        <Button onClick={() => router.push('/')} variant="outline" size="sm">
          홈으로
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.email ? 'border-red-500' : ''
            }`}
            placeholder="이메일을 입력하세요"
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.password ? 'border-red-500' : ''
            }`}
            placeholder="비밀번호를 입력하세요"
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  로그인 오류
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{typeof error === 'string' ? error : error.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || loading}
          className="w-full"
        >
          {isLoading || loading ? '로그인 중...' : '로그인'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            계정이 없으신가요? 회원가입
          </button>
        </div>
      </form>
    </div>
  );
}
