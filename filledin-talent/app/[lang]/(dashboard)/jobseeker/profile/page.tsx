'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n/client';
import { ProfileForm } from '@/components/profile/profile-form';
import { CVUpload } from '@/components/profile/cv-upload';
import { 
  User, 
  FileText, 
  Settings, 
  Download,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  Globe
} from 'lucide-react';

export default function JobseekerProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { userData, user } = useAuth();
  const resolvedParams = React.use(params);
  const { t } = useTranslation(resolvedParams.lang);
  const [activeTab, setActiveTab] = useState<'profile' | 'cv'>('profile');

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'profile' as const,
      label: t('profile.profileInformation'),
      icon: User,
    },
    {
      id: 'cv' as const,
      label: t('profile.cvResume'),
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {userData.profile?.profileImage ? (
                    <img
                      src={userData.profile.profileImage}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData.profile?.firstName && userData.profile?.lastName
                      ? `${userData.profile.firstName} ${userData.profile.lastName}`
                      : t('profile.completeYourProfile')
                    }
                  </h1>
                  <p className="text-gray-600">
                    {userData.profile?.position || t('profile.jobSeeker')}
                    {userData.profile?.company && ` ${t('profile.at')} ${userData.profile.company}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Settings className="w-5 h-5 text-gray-400" />
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
              {userData.profile?.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <a
                    href={userData.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {t('profile.website')}
                  </a>
                </div>
              )}
            </div>

            {/* Profile Completion */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('profile.profileCompletion')}</span>
                <span className="font-medium text-gray-900">
                  {calculateProfileCompletion(userData)}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProfileCompletion(userData)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

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
                    className={`
                      flex items-center py-2 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
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
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <div>
              <ProfileForm
                onSuccess={() => {
                  // Profile updated successfully
                }}
              />
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {t('profile.cvResumeManagement')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {t('profile.uploadManageCv')}
                </p>
              </div>

              <div className="p-6">
                <CVUpload
                  onUploadSuccess={(cvUrl) => {
                    console.log('CV uploaded successfully:', cvUrl);
                  }}
                  onUploadError={(error) => {
                    console.error('CV upload error:', error);
                  }}
                />

                {/* CV Tips */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    {t('profile.cvTips')}
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {t('profile.cvTip1')}</li>
                    <li>• {t('profile.cvTip2')}</li>
                    <li>• {t('profile.cvTip3')}</li>
                    <li>• {t('profile.cvTip4')}</li>
                    <li>• {t('profile.cvTip5')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills and Experience Summary */}
        {userData.profile?.skills && userData.profile.skills.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profile.skillsOverview')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {userData.profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Experience */}
        {userData.profile?.experience && userData.profile.experience.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              {t('profile.recentExperience')}
            </h3>
            <div className="space-y-4">
              {userData.profile.experience.slice(0, 3).map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-medium text-gray-900">{exp.position}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.duration}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(userData: any): number {
  const fields = [
    userData.profile?.firstName,
    userData.profile?.lastName,
    userData.email,
    userData.profile?.phone,
    userData.profile?.location,
    userData.profile?.bio,
    userData.profile?.skills?.length > 0,
    userData.profile?.experience?.length > 0,
    userData.profile?.cvUrl,
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}