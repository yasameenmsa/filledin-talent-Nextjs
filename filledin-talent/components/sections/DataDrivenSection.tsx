'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, CheckCircle, TrendingUp } from 'lucide-react';

const DataDrivenSection = () => {
  const { currentLanguage } = useLanguage();
  
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        mainTitle: 'Data-Driven Recruitment. Guaranteed Results',
        intro: 'We empower your business with strategic hiring solutions and transparent metrics, ensuring you get the right talent—fast.',
        promiseTitle: 'Our promise to you',
        globalSourcing: 'Global Sourcing',
        globalSourcingDesc: 'We proactively tap into regional and international talent pools to find the perfect candidate for your unique needs, strengthening your vision and strategy.',
        noSecondInterview: 'No Second Interview, No Fee',
        noSecondInterviewDesc: 'We de-risk your investment. You only incur a cost once a candidate successfully reaches the second interview stage with the hiring manager.',
        keyMetrics: 'Key Recruitment Metrics',
        keyMetricsDesc: 'We provide full transparency with actionable data, so you never have to guess about your hiring process.',
        advantageTitle: 'Your Advantage: Transparency & Data-Driven Insights',
        advantageIntro: 'We provide clear analytics that give you a competitive edge:',
        scorecards: 'Candidate Scorecards: Objective ratings and insights on every shortlisted candidate.',
        talentMapping: 'Talent Mapping: Gain a comprehensive overview of the available talent in your market.',
        efficiency: 'Efficiency Metrics: Benefit from a streamlined process with competitive times for selection and a faster time-to-hire, getting your people in place quicker.',
        protectionTitle: 'Your Investment is Protected',
        protectionDesc: 'We stand behind our placements. Our service includes a 3-month replacement guarantee, giving you peace of mind that your investment is secure.',
        ctaTitle: 'Ready to Hire with Confidence?',
        ctaSubtitle: 'Contact Us Today'
      },
      fr: {
        mainTitle: 'Recrutement Axé sur les Données. Résultats Garantis',
        intro: 'Nous donnons à votre entreprise les moyens d\'agir grâce à des solutions de recrutement stratégiques et des indicateurs transparents, en veillant à ce que vous obteniez les bons talents rapidement.',
        promiseTitle: 'Notre promesse envers vous',
        globalSourcing: 'Sourcing Mondial',
        globalSourcingDesc: 'Nous exploitons de manière proactive les bassins de talents régionaux et internationaux pour trouver le candidat parfait pour vos besoins uniques, renforçant votre vision et votre stratégie.',
        noSecondInterview: 'Pas de Deuxième Entretien, Pas de Frais',
        noSecondInterviewDesc: 'Nous réduisons les risques de votre investissement. Vous n\'encourez un coût qu\'une fois qu\'un candidat atteint avec succès l\'étape du deuxième entretien avec le responsable du recrutement.',
        keyMetrics: 'Indicateurs Clés de Recrutement',
        keyMetricsDesc: 'Nous offrons une transparence totale avec des données exploitables, afin que vous n\'ayez jamais à deviner votre processus de recrutement.',
        advantageTitle: 'Votre Avantage : Transparence et Insights Axés sur les Données',
        advantageIntro: 'Nous fournissons des analyses claires qui vous donnent un avantage concurrentiel :',
        scorecards: 'Fiches d\'Évaluation des Candidats : Évaluations objectives et informations sur chaque candidat présélectionné.',
        talentMapping: 'Cartographie des Talents : Obtenez une vue d\'ensemble complète des talents disponibles sur votre marché.',
        efficiency: 'Indicateurs d\'Efficacité : Bénéficiez d\'un processus rationalisé avec des délais compétitifs pour la sélection et un délai d\'embauche plus rapide, permettant de mettre vos collaborateurs en place plus rapidement.',
        protectionTitle: 'Votre Investissement est Protégé',
        protectionDesc: 'Nous soutenons nos placements. Notre service comprend une garantie de remplacement de 3 mois, vous offrant la tranquillité d\'esprit que votre investissement est sécurisé.',
        ctaTitle: 'Prêt à Recruter en Toute Confiance ?',
        ctaSubtitle: 'Contactez-nous Aujourd\'hui'
      },
      ar: {
        mainTitle: 'التوظيف القائم على البيانات. نتائج مضمونة',
        intro: 'نمكّن عملك من خلال حلول التوظيف الاستراتيجية والمقاييس الشفافة، مما يضمن لك الحصول على المواهب المناسبة - بسرعة.',
        promiseTitle: 'وعدنا لك',
        globalSourcing: 'التوظيف العالمي',
        globalSourcingDesc: 'نستفيد بشكل استباقي من مجموعات المواهب الإقليمية والدولية للعثور على المرشح المثالي لاحتياجاتك الفريدة، وتعزيز رؤيتك واستراتيجيتك.',
        noSecondInterview: 'لا مقابلة ثانية، بدون رسوم',
        noSecondInterviewDesc: 'نقلل من مخاطر استثمارك. أنت تتحمل التكلفة فقط عندما يصل المرشح بنجاح إلى مرحلة المقابلة الثانية مع مدير التوظيف.',
        keyMetrics: 'مقاييس التوظيف الرئيسية',
        keyMetricsDesc: 'نوفر شفافية كاملة مع بيانات قابلة للتنفيذ، لذلك لن تضطر أبداً إلى التخمين بشأن عملية التوظيف الخاصة بك.',
        advantageTitle: 'ميزتك: الشفافية والرؤى المستندة إلى البيانات',
        advantageIntro: 'نقدم تحليلات واضحة تمنحك ميزة تنافسية:',
        scorecards: 'بطاقات تقييم المرشحين: تقييمات موضوعية ورؤى حول كل مرشح في القائمة المختصرة.',
        talentMapping: 'تخطيط المواهب: احصل على نظرة عامة شاملة على المواهب المتاحة في سوقك.',
        efficiency: 'مقاييس الكفاءة: استفد من عملية مبسطة بأوقات تنافسية للاختيار ووقت أسرع للتوظيف، مما يضع موظفيك في مكانهم بشكل أسرع.',
        protectionTitle: 'استثمارك محمي',
        protectionDesc: 'نحن ندعم تعييناتنا. تشمل خدمتنا ضمان استبدال لمدة 3 أشهر، مما يمنحك راحة البال بأن استثمارك آمن.',
        ctaTitle: 'هل أنت مستعد للتوظيف بثقة؟',
        ctaSubtitle: 'اتصل بنا اليوم'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div 
      className="py-16 px-4"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
         <h2 className="text-3xl font-bold text-center" style={{ color: '#000' }}>
              {text.mainTitle}
            </h2>
            
            <p className="text-lg leading-relaxed mb-16 text-center" style={{ color: '#000' }}>
              {text.intro}
            </p>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Content */}
          <div className="flex-1">
          

            {/* Our Promise Section */}
            <h3 className="text-2xl font-bold mb-8" style={{ color: '#000' }}>
              {text.promiseTitle}
            </h3>

            {/* Global Sourcing */}
            <div className="mb-8 flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded flex items-center justify-center" style={{ backgroundColor: '#4682b4' }}>
                  <Globe className="w-9 h-9 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
                  {text.globalSourcing}
                </h4>
                <p className="text-base leading-relaxed" style={{ color: '#000' }}>
                  {text.globalSourcingDesc}
                </p>
              </div>
            </div>

            {/* No Second Interview */}
            <div className="mb-8 flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded flex items-center justify-center" style={{ backgroundColor: '#90ee90' }}>
                  <CheckCircle className="w-9 h-9 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
                  {text.noSecondInterview}
                </h4>
                <p className="text-base leading-relaxed" style={{ color: '#000' }}>
                  {text.noSecondInterviewDesc}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="mb-12 flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded flex items-center justify-center" style={{ backgroundColor: '#87ceeb' }}>
                  <TrendingUp className="w-9 h-9 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
                  {text.keyMetrics}
                </h4>
                <p className="text-base leading-relaxed" style={{ color: '#000' }}>
                  {text.keyMetricsDesc}
                </p>
              </div>
            </div>

            {/* Your Advantage */}
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#000' }}>
              {text.advantageTitle}
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: '#000' }}>
              {text.advantageIntro}
            </p>

            <ul className="space-y-3 mb-12 text-base" style={{ color: '#000' }}>
              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.scorecards}</p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.talentMapping}</p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.efficiency}</p>
              </li>
            </ul>

            {/* Investment Protection */}
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#000' }}>
              {text.protectionTitle}
            </h3>
            
            <p className="text-base leading-relaxed" style={{ color: '#000' }}>
              {text.protectionDesc}
            </p>
          </div>

          {/* Right Content - Image with CTA */}
          <div className="flex-shrink-0 lg:w-[550px]">
            <div className="relative">
              <Image
                src="/images/business/Hand.png"
                alt="Professional Handshake"
                width={550}
                height={650}
                className="w-full h-auto rounded-lg shadow-lg"
                style={{ aspectRatio: '550/650', objectFit: 'cover' }}
                onError={(e: { currentTarget: { src: string; }; }) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=900&fit=crop';
                }}
              />
              
              {/* CTA Overlay */}
              <div 
                className="absolute bottom-0 left-0 right-0 p-8 text-center"
                style={{ 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                  borderRadius: '0 0 0.5rem 0.5rem'
                }}
              >
                <h3 className="text-3xl font-bold text-white mb-2">
                  {text.ctaTitle}
                </h3>
                <p className="text-2xl font-bold text-white">
                  {text.ctaSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDrivenSection;