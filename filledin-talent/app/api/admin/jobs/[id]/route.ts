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
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['active', 'closed', 'draft', 'pending', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, closed, draft, pending, rejected' },
        { status: 400 }
      );
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          status,
          ...(status === 'rejected' && reason && { rejectionReason: reason }),
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('postedBy', 'name email');

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Job status updated successfully',
      job: {
        id: job._id.toString(),
        title: job.title,
        status: job.status,
        updatedAt: job.updatedAt,
        postedBy: job.postedBy,
        rejectionReason: job.rejectionReason,
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

// DELETE - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    const job = await Job.findByIdAndDelete(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
