import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { RevenueService } from '@/lib/services/revenueService';

// POST - Record job posting revenue
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, jobId, tier = 'basic' } = body;

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: 'User ID and Job ID are required' },
        { status: 400 }
      );
    }

    if (!['basic', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Tier must be either basic or premium' },
        { status: 400 }
      );
    }

    const revenue = await RevenueService.recordJobPosting(userId, jobId, tier as 'basic' | 'premium');

    return NextResponse.json({
      message: 'Job posting revenue recorded successfully',
      revenue: {
        id: revenue._id,
        type: revenue.type,
        amount: revenue.amount,
        currency: revenue.currency,
        tier,
        createdAt: revenue.createdAt
      }
    });
  } catch (error) {
    console.error('Error recording job posting revenue:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
