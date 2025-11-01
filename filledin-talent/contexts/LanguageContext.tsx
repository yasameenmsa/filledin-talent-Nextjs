'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, defaultLanguage, rtlLanguages } from '@/lib/i18n/config';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    initialLanguage || defaultLanguage
  );

  const isRTL = rtlLanguages.includes(currentLanguage);
  const direction = isRTL ? 'rtl' : 'ltr';

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language);
    }
  };

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred-language') as Language;
      if (stored && ['en', 'ar', 'fr'].includes(stored)) {
        setCurrentLanguage(stored);
      }
    }
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage, direction]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isRTL,
    direction,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}