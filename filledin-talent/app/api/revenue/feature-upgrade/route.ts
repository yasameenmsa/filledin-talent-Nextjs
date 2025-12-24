import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { RevenueService } from '@/lib/services/revenueService';

// POST - Record feature upgrade revenue
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, jobId, feature } = body;

    if (!userId || !jobId || !feature) {
      return NextResponse.json(
        { error: 'User ID, Job ID, and feature are required' },
        { status: 400 }
      );
    }

    if (!['featured', 'urgent', 'highlighted'].includes(feature)) {
      return NextResponse.json(
        { error: 'Feature must be one of: featured, urgent, highlighted' },
        { status: 400 }
      );
    }

    const revenue = await RevenueService.recordFeatureUpgrade(
      userId,
      jobId,
      feature as 'featured' | 'urgent' | 'highlighted'
    );

    return NextResponse.json({
      message: 'Feature upgrade revenue recorded successfully',
      revenue: {
        id: revenue._id,
        type: revenue.type,
        amount: revenue.amount,
        currency: revenue.currency,
        feature,
        createdAt: revenue.createdAt
      }
    });
  } catch (error) {
    console.error('Error recording feature upgrade revenue:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
