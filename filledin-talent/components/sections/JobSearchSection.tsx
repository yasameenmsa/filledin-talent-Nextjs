'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Search } from 'lucide-react';

const JobSearchSection = () => {
  const { currentLanguage } = useLanguage();
  
  // Helper function to get text based on current language
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        title: 'Global Energy Talent Partner',
        heading: 'Ready for your next career move?',
        subheading: 'Find the perfect job in the energy sector worldwide',
        keywords: 'Keywords, Job title',
        category: 'Category',
        workingType: 'Working type',
        location: 'Location',
        search: 'Search Jobs',
        popularSearches: 'Popular Searches:',
        popularTerms: ['Engineer', 'Project Manager', 'Renewable Energy', 'Oil & Gas']
      },
      fr: {
        title: 'Partenaire Mondial des Talents Énergétiques',
        heading: 'Prêt pour votre prochaine carrière ?',
        subheading: 'Trouvez l\'emploi parfait dans le secteur de l\'énergie dans le monde entier',
        keywords: 'Mots-clés, Titre du poste',
        category: 'Catégorie',
        workingType: 'Type de travail',
        location: 'Emplacement',
        search: 'Rechercher des emplois',
        popularSearches: 'Recherches populaires:',
        popularTerms: ['Ingénieur', 'Chef de Projet', 'Énergie Renouvelable', 'Pétrole et Gaz']
      },
      ar: {
        title: 'شريك المواهب العالمية للطاقة',
        heading: 'هل أنت مستعد لخطوتك المهنية التالية؟',
        subheading: 'ابحث عن الوظيفة المثالية في قطاع الطاقة في جميع أنحاء العالم',
        keywords: 'الكلمات الرئيسية، المسمى الوظيفي',
        category: 'الفئة',
        workingType: 'نوع العمل',
        location: 'الموقع',
        search: 'البحث عن وظائف',
        popularSearches: 'عمليات البحث الشائعة:',
        popularTerms: ['مهندس', 'مدير مشروع', 'الطاقة المتجددة', 'النفط والغاز']
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div 
      className="pt-6" 
      style={{
        backgroundColor: '#f6f4ee',
      }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold italic text-gray-900">
          {text.title}
        </h1>
      </header>
      
      <section 
        className="relative py-16 min-h-[400px] flex items-center"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dtpl6x0sk/image/upload/q_auto,f_auto,w_1200/v1759850669/s_1_f86nnk_wgfpmc.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        aria-label="Job Search"
      >
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              {text.heading}
            </h2>
            <p className="text-lg mb-8 text-gray-700">
              {text.subheading}
            </p>
            
            {/* Search Form - 2x2 Grid */}
            <form role="search" aria-label="Job search form" className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto mb-6">
                <div>
                  <label htmlFor="keywords" className="sr-only">{text.keywords}</label>
                  <input
                    type="text"
                    id="keywords"
                    placeholder={text.keywords}
                    className={`w-full placeholder-black text-black px-4 py-3 border border-gray-300 rounded-md focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="sr-only">{text.category}</label>
                  <input
                    type="text"
                    id="category"
                    placeholder={text.category}
                    className={`w-full placeholder-black text-black px-4 py-3 border border-gray-300 rounded-md focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>
                
                <div>
                  <label htmlFor="workingType" className="sr-only">{text.workingType}</label>
                  <input
                    type="text"
                    id="workingType"
                    placeholder={text.workingType}
                    className={`w-full placeholder-black text-black px-4 py-3 border border-gray-300 rounded-md focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="sr-only">{text.location}</label>
                  <input
                    type="text"
                    id="location"
                    placeholder={text.location}
                    className={`w-full placeholder-black text-black px-4 py-3 border border-gray-300 rounded-md focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                {text.search}
              </button>
            </form>
            
            {/* Popular searches */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">{text.popularSearches}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {text.popularTerms.map((term, index) => (
                  <Link 
                    key={index} 
                    href={`/${currentLanguage}/jobs?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1 bg-white text-gray-800 text-sm rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobSearchSection;