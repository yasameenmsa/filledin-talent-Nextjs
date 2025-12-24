'use client';

import { usePathname } from 'next/navigation';
import { en } from './translations/en';
import { ar } from './translations/ar';
import { fr } from './translations/fr';

const translations = {
  en,
  ar,
  fr,
};

type TranslationParams = Record<string, string | number>;
type TranslationValue = string | Record<string, unknown>;

export const useTranslation = (lang?: string) => {
  const pathname = usePathname();
  const locale = lang || pathname.split('/')[1]; // Use provided lang or extract from pathname

  const t = (key: string, params?: TranslationParams): string => {
    if (!locale) return key; // Fallback if locale is not available

    const currentTranslations = translations[locale as keyof typeof translations];
    if (!currentTranslations) return key;

    // Handle nested keys by splitting and traversing the object
    const keys = key.split('.');
    let result: TranslationValue = currentTranslations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k] as TranslationValue;
      } else {
        return key; // Return the key if path doesn't exist
      }
    }

    // Ensure we return a string, not an object
    if (typeof result !== 'string') return key;

    // Handle parameter interpolation
    if (params) {
      return result.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match;
      });
    }

    return result;
  };

  return { t, locale };
};