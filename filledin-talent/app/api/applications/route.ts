import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';
import { FormValidator } from '@/lib/utils/validation';

// GET /api/applications - Get applications (role-based)
export const GET = withAuth(async (request, user) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter based on user role
    const filter: any = {};

    if (user.role === 'jobseeker') {
      // Job seekers see only their applications
      filter.applicant = user.userId;
    } else if (user.role === 'employer') {
      // Employers see applications for their jobs
      const employerJobs = await Job.find({ 
        postedBy: user.userId,
        isDeleted: { $ne: true }
      }).select('_id');
      
      filter.job = { $in: employerJobs.map(job => job._id) };
    } else if (user.role === 'admin') {
      // Admins see all applications (no additional filter)
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Additional filters
    if (status) {
      filter.status = status;
    }

    if (jobId) {
      filter.job = jobId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries with population
    const [applications, totalCount] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'job',
          select: 'title company location workingType salary status',
          populate: {
            path: 'postedBy',
            select: 'profile.firstName profile.lastName profile.company email'
          }
        })
        .populate({
          path: 'applicant',
          select: 'profile.firstName profile.lastName email profile.cvUrl profile.phone'
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get application statistics
    const stats = await Application.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return NextResponse.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: statusStats,
      filters: {
        status,
        jobId
      }
    });

  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
});

// POST /api/applications - Submit job application
export const POST = withAuth(async (request, user) => {
  try {
    await dbConnect();

    // Only job seekers can submit applications
    if (user.role !== 'jobseeker') {
      return NextResponse.json(
        { error: 'Only job seekers can submit applications' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const validator = new FormValidator(body);
    validator.required('jobId', 'Job ID is required');
    validator.required('cvUrl', 'CV is required');

    if (validator.hasErrors()) {
      return NextResponse.json(
        { error: 'Validation failed', details: validator.getErrors() },
        { status: 400 }
      );
    }

    const { jobId, coverLetter, cvUrl, additionalDocuments, answers } = body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: user.userId
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = new Application({
      job: jobId,
      applicant: user.userId,
      coverLetter,
      cvUrl,
      additionalDocuments: additionalDocuments || [],
      answers: answers || [],
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        date: new Date(),
        note: 'Application submitted'
      }]
    });

    await application.save();

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 }
    });

    // Populate the created application for response
    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'job',
        select: 'title company location'
      })
      .populate({
        path: 'applicant',
        select: 'profile.firstName profile.lastName email'
      });

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: populatedApplication
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/applications error:', error);
    
    // Handle duplicate application error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
});