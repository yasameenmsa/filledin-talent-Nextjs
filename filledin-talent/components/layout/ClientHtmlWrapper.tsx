'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ClientHtmlWrapper({ children }: { children: React.ReactNode }) {
  const { currentLanguage, isRTL, direction } = useLanguage();

  useEffect(() => {
    // Update HTML attributes dynamically
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = direction;
    
    // Add/remove RTL class for additional styling
    if (isRTL) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [currentLanguage, isRTL, direction]);

  return <>{children}</>;
}