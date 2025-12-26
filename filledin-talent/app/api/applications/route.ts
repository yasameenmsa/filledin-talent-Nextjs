import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();
        const { jobId, cvUrl, coverLetter } = data;

        // Check if job exists and is active
        const job = await Job.findById(jobId);
        if (!job || job.status !== 'active') {
            return NextResponse.json({ error: 'Job not found or closed' }, { status: 404 });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: session.user.id,
        });

        if (existingApplication) {
            return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 });
        }

        const application = await Application.create({
            job: jobId,
            applicant: session.user.id,
            cvUrl,
            coverLetter,
            status: 'pending',
        });

        // Increment application count on Job
        job.applicationCount += 1;
        await job.save();

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error('Error creating application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const applicationsObject = await Application.find({ applicant: session.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
                path: 'job',
                populate: { path: 'company' }
            });

        const totalApplications = await Application.countDocuments({ applicant: session.user.id });

        return NextResponse.json({
            applications: applicationsObject,
            stats: { totalApplications }
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
