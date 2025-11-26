import React from 'react';

export default async function AuthLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const currentLang = lang || 'en';
  const isRTL = currentLang === 'ar';

  const translations = {
    en: {
      title: 'Welcome to FilledIn Talent',
      subtitle: 'Connect with opportunities and talent across the globe. Your career journey starts here.',
      points: [
        'Find your dream job',
        'Connect with opportunities',
        'Build your professional network'
      ]
    },
    fr: {
      title: 'Bienvenue sur FilledIn Talent',
      subtitle: 'Connectez-vous avec des opportunités et des talents du monde entier. Votre parcours professionnel commence ici.',
      points: [
        'Trouvez le job de vos rêves',
        'Connectez-vous aux opportunités',
        'Développez votre réseau professionnel'
      ]
    },
    ar: {
      title: 'مرحباً بك في FilledIn Talent',
      subtitle: 'تواصل مع الفرص والمواهب في جميع أنحاء العالم. رحلتك المهنية تبدأ هنا.',
      points: [
        'اعثر على وظيفة أحلامك',
        'تواصل مع الفرص',
        'ابنِ شبكتك المهنية'
      ]
    }
  };

  const t = translations[currentLang as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding/Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
          <div className={`relative z-10 flex flex-col justify-center px-12 text-white ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-4xl font-bold mb-6">{t.title}</h1>
            <p className="text-xl mb-8 text-indigo-100">
              {t.subtitle}
            </p>
            <div className="space-y-4">
              {t.points.map((point, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-2 h-2 bg-white rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}