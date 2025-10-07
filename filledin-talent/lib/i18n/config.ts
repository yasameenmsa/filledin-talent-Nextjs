export const languages = ['en', 'ar', 'fr'] as const;
export type Language = typeof languages[number];

export const defaultLanguage: Language = 'en';

export const languageNames: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français'
};

export const rtlLanguages: Language[] = ['ar'];