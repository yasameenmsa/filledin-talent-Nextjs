import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';
import SavedJob from '@/models/SavedJob';

// PUT - Update user status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status === 'active') {
      updateData.isEmailVerified = true;
    } else if (status === 'inactive') {
      updateData.isEmailVerified = false;
    } else if (status === 'banned') {
      updateData.isEmailVerified = false;
      // You could also add: updateData.banned = true;
    } else {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User status updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name || user.email.split('@')[0],
        email: user.email,
        status: user.isEmailVerified ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user and all related applications and saved jobs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // First check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all applications by this user
    const deletedApplications = await Application.deleteMany({ applicant: userId });
    console.log(`Deleted ${deletedApplications.deletedCount} applications for user ${userId}`);

    // Delete all saved jobs by this user
    const deletedSavedJobs = await SavedJob.deleteMany({ userId: userId });
    console.log(`Deleted ${deletedSavedJobs.deletedCount} saved jobs for user ${userId}`);

    // Now delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: 'User and all related data deleted successfully',
      deletedApplicationsCount: deletedApplications.deletedCount,
      deletedSavedJobsCount: deletedSavedJobs.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
