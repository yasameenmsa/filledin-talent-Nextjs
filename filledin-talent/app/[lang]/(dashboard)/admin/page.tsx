'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Activity,
  UserCheck,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface AdminStats {
  users: {
    total: number;
    jobseekers: number;
    employers: number;
    newThisMonth: number;
    activeToday: number;
  };
  jobs: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    newThisWeek: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewing: number;
    hired: number;
    newToday: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
    totalRevenue: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user_registered' | 'job_posted' | 'application_submitted' | 'user_hired';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { user } = useAuth();
  const resolvedParams = React.use(params);
  const { t } = useTranslation(resolvedParams.lang);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin statistics
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/admin/activity?limit=10');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'job_posted':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'application_submitted':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'user_hired':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.admin.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('dashboard.welcome')}, {user?.profile?.firstName || t('dashboard.admin.title')}! {t('dashboard.admin.subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.admin.totalUsers')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.users?.total?.toLocaleString() || '0'}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats?.users?.newThisMonth || 0} {t('dashboard.admin.thisMonth')}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>{t('jobSeekers')}: {stats?.users?.jobseekers || 0}</span>
              <span>{t('dashboard.admin.employers')}: {stats?.users?.employers || 0}</span>
            </div>
          </div>

          {/* Total Jobs */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.jobs')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.jobs?.total?.toLocaleString() || '0'}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats?.jobs?.newThisWeek || 0} {t('dashboard.admin.thisWeek')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>{t('dashboard.status.active')}: {stats?.jobs?.active || 0}</span>
              <span>{t('dashboard.status.pending')}: {stats?.jobs?.pending || 0}</span>
            </div>
          </div>

          {/* Total Applications */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.applications')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.applications?.total?.toLocaleString() || '0'}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats?.applications?.newToday || 0} {t('dashboard.admin.today')}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>{t('dashboard.status.pending')}: {stats?.applications?.pending || 0}</span>
              <span>{t('dashboard.status.hired')}: {stats?.applications?.hired || 0}</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.admin.monthlyRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.revenue?.thisMonth || 0)}
                </p>
                <p className={`text-sm mt-1 ${(stats?.revenue?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.revenue?.growth || 0) >= 0 ? '+' : ''}{(stats?.revenue?.growth || 0).toFixed(1)}% {t('dashboard.admin.fromLastMonth')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {t('dashboard.admin.total')}: {formatCurrency(stats?.revenue?.totalRevenue || 0)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  {t('dashboard.admin.recentActivity')}
                </h2>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          {activity.user && (
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.user.name} ({activity.user.email})
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t('dashboard.admin.noActivity')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* User Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                {t('dashboard.admin.userActivity')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('dashboard.admin.activeToday')}</span>
                  <span className="font-semibold text-gray-900">{stats?.users?.activeToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('dashboard.admin.newThisMonth')}</span>
                  <span className="font-semibold text-gray-900">{stats?.users?.newThisMonth || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('dashboard.admin.totalUsers')}</span>
                  <span className="font-semibold text-gray-900">{stats?.users?.total || 0}</span>
                </div>
              </div>
            </div>

            {/* Job Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                {t('dashboard.admin.jobStatus')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{t('dashboard.status.active')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.jobs?.active || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{t('dashboard.status.pending')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.jobs?.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{t('dashboard.status.expired')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.jobs?.expired || 0}</span>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {t('dashboard.applications')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">{t('dashboard.status.pending')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.applications?.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">{t('dashboard.status.reviewing')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.applications?.reviewing || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">{t('dashboard.status.hired')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.applications?.hired || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.admin.quickActions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href={`/${resolvedParams.lang}/admin/users`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{t('dashboard.admin.manageUsers')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.admin.manageUsersDesc')}</p>
                </div>
              </a>
              
              <a
                href={`/${resolvedParams.lang}/admin/jobs`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Briefcase className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{t('dashboard.admin.manageJobs')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.admin.manageJobsDesc')}</p>
                </div>
              </a>
              
              <a
                href={`/${resolvedParams.lang}/admin/applications`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{t('dashboard.admin.viewApplications')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.admin.viewApplicationsDesc')}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}