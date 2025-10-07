import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { FormValidator } from '@/lib/utils/validation';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/users/[id] - Get user by ID (authenticated users can get their own profile, admins can get any)
export const GET = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await dbConnect();

    const { id } = params;

    // Users can only access their own profile unless they're admin
    if (user.role !== 'admin' && user.userId !== id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this user profile' },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(id)
      .select('-password -__v')
      .lean();

    if (!targetUser || targetUser.isDeleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(targetUser);

  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
});

// PUT /api/users/[id] - Update user (users can update their own profile, admins can update any)
export const PUT = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Users can only update their own profile unless they're admin
    if (user.role !== 'admin' && user.userId !== id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this user profile' },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser || existingUser.isDeleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Handle email update
    if (body.email && body.email !== existingUser.email) {
      const emailValidation = FormValidator.validateEmail(body.email);
      if (!emailValidation.isValid) {
        return NextResponse.json(
          { error: emailValidation.error },
          { status: 400 }
        );
      }

      // Check if email is already taken
      const emailExists = await User.findOne({
        email: body.email,
        _id: { $ne: id }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }

      updateData.email = body.email;
    }

    // Handle role update (admin only)
    if (body.role && user.role === 'admin') {
      if (!['jobseeker', 'employer', 'admin'].includes(body.role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }

    // Handle profile updates
    if (body.profile) {
      const profileUpdate: any = {};

      // Validate names if provided
      if (body.profile.firstName !== undefined) {
        const firstNameValidation = FormValidator.validateName(body.profile.firstName, 'firstName');
        if (!firstNameValidation.isValid) {
          return NextResponse.json(
            { error: firstNameValidation.error },
            { status: 400 }
          );
        }
        profileUpdate.firstName = body.profile.firstName;
      }

      if (body.profile.lastName !== undefined) {
        const lastNameValidation = FormValidator.validateName(body.profile.lastName, 'lastName');
        if (!lastNameValidation.isValid) {
          return NextResponse.json(
            { error: lastNameValidation.error },
            { status: 400 }
          );
        }
        profileUpdate.lastName = body.profile.lastName;
      }

      // Handle other profile fields
      const allowedProfileFields = [
        'phone', 'dateOfBirth', 'location', 'bio', 'website',
        'company', 'position', 'industry', 'skills', 'experience',
        'education', 'languages', 'profileImage', 'resume'
      ];

      allowedProfileFields.forEach(field => {
        if (body.profile[field] !== undefined) {
          profileUpdate[field] = body.profile[field];
        }
      });

      // Merge with existing profile
      updateData.profile = {
        ...existingUser.profile,
        ...profileUpdate
      };
    }

    // Handle password update
    if (body.password) {
      const passwordValidation = FormValidator.validatePassword(body.password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { error: passwordValidation.error },
          { status: 400 }
        );
      }
      updateData.password = body.password; // Will be hashed by pre-save hook
    }

    // Handle email verification status (admin only)
    if (body.emailVerified !== undefined && user.role === 'admin') {
      updateData.emailVerified = body.emailVerified;
    }

    // Handle account status (admin only)
    if (body.isActive !== undefined && user.role === 'admin') {
      updateData.isActive = body.isActive;
    }

    updateData.updatedAt = new Date();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
});

// DELETE /api/users/[id] - Soft delete user (admin only, or users can delete their own account)
export const DELETE = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await dbConnect();

    const { id } = params;

    // Users can only delete their own account unless they're admin
    if (user.role !== 'admin' && user.userId !== id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this user account' },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser || existingUser.isDeleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (user.userId === id && user.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot delete their own account' },
        { status: 400 }
      );
    }

    // Soft delete the user
    const deletedUser = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.userId
      },
      { new: true }
    ).select('-password -__v');

    return NextResponse.json({
      message: 'User account deleted successfully',
      user: deletedUser
    });

  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
});