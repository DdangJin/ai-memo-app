'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/ui/Layout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user, loading, signOut } = useAuth();

  return (
    <Layout
      user={user}
      isLoading={loading}
      onSignOut={signOut}
      className="min-h-screen"
    >
      {children}
    </Layout>
  );
}
