import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import SavedJob from '@/models/SavedJob';
import Job from '@/models/Job';
import Link from 'next/link';
import JobImage from '@/components/jobs/JobImage';
import { redirect } from 'next/navigation';
import { MapPin, Briefcase, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getJobTranslation } from '@/lib/utils/getJobTranslation';

async function getSavedJobs(userId: string) {
    await dbConnect();
    const savedJobs = await SavedJob.find({ userId })
        .populate({
            path: 'jobId',
            model: Job,
            select: 'title company location workingType createdAt salary description i18n imageUrl'
        })
        .sort({ createdAt: -1 });

    return savedJobs;
}

export default async function SavedJobsPage({ params }: { params: Promise<{ lang: string }> }) {
    const session = await auth();
    if (!session) redirect('/login');

    const { lang } = await params;
    const savedJobs = await getSavedJobs(session.user.id);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>

            <div className="grid grid-cols-1 gap-6">
                {savedJobs.length > 0 ? (
                    savedJobs.map((item: any) => {
                        const job = item.jobId;
                        if (!job) return null; // Handle deleted jobs

                        const translatedJob = getJobTranslation(job, lang);

                        return (
                            <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
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
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-xl font-bold text-blue-900 hover:underline">
                                                    <Link href={`/${lang}/jobs/${job._id}`}>
                                                        {translatedJob.title}
                                                    </Link>
                                                </h2>
                                                <p className="text-gray-600 font-medium">{job.company.name}</p>
                                            </div>

                                            {/* Unsave Button (Client Component needed for interactivity, but for now just a link or form) */}
                                            {/* Ideally this should be a client component to call DELETE API */}
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
                                        </div>

                                        <p className="mt-4 text-gray-600 line-clamp-2">
                                            {translatedJob.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[150px] justify-center">
                                        <Link href={`/${lang}/jobs/${job._id}/apply`}>
                                            <Button className="w-full bg-blue-900 hover:bg-blue-800">
                                                Apply Now
                                            </Button>
                                        </Link>
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
                        <h3 className="text-lg font-medium text-gray-900">No saved jobs</h3>
                        <p className="text-gray-500 mt-2">Jobs you save will appear here</p>
                        <Link href={`/${lang}/jobs`} className="mt-4 inline-block text-blue-600 hover:underline">
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
