import { notFound } from 'next/navigation';
import { MapPin, Briefcase, Clock, DollarSign, Calendar, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SaveJobButton from '@/components/jobs/SaveJobButton';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import SavedJob from '@/models/SavedJob';

// Helper to fetch job
async function getJob(id: string) {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    try {
        const res = await fetch(`${protocol}://${host}/api/jobs/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Error fetching job:', error);
        return null;
    }
}

export default async function JobDetailsPage({
    params,
}: {
    params: Promise<{ lang: string; id: string }>;
}) {
    const { lang, id } = await params;
    const job = await getJob(id);
    const session = await auth();

    let hasApplied = false;
    let hasSaved = false;
    if (session?.user?.id) {
        await dbConnect();
        const existingApplication = await Application.findOne({
            job: id,
            applicant: session.user.id
        });
        hasApplied = !!existingApplication;

        const existingSavedJob = await SavedJob.findOne({
            jobId: id,
            userId: session.user.id
        });
        hasSaved = !!existingSavedJob;
    }

    if (!job) {
        notFound();
    }

    // Import helper dynamically
    const { getJobTranslation } = await import('@/lib/utils/getJobTranslation');
    const translatedJob = getJobTranslation(job, lang);

    // Page translations
    const translations: Record<string, Record<string, string>> = {
        description: {
            en: 'Description',
            ar: 'الوصف',
            fr: 'Description'
        },
        requirements: {
            en: 'Requirements',
            ar: 'المتطلبات',
            fr: 'Exigences'
        },
        experience: {
            en: 'Experience',
            ar: 'الخبرة',
            fr: 'Expérience'
        },
        education: {
            en: 'Education',
            ar: 'التعليم',
            fr: 'Éducation'
        },
        skills: {
            en: 'Skills',
            ar: 'المهارات',
            fr: 'Compétences'
        },
        responsibilities: {
            en: 'Responsibilities',
            ar: 'المسؤوليات',
            fr: 'Responsabilités'
        },
        salaryBenefits: {
            en: 'Salary & Benefits',
            ar: 'الراتب والمزايا',
            fr: 'Salaire et Avantages'
        },
        competitiveSalary: {
            en: 'Competitive Salary',
            ar: 'راتب تنافسي',
            fr: 'Salaire Compétitif'
        },
        applied: {
            en: 'Applied',
            ar: 'تم التقديم',
            fr: 'Postulé'
        },
        applyNow: {
            en: 'Apply Now',
            ar: 'تقدم الآن',
            fr: 'Postuler'
        },
        loginToApply: {
            en: 'Login to apply',
            ar: 'سجل الدخول للتقديم',
            fr: 'Connectez-vous pour postuler'
        },
        register: {
            en: 'Register',
            ar: 'تسجيل حساب',
            fr: 'S\'inscrire'
        },
        or: {
            en: 'or',
            ar: 'أو',
            fr: 'ou'
        }
    };

    const getLabel = (key: string) => {
        return translations[key]?.[lang] || translations[key]?.['en'] || key;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Job Image */}
                    {job.imageUrl && (
                        <div className="w-full h-64 relative">
                            <Image
                                src={job.imageUrl}
                                alt={translatedJob.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Header */}
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{translatedJob.title}</h1>
                                <div className="flex items-center text-lg text-blue-900 font-medium mb-4">
                                    <Building className="w-5 h-5 mr-2" />
                                    {job.company.name}
                                </div>

                                <div className="flex flex-wrap gap-4 text-gray-600">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {job.location.city}, {job.location.country}
                                    </div>
                                    <div className="flex items-center">
                                        <Briefcase className="w-4 h-4 mr-1" />
                                        {job.workingType}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px]">
                                {session ? (
                                    <>
                                        {hasApplied ? (
                                            <button
                                                disabled
                                                className="w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold cursor-not-allowed opacity-90"
                                            >
                                                {getLabel('applied')}
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/${lang}/jobs/${job._id}/apply`}
                                                className="w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                            >
                                                {getLabel('applyNow')}
                                            </Link>
                                        )}
                                        <SaveJobButton jobId={job._id} lang={lang} initialSaved={hasSaved} />
                                    </>
                                ) : (
                                    <div className="text-center p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                                        <a href={`/${lang}/login`} className="text-blue-600 hover:underline font-medium">
                                            {getLabel('loginToApply')}
                                        </a>
                                        <br />
                                        <span className="text-xs">{getLabel('or')}</span>
                                        <br />
                                        <a href={`/${lang}/register`} className="text-blue-600 hover:underline font-medium">
                                            {getLabel('register')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Description */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{getLabel('description')}</h2>
                            <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                                {translatedJob.description}
                            </div>
                        </section>

                        {/* Requirements */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{getLabel('requirements')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">{getLabel('experience')}</h3>
                                    <p className="text-gray-600">{translatedJob.requirements.experience}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">{getLabel('education')}</h3>
                                    <p className="text-gray-600">{translatedJob.requirements.education}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">{getLabel('skills')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {translatedJob.requirements.skills.map((skill: string, index: number) => (
                                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Responsibilities */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{getLabel('responsibilities')}</h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-600">
                                {translatedJob.responsibilities.map((resp: string, index: number) => (
                                    <li key={index}>{resp}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Salary */}
                        {job.salary?.display && (
                            <section className="bg-green-50 p-6 rounded-lg border border-green-100">
                                <h2 className="text-lg font-bold text-green-900 mb-2 flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    {getLabel('salaryBenefits')}
                                </h2>
                                <p className="text-green-800 font-medium text-lg">
                                    {job.salary.min && job.salary.max
                                        ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                                        : getLabel('competitiveSalary')}
                                </p>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
