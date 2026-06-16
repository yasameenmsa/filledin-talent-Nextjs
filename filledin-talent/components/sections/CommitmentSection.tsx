'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const CommitmentSection = () => {
  const { currentLanguage } = useLanguage();

  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        mainTitle: 'Our commitment to your service',
        subtitle: 'Precision recruitment for energy experts',
        intro1: 'We don\'t just fill roles; we deliver the specialised talent that powers your projects and drives your business forward.',
        intro2: 'At FINT, we combine deep sector expertise with a modern recruitment model to solve your most critical hiring challenges.',
        intro3: 'Our commitment is to save you time, reduce risk, and connect you with exceptional professionals who are ready to perform from day one.',
        partnershipTitle: 'A Risk-Averse, Partnership-Focused Model',
        partnershipIntro: 'We believe your satisfaction measures our success. Our transparent fee structure is designed to align with your goals and de-risk the hiring process:',
        nonManagerial: 'For Non-Managerial Roles and Executive Roles: Competitive fixed fee. No cost until candidate accepts your offer and starts work.',
        managerial: 'For Managerial & Executive Roles: A competitive fee with a limited initial engagement fee, demonstrating our mutual commitment to finding your next leader.'
      },
      fr: {
        mainTitle: 'Notre engagement envers votre service',
        subtitle: 'Recrutement de précision pour des experts en énergie',
        intro1: 'Nous ne nous contentons pas de pourvoir des postes ; nous fournissons les talents spécialisés qui alimentent vos projets et font avancer votre entreprise.',
        intro2: 'Chez FINT, nous combinons une expertise sectorielle approfondie avec un modèle de recrutement moderne pour résoudre vos défis d\'embauche les plus critiques.',
        intro3: 'Notre engagement est de vous faire gagner du temps, de réduire les risques et de vous mettre en contact avec des professionnels exceptionnels prêts à performer dès le premier jour.',
        partnershipTitle: 'Un modèle axé sur le partenariat et une limitation des risques',
        partnershipIntro: 'Nous croyons que votre satisfaction mesure notre succès. Notre structure de frais transparente est conçue pour s\'aligner sur vos objectifs et réduire les risques du processus d\'embauche :',
        nonManagerial: 'Pour les rôles non-cadres et cadres de direction : Forfait fixe compétitif. Aucun coût jusqu\'à ce que le candidat accepte votre offre et commence à travailler.',
        managerial: 'Pour les rôles de direction et exécutifs : Des honoraires compétitifs avec des frais d\'engagement initial limités, démontrant notre engagement mutuel à trouver votre prochain leader.'
      },
      ar: {
        mainTitle: 'التزامنا تجاه خدمتك',
        subtitle: 'التوظيف الدقيق لخبراء الطاقة',
        intro1: 'نحن لا نملأ الأدوار فقط؛ بل نقدم المواهب المتخصصة التي تدعم مشاريعك وتدفع عملك إلى الأمام.',
        intro2: 'في FINT، نجمع بين الخبرة القطاعية العميقة ونموذج التوظيف الحديث لحل تحديات التوظيف الأكثر أهمية لديك.',
        intro3: 'التزامنا هو توفير وقتك وتقليل المخاطر وربطك بمحترفين استثنائيين جاهزين للأداء من اليوم الأول.',
        partnershipTitle: 'نموذج يركز على الشراكة وتجنب المخاطر',
        partnershipIntro: 'نحن نؤمن بأن رضاك يقيس نجاحنا. هيكل الرسوم الشفاف لدينا مصمم للتوافق مع أهدافك وتقليل مخاطر عملية التوظيف:',
        nonManagerial: 'للأدوار غير الإدارية والتنفيذية: رسوم ثابتة تنافسية. لا توجد تكلفة حتى يقبل المرشح عرضك ويبدأ العمل.',
        managerial: 'للأدوار الإدارية والتنفيذية: رسوم تنافسية مع رسوم مشاركة أولية محدودة، مما يدل على التزامنا المتبادل بالعثور على قائدك التالي.'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="pt-16 px-4"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Main Title */}
        <h2 className="text-3xl font-bold mb-12 uppercase" style={{ color: '#1E3A5F' }}>
          {text.mainTitle}
        </h2>

        {/* Top Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 ">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/business/PrecisionRecruitment.jpg"
              alt="Partnership Team"
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              style={{
                maxHeight: '250px',
                objectPosition: 'center'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=350&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Bottom Section - Full Width */}
        <div className="">
          <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#000' }}>
            {text.partnershipTitle}
          </h3>

          <p className="text-base leading-relaxed mb-6 " style={{ color: '#000' }}>
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