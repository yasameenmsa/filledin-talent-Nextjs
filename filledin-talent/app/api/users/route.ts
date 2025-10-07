import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { FormValidator } from '@/lib/utils/validation';

// GET /api/users - Get all users (admin only) with pagination and filtering
export const GET = withAdminAuth(async (request, user) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter query
    const filter: any = { isDeleted: { $ne: true } };
    
    if (role && ['jobseeker', 'employer', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { 'profile.company': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password -__v')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// POST /api/users - Create new user (admin only)
export const POST = withAdminAuth(async (request, user) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { firebaseUid, email, role, profile, password } = body;

    // Validate required fields
    if (!firebaseUid || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: firebaseUid, email, role' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = FormValidator.validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate role
    if (!['jobseeker', 'employer', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be jobseeker, employer, or admin' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ firebaseUid }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this Firebase UID or email' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      firebaseUid,
      email,
      role,
      profile: {
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        ...profile
      },
      password, // Will be hashed by the model pre-save hook
      createdBy: user.userId
    });

    await newUser.save();

    // Remove sensitive data from response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    return NextResponse.json(userResponse, { status: 201 });

  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
});
