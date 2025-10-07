'use client';

import Header from '@/components/layout/Header';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientLayoutWrapper({ children, currentLanguage, dir }: { children: React.ReactNode, currentLanguage: string, dir: string }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100" dir={dir}>
        <Header currentLanguage={currentLanguage} />
        <main className="pt-16">{children}</main>
      </div>
    </AuthProvider>
  );
}