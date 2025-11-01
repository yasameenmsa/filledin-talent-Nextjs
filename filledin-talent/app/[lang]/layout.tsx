import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';
// import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { rtlLanguages } from '@/lib/i18n/config';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <ClientLayoutWrapper currentLanguage={lang} dir={dir}>
      {/* <LocaleSwitcher /> */}
      {children}
    </ClientLayoutWrapper>
  );
}