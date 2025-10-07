import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

// POST /api/applications/bulk - Bulk operations on applications
export const POST = withAuth(async (request, user) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { action, applicationIds, data } = body;

    if (!action || !applicationIds || !Array.isArray(applicationIds)) {
      return NextResponse.json(
        { error: 'Action and applicationIds are required' },
        { status: 400 }
      );
    }

    // Find applications and verify permissions
    const applications = await Application.find({
      _id: { $in: applicationIds }
    }).populate('job', 'postedBy title');

    if (applications.length === 0) {
      return NextResponse.json(
        { error: 'No applications found' },
        { status: 404 }
      );
    }

    // Check permissions based on user role
    for (const application of applications) {
      const canModify = 
        user.role === 'admin' ||
        (user.role === 'employer' && application.job.postedBy.toString() === user.userId);

      if (!canModify) {
        return NextResponse.json(
          { error: 'Access denied for one or more applications' },
          { status: 403 }
        );
      }
    }

    let updateResult;
    const timestamp = new Date();

    switch (action) {
      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json(
            { error: 'Status is required for updateStatus action' },
            { status: 400 }
          );
        }

        const validStatuses = ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected'];
        if (!validStatuses.includes(data.status)) {
          return NextResponse.json(
            { error: 'Invalid status' },
            { status: 400 }
          );
        }

        updateResult = await Application.updateMany(
          { _id: { $in: applicationIds } },
          {
            status: data.status,
            $push: {
              statusHistory: {
                status: data.status,
                date: timestamp,
                note: data.note || `Bulk status update to ${data.status}`,
                updatedBy: user.userId
              }
            }
          }
        );
        break;

      case 'reject':
        updateResult = await Application.updateMany(
          { _id: { $in: applicationIds } },
          {
            status: 'rejected',
            $push: {
              statusHistory: {
                status: 'rejected',
                date: timestamp,
                note: data?.note || 'Bulk rejection',
                updatedBy: user.userId
              }
            }
          }
        );
        break;

      case 'shortlist':
        updateResult = await Application.updateMany(
          { _id: { $in: applicationIds } },
          {
            status: 'shortlisted',
            $push: {
              statusHistory: {
                status: 'shortlisted',
                date: timestamp,
                note: data?.note || 'Bulk shortlisting',
                updatedBy: user.userId
              }
            }
          }
        );
        break;

      case 'addNote':
        if (!data?.note) {
          return NextResponse.json(
            { error: 'Note is required for addNote action' },
            { status: 400 }
          );
        }

        updateResult = await Application.updateMany(
          { _id: { $in: applicationIds } },
          {
            $push: {
              statusHistory: {
                status: 'note_added',
                date: timestamp,
                note: data.note,
                updatedBy: user.userId
              }
            }
          }
        );
        break;

      case 'scheduleInterview':
        if (!data?.interviewDetails) {
          return NextResponse.json(
            { error: 'Interview details are required' },
            { status: 400 }
          );
        }

        const { date, type, location, interviewers, notes } = data.interviewDetails;

        if (!date || !type) {
          return NextResponse.json(
            { error: 'Interview date and type are required' },
            { status: 400 }
          );
        }

        updateResult = await Application.updateMany(
          { _id: { $in: applicationIds } },
          {
            status: 'interviewed',
            $push: {
              interviewDetails: {
                date: new Date(date),
                type,
                location,
                interviewers: interviewers || [],
                notes
              },
              statusHistory: {
                status: 'interviewed',
                date: timestamp,
                note: `Interview scheduled for ${new Date(date).toLocaleDateString()}`,
                updatedBy: user.userId
              }
            }
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Get updated applications for response
    const updatedApplications = await Application.find({
      _id: { $in: applicationIds }
    })
      .populate({
        path: 'job',
        select: 'title company'
      })
      .populate({
        path: 'applicant',
        select: 'profile.firstName profile.lastName email'
      });

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      modifiedCount: updateResult.modifiedCount,
      applications: updatedApplications
    });

  } catch (error) {
    console.error('POST /api/applications/bulk error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
});