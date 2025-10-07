import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { FormValidator } from '@/lib/utils/validation';

// GET /api/applications/[id] - Get specific application
export const GET = withAuth(async (request, user, { params }) => {
  try {
    await dbConnect();

    const applicationId = params.id;

    const application = await Application.findById(applicationId)
      .populate({
        path: 'job',
        select: 'title company location workingType salary status postedBy',
        populate: {
          path: 'postedBy',
          select: 'profile.firstName profile.lastName profile.company email'
        }
      })
      .populate({
        path: 'applicant',
        select: 'profile.firstName profile.lastName email profile.cvUrl profile.phone'
      })
      .populate({
        path: 'statusHistory.updatedBy',
        select: 'profile.firstName profile.lastName email'
      });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const canAccess = 
      user.role === 'admin' ||
      (user.role === 'jobseeker' && application.applicant._id.toString() === user.userId) ||
      (user.role === 'employer' && application.job.postedBy._id.toString() === user.userId);

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ application });

  } catch (error) {
    console.error('GET /api/applications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
});

// PUT /api/applications/[id] - Update application status (employers/admins only)
export const PUT = withAuth(async (request, user, { params }) => {
  try {
    await dbConnect();

    const applicationId = params.id;
    const body = await request.json();

    // Find the application first
    const application = await Application.findById(applicationId)
      .populate('job', 'postedBy title');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check permissions - only employers who posted the job or admins can update
    const canUpdate = 
      user.role === 'admin' ||
      (user.role === 'employer' && application.job.postedBy.toString() === user.userId);

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { status, note, rating, interviewDetails } = body;

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = {};

    if (status && status !== application.status) {
      updateData.status = status;
      updateData.$push = {
        statusHistory: {
          status,
          date: new Date(),
          note: note || `Status changed to ${status}`,
          updatedBy: user.userId
        }
      };
    }

    if (rating !== undefined) {
      updateData.rating = rating;
    }

    if (note && !status) {
      updateData.notes = note;
    }

    if (interviewDetails) {
      // Validate interview details
      const validator = new FormValidator(interviewDetails);
      validator.required('date', 'Interview date is required');
      validator.required('type', 'Interview type is required');

      if (validator.hasErrors()) {
        return NextResponse.json(
          { error: 'Invalid interview details', details: validator.getErrors() },
          { status: 400 }
        );
      }

      updateData.$push = {
        ...updateData.$push,
        interviewDetails: {
          ...interviewDetails,
          date: new Date(interviewDetails.date)
        }
      };
    }

    // Update the application
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'job',
        select: 'title company location'
      })
      .populate({
        path: 'applicant',
        select: 'profile.firstName profile.lastName email'
      })
      .populate({
        path: 'statusHistory.updatedBy',
        select: 'profile.firstName profile.lastName'
      });

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('PUT /api/applications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
});

// DELETE /api/applications/[id] - Withdraw application (job seekers only)
export const DELETE = withAuth(async (request, user, { params }) => {
  try {
    await dbConnect();

    const applicationId = params.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'postedBy title');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check permissions - only the applicant can withdraw their application
    if (user.role !== 'jobseeker' || application.applicant.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if application can be withdrawn
    if (['offered', 'rejected'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Cannot withdraw application at this stage' },
        { status: 400 }
      );
    }

    // Update status to withdrawn
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        status: 'withdrawn',
        $push: {
          statusHistory: {
            status: 'withdrawn',
            date: new Date(),
            note: 'Application withdrawn by applicant',
            updatedBy: user.userId
          }
        }
      },
      { new: true }
    );

    // Decrease job application count
    await Job.findByIdAndUpdate(application.job._id, {
      $inc: { applicationCount: -1 }
    });

    return NextResponse.json({
      message: 'Application withdrawn successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('DELETE /api/applications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    );
  }
});