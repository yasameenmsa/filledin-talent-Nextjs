'use client';

// Re-export the useTranslation hook from the existing useTranslation file
export { useTranslation } from './useTranslation';

// Export types and configuration for client-side usage
export type { Language } from './config';
export { languages, defaultLanguage, languageNames, rtlLanguages } from './config';