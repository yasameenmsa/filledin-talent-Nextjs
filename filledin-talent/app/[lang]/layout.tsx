'use client';

import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className={`${inter.className} min-h-screen bg-gray-50`}>
        <Header />
        <main className="pt-16">{children}</main>
      </div>
    </AuthProvider>
  );
}