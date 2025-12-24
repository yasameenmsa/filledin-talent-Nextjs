import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Job from '@/models/Job';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (status !== 'all') {
      filter.status = status;
    }

    if (category !== 'all') {
      filter.category = category;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('postedBy', 'name email')
      .lean();

    // Get total count for pagination
    const total = await Job.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Format jobs for response
    const formattedJobs = jobs.map(job => ({
      id: (job._id as any).toString(),
      title: job.title,
      description: job.description,
      company: job.company,
      category: job.category,
      subcategory: job.subcategory,
      sector: job.sector,
      location: job.location,
      workingType: job.workingType,
      status: job.status,
      applicationCount: job.applicationCount || 0,
      viewCount: job.viewCount || 0,
      featured: job.featured,
      urgent: job.urgent,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      postedBy: job.postedBy,
      salary: job.salary,
      i18n: job.i18n,
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
