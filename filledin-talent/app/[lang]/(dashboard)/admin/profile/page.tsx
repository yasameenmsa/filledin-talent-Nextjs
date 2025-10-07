'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';
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
  const { userData, user, updateProfile } = useAuth();
  const resolvedParams = React.use(params);
  const { t } = useTranslation(resolvedParams.lang);
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
      setMessage({ type: 'success', text: t('dashboard.status.saved') });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: t('dashboard.status.failed') });
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

  const tabs = [
    {
      id: 'profile' as const,
      label: t('profile.information'),
      icon: User,
    },
    {
      id: 'security' as const,
      label: t('profile.security'),
      icon: Shield,
    },
    {
      id: 'system' as const,
      label: t('profile.systemAccess'),
      icon: Database,
    },
  ];

  const adminStats = [
    { label: t('profile.accountCreated'), value: new Date(userData.createdAt).toLocaleDateString(), icon: Calendar },
    { label: t('profile.lastUpdated'), value: new Date(userData.updatedAt).toLocaleDateString(), icon: Activity },
    { label: t('profile.accessLevel'), value: t('profile.fullAdministrator'), icon: Key },
    { label: t('dashboard.status.label'), value: t('dashboard.status.active'), icon: CheckCircle },
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
                    <img
                      src={userData.profile.profileImage}
                      alt="Profile"
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
                      : t('profile.administratorProfile')
                    }
                  </h1>
                  <p className="text-gray-600">
                    {userData.profile?.position || t('profile.systemAdministrator')}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      <Shield className="w-3 h-3 mr-1" />
                      {t('profile.administrator')}
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
                    {t('profile.editProfile')}
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
                      {loading ? t('dashboard.status.loading') : t('common.save')}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('common.cancel')}
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
                {t('profile.adminRole')}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.information')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    placeholder={t('profile.enterFirstName')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    placeholder={t('profile.enterLastName')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">{t('profile.emailAddress')}</Label>
                  <Input
                    id="email"
                    value={userData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('profile.emailCannotChange')}</p>
                </div>
                
                <div>
                  <Label htmlFor="phone">{t('profile.phoneNumber')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder={t('profile.enterPhoneNumber')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">{t('profile.position')}</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    placeholder={t('profile.enterPosition')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">{t('profile.location')}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    placeholder={t('profile.enterLocation')}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="bio">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('profile.tellAboutYourself')}
                  rows={4}
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.security')}</h2>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="text-sm font-medium text-yellow-800">{t('profile.passwordSecurity')}</h3>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('profile.passwordChangeNote')}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.systemAccessPermissions')}</h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="text-sm font-medium text-red-800">{t('profile.administratorPrivileges')}</h3>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    {t('profile.fullAdminAccess')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{t('dashboard.admin.manageUsers')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{t('profile.fullAccessUsers')}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{t('dashboard.admin.manageJobs')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{t('profile.manageAllJobs')}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{t('profile.systemSettings')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{t('profile.configureSystem')}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{t('profile.analyticsAccess')}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{t('profile.viewAllAnalytics')}</p>
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