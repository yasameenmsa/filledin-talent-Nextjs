'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const JobSeekersSection = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const getText = (lang: string) => {
    const translations = {
      en: {
        forJobSeekers: 'For Job Seekers',
        keywords: 'Keywords, Job Title',
        region: 'Region/Location',
        category: 'Category',
        workingType: 'Working Type',
        search: 'Search Jobs'
      },
      fr: {
        forJobSeekers: 'Pour les Chercheurs d\'Emploi',
        keywords: 'Mots-clés, Titre du Poste',
        region: 'Région/Emplacement',
        category: 'Catégorie',
        workingType: 'Type de Travail',
        search: 'Rechercher'
      },
      ar: {
        forJobSeekers: 'للباحثين عن عمل',
        keywords: 'الكلمات الرئيسية، المسمى الوظيفي',
        region: 'المنطقة/الموقع',
        category: 'الفئة',
        workingType: 'نوع العمل',
        search: 'بحث'
      }
    };
    return translations[lang as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="min-h-screen flex items-center"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <h1 className="text-5xl font-bold mb-16" style={{ color: '#000' }}>
          {text.forJobSeekers}
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left - Search Form */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keywords Input */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label htmlFor="keywords" className="block text-xl font-bold mb-2" style={{ color: '#000' }}>
                  {text.keywords}
                </label>
                <Input
                  type="text"
                  id="keywords"
                  placeholder={text.keywords}
                  value={formData.keywords}
                  onChange={handleChange}
                  className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Region Input */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label htmlFor="location" className="block text-xl font-bold mb-2" style={{ color: '#000' }}>
                  {text.region}
                </label>
                <Input
                  type="text"
                  id="location"
                  placeholder={text.region}
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Input */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label htmlFor="category" className="block text-xl font-bold mb-2" style={{ color: '#000' }}>
                  {text.category}
                </label>
                <Input
                  type="text"
                  id="category"
                  placeholder={text.category}
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Working Type Input */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label htmlFor="workingType" className="block text-xl font-bold mb-2" style={{ color: '#000' }}>
                  {text.workingType}
                </label>
                <Input
                  type="text"
                  id="workingType"
                  placeholder={text.workingType}
                  value={formData.workingType}
                  onChange={handleChange}
                  className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
                <Button
                  type="submit"
                  className="px-8 py-3 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 transition-colors w-full md:w-auto"
                >
                  <Search className="h-5 w-5 mr-2 inline" />
                  {text.search}
                </Button>
              </div>
            </form>
          </div>

          {/* Right - Image */}
          <div className="flex-shrink-0 w-full lg:w-[600px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop"
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