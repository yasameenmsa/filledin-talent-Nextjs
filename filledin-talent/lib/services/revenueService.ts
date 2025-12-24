import connectDB from '@/lib/db/mongodb';
import Revenue from '@/models/Revenue';
import { pricingConfig, getJobPostingPrice, getFeaturePrice, getSubscriptionPrice } from '@/lib/config/pricing';

export interface RevenueEvent {
  type: 'job_posting' | 'featured_job' | 'urgent_job' | 'premium_listing' | 'subscription' | 'custom';
  amount: number;
  currency?: string;
  description: string;
  userId?: string;
  jobId?: string;
  companyId?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export class RevenueService {
  /**
   * Record a revenue event
   */
  static async recordRevenue(event: RevenueEvent): Promise<any> {
    await connectDB();

    const revenueData = {
      type: event.type,
      amount: event.amount,
      currency: event.currency || pricingConfig.currencies.default,
      description: event.description,
      status: 'completed' as const, // Assume completed for now
      paymentMethod: event.paymentMethod || pricingConfig.paymentMethods.default,
      userId: event.userId,
      jobId: event.jobId,
      companyId: event.companyId,
      metadata: event.metadata,
      completedAt: new Date()
    };

    const revenue = new Revenue(revenueData);
    return await revenue.save();
  }

  /**
   * Record job posting revenue
   */
  static async recordJobPosting(userId: string, jobId: string, tier: 'basic' | 'premium' = 'basic'): Promise<any> {
    const amount = getJobPostingPrice(tier);
    const description = `Job posting - ${tier} tier`;

    return this.recordRevenue({
      type: 'job_posting',
      amount,
      description,
      userId,
      jobId,
      metadata: { tier }
    });
  }

  /**
   * Record feature upgrade revenue
   */
  static async recordFeatureUpgrade(
    userId: string,
    jobId: string,
    feature: 'featured' | 'urgent' | 'highlighted'
  ): Promise<any> {
    const amount = getFeaturePrice(feature);
    const description = `${feature} job feature`;

    return this.recordRevenue({
      type: feature === 'featured' ? 'featured_job' : 'custom',
      amount,
      description,
      userId,
      jobId,
      metadata: { feature, duration: pricingConfig.features[feature].duration }
    });
  }

  /**
   * Record subscription revenue
   */
  static async recordSubscription(userId: string, plan: 'starter' | 'professional' | 'enterprise'): Promise<any> {
    const amount = getSubscriptionPrice(plan);
    const subscription = pricingConfig.subscriptions[plan];
    const description = `${plan} subscription - ${subscription.interval}`;

    return this.recordRevenue({
      type: 'subscription',
      amount,
      description,
      userId,
      metadata: {
        plan,
        interval: subscription.interval,
        jobPostings: subscription.jobPostings,
        features: subscription.features
      }
    });
  }

  /**
   * Get revenue statistics
   */
  static async getRevenueStats(startDate?: Date, endDate?: Date) {
    await connectDB();

    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const defaultEndDate = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current period revenue
    const currentRevenue = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: defaultStartDate, $lte: defaultEndDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Last month revenue
    const lastMonthRevenue = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Total revenue ever
    const totalRevenue = await Revenue.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by type for current period
    const revenueByType = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: defaultStartDate, $lte: defaultEndDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calculate growth
    const currentTotal = currentRevenue[0]?.total || 0;
    const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
    const growth = lastMonthTotal > 0 ?
      ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    return {
      thisMonth: currentTotal,
      lastMonth: lastMonthTotal,
      growth,
      totalRevenue: totalRevenue[0]?.total || 0,
      transactionsThisMonth: currentRevenue[0]?.count || 0,
      revenueByType: revenueByType.map(item => ({
        type: item._id,
        amount: item.total,
        count: item.count
      }))
    };
  }

  /**
   * Get revenue trends over time
   */
  static async getRevenueTrends(days: number = 30) {
    await connectDB();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const trends = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    return trends.map(trend => ({
      date: trend._id,
      amount: trend.total,
      transactions: trend.count
    }));
  }

  /**
   * Get top revenue sources
   */
  static async getTopRevenueSources(limit: number = 10) {
    await connectDB();

    const sources = await Revenue.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          userName: { $first: '$user.name' },
          userEmail: { $first: '$user.email' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: limit
      }
    ]);

    return sources.map(source => ({
      userId: source._id,
      userName: source.userName?.[0] || 'Unknown User',
      userEmail: source.userEmail?.[0] || '',
      totalRevenue: source.totalRevenue,
      transactionCount: source.transactionCount
    }));
  }
}
