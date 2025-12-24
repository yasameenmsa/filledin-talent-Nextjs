import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Job from '@/models/Job';

// PUT - Bulk operations on jobs
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { jobIds, action, reason } = body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'Job IDs are required' },
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

    if (action === 'approve') {
      updateData.status = 'active';
      actionDescription = 'approved';
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      actionDescription = 'rejected';
      if (reason) {
        updateData.rejectionReason = reason;
      }
    } else if (action === 'close') {
      updateData.status = 'closed';
      actionDescription = 'closed';
    } else if (action === 'activate') {
      updateData.status = 'active';
      actionDescription = 'activated';
    } else if (action === 'deactivate') {
      updateData.status = 'draft';
      actionDescription = 'deactivated';
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, close, activate, or deactivate' },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

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
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
