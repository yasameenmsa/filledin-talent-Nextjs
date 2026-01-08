import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

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
