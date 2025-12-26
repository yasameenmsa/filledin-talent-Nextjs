'use client';

import Header from '@/components/layout/Header';
import { AuthSessionProvider } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
// import { SessionTimeoutProvider } from '@/components/ui/SessionTimeoutWarning';

export default function ClientLayoutWrapper({ children, dir }: { children: React.ReactNode, dir: string }) {
  return (
    <AuthSessionProvider>
      {/* <SessionTimeoutProvider> */}
      <div className="min-h-screen bg-gray-100 flex flex-col" dir={dir}>
        <Header />
        <main className="flex-grow pt-16">{children}</main>
        <Footer />
      </div>
      {/* </SessionTimeoutProvider> */}
    </AuthSessionProvider>
  );
}