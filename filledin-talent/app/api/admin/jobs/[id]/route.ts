import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Job from '@/models/Job';
import Application from '@/models/Application';
import SavedJob from '@/models/SavedJob';

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

// DELETE - Delete job and all related applications and saved jobs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    // First check if the job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Delete all applications for this job
    const deletedApplications = await Application.deleteMany({ job: jobId });
    console.log(`Deleted ${deletedApplications.deletedCount} applications for job ${jobId}`);

    // Delete all saved jobs for this job
    const deletedSavedJobs = await SavedJob.deleteMany({ jobId: jobId });
    console.log(`Deleted ${deletedSavedJobs.deletedCount} saved jobs for job ${jobId}`);

    // Now delete the job itself
    await Job.findByIdAndDelete(jobId);

    return NextResponse.json({
      message: 'Job and all related applications deleted successfully',
      deletedApplicationsCount: deletedApplications.deletedCount,
      deletedSavedJobsCount: deletedSavedJobs.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}