'use client';

import Header from '@/components/layout/Header';
import { AuthSessionProvider } from '@/contexts/AuthContext';
// import { SessionTimeoutProvider } from '@/components/ui/SessionTimeoutWarning';

export default function ClientLayoutWrapper({ children, currentLanguage, dir }: { children: React.ReactNode, currentLanguage: string, dir: string }) {
  return (
    <AuthSessionProvider>
      {/* <SessionTimeoutProvider> */}
        <div className="min-h-screen bg-gray-100" dir={dir}>
          <Header />
          <main className="pt-16">{children}</main>
        </div>
      {/* </SessionTimeoutProvider> */}
    </AuthSessionProvider>
  );
}