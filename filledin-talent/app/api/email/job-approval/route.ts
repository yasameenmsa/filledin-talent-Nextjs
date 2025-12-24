import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { EmailService } from '@/lib/services/emailService';
import Job from '@/models/Job';

// POST - Send job approval notification to employer
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = await Job.findById(jobId).populate('postedBy', 'name email');

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const employerEmail = job.postedBy?.email;

    if (!employerEmail) {
      return NextResponse.json(
        { error: 'Employer email not found' },
        { status: 404 }
      );
    }

    const success = await EmailService.sendJobApprovalNotification(
      employerEmail,
      job.title,
      jobId
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send job approval notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Job approval notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending job approval notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
