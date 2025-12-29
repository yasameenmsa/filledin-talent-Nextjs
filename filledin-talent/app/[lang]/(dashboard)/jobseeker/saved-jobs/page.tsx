'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkX,
  Search,
  // Filter,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Eye,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils/formatters';

interface SavedJob {
  _id: string;
  job: {
    _id: string;
    title: string;
    description: string;
    company: {
      name: string;
      logo?: string;
    };
    location: {
      city: string;
      state: string;
      country: string;
      remote: boolean;
    };
    jobType: string;
    experienceLevel: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    postedAt: string;
    applicationDeadline?: string;
    isActive: boolean;
  };
  savedAt: string;
}

export default function SavedJobsPage({ params }: { params: Promise<{ lang: string }> }) {
  useAuth(); // Keep auth context active
  const resolvedParams = React.use(params);
  const { currentLanguage } = useLanguage();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('savedAt');

  // Inline translation function
  const getText = (key: string, params?: Record<string, string | number>): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'savedJobs.savedJobs': 'Saved Jobs',
        'savedJobs.manageBookmarked': 'Manage your bookmarked job opportunities',
        'savedJobs.findMoreJobs': 'Find More Jobs',
        'savedJobs.totalSaved': 'Total Saved',
        'savedJobs.activeJobs': 'Active Jobs',
        'savedJobs.expired': 'Expired',
        'savedJobs.thisWeek': 'This Week',
        'savedJobs.searchPlaceholder': 'Search saved jobs...',
        'savedJobs.allJobs': 'All Jobs',
        'savedJobs.activeOnly': 'Active Only',
        'savedJobs.fullTime': 'Full Time',
        'savedJobs.partTime': 'Part Time',
        'savedJobs.contract': 'Contract',
        'savedJobs.remote': 'Remote',
        'savedJobs.recentlySaved': 'Recently Saved',
        'savedJobs.recentlyPosted': 'Recently Posted',
        'savedJobs.jobTitle': 'Job Title',
        'savedJobs.companyName': 'Company Name',
        'savedJobs.noSavedJobs': 'No saved jobs yet',
        'savedJobs.noMatchingJobs': 'No jobs match your filters',
        'savedJobs.startExploring': 'Start exploring and save jobs that interest you',
        'savedJobs.tryAdjusting': 'Try adjusting your search or filters',
        'savedJobs.browseJobs': 'Browse Jobs',
        'savedJobs.active': 'Active',
        'savedJobs.removeFromSaved': 'Remove from saved',
        'savedJobs.saved': 'Saved',
        'savedJobs.viewDetails': 'View Details',
        'savedJobs.applyNow': 'Apply Now',
        'savedJobs.posted': 'Posted',
        'savedJobs.salaryNotSpecified': 'Salary not specified',
        'savedJobs.salaryFrom': 'From',
        'savedJobs.salaryUpTo': 'Up to'
      },
      ar: {
        'savedJobs.savedJobs': 'الوظائف المحفوظة',
        'savedJobs.manageBookmarked': 'إدارة فرص العمل المحفوظة',
        'savedJobs.findMoreJobs': 'البحث عن المزيد من الوظائف',
        'savedJobs.totalSaved': 'إجمالي المحفوظة',
        'savedJobs.activeJobs': 'الوظائف النشطة',
        'savedJobs.expired': 'منتهية الصلاحية',
        'savedJobs.thisWeek': 'هذا الأسبوع',
        'savedJobs.searchPlaceholder': 'البحث في الوظائف المحفوظة...',
        'savedJobs.allJobs': 'جميع الوظائف',
        'savedJobs.activeOnly': 'النشطة فقط',
        'savedJobs.fullTime': 'دوام كامل',
        'savedJobs.partTime': 'دوام جزئي',
        'savedJobs.contract': 'عقد',
        'savedJobs.remote': 'عن بُعد',
        'savedJobs.recentlySaved': 'المحفوظة مؤخراً',
        'savedJobs.recentlyPosted': 'المنشورة مؤخراً',
        'savedJobs.jobTitle': 'عنوان الوظيفة',
        'savedJobs.companyName': 'اسم الشركة',
        'savedJobs.noSavedJobs': 'لا توجد وظائف محفوظة بعد',
        'savedJobs.noMatchingJobs': 'لا توجد وظائف تطابق المرشحات',
        'savedJobs.startExploring': 'ابدأ الاستكشاف واحفظ الوظائف التي تهمك',
        'savedJobs.tryAdjusting': 'جرب تعديل البحث أو المرشحات',
        'savedJobs.browseJobs': 'تصفح الوظائف',
        'savedJobs.active': 'نشطة',
        'savedJobs.removeFromSaved': 'إزالة من المحفوظة',
        'savedJobs.saved': 'محفوظة',
        'savedJobs.viewDetails': 'عرض التفاصيل',
        'savedJobs.applyNow': 'تقدم الآن',
        'savedJobs.posted': 'نُشرت',
        'savedJobs.salaryNotSpecified': 'الراتب غير محدد',
        'savedJobs.salaryFrom': 'من',
        'savedJobs.salaryUpTo': 'حتى'
      },
      fr: {
        'savedJobs.savedJobs': 'Emplois Sauvegardés',
        'savedJobs.manageBookmarked': 'Gérez vos opportunités d\'emploi sauvegardées',
        'savedJobs.findMoreJobs': 'Trouver Plus d\'Emplois',
        'savedJobs.totalSaved': 'Total Sauvegardé',
        'savedJobs.activeJobs': 'Emplois Actifs',
        'savedJobs.expired': 'Expiré',
        'savedJobs.thisWeek': 'Cette Semaine',
        'savedJobs.searchPlaceholder': 'Rechercher des emplois sauvegardés...',
        'savedJobs.allJobs': 'Tous les Emplois',
        'savedJobs.activeOnly': 'Actifs Seulement',
        'savedJobs.fullTime': 'Temps Plein',
        'savedJobs.partTime': 'Temps Partiel',
        'savedJobs.contract': 'Contrat',
        'savedJobs.remote': 'À Distance',
        'savedJobs.recentlySaved': 'Récemment Sauvegardés',
        'savedJobs.recentlyPosted': 'Récemment Publiés',
        'savedJobs.jobTitle': 'Titre du Poste',
        'savedJobs.companyName': 'Nom de l\'Entreprise',
        'savedJobs.noSavedJobs': 'Aucun emploi sauvegardé pour le moment',
        'savedJobs.noMatchingJobs': 'Aucun emploi ne correspond à vos filtres',
        'savedJobs.startExploring': 'Commencez à explorer et sauvegardez les emplois qui vous intéressent',
        'savedJobs.tryAdjusting': 'Essayez d\'ajuster votre recherche ou vos filtres',
        'savedJobs.browseJobs': 'Parcourir les Emplois',
        'savedJobs.active': 'Actif',
        'savedJobs.removeFromSaved': 'Retirer des sauvegardés',
        'savedJobs.saved': 'Sauvegardé',
        'savedJobs.viewDetails': 'Voir les Détails',
        'savedJobs.applyNow': 'Postuler Maintenant',
        'savedJobs.posted': 'Publié',
        'savedJobs.salaryNotSpecified': 'Salaire non spécifié',
        'savedJobs.salaryFrom': 'À partir de',
        'savedJobs.salaryUpTo': 'Jusqu\'à'
      }
    };

    let text = translations[currentLanguage]?.[key] || translations['en'][key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }

    return text;
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-jobs');
      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.savedJobs || []);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/saved-jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedJobs(prev => prev.filter(savedJob => savedJob.job._id !== jobId));
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  const filteredJobs = savedJobs.filter(savedJob => {
    const matchesSearch = savedJob.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      savedJob.job.company.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' ||
      (filterType === 'active' && savedJob.job.isActive) ||
      (filterType === 'inactive' && !savedJob.job.isActive) ||
      savedJob.job.jobType.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'savedAt':
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      case 'postedAt':
        return new Date(b.job.postedAt).getTime() - new Date(a.job.postedAt).getTime();
      case 'title':
        return a.job.title.localeCompare(b.job.title);
      case 'company':
        return a.job.company.name.localeCompare(b.job.company.name);
      default:
        return 0;
    }
  });

  const formatSalary = (salary: { min?: number; max?: number; currency?: string } | null | undefined) => {
    if (!salary || (!salary.min && !salary.max)) return getText('savedJobs.salaryNotSpecified');

    const currency = salary.currency || 'USD';
    const min = salary.min ? `${currency} ${salary.min.toLocaleString()}` : '';
    const max = salary.max ? `${currency} ${salary.max.toLocaleString()}` : '';

    if (min && max) return `${min} - ${max}`;
    if (min) return `${getText('savedJobs.salaryFrom')} ${min}`;
    if (max) return `${getText('savedJobs.salaryUpTo')} ${max}`;
    return getText('savedJobs.salaryNotSpecified');
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bookmark className="w-8 h-8 mr-3 text-blue-600" />
                {getText('savedJobs.savedJobs')}
              </h1>
              <p className="text-gray-600 mt-2">
                {getText('savedJobs.manageBookmarked')}
              </p>
            </div>
            <Link
              href={`/${resolvedParams.lang}/jobs`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              {getText('savedJobs.findMoreJobs')}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{getText('savedJobs.totalSaved')}</p>
            <p className="text-2xl font-bold text-gray-900">{savedJobs.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{getText('savedJobs.activeJobs')}</p>
            <p className="text-2xl font-bold text-green-600">
              {savedJobs.filter(job => job.job.isActive).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{getText('savedJobs.expired')}</p>
            <p className="text-2xl font-bold text-red-600">
              {savedJobs.filter(job => !job.job.isActive).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{getText('savedJobs.thisWeek')}</p>
            <p className="text-2xl font-bold text-blue-600">
              {savedJobs.filter(job => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(job.savedAt) > weekAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getText('savedJobs.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{getText('savedJobs.allJobs')}</option>
                <option value="active">{getText('savedJobs.activeOnly')}</option>
                <option value="inactive">{getText('savedJobs.expired')}</option>
                <option value="full-time">{getText('savedJobs.fullTime')}</option>
                <option value="part-time">{getText('savedJobs.partTime')}</option>
                <option value="contract">{getText('savedJobs.contract')}</option>
                <option value="remote">{getText('savedJobs.remote')}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recently-saved">{getText('savedJobs.recentlySaved')}</option>
                <option value="recently-posted">{getText('savedJobs.recentlyPosted')}</option>
                <option value="job-title">{getText('savedJobs.jobTitle')}</option>
                <option value="company-name">{getText('savedJobs.companyName')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {sortedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {savedJobs.length === 0 ? getText('savedJobs.noSavedJobs') : getText('savedJobs.noMatchingJobs')}
            </h3>
            <p className="text-gray-600 mb-6">
              {savedJobs.length === 0
                ? getText('savedJobs.startExploring')
                : getText('savedJobs.tryAdjusting')
              }
            </p>
            <Link
              href={`/${resolvedParams.lang}/jobs`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              {getText('savedJobs.browseJobs')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedJobs.map((savedJob) => (
              <div key={savedJob._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {savedJob.job.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <Building className="w-4 h-4 mr-2" />
                            <span className="font-medium">{savedJob.job.company.name}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>
                              {savedJob.job.location.city}, {savedJob.job.location.state}
                              {savedJob.job.location.remote && ' (Remote)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${savedJob.job.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {savedJob.job.isActive ? getText('savedJobs.active') : getText('savedJobs.expired')}
                          </span>
                          <button
                            onClick={() => handleUnsaveJob(savedJob.job._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={getText('savedJobs.removeFromSaved')}
                          >
                            <BookmarkX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{savedJob.job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{formatSalary(savedJob.job.salary)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{getText('savedJobs.saved')} {formatDate(new Date(savedJob.savedAt), resolvedParams.lang)}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {savedJob.job.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Link
                            href={`/${resolvedParams.lang}/jobs/${savedJob.job._id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {getText('savedJobs.viewDetails')}
                          </Link>
                          {savedJob.job.isActive && (
                            <Link
                              href={`/${resolvedParams.lang}/jobs/${savedJob.job._id}#apply`}
                              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {getText('savedJobs.applyNow')}
                            </Link>
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          {getText('savedJobs.posted')} {formatDate(new Date(savedJob.job.postedAt), resolvedParams.lang)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}