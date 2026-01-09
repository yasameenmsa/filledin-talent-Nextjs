'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils/formatters';
import {
    FileText,
    Search,
    Eye,
    Download,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Briefcase,
    User,
    MapPin,
    ExternalLink
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
        location?: {
            city: string;
            country: string;
            region?: string;
        };
        workingType?: string;
    };
    applicant: {
        _id: string;
        email: string;
        profile?: {
            firstName?: string;
            lastName?: string;
            profileImage?: string;
        };
    };
    status: 'pending' | 'interviews' | 'accepted' | 'rejected' | 'offer-accepted' | 'offer-rejected';
    cvUrl: string;
    coverLetter?: string;
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    pending: number;
    interviews: number;
    accepted: number;
    rejected: number;
}

export default function AdminApplicationsPage({ params }: { params: Promise<{ lang: string }> }) {
    const resolvedParams = React.use(params);
    const { currentLanguage } = useLanguage();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, interviews: 0, accepted: 0, rejected: 0 });
    const applicationsPerPage = 20;

    // Inline translation function
    const getText = (key: string, params?: Record<string, unknown>) => {
        const translations: Record<string, Record<string, string>> = {
            en: {
                'admin.applications.title': 'Application Management',
                'admin.applications.subtitle': `Manage all job applications (${params?.total || 0} total)`,
                'common.export': 'Export',
                'common.refresh': 'Refresh',
                'common.search': 'Search',
                'admin.applications.searchPlaceholder': 'Search by job title, company, or applicant...',
                'dashboard.status.label': 'Status',
                'dashboard.admin.allStatus': 'All Status',
                'dashboard.status.pending': 'Pending',
                'dashboard.status.interviews': 'Interviews',
                'dashboard.status.accepted': 'Accepted',
                'dashboard.status.rejected': 'Rejected',
                'dashboard.status.offer-accepted': 'Offer Accepted',
                'dashboard.status.offer-rejected': 'Offer Rejected',
                'common.sortBy': 'Sort By',
                'dashboard.admin.newestFirst': 'Newest First',
                'dashboard.admin.oldestFirst': 'Oldest First',
                'dashboard.status.loading': 'Loading...',
                'admin.applications.applicant': 'Applicant',
                'admin.applications.jobPosition': 'Job Position',
                'admin.applications.appliedDate': 'Applied Date',
                'common.actions': 'Actions',
                'common.previous': 'Previous',
                'common.next': 'Next',
                'admin.applications.noApplications': 'No applications found',
                'admin.applications.adjustSearch': 'Try adjusting your search criteria',
                'admin.applications.viewCV': 'View CV',
                'admin.applications.viewDetails': 'View Details',
                'admin.applications.stats.total': 'Total',
                'admin.applications.stats.pending': 'Pending',
                'admin.applications.stats.interviews': 'In Interviews',
                'admin.applications.stats.accepted': 'Accepted',
                'admin.applications.stats.rejected': 'Rejected'
            },
            ar: {
                'admin.applications.title': 'إدارة الطلبات',
                'admin.applications.subtitle': `إدارة جميع طلبات التوظيف (${params?.total || 0} إجمالي)`,
                'common.export': 'تصدير',
                'common.refresh': 'تحديث',
                'common.search': 'بحث',
                'admin.applications.searchPlaceholder': 'البحث بعنوان الوظيفة أو الشركة أو اسم المتقدم...',
                'dashboard.status.label': 'الحالة',
                'dashboard.admin.allStatus': 'جميع الحالات',
                'dashboard.status.pending': 'قيد الانتظار',
                'dashboard.status.interviews': 'مقابلات',
                'dashboard.status.accepted': 'مقبول',
                'dashboard.status.rejected': 'مرفوض',
                'dashboard.status.offer-accepted': 'قُبل العرض',
                'dashboard.status.offer-rejected': 'رُفض العرض',
                'common.sortBy': 'ترتيب حسب',
                'dashboard.admin.newestFirst': 'الأحدث أولاً',
                'dashboard.admin.oldestFirst': 'الأقدم أولاً',
                'dashboard.status.loading': 'جاري التحميل...',
                'admin.applications.applicant': 'المتقدم',
                'admin.applications.jobPosition': 'الوظيفة',
                'admin.applications.appliedDate': 'تاريخ التقديم',
                'common.actions': 'الإجراءات',
                'common.previous': 'السابق',
                'common.next': 'التالي',
                'admin.applications.noApplications': 'لم يتم العثور على طلبات',
                'admin.applications.adjustSearch': 'جرب تعديل معايير البحث',
                'admin.applications.viewCV': 'عرض السيرة الذاتية',
                'admin.applications.viewDetails': 'عرض التفاصيل',
                'admin.applications.stats.total': 'الإجمالي',
                'admin.applications.stats.pending': 'قيد الانتظار',
                'admin.applications.stats.interviews': 'في المقابلات',
                'admin.applications.stats.accepted': 'مقبول',
                'admin.applications.stats.rejected': 'مرفوض'
            },
            fr: {
                'admin.applications.title': 'Gestion des Candidatures',
                'admin.applications.subtitle': `Gérer toutes les candidatures (${params?.total || 0} au total)`,
                'common.export': 'Exporter',
                'common.refresh': 'Actualiser',
                'common.search': 'Rechercher',
                'admin.applications.searchPlaceholder': 'Rechercher par titre de poste, entreprise ou candidat...',
                'dashboard.status.label': 'Statut',
                'dashboard.admin.allStatus': 'Tous les Statuts',
                'dashboard.status.pending': 'En attente',
                'dashboard.status.interviews': 'Entretiens',
                'dashboard.status.accepted': 'Accepté',
                'dashboard.status.rejected': 'Rejeté',
                'dashboard.status.offer-accepted': 'Offre Acceptée',
                'dashboard.status.offer-rejected': 'Offre Rejetée',
                'common.sortBy': 'Trier par',
                'dashboard.admin.newestFirst': 'Plus Récent d\'Abord',
                'dashboard.admin.oldestFirst': 'Plus Ancien d\'Abord',
                'dashboard.status.loading': 'Chargement...',
                'admin.applications.applicant': 'Candidat',
                'admin.applications.jobPosition': 'Poste',
                'admin.applications.appliedDate': 'Date de Candidature',
                'common.actions': 'Actions',
                'common.previous': 'Précédent',
                'common.next': 'Suivant',
                'admin.applications.noApplications': 'Aucune candidature trouvée',
                'admin.applications.adjustSearch': 'Essayez d\'ajuster vos critères de recherche',
                'admin.applications.viewCV': 'Voir le CV',
                'admin.applications.viewDetails': 'Voir les Détails',
                'admin.applications.stats.total': 'Total',
                'admin.applications.stats.pending': 'En Attente',
                'admin.applications.stats.interviews': 'En Entretiens',
                'admin.applications.stats.accepted': 'Accepté',
                'admin.applications.stats.rejected': 'Rejeté'
            }
        };

        return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
    };

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: applicationsPerPage.toString(),
                search: searchTerm,
                status: statusFilter,
                sortBy,
                sortOrder,
            });

            const response = await fetch(`/api/admin/applications?${params}`);
            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalApplications(data.pagination?.total || 0);
                setStats(data.stats || { total: 0, pending: 0, interviews: 0, accepted: 0, rejected: 0 });
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder, applicationsPerPage]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'interviews':
                return 'bg-blue-100 text-blue-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'offer-accepted':
                return 'bg-emerald-100 text-emerald-800';
            case 'offer-rejected':
                return 'bg-rose-100 text-rose-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-3 h-3" />;
            case 'interviews':
                return <Calendar className="w-3 h-3" />;
            case 'accepted':
            case 'offer-accepted':
                return <CheckCircle className="w-3 h-3" />;
            case 'rejected':
            case 'offer-rejected':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getApplicantName = (applicant: Application['applicant']) => {
        if (applicant.profile?.firstName || applicant.profile?.lastName) {
            return `${applicant.profile.firstName || ''} ${applicant.profile.lastName || ''}`.trim();
        }
        return applicant.email.split('@')[0];
    };

    const exportApplications = async () => {
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                status: statusFilter,
                format: 'csv',
            });

            const response = await fetch(`/api/admin/applications/export?${params}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error exporting applications:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FileText className="w-8 h-8 mr-3 text-orange-600" />
                                {getText('admin.applications.title')}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {getText('admin.applications.subtitle', { total: totalApplications })}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={exportApplications}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {getText('common.export')}
                            </button>
                            <button
                                onClick={fetchApplications}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {getText('common.refresh')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{getText('admin.applications.stats.total')}</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full">
                                <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{getText('admin.applications.stats.pending')}</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{getText('admin.applications.stats.interviews')}</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.interviews}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{getText('admin.applications.stats.accepted')}</p>
                                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{getText('admin.applications.stats.rejected')}</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{getText('common.search')}</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={getText('admin.applications.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{getText('dashboard.status.label')}</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">{getText('dashboard.admin.allStatus')}</option>
                                <option value="pending">{getText('dashboard.status.pending')}</option>
                                <option value="interviews">{getText('dashboard.status.interviews')}</option>
                                <option value="accepted">{getText('dashboard.status.accepted')}</option>
                                <option value="rejected">{getText('dashboard.status.rejected')}</option>
                                <option value="offer-accepted">{getText('dashboard.status.offer-accepted')}</option>
                                <option value="offer-rejected">{getText('dashboard.status.offer-rejected')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{getText('common.sortBy')}</label>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order as 'asc' | 'desc');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="createdAt-desc">{getText('dashboard.admin.newestFirst')}</option>
                                <option value="createdAt-asc">{getText('dashboard.admin.oldestFirst')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">{getText('dashboard.status.loading')}</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{getText('admin.applications.noApplications')}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {getText('admin.applications.adjustSearch')}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {getText('admin.applications.applicant')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {getText('admin.applications.jobPosition')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {getText('dashboard.status.label')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {getText('admin.applications.appliedDate')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {getText('common.actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {applications.map((application) => (
                                            <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {application?.applicant?.profile?.profileImage ? (
                                                                <Image
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                    src={application.applicant.profile.profileImage}
                                                                    alt={getApplicantName(application.applicant)}
                                                                    width={40}
                                                                    height={40}
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-orange-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {application.applicant ? getApplicantName(application.applicant) : 'Unknown Applicant'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {application.applicant?.email || 'No email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                                            <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                                                            {application.job?.title || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {application.job?.company?.name || 'N/A'}
                                                        </div>
                                                        {application.job?.location && (
                                                            <div className="text-xs text-gray-400 flex items-center mt-1">
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                                {application.job.location.city}, {application.job.location.country}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                        {getStatusIcon(application.status)}
                                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                        {formatDate(new Date(application.createdAt), resolvedParams.lang)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <a
                                                            href={`/api/admin/applications/${application._id}/download?view=true`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:text-orange-900 flex items-center bg-orange-50 px-3 py-1.5 rounded-md hover:bg-orange-100 transition-colors"
                                                            title={getText('admin.applications.viewCV')}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            {getText('admin.applications.viewCV')}
                                                        </a>
                                                        <a
                                                            href={`/api/admin/applications/${application._id}/download`}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                                            title="Download CV"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        {application.job?._id && (
                                                            <Link
                                                                href={`/${resolvedParams.lang}/admin/jobs/${application.job._id}/applications`}
                                                                className="text-gray-600 hover:text-gray-900 flex items-center bg-gray-50 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                                                title={getText('admin.applications.viewDetails')}
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                {getText('common.previous')}
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                {getText('common.next')}
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Showing{' '}
                                                    <span className="font-medium">{(currentPage - 1) * applicationsPerPage + 1}</span>
                                                    {' '}to{' '}
                                                    <span className="font-medium">
                                                        {Math.min(currentPage * applicationsPerPage, totalApplications)}
                                                    </span>
                                                    {' '}of{' '}
                                                    <span className="font-medium">{totalApplications}</span>
                                                    {' '}results
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Previous
                                                    </button>
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        const page = i + 1;
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => setCurrentPage(page)}
                                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                                                    ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
