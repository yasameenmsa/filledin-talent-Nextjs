'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useTranslation();

  const changeLocale = (newLocale: string) => {
    const newPath = `/${newLocale}${pathname.substring(3)}`; // Assuming /en/path, /ar/path, /fr/path
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLocale('en')}
        className={locale === 'en' ? 'font-bold' : ''}
      >
        EN
      </button>
      <button
        onClick={() => changeLocale('ar')}
        className={locale === 'ar' ? 'font-bold' : ''}
      >
        AR
      </button>
      <button
        onClick={() => changeLocale('fr')}
        className={locale === 'fr' ? 'font-bold' : ''}
      >
        FR
      </button>
    </div>
  );
}