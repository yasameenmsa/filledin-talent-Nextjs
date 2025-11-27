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
import { Loader2 } from 'lucide-react';

const jobSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
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

    const { register, handleSubmit, formState: { errors } } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema) as any,
        defaultValues: {
            salary: { currency: 'USD' },
        },
    });

    const onSubmit: SubmitHandler<JobFormData> = async (data) => {
        setLoading(true);
        setError('');

        try {
            // Transform data for API
            const apiData = {
                ...data,
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

            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData),
            });

            if (!res.ok) {
                throw new Error('Failed to create job');
            }

            router.push(`/${lang}/jobs`);
            router.refresh();
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold">{t('jobs.form.title')}</h1>

            {error && <div className="text-red-500">{error}</div>}

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Job Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.jobTitle')}</label>
                        <Input {...register('title')} placeholder="e.g. Senior Developer" />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.companyName')}</label>
                        <Input {...register('company.name')} placeholder="Company Name" />
                        {errors.company?.name && <p className="text-red-500 text-sm">{errors.company.name.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('jobs.form.description')}</label>
                    <Textarea {...register('description')} placeholder="Job Description" className="min-h-[100px]" />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.category')}</label>
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
                        <label className="text-sm font-medium">{t('jobs.form.sector')}</label>
                        <Select {...register('sector')}>
                            <option value="">Select Sector</option>
                            <option value="oil-gas">{t('jobs.sectors.oil-gas')}</option>
                            <option value="renewable">{t('jobs.sectors.renewable')}</option>
                            <option value="both">{t('jobs.sectors.both')}</option>
                        </Select>
                        {errors.sector && <p className="text-red-500 text-sm">{errors.sector.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.workingType')}</label>
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
                        <label className="text-sm font-medium">{t('jobs.form.city')}</label>
                        <Input {...register('location.city')} placeholder="City" />
                        {errors.location?.city && <p className="text-red-500 text-sm">{errors.location.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.country')}</label>
                        <Input {...register('location.country')} placeholder="Country" />
                        {errors.location?.country && <p className="text-red-500 text-sm">{errors.location.country.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('jobs.form.region')}</label>
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
                    <label className="text-sm font-medium">{t('jobs.form.requirements')}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input {...register('requirements.experience')} placeholder="Experience (e.g. 5+ years)" />
                        <Input {...register('requirements.education')} placeholder="Education (e.g. Bachelor's)" />
                    </div>
                    <Textarea {...register('requirements.skills')} placeholder="Skills (comma separated)" className="mt-2" />
                    {errors.requirements?.skills && <p className="text-red-500 text-sm">{errors.requirements.skills.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('jobs.form.responsibilities')}</label>
                    <Textarea {...register('responsibilities')} placeholder="Responsibilities (comma separated)" />
                    {errors.responsibilities && <p className="text-red-500 text-sm">{errors.responsibilities.message}</p>}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('jobs.form.submit')}
            </Button>
        </form>
    );
}

