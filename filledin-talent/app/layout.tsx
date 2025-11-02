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
  description: "Connecting expertise from the reservoir to the refinery or from the source to the grid. Find your next career opportunity in the energy sector.",
  keywords: "energy jobs, talent recruitment, oil and gas careers, renewable energy jobs, engineering positions, global energy sector",
  openGraph: {
    title: "FilledIn Talent - Global Energy Talent Partner",
    description: "Find your next career opportunity in the global energy sector. Connect with top employers worldwide.",
    url: "https://filledin-talent.com",
    siteName: "FilledIn Talent",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FilledIn Talent - Global Energy Recruitment",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FilledIn Talent - Global Energy Talent Partner",
    description: "Find your next career opportunity in the global energy sector. Connect with top employers worldwide.",
    images: ["/images/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://filledin-talent.com",
    languages: {
      'en': 'https://filledin-talent.com/en',
      'ar': 'https://filledin-talent.com/ar',
      'fr': 'https://filledin-talent.com/fr',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "FilledIn Talent",
              "url": "https://filledin-talent.com",
              "logo": "https://filledin-talent.com/new-logo.png",
              "sameAs": [
                "https://www.linkedin.com/company/filledin-talent",
                "https://twitter.com/filledintalent"
              ],
              "description": "Global Energy Talent Partner connecting expertise from the reservoir to the refinery or from the source to the grid."
            })
          }}
        />
      </head>
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
