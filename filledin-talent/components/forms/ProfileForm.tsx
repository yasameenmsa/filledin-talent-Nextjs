'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Plus,
  Trash2,
  Save,
  Loader2,
  Globe,
  GraduationCap,
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Translations
const translations = {
  en: {
    'profile.settings': 'Profile Settings',
    'profile.settingsDesc': 'Update your personal information and professional details',
    'profile.basicInfo': 'Basic Information',
    'profile.firstName': 'First Name',
    'profile.firstNamePlaceholder': 'Enter your first name',
    'profile.firstNameRequired': 'First name is required',
    'profile.lastName': 'Last Name',
    'profile.lastNamePlaceholder': 'Enter your last name',
    'profile.lastNameRequired': 'Last name is required',
    'profile.email': 'Email',
    'profile.emailPlaceholder': 'Enter your email',
    'profile.emailInvalid': 'Invalid email format',
    'profile.phone': 'Phone',
    'profile.phonePlaceholder': 'Enter your phone number',
    'profile.location': 'Location',
    'profile.locationPlaceholder': 'City, Country',
    'profile.website': 'Website',
    'profile.websitePlaceholder': 'https://your-website.com',
    'profile.websiteInvalid': 'Invalid URL format',
    'profile.bio': 'Bio',
    'profile.bioPlaceholder': 'Tell us about yourself...',
    'profile.professionalInfo': 'Professional Information',
    'profile.currentCompany': 'Current Company',
    'profile.companyPlaceholder': 'Company name',
    'profile.currentPosition': 'Current Position',
    'profile.positionPlaceholder': 'Job title',
    'profile.skills': 'Skills',
    'profile.addSkillPlaceholder': 'Add a skill',
    'profile.workExperience': 'Work Experience',
    'profile.addExperience': 'Add Experience',
    'profile.experience': 'Experience',
    'profile.companyRequired': 'Company name is required',
    'profile.positionRequired': 'Position is required',
    'profile.startDate': 'Start Date',
    'profile.startDateRequired': 'Start date is required',
    'profile.endDate': 'End Date',
    'profile.endDatePlaceholder': 'Leave empty if current',
    'profile.description': 'Description',
    'profile.descriptionPlaceholder': 'Describe your responsibilities and achievements...',
    'profile.education': 'Education',
    'profile.addEducation': 'Add Education',
    'profile.institution': 'Institution',
    'profile.institutionPlaceholder': 'University/School name',
    'profile.institutionRequired': 'Institution is required',
    'profile.degree': 'Degree',
    'profile.degreePlaceholder': "Bachelor's, Master's, etc.",
    'profile.degreeRequired': 'Degree is required',
    'profile.field': 'Field of Study',
    'profile.fieldPlaceholder': 'Computer Science, Business, etc.',
    'profile.fieldRequired': 'Field of study is required',
    'profile.year': 'Year',
    'profile.yearPlaceholder': '2020, 2018-2022, etc.',
    'profile.yearRequired': 'Year is required',
    'profile.save': 'Save Profile',
    'profile.saving': 'Saving...',
    'profile.success': 'Profile updated successfully!',
    'profile.error': 'Failed to update profile',
    'profile.updateError': 'Profile update error:'
  },
  fr: {
    'profile.settings': 'Paramètres du profil',
    'profile.settingsDesc': 'Mettez à jour vos informations personnelles et professionnelles',
    'profile.basicInfo': 'Informations de base',
    'profile.firstName': 'Prénom',
    'profile.firstNamePlaceholder': 'Entrez votre prénom',
    'profile.firstNameRequired': 'Le prénom est requis',
    'profile.lastName': 'Nom',
    'profile.lastNamePlaceholder': 'Entrez votre nom',
    'profile.lastNameRequired': 'Le nom est requis',
    'profile.email': 'E-mail',
    'profile.emailPlaceholder': 'Entrez votre e-mail',
    'profile.emailInvalid': 'Format d\'e-mail invalide',
    'profile.phone': 'Téléphone',
    'profile.phonePlaceholder': 'Entrez votre numéro de téléphone',
    'profile.location': 'Lieu',
    'profile.locationPlaceholder': 'Ville, Pays',
    'profile.website': 'Site web',
    'profile.websitePlaceholder': 'https://votre-site-web.com',
    'profile.websiteInvalid': 'Format URL invalide',
    'profile.bio': 'Biographie',
    'profile.bioPlaceholder': 'Parlez-nous de vous...',
    'profile.professionalInfo': 'Informations professionnelles',
    'profile.currentCompany': 'Entreprise actuelle',
    'profile.companyPlaceholder': 'Nom de l\'entreprise',
    'profile.currentPosition': 'Poste actuel',
    'profile.positionPlaceholder': 'Intitulé du poste',
    'profile.skills': 'Compétences',
    'profile.addSkillPlaceholder': 'Ajouter une compétence',
    'profile.workExperience': 'Expérience professionnelle',
    'profile.addExperience': 'Ajouter une expérience',
    'profile.experience': 'Expérience',
    'profile.companyRequired': 'Le nom de l\'entreprise est requis',
    'profile.positionRequired': 'Le poste est requis',
    'profile.startDate': 'Date de début',
    'profile.startDateRequired': 'La date de début est requise',
    'profile.endDate': 'Date de fin',
    'profile.endDatePlaceholder': 'Laisser vide si poste actuel',
    'profile.description': 'Description',
    'profile.descriptionPlaceholder': 'Décrivez vos responsabilités et réalisations...',
    'profile.education': 'Éducation',
    'profile.addEducation': 'Ajouter une formation',
    'profile.institution': 'Établissement',
    'profile.institutionPlaceholder': 'Nom de l\'université/école',
    'profile.institutionRequired': 'L\'établissement est requis',
    'profile.degree': 'Diplôme',
    'profile.degreePlaceholder': 'Licence, Master, etc.',
    'profile.degreeRequired': 'Le diplôme est requis',
    'profile.field': 'Domaine d\'études',
    'profile.fieldPlaceholder': 'Informatique, Commerce, etc.',
    'profile.fieldRequired': 'Le domaine d\'études est requis',
    'profile.year': 'Année',
    'profile.yearPlaceholder': '2020, 2018-2022, etc.',
    'profile.yearRequired': 'L\'année est requise',
    'profile.save': 'Enregistrer le profil',
    'profile.saving': 'Enregistrement...',
    'profile.success': 'Profil mis à jour avec succès !',
    'profile.error': 'Échec de la mise à jour du profil',
    'profile.updateError': 'Erreur de mise à jour du profil :'
  },
  ar: {
    'profile.settings': 'إعدادات الملف الشخصي',
    'profile.settingsDesc': 'قم بتحديث معلوماتك الشخصية والمهنية',
    'profile.basicInfo': 'المعلومات الأساسية',
    'profile.firstName': 'الاسم الأول',
    'profile.firstNamePlaceholder': 'أدخل اسمك الأول',
    'profile.firstNameRequired': 'الاسم الأول مطلوب',
    'profile.lastName': 'الاسم الأخير',
    'profile.lastNamePlaceholder': 'أدخل اسمك الأخير',
    'profile.lastNameRequired': 'الاسم الأخير مطلوب',
    'profile.email': 'البريد الإلكتروني',
    'profile.emailPlaceholder': 'أدخل بريدك الإلكتروني',
    'profile.emailInvalid': 'تنسيق البريد الإلكتروني غير صحيح',
    'profile.phone': 'الهاتف',
    'profile.phonePlaceholder': 'أدخل رقم هاتفك',
    'profile.location': 'الموقع',
    'profile.locationPlaceholder': 'المدينة، الدولة',
    'profile.website': 'الموقع الإلكتروني',
    'profile.websitePlaceholder': 'https://your-website.com',
    'profile.websiteInvalid': 'تنسيق الرابط غير صحيح',
    'profile.bio': 'نبذة عنك',
    'profile.bioPlaceholder': 'أخبرنا عن نفسك...',
    'profile.professionalInfo': 'المعلومات المهنية',
    'profile.currentCompany': 'الشركة الحالية',
    'profile.companyPlaceholder': 'اسم الشركة',
    'profile.currentPosition': 'المسمى الوظيفي الحالي',
    'profile.positionPlaceholder': 'المسمى الوظيفي',
    'profile.skills': 'المهارات',
    'profile.addSkillPlaceholder': 'أضف مهارة',
    'profile.workExperience': 'الخبرة العملية',
    'profile.addExperience': 'أضف خبرة',
    'profile.experience': 'الخبرة',
    'profile.companyRequired': 'اسم الشركة مطلوب',
    'profile.positionRequired': 'المسمى الوظيفي مطلوب',
    'profile.startDate': 'تاريخ البدء',
    'profile.startDateRequired': 'تاريخ البدء مطلوب',
    'profile.endDate': 'تاريخ الانتهاء',
    'profile.endDatePlaceholder': 'اتركه فارغاً إذا كنت لا تزال تعمل هنا',
    'profile.description': 'الوصف',
    'profile.descriptionPlaceholder': 'صف مسؤولياتك وإنجازاتك...',
    'profile.education': 'التعليم',
    'profile.addEducation': 'أضف تعليم',
    'profile.institution': 'المؤسسة التعليمية',
    'profile.institutionPlaceholder': 'اسم الجامعة/المدرسة',
    'profile.institutionRequired': 'المؤسسة التعليمية مطلوبة',
    'profile.degree': 'الدرجة العلمية',
    'profile.degreePlaceholder': 'بكالوريوس، ماجستير، إلخ',
    'profile.degreeRequired': 'الدرجة العلمية مطلوبة',
    'profile.field': 'مجال الدراسة',
    'profile.fieldPlaceholder': 'علوم الحاسب، إدارة أعمال، إلخ',
    'profile.fieldRequired': 'مجال الدراسة مطلوب',
    'profile.year': 'السنة',
    'profile.yearPlaceholder': '2020، 2018-2022، إلخ',
    'profile.yearRequired': 'السنة مطلوبة',
    'profile.save': 'حفظ الملف الشخصي',
    'profile.saving': 'جاري الحفظ...',
    'profile.success': 'تم تحديث الملف الشخصي بنجاح!',
    'profile.error': 'فشل تحديث الملف الشخصي',
    'profile.updateError': 'خطأ في تحديث الملف الشخصي:'
  }
};

