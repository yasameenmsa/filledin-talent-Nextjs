'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign, Users, Building, FileText } from 'lucide-react';

interface JobPostingFormProps {
  lang: string;
}

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  category: string;
  sector: string;
  workingType: string;
  experienceLevel: string;
  location: {
    country: string;
    city: string;
    remote: boolean;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  benefits: string[];
  requiredSkills: string[];
  applicationDeadline: string;
  isUrgent: boolean;
}

export default function JobPostingForm({ lang }: JobPostingFormProps) {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  
  // Inline translations
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'jobs.createJobPosting': {
        en: 'Create Job Posting',
        ar: 'إنشاء إعلان وظيفي',
        fr: 'Créer une offre d\'emploi'
      },
      'jobs.fillDetails': {
        en: 'Fill out the details to create a new job posting',
        ar: 'املأ التفاصيل لإنشاء إعلان وظيفي جديد',
        fr: 'Remplissez les détails pour créer une nouvelle offre d\'emploi'
      },
      'jobs.basicInformation': {
        en: 'Basic Information',
        ar: 'المعلومات الأساسية',
        fr: 'Informations de base'
      },
      'jobs.jobDetails': {
        en: 'Job Details',
        ar: 'تفاصيل الوظيفة',
        fr: 'Détails du poste'
      },
      'jobs.requirements': {
        en: 'Requirements',
        ar: 'المتطلبات',
        fr: 'Exigences'
      },
      'jobs.compensation': {
        en: 'Compensation',
        ar: 'التعويض',
        fr: 'Rémunération'
      },
      'jobs.jobTitle': {
        en: 'Job Title',
        ar: 'المسمى الوظيفي',
        fr: 'Titre du poste'
      },
      'jobs.jobTitlePlaceholder': {
        en: 'e.g. Senior Software Engineer',
        ar: 'مثال: مهندس برمجيات أول',
        fr: 'ex. Ingénieur logiciel senior'
      },
      'jobs.jobDescription': {
        en: 'Job Description',
        ar: 'وصف الوظيفة',
        fr: 'Description du poste'
      },
      'jobs.jobDescriptionPlaceholder': {
        en: 'Describe the role, company culture, and what makes this opportunity unique...',
        ar: 'اوصف الدور وثقافة الشركة وما يجعل هذه الفرصة فريدة...',
        fr: 'Décrivez le rôle, la culture d\'entreprise et ce qui rend cette opportunité unique...'
      },
      'jobs.category': {
        en: 'Category',
        ar: 'الفئة',
        fr: 'Catégorie'
      },
      'jobs.selectCategory': {
        en: 'Select Category',
        ar: 'اختر الفئة',
        fr: 'Sélectionner la catégorie'
      },
      'jobs.engineering': {
        en: 'Engineering',
        ar: 'الهندسة',
        fr: 'Ingénierie'
      },
      'jobs.technical': {
        en: 'Technical',
        ar: 'تقني',
        fr: 'Technique'
      },
      'jobs.hse': {
        en: 'HSE',
        ar: 'الصحة والسلامة والبيئة',
        fr: 'HSE'
      },
      'jobs.corporate': {
        en: 'Corporate',
        ar: 'الشركات',
        fr: 'Entreprise'
      },
      'jobs.executive': {
        en: 'Executive',
        ar: 'تنفيذي',
        fr: 'Exécutif'
      },
      'jobs.operations': {
        en: 'Operations',
        ar: 'العمليات',
        fr: 'Opérations'
      },
      'jobs.sector': {
        en: 'Sector',
        ar: 'القطاع',
        fr: 'Secteur'
      },
      'jobs.selectSector': {
        en: 'Select Sector',
        ar: 'اختر القطاع',
        fr: 'Sélectionner le secteur'
      },
      'jobs.oilGas': {
        en: 'Oil & Gas',
        ar: 'النفط والغاز',
        fr: 'Pétrole et gaz'
      },
      'jobs.renewable': {
        en: 'Renewable Energy',
        ar: 'الطاقة المتجددة',
        fr: 'Énergie renouvelable'
      },
      'jobs.both': {
        en: 'Both',
        ar: 'كلاهما',
        fr: 'Les deux'
      },
      'jobs.workingType': {
        en: 'Working Type',
        ar: 'نوع العمل',
        fr: 'Type de travail'
      },
      'jobs.selectWorkingType': {
        en: 'Select Working Type',
        ar: 'اختر نوع العمل',
        fr: 'Sélectionner le type de travail'
      },
      'jobs.fullTime': {
        en: 'Full-time',
        ar: 'دوام كامل',
        fr: 'Temps plein'
      },
      'jobs.partTime': {
        en: 'Part-time',
        ar: 'دوام جزئي',
        fr: 'Temps partiel'
      },
      'jobs.contract': {
        en: 'Contract',
        ar: 'عقد',
        fr: 'Contrat'
      },
      'jobs.remote': {
        en: 'Remote',
        ar: 'عن بُعد',
        fr: 'À distance'
      },
      'jobs.hybrid': {
        en: 'Hybrid',
        ar: 'مختلط',
        fr: 'Hybride'
      },
      'jobs.experienceLevel': {
        en: 'Experience Level',
        ar: 'مستوى الخبرة',
        fr: 'Niveau d\'expérience'
      },
      'jobs.selectExperienceLevel': {
        en: 'Select Experience Level',
        ar: 'اختر مستوى الخبرة',
        fr: 'Sélectionner le niveau d\'expérience'
      },
      'jobs.entryLevel': {
        en: 'Entry Level (0-2 years)',
        ar: 'مستوى مبتدئ (0-2 سنة)',
        fr: 'Niveau débutant (0-2 ans)'
      },
      'jobs.midLevel': {
        en: 'Mid Level (3-5 years)',
        ar: 'مستوى متوسط (3-5 سنوات)',
        fr: 'Niveau intermédiaire (3-5 ans)'
      },
      'jobs.seniorLevel': {
        en: 'Senior Level (6-10 years)',
        ar: 'مستوى أول (6-10 سنوات)',
        fr: 'Niveau senior (6-10 ans)'
      },
      'jobs.leadLevel': {
        en: 'Lead Level (10+ years)',
        ar: 'مستوى قيادي (10+ سنوات)',
        fr: 'Niveau dirigeant (10+ ans)'
      },
      'jobs.executiveLevel': {
        en: 'Executive Level',
        ar: 'مستوى تنفيذي',
        fr: 'Niveau exécutif'
      },
      'jobs.country': {
        en: 'Country',
        ar: 'البلد',
        fr: 'Pays'
      },
      'jobs.countryPlaceholder': {
        en: 'e.g. United States',
        ar: 'مثال: الولايات المتحدة',
        fr: 'ex. États-Unis'
      },
      'jobs.city': {
        en: 'City',
        ar: 'المدينة',
        fr: 'Ville'
      },
      'jobs.cityPlaceholder': {
        en: 'e.g. New York',
        ar: 'مثال: نيويورك',
        fr: 'ex. New York'
      },
      'jobs.remoteWorkAvailable': {
        en: 'Remote work available',
        ar: 'العمل عن بُعد متاح',
        fr: 'Travail à distance disponible'
      },
      'jobs.applicationDeadline': {
        en: 'Application Deadline',
        ar: 'الموعد النهائي للتقديم',
        fr: 'Date limite de candidature'
      },
      'jobs.jobRequirements': {
        en: 'Job Requirements',
        ar: 'متطلبات الوظيفة',
        fr: 'Exigences du poste'
      },
      'jobs.requirementsPlaceholder': {
        en: 'List the required qualifications, skills, and experience...',
        ar: 'اذكر المؤهلات والمهارات والخبرة المطلوبة...',
        fr: 'Listez les qualifications, compétences et expérience requises...'
      },
      'jobs.keyResponsibilities': {
        en: 'Key Responsibilities',
        ar: 'المسؤوليات الرئيسية',
        fr: 'Responsabilités clés'
      },
      'jobs.responsibilitiesPlaceholder': {
        en: 'Describe the main responsibilities and duties...',
        ar: 'اوصف المسؤوليات والواجبات الرئيسية...',
        fr: 'Décrivez les principales responsabilités et tâches...'
      },
      'jobs.requiredSkills': {
        en: 'Required Skills (comma-separated)',
        ar: 'المهارات المطلوبة (مفصولة بفواصل)',
        fr: 'Compétences requises (séparées par des virgules)'
      },
      'jobs.skillsPlaceholder': {
        en: 'e.g. JavaScript, React, Node.js, MongoDB',
        ar: 'مثال: JavaScript, React, Node.js, MongoDB',
        fr: 'ex. JavaScript, React, Node.js, MongoDB'
      },
      'jobs.minimumSalary': {
        en: 'Minimum Salary',
        ar: 'الحد الأدنى للراتب',
        fr: 'Salaire minimum'
      },
      'jobs.maximumSalary': {
        en: 'Maximum Salary',
        ar: 'الحد الأقصى للراتب',
        fr: 'Salaire maximum'
      },
      'jobs.currency': {
        en: 'Currency',
        ar: 'العملة',
        fr: 'Devise'
      },
      'jobs.benefits': {
        en: 'Benefits (comma-separated)',
        ar: 'المزايا (مفصولة بفواصل)',
        fr: 'Avantages (séparés par des virgules)'
      },
      'jobs.benefitsPlaceholder': {
        en: 'e.g. Health insurance, 401k, Flexible hours, Remote work',
        ar: 'مثال: التأمين الصحي، صندوق التقاعد، ساعات مرنة، العمل عن بُعد',
        fr: 'ex. Assurance santé, 401k, Horaires flexibles, Travail à distance'
      },
      'jobs.markAsUrgent': {
        en: 'Mark as urgent hiring',
        ar: 'وضع علامة كتوظيف عاجل',
        fr: 'Marquer comme embauche urgente'
      },
      'jobs.previous': {
        en: 'Previous',
        ar: 'السابق',
        fr: 'Précédent'
      },
      'jobs.next': {
        en: 'Next',
        ar: 'التالي',
        fr: 'Suivant'
      },
      'jobs.creating': {
        en: 'Creating...',
        ar: 'جاري الإنشاء...',
        fr: 'Création en cours...'
      },
      'jobs.createJobPostingButton': {
        en: 'Create Job Posting',
        ar: 'إنشاء إعلان وظيفي',
        fr: 'Créer l\'offre d\'emploi'
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    category: '',
    sector: '',
    workingType: '',
    experienceLevel: '',
    location: {
      country: '',
      city: '',
      remote: false,
    },
    salary: {
      min: 0,
      max: 0,
      currency: 'USD',
      period: 'monthly',
    },
    benefits: [],
    requiredSkills: [],
    applicationDeadline: '',
    isUrgent: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentKey = parent as keyof JobFormData;
        const currentParentValue = prev[parentKey];
        
        // Ensure the parent value is an object before spreading
        if (typeof currentParentValue === 'object' && currentParentValue !== null) {
          return {
            ...prev,
            [parent]: {
              ...currentParentValue,
              [child]: value,
            },
          };
        }
        
        // Fallback for non-object parent values
        return {
          ...prev,
          [parent]: {
            [child]: value,
          },
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create job posting');
      }

      const job = await response.json();
      router.push(`/${lang}/employer/jobs/${job._id}`);
    } catch (error) {
      console.error('Job posting error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: getText('jobs.basicInformation'), icon: FileText },
    { number: 2, title: getText('jobs.jobDetails'), icon: Building },
    { number: 3, title: getText('jobs.requirements'), icon: Users },
    { number: 4, title: getText('jobs.compensation'), icon: DollarSign },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getText('jobs.jobTitle')} *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={getText('jobs.jobTitlePlaceholder')}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getText('jobs.jobDescription')} *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={getText('jobs.jobDescriptionPlaceholder')}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.category')} *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">{getText('jobs.selectCategory')}</option>
            <option value="engineering">{getText('jobs.engineering')}</option>
            <option value="technical">{getText('jobs.technical')}</option>
            <option value="hse">{getText('jobs.hse')}</option>
            <option value="corporate">{getText('jobs.corporate')}</option>
            <option value="executive">{getText('jobs.executive')}</option>
            <option value="operations">{getText('jobs.operations')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.sector')} *
          </label>
          <select
            value={formData.sector}
            onChange={(e) => handleInputChange('sector', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">{getText('jobs.selectSector')}</option>
            <option value="oil-gas">{getText('jobs.oilGas')}</option>
            <option value="renewable">{getText('jobs.renewable')}</option>
            <option value="both">{getText('jobs.both')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.workingType')} *
          </label>
          <select
            value={formData.workingType}
            onChange={(e) => handleInputChange('workingType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">{getText('jobs.selectWorkingType')}</option>
            <option value="full-time">{getText('jobs.fullTime')}</option>
            <option value="part-time">{getText('jobs.partTime')}</option>
            <option value="contract">{getText('jobs.contract')}</option>
            <option value="remote">{getText('jobs.remote')}</option>
            <option value="hybrid">{getText('jobs.hybrid')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.experienceLevel')} *
          </label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">{getText('jobs.selectExperienceLevel')}</option>
            <option value="entry">{getText('jobs.entryLevel')}</option>
            <option value="mid">{getText('jobs.midLevel')}</option>
            <option value="senior">{getText('jobs.seniorLevel')}</option>
            <option value="lead">{getText('jobs.leadLevel')}</option>
            <option value="executive">{getText('jobs.executiveLevel')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.country')} *
          </label>
          <input
            type="text"
            value={formData.location.country}
            onChange={(e) => handleInputChange('location.country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={getText('jobs.countryPlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.city')} *
          </label>
          <input
            type="text"
            value={formData.location.city}
            onChange={(e) => handleInputChange('location.city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={getText('jobs.cityPlaceholder')}
            required
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="remote"
          checked={formData.location.remote}
          onChange={(e) => handleInputChange('location.remote', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="remote" className="ml-2 block text-sm text-gray-700">
          {getText('jobs.remoteWorkAvailable')}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getText('jobs.applicationDeadline')}
        </label>
        <input
          type="date"
          value={formData.applicationDeadline}
          onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getText('jobs.jobRequirements')} *
        </label>
        <textarea
          value={formData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={getText('jobs.requirementsPlaceholder')}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getText('jobs.keyResponsibilities')} *
        </label>
        <textarea
          value={formData.responsibilities}
          onChange={(e) => handleInputChange('responsibilities', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={getText('jobs.responsibilitiesPlaceholder')}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getText('jobs.requiredSkills')}
        </label>
        <input
          type="text"
          value={formData.requiredSkills.join(', ')}
          onChange={(e) => handleInputChange('requiredSkills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={getText('jobs.skillsPlaceholder')}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.minimumSalary')}
          </label>
          <input
            type="number"
            value={formData.salary.min}
            onChange={(e) => handleInputChange('salary.min', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.maximumSalary')}
          </label>
          <input
            type="number"
            value={formData.salary.max}
            onChange={(e) => handleInputChange('salary.max', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('jobs.currency')}
          </label>
          <select
            value={formData.salary.currency}
            onChange={(e) => handleInputChange('salary.currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getText('jobs.benefits')}
        </label>
        <input
          type="text"
          value={formData.benefits.join(', ')}
          onChange={(e) => handleInputChange('benefits', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={getText('jobs.benefitsPlaceholder')}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="urgent"
          checked={formData.isUrgent}
          onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="urgent" className="ml-2 block text-sm text-gray-700">
          {getText('jobs.markAsUrgent')}
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{getText('jobs.createJobPosting')}</h1>
          <p className="text-gray-600 mt-2">{getText('jobs.fillDetails')}</p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getText('jobs.previous')}
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {getText('jobs.next')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? getText('jobs.creating') : getText('jobs.createJobPostingButton')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}