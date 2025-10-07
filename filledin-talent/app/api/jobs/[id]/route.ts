import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withEmployerAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/jobs/[id] - Get job by ID (public access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = params;

    const job = await Job.findById(id)
      .populate('postedBy', 'profile.firstName profile.lastName profile.company email')
      .lean();

    if (!job || job.isDeleted) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await Job.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return NextResponse.json(job);

  } catch (error) {
    console.error('GET /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Update job (employer who posted it or admin)
export const PUT = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Check if job exists
    const existingJob = await Job.findById(id);
    if (!existingJob || existingJob.isDeleted) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update this job
    if (user.role !== 'admin' && existingJob.postedBy.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this job' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Validate and update basic fields
    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json(
          { error: 'Job title is required' },
          { status: 400 }
        );
      }
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      if (!body.description.trim()) {
        return NextResponse.json(
          { error: 'Job description is required' },
          { status: 400 }
        );
      }
      updateData.description = body.description;
    }

    if (body.jobType !== undefined) {
      if (!['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(body.jobType)) {
        return NextResponse.json(
          { error: 'Invalid job type' },
          { status: 400 }
        );
      }
      updateData.jobType = body.jobType;
    }

    if (body.experienceLevel !== undefined) {
      if (!['entry', 'mid', 'senior', 'lead', 'executive'].includes(body.experienceLevel)) {
        return NextResponse.json(
          { error: 'Invalid experience level' },
          { status: 400 }
        );
      }
      updateData.experienceLevel = body.experienceLevel;
    }

    // Update arrays
    if (body.requirements !== undefined) {
      updateData.requirements = Array.isArray(body.requirements) ? body.requirements : [];
    }

    if (body.responsibilities !== undefined) {
      updateData.responsibilities = Array.isArray(body.responsibilities) ? body.responsibilities : [];
    }

    if (body.benefits !== undefined) {
      updateData.benefits = Array.isArray(body.benefits) ? body.benefits : [];
    }

    if (body.requiredSkills !== undefined) {
      updateData.requiredSkills = Array.isArray(body.requiredSkills) ? body.requiredSkills : [];
    }

    if (body.preferredSkills !== undefined) {
      updateData.preferredSkills = Array.isArray(body.preferredSkills) ? body.preferredSkills : [];
    }

    // Update company information
    if (body.company !== undefined) {
      updateData.company = {
        ...existingJob.company,
        ...body.company
      };
    }

    // Update location
    if (body.location !== undefined) {
      updateData.location = {
        ...existingJob.location,
        ...body.location
      };
    }

    // Update salary
    if (body.salary !== undefined) {
      updateData.salary = {
        ...existingJob.salary,
        ...body.salary
      };
    }

    // Update application deadline
    if (body.applicationDeadline !== undefined) {
      if (body.applicationDeadline && new Date(body.applicationDeadline) <= new Date()) {
        return NextResponse.json(
          { error: 'Application deadline must be in the future' },
          { status: 400 }
        );
      }
      updateData.applicationDeadline = body.applicationDeadline ? new Date(body.applicationDeadline) : null;
    }

    // Update active status (admin or job owner)
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    updateData.updatedAt = new Date();

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'profile.firstName profile.lastName profile.company email');

    if (!updatedJob) {
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedJob);

  } catch (error) {
    console.error('PUT /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
});

// DELETE /api/jobs/[id] - Soft delete job (employer who posted it or admin)
export const DELETE = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await dbConnect();

    const { id } = params;

    // Check if job exists
    const existingJob = await Job.findById(id);
    if (!existingJob || existingJob.isDeleted) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this job
    if (user.role !== 'admin' && existingJob.postedBy.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this job' },
        { status: 403 }
      );
    }

    // Soft delete the job
    const deletedJob = await Job.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.userId,
        isActive: false
      },
      { new: true }
    ).populate('postedBy', 'profile.firstName profile.lastName profile.company email');

    return NextResponse.json({
      message: 'Job deleted successfully',
      job: deletedJob
    });

  } catch (error) {
    console.error('DELETE /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
});