'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from "@/components/ui/select";
import JobCard from '@/components/jobs/JobCard';

const JobSeekersSection = () => {
  const { currentLanguage } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    keywords: '',
    category: 'all',
    workingType: 'all',
    location: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchJobs = async (pageNum: number, isNewSearch: boolean = false) => {
    const params = new URLSearchParams();
    if (formData.keywords) params.append('q', formData.keywords);
    if (formData.category && formData.category !== 'all') params.append('category', formData.category);
    if (formData.workingType && formData.workingType !== 'all') params.append('workingType', formData.workingType);
    if (formData.location) params.append('location', formData.location);

    params.append('page', pageNum.toString());
    params.append('limit', '4');

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const newJobs = data.jobs || [];

        if (isNewSearch) {
          setJobs(newJobs);
        } else {
          setJobs(prev => [...prev, ...newJobs]);
        }

        setHasMore(newJobs.length === 4);
        setPage(pageNum);
      } else {
        console.error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasMore(true);
    setHasSearched(true);

    await fetchJobs(1, true);
    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await fetchJobs(page + 1, false);
    setIsLoadingMore(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };

  const getText = (lang: string) => {
    const translations = {
      en: {
        forJobSeekers: 'For Job Seekers',
        keywords: 'Keywords, Job Title',
        region: 'Region',
        category: 'Category',
        workingType: 'Working Type',
        search: 'Search Jobs',
        selectCategory: 'Select Category',
        selectWorkingType: 'Select Working Type',
        noJobsFound: 'No jobs found matching your criteria.',
        viewAll: 'View detailed results',
        showMore: 'Show More Results',
        loading: 'Loading...',
        categories: {
          engineering: 'Engineering',
          technical: 'Technical',
          hse: 'HSE',
          corporate: 'Corporate',
          executive: 'Executive',
          operations: 'Operations'
        },
        workingTypes: {
          'full-time': 'Full-time',
          'part-time': 'Part-time',
          contract: 'Contract',
          remote: 'Remote',
          hybrid: 'Hybrid'
        }
      },
      fr: {
        forJobSeekers: 'Pour les Chercheurs d\'Emploi',
        keywords: 'Mots-clés, Titre du Poste',
        region: 'Région',
        category: 'Catégorie',
        workingType: 'Type de Travail',
        search: 'Rechercher',
        selectCategory: 'Sélectionner une catégorie',
        selectWorkingType: 'Sélectionner le type de travail',
        noJobsFound: 'Aucun emploi trouvé correspondant à vos critères.',
        viewAll: 'Voir les résultats détaillés',
        showMore: 'Afficher plus de résultats',
        loading: 'Chargement...',
        categories: {
          engineering: 'Ingénierie',
          technical: 'Technique',
          hse: 'HSE',
          corporate: 'Entreprise',
          executive: 'Exécutif',
          operations: 'Opérations'
        },
        workingTypes: {
          'full-time': 'Temps plein',
          'part-time': 'Temps partiel',
          contract: 'Contrat',
          remote: 'À distance',
          hybrid: 'Hybride'
        }
      },
      ar: {
        forJobSeekers: 'للباحثين عن عمل',
        keywords: 'الكلمات الرئيسية، المسمى الوظيفي',
        region: 'المنطقة',
        category: 'الفئة',
        workingType: 'نوع العمل',
        search: 'بحث',
        selectCategory: 'اختر الفئة',
        selectWorkingType: 'اختر نوع العمل',
        noJobsFound: 'لم يتم العثور على وظائف تطابق معاييرك.',
        viewAll: 'عرض النتائج المفصلة',
        showMore: 'عرض المزيد من النتائج',
        loading: 'جاري التحميل...',
        categories: {
          engineering: 'الهندسة',
          technical: 'تقني',
          hse: 'الصحة والسلامة والبيئة',
          corporate: 'الشركات',
          executive: 'تنفيذي',
          operations: 'العمليات'
        },
        workingTypes: {
          'full-time': 'دوام كامل',
          'part-time': 'دوام جزئي',
          contract: 'عقد',
          remote: 'عن بُعد',
          hybrid: 'مختلط'
        }
      }
    };
    return translations[lang as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="min-h-[70vh] flex flex-col justify-center py-8"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Main Content */}
      <main className="container mx-auto px-8">
        <h1 className="text-5xl font-bold mb-16 text-gray-900">
          {text.forJobSeekers}
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left - Search Form */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
              {/* Keywords Input */}
              <div className="bg-white rounded-lg p-1 min-h-[100px] flex flex-col justify-center px-6 shadow-sm">
                <label htmlFor="keywords" className="block text-xl font-bold mb-2 text-center text-gray-900">
                  {text.keywords}
                </label>
                <div className="flex justify-center">
                  <Input
                    type="text"
                    id="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md bg-white text-center focus-visible:ring-1 focus-visible:ring-gray-300 text-gray-600 placeholder:text-gray-400 h-10 px-3"
                  />
                </div>
              </div>

              {/* Region Input */}
              <div className="bg-white rounded-lg p-1 min-h-[100px] flex flex-col justify-center px-6 shadow-sm">
                <label htmlFor="location" className="block text-xl font-bold mb-2 text-center text-gray-900">
                  {text.region}
                </label>
                <div className="flex justify-center">
                  <Input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md bg-white text-center focus-visible:ring-1 focus-visible:ring-gray-300 text-gray-600 placeholder:text-gray-400 h-10 px-3"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="bg-white rounded-lg p-1 min-h-[100px] flex flex-col justify-center px-6 shadow-sm relative group">
                <label className="block text-xl font-bold mb-2 text-center text-gray-900">
                  {text.category}
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => handleSelectChange('category', e.target.value)}
                  className="w-full border border-gray-200 rounded-md bg-white text-center justify-center h-10 px-3 focus:ring-1 focus:ring-gray-300 text-gray-600"
                >
                  <option value="" disabled hidden></option>
                  <option value="all">{text.selectCategory}</option>
                  {Object.entries(text.categories).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Working Type Select */}
              <div className="bg-white rounded-lg p-1 min-h-[100px] flex flex-col justify-center px-6 shadow-sm">
                <label className="block text-xl font-bold mb-2 text-center text-gray-900">
                  {text.workingType}
                </label>
                <Select
                  value={formData.workingType}
                  onChange={(e) => handleSelectChange('workingType', e.target.value)}
                  className="w-full border border-gray-200 rounded-md bg-white text-center justify-center h-10 px-3 focus:ring-1 focus:ring-gray-300 text-gray-600"
                >
                  <option value="" disabled hidden></option>
                  <option value="all">{text.selectWorkingType}</option>
                  {Object.entries(text.workingTypes).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 transition-colors w-full md:w-auto"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                  ) : (
                    <Search className="h-5 w-5 mr-2 inline" />
                  )}
                  {text.search}
                </Button>
              </div>
            </form>
          </div>

          {/* Right - Image */}
          <div className="flex-shrink-0 w-full lg:w-[600px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/home/RecruitmentandSelectionPolicy.png"
              alt="Job Search"
              className="w-full h-auto rounded-lg shadow-lg"
              style={{ aspectRatio: '3/2', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=800&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mt-12">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} lang={currentLanguage} />
                ))}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-6 py-2"
                    >
                      {isLoadingMore && <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />}
                      {text.showMore}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{text.noJobsFound}</h3>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default JobSeekersSection;