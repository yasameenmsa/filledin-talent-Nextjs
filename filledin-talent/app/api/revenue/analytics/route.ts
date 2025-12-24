import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Revenue from '@/models/Revenue';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, year
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    let dateFilter: any = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default to current period based on 'period' parameter
      const periodStart = new Date(now);

      switch (period) {
        case 'day':
          periodStart.setHours(0, 0, 0, 0);
          break;
        case 'week':
          periodStart.setDate(now.getDate() - now.getDay());
          periodStart.setHours(0, 0, 0, 0);
          break;
        case 'month':
          periodStart.setDate(1);
          periodStart.setHours(0, 0, 0, 0);
          break;
        case 'year':
          periodStart.setMonth(0, 1);
          periodStart.setHours(0, 0, 0, 0);
          break;
        default:
          periodStart.setDate(1);
          periodStart.setHours(0, 0, 0, 0);
      }

      dateFilter.createdAt = { $gte: periodStart };
    }

    // Get total revenue for the period
    const totalRevenueResult = await Revenue.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = totalRevenueResult[0] || { total: 0, count: 0 };

    // Get revenue by type
    const revenueByType = await Revenue.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Get revenue by payment provider
    const revenueByProvider = await Revenue.aggregate([
      { $match: { ...dateFilter, status: 'completed', paymentProvider: { $ne: null } } },
      {
        $group: {
          _id: '$paymentProvider',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Get daily revenue breakdown for charts
    const dailyRevenue = await Revenue.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Get pending revenue
    const pendingRevenueResult = await Revenue.aggregate([
      { $match: { ...dateFilter, status: 'pending' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const pendingRevenue = pendingRevenueResult[0] || { total: 0, count: 0 };

    // Get failed/refunded revenue
    const failedRevenueResult = await Revenue.aggregate([
      { $match: { ...dateFilter, status: { $in: ['failed', 'refunded'] } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const failedRevenue = failedRevenueResult[0] || { total: 0, count: 0 };

    // Get top revenue generating users
    const topUsers = await Revenue.aggregate([
      { $match: { ...dateFilter, status: 'completed', userId: { $ne: null } } },
      {
        $group: {
          _id: '$userId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          total: 1,
          count: 1,
        },
      },
    ]);

    // Calculate growth rate (compare with previous period)
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    if (startDate && endDate) {
      const periodLength = new Date(endDate).getTime() - new Date(startDate).getTime();
      previousPeriodStart = new Date(new Date(startDate).getTime() - periodLength);
      previousPeriodEnd = new Date(startDate);
    } else {
      const currentPeriodStart = dateFilter.createdAt.$gte;
      const periodLength = now.getTime() - currentPeriodStart.getTime();
      previousPeriodStart = new Date(currentPeriodStart.getTime() - periodLength);
      previousPeriodEnd = currentPeriodStart;
    }

    const previousPeriodRevenue = await Revenue.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const previousTotal = previousPeriodRevenue[0]?.total || 0;
    const currentTotal = totalRevenue.total;
    const growthRate = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    const analytics = {
      overview: {
        totalRevenue: currentTotal,
        totalTransactions: totalRevenue.count,
        pendingRevenue: pendingRevenue.total,
        pendingTransactions: pendingRevenue.count,
        failedRevenue: failedRevenue.total,
        failedTransactions: failedRevenue.count,
        growthRate,
        currency: 'USD',
      },
      revenueByType: revenueByType.map(item => ({
        type: item._id,
        total: item.total,
        count: item.count,
      })),
      revenueByProvider: revenueByProvider.map(item => ({
        provider: item._id,
        total: item.total,
        count: item.count,
      })),
      dailyRevenue: dailyRevenue.map(item => ({
        date: item._id,
        total: item.total,
        count: item.count,
      })),
      topUsers: topUsers.map(item => ({
        userId: item.userId.toString(),
        name: item.name || item.email.split('@')[0],
        email: item.email,
        total: item.total,
        count: item.count,
      })),
      period: {
        startDate: dateFilter.createdAt.$gte.toISOString(),
        endDate: now.toISOString(),
        period,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

