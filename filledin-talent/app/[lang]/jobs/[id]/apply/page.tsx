import React from 'react';
import { Metadata } from 'next';
import ApplicationForm from '@/components/forms/ApplicationForm';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Apply for Job | FilledIn Talent',
    description: 'Submit your application.',
};

interface ApplyPageProps {
    params: Promise<{
        lang: string;
        id: string;
    }>;
}

async function getJob(id: string) {
    await dbConnect();
    try {
        const job = await Job.findById(id).select('title company');
        if (!job) return null;
        return JSON.parse(JSON.stringify(job));
    } catch (_error) {
        return null;
    }
}

export default async function ApplyPage({ params }: ApplyPageProps) {
    const { lang, id } = await params;
    const job = await getJob(id);

    if (!job) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Apply for {job.title}
                        </h1>
                        <p className="text-gray-600">
                            {job.company?.name ? `at ${job.company.name}` : ''}
                        </p>
                    </div>

                    <ApplicationForm jobId={id} lang={lang} />
                </div>
            </div>
        </div>
    );
}
