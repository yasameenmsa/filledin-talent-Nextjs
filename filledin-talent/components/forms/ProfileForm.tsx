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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Profile validation schema
// ... (schema remains unchanged)

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
      year: z.string().min(1, 'Year is required'),
    })).optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSuccess?: () => void;
  initialData?: any; // Using any to avoid complex type duplication for now, or match UserData structure
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="w-6 h-6 mr-2" />
            {getText('profile.settings')}
          </h2>
          <p className="text-gray-600 mt-1">
            {getText('profile.settingsDesc')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              {getText('profile.basicInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('profile.firstName')} *
                </label>
                <input
                  {...register('profile.firstName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getText('profile.firstNamePlaceholder')}
                />
                {errors.profile?.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.profile.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('profile.lastName')} *
                </label>
                <input
                  {...register('profile.lastName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getText('profile.lastNamePlaceholder')}
                />
                {errors.profile?.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.profile.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 mr-1" />
                  {getText('profile.email')} *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getText('profile.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 mr-1" />
                  {getText('profile.phone')}
                </label>
                <input
                  {...register('profile.phone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getText('profile.phonePlaceholder')}
                />
                {errors.profile?.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.profile.phone.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {getText('profile.location')}
                </label>
                <input
                  {...register('profile.location')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getText('profile.locationPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('profile.website')}
                </label>
                <input
                  {...register('profile.website')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getText('profile.websitePlaceholder')}
                />
                {errors.profile?.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.profile.website.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('profile.bio')}
              </label>
              <textarea
                {...register('profile.bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={getText('profile.bioPlaceholder')}
              />
            </div>
          </div>

          {/* Professional Information */}
          {userData?.role === 'job_seeker' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                {getText('profile.professionalInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('profile.currentCompany')}
                  </label>
                  <input
                    {...register('profile.company')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={getText('profile.companyPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('profile.currentPosition')}
                  </label>
                  <input
                    {...register('profile.position')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={getText('profile.positionPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Skills Section */}
          {userData?.role === 'job_seeker' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {getText('profile.skills')}
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={getText('profile.addSkillPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getText('profile.workExperience')}
                </h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {getText('profile.addExperience')}
                </button>
              </div>

              <div className="space-y-6">
                {experienceFields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">{getText('profile.experience')} {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.currentCompany')} *
                        </label>
                        <input
                          {...register(`profile.experience.${index}.company`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getText('profile.companyPlaceholder')}
                        />
                        {errors.profile?.experience?.[index]?.company && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.profile.experience[index]?.company?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.currentPosition')} *
                        </label>
                        <input
                          {...register(`profile.experience.${index}.position`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getText('profile.positionPlaceholder')}
                        />
                        {errors.profile?.experience?.[index]?.position && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.profile.experience[index]?.position?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.startDate')} *
                        </label>
                        <input
                          {...register(`profile.experience.${index}.startDate`)}
                          type="month"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.profile?.experience?.[index]?.startDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.profile.experience[index]?.startDate?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.endDate')}
                        </label>
                        <input
                          {...register(`profile.experience.${index}.endDate`)}
                          type="month"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getText('profile.endDatePlaceholder')}
                        />
                        {errors.profile?.experience?.[index]?.endDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.profile.experience[index]?.endDate?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.description')}
                        </label>
                        <textarea
                          {...register(`profile.experience.${index}.description`)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getText('profile.education')}
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {getText('profile.addEducation')}
                </button>
              </div>

              <div className="space-y-6">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">{getText('profile.education')} {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.institution')} *
                        </label>
                        <input
                          {...register(`profile.education.${index}.institution`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getText('profile.institutionPlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.institution && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.profile.education[index]?.institution?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.degree')} *
                        </label>
                        <input
                          {...register(`profile.education.${index}.degree`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getText('profile.degreePlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.degree && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.profile.education[index]?.degree?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.field')} *
                        </label>
                        <input
                          {...register(`profile.education.${index}.field`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getText('profile.fieldPlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.field && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.profile.education[index]?.field?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getText('profile.year')} *
                        </label>
                        <input
                          {...register(`profile.education.${index}.year`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={getText('profile.yearPlaceholder')}
                        />
                        {errors.profile?.education?.[index]?.year && (
                          <p className="text-red-500 text-sm mt-1">
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {getText('profile.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
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