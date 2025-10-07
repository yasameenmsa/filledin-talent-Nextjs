import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { FormValidator } from '@/lib/utils/validation';

// GET /api/users/profile - Get current user's profile
export const GET = withAuth(async (request, user) => {
  try {
    await dbConnect();

    const userProfile = await User.findById(user.userId)
      .select('-password -__v -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!userProfile || userProfile.isDeleted) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('GET /api/users/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
});

// PUT /api/users/profile - Update current user's profile
export const PUT = withAuth(async (request, user) => {
  try {
    await dbConnect();

    const body = await request.json();

    // Check if user exists
    const existingUser = await User.findById(user.userId);
    if (!existingUser || existingUser.isDeleted) {
      return NextResponse.json(
        { error: 'User profile not found' },
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
        _id: { $ne: user.userId }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }

      updateData.email = body.email;
      updateData.emailVerified = false; // Reset email verification when email changes
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

      // Handle other profile fields with validation
      if (body.profile.phone !== undefined) {
        if (body.profile.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(body.profile.phone)) {
          return NextResponse.json(
            { error: 'Invalid phone number format' },
            { status: 400 }
          );
        }
        profileUpdate.phone = body.profile.phone;
      }

      if (body.profile.dateOfBirth !== undefined) {
        if (body.profile.dateOfBirth) {
          const birthDate = new Date(body.profile.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          
          if (age < 16 || age > 100) {
            return NextResponse.json(
              { error: 'Age must be between 16 and 100 years' },
              { status: 400 }
            );
          }
        }
        profileUpdate.dateOfBirth = body.profile.dateOfBirth;
      }

      if (body.profile.website !== undefined) {
        if (body.profile.website && !/^https?:\/\/.+\..+/.test(body.profile.website)) {
          return NextResponse.json(
            { error: 'Invalid website URL format' },
            { status: 400 }
          );
        }
        profileUpdate.website = body.profile.website;
      }

      // Handle other profile fields
      const allowedProfileFields = [
        'location', 'bio', 'company', 'position', 'industry', 
        'skills', 'experience', 'education', 'languages', 
        'profileImage', 'resume'
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

    updateData.updatedAt = new Date();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('PUT /api/users/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
});

// DELETE /api/users/profile - Delete current user's account
export const DELETE = withAuth(async (request, user) => {
  try {
    await dbConnect();

    // Check if user exists
    const existingUser = await User.findById(user.userId);
    if (!existingUser || existingUser.isDeleted) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot delete their own account through this endpoint' },
        { status: 400 }
      );
    }

    // Soft delete the user
    const deletedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.userId
      },
      { new: true }
    ).select('-password -__v');

    return NextResponse.json({
      message: 'Account deleted successfully',
      user: deletedUser
    });

  } catch (error) {
    console.error('DELETE /api/users/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
});