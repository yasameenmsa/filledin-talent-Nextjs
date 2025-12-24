'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail } from 'lucide-react';

const JobSeekersSection = () => {
  const { currentLanguage } = useLanguage();
  
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        forJobSeekers: 'For Job Seekers',
        keywords: 'Keywords, Job Title',
        region: 'Region',
        category: 'Category',
        workingType: 'Working Type',
        businesses: 'Businesses',
        aboutFINT: 'About FINT',
        getInTouch: 'Get In Touch'
      },
      fr: {
        forJobSeekers: 'Pour les Chercheurs d\'Emploi',
        keywords: 'Mots-clés, Titre du Poste',
        region: 'Région',
        category: 'Catégorie',
        workingType: 'Type de Travail',
        businesses: 'Entreprises',
        aboutFINT: 'À propos de FINT',
        getInTouch: 'Nous Contacter'
      },
      ar: {
        forJobSeekers: 'للباحثين عن عمل',
        keywords: 'الكلمات الرئيسية، المسمى الوظيفي',
        region: 'المنطقة',
        category: 'الفئة',
        workingType: 'نوع العمل',
        businesses: 'الشركات',
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
        <h1 className="text-5xl font-bold mb-16" style={{ color: '#000' }}>
          {text.forJobSeekers}
        </h1>

        <div className="flex gap-12 items-center">
          {/* Left - Search Form */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* Keywords Input */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <label className="text-2xl font-bold block" style={{ color: '#000' }}>
                {text.keywords}
              </label>
            </div>

            {/* Region Input */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <label className="text-2xl font-bold block" style={{ color: '#000' }}>
                {text.region}
              </label>
            </div>

            {/* Category Input */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <label className="text-2xl font-bold block" style={{ color: '#000' }}>
                {text.category}
              </label>
            </div>

            {/* Working Type Input */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <label className="text-2xl font-bold block" style={{ color: '#000' }}>
                {text.workingType}
              </label>
            </div>
          </div>

          {/* Right - Image */}
          <div className="flex-shrink-0 w-[600px]">
            <img 
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=800&fit=crop"
              alt="Job Search"
              className="w-full h-auto rounded-lg shadow-lg"
              style={{ aspectRatio: '3/2', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=800&fit=crop';
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobSeekersSection;