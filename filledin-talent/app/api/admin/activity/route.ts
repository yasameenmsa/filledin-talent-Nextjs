import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'job_posted' | 'application_submitted' | 'user_hired';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const activities: ActivityItem[] = [];

    // Get recent user registrations
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email createdAt');

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user_registered',
        message: `${user.name} registered as a new user`,
        timestamp: user.createdAt.toISOString(),
        user: {
          name: user.name || 'Unknown User',
          email: user.email,
        },
      });
    });

    // Get recent job postings
    const recentJobs = await Job.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('postedBy', 'name email')
      .select('title createdAt postedBy');

    recentJobs.forEach(job => {
      activities.push({
        id: `job-${job._id}`,
        type: 'job_posted',
        message: `New job "${job.title}" was posted`,
        timestamp: job.createdAt.toISOString(),
        user: job.postedBy ? {
          name: job.postedBy.name || 'Unknown User',
          email: job.postedBy.email,
        } : undefined,
      });
    });

    // Get recent applications
    const recentApplications = await Application.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('job', 'title')
      .populate('applicant', 'name email')
      .select('createdAt job applicant');

    recentApplications.forEach(application => {
      activities.push({
        id: `application-${application._id}`,
        type: 'application_submitted',
        message: `New application submitted for "${application.job?.title || 'Unknown Job'}"`,
        timestamp: application.createdAt.toISOString(),
        user: application.applicant ? {
          name: application.applicant.name || 'Unknown User',
          email: application.applicant.email,
        } : undefined,
      });
    });

    // Get recent accepted applications
    const recentHired = await Application.find({ status: 'accepted' })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('job', 'title')
      .populate('applicant', 'name email')
      .select('updatedAt job applicant');

    recentHired.forEach(application => {
      activities.push({
        id: `hired-${application._id}`,
        type: 'user_hired',
        message: `${application.applicant?.name || 'Unknown User'} was hired for "${application.job?.title || 'Unknown Job'}"`,
        timestamp: application.updatedAt.toISOString(),
        user: application.applicant ? {
          name: application.applicant.name || 'Unknown User',
          email: application.applicant.email,
        } : undefined,
      });
    });

    // Sort all activities by timestamp (most recent first) and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities,
      total: activities.length
    });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', activities: [] },
      { status: 500 }
    );
  }
}
