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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Sparkles,
  Award,
  GraduationCap,
  Edit3,
  X,
  Calendar,
  Building2,
  BookOpen
} from 'lucide-react';

export default function JobseekerProfilePage() {
  const { userData: sessionData } = useAuth();
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'cv'>('profile');
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch full profile data
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setFullProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Use fullProfile if available, otherwise fall back to sessionData (which might be incomplete)
  const displayData = fullProfile || sessionData;

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
        'profile.recentExperience': 'Recent Experience',
        'profile.present': 'Present',
        'profile.editProfile': 'Edit Profile',
        'profile.cancelEdit': 'Cancel',
        'profile.aboutMe': 'About Me',
        'profile.contactInfo': 'Contact Information',
        'profile.education': 'Education',
        'profile.noEducation': 'No education added yet',
        'profile.noExperience': 'No experience added yet',
        'profile.noSkills': 'No skills added yet',
        'profile.noBio': 'No bio added yet',
        'profile.notProvided': 'Not provided'
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
        'profile.recentExperience': 'الخبرة الحديثة',
        'profile.present': 'الحالي',
        'profile.editProfile': 'تعديل الملف الشخصي',
        'profile.cancelEdit': 'إلغاء',
        'profile.aboutMe': 'نبذة عني',
        'profile.contactInfo': 'معلومات الاتصال',
        'profile.education': 'التعليم',
        'profile.noEducation': 'لم تتم إضافة تعليم بعد',
        'profile.noExperience': 'لم تتم إضافة خبرة بعد',
        'profile.noSkills': 'لم تتم إضافة مهارات بعد',
        'profile.noBio': 'لم تتم إضافة نبذة بعد',
        'profile.notProvided': 'غير متوفر'
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
        'profile.recentExperience': 'Expérience récente',
        'profile.present': 'Présent',
        'profile.editProfile': 'Modifier le profil',
        'profile.cancelEdit': 'Annuler',
        'profile.aboutMe': 'À propos de moi',
        'profile.contactInfo': 'Coordonnées',
        'profile.education': 'Éducation',
        'profile.noEducation': 'Aucune formation ajoutée',
        'profile.noExperience': 'Aucune expérience ajoutée',
        'profile.noSkills': 'Aucune compétence ajoutée',
        'profile.noBio': 'Aucune bio ajoutée',
        'profile.notProvided': 'Non fourni'
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

  if (loading && !sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
        </div>
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

  const completionPercentage = displayData ? calculateProfileCompletion(displayData) : 0;

  // Profile View Component (Read-only mode)
  const ProfileViewMode = () => (
    <div className="space-y-6">
      {/* About Me Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <User className="w-4 h-4 text-white" />
            </div>
            {getText('profile.aboutMe')}
          </h3>
        </div>
        <div className="p-6">
          {displayData?.profile?.bio ? (
            <p className="text-gray-700 leading-relaxed">{displayData.profile.bio}</p>
          ) : (
            <p className="text-gray-400 italic">{getText('profile.noBio')}</p>
          )}
        </div>
      </div>

      {/* Contact & Professional Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Mail className="w-4 h-4 text-white" />
              </div>
              {getText('profile.contactInfo')}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 rounded-xl">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                <p className="text-gray-900 font-medium">{displayData?.email || getText('profile.notProvided')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-purple-50 rounded-xl">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                <p className="text-gray-900 font-medium">{displayData?.profile?.phone || getText('profile.notProvided')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-pink-50 rounded-xl">
                <MapPin className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Location</p>
                <p className="text-gray-900 font-medium">{displayData?.profile?.location || getText('profile.notProvided')}</p>
              </div>
            </div>
            {displayData?.profile?.website && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-cyan-50 rounded-xl">
                  <Globe className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{getText('profile.website')}</p>
                  <a href={displayData.profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                    {displayData.profile.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              {getText('profile.professionalInformation')}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-xl">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Company</p>
                <p className="text-gray-900 font-medium">{displayData?.profile?.company || getText('profile.notProvided')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Position</p>
                <p className="text-gray-900 font-medium">{displayData?.profile?.position || getText('profile.notProvided')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {getText('profile.skills')}
          </h3>
        </div>
        <div className="p-6">
          {displayData?.profile?.skills && displayData.profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayData.profile.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-default border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">{getText('profile.noSkills')}</p>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {getText('profile.experience')}
          </h3>
        </div>
        <div className="p-6">
          {displayData?.profile?.experience && displayData.profile.experience.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500 via-emerald-500 to-teal-500"></div>

              <div className="space-y-6">
                {displayData.profile.experience.map((exp: { position: string; company: string; startDate: string; endDate?: string; description?: string }, index: number) => (
                  <div key={index} className="relative pl-10 group">
                    {/* Timeline Dot */}
                    <div className="absolute left-2 top-2 w-4 h-4 bg-white border-4 border-green-500 rounded-full group-hover:scale-125 transition-transform duration-300 shadow-lg"></div>

                    <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50/30 hover:from-gray-100 hover:to-green-100/30 rounded-xl transition-all duration-300 hover:shadow-md">
                      <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                      <p className="text-green-600 font-medium text-sm">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate} — {exp.endDate || getText('profile.present')}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">{getText('profile.noExperience')}</p>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            {getText('profile.education')}
          </h3>
        </div>
        <div className="p-6">
          {displayData?.profile?.education && displayData.profile.education.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayData.profile.education.map((edu: { institution: string; degree: string; field: string; year: string }, index: number) => (
                <div key={index} className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-sm text-blue-600 font-medium">{edu.field}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {edu.year}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">{getText('profile.noEducation')}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header Card */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Gradient Background Decoration */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
            <div className="absolute top-0 left-0 right-0 h-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwLTItMi0yLTRzMi00IDItNGMtMiAwLTQtMi00LTJzMiAyIDQgMmMwIDAgMiAyIDIgNHMtMiA0LTIgNGMyIDAgNCAxIDQgMnMtMiAyLTQgMmMwIDAtMiAyLTIgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

            <div className="relative px-6 pt-20 pb-6">
              {/* Profile Avatar and Edit Button Row */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative -mt-16 md:-mt-12">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
                    <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                      {displayData?.profile?.profileImage ? (
                        <Image
                          src={displayData.profile.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          width={112}
                          height={112}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <User className="w-12 h-12 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>

                <div className="flex-1 text-center md:text-start">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {displayData?.profile?.firstName && displayData?.profile?.lastName
                      ? `${displayData.profile.firstName} ${displayData.profile.lastName}`
                      : getText('profile.completeYourProfile')
                    }
                  </h1>
                  <p className="text-gray-600 mt-3 flex items-center justify-center md:justify-start gap-2">
                    <Briefcase className="w-4 h-4" />
                    {displayData?.profile?.position || getText('profile.jobSeeker')}
                    {displayData?.profile?.company && (
                      <span className="text-gray-400">
                        {getText('profile.at')} <span className="text-indigo-600 font-medium">{displayData.profile.company}</span>
                      </span>
                    )}
                  </p>
                </div>

                {/* Edit/Cancel Button */}
                {activeTab === 'profile' && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`
                      flex items-center justify-center gap-2 px-6 h-[64px] rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                      ${isEditing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                      }
                    `}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        {getText('profile.cancelEdit')}
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        {getText('profile.editProfile')}
                      </>
                    )}
                  </button>
                )}

                {/* Quick Stats */}
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {displayData?.profile?.skills?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{getText('profile.skills')}</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {displayData?.profile?.experience?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{getText('profile.experience')}</div>
                  </div>
                </div>
              </div>

              {/* Quick Info Pills */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                {displayData?.email && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-600 transition-all duration-200 hover:shadow-md">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    {displayData.email}
                  </div>
                )}
                {displayData?.profile?.phone && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-600 transition-all duration-200 hover:shadow-md">
                    <Phone className="w-4 h-4 text-purple-500" />
                    {displayData.profile.phone}
                  </div>
                )}
                {displayData?.profile?.location && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-600 transition-all duration-200 hover:shadow-md">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    {displayData.profile.location}
                  </div>
                )}
                {displayData?.profile?.website && (
                  <a
                    href={displayData.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-full text-sm text-indigo-600 transition-all duration-200 hover:shadow-md"
                  >
                    <Globe className="w-4 h-4" />
                    {getText('profile.website')}
                  </a>
                )}
              </div>

              {/* Profile Completion Progress */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-500" />
                    {getText('profile.profileCompletion')}
                  </span>
                  <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{getText('profile.completeProfile')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-xl w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'cv') {
                      setIsEditing(false);
                    }
                  }}
                  className={`
                    relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
                    ${isActive
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {tab.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1.5 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <div className="transition-all duration-300">
              {isEditing ? (
                <ProfileForm
                  initialData={fullProfile}
                  onSuccess={async () => {
                    const res = await fetch('/api/user/profile');
                    if (res.ok) {
                      const data = await res.json();
                      setFullProfile(data);
                    }
                    setIsEditing(false);
                  }}
                />
              ) : (
                <ProfileViewMode />
              )}
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  {getText('profile.cvResumeManagement')}
                </h2>
                <p className="text-gray-600 mt-2">
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

                {/* CV Tips Card */}
                <div className="mt-8 p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-xl">
                  <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    {getText('profile.cvTips')}
                  </h3>
                  <ul className="space-y-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <li key={num} className="flex items-start gap-2 text-sm text-indigo-800">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">
                          {num}
                        </span>
                        {getText(`profile.cvTip${num}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
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