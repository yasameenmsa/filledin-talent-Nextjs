'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

import { Select } from '@/components/ui/select';

interface JobSearchSectionProps {
  hideTitle?: boolean;
}

const JobSearchSection = ({ hideTitle = false }: JobSearchSectionProps) => {
  const { currentLanguage } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    keywords: '',
    category: '',
    workingType: '',
    location: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (formData.keywords) params.append('q', formData.keywords);
    if (formData.category) params.append('category', formData.category);
    if (formData.workingType) params.append('workingType', formData.workingType);
    if (formData.location) params.append('location', formData.location);

    router.push(`/${currentLanguage}/jobs?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

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
        popularTerms: ['Engineer', 'Project Manager', 'Renewable Energy', 'Oil & Gas'],
        categories: {
          technical: 'Technical',
          hse: 'HSE',
          corporate: 'Corporate',
          executive: 'Executive',
          operations: 'Operations',
        },
        workingTypes: {
          'full-time': 'Full Time',
          'part-time': 'Part Time',
          contract: 'Contract',
          remote: 'Remote',
          hybrid: 'Hybrid',
        }
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
        popularTerms: ['Ingénieur', 'Chef de Projet', 'Énergie Renouvelable', 'Pétrole et Gaz'],
        categories: {
          technical: 'Technique',
          hse: 'HSE',
          corporate: 'Entreprise',
          executive: 'Exécutif',
          operations: 'Opérations',
        },
        workingTypes: {
          'full-time': 'Temps plein',
          'part-time': 'Temps partiel',
          contract: 'Contrat',
          remote: 'À distance',
          hybrid: 'Hybride',
        }
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
        popularTerms: ['مهندس', 'مدير مشروع', 'الطاقة المتجددة', 'النفط والغاز'],
        categories: {
          technical: 'تقني',
          hse: 'الصحة والسلامة والبيئة',
          corporate: 'إداري',
          executive: 'تنفيذي',
          operations: 'عمليات',
        },
        workingTypes: {
          'full-time': 'دوام كامل',
          'part-time': 'دوام جزئي',
          contract: 'عقد',
          remote: 'عن بعد',
          hybrid: 'هجين',
        }
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className={`${!hideTitle ? 'pt-6' : ''} bg-[#f6f4ee]`}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      {!hideTitle && (
        <header className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold italic text-gray-900"
          >
            {text.title}
          </motion.h1>
        </header>
      )}

      <section
        className="relative py-16 min-h-[400px] flex items-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/home/homeBG.png')",
        }}
        aria-label="Job Search"
      >
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                {text.heading}
              </h2>
              <p className="text-lg mb-8 text-gray-700">
                {text.subheading}
              </p>
            </motion.div>

            {/* Search Form - 2x2 Grid */}
            <form onSubmit={handleSearch} role="search" aria-label="Job search form" className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto mb-6">
                <div>
                  <label htmlFor="keywords" className="sr-only">{text.keywords}</label>
                  <Input
                    type="text"
                    id="keywords"
                    placeholder={text.keywords}
                    value={formData.keywords}
                    onChange={handleChange}
                    className={`bg-white/90 border-gray-300 text-black placeholder:text-gray-500 ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="sr-only">{text.category}</label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`bg-white/90 border-gray-300 text-black placeholder:text-gray-500 ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <option value="">{text.category}</option>
                    {Object.entries(text.categories).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="workingType" className="sr-only">{text.workingType}</label>
                  <Select
                    id="workingType"
                    value={formData.workingType}
                    onChange={handleChange}
                    className={`bg-white/90 border-gray-300 text-black placeholder:text-gray-500 ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <option value="">{text.workingType}</option>
                    {Object.entries(text.workingTypes).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="location" className="sr-only">{text.location}</label>
                  <Input
                    type="text"
                    id="location"
                    placeholder={text.location}
                    value={formData.location}
                    onChange={handleChange}
                    className={`bg-white/90 border-gray-300 text-black placeholder:text-gray-500 ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="px-8 py-6 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800 transition-colors mx-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                {text.search}
              </Button>
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