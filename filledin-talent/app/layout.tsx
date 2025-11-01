import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from '@/contexts/LanguageContext';
import ClientHtmlWrapper from '@/components/layout/ClientHtmlWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FilledIn Talent - Global Energy Talent Partner",
  description: "Connecting expertise from the reservoir to the refinery or from the source to the grid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <ClientHtmlWrapper>
            {children}
          </ClientHtmlWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
