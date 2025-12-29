import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';
// import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { rtlLanguages } from '@/lib/i18n/config';
// import { Geist, Geist_Mono } from "next/font/google";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dir = rtlLanguages.includes(lang as 'en' | 'ar' | 'fr') ? 'rtl' : 'ltr';

  return (
    <ClientLayoutWrapper dir={dir} lang={lang}>
      {/* <LocaleSwitcher /> */}
      {children}
    </ClientLayoutWrapper>
  );
}