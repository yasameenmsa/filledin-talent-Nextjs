'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
    Loader2,
    Upload,
    X,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    ClipboardList,
    GraduationCap,
    Globe,
    ChevronDown,
    ChevronUp,
    Languages,
    FileText
} from 'lucide-react';
import Image from 'next/image';

// Schema for the job form
const jobSchema = z.object({
    // Default fields (required)
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),

    // Multi-language fields (optional)
    title_en: z.string().optional(),
    description_en: z.string().optional(),
    responsibilities_en: z.string().optional(),
    requirements_experience_en: z.string().optional(),
    requirements_education_en: z.string().optional(),
    skills_en: z.string().optional(),

    title_ar: z.string().optional(),
    description_ar: z.string().optional(),
    responsibilities_ar: z.string().optional(),
    requirements_experience_ar: z.string().optional(),
    requirements_education_ar: z.string().optional(),
    skills_ar: z.string().optional(),

    title_fr: z.string().optional(),
    description_fr: z.string().optional(),
    responsibilities_fr: z.string().optional(),
    requirements_experience_fr: z.string().optional(),
    requirements_education_fr: z.string().optional(),
    skills_fr: z.string().optional(),

    // Company fields - all optional now
    company: z.object({
        name: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
    }),
    category: z.string().min(1, 'Category is required'),
    sector: z.string().min(1, 'Sector is required'),
    location: z.object({
        city: z.string().min(2, 'City is required'),
        country: z.string().min(2, 'Country is required'),
        region: z.string().min(2, 'Region is required'),
    }),
    workingType: z.string().min(1, 'Working type is required'),
    salary: z.object({
        min: z.string().optional(),
        max: z.string().optional(),
        currency: z.string().default('USD'),
    }),
    requirements: z.object({
        experience: z.string().min(1, 'Experience is required'),
        education: z.string().min(1, 'Education is required'),
        skills: z.string().min(1, 'Skills are required'),
    }),
    responsibilities: z.string().min(1, 'Responsibilities are required'),
});

type JobFormData = z.infer<typeof jobSchema>;