const profileSchema = z.object({
  email: z.string().email('Invalid email format'),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    website: z.string().url('Invalid URL format').optional().or(z.literal('')),
    skills: z.array(z.string()).optional(),
    experience: z.array(z.object({
      company: z.string().min(1, 'Company name is required'),
      position: z.string().min(1, 'Position is required'),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })).optional(),
    education: z.array(z.object({
      institution: z.string().min(1, 'Institution is required'),
      degree: z.string().min(1, 'Degree is required'),
      field: z.string().min(1, 'Field of study is required'),
      year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number (e.g., 2023)'),
    })).optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export default function ProfileForm({ onSuccess, initialData }: ProfileFormProps) {
  const { userData: sessionData, updateProfile } = useAuth();
  const { currentLanguage } = useLanguage();

  // Helper for translations
  const getText = (key: string) => {
    return translations[currentLanguage as keyof typeof translations]?.[key as keyof (typeof translations)['en']] || translations['en'][key as keyof (typeof translations)['en']] || key;
  };

  // Prefer initialData if available, otherwise sessionData
  const userData = initialData || sessionData;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [skills, setSkills] = useState<string[]>(userData?.profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: userData?.email || '',
      profile: {
        firstName: userData?.profile?.firstName || '',
        lastName: userData?.profile?.lastName || '',
        phone: userData?.profile?.phone || '',
        location: userData?.profile?.location || '',
        bio: userData?.profile?.bio || '',
        company: userData?.profile?.company || '',
        position: userData?.profile?.position || '',
        website: userData?.profile?.website || '',
        skills: userData?.profile?.skills || [],
        experience: userData?.profile?.experience || [],
        education: userData?.profile?.education || [],
      }
    }
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "profile.experience"
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "profile.education"
  });

  // Update form when userData (initialData or session) changes
  useEffect(() => {
    if (userData) {
      reset({
        email: userData.email,
        profile: {
          firstName: userData.profile?.firstName || '',
          lastName: userData.profile?.lastName || '',
          phone: userData.profile?.phone || '',
          location: userData.profile?.location || '',
          bio: userData.profile?.bio || '',
          company: userData.profile?.company || '',
          position: userData?.profile?.position || '',
          website: userData.profile?.website || '',
          skills: userData.profile?.skills || [],
          experience: userData.profile?.experience || [],
          education: userData.profile?.education || [],
        }
      });
      setSkills(userData.profile?.skills || []);
    }
  }, [userData, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Include skills in the profile data
      const profileData = {
        ...data,
        profile: {
          ...data.profile,
          skills
        }
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || getText('profile.error'));
      }

      const updatedUser = await response.json();

      // Update the auth context
      await updateProfile(updatedUser);

      setSuccess(getText('profile.success'));
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : getText('profile.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setValue('profile.skills', updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setValue('profile.skills', updatedSkills);
  };

  const addExperience = () => {
    appendExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const addEducation = () => {
    appendEducation({
      institution: '',
      degree: '',
      field: '',
      year: ''
    });
  };

  // Custom input class with modern styling
  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const errorClass = "text-red-500 text-sm mt-1.5 flex items-center gap-1";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getText('profile.settings')}
              </h2>
              <p className="text-gray-600 mt-1">
                {getText('profile.settingsDesc')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-10">
          {/* Basic Information Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {getText('profile.basicInfo')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div className="group">
                <label className={labelClass}>
                  {getText('profile.firstName')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('profile.firstName')}
                  type="text"
                  className={inputClass}
                  placeholder={getText('profile.firstNamePlaceholder')}
                />
                {errors.profile?.firstName && (
                  <p className={errorClass}>{errors.profile.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="group">
                <label className={labelClass}>
                  {getText('profile.lastName')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('profile.lastName')}
                  type="text"
                  className={inputClass}
                  placeholder={getText('profile.lastNamePlaceholder')}
                />
                {errors.profile?.lastName && (
                  <p className={errorClass}>{errors.profile.lastName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="group">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <Mail className="w-4 h-4 text-indigo-500" />
                  {getText('profile.email')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={inputClass}
                  placeholder={getText('profile.emailPlaceholder')}
                />
                {errors.email && (
                  <p className={errorClass}>{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="group">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <Phone className="w-4 h-4 text-purple-500" />
                  {getText('profile.phone')}
                </label>
                <input
                  {...register('profile.phone')}
                  type="tel"
                  className={inputClass}
                  placeholder={getText('profile.phonePlaceholder')}
                />
              </div>

              {/* Location */}
              <div className="group">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <MapPin className="w-4 h-4 text-pink-500" />
                  {getText('profile.location')}
                </label>
                <input
                  {...register('profile.location')}
                  type="text"
                  className={inputClass}
                  placeholder={getText('profile.locationPlaceholder')}
                />
              </div>

              {/* Website */}
              <div className="group">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <Globe className="w-4 h-4 text-cyan-500" />
                  {getText('profile.website')}
                </label>
                <input
                  {...register('profile.website')}
                  type="url"
                  className={inputClass}
                  placeholder={getText('profile.websitePlaceholder')}
                />
                {errors.profile?.website && (
                  <p className={errorClass}>{errors.profile.website.message}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-5">
              <label className={labelClass}>
                {getText('profile.bio')}
              </label>
              <textarea
                {...register('profile.bio')}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder={getText('profile.bioPlaceholder')}
              />
            </div>
          </div>

          {/* Professional Information Section */}
          {userData?.role === 'job_seeker' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {getText('profile.professionalInfo')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className={labelClass}>
                    {getText('profile.currentCompany')}
                  </label>
                  <input
                    {...register('profile.company')}
                    type="text"
                    className={inputClass}
                    placeholder={getText('profile.companyPlaceholder')}
                  />
                </div>

                <div className="group">
                  <label className={labelClass}>
                    {getText('profile.currentPosition')}
                  </label>
                  <input
                    {...register('profile.position')}
                    type="text"
                    className={inputClass}
                    placeholder={getText('profile.positionPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Skills Section */}
          {userData?.role === 'job_seeker' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {getText('profile.skills')}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className={`flex-1 ${inputClass}`}
                    placeholder={getText('profile.addSkillPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 rounded-full text-sm font-medium transition-all duration-300 border border-indigo-100 hover:shadow-md"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="w-5 h-5 flex items-center justify-center bg-indigo-200/50 hover:bg-red-500 text-indigo-600 hover:text-white rounded-full transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {userData?.role === 'job_seeker' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {getText('profile.workExperience')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {getText('profile.addExperience')}
                </button>
              </div>

              <div className="space-y-5">
                {experienceFields.map((field, index) => (
                  <div key={field.id} className="group p-5 bg-gradient-to-r from-gray-50 to-green-50/30 border border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-green-200">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full text-xs">
                          {index + 1}
                        </span>
                        {getText('profile.experience')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          {getText('profile.currentCompany')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`profile.experience.${index}.company`)}
                          type="text"
                          className={inputClass}
                          placeholder={getText('profile.companyPlaceholder')}
                        />
                        {errors.profile?.experience?.[index]?.company && (
                          <p className={errorClass}>
                            {errors.profile.experience[index]?.company?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>
                          {getText('profile.currentPosition')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`profile.experience.${index}.position`)}
                          type="text"
                          className={inputClass}
                          placeholder={getText('profile.positionPlaceholder')}
                        />
                        {errors.profile?.experience?.[index]?.position && (
                          <p className={errorClass}>
                            {errors.profile.experience[index]?.position?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>
                          {getText('profile.startDate')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`profile.experience.${index}.startDate`)}
                          type="month"
                          className={inputClass}
                        />
                        {errors.profile?.experience?.[index]?.startDate && (
                          <p className={errorClass}>
                            {errors.profile.experience[index]?.startDate?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>
                          {getText('profile.endDate')}
                        </label>
                        <input
                          {...register(`profile.experience.${index}.endDate`)}
                          type="month"
                          className={inputClass}
                          placeholder={getText('profile.endDatePlaceholder')}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          {getText('profile.description')}
                        </label>
                        <textarea
                          {...register(`profile.experience.${index}.description`)}
                          rows={3}
                          className={`${inputClass} resize-none`}
                          placeholder={getText('profile.descriptionPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {userData?.role === 'job_seeker' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {getText('profile.education')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {getText('profile.addEducation')}
                </button>
              </div>

              <div className="space-y-5">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="group p-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs">
                          {index + 1}
                        </span>
                        {getText('profile.education')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          {getText('profile.institution')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`profile.education.${index}.institution`)}
                          type="text"
                          className={inputClass}
                          placeholder={getText('profile.institutionPlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.institution && (
                          <p className={errorClass}>
                            {errors.profile.education[index]?.institution?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>
                          {getText('profile.degree')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`profile.education.${index}.degree`)}
                          type="text"
                          className={inputClass}
                          placeholder={getText('profile.degreePlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.degree && (
                          <p className={errorClass}>
                            {errors.profile.education[index]?.degree?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>
                          {getText('profile.field')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`profile.education.${index}.field`)}
                          type="text"
                          className={inputClass}
                          placeholder={getText('profile.fieldPlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.field && (
                          <p className={errorClass}>
                            {errors.profile.education[index]?.field?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>
                          {getText('profile.year')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`profile.education.${index}.year`)}
                          type="text"
                          className={inputClass}
                          placeholder={getText('profile.yearPlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.year && (
                          <p className={errorClass}>
                            {errors.profile.education[index]?.year?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isLoading}
              className="relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-3 overflow-hidden group"
            >
              {/* Shimmer Effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {getText('profile.saving')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {getText('profile.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}