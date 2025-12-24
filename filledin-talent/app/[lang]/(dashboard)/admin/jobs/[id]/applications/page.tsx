import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';
import Application from '@/models/Application';
import JobApplicationsList from '@/components/admin/JobApplicationsList';
import { notFound, redirect } from 'next/navigation';

export default async function AdminJobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
        redirect('/login');
    }

    const { id } = await params;
    await dbConnect();

    const job = await Job.findById(id);
    if (!job) notFound();

    const applications = await Application.find({ job: id })
        .populate('applicant', 'name email')
        .sort({ createdAt: -1 });

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                <p className="text-gray-600">Managing applications for this job</p>
            </div>

            <JobApplicationsList
                jobId={id}
                initialApplications={JSON.parse(JSON.stringify(applications))}
            />
        </div>
    );
}