// Collapsible section component
function FormSection({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    badge
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="font-semibold text-gray-800">{title}</span>
                    {badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
            </button>
            <div className={`transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-5 pt-2 space-y-4 border-t border-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Form field wrapper with label
function FormField({
    label,
    required = false,
    error,
    children,
    hint
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {hint && !error && (
                <p className="text-xs text-gray-500">{hint}</p>
            )}
            {error && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
}

export default function JobForm({ lang }: { lang: string }) {
    const { t } = useTranslation(lang);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMultiLanguage, setIsMultiLanguage] = useState(false);
    const [activeTab, setActiveTab] = useState<'en' | 'ar' | 'fr'>('en');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<JobFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(jobSchema) as any,
        defaultValues: {
            salary: { currency: 'USD' },
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const onSubmit: SubmitHandler<JobFormData> = async (data) => {
        setLoading(true);
        setError('');

        try {
            let imageUrl = '';

            // Upload image if present
            if (imageFile) {
                setUploadingImage(true);
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('type', 'job-image');

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
                setUploadingImage(false);
            }

            // Transform data for API
            const apiData: Record<string, unknown> = {
                title: data.title,
                description: data.description,
                company: data.company?.name ? data.company : undefined,
                category: data.category,
                sector: data.sector,
                location: data.location,
                workingType: data.workingType,
                salary: {
                    ...data.salary,
                    min: data.salary.min ? Number(data.salary.min) : undefined,
                    max: data.salary.max ? Number(data.salary.max) : undefined,
                },
                requirements: {
                    ...data.requirements,
                    skills: data.requirements.skills.split(',').map(s => s.trim()),
                },
                responsibilities: data.responsibilities.split(',').map(r => r.trim()),
            };

            // Add image URL if uploaded
            if (imageUrl) {
                apiData.imageUrl = imageUrl;
            }

            // Build i18n object only if multi-language mode is enabled
            if (isMultiLanguage) {
                const i18n: Record<string, unknown> = {};

                // English translations
                if (data.title_en || data.description_en || data.responsibilities_en || data.requirements_experience_en || data.requirements_education_en || data.skills_en) {
                    i18n.en = {
                        title: data.title_en,
                        description: data.description_en,
                        responsibilities: data.responsibilities_en ? data.responsibilities_en.split(',').map(r => r.trim()) : undefined,
                        requirements: {
                            experience: data.requirements_experience_en,
                            education: data.requirements_education_en,
                            skills: data.skills_en ? data.skills_en.split(',').map(s => s.trim()) : undefined,
                        },
                    };
                }

                // Arabic translations
                if (data.title_ar || data.description_ar || data.responsibilities_ar || data.requirements_experience_ar || data.requirements_education_ar || data.skills_ar) {
                    i18n.ar = {
                        title: data.title_ar,
                        description: data.description_ar,
                        responsibilities: data.responsibilities_ar ? data.responsibilities_ar.split(',').map(r => r.trim()) : undefined,
                        requirements: {
                            experience: data.requirements_experience_ar,
                            education: data.requirements_education_ar,
                            skills: data.skills_ar ? data.skills_ar.split(',').map(s => s.trim()) : undefined,
                        },
                    };
                }

                // French translations
                if (data.title_fr || data.description_fr || data.responsibilities_fr || data.requirements_experience_fr || data.requirements_education_fr || data.skills_fr) {
                    i18n.fr = {
                        title: data.title_fr,
                        description: data.description_fr,
                        responsibilities: data.responsibilities_fr ? data.responsibilities_fr.split(',').map(r => r.trim()) : undefined,
                        requirements: {
                            experience: data.requirements_experience_fr,
                            education: data.requirements_education_fr,
                            skills: data.skills_fr ? data.skills_fr.split(',').map(s => s.trim()) : undefined,
                        },
                    };
                }

                // Add i18n if any translations were provided
                if (Object.keys(i18n).length > 0) {
                    apiData.i18n = i18n;
                }
            }

            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create job');
            }

            router.push(`/${lang}/admin/jobs`);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'en', label: 'English', flag: '🇬🇧' },
        { id: 'ar', label: 'العربية', flag: '🇸🇦' },
        { id: 'fr', label: 'Français', flag: '🇫🇷' },
    ] as const;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('jobs.form.title') || 'Create New Job'}
                            </h1>
                            <p className="text-blue-200 text-sm mt-1">
                                Fill in the details below to post a new job listing
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <X className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Language Mode Toggle */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Languages className="w-5 h-5 text-indigo-700" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Language Mode</h3>
                                <p className="text-sm text-gray-500">
                                    {isMultiLanguage
                                        ? 'Add translations for English, Arabic, and French'
                                        : 'Create job in a single language'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsMultiLanguage(!isMultiLanguage)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isMultiLanguage ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isMultiLanguage ? 'translate-x-8' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!isMultiLanguage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            Single Language
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isMultiLanguage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            Multi-Language (EN/AR/FR)
                        </span>
                    </div>
                </div>

                {/* Multi-Language Tabs - Only shown when multi-language mode is enabled */}
                {isMultiLanguage && (
                    <FormSection title="Translations" icon={Globe} defaultOpen={true}>
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-200 mb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 border-b-2 ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg">{tab.flag}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content - English */}
                        {activeTab === 'en' && (
                            <div className="space-y-4 animate-fadeIn">
                                <FormField label="Job Title (English)">
                                    <Input {...register('title_en')} placeholder="e.g. Senior Developer" className="w-full" />
                                </FormField>
                                <FormField label="Description (English)">
                                    <Textarea {...register('description_en')} placeholder="Describe the job role and expectations..." className="min-h-[120px]" />
                                </FormField>
                                <FormField label="Responsibilities (English)" hint="Separate with commas">
                                    <Textarea {...register('responsibilities_en')} placeholder="Lead development, Mentor team members, ..." />
                                </FormField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Experience (English)">
                                        <Input {...register('requirements_experience_en')} placeholder="e.g. 5+ years" />
                                    </FormField>
                                    <FormField label="Education (English)">
                                        <Input {...register('requirements_education_en')} placeholder="e.g. Bachelor's Degree" />
                                    </FormField>
                                </div>
                                <FormField label="Skills (English)" hint="Separate with commas">
                                    <Textarea {...register('skills_en')} placeholder="JavaScript, React, Node.js, Python..." />
                                </FormField>
                            </div>
                        )}

                        {/* Tab Content - Arabic */}
                        {activeTab === 'ar' && (
                            <div className="space-y-4 animate-fadeIn" dir="rtl">
                                <FormField label="المسمى الوظيفي (عربي)">
                                    <Input {...register('title_ar')} placeholder="مثال: مطور أول" />
                                </FormField>
                                <FormField label="الوصف (عربي)">
                                    <Textarea {...register('description_ar')} placeholder="صف الوظيفة والتوقعات..." className="min-h-[120px]" />
                                </FormField>
                                <FormField label="المسؤوليات (عربي)" hint="افصل بفواصل">
                                    <Textarea {...register('responsibilities_ar')} placeholder="قيادة التطوير، توجيه الفريق، ..." />
                                </FormField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="الخبرة (عربي)">
                                        <Input {...register('requirements_experience_ar')} placeholder="مثال: 5+ سنوات" />
                                    </FormField>
                                    <FormField label="التعليم (عربي)">
                                        <Input {...register('requirements_education_ar')} placeholder="مثال: درجة البكالوريوس" />
                                    </FormField>
                                </div>
                                <FormField label="المهارات (عربي)" hint="افصل بفواصل">
                                    <Textarea {...register('skills_ar')} placeholder="جافاسكريبت، ريأكت، نود.جي اس، بايثون..." />
                                </FormField>
                            </div>
                        )}

                        {/* Tab Content - French */}
                        {activeTab === 'fr' && (
                            <div className="space-y-4 animate-fadeIn">
                                <FormField label="Titre du Poste (Français)">
                                    <Input {...register('title_fr')} placeholder="ex: Développeur Senior" />
                                </FormField>
                                <FormField label="Description (Français)">
                                    <Textarea {...register('description_fr')} placeholder="Décrivez le rôle et les attentes..." className="min-h-[120px]" />
                                </FormField>
                                <FormField label="Responsabilités (Français)" hint="Séparez par des virgules">
                                    <Textarea {...register('responsibilities_fr')} placeholder="Diriger le développement, Encadrer l'équipe, ..." />
                                </FormField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Expérience (Français)">
                                        <Input {...register('requirements_experience_fr')} placeholder="ex: 5+ ans" />
                                    </FormField>
                                    <FormField label="Éducation (Français)">
                                        <Input {...register('requirements_education_fr')} placeholder="ex: Licence" />
                                    </FormField>
                                </div>
                                <FormField label="Compétences (Français)" hint="Séparez par des virgules">
                                    <Textarea {...register('skills_fr')} placeholder="JavaScript, React, Node.js, Python..." />
                                </FormField>
                            </div>
                        )}
                    </FormSection>
                )}

                {/* Job Image */}
                <FormSection title="Job Image" icon={Upload} badge="Optional" defaultOpen={false}>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 transition-colors hover:border-blue-400 hover:bg-blue-50/30">
                        {imagePreview ? (
                            <div className="relative inline-block">
                                <Image
                                    src={imagePreview}
                                    alt="Job preview"
                                    width={300}
                                    height={200}
                                    className="rounded-lg object-cover shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center cursor-pointer py-4">
                                <div className="p-4 bg-gray-100 rounded-full mb-3">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Click to upload job image</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </FormSection>

                {/* Job Details - Primary Information */}
                <FormSection title="Job Details" icon={FileText} defaultOpen={true}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('jobs.form.jobTitle') || 'Job Title'} required error={errors.title?.message}>
                            <Input {...register('title')} placeholder="e.g. Senior Software Engineer" className="w-full" />
                        </FormField>
                    </div>
                    <FormField label={t('jobs.form.description') || 'Description'} required error={errors.description?.message}>
                        <Textarea
                            {...register('description')}
                            placeholder="Provide a detailed description of the job role, expectations, and what makes this opportunity unique..."
                            className="min-h-[150px]"
                        />
                    </FormField>
                </FormSection>

                {/* Company Information */}
                <FormSection title="Company Information" icon={Building2} badge="Optional" defaultOpen={false}>
                    <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                        💡 Company information is optional. Leave blank if you prefer not to display company details.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('jobs.form.companyName') || 'Company Name'}>
                            <Input {...register('company.name')} placeholder="e.g. Acme Corporation" />
                        </FormField>
                        <FormField label="Company Website">
                            <Input {...register('company.website')} placeholder="https://example.com" />
                        </FormField>
                    </div>
                    <FormField label="Company Description">
                        <Textarea {...register('company.description')} placeholder="Brief description of the company..." />
                    </FormField>
                </FormSection>

                {/* Classification */}
                <FormSection title="Classification" icon={ClipboardList} defaultOpen={true}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label={t('jobs.form.category') || 'Category'} required error={errors.category?.message}>
                            <Select {...register('category')} className="w-full">
                                <option value="">Select Category</option>
                                <option value="technical">{t('jobs.categories.technical') || 'Technical'}</option>
                                <option value="hse">{t('jobs.categories.hse') || 'HSE'}</option>
                                <option value="corporate">{t('jobs.categories.corporate') || 'Corporate'}</option>
                                <option value="executive">{t('jobs.categories.executive') || 'Executive'}</option>
                                <option value="operations">{t('jobs.categories.operations') || 'Operations'}</option>
                            </Select>
                        </FormField>

                        <FormField label={t('jobs.form.sector') || 'Sector'} required error={errors.sector?.message}>
                            <Select {...register('sector')} className="w-full">
                                <option value="">Select Sector</option>
                                <option value="oil-gas">{t('jobs.sectors.oil-gas') || 'Oil & Gas'}</option>
                                <option value="renewable">{t('jobs.sectors.renewable') || 'Renewable Energy'}</option>
                                <option value="both">{t('jobs.sectors.both') || 'Both'}</option>
                            </Select>
                        </FormField>

                        <FormField label={t('jobs.form.workingType') || 'Working Type'} required error={errors.workingType?.message}>
                            <Select {...register('workingType')} className="w-full">
                                <option value="">Select Type</option>
                                <option value="full-time">{t('jobs.types.full-time') || 'Full Time'}</option>
                                <option value="part-time">{t('jobs.types.part-time') || 'Part Time'}</option>
                                <option value="contract">{t('jobs.types.contract') || 'Contract'}</option>
                                <option value="remote">{t('jobs.types.remote') || 'Remote'}</option>
                                <option value="hybrid">{t('jobs.types.hybrid') || 'Hybrid'}</option>
                            </Select>
                        </FormField>
                    </div>
                </FormSection>

                {/* Location */}
                <FormSection title="Location" icon={MapPin} defaultOpen={true}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label={t('jobs.form.city') || 'City'} required error={errors.location?.city?.message}>
                            <Input {...register('location.city')} placeholder="e.g. Dubai" />
                        </FormField>
                        <FormField label={t('jobs.form.country') || 'Country'} required error={errors.location?.country?.message}>
                            <Input {...register('location.country')} placeholder="e.g. UAE" />
                        </FormField>
                        <FormField label={t('jobs.form.region') || 'Region'} required error={errors.location?.region?.message}>
                            <Input {...register('location.region')} placeholder="e.g. Middle East" />
                        </FormField>
                    </div>
                </FormSection>

                {/* Salary */}
                <FormSection title="Salary Range" icon={DollarSign} badge="Optional" defaultOpen={false}>
                    <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                        💰 Adding salary information helps attract qualified candidates. Leave blank if salary is negotiable.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label={t('jobs.form.salaryMin') || 'Minimum Salary'}>
                            <Input type="number" {...register('salary.min')} placeholder="e.g. 50000" />
                        </FormField>
                        <FormField label={t('jobs.form.salaryMax') || 'Maximum Salary'}>
                            <Input type="number" {...register('salary.max')} placeholder="e.g. 80000" />
                        </FormField>
                        <FormField label={t('jobs.form.currency') || 'Currency'}>
                            <Input {...register('salary.currency')} placeholder="USD" />
                        </FormField>
                    </div>
                </FormSection>

                {/* Requirements */}
                <FormSection title="Requirements" icon={GraduationCap} defaultOpen={true}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Experience" required error={errors.requirements?.experience?.message}>
                            <Input {...register('requirements.experience')} placeholder="e.g. 5+ years in software development" />
                        </FormField>
                        <FormField label="Education" required error={errors.requirements?.education?.message}>
                            <Input {...register('requirements.education')} placeholder="e.g. Bachelor's in Computer Science" />
                        </FormField>
                    </div>
                    <FormField label="Skills" required error={errors.requirements?.skills?.message} hint="Separate skills with commas">
                        <Textarea {...register('requirements.skills')} placeholder="e.g. JavaScript, React, Node.js, Python, AWS" />
                    </FormField>
                </FormSection>

                {/* Responsibilities */}
                <FormSection title="Responsibilities" icon={ClipboardList} defaultOpen={true}>
                    <FormField
                        label={t('jobs.form.responsibilities') || 'Key Responsibilities'}
                        required
                        error={errors.responsibilities?.message}
                        hint="Separate each responsibility with a comma"
                    >
                        <Textarea
                            {...register('responsibilities')}
                            placeholder="e.g. Lead development projects, Mentor junior developers, Conduct code reviews, Collaborate with product team..."
                            className="min-h-[120px]"
                        />
                    </FormField>
                </FormSection>

                {/* Submit Button */}
                <div className="sticky bottom-4 z-10">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                        disabled={loading || uploadingImage}
                    >
                        {loading || uploadingImage ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Briefcase className="mr-2 h-5 w-5" />
                        )}
                        {uploadingImage ? 'Uploading Image...' : loading ? 'Creating Job...' : (t('jobs.form.submit') || 'Create Job Posting')}
                    </Button>
                </div>
            </form>

            {/* Add fadeIn animation styles */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
