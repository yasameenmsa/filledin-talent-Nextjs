'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Eye,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n/client';

interface Application {
  _id: string;
  applicant: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      location?: string;
      bio?: string;
      skills: string[];
      experience: Array<{
        company: string;
        position: string;
        duration: string;
        description: string;
      }>;
      education: Array<{
        institution: string;
        degree: string;
        field: string;
        year: string;
      }>;
      cvUrl?: string;
      profileImage?: string;
    };
  };
  job: {
    _id: string;
    title: string;
    department?: string;
  };
  status: 'pending' | 'reviewing' | 'interviewed' | 'hired' | 'rejected';
  appliedAt: string;
  coverLetter?: string;
  rating?: number;
  notes?: string;
}

export default function CandidatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const { t } = useTranslation(lang);
  const { userData } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('appliedAt');
  // const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Array<{_id: string, title: string}>>([]);

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications/employer');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs/my-jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status: status as any } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const rateCandidate = async (applicationId: string, rating: number) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/rating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, rating } : app
          )
        );
      }
    } catch (error) {
      console.error('Error rating candidate:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicant.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.job._id === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'appliedAt':
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      case 'name':
        return `${a.applicant.profile.firstName} ${a.applicant.profile.lastName}`
          .localeCompare(`${b.applicant.profile.firstName} ${b.applicant.profile.lastName}`);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewing':
        return <Eye className="w-4 h-4" />;
      case 'interviewed':
        return <MessageSquare className="w-4 h-4" />;
      case 'hired':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${onRate ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => onRate && onRate(star)}
          />
        ))}
      </div>
    );
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
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                {t('candidates.title')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('candidates.description')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                {t('export')}
              </button>
              <Link
                href={`/${lang}/jobs/create`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('jobs.postNew')}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{t('dashboard.applications')}</p>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{t('applications.status.pending')}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{t('applications.status.reviewing')}</p>
            <p className="text-2xl font-bold text-blue-600">
              {applications.filter(app => app.status === 'reviewing').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{t('applications.status.interviewed')}</p>
            <p className="text-2xl font-bold text-purple-600">
              {applications.filter(app => app.status === 'interviewed').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">{t('applications.status.hired')}</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.status === 'hired').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('candidates.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="all">{t('candidates.allStatus')}</option>
                <option value="pending">{t('applications.status.pending')}</option>
                <option value="reviewing">{t('applications.status.reviewing')}</option>
                <option value="interviewed">{t('applications.status.interviewed')}</option>
                <option value="hired">{t('applications.status.hired')}</option>
                <option value="rejected">{t('applications.status.rejected')}</option>
              </select>
              
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('candidates.allJobs')}</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="appliedAt">{t('candidates.recentlyApplied')}</option>
                <option value="name">{t('name')}</option>
                <option value="rating">{t('candidates.rating')}</option>
                <option value="status">{t('status')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {sortedApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {applications.length === 0 ? t('candidates.noApplications') : t('candidates.noMatches')}
            </h3>
            <p className="text-gray-600 mb-6">
              {applications.length === 0 
                ? t('candidates.noApplicationsDescription')
                : t('candidates.noMatchesDescription')
              }
            </p>
            <Link
              href={`/${lang}/jobs`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('candidates.viewJobPostings')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Profile Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        {application.applicant.profile.profileImage ? (
                          <img
                            src={application.applicant.profile.profileImage}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-semibold text-gray-600">
                            {application.applicant.profile.firstName[0]}
                            {application.applicant.profile.lastName[0]}
                          </span>
                        )}
                      </div>

                      {/* Candidate Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.applicant.profile.firstName} {application.applicant.profile.lastName}
                            </h3>
                            <p className="text-gray-600">{application.applicant.email}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {renderStars(
                              application.rating || 0,
                              (rating) => rateCandidate(application._id, rating)
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            <span>{application.job.title}</span>
                          </div>
                          {application.applicant.profile.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              <span>{application.applicant.profile.phone}</span>
                            </div>
                          )}
                          {application.applicant.profile.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{application.applicant.profile.location}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        {application.applicant.profile.skills.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {application.applicant.profile.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {application.applicant.profile.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{application.applicant.profile.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bio */}
                        {application.applicant.profile.bio && (
                          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                            {application.applicant.profile.bio}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </span>
                            
                            <select
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="interviewed">Interviewed</option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {application.applicant.profile.cvUrl && (
                              <a
                                href={application.applicant.profile.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View CV"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                            <a
                              href={`mailto:${application.applicant.email}`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                            <Link
                              href={`/candidates/${application.applicant._id}`}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
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