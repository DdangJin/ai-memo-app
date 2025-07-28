'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import Button from '@/components/ui/Button';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export default function SignUpForm({
  onSuccess,
  onSwitchToSignIn,
}: SignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name || undefined,
    });

    if (!result.error) {
      onSuccess?.();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 입력 시 해당 필드의 에러 메시지 제거
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {/* 홈 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">회원가입</h2>
          <Button onClick={handleGoHome} variant="outline" size="sm">
            홈으로
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이름 (선택)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 이메일 입력 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일 *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="이메일을 입력하세요"
              required
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호 *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              required
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호 확인 *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        {/* 로그인 페이지로 이동 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
