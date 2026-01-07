import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const job = await Job.findById(id).populate('postedBy', 'name email');

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Increment view count
        job.viewCount += 1;
        await job.save();

        return NextResponse.json(job);
    } catch (error: any) {
        console.error('Error fetching job:', error);

        if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
            return NextResponse.json({ error: 'Database Connection Error. Please try again later.' }, { status: 503 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
