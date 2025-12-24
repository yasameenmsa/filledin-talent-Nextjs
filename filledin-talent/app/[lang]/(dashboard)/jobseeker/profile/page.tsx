'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProfileForm from '@/components/forms/ProfileForm';
import CVUpload from '@/components/features/CVUpload';
import { 
  User, 
  FileText, 
  Settings, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe
} from 'lucide-react';

export default function JobseekerProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { userData } = useAuth();
  // const resolvedParams = React.use(params);
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'cv'>('profile');

  // Inline translation function
  const getText = (key: string, params?: Record<string, string | number>): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'profile.profileInformation': 'Profile Information',
        'profile.cvResume': 'CV & Resume',
        'profile.completeYourProfile': 'Complete Your Profile',
        'profile.jobSeeker': 'Job Seeker',
        'profile.at': 'at',
        'profile.experience': 'Experience',
        'profile.skills': 'Skills',
        'profile.profileCompletion': 'Profile Completion',
        'profile.completeProfile': 'Complete your profile to increase your chances of getting hired',
        'profile.personalInformation': 'Personal Information',
        'profile.professionalInformation': 'Professional Information',
        'profile.uploadCV': 'Upload CV',
        'profile.uploadCVDesc': 'Upload your CV to let employers know more about you',
        'profile.currentCV': 'Current CV',
        'profile.uploadNew': 'Upload New CV',
        'profile.downloadCV': 'Download CV',
        'profile.deleteCV': 'Delete CV',
        'profile.noCV': 'No CV uploaded yet',
        'profile.uploadFirst': 'Upload your first CV to get started',
        'profile.cvUploaded': 'CV uploaded successfully',
        'profile.cvDeleted': 'CV deleted successfully',
        'profile.cvError': 'Error managing CV',
        'profile.profileUpdated': 'Profile updated successfully',
        'profile.profileError': 'Error updating profile',
        'profile.website': 'Website',
        'profile.cvResumeManagement': 'CV & Resume Management',
        'profile.uploadManageCv': 'Upload and manage your CV to showcase your skills and experience',
        'profile.cvTips': 'CV Tips',
        'profile.cvTip1': 'Keep your CV concise and relevant',
        'profile.cvTip2': 'Highlight your key achievements',
        'profile.cvTip3': 'Use action verbs and quantify results',
        'profile.cvTip4': 'Tailor your CV for each application',
        'profile.cvTip5': 'Proofread for spelling and grammar',
        'profile.skillsOverview': 'Skills Overview',
        'profile.recentExperience': 'Recent Experience'
      },
      ar: {
        'profile.profileInformation': 'معلومات الملف الشخصي',
        'profile.cvResume': 'السيرة الذاتية',
        'profile.completeYourProfile': 'أكمل ملفك الشخصي',
        'profile.jobSeeker': 'باحث عن عمل',
        'profile.at': 'في',
        'profile.experience': 'الخبرة',
        'profile.skills': 'المهارات',
        'profile.profileCompletion': 'إكمال الملف الشخصي',
        'profile.completeProfile': 'أكمل ملفك الشخصي لزيادة فرصك في الحصول على وظيفة',
        'profile.personalInformation': 'المعلومات الشخصية',
        'profile.professionalInformation': 'المعلومات المهنية',
        'profile.uploadCV': 'رفع السيرة الذاتية',
        'profile.uploadCVDesc': 'ارفع سيرتك الذاتية لتعريف أصحاب العمل بك أكثر',
        'profile.currentCV': 'السيرة الذاتية الحالية',
        'profile.uploadNew': 'رفع سيرة ذاتية جديدة',
        'profile.downloadCV': 'تحميل السيرة الذاتية',
        'profile.deleteCV': 'حذف السيرة الذاتية',
        'profile.noCV': 'لم يتم رفع سيرة ذاتية بعد',
        'profile.uploadFirst': 'ارفع سيرتك الذاتية الأولى للبدء',
        'profile.cvUploaded': 'تم رفع السيرة الذاتية بنجاح',
        'profile.cvDeleted': 'تم حذف السيرة الذاتية بنجاح',
        'profile.cvError': 'خطأ في إدارة السيرة الذاتية',
        'profile.profileUpdated': 'تم تحديث الملف الشخصي بنجاح',
        'profile.profileError': 'خطأ في تحديث الملف الشخصي',
        'profile.website': 'الموقع الإلكتروني',
        'profile.cvResumeManagement': 'إدارة السيرة الذاتية',
        'profile.uploadManageCv': 'ارفع وأدر سيرتك الذاتية لإظهار مهاراتك وخبراتك',
        'profile.cvTips': 'نصائح للسيرة الذاتية',
        'profile.cvTip1': 'اجعل سيرتك الذاتية مختصرة وذات صلة',
        'profile.cvTip2': 'أبرز إنجازاتك الرئيسية',
        'profile.cvTip3': 'استخدم أفعال العمل وقم بقياس النتائج',
        'profile.cvTip4': 'خصص سيرتك الذاتية لكل طلب',
        'profile.cvTip5': 'راجع الإملاء والقواعد النحوية',
        'profile.skillsOverview': 'نظرة عامة على المهارات',
        'profile.recentExperience': 'الخبرة الحديثة'
      },
      fr: {
        'profile.profileInformation': 'Informations du profil',
        'profile.cvResume': 'CV et CV',
        'profile.completeYourProfile': 'Complétez votre profil',
        'profile.jobSeeker': 'Demandeur d\'emploi',
        'profile.at': 'chez',
        'profile.experience': 'Expérience',
        'profile.skills': 'Compétences',
        'profile.profileCompletion': 'Achèvement du profil',
        'profile.completeProfile': 'Complétez votre profil pour augmenter vos chances d\'être embauché',
        'profile.personalInformation': 'Informations personnelles',
        'profile.professionalInformation': 'Informations professionnelles',
        'profile.uploadCV': 'Télécharger CV',
        'profile.uploadCVDesc': 'Téléchargez votre CV pour que les employeurs en sachent plus sur vous',
        'profile.currentCV': 'CV actuel',
        'profile.uploadNew': 'Télécharger un nouveau CV',
        'profile.downloadCV': 'Télécharger le CV',
        'profile.deleteCV': 'Supprimer le CV',
        'profile.noCV': 'Aucun CV téléchargé encore',
        'profile.uploadFirst': 'Téléchargez votre premier CV pour commencer',
        'profile.cvUploaded': 'CV téléchargé avec succès',
        'profile.cvDeleted': 'CV supprimé avec succès',
        'profile.cvError': 'Erreur de gestion du CV',
        'profile.profileUpdated': 'Profil mis à jour avec succès',
        'profile.profileError': 'Erreur de mise à jour du profil',
        'profile.website': 'Site web',
        'profile.cvResumeManagement': 'Gestion CV et CV',
        'profile.uploadManageCv': 'Téléchargez et gérez votre CV pour mettre en valeur vos compétences et votre expérience',
        'profile.cvTips': 'Conseils CV',
        'profile.cvTip1': 'Gardez votre CV concis et pertinent',
        'profile.cvTip2': 'Mettez en évidence vos principales réalisations',
        'profile.cvTip3': 'Utilisez des verbes d\'action et quantifiez les résultats',
        'profile.cvTip4': 'Adaptez votre CV pour chaque candidature',
        'profile.cvTip5': 'Relisez pour l\'orthographe et la grammaire',
        'profile.skillsOverview': 'Aperçu des compétences',
        'profile.recentExperience': 'Expérience récente'
      }
    };

    let text = translations[currentLanguage]?.[key] || translations['en'][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{{${paramKey}}}`, String(value));
      });
    }
    
    return text;
  };

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
      label: getText('profile.profileInformation'),
      icon: User,
    },
    {
      id: 'cv' as const,
      label: getText('profile.cvResume'),
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
                    <Image
                      src={userData.profile.profileImage}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <User className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData.profile?.firstName && userData.profile?.lastName
                      ? `${userData.profile.firstName} ${userData.profile.lastName}`
                      : getText('profile.completeYourProfile')
                    }
                  </h1>
                  <p className="text-gray-600">
                    {userData.profile?.position || getText('profile.jobSeeker')}
                    {userData.profile?.company && ` ${getText('profile.at')} ${userData.profile.company}`}
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
                    {getText('profile.website')}
                  </a>
                </div>
              )}
            </div>

            {/* Profile Completion */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{getText('profile.profileCompletion')}</span>
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
                  {getText('profile.cvResumeManagement')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {getText('profile.uploadManageCv')}
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
                    {getText('profile.cvTips')}
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {getText('profile.cvTip1')}</li>
                    <li>• {getText('profile.cvTip2')}</li>
                    <li>• {getText('profile.cvTip3')}</li>
                    <li>• {getText('profile.cvTip4')}</li>
                    <li>• {getText('profile.cvTip5')}</li>
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
              {getText('profile.skillsOverview')}
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
              {getText('profile.recentExperience')}
            </h3>
            <div className="space-y-4">
              {userData.profile.experience.slice(0, 3).map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-medium text-gray-900">{exp.position}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'}
                  </p>
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
function calculateProfileCompletion(userData: { email: string; profile?: { firstName?: string; lastName?: string; phone?: string; position?: string; company?: string; location?: string; bio?: string; website?: string; skills?: string[]; experience?: Array<{ company: string; position: string; startDate: string; endDate?: string; description?: string; }>; cvUrl?: string; profileImage?: string; } }): number {
  const fields = [
    userData.profile?.firstName,
    userData.profile?.lastName,
    userData.email,
    userData.profile?.phone,
    userData.profile?.location,
    userData.profile?.bio,
    userData.profile?.skills && userData.profile.skills.length > 0,
    userData.profile?.experience && userData.profile.experience.length > 0,
    userData.profile?.cvUrl,
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}