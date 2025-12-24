import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  location?: string;
  company?: string;
  position?: string;
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
  jobsPosted?: number;
  applicationsSubmitted?: number;
}

// GET - Fetch users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filter
    if (role !== 'all') {
      query.role = role;
    }

    // Status filter - for now, we'll assume all users are active unless we add a status field
    // This is a placeholder - you might want to add a status field to the User model
    if (status !== 'all') {
      // Placeholder - implement based on your user status logic
      if (status === 'active') {
        query.isEmailVerified = true;
      } else if (status === 'inactive') {
        query.isEmailVerified = false;
      }
      // 'banned' status would require additional field in User model
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const total = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password') // Exclude password field
      .lean();

    // Get additional data for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get job count for employers
        const jobsPosted = user.role === 'employer' ?
          await Job.countDocuments({ postedBy: user._id }) : 0;

        // Get application count for job seekers
        const applicationsSubmitted = user.role === 'job_seeker' ?
          await Application.countDocuments({ userId: user._id }) : 0;

        const userResponse: UserResponse = {
          id: (user._id as any).toString(),
          name: user.name || user.email.split('@')[0], // Fallback to email prefix
          email: user.email,
          phone: user.phone,
          role: user.role || 'job_seeker',
          status: user.isEmailVerified ? 'active' : 'inactive', // Placeholder status logic
          location: user.location,
          company: user.company,
          position: user.position,
          profileImage: user.profileImage,
          createdAt: user.createdAt.toISOString(),
          lastLogin: user.lastLogin?.toISOString(),
          isVerified: user.isEmailVerified || false,
          jobsPosted,
          applicationsSubmitted,
        };

        return userResponse;
      })
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: usersWithStats,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', users: [], total: 0 },
      { status: 500 }
    );
  }
}

// PUT - Update user status (bulk operation)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userIds, action, status } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    if (action === 'activate') {
      updateData.isEmailVerified = true;
    } else if (action === 'deactivate') {
      updateData.isEmailVerified = false;
    } else if (action === 'ban') {
      // For banning, you might want to add a banned field to the User model
      updateData.isEmailVerified = false;
      // You could also add: updateData.banned = true;
    } else if (status) {
      // Direct status update
      if (status === 'active') {
        updateData.isEmailVerified = true;
      } else if (status === 'inactive') {
        updateData.isEmailVerified = false;
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action or status' },
        { status: 400 }
      );
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      message: `Updated ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
