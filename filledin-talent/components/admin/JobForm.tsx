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
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

const jobSchema = z.object({
    // Default fields (required for backward compatibility)
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),

    // Multi-language fields (optional)
    title_en: z.string().optional(),
    description_en: z.string().optional(),
    responsibilities_en: z.string().optional(),
    requirements_experience_en: z.string().optional(),
    requirements_education_en: z.string().optional(),

    title_ar: z.string().optional(),
    description_ar: z.string().optional(),
    responsibilities_ar: z.string().optional(),
    requirements_experience_ar: z.string().optional(),
    requirements_education_ar: z.string().optional(),

    title_fr: z.string().optional(),
    description_fr: z.string().optional(),
    responsibilities_fr: z.string().optional(),
    requirements_experience_fr: z.string().optional(),
    requirements_education_fr: z.string().optional(),

    company: z.object({
        name: z.string().min(2, 'Company name is required'),
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

export default function JobForm({ lang }: { lang: string }) {
    const { t } = useTranslation(lang);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
                company: data.company,
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

            // Build i18n object
            const i18n: Record<string, unknown> = {};

            // English translations
            if (data.title_en || data.description_en || data.responsibilities_en || data.requirements_experience_en || data.requirements_education_en) {
                i18n.en = {
                    title: data.title_en,
                    description: data.description_en,
                    responsibilities: data.responsibilities_en ? data.responsibilities_en.split(',').map(r => r.trim()) : undefined,
                    requirements: {
                        experience: data.requirements_experience_en,
                        education: data.requirements_education_en,
                    },
                };
            }

            // Arabic translations
            if (data.title_ar || data.description_ar || data.responsibilities_ar || data.requirements_experience_ar || data.requirements_education_ar) {
                i18n.ar = {
                    title: data.title_ar,
                    description: data.description_ar,
                    responsibilities: data.responsibilities_ar ? data.responsibilities_ar.split(',').map(r => r.trim()) : undefined,
                    requirements: {
                        experience: data.requirements_experience_ar,
                        education: data.requirements_education_ar,
                    },
                };
            }

            // French translations
            if (data.title_fr || data.description_fr || data.responsibilities_fr || data.requirements_experience_fr || data.requirements_education_fr) {
                i18n.fr = {
                    title: data.title_fr,
                    description: data.description_fr,
                    responsibilities: data.responsibilities_fr ? data.responsibilities_fr.split(',').map(r => r.trim()) : undefined,
                    requirements: {
                        experience: data.requirements_experience_fr,
                        education: data.requirements_education_fr,
                    },
                };
            }

            // Add i18n if any translations were provided
            if (Object.keys(i18n).length > 0) {
                apiData.i18n = i18n;
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

            router.push(`/${lang}/jobs`);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'en', label: 'English' },
        { id: 'ar', label: 'العربية' },
        { id: 'fr', label: 'Français' },
    ] as const;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold">{t('jobs.form.title')}</h1>

            {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}

            {/* Image Upload */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Job Image (Optional)</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {imagePreview ? (
                        <div className="relative">
                            <Image
                                src={imagePreview}
                                alt="Job preview"
                                width={300}
                                height={200}
                                className="rounded-lg object-cover"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Click to upload job image</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Multi-Language Tabs */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Job Details (Multi-Language)</h2>

                {/* Tab Headers */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                                ? 'border-b-2 border-blue-900 text-blue-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content - English */}
                {activeTab === 'en' && (
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Job Title (English)</label>
                            <Input {...register('title_en')} placeholder="e.g. Senior Developer" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (English)</label>
                            <Textarea {...register('description_en')} placeholder="Job Description" className="min-h-[100px]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Responsibilities (English, comma separated)</label>
                            <Textarea {...register('responsibilities_en')} placeholder="Lead development, Mentor team members, ..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Experience (English)</label>
                                <Input {...register('requirements_experience_en')} placeholder="e.g. 5+ years" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Education (English)</label>
                                <Input {...register('requirements_education_en')} placeholder="e.g. Bachelor's Degree" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content - Arabic */}
                {activeTab === 'ar' && (
                    <div className="space-y-4 pt-4" dir="rtl">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">المسمى الوظيفي (عربي)</label>
                            <Input {...register('title_ar')} placeholder="مثال: مطور أول" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">الوصف (عربي)</label>
                            <Textarea {...register('description_ar')} placeholder="وصف الوظيفة" className="min-h-[100px]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">المسؤوليات (عربي، مفصولة بفواصل)</label>
                            <Textarea {...register('responsibilities_ar')} placeholder="قيادة التطوير، توجيه الفريق، ..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">الخبرة (عربي)</label>
                                <Input {...register('requirements_experience_ar')} placeholder="مثال: 5+ سنوات" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">التعليم (عربي)</label>
                                <Input {...register('requirements_education_ar')} placeholder="مثال: درجة البكالوريوس" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content - French */}
                {activeTab === 'fr' && (
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Titre du Poste (Français)</label>
                            <Input {...register('title_fr')} placeholder="ex: Développeur Senior" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Français)</label>
                            <Textarea {...register('description_fr')} placeholder="Description du poste" className="min-h-[100px]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Responsabilités (Français, séparées par des virgules)</label>
                            <Textarea {...register('responsibilities_fr')} placeholder="Diriger le développement, Encadrer l'équipe, ..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expérience (Français)</label>
                                <Input {...register('requirements_experience_fr')} placeholder="ex: 5+ ans" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Éducation (Français)</label>
                                <Input {...register('requirements_education_fr')} placeholder="ex: Licence" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Default/Fallback Fields */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">General Information (Required)</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> These fields are required as fallback values. Fill them in English or your preferred default language.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.jobTitle')} *</label>
                        <Input {...register('title')} placeholder="e.g. Senior Developer" />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.companyName')} *</label>
                        <Input {...register('company.name')} placeholder="Company Name" />
                        {errors.company?.name && <p className="text-red-500 text-sm">{errors.company.name.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('jobs.form.description')} *</label>
                    <Textarea {...register('description')} placeholder="Job Description" className="min-h-[100px]" />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.category')} *</label>
                        <Select {...register('category')}>
                            <option value="">Select Category</option>
                            <option value="technical">{t('jobs.categories.technical')}</option>
                            <option value="hse">{t('jobs.categories.hse')}</option>
                            <option value="corporate">{t('jobs.categories.corporate')}</option>
                            <option value="executive">{t('jobs.categories.executive')}</option>
                            <option value="operations">{t('jobs.categories.operations')}</option>
                        </Select>
                        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.sector')} *</label>
                        <Select {...register('sector')}>
                            <option value="">Select Sector</option>
                            <option value="oil-gas">{t('jobs.sectors.oil-gas')}</option>
                            <option value="renewable">{t('jobs.sectors.renewable')}</option>
                            <option value="both">{t('jobs.sectors.both')}</option>
                        </Select>
                        {errors.sector && <p className="text-red-500 text-sm">{errors.sector.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.workingType')} *</label>
                        <Select {...register('workingType')}>
                            <option value="">Select Type</option>
                            <option value="full-time">{t('jobs.types.full-time')}</option>
                            <option value="part-time">{t('jobs.types.part-time')}</option>
                            <option value="contract">{t('jobs.types.contract')}</option>
                            <option value="remote">{t('jobs.types.remote')}</option>
                            <option value="hybrid">{t('jobs.types.hybrid')}</option>
                        </Select>
                        {errors.workingType && <p className="text-red-500 text-sm">{errors.workingType.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.city')} *</label>
                        <Input {...register('location.city')} placeholder="City" />
                        {errors.location?.city && <p className="text-red-500 text-sm">{errors.location.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.country')} *</label>
                        <Input {...register('location.country')} placeholder="Country" />
                        {errors.location?.country && <p className="text-red-500 text-sm">{errors.location.country.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.region')} *</label>
                        <Input {...register('location.region')} placeholder="Region" />
                        {errors.location?.region && <p className="text-red-500 text-sm">{errors.location.region.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.salaryMin')}</label>
                        <Input type="number" {...register('salary.min')} placeholder="Min" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.salaryMax')}</label>
                        <Input type="number" {...register('salary.max')} placeholder="Max" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.currency')}</label>
                        <Input {...register('salary.currency')} placeholder="USD" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('jobs.form.requirements')} *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input {...register('requirements.experience')} placeholder="Experience (e.g. 5+ years)" />
                        <Input {...register('requirements.education')} placeholder="Education (e.g. Bachelor's)" />
                    </div>
                    <Textarea {...register('requirements.skills')} placeholder="Skills (comma separated)" className="mt-2" />
                    {errors.requirements?.skills && <p className="text-red-500 text-sm">{errors.requirements.skills.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('jobs.form.responsibilities')} *</label>
                    <Textarea {...register('responsibilities')} placeholder="Responsibilities (comma separated)" />
                    {errors.responsibilities && <p className="text-red-500 text-sm">{errors.responsibilities.message}</p>}
                </div>
            </div>

            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={loading || uploadingImage}>
                {loading || uploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {uploadingImage ? 'Uploading Image...' : loading ? 'Creating Job...' : t('jobs.form.submit')}
            </Button>
        </form>
    );
}
