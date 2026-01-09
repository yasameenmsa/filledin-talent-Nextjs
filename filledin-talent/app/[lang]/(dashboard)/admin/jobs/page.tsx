'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Briefcase,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Users,
  Plus,
  Download,
  RefreshCw,
  Building,
  MapPin,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  category: string;
  subcategory?: string;
  sector: string;
  location: {
    city: string;
    country: string;
    region: string;
  };
  workingType: string;
  status: 'active' | 'closed' | 'draft' | 'pending' | 'rejected';
  applicationCount: number;
  viewCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
  postedBy?: {
    name: string;
    email: string;
  };
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    display: boolean;
  };
  i18n?: {
    ar?: { title?: string };
    fr?: { title?: string };
  };
  rejectionReason?: string;
}

export default function AdminJobsPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = React.use(params);
  const { currentLanguage } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 20;

  // Inline translation function
  const getText = (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'dashboard.admin.jobManagement': 'Job Management',
        'dashboard.admin.jobManagementDesc': `Manage all jobs in the system (${params?.total || 0} total)`,
        'common.export': 'Export',
        'common.refresh': 'Refresh',
        'common.search': 'Search',
        'dashboard.admin.searchJobs': 'Search jobs by title, company, or description...',
        'common.category': 'Category',
        'dashboard.admin.allCategories': 'All Categories',
        'dashboard.status.label': 'Status',
        'dashboard.admin.allStatus': 'All Status',
        'dashboard.status.active': 'Active',
        'dashboard.status.closed': 'Closed',
        'dashboard.status.draft': 'Draft',
        'dashboard.status.pending': 'Pending',
        'dashboard.status.rejected': 'Rejected',
        'common.sortBy': 'Sort By',
        'dashboard.admin.newestFirst': 'Newest First',
        'dashboard.admin.oldestFirst': 'Oldest First',
        'dashboard.admin.titleAZ': 'Title A-Z',
        'dashboard.admin.titleZA': 'Title Z-A',
        'dashboard.admin.companyAZ': 'Company A-Z',
        'dashboard.admin.jobsSelected': `${params?.count || 0} jobs selected`,
        'dashboard.admin.approve': 'Approve',
        'dashboard.admin.reject': 'Reject',
        'dashboard.admin.close': 'Close',
        'dashboard.admin.activate': 'Activate',
        'dashboard.admin.deactivate': 'Deactivate',
        'dashboard.status.loading': 'Loading...',
        'dashboard.admin.jobTitle': 'Job Title',
        'dashboard.admin.company': 'Company',
        'dashboard.admin.location': 'Location',
        'dashboard.admin.postedDate': 'Posted Date',
        'dashboard.admin.views': 'Views',
        'dashboard.admin.applications': 'Applications',
        'common.actions': 'Actions',
        'common.previous': 'Previous',
        'common.next': 'Next',
        'dashboard.admin.noJobsFound': 'No jobs found',
        'dashboard.admin.adjustSearchCriteria': 'Try adjusting your search criteria',
        'dashboard.admin.viewJob': 'View Job',
        'dashboard.admin.viewApplications': 'View Applications',
        'dashboard.admin.confirmApprove': 'Are you sure you want to approve this job?',
        'dashboard.admin.confirmReject': 'Are you sure you want to reject this job?',
        'dashboard.admin.confirmClose': 'Are you sure you want to close this job?',
        'dashboard.admin.confirmDelete': 'Are you sure you want to delete this job? This action cannot be undone.',
        'dashboard.admin.bulkApprove': 'Are you sure you want to approve {count} job(s)?',
        'dashboard.admin.bulkReject': 'Are you sure you want to reject {count} job(s)?',
        'dashboard.admin.bulkClose': 'Are you sure you want to close {count} job(s)?',
        'dashboard.admin.bulkDelete': 'Are you sure you want to delete {count} job(s)? This action cannot be undone.',
        'dashboard.admin.postNewJob': 'Post New Job',
        'dashboard.admin.featured': 'Featured',
        'dashboard.admin.urgent': 'Urgent',
        'dashboard.admin.rejectionReason': 'Rejection Reason',
        'dashboard.admin.salary': 'Salary',
        'dashboard.admin.workingType': 'Working Type',
        'dashboard.admin.sector': 'Sector',
        'common.technical': 'Technical',
        'common.hse': 'HSE',
        'common.corporate': 'Corporate',
        'common.executive': 'Executive',
        'common.operations': 'Operations',
        'common.oilGas': 'Oil & Gas',
        'common.renewable': 'Renewable',
        'common.both': 'Both',
        'common.fullTime': 'Full-time',
        'common.partTime': 'Part-time',
        'common.contract': 'Contract',
        'common.remote': 'Remote',
        'common.hybrid': 'Hybrid',
      },
      ar: {
        'dashboard.admin.jobManagement': 'إدارة الوظائف',
        'dashboard.admin.jobManagementDesc': `إدارة جميع الوظائف في النظام (${params?.total || 0} إجمالي)`,
        'common.export': 'تصدير',
        'common.refresh': 'تحديث',
        'common.search': 'بحث',
        'dashboard.admin.searchJobs': 'البحث عن الوظائف بالعنوان أو الشركة أو الوصف...',
        'common.category': 'الفئة',
        'dashboard.admin.allCategories': 'جميع الفئات',
        'dashboard.status.label': 'الحالة',
        'dashboard.admin.allStatus': 'جميع الحالات',
        'dashboard.status.active': 'نشط',
        'dashboard.status.closed': 'مغلق',
        'dashboard.status.draft': 'مسودة',
        'dashboard.status.pending': 'معلق',
        'dashboard.status.rejected': 'مرفوض',
        'common.sortBy': 'ترتيب حسب',
        'dashboard.admin.newestFirst': 'الأحدث أولاً',
        'dashboard.admin.oldestFirst': 'الأقدم أولاً',
        'dashboard.admin.titleAZ': 'العنوان أ-ي',
        'dashboard.admin.titleZA': 'العنوان ي-أ',
        'dashboard.admin.companyAZ': 'الشركة أ-ي',
        'dashboard.admin.jobsSelected': `تم تحديد ${params?.count || 0} وظيفة`,
        'dashboard.admin.approve': 'موافقة',
        'dashboard.admin.reject': 'رفض',
        'dashboard.admin.close': 'إغلاق',
        'dashboard.admin.activate': 'تفعيل',
        'dashboard.admin.deactivate': 'إلغاء تفعيل',
        'dashboard.status.loading': 'جاري التحميل...',
        'dashboard.admin.jobTitle': 'عنوان الوظيفة',
        'dashboard.admin.company': 'الشركة',
        'dashboard.admin.location': 'الموقع',
        'dashboard.admin.postedDate': 'تاريخ النشر',
        'dashboard.admin.views': 'المشاهدات',
        'dashboard.admin.applications': 'الطلبات',
        'common.actions': 'الإجراءات',
        'common.previous': 'السابق',
        'common.next': 'التالي',
        'dashboard.admin.noJobsFound': 'لم يتم العثور على وظائف',
        'dashboard.admin.adjustSearchCriteria': 'جرب تعديل معايير البحث',
        'dashboard.admin.viewJob': 'عرض الوظيفة',
        'dashboard.admin.viewApplications': 'عرض الطلبات',
        'dashboard.admin.confirmApprove': 'هل أنت متأكد من أنك تريد الموافقة على هذه الوظيفة؟',
        'dashboard.admin.confirmReject': 'هل أنت متأكد من أنك تريد رفض هذه الوظيفة؟',
        'dashboard.admin.confirmClose': 'هل أنت متأكد من أنك تريد إغلاق هذه الوظيفة؟',
        'dashboard.admin.confirmDelete': 'هل أنت متأكد من أنك تريد حذف هذه الوظيفة؟ هذا الإجراء لا يمكن التراجع عنه.',
        'dashboard.admin.bulkApprove': 'هل أنت متأكد من أنك تريد الموافقة على {count} وظيفة؟',
        'dashboard.admin.bulkReject': 'هل أنت متأكد من أنك تريد رفض {count} وظيفة؟',
        'dashboard.admin.bulkClose': 'هل أنت متأكد من أنك تريد إغلاق {count} وظيفة؟',
        'dashboard.admin.bulkDelete': 'هل أنت متأكد من أنك تريد حذف {count} وظيفة؟ هذا الإجراء لا يمكن التراجع عنه.',
        'dashboard.admin.postNewJob': 'نشر وظيفة جديدة',
        'dashboard.admin.featured': 'مميز',
        'dashboard.admin.urgent': 'عاجل',
        'dashboard.admin.rejectionReason': 'سبب الرفض',
        'dashboard.admin.salary': 'الراتب',
        'dashboard.admin.workingType': 'نوع العمل',
        'dashboard.admin.sector': 'القطاع',
        'common.technical': 'تقني',
        'common.hse': 'السلامة والبيئة',
        'common.corporate': 'إداري',
        'common.executive': 'تنفيذي',
        'common.operations': 'عمليات',
        'common.oilGas': 'النفط والغاز',
        'common.renewable': 'الطاقة المتجددة',
        'common.both': 'كلاهما',
        'common.fullTime': 'دوام كامل',
        'common.partTime': 'دوام جزئي',
        'common.contract': 'عقد',
        'common.remote': 'عن بعد',
        'common.hybrid': 'هجين',
      },
      fr: {
        'dashboard.admin.jobManagement': 'Gestion des Emplois',
        'dashboard.admin.jobManagementDesc': `Gérer tous les emplois du système (${params?.total || 0} au total)`,
        'common.export': 'Exporter',
        'common.refresh': 'Actualiser',
        'common.search': 'Rechercher',
        'dashboard.admin.searchJobs': 'Rechercher des emplois par titre, entreprise ou description...',
        'common.category': 'Catégorie',
        'dashboard.admin.allCategories': 'Toutes les Catégories',
        'dashboard.status.label': 'Statut',
        'dashboard.admin.allStatus': 'Tous les Statuts',
        'dashboard.status.active': 'Actif',
        'dashboard.status.closed': 'Fermé',
        'dashboard.status.draft': 'Brouillon',
        'dashboard.status.pending': 'En attente',
        'dashboard.status.rejected': 'Rejeté',
        'common.sortBy': 'Trier par',
        'dashboard.admin.newestFirst': 'Plus Récent d\'Abord',
        'dashboard.admin.oldestFirst': 'Plus Ancien d\'Abord',
        'dashboard.admin.titleAZ': 'Titre A-Z',
        'dashboard.admin.titleZA': 'Titre Z-A',
        'dashboard.admin.companyAZ': 'Entreprise A-Z',
        'dashboard.admin.jobsSelected': `${params?.count || 0} emplois sélectionnés`,
        'dashboard.admin.approve': 'Approuver',
        'dashboard.admin.reject': 'Rejeter',
        'dashboard.admin.close': 'Fermer',
        'dashboard.admin.activate': 'Activer',
        'dashboard.admin.deactivate': 'Désactiver',
        'dashboard.status.loading': 'Chargement...',
        'dashboard.admin.jobTitle': 'Titre du Poste',
        'dashboard.admin.company': 'Entreprise',
        'dashboard.admin.location': 'Emplacement',
        'dashboard.admin.postedDate': 'Date de Publication',
        'dashboard.admin.views': 'Vues',
        'dashboard.admin.applications': 'Candidatures',
        'common.actions': 'Actions',
        'common.previous': 'Précédent',
        'common.next': 'Suivant',
        'dashboard.admin.noJobsFound': 'Aucun emploi trouvé',
        'dashboard.admin.adjustSearchCriteria': 'Essayez d\'ajuster vos critères de recherche',
        'dashboard.admin.viewJob': 'Voir l\'Emploi',
        'dashboard.admin.viewApplications': 'Voir les Candidatures',
        'dashboard.admin.confirmApprove': 'Êtes-vous sûr de vouloir approuver cet emploi ?',
        'dashboard.admin.confirmReject': 'Êtes-vous sûr de vouloir rejeter cet emploi ?',
        'dashboard.admin.confirmClose': 'Êtes-vous sûr de vouloir fermer cet emploi ?',
        'dashboard.admin.confirmDelete': 'Êtes-vous sûr de vouloir supprimer cet emploi ? Cette action ne peut pas être annulée.',
        'dashboard.admin.bulkApprove': 'Êtes-vous sûr de vouloir approuver {count} emploi(s) ?',
        'dashboard.admin.bulkReject': 'Êtes-vous sûr de vouloir rejeter {count} emploi(s) ?',
        'dashboard.admin.bulkClose': 'Êtes-vous sûr de vouloir fermer {count} emploi(s) ?',
        'dashboard.admin.bulkDelete': 'Êtes-vous sûr de vouloir supprimer {count} emploi(s) ? Cette action ne peut pas être annulée.',
        'dashboard.admin.postNewJob': 'Publier un Nouvel Emploi',
        'dashboard.admin.featured': 'En vedette',
        'dashboard.admin.urgent': 'Urgent',
        'dashboard.admin.rejectionReason': 'Raison du rejet',
        'dashboard.admin.salary': 'Salaire',
        'dashboard.admin.workingType': 'Type de travail',
        'dashboard.admin.sector': 'Secteur',
        'common.technical': 'Technique',
        'common.hse': 'HSE',
        'common.corporate': 'Corporate',
        'common.executive': 'Exécutif',
        'common.operations': 'Opérations',
        'common.oilGas': 'Pétrole et Gaz',
        'common.renewable': 'Renouvelable',
        'common.both': 'Les deux',
        'common.fullTime': 'Temps plein',
        'common.partTime': 'Temps partiel',
        'common.contract': 'Contrat',
        'common.remote': 'À distance',
        'common.hybrid': 'Hybride',
      }
    };

    return translations[currentLanguage]?.[key] || key;
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: jobsPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/jobs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 1);
        setTotalJobs(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder, jobsPerPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateJobStatus = async (jobId: string, status: string, reason?: string) => {
    const confirmMessage = status === 'active' ? getText('dashboard.admin.confirmApprove') :
      status === 'rejected' ? getText('dashboard.admin.confirmReject') :
        status === 'closed' ? getText('dashboard.admin.confirmClose') : '';

    if (confirmMessage && !confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reason }),
      });

      if (response.ok) {
        fetchJobs();
        alert(`Job status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm(getText('dashboard.admin.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchJobs();
        alert('Job deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) {
      alert('Please select jobs first');
      return;
    }

    const confirmMessage = action === 'approve' ? getText('dashboard.admin.bulkApprove', { count: selectedJobs.length }) :
      action === 'reject' ? getText('dashboard.admin.bulkReject', { count: selectedJobs.length }) :
        action === 'close' ? getText('dashboard.admin.bulkClose', { count: selectedJobs.length }) :
          getText('dashboard.admin.bulkDelete', { count: selectedJobs.length });

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/jobs/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobIds: selectedJobs,
          action,
        }),
      });

      if (response.ok) {
        fetchJobs();
        setSelectedJobs([]);
        alert(`Bulk action ${action} completed successfully`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const exportJobs = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        format: 'csv',
      });

      const response = await fetch(`/api/admin/jobs/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jobs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting jobs:', error);
      alert('Failed to export jobs');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'hse':
        return 'bg-orange-100 text-orange-800';
      case 'corporate':
        return 'bg-purple-100 text-purple-800';
      case 'executive':
        return 'bg-red-100 text-red-800';
      case 'operations':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (salary?: Job['salary']) => {
    if (!salary || !salary.display) return '';
    const min = salary.min ? `${salary.min.toLocaleString()} ` : '';
    const max = salary.max ? `${salary.max.toLocaleString()} ` : '';
    const range = min && max ? `${min}- ${max}` : min || max;
    return range ? `${range}${salary.currency}` : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-8 h-8 mr-3 text-blue-600" />
                {getText('dashboard.admin.jobManagement')}
              </h1>
              <p className="text-gray-600 mt-2">
                {getText('dashboard.admin.jobManagementDesc', { total: totalJobs })}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href={`/${resolvedParams.lang}/admin/jobs/new`}>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  {getText('dashboard.admin.postNewJob')}
                </button>
              </Link>
              <button
                onClick={exportJobs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {getText('common.export')}
              </button>
              <button
                onClick={fetchJobs}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {getText('common.refresh')}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{getText('common.search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getText('dashboard.admin.searchJobs')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{getText('common.category')}</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{getText('dashboard.admin.allCategories')}</option>
                <option value="technical">{getText('common.technical')}</option>
                <option value="hse">{getText('common.hse')}</option>
                <option value="corporate">{getText('common.corporate')}</option>
                <option value="executive">{getText('common.executive')}</option>
                <option value="operations">{getText('common.operations')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{getText('dashboard.status.label')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{getText('dashboard.admin.allStatus')}</option>
                <option value="active">{getText('dashboard.status.active')}</option>
                <option value="pending">{getText('dashboard.status.pending')}</option>
                <option value="draft">{getText('dashboard.status.draft')}</option>
                <option value="closed">{getText('dashboard.status.closed')}</option>
                <option value="rejected">{getText('dashboard.status.rejected')}</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">{getText('dashboard.admin.newestFirst')}</option>
                <option value="createdAt-asc">{getText('dashboard.admin.oldestFirst')}</option>
                <option value="title-asc">{getText('dashboard.admin.titleAZ')}</option>
                <option value="title-desc">{getText('dashboard.admin.titleZA')}</option>
                <option value="company.name-asc">{getText('dashboard.admin.companyAZ')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {getText('dashboard.admin.jobsSelected', { count: selectedJobs.length })}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {getText('dashboard.admin.approve')}
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {getText('dashboard.admin.reject')}
                </button>
                <button
                  onClick={() => handleBulkAction('close')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 flex items-center"
                >
                  <Ban className="w-4 h-4 mr-1" />
                  {getText('dashboard.admin.close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{getText('dashboard.status.loading')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.admin.jobTitle')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.admin.company')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.admin.location')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.status.label')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.admin.views')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.admin.applications')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(job.id)}
                            onChange={(e) => handleSelectJob(job.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {job.company?.logo ? (
                                <Image
                                  className="h-10 w-10 rounded object-cover"
                                  src={job.company.logo}
                                  alt={job.company.name || 'Company Logo'}
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-300 flex items-center justify-center">
                                  <Building className="w-5 h-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                {job.i18n?.ar?.title && (
                                  <span className="text-xs text-gray-400 ml-2">(AR)</span>
                                )}
                                {job.featured && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {getText('dashboard.admin.featured')}
                                  </span>
                                )}
                                {job.urgent && (
                                  <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(job.category)}`}>
                                  {getText(`common.${job.category}`)}
                                </span>
                                {job.workingType && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                      {getText(`common.${job.workingType.replace('-', '')}`)}
                                    </span>
                                  </>
                                )}
                              </div>
                              {formatSalary(job.salary) && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {formatSalary(job.salary)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{job.company?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{job.postedBy?.name || job.postedBy?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location.city}, {job.location.country}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {getText(`dashboard.status.${job.status}`)}
                          </span>
                          {job.rejectionReason && (
                            <div className="text-xs text-red-600 mt-1">
                              {getText('dashboard.admin.rejectionReason')}: {job.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1 text-gray-400" />
                            {job.viewCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            {job.applicationCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link href={`/${resolvedParams.lang}/jobs/${job.id}`}>
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title={getText('dashboard.admin.viewJob')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link href={`/${resolvedParams.lang}/admin/jobs/${job.id}/applications`}>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title={getText('dashboard.admin.viewApplications')}
                              >
                                <Users className="w-4 h-4" />
                              </button>
                            </Link>
                            {job.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateJobStatus(job.id, 'active')}
                                  className="text-green-600 hover:text-green-900"
                                  title={getText('dashboard.admin.approve')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateJobStatus(job.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                  title={getText('dashboard.admin.reject')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {job.status === 'active' && (
                              <button
                                onClick={() => updateJobStatus(job.id, 'closed')}
                                className="text-gray-600 hover:text-gray-900"
                                title={getText('dashboard.admin.close')}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                          <span className="font-medium">{(currentPage - 1) * jobsPerPage + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * jobsPerPage, totalJobs)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{totalJobs}</span>
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
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{getText('dashboard.admin.noJobsFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {getText('dashboard.admin.adjustSearchCriteria')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
