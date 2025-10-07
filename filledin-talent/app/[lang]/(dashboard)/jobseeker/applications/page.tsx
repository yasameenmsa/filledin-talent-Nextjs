'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/client';
import { 
  Search, 
  Filter, 
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
      state: string;
      country: string;
    };
    jobType: string;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  status: string;
  coverLetter?: string;
  cvUrl?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  interviewDetails?: {
    scheduledAt: string;
    type: string;
    location?: string;
    notes?: string;
  };
}

export default function JobSeekerApplicationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { t } = useTranslation(lang);
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

  useEffect(() => {
    fetchApplications();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/applications?${params}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
        setTotalPages(data.pagination.totalPages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm(t('applications.withdrawConfirmation'))) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
      } else {
        alert(t('applications.withdrawFailed'));
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert(t('applications.withdrawFailed'));
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
    if (!min && !max) return t('jobs.salaryNotSpecified');
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return t('jobs.salaryFrom', { amount: `$${min.toLocaleString()}` });
    if (max) return t('jobs.salaryUpTo', { amount: `$${max.toLocaleString()}` });
    return t('jobs.salaryNotSpecified');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('applications.myApplications')}</h1>
          <p className="text-gray-600 mt-1">{t('applications.trackStatus')}</p>
        </div>
        <Link
          href={`/${lang}/jobs`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          {t('applications.findMoreJobs')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('applications.totalApplications')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('applications.status.pending')}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('applications.status.shortlisted')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.shortlistedApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-gray-600">{t('applications.status.rejected')}</p>
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
                placeholder={t('applications.searchPlaceholder')}
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
              <option value="all">{t('applications.allStatus')}</option>
              <option value="pending">{t('applications.status.pending')}</option>
              <option value="reviewing">{t('applications.status.reviewing')}</option>
              <option value="shortlisted">{t('applications.status.shortlisted')}</option>
              <option value="interviewed">{t('applications.status.interviewed')}</option>
              <option value="offered">{t('applications.status.offered')}</option>
              <option value="rejected">{t('applications.status.rejected')}</option>
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
                          href={`/${lang}/jobs/${application.job._id}`}
                          className="hover:text-blue-600"
                        >
                          {application.job.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {application.job.company.name}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {application.job.location.city}, {application.job.location.state}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {application.job.jobType}
                        </div>
                      </div>
                      {application.job.salary && (
                        <div className="text-sm text-gray-600 mt-1">
                          {formatSalary(application.job.salary.min, application.job.salary.max)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{t(`applications.status.${application.status}`)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Interview Details */}
                  {application.interviewDetails && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center text-blue-800 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="font-medium">{t('applications.interviewScheduled')}</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        <p>{t('applications.date')}: {formatDateTime(application.interviewDetails.scheduledAt)}</p>
                        <p>{t('applications.type')}: {application.interviewDetails.type}</p>
                        {application.interviewDetails.location && (
                          <p>{t('applications.location')}: {application.interviewDetails.location}</p>
                        )}
                        {application.interviewDetails.notes && (
                          <p>{t('applications.notes')}: {application.interviewDetails.notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes from employer */}
                  {application.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center text-gray-800 mb-1">
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="font-medium">{t('applications.employerNotes')}</span>
                      </div>
                      <p className="text-sm text-gray-700">{application.notes}</p>
                    </div>
                  )}

                  {/* Rating */}
                  {application.rating && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center text-yellow-800 mb-1">
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="font-medium">{t('applications.rating')}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < application.rating! ? 'text-yellow-400' : 'text-gray-300'
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
                        {t('applications.applied')} {formatDate(application.createdAt)}
                      </div>
                      {application.updatedAt !== application.createdAt && (
                        <div>
                          {t('applications.updated')} {formatDate(application.updatedAt)}
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
                          {t('applications.viewCV')}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/${lang}/jobs/${application.job._id}`}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('applications.viewJob')}
                      </Link>
                      {application.status === 'pending' && (
                        <button
                          onClick={() => handleWithdrawApplication(application._id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('applications.withdraw')}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('applications.noApplicationsYet')}</h3>
              <p className="text-gray-500 mb-6">
                {t('applications.startApplying')}
              </p>
              <Link
                href={`/${lang}/jobs`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                {t('applications.browseJobs')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {t('applications.pageOf', { current: currentPage, total: totalPages })}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t('applications.previous')}
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t('applications.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}