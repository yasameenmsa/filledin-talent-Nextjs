'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  Shield, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Key,
  Activity,
  Users,
  Database,
  Lock,
  Edit3,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { userData, updateProfile } = useAuth();
  // const resolvedParams = React.use(params);
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: userData?.profile?.firstName || '',
    lastName: userData?.profile?.lastName || '',
    phone: userData?.profile?.phone || '',
    location: userData?.profile?.location || '',
    bio: userData?.profile?.bio || '',
    position: userData?.profile?.position || 'System Administrator',
  });

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        profile: {
          ...userData.profile,
          ...formData,
        }
      });
      setMessage({ type: 'success', text: getText('dashboard.status.saved') });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: getText('dashboard.status.failed') });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: userData?.profile?.firstName || '',
      lastName: userData?.profile?.lastName || '',
      phone: userData?.profile?.phone || '',
      location: userData?.profile?.location || '',
      bio: userData?.profile?.bio || '',
      position: userData?.profile?.position || 'System Administrator',
    });
    setIsEditing(false);
    setMessage(null);
  };

  // Inline translation function
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'dashboard.status.saved': 'Profile updated successfully',
        'dashboard.status.failed': 'Failed to update profile',
        'dashboard.status.loading': 'Loading...',
        'dashboard.status.label': 'Status',
        'dashboard.status.active': 'Active',
        'profile.information': 'Profile Information',
        'profile.security': 'Security',
        'profile.systemAccess': 'System Access',
        'profile.accountCreated': 'Account Created',
        'profile.lastUpdated': 'Last Updated',
        'profile.accessLevel': 'Access Level',
        'profile.fullAdministrator': 'Full Administrator',
        'profile.administratorProfile': 'Administrator Profile',
        'profile.systemAdministrator': 'System Administrator',
        'profile.administrator': 'Administrator',
        'profile.editProfile': 'Edit Profile',
        'profile.adminRole': 'Admin Role',
        'profile.firstName': 'First Name',
        'profile.enterFirstName': 'Enter your first name',
        'profile.lastName': 'Last Name',
        'profile.enterLastName': 'Enter your last name',
        'profile.emailAddress': 'Email Address',
        'profile.emailCannotChange': 'Email address cannot be changed',
        'profile.phoneNumber': 'Phone Number',
        'profile.enterPhoneNumber': 'Enter your phone number',
        'profile.position': 'Position',
        'profile.enterPosition': 'Enter your position',
        'profile.location': 'Location',
        'profile.enterLocation': 'Enter your location',
        'profile.bio': 'Bio',
        'profile.tellAboutYourself': 'Tell us about yourself',
        'profile.passwordSecurity': 'Password Security',
        'profile.passwordChangeNote': 'For security reasons, password changes must be done through the security settings.',
        'profile.systemAccessPermissions': 'System Access & Permissions',
        'profile.administratorPrivileges': 'Administrator Privileges',
        'profile.fullAdminAccess': 'You have full administrative access to the system.',
        'profile.fullAccessUsers': 'Full access to user accounts',
        'profile.manageAllJobs': 'Manage all job postings',
        'profile.systemSettings': 'System Settings',
        'profile.configureSystem': 'Configure system parameters',
        'profile.analyticsAccess': 'Analytics Access',
        'profile.viewAllAnalytics': 'View all system analytics',
        'dashboard.admin.manageUsers': 'Manage Users',
        'dashboard.admin.manageJobs': 'Manage Jobs',
        'common.save': 'Save',
        'common.cancel': 'Cancel'
      },
      ar: {
        'dashboard.status.saved': 'تم تحديث الملف الشخصي بنجاح',
        'dashboard.status.failed': 'فشل في تحديث الملف الشخصي',
        'dashboard.status.loading': 'جاري التحميل...',
        'dashboard.status.label': 'الحالة',
        'dashboard.status.active': 'نشط',
        'profile.information': 'معلومات الملف الشخصي',
        'profile.security': 'الأمان',
        'profile.systemAccess': 'الوصول إلى النظام',
        'profile.accountCreated': 'تاريخ إنشاء الحساب',
        'profile.lastUpdated': 'آخر تحديث',
        'profile.accessLevel': 'مستوى الوصول',
        'profile.fullAdministrator': 'مدير كامل',
        'profile.administratorProfile': 'ملف المدير الشخصي',
        'profile.systemAdministrator': 'مدير النظام',
        'profile.administrator': 'مدير',
        'profile.editProfile': 'تعديل الملف الشخصي',
        'profile.adminRole': 'دور المدير',
        'profile.firstName': 'الاسم الأول',
        'profile.enterFirstName': 'أدخل اسمك الأول',
        'profile.lastName': 'اسم العائلة',
        'profile.enterLastName': 'أدخل اسم عائلتك',
        'profile.emailAddress': 'عنوان البريد الإلكتروني',
        'profile.emailCannotChange': 'لا يمكن تغيير عنوان البريد الإلكتروني',
        'profile.phoneNumber': 'رقم الهاتف',
        'profile.enterPhoneNumber': 'أدخل رقم هاتفك',
        'profile.position': 'المنصب',
        'profile.enterPosition': 'أدخل منصبك',
        'profile.location': 'الموقع',
        'profile.enterLocation': 'أدخل موقعك',
        'profile.bio': 'السيرة الذاتية',
        'profile.tellAboutYourself': 'أخبرنا عن نفسك',
        'profile.passwordSecurity': 'أمان كلمة المرور',
        'profile.passwordChangeNote': 'لأسباب أمنية، يجب تغيير كلمة المرور من خلال إعدادات الأمان.',
        'profile.systemAccessPermissions': 'الوصول إلى النظام والصلاحيات',
        'profile.administratorPrivileges': 'امتيازات المدير',
        'profile.fullAdminAccess': 'لديك وصول إداري كامل إلى النظام.',
        'profile.fullAccessUsers': 'وصول كامل إلى حسابات المستخدمين',
        'profile.manageAllJobs': 'إدارة جميع إعلانات الوظائف',
        'profile.systemSettings': 'إعدادات النظام',
        'profile.configureSystem': 'تكوين معاملات النظام',
        'profile.analyticsAccess': 'الوصول إلى التحليلات',
        'profile.viewAllAnalytics': 'عرض جميع تحليلات النظام',
        'dashboard.admin.manageUsers': 'إدارة المستخدمين',
        'dashboard.admin.manageJobs': 'إدارة الوظائف',
        'common.save': 'حفظ',
        'common.cancel': 'إلغاء'
      },
      fr: {
        'dashboard.status.saved': 'Profil mis à jour avec succès',
        'dashboard.status.failed': 'Échec de la mise à jour du profil',
        'dashboard.status.loading': 'Chargement...',
        'dashboard.status.label': 'Statut',
        'dashboard.status.active': 'Actif',
        'profile.information': 'Informations du profil',
        'profile.security': 'Sécurité',
        'profile.systemAccess': 'Accès système',
        'profile.accountCreated': 'Compte créé',
        'profile.lastUpdated': 'Dernière mise à jour',
        'profile.accessLevel': 'Niveau d\'accès',
        'profile.fullAdministrator': 'Administrateur complet',
        'profile.administratorProfile': 'Profil administrateur',
        'profile.systemAdministrator': 'Administrateur système',
        'profile.administrator': 'Administrateur',
        'profile.editProfile': 'Modifier le profil',
        'profile.adminRole': 'Rôle administrateur',
        'profile.firstName': 'Prénom',
        'profile.enterFirstName': 'Entrez votre prénom',
        'profile.lastName': 'Nom de famille',
        'profile.enterLastName': 'Entrez votre nom de famille',
        'profile.emailAddress': 'Adresse e-mail',
        'profile.emailCannotChange': 'L\'adresse e-mail ne peut pas être modifiée',
        'profile.phoneNumber': 'Numéro de téléphone',
        'profile.enterPhoneNumber': 'Entrez votre numéro de téléphone',
        'profile.position': 'Poste',
        'profile.enterPosition': 'Entrez votre poste',
        'profile.location': 'Localisation',
        'profile.enterLocation': 'Entrez votre localisation',
        'profile.bio': 'Biographie',
        'profile.tellAboutYourself': 'Parlez-nous de vous',
        'profile.passwordSecurity': 'Sécurité du mot de passe',
        'profile.passwordChangeNote': 'Pour des raisons de sécurité, les changements de mot de passe doivent être effectués via les paramètres de sécurité.',
        'profile.systemAccessPermissions': 'Accès système et permissions',
        'profile.administratorPrivileges': 'Privilèges administrateur',
        'profile.fullAdminAccess': 'Vous avez un accès administratif complet au système.',
        'profile.fullAccessUsers': 'Accès complet aux comptes utilisateurs',
        'profile.manageAllJobs': 'Gérer toutes les offres d\'emploi',
        'profile.systemSettings': 'Paramètres système',
        'profile.configureSystem': 'Configurer les paramètres système',
        'profile.analyticsAccess': 'Accès aux analyses',
        'profile.viewAllAnalytics': 'Voir toutes les analyses système',
        'dashboard.admin.manageUsers': 'Gérer les utilisateurs',
        'dashboard.admin.manageJobs': 'Gérer les emplois',
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler'
      }
    };

    return translations[currentLanguage]?.[key] || key;
  };

  const tabs = [
    {
      id: 'profile' as const,
      label: getText('profile.information'),
      icon: User,
    },
    {
      id: 'security' as const,
      label: getText('profile.security'),
      icon: Shield,
    },
    {
      id: 'system' as const,
      label: getText('profile.systemAccess'),
      icon: Database,
    },
  ];

  const adminStats = [
    { label: getText('profile.accountCreated'), value: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : getText('common.notAvailable'), icon: Calendar },
    { label: getText('profile.lastUpdated'), value: userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : getText('common.notAvailable'), icon: Activity },
    { label: getText('profile.accessLevel'), value: getText('profile.fullAdministrator'), icon: Key },
    { label: getText('dashboard.status.label'), value: getText('dashboard.status.active'), icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  {userData.profile?.profileImage ? (
                    <Image
                      src={userData.profile.profileImage}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Shield className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData.profile?.firstName && userData.profile?.lastName
                      ? `${userData.profile.firstName} ${userData.profile.lastName}`
                      : getText('profile.administratorProfile')
                    }
                  </h1>
                  <p className="text-gray-600">
                    {userData.profile?.position || getText('profile.systemAdministrator')}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      <Shield className="w-3 h-3 mr-1" />
                      {getText('profile.administrator')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {getText('profile.editProfile')}
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      size="sm"
                      className="flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? getText('dashboard.status.loading') : getText('common.save')}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {getText('common.cancel')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userData.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {userData.email}
                </div>
              )}
              {userData.profile?.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {userData.profile.phone}
                </div>
              )}
              {userData.profile?.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {userData.profile.location}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {getText('profile.adminRole')}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{getText('profile.information')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">{getText('profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    placeholder={getText('profile.enterFirstName')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">{getText('profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    placeholder={getText('profile.enterLastName')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">{getText('profile.emailAddress')}</Label>
                  <Input
                    id="email"
                    value={userData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{getText('profile.emailCannotChange')}</p>
                </div>
                
                <div>
                  <Label htmlFor="phone">{getText('profile.phoneNumber')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder={getText('profile.enterPhoneNumber')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">{getText('profile.position')}</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    placeholder={getText('profile.enterPosition')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">{getText('profile.location')}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    placeholder={getText('profile.enterLocation')}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="bio">{getText('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder={getText('profile.tellAboutYourself')}
                  rows={4}
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{getText('profile.security')}</h2>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="text-sm font-medium text-yellow-800">{getText('profile.passwordSecurity')}</h3>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    {getText('profile.passwordChangeNote')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{stat.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{getText('profile.systemAccessPermissions')}</h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="text-sm font-medium text-red-800">{getText('profile.administratorPrivileges')}</h3>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    {getText('profile.fullAdminAccess')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{getText('dashboard.admin.manageUsers')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{getText('profile.fullAccessUsers')}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{getText('dashboard.admin.manageJobs')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{getText('profile.manageAllJobs')}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{getText('profile.systemSettings')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{getText('profile.configureSystem')}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{getText('profile.analyticsAccess')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{getText('profile.viewAllAnalytics')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}