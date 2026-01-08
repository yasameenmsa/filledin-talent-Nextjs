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
    const { status, featured, urgent } = body;

    const updateData: any = {};

    if (status) {
      if (!['active', 'closed', 'draft'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be active, closed, or draft' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    if (urgent !== undefined) {
      updateData.urgent = urgent;
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Job updated successfully',
      job: {
        id: (job._id as any).toString(),
        title: job.title,
        status: job.status,
        featured: job.featured,
        urgent: job.urgent,
      },
    });
  } catch (error) {
    console.error('Error updating job:', error);
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