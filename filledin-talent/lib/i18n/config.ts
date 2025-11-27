export const languages = ['en', 'ar', 'fr'] as const;
export type Language = typeof languages[number];

export const defaultLanguage: Language = 'en';

// Language names in their native form
export const languageNames: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français'
};

// Language names translated to each language
export const translatedLanguageNames: Record<Language, Record<Language, string>> = {
  en: {
    en: 'English',
    ar: 'Arabic',
    fr: 'French'
  },
  ar: {
    en: 'الإنجليزية',
    ar: 'العربية',
    fr: 'الفرنسية'
  },
  fr: {
    en: 'Anglais',
    ar: 'Arabe',
    fr: 'Français'
  }
};

export const rtlLanguages: Language[] = ['ar'];