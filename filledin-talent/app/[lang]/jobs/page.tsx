import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Briefcase, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobSearchSection from '@/components/sections/JobSearchSection';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';

export const metadata: Metadata = {
    title: 'Job Search | FilledIn Talent',
    description: 'Search for jobs in the energy sector.',
};

interface JobsPageProps {
    params: Promise<{
        lang: string;
    }>;
    searchParams: Promise<{
        q?: string;
        category?: string;
        workingType?: string;
        location?: string;
        page?: string;
    }>;
}

interface JobSearchParams {
    q?: string;
    category?: string;
    workingType?: string;
    location?: string;
    page?: string;
}

async function getJobs(searchParams: JobSearchParams) {
    const params = new URLSearchParams();
    if (searchParams.q) params.append('q', searchParams.q);
    if (searchParams.category) params.append('category', searchParams.category);
    if (searchParams.workingType) params.append('workingType', searchParams.workingType);
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.page) params.append('page', searchParams.page);

    // In a real app, you might call the DB directly here since it's a server component,
    // but calling the API is also fine for separation of concerns or if the API is external.
    // For this local setup, we'll use the absolute URL if possible, or just fetch relative if we were client-side.
    // Since this is server-side, we need a full URL. 
    // However, calling our own API route from a server component during build/runtime can be tricky with base URLs.
    // It's often better to call the DB logic directly.
    // Let's try to fetch from the API using a helper or just duplicate the logic for now to ensure it works without base URL issues.
    // Actually, let's just use the DB logic directly here for simplicity and performance.

    const { headers } = await import('next/headers');
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    try {
        const res = await fetch(`${protocol}://${host}/api/jobs?${params.toString()}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch jobs');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return { jobs: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } };
    }
}

export default async function JobsPage({ params, searchParams }: JobsPageProps) {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const normalizedSearchParams = {
        q: resolvedSearchParams.q,
        category: resolvedSearchParams.category,
        workingType: resolvedSearchParams.workingType,
        location: resolvedSearchParams.location,
        page: resolvedSearchParams.page,
    };
    const data = await getJobs(normalizedSearchParams);
    const { jobs, pagination } = data;

    // Fetch user's applied jobs
    const session = await auth();
    const appliedJobIds = new Set<string>();

    if (session?.user?.id) {
        await dbConnect();
        const applications = await Application.find({
            applicant: session.user.id
        }).select('job');

        applications.forEach(app => {
            if (app.job) {
                appliedJobIds.add(app.job.toString());
            }
        });
    }

    // Import helper dynamically to avoid server/client issues if any
    const { getJobTranslation } = await import('@/lib/utils/getJobTranslation');

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <JobSearchSection />

            <div className="container mx-auto px-4 mt-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">
                    {pagination.total} Jobs Found
                </h1>

                <div className="grid grid-cols-1 gap-6">
                    {jobs.length > 0 ? (
                        jobs.map((job: any) => {
                            const translatedJob = getJobTranslation(job, lang);

                            return (
                                <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Job Image */}
                                        {job.imageUrl && (
                                            <div className="w-full md:w-48 h-32 flex-shrink-0">
                                                <img
                                                    src={job.imageUrl}
                                                    alt={translatedJob.title}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h2 className="text-xl font-bold text-blue-900 hover:underline">
                                                        <Link href={`/${lang}/jobs/${job._id}`}>
                                                            {translatedJob.title}
                                                        </Link>
                                                    </h2>
                                                    <p className="text-gray-600 font-medium">{job.company.name}</p>
                                                </div>
                                                {job.featured && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
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
                                                {job.salary?.display && (
                                                    <div className="flex items-center text-green-700 font-medium">
                                                        <DollarSign className="w-4 h-4 mr-1" />
                                                        {job.salary.min && job.salary.max
                                                            ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                                                            : 'Competitive'}
                                                    </div>
                                                )}
                                            </div>

                                            <p className="mt-4 text-gray-600 line-clamp-2">
                                                {translatedJob.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[150px] justify-center">
                                            {appliedJobIds.has(job._id.toString()) ? (
                                                <Button disabled className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Applied
                                                </Button>
                                            ) : (
                                                <Link href={`/${lang}/jobs/${job._id}/apply`}>
                                                    <Button className="w-full bg-blue-900 hover:bg-blue-800">
                                                        Apply Now
                                                    </Button>
                                                </Link>
                                            )}
                                            <Link href={`/${lang}/jobs/${job._id}`}>
                                                <Button variant="outline" className="w-full">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Simple Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={`/${lang}/jobs?page=${p}&q=${resolvedSearchParams.q || ''}&category=${resolvedSearchParams.category || ''}&location=${resolvedSearchParams.location || ''}`}
                            >
                                <Button
                                    variant={p === pagination.page ? 'default' : 'outline'}
                                    size="sm"
                                >
                                    {p}
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
