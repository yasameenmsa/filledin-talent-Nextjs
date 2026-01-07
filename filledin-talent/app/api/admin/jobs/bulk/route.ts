import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Job from '@/models/Job';

// PUT - Bulk operations on jobs
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { jobIds, action } = body;

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

    const updateData: any = {};
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
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be activate, close, draft, feature, unfeature, urgent, or unurgent' },
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
    console.error('Error performing bulk action on jobs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}