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
      
      {/* Footer Section */}
      <footer className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 5C19 5 18 5.5 18 6.5V15.5C18 16.5 19 17 20 17C21 17 22 16.5 22 15.5V6.5C22 5.5 21 5 20 5Z" fill="#3d5a80"/>
                  <path d="M20 35C15 35 11 31 11 26H29C29 31 25 35 20 35Z" fill="#3d5a80"/>
                  <circle cx="15" cy="20" r="2" fill="#3d5a80"/>
                  <circle cx="25" cy="20" r="2" fill="#3d5a80"/>
                  <path d="M12 25C12 27 14 28 16 28H24C26 28 28 27 28 25" stroke="#3d5a80" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#3d5a80' }}>FilledIn Talent</div>
                <div className="text-lg italic" style={{ color: '#5b8bb8' }}>The Alternative Solution</div>
              </div>
            </div>
            
            {/* Social Media & Contact */}
            <div className="text-center md:text-right">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-lg font-semibold text-black">{text.followUs}</span>
                <a href="#" className="text-black hover:opacity-70 transition-opacity font-semibold">INSTA</a>
                <a href="#" className="text-black hover:opacity-70 transition-opacity font-semibold">LinkedIn</a>
                <a href="#" className="text-black hover:opacity-70 transition-opacity font-semibold">Youtube</a>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-end">
                <span className="text-lg font-semibold text-black">{text.getInTouch}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="black" strokeWidth="2"/>
                  <path d="M3 7L12 13L21 7" stroke="black" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExpertiseFooterSection;