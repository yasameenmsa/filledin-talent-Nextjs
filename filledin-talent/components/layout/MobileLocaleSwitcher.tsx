'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n/config';
import { usePathname, useRouter } from 'next/navigation';

interface LanguageConfig {
    code: Language;
    name: string;
    nativeName: string;
}

const LANGUAGES: LanguageConfig[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
];

export function MobileLocaleSwitcher() {
    const { currentLanguage, setLanguage, isRTL } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const handleLanguageChange = (newLanguage: Language) => {
        if (currentLanguage === newLanguage) return;

        setLanguage(newLanguage);

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

    return (
        <div className="flex flex-col gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <span className="text-sm font-medium text-gray-500 px-1">
                {currentLanguage === 'ar' ? 'اللغة' : currentLanguage === 'fr' ? 'Langue' : 'Language'}
            </span>
            <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`
                px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                flex items-center justify-center
                ${isSelected
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
              `}
                        >
                            {lang.nativeName}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
