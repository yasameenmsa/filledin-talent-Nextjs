import { NextRequest, NextResponse } from 'next/server';
import { withEmployerAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';

// GET /api/jobs/my-jobs - Get current employer's jobs
export const GET = withEmployerAuth(async (request, user) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, inactive, all
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter query
    const filter: any = { 
      postedBy: user.userId,
      isDeleted: { $ne: true }
    };

    // Filter by status
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    // 'all' shows both active and inactive

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const [jobs, totalCount] = await Promise.all([
      Job.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get job statistics
    const stats = await Job.aggregate([
      { $match: { postedBy: user.userId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveJobs: { $sum: { $cond: ['$isActive', 0, 1] } },
          totalViews: { $sum: '$viewCount' },
          totalApplications: { $sum: '$applicationCount' }
        }
      }
    ]);

    const jobStats = stats[0] || {
      totalJobs: 0,
      activeJobs: 0,
      inactiveJobs: 0,
      totalViews: 0,
      totalApplications: 0
    };

    return NextResponse.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: jobStats,
      filters: {
        search,
        status
      }
    });

  } catch (error) {
    console.error('GET /api/jobs/my-jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch your jobs' },
      { status: 500 }
    );
  }
});