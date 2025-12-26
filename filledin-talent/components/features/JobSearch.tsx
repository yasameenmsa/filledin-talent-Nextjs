'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase, Clock, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';

interface Job {
  _id: string;
  title: string;
  company: { name: string };
  location: { city: string; country: string };
  workingType: string;
  category: string;
  description: string;
  salary: { min: number; max: number; currency: string };
  createdAt: string;
}

interface JobFilters {
  keywords: string;
  location: string;
  category: string;
  workingType: string;
  sector: string;
  salaryMin?: number;
  salaryMax?: number;
}

export default function JobSearch() {
  const [filters, setFilters] = useState<JobFilters>({
    keywords: '',
    location: '',
    category: '',
    workingType: '',
    sector: '',
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const debouncedKeywords = useDebounce(filters.keywords, 500);
  const { currentLanguage } = useLanguage();

  // Inline translation function
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'jobs.keywordsPlaceholder': {
        en: 'Job title, keywords, or company',
        ar: 'المسمى الوظيفي أو الكلمات المفتاحية أو الشركة',
        fr: 'Titre du poste, mots-clés ou entreprise'
      },
      'jobs.allLocations': {
        en: 'All Locations',
        ar: 'جميع المواقع',
        fr: 'Tous les emplacements'
      },
      'jobs.allCategories': {
        en: 'All Categories',
        ar: 'جميع الفئات',
        fr: 'Toutes les catégories'
      },
      'jobs.technical': {
        en: 'Technical',
        ar: 'تقني',
        fr: 'Technique'
      },
      'jobs.hse': {
        en: 'HSE',
        ar: 'الصحة والسلامة والبيئة',
        fr: 'HSE'
      },
      'jobs.corporate': {
        en: 'Corporate',
        ar: 'شركات',
        fr: 'Entreprise'
      },
      'jobs.executive': {
        en: 'Executive',
        ar: 'تنفيذي',
        fr: 'Exécutif'
      },
      'jobs.operations': {
        en: 'Operations',
        ar: 'عمليات',
        fr: 'Opérations'
      },
      'jobs.search': {
        en: 'Search',
        ar: 'بحث',
        fr: 'Rechercher'
      },
      'jobs.showAdvancedFilters': {
        en: 'Show Advanced Filters',
        ar: 'إظهار المرشحات المتقدمة',
        fr: 'Afficher les filtres avancés'
      },
      'jobs.hideAdvancedFilters': {
        en: 'Hide Advanced Filters',
        ar: 'إخفاء المرشحات المتقدمة',
        fr: 'Masquer les filtres avancés'
      },
      'jobs.workingType': {
        en: 'Working Type',
        ar: 'نوع العمل',
        fr: 'Type de travail'
      },
      'jobs.fullTime': {
        en: 'Full Time',
        ar: 'دوام كامل',
        fr: 'Temps plein'
      },
      'jobs.partTime': {
        en: 'Part Time',
        ar: 'دوام جزئي',
        fr: 'Temps partiel'
      },
      'jobs.contract': {
        en: 'Contract',
        ar: 'عقد',
        fr: 'Contrat'
      },
      'jobs.remote': {
        en: 'Remote',
        ar: 'عن بُعد',
        fr: 'À distance'
      },
      'jobs.hybrid': {
        en: 'Hybrid',
        ar: 'مختلط',
        fr: 'Hybride'
      },
      'jobs.sector': {
        en: 'Sector',
        ar: 'القطاع',
        fr: 'Secteur'
      },
      'jobs.oilGas': {
        en: 'Oil & Gas',
        ar: 'النفط والغاز',
        fr: 'Pétrole et gaz'
      },
      'jobs.renewable': {
        en: 'Renewable Energy',
        ar: 'الطاقة المتجددة',
        fr: 'Énergie renouvelable'
      },
      'jobs.both': {
        en: 'Both',
        ar: 'كلاهما',
        fr: 'Les deux'
      },
      'jobs.minSalary': {
        en: 'Min Salary',
        ar: 'الحد الأدنى للراتب',
        fr: 'Salaire minimum'
      },
      'jobs.maxSalary': {
        en: 'Max Salary',
        ar: 'الحد الأقصى للراتب',
        fr: 'Salaire maximum'
      },
      'jobs.loading': {
        en: 'Loading jobs...',
        ar: 'جاري تحميل الوظائف...',
        fr: 'Chargement des emplois...'
      },
      'jobs.viewDetails': {
        en: 'View Details',
        ar: 'عرض التفاصيل',
        fr: 'Voir les détails'
      },
      'jobs.posted': {
        en: 'Posted',
        ar: 'تم النشر',
        fr: 'Publié'
      },
      'jobs.noJobsFound': {
        en: 'No jobs found matching your criteria.',
        ar: 'لم يتم العثور على وظائف تطابق معاييرك.',
        fr: 'Aucun emploi trouvé correspondant à vos critères.'
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(filters.keywords && { keywords: filters.keywords }),
        ...(filters.location && { location: filters.location }),
        ...(filters.category && { category: filters.category }),
        ...(filters.workingType && { workingType: filters.workingType }),
        ...(filters.sector && { sector: filters.sector }),
      });

      const response = await fetch(`/api/jobs?${queryParams}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.keywords, filters.location, filters.category, filters.workingType, filters.sector]);

  useEffect(() => {
    fetchJobs();
  }, [debouncedKeywords, filters.location, filters.category, filters.workingType, filters.sector, fetchJobs]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={getText('jobs.keywordsPlaceholder')}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.keywords}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">{getText('jobs.allLocations')}</option>
              {/* Add more location options */}
            </select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">{getText('jobs.allCategories')}</option>
              <option value="technical">{getText('jobs.technical')}</option>
              <option value="hse">{getText('jobs.hse')}</option>
              <option value="corporate">{getText('jobs.corporate')}</option>
              <option value="executive">{getText('jobs.executive')}</option>
              <option value="operations">{getText('jobs.operations')}</option>
            </select>
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300"
            onClick={() => fetchJobs()}
          >
            <Search className="w-5 h-5 mr-2" /> {getText('jobs.search')}
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center mx-auto"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? getText('jobs.hideAdvancedFilters') : getText('jobs.showAdvancedFilters')}
          </button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t border-gray-200 pt-6">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={filters.workingType}
                onChange={(e) => setFilters({ ...filters, workingType: e.target.value })}
              >
                <option value="">{getText('jobs.workingType')}</option>
                <option value="full-time">{getText('jobs.fullTime')}</option>
                <option value="part-time">{getText('jobs.partTime')}</option>
                <option value="contract">{getText('jobs.contract')}</option>
                <option value="remote">{getText('jobs.remote')}</option>
                <option value="hybrid">{getText('jobs.hybrid')}</option>
              </select>
            </div>

            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              >
                <option value="">{getText('jobs.sector')}</option>
                <option value="oil-gas">{getText('jobs.oilGas')}</option>
                <option value="renewable">{getText('jobs.renewable')}</option>
                <option value="both">{getText('jobs.both')}</option>
              </select>
            </div>

            {/* Salary Range (Optional) */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={getText('jobs.minSalary')}
                className="w-1/2 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.salaryMin || ''}
                onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
              />
              <input
                type="number"
                placeholder={getText('jobs.maxSalary')}
                className="w-1/2 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.salaryMax || ''}
                onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>{getText('jobs.loading')}</p>
        ) : jobs.length > 0 ? (
          jobs.map((job: Job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-1">{job.company.name} - {job.location.city}, {job.location.country}</p>
              <p className="text-gray-500 text-sm mb-4">{job.workingType} - {job.category}</p>
              <p className="text-gray-700 text-base line-clamp-3">{job.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-blue-600 font-semibold">
                  {formatCurrency(job.salary.min, 'en', job.salary.currency)} - {formatCurrency(job.salary.max, 'en', job.salary.currency)}
                </span>
                <a href={`/jobs/${job._id}`} className="text-blue-600 hover:underline">{getText('jobs.viewDetails')}</a>
              </div>
              <p className="text-gray-500 text-sm mt-2">{getText('jobs.posted')}: {formatDate(new Date(job.createdAt), 'en')}</p>
            </div>
          ))
        ) : (
          <p>{getText('jobs.noJobsFound')}</p>
        )}
      </div>
    </div>
  );
}