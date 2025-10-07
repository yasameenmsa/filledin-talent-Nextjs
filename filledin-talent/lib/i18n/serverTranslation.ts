import { en } from './translations/en';
import { ar } from './translations/ar';
import { fr } from './translations/fr';

const translations = {
  en,
  ar,
  fr,
};

export const getServerTranslation = (locale: string = 'en') => {
  const t = (key: string, params?: Record<string, any>): string => {
    if (!locale) return key; // Fallback if locale is not available

    const currentTranslations = translations[locale as keyof typeof translations];
    if (!currentTranslations) return key;

    // Handle nested keys by splitting and traversing the object
    const keys = key.split('.');
    let result: any = currentTranslations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
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