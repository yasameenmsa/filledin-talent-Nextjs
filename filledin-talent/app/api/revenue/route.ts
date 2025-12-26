import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Revenue from '@/models/Revenue';

interface RevenueResponse {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  userId?: { id: string; name: string; email: string };
  jobId?: { id: string; title: string };
  companyId?: { id: string; name: string };
  paymentMethod?: string;
  transactionId?: string;
  paymentProvider?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

// GET - List revenue records with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const userId = searchParams.get('userId') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: Record<string, unknown> = {};

    if (type !== 'all') {
      query.type = type;
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (userId !== 'all') {
      query.userId = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      const createdAtFilter: { $gte?: Date; $lte?: Date } = {};
      if (startDate) {
        createdAtFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        createdAtFilter.$lte = new Date(endDate);
      }
      query.createdAt = createdAtFilter;
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const total = await Revenue.countDocuments(query);

    // Get revenue records with pagination and populate
    const revenueRecords = await Revenue.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('jobId', 'title')
      .populate('companyId', 'name')
      .lean();

    // Format response
    const revenueResponse: RevenueResponse[] = revenueRecords.map(record => ({
      id: String(record._id),
      type: record.type,
      amount: record.amount,
      currency: record.currency,
      description: record.description,
      status: record.status,
      userId: record.userId ? {
        id: String((record.userId as { _id: unknown })._id),
        name: (record.userId as { name: string }).name,
        email: (record.userId as { email: string }).email,
      } : undefined,
      jobId: record.jobId ? {
        id: String((record.jobId as { _id: unknown })._id),
        title: (record.jobId as { title: string }).title,
      } : undefined,
      companyId: record.companyId ? {
        id: String((record.companyId as { _id: unknown })._id),
        name: (record.companyId as { name: string }).name,
      } : undefined,
      paymentMethod: record.paymentMethod,
      transactionId: record.transactionId,
      paymentProvider: record.paymentProvider,
      metadata: record.metadata,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      processedAt: record.processedAt?.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      revenue: revenueResponse,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('Error fetching revenue records:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', revenue: [], total: 0 },
      { status: 500 }
    );
  }
}

// POST - Create new revenue record
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      type,
      amount,
      currency,
      description,
      status,
      userId,
      jobId,
      companyId,
      paymentMethod,
      transactionId,
      paymentProvider,
      metadata,
    } = body;

    // Validate required fields
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Type, amount, and description are required' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const revenueRecord = new Revenue({
      type,
      amount: Math.round(amount * 100), // Store in cents
      currency: currency || 'USD',
      description,
      status: status || 'pending',
      userId,
      jobId,
      companyId,
      paymentMethod,
      transactionId,
      paymentProvider,
      metadata,
    });

    const savedRecord = await revenueRecord.save();

    return NextResponse.json({
      message: 'Revenue record created successfully',
      revenue: {
        id: String(savedRecord._id),
        type: savedRecord.type,
        amount: savedRecord.amount,
        currency: savedRecord.currency,
        description: savedRecord.description,
        status: savedRecord.status,
        createdAt: savedRecord.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating revenue record:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}