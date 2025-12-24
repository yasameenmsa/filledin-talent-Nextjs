import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { EmailService } from '@/lib/services/emailService';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';

// POST - Send job application notification to employer
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get application with populated data
    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate({
        path: 'job',
        populate: {
          path: 'postedBy',
          select: 'name email'
        }
      });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const employerEmail = application.job?.postedBy?.email;
    const applicantName = application.applicant?.name || 'Unknown Applicant';
    const jobTitle = application.job?.title || 'Unknown Job';

    if (!employerEmail) {
      return NextResponse.json(
        { error: 'Employer email not found' },
        { status: 404 }
      );
    }

    const success = await EmailService.sendJobApplicationNotification(
      employerEmail,
      applicantName,
      jobTitle,
      applicationId
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send notification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Job application notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending job application notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
