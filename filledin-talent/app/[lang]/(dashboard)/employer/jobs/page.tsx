'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/client';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  Calendar,
  MapPin,
  DollarSign,
  MoreVertical
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  jobType: string;
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
  applicationCount: number;
  viewCount: number;
  createdAt: string;
  applicationDeadline?: string;
}

export default function EmployerJobsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { t } = useTranslation(lang);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    inactiveJobs: 0,
    totalApplications: 0,
    totalViews: 0
  });

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/jobs/my-jobs?${params}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
        setTotalPages(data.pagination.totalPages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm(t('jobs.deleteConfirmation'))) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchJobs(); // Refresh the list
      } else {
        alert(t('jobs.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(t('jobs.deleteFailed'));
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        fetchJobs(); // Refresh the list
      } else {
        alert(t('jobs.updateStatusFailed'));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert(t('jobs.updateStatusFailed'));
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return t('jobs.salaryNotSpecified');
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return t('jobs.salaryFrom', { amount: `$${min.toLocaleString()}` });
    if (max) return t('jobs.salaryUpTo', { amount: `$${max.toLocaleString()}` });
    return t('jobs.salaryNotSpecified');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('jobs.myJobs')}</h1>
          <p className="text-gray-600 mt-1">{t('jobs.manageDescription')}</p>
        </div>
        <Link
          href={`/${lang}/employer/jobs/create`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('jobs.postNew')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('jobs.totalJobs')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.status.active')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.status.inactive')}</p>
          <p className="text-2xl font-bold text-gray-600">{stats.inactiveJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.applications')}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('analytics.totalViews')}</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
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
                placeholder={t('jobs.searchPlaceholder')}
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
              <option value="all">{t('jobs.allStatus')}</option>
              <option value="active">{t('dashboard.status.active')}</option>
              <option value="inactive">{t('dashboard.status.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location.city}, {job.location.state}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {job.jobType}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatSalary(job.salary?.min, job.salary?.max)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.isActive 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {job.isActive ? t('dashboard.status.active') : t('dashboard.status.inactive')}
                      </span>
                      {job.applicationDeadline && isDeadlinePassed(job.applicationDeadline) && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full text-red-600 bg-red-100">
                          {t('jobs.deadlinePassed')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {t('jobs.applicationsCount', { count: job.applicationCount })}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {t('jobs.viewsCount', { count: job.viewCount })}
                      </div>
                      <div>
                        {t('jobs.posted')} {formatDate(job.createdAt)}
                      </div>
                      {job.applicationDeadline && (
                        <div>
                          {t('jobs.deadline')}: {formatDate(job.applicationDeadline)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/${lang}/jobs/${job._id}`}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('view')}
                      </Link>
                      <Link
                        href={`/${lang}/employer/jobs/${job._id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t('edit')}
                      </Link>
                      <button
                        onClick={() => toggleJobStatus(job._id, job.isActive)}
                        className={`inline-flex items-center px-3 py-1 text-sm ${
                          job.isActive 
                            ? 'text-red-600 hover:text-red-700' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {job.isActive ? t('jobs.deactivate') : t('jobs.activate')}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('delete')}
                      </button>
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
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('jobs.noJobsPosted')}</h3>
              <p className="text-gray-500 mb-6">
                {t('jobs.noJobsDescription')}
              </p>
              <Link
                href={`/${lang}/employer/jobs/create`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('jobs.postFirstJob')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}