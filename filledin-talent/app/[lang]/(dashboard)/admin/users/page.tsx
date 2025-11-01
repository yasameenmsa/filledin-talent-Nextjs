'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils/formatters';
import { 
  Users, 
  Search, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  UserCheck,
  Download,
  RefreshCw
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  location?: string;
  company?: string;
  position?: string;
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
  jobsPosted?: number;
  applicationsSubmitted?: number;
}

export default function AdminUsersPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = React.use(params);
  const { currentLanguage } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  // Inline translation function
  const getText = (key: string, params?: Record<string, any>) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'dashboard.admin.userManagement': 'User Management',
        'dashboard.admin.userManagementDesc': `Manage all users in the system (${params?.total || 0} total)`,
        'common.export': 'Export',
        'common.refresh': 'Refresh',
        'common.search': 'Search',
        'dashboard.admin.searchUsers': 'Search users by name or email...',
        'common.role': 'Role',
        'dashboard.admin.allRoles': 'All Roles',
        'auth.jobSeeker': 'Job Seeker',
        'auth.employer': 'Employer',
        'dashboard.admin.admins': 'Admins',
        'dashboard.status.label': 'Status',
        'dashboard.admin.allStatus': 'All Status',
        'dashboard.status.active': 'Active',
        'dashboard.status.inactive': 'Inactive',
        'dashboard.status.banned': 'Banned',
        'common.sortBy': 'Sort By',
        'dashboard.admin.newestFirst': 'Newest First',
        'dashboard.admin.oldestFirst': 'Oldest First',
        'dashboard.admin.nameAZ': 'Name A-Z',
        'dashboard.admin.nameZA': 'Name Z-A',
        'dashboard.admin.lastLogin': 'Last Login',
        'dashboard.admin.usersSelected': `${params?.count || 0} users selected`,
        'dashboard.admin.activate': 'Activate',
        'dashboard.admin.deactivate': 'Deactivate',
        'dashboard.admin.ban': 'Ban',
        'dashboard.status.loading': 'Loading...',
        'common.user': 'User',
        'dashboard.admin.activity': 'Activity',
        'dashboard.admin.joined': 'Joined',
        'common.actions': 'Actions',
        'dashboard.admin.jobs': 'Jobs',
        'dashboard.applications': 'Applications',
        'common.previous': 'Previous',
        'common.next': 'Next',
        'dashboard.admin.noUsersFound': 'No users found',
        'dashboard.admin.adjustSearchCriteria': 'Try adjusting your search criteria'
      },
      ar: {
        'dashboard.admin.userManagement': 'إدارة المستخدمين',
        'dashboard.admin.userManagementDesc': `إدارة جميع المستخدمين في النظام (${params?.total || 0} إجمالي)`,
        'common.export': 'تصدير',
        'common.refresh': 'تحديث',
        'common.search': 'بحث',
        'dashboard.admin.searchUsers': 'البحث عن المستخدمين بالاسم أو البريد الإلكتروني...',
        'common.role': 'الدور',
        'dashboard.admin.allRoles': 'جميع الأدوار',
        'auth.jobSeeker': 'باحث عن عمل',
        'auth.employer': 'صاحب عمل',
        'dashboard.admin.admins': 'المديرون',
        'dashboard.status.label': 'الحالة',
        'dashboard.admin.allStatus': 'جميع الحالات',
        'dashboard.status.active': 'نشط',
        'dashboard.status.inactive': 'غير نشط',
        'dashboard.status.banned': 'محظور',
        'common.sortBy': 'ترتيب حسب',
        'dashboard.admin.newestFirst': 'الأحدث أولاً',
        'dashboard.admin.oldestFirst': 'الأقدم أولاً',
        'dashboard.admin.nameAZ': 'الاسم أ-ي',
        'dashboard.admin.nameZA': 'الاسم ي-أ',
        'dashboard.admin.lastLogin': 'آخر تسجيل دخول',
        'dashboard.admin.usersSelected': `تم تحديد ${params?.count || 0} مستخدم`,
        'dashboard.admin.activate': 'تفعيل',
        'dashboard.admin.deactivate': 'إلغاء تفعيل',
        'dashboard.admin.ban': 'حظر',
        'dashboard.status.loading': 'جاري التحميل...',
        'common.user': 'المستخدم',
        'dashboard.admin.activity': 'النشاط',
        'dashboard.admin.joined': 'انضم',
        'common.actions': 'الإجراءات',
        'dashboard.admin.jobs': 'الوظائف',
        'dashboard.applications': 'الطلبات',
        'common.previous': 'السابق',
        'common.next': 'التالي',
        'dashboard.admin.noUsersFound': 'لم يتم العثور على مستخدمين',
        'dashboard.admin.adjustSearchCriteria': 'جرب تعديل معايير البحث'
      },
      fr: {
        'dashboard.admin.userManagement': 'Gestion des Utilisateurs',
        'dashboard.admin.userManagementDesc': `Gérer tous les utilisateurs du système (${params?.total || 0} au total)`,
        'common.export': 'Exporter',
        'common.refresh': 'Actualiser',
        'common.search': 'Rechercher',
        'dashboard.admin.searchUsers': 'Rechercher des utilisateurs par nom ou email...',
        'common.role': 'Rôle',
        'dashboard.admin.allRoles': 'Tous les Rôles',
        'auth.jobSeeker': 'Chercheur d\'Emploi',
        'auth.employer': 'Employeur',
        'dashboard.admin.admins': 'Administrateurs',
        'dashboard.status.label': 'Statut',
        'dashboard.admin.allStatus': 'Tous les Statuts',
        'dashboard.status.active': 'Actif',
        'dashboard.status.inactive': 'Inactif',
        'dashboard.status.banned': 'Banni',
        'common.sortBy': 'Trier par',
        'dashboard.admin.newestFirst': 'Plus Récent d\'Abord',
        'dashboard.admin.oldestFirst': 'Plus Ancien d\'Abord',
        'dashboard.admin.nameAZ': 'Nom A-Z',
        'dashboard.admin.nameZA': 'Nom Z-A',
        'dashboard.admin.lastLogin': 'Dernière Connexion',
        'dashboard.admin.usersSelected': `${params?.count || 0} utilisateurs sélectionnés`,
        'dashboard.admin.activate': 'Activer',
        'dashboard.admin.deactivate': 'Désactiver',
        'dashboard.admin.ban': 'Bannir',
        'dashboard.status.loading': 'Chargement...',
        'common.user': 'Utilisateur',
        'dashboard.admin.activity': 'Activité',
        'dashboard.admin.joined': 'Rejoint',
        'common.actions': 'Actions',
        'dashboard.admin.jobs': 'Emplois',
        'dashboard.applications': 'Candidatures',
        'common.previous': 'Précédent',
        'common.next': 'Suivant',
        'dashboard.admin.noUsersFound': 'Aucun utilisateur trouvé',
        'dashboard.admin.adjustSearchCriteria': 'Essayez d\'ajuster vos critères de recherche'
      }
    };

    return translations[currentLanguage]?.[key] || key;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, sortBy, sortOrder, usersPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchUsers();
        alert(`User status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action,
        }),
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUsers([]);
        alert(`Bulk action ${action} completed successfully`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const exportUsers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        format: 'csv',
      });

      const response = await fetch(`/api/admin/users/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'employer':
        return 'bg-blue-100 text-blue-800';
      case 'jobseeker':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                {getText('dashboard.admin.userManagement')}
              </h1>
              <p className="text-gray-600 mt-2">
                {getText('dashboard.admin.userManagementDesc', { total: totalUsers })}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportUsers}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {getText('common.export')}
              </button>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
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
                  placeholder={getText('dashboard.admin.searchUsers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{getText('common.role')}</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{getText('dashboard.admin.allRoles')}</option>
                <option value="jobseeker">{getText('auth.jobSeeker')}</option>
                <option value="employer">{getText('auth.employer')}</option>
                <option value="admin">{getText('dashboard.admin.admins')}</option>
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
                <option value="inactive">{getText('dashboard.status.inactive')}</option>
                <option value="banned">{getText('dashboard.status.banned')}</option>
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
                <option value="name-asc">{getText('dashboard.admin.nameAZ')}</option>
                <option value="name-desc">{getText('dashboard.admin.nameZA')}</option>
                <option value="lastLogin-desc">{getText('dashboard.admin.lastLogin')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {getText('dashboard.admin.usersSelected', { count: selectedUsers.length })}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  {getText('dashboard.admin.activate')}
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  {getText('dashboard.admin.deactivate')}
                </button>
                <button
                  onClick={() => handleBulkAction('ban')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  {getText('dashboard.admin.ban')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
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
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('common.user')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('common.role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.status.label')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.admin.activity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('dashboard.admin.joined')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getText('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profileImage ? (
                                <Image
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.profileImage}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                {user.isVerified && (
                                  <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {user.phone}
                                </div>
                              )}
                              {user.location && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {user.location}
                                </div>
                              )}
                              {user.company && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Briefcase className="w-3 h-3 mr-1" />
                                  {user.company} {user.position && `- ${user.position}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.role === 'employer' && (
                            <div>{getText('dashboard.admin.jobs')}: {user.jobsPosted || 0}</div>
                          )}
                          {user.role === 'job_seeker' && (
                            <div>{getText('dashboard.applications')}: {user.applicationsSubmitted || 0}</div>
                          )}
                          {user.lastLogin && (
                            <div className="text-xs text-gray-500">
                              {getText('dashboard.admin.lastLogin')}: {formatDate(new Date(user.lastLogin), resolvedParams.lang)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(new Date(user.createdAt), resolvedParams.lang)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {user.status === 'active' ? (
                              <button
                                onClick={() => updateUserStatus(user.id, 'inactive')}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Deactivate"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(user.id, 'active')}
                                className="text-green-600 hover:text-green-900"
                                title="Activate"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => deleteUser(user.id)}
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
                          <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * usersPerPage, totalUsers)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{totalUsers}</span>
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
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === page
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

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{getText('dashboard.admin.noUsersFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {getText('dashboard.admin.adjustSearchCriteria')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}