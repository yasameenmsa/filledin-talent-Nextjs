import JobSearchSection from '@/components/sections/JobSearchSection';
import TrendsSection from '@/components/sections/TrendsSection';
import ExpertiseSection from '@/components/sections/ExpertiseSection';
import { Metadata } from 'next';
import { headers } from 'next/headers';

type Props = {
  params: Promise<{ lang: string }>;
};

// Generate dynamic metadata based on language
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const headersList = headers();
  const userAgent = (await headersList).get('user-agent') || '';
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);

  const titles = {
    en: 'FilledIn Talent - Global Energy Talent Partner',
    ar: 'فيلد إن تالنت - شريك المواهب العالمية للطاقة',
    fr: 'FilledIn Talent - Partenaire Mondial des Talents Énergétiques'
  };

  const descriptions = {
    en: 'Find your next career opportunity in the global energy sector. Connect with top employers worldwide.',
    ar: 'ابحث عن فرصتك المهنية القادمة في قطاع الطاقة العالمي. تواصل مع أفضل أصحاب العمل في جميع أنحاء العالم.',
    fr: 'Trouvez votre prochaine opportunité de carrière dans le secteur mondial de l\'énergie. Connectez-vous avec les meilleurs employeurs du monde entier.'
  };

  return {
    title: titles[lang as keyof typeof titles] || titles.en,
    description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: `https://filledintalent.com/${lang}`,
      languages: {
        'en': 'https://filledintalent.com/en',
        'ar': 'https://filledintalent.com/ar',
        'fr': 'https://filledintalent.com/fr',
      },
    },
    robots: {
      index: true,
      follow: true,
      nocache: isBot ? false : true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { lang: _currentLanguage } = await params;
  return (
    <main>
      <JobSearchSection />
      <TrendsSection />
      <ExpertiseSection />
    </main>
  );
}
