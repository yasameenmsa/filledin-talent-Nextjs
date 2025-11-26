'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const ExpertiseFooterSection = () => {
  const { currentLanguage } = useLanguage();

  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        title: 'Our expertise',
        technical: 'Technical',
        corporateFunctions: 'Corporate functions',
        executiveSearch: 'Executive Search',
        electricalEngineer: 'Electrical engineer',
        mechanicalEngineer: 'Mechanical engineer',
        icEngineer: 'I&C engineer',
        hse: 'HSE',
        petroleumEngineer: 'Petroleum Engineer',
        projectManager: 'Project Manager',
        operationManager: 'Operation Manager',
        finance: 'Finance',
        humanResources: 'Human Resources',
        marketing: 'Marketing',
        operations: 'Operations',
        cfo: 'CFO',
        generalManager: 'General Manager',
        managingDirector: 'Managing Director',
        followUs: 'Follow us',
        getInTouch: 'Get In Touch'
      },
      fr: {
        title: 'Notre expertise',
        technical: 'Technique',
        corporateFunctions: 'Fonctions corporatives',
        executiveSearch: 'Recherche de cadres',
        electricalEngineer: 'Ingénieur électricien',
        mechanicalEngineer: 'Ingénieur mécanique',
        icEngineer: 'Ingénieur I&C',
        hse: 'HSE',
        petroleumEngineer: 'Ingénieur pétrolier',
        projectManager: 'Chef de projet',
        operationManager: 'Directeur des opérations',
        finance: 'Finance',
        humanResources: 'Ressources humaines',
        marketing: 'Marketing',
        operations: 'Opérations',
        cfo: 'Directeur financier',
        generalManager: 'Directeur général',
        managingDirector: 'Directeur général',
        followUs: 'Suivez-nous',
        getInTouch: 'Contactez-nous'
      },
      ar: {
        title: 'خبرتنا',
        technical: 'تقني',
        corporateFunctions: 'الوظائف المؤسسية',
        executiveSearch: 'البحث التنفيذي',
        electricalEngineer: 'مهندس كهربائي',
        mechanicalEngineer: 'مهندس ميكانيكي',
        icEngineer: 'مهندس I&C',
        hse: 'الصحة والسلامة والبيئة',
        petroleumEngineer: 'مهندس بترول',
        projectManager: 'مدير مشروع',
        operationManager: 'مدير عمليات',
        finance: 'المالية',
        humanResources: 'الموارد البشرية',
        marketing: 'التسويق',
        operations: 'العمليات',
        cfo: 'المدير المالي',
        generalManager: 'المدير العام',
        managingDirector: 'العضو المنتدب',
        followUs: 'تابعنا',
        getInTouch: 'تواصل معنا'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dtpl6x0sk/image/upload/v1732057806/%D9%86%D8%B3%D8%AE%D8%A9_%D9%85%D9%86_Recruitment_and_Selection_Policy_2_tab9m7.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}

    >
      {/* Expertise Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-16" style={{ color: '#3d5a80' }}>
            {text.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {/* Technical Column */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-black">
                {text.technical}
              </h3>
              <ul className="space-y-4 text-lg">
                <li className="text-black">{text.electricalEngineer}</li>
                <li className="text-black">{text.mechanicalEngineer}</li>
                <li className="text-black">{text.icEngineer}</li>
                <li className="text-black">{text.hse}</li>
                <li className="text-black">{text.petroleumEngineer}</li>
                <li className="text-black">{text.projectManager}</li>
                <li className="text-black">{text.operationManager}</li>
              </ul>
            </div>

            {/* Corporate Functions Column */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-black">
                {text.corporateFunctions}
              </h3>
              <ul className="space-y-4 text-lg">
                <li className="text-black">{text.finance}</li>
                <li className="text-black">{text.humanResources}</li>
                <li className="text-black">{text.marketing}</li>
                <li className="text-black">{text.operations}</li>
              </ul>
            </div>

            {/* Executive Search Column */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-black">
                {text.executiveSearch}
              </h3>
              <ul className="space-y-4 text-lg">
                <li className="text-black">{text.cfo}</li>
                <li className="text-black">{text.generalManager}</li>
                <li className="text-black">{text.managingDirector}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default ExpertiseFooterSection;