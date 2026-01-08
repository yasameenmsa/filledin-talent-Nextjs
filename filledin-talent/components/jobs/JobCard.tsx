'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobImage from '@/components/jobs/JobImage';
import { getJobTranslation } from '@/lib/utils/getJobTranslation';

interface JobCardProps {
    job: any;
    lang: string;
    isApplied?: boolean;
}

const JobCard = ({ job, lang, isApplied = false }: JobCardProps) => {
    const translatedJob = getJobTranslation(job, lang);

    // Helper to safely format date
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return '';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Job Image */}
                <div className="w-full md:w-48 h-32 flex-shrink-0 relative">
                    <JobImage
                        src={job.imageUrl}
                        alt={translatedJob.title}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 hover:underline">
                                <Link href={`/${lang}/jobs/${job._id}`}>
                                    {translatedJob.title}
                                </Link>
                            </h2>
                            <p className="text-gray-600 font-medium">{job.company?.name || 'Confidential'}</p>
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
                            {formatDate(job.createdAt)}
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
                    {isApplied ? (
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
};

export default JobCard;
