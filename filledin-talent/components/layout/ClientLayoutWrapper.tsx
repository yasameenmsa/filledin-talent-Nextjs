'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import { AuthSessionProvider } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n/config';

// import { SessionTimeoutProvider } from '@/components/ui/SessionTimeoutWarning';

import { usePathname } from 'next/navigation';

export default function ClientLayoutWrapper({ children, dir, lang }: { children: React.ReactNode, dir: string, lang: string }) {
  const { setLanguage } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    if (lang && ['en', 'ar', 'fr'].includes(lang)) {
      setLanguage(lang as Language);
    }
  }, [lang, setLanguage]);

  const isDashboard = pathname?.includes('/jobseeker') || pathname?.includes('/admin');

  return (
    <AuthSessionProvider>
      {/* <SessionTimeoutProvider> */}
      <div className="min-h-screen bg-gray-100 flex flex-col" dir={dir}>
        <Header />
        <main className="flex-grow pt-16">{children}</main>
        <div className={isDashboard ? "lg:ps-64" : ""}>
          <Footer />
        </div>
      </div>
      {/* </SessionTimeoutProvider> */}
    </AuthSessionProvider>
  );
}