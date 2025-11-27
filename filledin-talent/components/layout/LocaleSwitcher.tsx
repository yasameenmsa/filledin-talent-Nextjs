'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language, translatedLanguageNames } from '@/lib/i18n/config';
import { usePathname, useRouter } from 'next/navigation';

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
}

// Configuration
const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

export function LocaleSwitcher() {
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentLangConfig = LANGUAGES.find(lang => lang.code === currentLanguage);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);

    // Redirect to the new language path
    if (pathname) {
      const segments = pathname.split('/');
      // Assuming path starts with /lang/..., segments[1] is the language
      if (segments.length > 1 && ['en', 'fr', 'ar'].includes(segments[1])) {
        segments[1] = newLanguage;
        const newPath = segments.join('/');
        router.push(newPath);
      } else {
        // If path doesn't start with lang (e.g. root), prepend it or handle accordingly
        router.push(`/${newLanguage}${pathname === '/' ? '' : pathname}`);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, language: Language) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLanguageChange(language);
    }
  };

  // Get translated language name
  const getLanguageName = (langCode: Language) => {
    return translatedLanguageNames[currentLanguage]?.[langCode] ||
      LANGUAGES.find(l => l.code === langCode)?.nativeName ||
      langCode;
  };

  return (
    <div className="relative inline-block" dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        className={`
          group relative inline-flex items-center gap-2.5 px-1 py-2.5 
          text-sm font-medium text-gray-700 bg-white
          border border-gray-300 rounded-lg
          hover:bg-gray-50 hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          shadow-sm hover:shadow
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />

        <div className="flex items-center gap-2">
          <span className="font-medium">{currentLangConfig?.nativeName}</span>
        </div>

        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Language options"
          className={`
            absolute z-50 mt-2 ${isRTL ? 'w-30' : 'w-48'}
            bg-white rounded-lg shadow-xl border border-gray-200
            py-2 overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
            ${isRTL ? 'left-0' : 'right-0'}
          `}
          style={{
            animation: 'dropdownIn 0.2s ease-out',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          <div className={`px-3 py-2 border-b border-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {currentLanguage === 'ar' ? 'اختر اللغة' : currentLanguage === 'fr' ? 'Sélectionner la langue' : 'Select Language'}
            </p>
          </div>

          <div className="py-1">
            {LANGUAGES.map((language) => {
              const isSelected = currentLanguage === language.code;
              const langIsRTL = language.code === 'ar';

              return (
                <button
                  key={language.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleLanguageChange(language.code)}
                  onKeyDown={(e) => handleKeyDown(e, language.code)}
                  className={`
                    w-full px-4 py-3 text-sm
                    flex items-center justify-between gap-3
                    hover:bg-gray-50 active:bg-gray-100
                    transition-colors duration-150
                    ${isSelected ? 'bg-blue-50' : ''}
                    ${langIsRTL ? 'flex-row-reverse' : ''}
                  `}
                  dir={langIsRTL ? 'rtl' : 'ltr'}
                >
                  <div className={`flex items-center gap-3 ${langIsRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex flex-col ${langIsRTL ? 'items-end' : 'items-start'}`}>
                      <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                        {getLanguageName(language.code)}
                      </span>
                      <span className="text-xs text-gray-500">{language.name}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

// Legacy component for backward compatibility
export function LanguageSwitcher() {
  return <LocaleSwitcher />;
}