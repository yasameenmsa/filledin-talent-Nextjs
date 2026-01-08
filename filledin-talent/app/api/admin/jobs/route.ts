import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Job from '@/models/Job';
// import User from '@/models/User';

interface JobResponse {
  id: string;
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  category: string;
  sector: string;
  location: {
    city: string;
    country: string;
    region: string;
  };
  status: 'active' | 'closed' | 'draft';
  featured: boolean;
  urgent: boolean;
  postedBy: {
    id: string;
    name: string;
    email: string;
  };
  viewCount: number;
  applicationCount: number;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

import { withAdminAuth } from '@/lib/auth/nextauth-middleware';

// GET - Fetch jobs with pagination and filters
export const GET = withAdminAuth(async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const sector = searchParams.get('sector') || 'all';
    const postedBy = searchParams.get('postedBy') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: Record<string, unknown> = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category !== 'all') {
      query.category = category;
    }

    // Sector filter
    if (sector !== 'all') {
      query.sector = sector;
    }

    // Posted by filter
    if (postedBy !== 'all') {
      query.postedBy = postedBy;
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const total = await Job.countDocuments(query);

    // Get jobs with pagination and populate postedBy
    const jobs = await Job.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('postedBy', 'name email')
      .lean();

    // Format response
    const jobsResponse: JobResponse[] = jobs.map(job => ({
      id: String(job._id),
      title: job.title,
      description: job.description,
      company: job.company,
      category: job.category,
      sector: job.sector,
      location: job.location,
      status: job.status,
      featured: job.featured || false,
      urgent: job.urgent || false,
      postedBy: job.postedBy ? {
        id: String((job.postedBy as unknown as { _id: string })._id),
        name: job.postedBy.name || job.postedBy.email.split('@')[0],
        email: job.postedBy.email,
      } : {
        id: '',
        name: 'Unknown User',
        email: '',
      },
      viewCount: job.viewCount || 0,
      applicationCount: job.applicationCount || 0,
      salary: job.salary,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      jobs: jobsResponse,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', jobs: [], total: 0 },
      { status: 500 }
    );
  }
});

// PUT - Bulk operations on jobs
export const PUT = withAdminAuth(async (request) => {
  try {
    await connectDB();

    const body = await request.json();
    const { jobIds, action, status } = body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'Job IDs are required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    let actionDescription = '';

    if (action === 'activate') {
      updateData.status = 'active';
      actionDescription = 'activated';
    } else if (action === 'close') {
      updateData.status = 'closed';
      actionDescription = 'closed';
    } else if (action === 'draft') {
      updateData.status = 'draft';
      actionDescription = 'moved to draft';
    } else if (action === 'feature') {
      updateData.featured = true;
      actionDescription = 'featured';
    } else if (action === 'unfeature') {
      updateData.featured = false;
      actionDescription = 'unfeatured';
    } else if (action === 'urgent') {
      updateData.urgent = true;
      actionDescription = 'marked as urgent';
    } else if (action === 'unurgent') {
      updateData.urgent = false;
      actionDescription = 'removed urgent status';
    } else if (status) {
      // Direct status update
      if (['active', 'closed', 'draft'].includes(status)) {
        updateData.status = status;
        actionDescription = `status changed to ${status}`;
      } else {
        return NextResponse.json(
          { error: 'Invalid status. Must be active, closed, or draft' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action or status' },
        { status: 400 }
      );
    }

    const result = await Job.updateMany(
      { _id: { $in: jobIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      message: `Successfully ${actionDescription} ${result.modifiedCount} job(s)`,
      modifiedCount: result.modifiedCount,
      totalRequested: jobIds.length,
      action,
    });
  } catch (error) {
    console.error('Error updating jobs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});