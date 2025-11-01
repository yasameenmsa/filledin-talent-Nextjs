'use client';

import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language, languageNames } from '@/lib/i18n/config';
import { motion, AnimatePresence } from 'framer-motion';

export function LocaleSwitcher() {
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = ['en', 'ar', 'fr'];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 
          hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4" />
        <span>{languageNames[currentLanguage]}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isRTL ? 'chevron-right' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 
              py-1 z-50 language-switcher
              ${isRTL ? 'right-0' : 'left-0'}
            `}
          >
            {languages.map((language) => (
              <button
                key={language}
                onClick={() => handleLanguageChange(language)}
                className={`
                  w-full px-4 py-2 text-sm text-left hover:bg-gray-50 
                  transition-colors flex items-center gap-3
                  ${currentLanguage === language ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                  ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}
                `}
              >
                {/* <span className="text-lg">
                  {language === 'en' && '🇺🇸'}
                  {language === 'ar' && '🇸🇦'}
                  {language === 'fr' && '🇫🇷'}
                </span> */}
                <span>{languageNames[language]}</span>
                {currentLanguage === language && (
                  <span className={`ml-auto text-blue-600 ${isRTL ? 'mr-auto ml-0' : ''}`}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Legacy component for backward compatibility
export function LanguageSwitcher() {
  return <LocaleSwitcher />;
}