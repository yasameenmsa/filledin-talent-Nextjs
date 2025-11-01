'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Bookmark, 
  Send, 
  Search,
  Calendar,
  Clock,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils/formatters';

interface Application {
  _id: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
  job: {
    title: string;
    company: { name: string };
    location?: { city: string; country: string };
  };
  createdAt: string;
}

interface Job {
  _id: string;
  title: string;
  company: { name: string; logo?: string };
  location: { city: string; country: string; state?: string };
  workingType: string;
  salary: { min?: number; max?: number; currency: string };
  createdAt: string;
  viewCount?: number;
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  savedJobs: number;
  recentApplications: Application[];
  recommendedJobs: Job[];
}

export default function JobSeekerDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  // Inline translation function
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'jobs.salaryNotSpecified': {
        en: 'Salary not specified',
        ar: 'الراتب غير محدد',
        fr: 'Salaire non spécifié'
      },
      'jobs.salaryFrom': {
        en: 'From',
        ar: 'من',
        fr: 'À partir de'
      },
      'jobs.salaryUpTo': {
        en: 'Up to',
        ar: 'حتى',
        fr: 'Jusqu\'à'
      },
      'jobseeker.welcomeBack': {
        en: 'Welcome back',
        ar: 'مرحباً بعودتك',
        fr: 'Bon retour'
      },
      'jobseeker.jobSeeker': {
        en: 'Job Seeker',
        ar: 'باحث عن عمل',
        fr: 'Demandeur d\'emploi'
      },
      'jobseeker.trackApplications': {
        en: 'Track Applications',
        ar: 'تتبع الطلبات',
        fr: 'Suivre les candidatures'
      },
      'jobseeker.findJobs': {
        en: 'Find Jobs',
        ar: 'البحث عن وظائف',
        fr: 'Trouver des emplois'
      },
      'dashboard.applications': {
        en: 'Applications',
        ar: 'الطلبات',
        fr: 'Candidatures'
      },
      'applications.status.pending': {
        en: 'Pending',
        ar: 'قيد الانتظار',
        fr: 'En attente'
      },
      'applications.status.reviewed': {
        en: 'Reviewed',
        ar: 'تمت المراجعة',
        fr: 'Examiné'
      },
      'applications.status.shortlisted': {
        en: 'Shortlisted',
        ar: 'مدرج في القائمة المختصرة',
        fr: 'Présélectionné'
      },
      'applications.status.interview': {
        en: 'Interview',
        ar: 'مقابلة',
        fr: 'Entretien'
      },
      'applications.status.rejected': {
        en: 'Rejected',
        ar: 'مرفوض',
        fr: 'Rejeté'
      },
      'applications.status.hired': {
        en: 'Hired',
        ar: 'تم التوظيف',
        fr: 'Embauché'
      },
      'jobseeker.interviews': {
        en: 'Interviews',
        ar: 'المقابلات',
        fr: 'Entretiens'
      },
      'jobseeker.savedJobs': {
        en: 'Saved Jobs',
        ar: 'الوظائف المحفوظة',
        fr: 'Emplois sauvegardés'
      },
      'jobseeker.recentApplications': {
        en: 'Recent Applications',
        ar: 'الطلبات الأخيرة',
        fr: 'Candidatures récentes'
      },
      'viewAll': {
        en: 'View All',
        ar: 'عرض الكل',
        fr: 'Voir tout'
      },
      'jobseeker.noApplicationsYet': {
        en: 'No applications yet',
        ar: 'لا توجد طلبات بعد',
        fr: 'Aucune candidature pour le moment'
      },
      'jobseeker.startApplying': {
        en: 'Start applying to jobs',
        ar: 'ابدأ بالتقديم للوظائف',
        fr: 'Commencer à postuler'
      },
      'jobseeker.recommendedJobs': {
        en: 'Recommended Jobs',
        ar: 'الوظائف الموصى بها',
        fr: 'Emplois recommandés'
      },
      'jobseeker.noRecommendations': {
        en: 'No recommendations available',
        ar: 'لا توجد توصيات متاحة',
        fr: 'Aucune recommandation disponible'
      },
      'jobseeker.quickActions': {
        en: 'Quick Actions',
        ar: 'الإجراءات السريعة',
        fr: 'Actions rapides'
      },
      'jobseeker.updateProfile': {
        en: 'Update Profile',
        ar: 'تحديث الملف الشخصي',
        fr: 'Mettre à jour le profil'
      },
      'jobseeker.keepProfileCurrent': {
        en: 'Keep your profile up to date',
        ar: 'حافظ على ملفك الشخصي محدثاً',
        fr: 'Gardez votre profil à jour'
      },
      'jobseeker.searchJobs': {
        en: 'Search Jobs',
        ar: 'البحث عن وظائف',
        fr: 'Rechercher des emplois'
      },
      'jobseeker.findOpportunity': {
        en: 'Find your next opportunity',
        ar: 'اعثر على فرصتك القادمة',
        fr: 'Trouvez votre prochaine opportunité'
      },
      'jobseeker.reviewSavedPositions': {
        en: 'Review saved positions',
        ar: 'راجع المناصب المحفوظة',
        fr: 'Examiner les postes sauvegardés'
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    savedJobs: 0,
    recentApplications: [],
    recommendedJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch application statistics
      const applicationsResponse = await fetch('/api/applications?limit=5');
      const applicationsData = await applicationsResponse.json();
      
      // Fetch recommended jobs
      const jobsResponse = await fetch('/api/jobs?limit=5');
      const jobsData = await jobsResponse.json();

      // Calculate stats from applications
      const applications = applicationsData.applications || [];
      const pendingCount = applications.filter((app: Application) => app.status === 'pending').length;
      const interviewCount = applications.filter((app: Application) => app.status === 'interviewed').length;

      setStats({
        totalApplications: applicationsData.stats?.totalApplications || applications.length,
        pendingApplications: pendingCount,
        interviewsScheduled: interviewCount,
        savedJobs: 0, // This would come from a saved jobs API
        recentApplications: applications,
        recommendedJobs: jobsData.jobs || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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



  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
    if (!min && !max) return getText('jobs.salaryNotSpecified');
    if (min && max) return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    if (min) return `${getText('jobs.salaryFrom')} ${currencySymbol}${min.toLocaleString()}`;
    if (max) return `${getText('jobs.salaryUpTo')} ${currencySymbol}${max.toLocaleString()}`;
    return getText('jobs.salaryNotSpecified');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getText('jobseeker.welcomeBack')} {user?.profile?.firstName || getText('jobseeker.jobSeeker')}
            </h1>
            <p className="text-gray-600 mt-1">
              {getText('jobseeker.trackApplications')}
            </p>
          </div>
          <Link
            href={`/${lang}/jobs`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            {getText('jobseeker.findJobs')}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getText('dashboard.applications')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getText('applications.status.pending')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getText('jobseeker.interviews')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bookmark className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getText('jobseeker.savedJobs')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.savedJobs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{getText('jobseeker.recentApplications')}</h2>
              <Link
                href={`/${lang}/jobseeker/applications`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {getText('viewAll')}
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {stats.recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {application.job?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {application.job?.company?.name} • {application.job?.location?.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {getText(`applications.status.${application.status.toLowerCase()}`)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(new Date(application.createdAt), lang)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">{getText('jobseeker.noApplicationsYet')}</p>
                <Link
                  href={`/${lang}/jobs`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {getText('jobseeker.startApplying')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{getText('jobseeker.recommendedJobs')}</h2>
              <Link
                href={`/${lang}/jobs`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {getText('viewAll')}
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.recommendedJobs.length > 0 ? (
              <div className="space-y-4">
                {stats.recommendedJobs.map((job) => (
                  <div key={job._id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          <Link href={`/${lang}/jobs/${job._id}`}>
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {job.company?.name} • {job.location?.city}, {job.location?.state}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatSalary(job.salary?.min, job.salary?.max)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-xs text-gray-500">
                          {formatDate(new Date(job.createdAt), lang)}
                        </span>
                        {job.viewCount && (
                          <div className="flex items-center mt-1">
                            <Eye className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{job.viewCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">{getText('jobseeker.noRecommendations')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{getText('jobseeker.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/${lang}/jobseeker/profile`}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{getText('jobseeker.updateProfile')}</h3>
              <p className="text-sm text-gray-600">{getText('jobseeker.keepProfileCurrent')}</p>
            </div>
          </Link>

          <Link
            href={`/${lang}/jobs`}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{getText('jobseeker.searchJobs')}</h3>
              <p className="text-sm text-gray-600">{getText('jobseeker.findOpportunity')}</p>
            </div>
          </Link>

          <Link
            href={`/${lang}/jobseeker/saved-jobs`}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bookmark className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{getText('jobseeker.savedJobs')}</h3>
              <p className="text-sm text-gray-600">{getText('jobseeker.reviewSavedPositions')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}