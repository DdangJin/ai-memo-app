'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const router = useRouter();

  const handleSuccess = () => {
    // 로그인/회원가입 성공 시 메인 페이지로 이동
    router.push('/');
  };

  const handleSwitchToSignUp = () => {
    setMode('signup');
  };

  const handleSwitchToSignIn = () => {
    setMode('signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {mode === 'signin' ? (
          <SignInForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        ) : (
          <SignUpForm
            onSuccess={handleSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
      </div>
    </div>
  );
}
