'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Bookmark, 
  Send, 
  TrendingUp, 
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n/client';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  savedJobs: number;
  recentApplications: any[];
  recommendedJobs: any[];
}

export default function JobSeekerDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { user } = useAuth();
  const { t } = useTranslation(lang);
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
      const pendingCount = applications.filter((app: any) => app.status === 'pending').length;
      const interviewCount = applications.filter((app: any) => app.status === 'interviewed').length;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return t('jobs.salaryNotSpecified');
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `${t('jobs.salaryFrom')} $${min.toLocaleString()}`;
    if (max) return `${t('jobs.salaryUpTo')} $${max.toLocaleString()}`;
    return t('jobs.salaryNotSpecified');
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
              {t('jobseeker.welcomeBack', { name: user?.profile?.firstName || t('jobseeker.jobSeeker') })}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('jobseeker.trackApplications')}
            </p>
          </div>
          <Link
            href={`/${lang}/jobs`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            {t('jobseeker.findJobs')}
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
              <p className="text-sm font-medium text-gray-600">{t('dashboard.applications')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('applications.status.pending')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('jobseeker.interviews')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('jobseeker.savedJobs')}</p>
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
              <h2 className="text-lg font-semibold text-gray-900">{t('jobseeker.recentApplications')}</h2>
              <Link
                href={`/${lang}/jobseeker/applications`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('viewAll')}
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
                        {t(`applications.status.${application.status.toLowerCase()}`)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">{t('jobseeker.noApplicationsYet')}</p>
                <Link
                  href={`/${lang}/jobs`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('jobseeker.startApplying')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('jobseeker.recommendedJobs')}</h2>
              <Link
                href={`/${lang}/jobs`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('viewAll')}
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
                          {formatDate(job.createdAt)}
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
              <p className="text-gray-500 text-center py-4">{t('jobseeker.noRecommendations')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('jobseeker.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/${lang}/jobseeker/profile`}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{t('jobseeker.updateProfile')}</h3>
              <p className="text-sm text-gray-600">{t('jobseeker.keepProfileCurrent')}</p>
            </div>
          </Link>

          <Link
            href={`/${lang}/jobs`}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{t('jobseeker.searchJobs')}</h3>
              <p className="text-sm text-gray-600">{t('jobseeker.findOpportunity')}</p>
            </div>
          </Link>

          <Link
            href={`/${lang}/jobseeker/saved-jobs`}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bookmark className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{t('jobseeker.savedJobs')}</h3>
              <p className="text-sm text-gray-600">{t('jobseeker.reviewSavedPositions')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}