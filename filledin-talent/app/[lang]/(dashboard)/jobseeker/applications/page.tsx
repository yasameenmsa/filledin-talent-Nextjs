'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils/formatters';
import {
  Search,
  Eye,
  Calendar,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Trash2
} from 'lucide-react';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
      logo?: string;
    };
    location: {
      city: string;
      state?: string;
      country: string;
    };
    jobType: string;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  status: 'pending' | 'interviews' | 'accepted' | 'rejected';
  coverLetter?: string;
  cvUrl?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  interviewDetails?: {
    date: string;
    type: 'phone' | 'video' | 'in-person';
    location?: string;
    notes?: string;
  }[];
}

export default function JobSeekerApplicationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { currentLanguage } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0
  });

  // Inline translation function
  const getText = (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, Record<string, string>> = {
      'applications.myApplications': {
        en: 'My Applications',
        ar: 'طلباتي',
        fr: 'Mes Candidatures'
      },
      'applications.trackStatus': {
        en: 'Track the status of your job applications',
        ar: 'تتبع حالة طلبات العمل الخاصة بك',
        fr: 'Suivez le statut de vos candidatures'
      },
      'applications.findMoreJobs': {
        en: 'Find More Jobs',
        ar: 'العثور على المزيد من الوظائف',
        fr: 'Trouver Plus d\'Emplois'
      },
      'applications.totalApplications': {
        en: 'Total Applications',
        ar: 'إجمالي الطلبات',
        fr: 'Total des Candidatures'
      },
      'applications.status.pending': {
        en: 'Pending',
        ar: 'قيد الانتظار',
        fr: 'En Attente'
      },
      'applications.status.shortlisted': {
        en: 'Shortlisted',
        ar: 'مدرج في القائمة المختصرة',
        fr: 'Présélectionné'
      },
      'applications.status.rejected': {
        en: 'Rejected',
        ar: 'مرفوض',
        fr: 'Rejeté'
      },
      'applications.status.reviewing': {
        en: 'Reviewing',
        ar: 'قيد المراجعة',
        fr: 'En Révision'
      },
      'applications.status.interviewed': {
        en: 'Interviewed',
        ar: 'تمت المقابلة',
        fr: 'Interviewé'
      },
      'applications.status.offered': {
        en: 'Offered',
        ar: 'تم العرض',
        fr: 'Offre Reçue'
      },
      'applications.searchPlaceholder': {
        en: 'Search applications...',
        ar: 'البحث في الطلبات...',
        fr: 'Rechercher des candidatures...'
      },
      'applications.allStatus': {
        en: 'All Status',
        ar: 'جميع الحالات',
        fr: 'Tous les Statuts'
      },
      'applications.interviewScheduled': {
        en: 'Interview Scheduled',
        ar: 'تم جدولة المقابلة',
        fr: 'Entretien Programmé'
      },
      'applications.date': {
        en: 'Date',
        ar: 'التاريخ',
        fr: 'Date'
      },
      'applications.type': {
        en: 'Type',
        ar: 'النوع',
        fr: 'Type'
      },
      'applications.location': {
        en: 'Location',
        ar: 'الموقع',
        fr: 'Lieu'
      },
      'applications.notes': {
        en: 'Notes',
        ar: 'ملاحظات',
        fr: 'Notes'
      },
      'applications.employerNotes': {
        en: 'Employer Notes',
        ar: 'ملاحظات صاحب العمل',
        fr: 'Notes de l\'Employeur'
      },
      'applications.rating': {
        en: 'Rating',
        ar: 'التقييم',
        fr: 'Évaluation'
      },
      'applications.applied': {
        en: 'Applied',
        ar: 'تم التقديم',
        fr: 'Candidature Envoyée'
      },
      'applications.updated': {
        en: 'Updated',
        ar: 'تم التحديث',
        fr: 'Mis à Jour'
      },
      'applications.viewCV': {
        en: 'View CV',
        ar: 'عرض السيرة الذاتية',
        fr: 'Voir CV'
      },
      'applications.viewJob': {
        en: 'View Job',
        ar: 'عرض الوظيفة',
        fr: 'Voir l\'Emploi'
      },
      'applications.withdraw': {
        en: 'Withdraw',
        ar: 'سحب',
        fr: 'Retirer'
      },
      'applications.withdrawConfirmation': {
        en: 'Are you sure you want to withdraw this application?',
        ar: 'هل أنت متأكد من أنك تريد سحب هذا الطلب؟',
        fr: 'Êtes-vous sûr de vouloir retirer cette candidature?'
      },
      'applications.withdrawFailed': {
        en: 'Failed to withdraw application',
        ar: 'فشل في سحب الطلب',
        fr: 'Échec du retrait de la candidature'
      },
      'applications.delete': {
        en: 'Delete',
        ar: 'حذف',
        fr: 'Supprimer'
      },
      'applications.deleteConfirmation': {
        en: 'Are you sure you want to delete this application? The job no longer exists.',
        ar: 'هل أنت متأكد من حذف هذا الطلب؟ الوظيفة لم تعد موجودة.',
        fr: 'Êtes-vous sûr de vouloir supprimer cette candidature? L\'emploi n\'existe plus.'
      },
      'applications.jobDeleted': {
        en: 'Job Deleted',
        ar: 'الوظيفة محذوفة',
        fr: 'Emploi Supprimé'
      },
      'applications.noApplicationsYet': {
        en: 'No Applications Yet',
        ar: 'لا توجد طلبات بعد',
        fr: 'Aucune Candidature Encore'
      },
      'applications.startApplying': {
        en: 'Start applying to jobs to see your applications here.',
        ar: 'ابدأ في التقديم للوظائف لرؤية طلباتك هنا.',
        fr: 'Commencez à postuler pour voir vos candidatures ici.'
      },
      'applications.browseJobs': {
        en: 'Browse Jobs',
        ar: 'تصفح الوظائف',
        fr: 'Parcourir les Emplois'
      },
      'applications.pageOf': {
        en: 'Page {current} of {total}',
        ar: 'الصفحة {current} من {total}',
        fr: 'Page {current} sur {total}'
      },
      'applications.previous': {
        en: 'Previous',
        ar: 'السابق',
        fr: 'Précédent'
      },
      'applications.next': {
        en: 'Next',
        ar: 'التالي',
        fr: 'Suivant'
      },
      'jobs.salaryNotSpecified': {
        en: 'Salary not specified',
        ar: 'الراتب غير محدد',
        fr: 'Salaire non spécifié'
      },
      'jobs.salaryFrom': {
        en: 'From {amount}',
        ar: 'من {amount}',
        fr: 'À partir de {amount}'
      },
      'jobs.salaryUpTo': {
        en: 'Up to {amount}',
        ar: 'حتى {amount}',
        fr: 'Jusqu\'à {amount}'
      }
    };

    const translation = translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;

    if (params) {
      return Object.keys(params).reduce((text, param) => {
        const value = params[param];
        return text.replace(`{${param}}`, value !== null && value !== undefined ? String(value) : '');
      }, translation);
    }

    return translation;
  };

  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/applications?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
        setTotalPages(data.pagination.totalPages);
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm(getText('applications.withdrawConfirmation'))) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
      } else {
        alert(getText('applications.withdrawFailed'));
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert(getText('applications.withdrawFailed'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'reviewing':
        return 'text-blue-600 bg-blue-100';
      case 'shortlisted':
        return 'text-green-600 bg-green-100';
      case 'interviewed':
        return 'text-purple-600 bg-purple-100';
      case 'offered':
        return 'text-emerald-600 bg-emerald-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewing':
        return <Eye className="h-4 w-4" />;
      case 'shortlisted':
        return <CheckCircle className="h-4 w-4" />;
      case 'interviewed':
        return <Calendar className="h-4 w-4" />;
      case 'offered':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
    if (!min && !max) return getText('jobs.salaryNotSpecified');
    if (min && max) return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    if (min) return getText('jobs.salaryFrom', { amount: `${currencySymbol}${min.toLocaleString()}` });
    if (max) return getText('jobs.salaryUpTo', { amount: `${currencySymbol}${max.toLocaleString()}` });
    return getText('jobs.salaryNotSpecified');
  };



  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => fetchApplications()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getText('applications.myApplications')}</h1>
          <p className="text-gray-600 mt-1">{getText('applications.trackStatus')}</p>
        </div>
        <Link
          href={`/${lang}/jobs`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          {getText('applications.findMoreJobs')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{getText('applications.totalApplications')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{getText('applications.status.pending')}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{getText('applications.status.shortlisted')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.shortlistedApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{getText('applications.status.rejected')}</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={getText('applications.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{getText('applications.allStatus')}</option>
              <option value="pending">{getText('applications.status.pending')}</option>
              <option value="reviewing">{getText('applications.status.reviewing')}</option>
              <option value="shortlisted">{getText('applications.status.shortlisted')}</option>
              <option value="interviewed">{getText('applications.status.interviewed')}</option>
              <option value="offered">{getText('applications.status.offered')}</option>
              <option value="rejected">{getText('applications.status.rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((application) => (
            <div key={application._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link
                          href={`/${lang}/jobs/${application.job?._id}`}
                          className="hover:text-blue-600"
                        >
                          {application.job?.title || 'Unknown Job Title'}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {application.job?.company?.name || 'Unknown Company'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {application.job?.location ? `${application.job.location.city}, ${application.job.location.state}` : 'Location not available'}
                        </div>
                        {application.job?.jobType && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {application.job.jobType}
                          </div>
                        )}
                      </div>
                      {application.job?.salary && (
                        <div className="text-sm text-gray-600 mt-1">
                          {formatSalary(application.job.salary.min, application.job.salary.max)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{getText(`applications.status.${application.status}`)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Interview Details */}
                  {application.interviewDetails && application.interviewDetails.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center text-blue-800 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="font-medium">{getText('applications.interviewScheduled')}</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        <p>{getText('applications.date')}: {formatDateTime(application.interviewDetails[0].date)}</p>
                        <p>{getText('applications.type')}: {application.interviewDetails[0].type}</p>
                        {application.interviewDetails[0].location && (
                          <p>{getText('applications.location')}: {application.interviewDetails[0].location}</p>
                        )}
                        {application.interviewDetails[0].notes && (
                          <p>{getText('applications.notes')}: {application.interviewDetails[0].notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes from employer */}
                  {application.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center text-gray-800 mb-1">
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="font-medium">{getText('applications.employerNotes')}</span>
                      </div>
                      <p className="text-sm text-gray-700">{application.notes}</p>
                    </div>
                  )}

                  {/* Rating */}
                  {application.rating && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center text-yellow-800 mb-1">
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="font-medium">{getText('applications.rating')}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < application.rating! ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm text-yellow-700">{application.rating}/5</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div>
                        {getText('applications.applied')} {formatDate(new Date(application.createdAt), lang)}
                      </div>
                      {application.updatedAt !== application.createdAt && (
                        <div>
                          {getText('applications.updated')} {formatDate(new Date(application.updatedAt), lang)}
                        </div>
                      )}
                      {application.cvUrl && (
                        <a
                          href={application.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {getText('applications.viewCV')}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {application.job?._id && (
                        <Link
                          href={`/${lang}/jobs/${application.job._id}`}
                          className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {getText('applications.viewJob')}
                        </Link>
                      )}
                      {/* Show delete for orphaned applications (deleted jobs) */}
                      {!application.job?._id && (
                        <button
                          onClick={() => {
                            if (confirm(getText('applications.deleteConfirmation'))) {
                              handleWithdrawApplication(application._id);
                            }
                          }}
                          className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {getText('applications.delete')}
                        </button>
                      )}
                      {/* Show withdraw for pending applications */}
                      {application.job?._id && application.status === 'pending' && (
                        <button
                          onClick={() => handleWithdrawApplication(application._id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {getText('applications.withdraw')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <div className="max-w-md mx-auto">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{getText('applications.noApplicationsYet')}</h3>
              <p className="text-gray-500 mb-6">
                {getText('applications.startApplying')}
              </p>
              <Link
                href={`/${lang}/jobs`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                {getText('applications.browseJobs')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {getText('applications.pageOf', { current: currentPage, total: totalPages })}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {getText('applications.previous')}
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {getText('applications.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}