'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const SpecializedSourcingSection = () => {
  const { currentLanguage } = useLanguage();
  
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        title: 'Deeply Specialized Sourcing, Not Just Searching',
        intro: 'Our expertise is focused exclusively on the core fields of energy. We speak your language and understand the specific technical skills and cultural fit required for success in:',
        upstream: 'Upstream Operations: From Reservoir and Drilling Engineers to on-the-ground Production Foremen and Technicians.',
        downstream: 'Downstream & Petrochemical: From Process and Maintenance Engineers to skilled TAR Managers and Instrument Technicians.',
        renewable: 'Renewable Energy: From Wind Turbine Technicians to Project Managers and R&D specialists driving the energy transition.'
      },
      fr: {
        title: 'Sourcing Profondément Spécialisé, Pas Seulement de la Recherche',
        intro: 'Notre expertise est concentrée exclusivement sur les domaines clés de l\'énergie. Nous parlons votre langue et comprenons les compétences techniques spécifiques et l\'adéquation culturelle requises pour réussir dans :',
        upstream: 'Opérations en Amont : Des ingénieurs de réservoir et de forage aux contremaîtres de production et techniciens sur le terrain.',
        downstream: 'Aval et Pétrochimie : Des ingénieurs de procédés et de maintenance aux gestionnaires TAR qualifiés et techniciens d\'instrumentation.',
        renewable: 'Énergie Renouvelable : Des techniciens d\'éoliennes aux chefs de projet et spécialistes R&D qui conduisent la transition énergétique.'
      },
      ar: {
        title: 'التوظيف المتخصص العميق، وليس مجرد البحث',
        intro: 'خبرتنا تركز حصرياً على المجالات الأساسية للطاقة. نحن نتحدث لغتك ونفهم المهارات التقنية المحددة والتوافق الثقافي المطلوب للنجاح في:',
        upstream: 'عمليات المنبع: من مهندسي المكامن والحفر إلى رؤساء الإنتاج والفنيين في الموقع.',
        downstream: 'المصب والبتروكيماويات: من مهندسي العمليات والصيانة إلى مديري TAR المهرة وفنيي الأجهزة.',
        renewable: 'الطاقة المتجددة: من فنيي توربينات الرياح إلى مديري المشاريع وأخصائيي البحث والتطوير الذين يقودون تحول الطاقة.'
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
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Content */}
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-8" style={{ color: '#000' }}>
              {text.title}
            </h2>
            
            <p className="text-lg leading-relaxed mb-8" style={{ color: '#000' }}>
              {text.intro}
            </p>

            <ul className="space-y-6">
              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p className="text-base leading-relaxed" style={{ color: '#000' }}>
                  {text.upstream}
                </p>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p className="text-base leading-relaxed" style={{ color: '#000' }}>
                  {text.downstream}
                </p>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p className="text-base leading-relaxed" style={{ color: '#000' }}>
                  {text.renewable}
                </p>
              </li>
            </ul>
          </div>

          {/* Right Image - Energy Value Chain Diagram */}
          <div className="flex-shrink-0 lg:w-[600px]">
            <img 
              src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=800&fit=crop"
              alt="Energy Value Chain"
              className="w-full h-auto rounded-lg shadow-lg border border-gray-300"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=800&fit=crop';
              }}
            />
            <p className="text-xs text-gray-500 mt-2 text-center italic">
              Energy Value Chain: Upstream, Midstream & Downstream Operations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecializedSourcingSection;