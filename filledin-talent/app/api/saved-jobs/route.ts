import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import SavedJob from '@/models/SavedJob';
import Job from '@/models/Job';

// GET: Fetch all saved jobs for the logged-in user
export async function GET(_req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const savedJobsDocs = await SavedJob.find({ userId: session.user.id })
            .populate('jobId')
            .sort({ createdAt: -1 })
            .lean();

        const savedJobs = savedJobsDocs.map((doc: any) => ({
            _id: doc._id,
            job: {
                ...doc.jobId,
                postedAt: doc.jobId.createdAt // Map createdAt to postedAt
            },
            savedAt: doc.createdAt,
        }));

        return NextResponse.json({ savedJobs }, { status: 200 });
    } catch (error) {
        console.error('Error fetching saved jobs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Save a job
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { jobId } = await req.json();

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Check if already saved
        const existingSavedJob = await SavedJob.findOne({
            userId: session.user.id,
            jobId,
        });

        if (existingSavedJob) {
            return NextResponse.json({ error: 'Job already saved' }, { status: 400 });
        }

        const savedJob = await SavedJob.create({
            userId: session.user.id,
            jobId,
        });

        return NextResponse.json({ savedJob }, { status: 201 });
    } catch (error) {
        console.error('Error saving job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove a saved job
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const result = await SavedJob.deleteOne({
            userId: session.user.id,
            jobId,
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Saved job not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Job unsaved successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting saved job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
