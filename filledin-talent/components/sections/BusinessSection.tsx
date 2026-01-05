'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, CheckCircle, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const BusinessSection = () => {
  const { currentLanguage } = useLanguage();

  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        forBusinesses: 'For businesses',
        hireFutureTalent: 'Hire your future talent today',
        intro: 'FilledIn Talent is committed to you and to provide you with future-Ready recruitment for the Energy Workforce of tomorrow.',
        partnership: 'We partner with employers like you to build long-term teams with the right skills for a rapidly evolving non-renewable and renewable energy industry. We also propose a flexible workforce to keep critical projects moving.',
        skillsMapping: 'We identify emerging skills i.e AI, Renewables, Automation, Digital, through future Skills Mapping to keep your business ahead.',
        delivery: 'At FINT, we deliver top talent at reduced cost through AI-powered automation.',
        promiseTitle: 'Our promise to you',
        globalSourcing: 'Global Sourcing',
        noSecondInterview: 'No Second Interview, No Fee',
        keyMetrics: 'Key Recruitment Metrics',
        notTransactional: 'We are not a transactional agency. We are your strategic partner in talent acquisition, dedicated to providing a seamless, efficient, and effective service that delivers lasting value.',
        jobSeekers: 'Job seekers',
        jobSearch: 'Job search',
        interviewTips: 'Interview tips',
        dropCV: 'Drop CV',
        aboutFINT: 'About FINT',
        getInTouch: 'Get In Touch'
      },
      fr: {
        forBusinesses: 'Pour les entreprises',
        hireFutureTalent: 'Recrutez vos futurs talents dès aujourd\'hui',
        intro: 'FilledIn Talent s\'engage envers vous à vous fournir un recrutement prêt pour l\'avenir pour la main-d\'œuvre énergétique de demain.',
        partnership: 'Nous nous associons à des employeurs comme vous pour constituer des équipes à long terme avec les bonnes compétences pour une industrie énergétique non renouvelable et renouvelable en évolution rapide. Nous proposons également une main-d\'œuvre flexible pour maintenir les projets critiques en mouvement.',
        skillsMapping: 'Nous identifions les compétences émergentes, c\'est-à-dire l\'IA, les énergies renouvelables, l\'automatisation, le numérique, grâce à la cartographie des compétences futures pour garder votre entreprise en avance.',
        delivery: 'Chez FINT, nous livrons les meilleurs talents à coût réduit grâce à l\'automatisation alimentée par l\'IA',
        promiseTitle: 'Notre promesse envers vous',
        globalSourcing: 'Sourcing Mondial',
        noSecondInterview: 'Pas de Deuxième Entretien, Pas de Frais',
        keyMetrics: 'Indicateurs Clés de Recrutement',
        notTransactional: 'Nous ne sommes pas une agence transactionnelle. Nous sommes votre partenaire stratégique en acquisition de talents, dédiés à fournir un service fluide, efficace et performant qui offre une valeur durable.',
        jobSeekers: 'Chercheurs d\'emploi',
        jobSearch: 'Recherche d\'emploi',
        interviewTips: 'Conseils d\'entretien',
        dropCV: 'Déposer CV',
        aboutFINT: 'À propos de FINT',
        getInTouch: 'Nous Contacter'
      },
      ar: {
        forBusinesses: 'للشركات',
        hireFutureTalent: 'وظف مواهب المستقبل اليوم',
        intro: 'FilledIn Talent ملتزمة تجاهك وبتزويدك بتوظيف جاهز للمستقبل للقوى العاملة في مجال الطاقة في الغد.',
        partnership: 'نحن نتعاون مع أصحاب العمل مثلك لبناء فرق طويلة الأجل بالمهارات المناسبة لصناعة الطاقة غير المتجددة والمتجددة سريعة التطور. كما نقترح قوة عاملة مرنة للحفاظ على تحرك المشاريع الحيوية.',
        skillsMapping: 'نحدد المهارات الناشئة أي الذكاء الاصطناعي والطاقات المتجددة والأتمتة والرقمية من خلال تخطيط المهارات المستقبلية للحفاظ على تقدم عملك.',
        delivery: 'في FINT، نقدم أفضل المواهب بتكلفة مخفضة من خلال الأتمتة المدعومة بالذكاء الاصطناعي',
        promiseTitle: 'وعدنا لك',
        globalSourcing: 'التوظيف العالمي',
        noSecondInterview: 'لا مقابلة ثانية، بدون رسوم',
        keyMetrics: 'مقاييس التوظيف الرئيسية',
        notTransactional: 'نحن لسنا وكالة معاملات. نحن شريكك الاستراتيجي في اكتساب المواهب، ملتزمون بتقديم خدمة سلسة وفعالة وناجحة تقدم قيمة دائمة.',
        jobSeekers: 'الباحثون عن عمل',
        jobSearch: 'البحث عن وظيفة',
        interviewTips: 'نصائح المقابلة',
        dropCV: 'إرسال السيرة الذاتية',
        aboutFINT: 'عن FINT',
        getInTouch: 'تواصل معنا'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <div className="flex gap-12 items-start">
          {/* Left Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6" style={{ color: '#1e3a5f' }}>
              {text.forBusinesses}
            </h1>
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#000' }}>
              {text.hireFutureTalent}
            </h2>

            <div className="space-y-6 text-base leading-relaxed" style={{ color: '#000' }}>
              <p>{text.intro}</p>
              <p>{text.partnership}</p>
              <p>{text.skillsMapping}</p>
              <p>{text.delivery}</p>
            </div>

            {/* Promise Section */}
            <div className="mt-12">
              <h3 className="text-center text-2xl font-bold mb-8" style={{ color: '#000' }}>
                {text.promiseTitle}
              </h3>

              <div className="flex gap-8 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: '#4682b4' }}>
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-bold text-lg" style={{ color: '#000' }}>{text.globalSourcing}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: '#90ee90' }}>
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-bold text-lg" style={{ color: '#000' }}>{text.noSecondInterview}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: '#87ceeb' }}>
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-bold text-lg" style={{ color: '#000' }}>{text.keyMetrics}</span>
                </div>
              </div>

              <div className="space-y-4 text-base" style={{ color: '#000' }}>
                <p>{text.notTransactional}</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-shrink-0 w-[450px] lg:w-[350px]">
            <Image
              src="/images/business/ForBusinesses.png"
              alt="Business Meeting"
              width={350}
              height={600}
              className="w-full h-auto rounded-lg shadow-lg"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessSection;