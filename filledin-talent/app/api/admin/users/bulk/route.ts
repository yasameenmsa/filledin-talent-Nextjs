import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

// PUT - Bulk operations on users
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userIds, action } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let actionDescription = '';

    if (action === 'activate') {
      updateData.isEmailVerified = true;
      actionDescription = 'activated';
    } else if (action === 'deactivate') {
      updateData.isEmailVerified = false;
      actionDescription = 'deactivated';
    } else if (action === 'ban') {
      updateData.isEmailVerified = false;
      // You could also add: updateData.banned = true;
      actionDescription = 'banned';
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be activate, deactivate, or ban' },
        { status: 400 }
      );
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      message: `Successfully ${actionDescription} ${result.modifiedCount} user(s)`,
      modifiedCount: result.modifiedCount,
      totalRequested: userIds.length,
      action,
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
