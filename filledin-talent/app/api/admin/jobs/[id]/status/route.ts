import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Job from '@/models/Job';

// PUT - Update job status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const jobId = resolvedParams.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!['active', 'closed', 'draft'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, closed, or draft' },
        { status: 400 }
      );
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: { status } },
      { new: true }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Job status updated successfully',
      job: {
        id: (job._id as any).toString(),
        title: job.title,
        status: job.status,
      },
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

