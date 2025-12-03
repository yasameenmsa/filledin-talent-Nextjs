'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const CommitmentSection = () => {
  const { currentLanguage } = useLanguage();

  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        mainTitle: 'Our commitment to your service',
        subtitle: 'Precision Recruitment for Energy Experts',
        intro1: 'We don\'t just fill roles; we deliver the specialised talent that powers your projects and drives your business forward.',
        intro2: 'At Fint, we combine deep sector expertise with a modern recruitment model to solve your most critical hiring challenges.',
        intro3: 'Our commitment is to save you time, reduce risk, and connect you with exceptional professionals who are ready to perform from day one.',
        partnershipTitle: 'A Risk-Averse, Partnership-Focused Model',
        partnershipIntro: 'We believe your satisfaction measures our success. Our transparent fee structure is designed to align with your goals and de-risk the hiring process:',
        nonManagerial: 'For Non-Managerial Roles: A simple, competitive fixed fee. You incur no cost until we successfully present a candidate you choose to interview.',
        managerial: 'For Managerial & Executive Roles: A competitive fee with a limited initial engagement fee, demonstrating our mutual commitment to finding your next leader.'
      },
      fr: {
        mainTitle: 'Notre engagement envers votre service',
        subtitle: 'Recrutement de Précision pour les Experts en Énergie',
        intro1: 'Nous ne nous contentons pas de pourvoir des postes ; nous fournissons les talents spécialisés qui alimentent vos projets et font avancer votre entreprise.',
        intro2: 'Chez Fint, nous combinons une expertise sectorielle approfondie avec un modèle de recrutement moderne pour résoudre vos défis d\'embauche les plus critiques.',
        intro3: 'Notre engagement est de vous faire gagner du temps, de réduire les risques et de vous mettre en contact avec des professionnels exceptionnels prêts à performer dès le premier jour.',
        partnershipTitle: 'Un Modèle Axé sur le Partenariat et la Réduction des Risques',
        partnershipIntro: 'Nous croyons que votre satisfaction mesure notre succès. Notre structure de frais transparente est conçue pour s\'aligner sur vos objectifs et réduire les risques du processus d\'embauche :',
        nonManagerial: 'Pour les Postes Non-Cadres : Un forfait fixe simple et compétitif. Vous n\'encourez aucun coût tant que nous ne présentons pas avec succès un candidat que vous choisissez d\'interviewer.',
        managerial: 'Pour les Postes de Cadres et Dirigeants : Un tarif compétitif avec des frais d\'engagement initiaux limités, démontrant notre engagement mutuel à trouver votre prochain leader.'
      },
      ar: {
        mainTitle: 'التزامنا تجاه خدمتك',
        subtitle: 'التوظيف الدقيق لخبراء الطاقة',
        intro1: 'نحن لا نملأ الأدوار فقط؛ بل نقدم المواهب المتخصصة التي تدعم مشاريعك وتدفع عملك إلى الأمام.',
        intro2: 'في Fint، نجمع بين الخبرة القطاعية العميقة ونموذج التوظيف الحديث لحل تحديات التوظيف الأكثر أهمية لديك.',
        intro3: 'التزامنا هو توفير وقتك وتقليل المخاطر وربطك بمحترفين استثنائيين جاهزين للأداء من اليوم الأول.',
        partnershipTitle: 'نموذج يركز على الشراكة وتجنب المخاطر',
        partnershipIntro: 'نحن نؤمن بأن رضاك يقيس نجاحنا. هيكل الرسوم الشفاف لدينا مصمم للتوافق مع أهدافك وتقليل مخاطر عملية التوظيف:',
        nonManagerial: 'للأدوار غير الإدارية: رسوم ثابتة بسيطة وتنافسية. لا تتحمل أي تكلفة حتى نقدم بنجاح مرشحاً تختار مقابلته.',
        managerial: 'للأدوار الإدارية والتنفيذية: رسوم تنافسية مع رسوم مشاركة أولية محدودة، مما يثبت التزامنا المتبادل بإيجاد قائدك القادم.'
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
        {/* Main Title */}
        <h2 className="text-4xl font-bold mb-12" style={{ color: '#000' }}>
          {text.mainTitle}
        </h2>

        {/* Top Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Text Content */}
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#000' }}>
              {text.subtitle}
            </h3>

            <div className="space-y-4 text-base leading-relaxed" style={{ color: '#000' }}>
              <p>{text.intro1}</p>
              <p>{text.intro2}</p>
              <p>{text.intro3}</p>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex items-start">
            <img
              src="/images/business/PrecisionRecruitment.jpg"
              alt="Partnership Team"
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              style={{
                maxHeight: '350px',
                objectPosition: 'center'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=350&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Bottom Section - Full Width */}
        <div className="max-w-5xl">
          <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#000' }}>
            {text.partnershipTitle}
          </h3>

          <p className="text-base leading-relaxed mb-6 text-center" style={{ color: '#000' }}>
            {text.partnershipIntro}
          </p>

          <ul className="space-y-4 text-base leading-relaxed" style={{ color: '#000' }}>
            <li className="flex gap-3">
              <span className="flex-shrink-0 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
              </span>
              <p>{text.nonManagerial}</p>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
              </span>
              <p>{text.managerial}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommitmentSection;