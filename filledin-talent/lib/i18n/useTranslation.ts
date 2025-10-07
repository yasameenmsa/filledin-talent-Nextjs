import { usePathname } from 'next/navigation';
import { en } from './translations/en';
import { ar } from './translations/ar';
import { fr } from './translations/fr';

const translations = {
  en,
  ar,
  fr,
};

export const useTranslation = () => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Assuming locale is the first part of the path

  const t = (key: string): string => {
    if (!locale) return key; // Fallback if locale is not available

    const [namespace, subkey] = key.split('.');
    const currentTranslations = translations[locale as keyof typeof translations];

    if (currentTranslations && namespace && subkey) {
      const namespaceTranslations = currentTranslations[namespace as keyof typeof currentTranslations];
      return (namespaceTranslations && namespaceTranslations[subkey as keyof typeof namespaceTranslations]) || key;
    }

    return key;
  };

  return { t, locale };
};