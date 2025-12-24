import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { EmailService } from '@/lib/services/emailService';
import Application from '@/models/Application';

// POST - Send application status update notification to applicant
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { applicationId, newStatus } = body;

    if (!applicationId || !newStatus) {
      return NextResponse.json(
        { error: 'Application ID and new status are required' },
        { status: 400 }
      );
    }

    // Get application with populated data
    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate({
        path: 'job',
        select: 'title',
        populate: {
          path: 'postedBy',
          select: 'name'
        }
      });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const applicantEmail = application.applicant?.email;
    const jobTitle = application.job?.title || 'Unknown Job';
    const employerName = application.job?.postedBy?.name;

    if (!applicantEmail) {
      return NextResponse.json(
        { error: 'Applicant email not found' },
        { status: 404 }
      );
    }

    const success = await EmailService.sendApplicationStatusUpdate(
      applicantEmail,
      jobTitle,
      newStatus,
      employerName
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send status update email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Application status update notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending application status update notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
