'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  FileText,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface AnalyticsData {
  overview: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalViews: number;
    averageApplicationsPerJob: number;
    conversionRate: number;
  };
  jobPerformance: Array<{
    jobId: string;
    title: string;
    views: number;
    applications: number;
    conversionRate: number;
    postedAt: string;
    status: string;
  }>;
  applicationTrends: Array<{
    date: string;
    applications: number;
    views: number;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  applicationStatus: {
    pending: number;
    reviewing: number;
    interviewed: number;
    hired: number;
    rejected: number;
  };
}

export default function AnalyticsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { t } = useTranslation(lang);
  const { userData } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = analytics.jobPerformance.map(job => ({
      'Job Title': job.title,
      'Views': job.views,
      'Applications': job.applications,
      'Conversion Rate': `${job.conversionRate}%`,
      'Posted Date': new Date(job.postedAt).toLocaleDateString(),
      'Status': job.status
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">{t('analytics.noData')}</h3>
          <p className="text-gray-600">{t('analytics.noDataDescription')}</p>
        </div>
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
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                {t('analytics.title')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('analytics.description')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">{t('analytics.last7Days')}</option>
                <option value="30">{t('analytics.last30Days')}</option>
                <option value="90">{t('analytics.last3Months')}</option>
                <option value="365">{t('analytics.lastYear')}</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {t('refresh')}
              </button>
              
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('export')}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.employer.totalJobs')}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalJobs}</p>
                <p className="text-sm text-green-600 mt-1">
                  {analytics.overview.activeJobs} {t('dashboard.status.active')}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.applications')}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalApplications}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {analytics.overview.averageApplicationsPerJob.toFixed(1)} {t('analytics.avgPerJob')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.employer.totalViews')}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalViews}</p>
                <p className="text-sm text-purple-600 mt-1">
                  {t('analytics.jobVisibilityMetric')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('analytics.conversionRate')}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-orange-600 mt-1">
                  {t('analytics.viewsToApplications')}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.applicationStatusBreakdown')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-gray-700">{t('applications.status.pending')}</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.applicationStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-gray-700">{t('applications.status.reviewing')}</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.applicationStatus.reviewing}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="text-gray-700">{t('applications.status.interviewed')}</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.applicationStatus.interviewed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">{t('applications.status.hired')}</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.applicationStatus.hired}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-gray-700">{t('applications.status.rejected')}</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.applicationStatus.rejected}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.topSkills')}</h3>
            <div className="space-y-3">
              {analytics.topSkills.slice(0, 8).map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <span className="text-gray-700">{skill.skill}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(skill.count / analytics.topSkills[0].count) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900 w-8 text-right">{skill.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Job Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('analytics.jobPerformance')}</h3>
            <p className="text-gray-600 mt-1">{t('analytics.jobPerformanceDescription')}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jobs.title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('analytics.views')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.applications')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('analytics.conversionRate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('analytics.postedDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.jobPerformance.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.views}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.applications}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.conversionRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(job.postedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t(`dashboard.status.${job.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trends Chart Placeholder */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.applicationTrends')}</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">{t('analytics.chartPlaceholder')}</p>
              <p className="text-sm text-gray-400">{t('analytics.chartIntegration')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}