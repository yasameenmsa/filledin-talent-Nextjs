'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n/client';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  recentApplications: any[];
  recentJobs: any[];
}

export default function EmployerDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { t } = useTranslation(lang);
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    recentApplications: [],
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch job statistics
      const jobsResponse = await fetch('/api/jobs/my-jobs?limit=5');
      const jobsData = await jobsResponse.json();
      
      // Fetch application statistics
      const applicationsResponse = await fetch('/api/applications?limit=5');
      const applicationsData = await applicationsResponse.json();

      setStats({
        totalJobs: jobsData.stats?.totalJobs || 0,
        activeJobs: jobsData.stats?.activeJobs || 0,
        totalApplications: jobsData.stats?.totalApplications || 0,
        totalViews: jobsData.stats?.totalViews || 0,
        recentApplications: applicationsData.applications || [],
        recentJobs: jobsData.jobs || []
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
              {t('dashboard.employer.welcomeBack', { name: userData?.profile?.firstName || t('dashboard.employer.employer') })}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('dashboard.employer.todayOverview')}
            </p>
          </div>
          <Link
            href={`/${lang}/employer/jobs/create`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('dashboard.employer.postNewJob')}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.employer.totalJobs')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.employer.activeJobs')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.applications')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.employer.totalViews')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
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
              <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.employer.recentApplications')}</h2>
              <Link
                href={`/${lang}/employer/candidates`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('dashboard.admin.viewAll')}
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {stats.recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {application.applicant?.profile?.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {application.applicant?.profile?.firstName} {application.applicant?.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{application.job?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(application.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">{t('dashboard.employer.noRecentApplications')}</p>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.employer.recentJobs')}</h2>
              <Link
                href={`/${lang}/employer/jobs`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('dashboard.admin.viewAll')}
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.recentJobs.length > 0 ? (
              <div className="space-y-4">
                {stats.recentJobs.map((job) => (
                  <div key={job._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">
                        {job.location?.city}, {job.location?.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                        }`}>
                          {job.isActive ? t('dashboard.status.active') : t('dashboard.status.inactive')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('dashboard.employer.applicationsCount', { count: job.applicationCount || 0 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">{t('dashboard.employer.noJobsPosted')}</p>
                <Link
                  href={`/${lang}/employer/jobs/create`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('dashboard.employer.postFirstJob')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}