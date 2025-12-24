import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { FileText, Building, MapPin } from 'lucide-react';
import { getJobTranslation } from '@/lib/utils/getJobTranslation';

async function getMyApplications(userId: string) {
    await dbConnect();
    const applications = await Application.find({ applicant: userId })
        .populate({
            path: 'job',
            model: Job,
            select: 'title company location i18n'
        })
        .sort({ createdAt: -1 });

    return applications;
}

export default async function MyApplicationsPage({ params }: { params: Promise<{ lang: string }> }) {
    const session = await auth();
    if (!session) redirect('/login');

    const { lang } = await params;
    const applications = await getMyApplications(session.user.id);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'interviews': return 'bg-blue-100 text-blue-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Applications</h1>

            <div className="grid grid-cols-1 gap-6">
                {applications.length > 0 ? (
                    applications.map((app: any) => {
                        const job = app.job;
                        if (!job) return null; // Handle deleted jobs

                        const translatedJob = getJobTranslation(job, lang);

                        return (
                            <div key={app._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-blue-900 mb-1">
                                            <Link href={`/${lang}/jobs/${job._id}`} className="hover:underline">
                                                {translatedJob.title}
                                            </Link>
                                        </h2>
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <Building className="w-4 h-4 mr-1" />
                                            {job.company.name}
                                            <span className="mx-2">•</span>
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {job.location.city}, {job.location.country}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Applied on {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={getStatusColor(app.status)}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </Badge>

                                        <a
                                            href={app.cvUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-blue-600 hover:underline mt-2"
                                        >
                                            <FileText className="w-4 h-4 mr-1" />
                                            View Submitted CV
                                        </a>
                                    </div>
                                </div>

                                {app.statusHistory && app.statusHistory.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Status History</h3>
                                        <div className="space-y-2">
                                            {app.statusHistory.map((history: any, idx: number) => (
                                                <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                                    <span>{history.status}</span>
                                                    <span className="text-gray-400">{new Date(history.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
                        <p className="text-gray-500 mt-2">Jobs you apply for will appear here</p>
                        <Link href={`/${lang}/jobs`} className="mt-4 inline-block text-blue-600 hover:underline">
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
