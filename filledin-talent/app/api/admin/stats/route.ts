import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get current date for calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());

    // Users statistics
    const totalUsers = await User.countDocuments();
    const jobseekers = await User.countDocuments({ role: 'job_seeker' });
    const employers = await User.countDocuments({ role: 'employer' });
    const newThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    });
    const activeToday = await User.countDocuments({
      lastLogin: { $gte: startOfToday }
    });

    // Jobs statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const pendingJobs = await Job.countDocuments({ status: 'draft' });
    const expiredJobs = await Job.countDocuments({
      applicationDeadline: { $lt: now },
      status: 'active'
    });
    const newThisWeek = await Job.countDocuments({
      createdAt: { $gte: startOfThisWeek }
    });

    // Applications statistics
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const reviewingApplications = await Application.countDocuments({ status: 'reviewing' });
    const hiredApplications = await Application.countDocuments({ status: 'hired' });
    const newToday = await Application.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Revenue statistics
    const { RevenueService } = await import('@/lib/services/revenueService');
    const revenueStats = await RevenueService.getRevenueStats();

    const stats = {
      users: {
        total: totalUsers,
        jobseekers,
        employers,
        newThisMonth,
        activeToday,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        pending: pendingJobs,
        expired: expiredJobs,
        newThisWeek,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        reviewing: reviewingApplications,
        hired: hiredApplications,
        newToday,
      },
      revenue: {
        thisMonth: revenueStats.thisMonth,
        lastMonth: revenueStats.lastMonth,
        growth: revenueStats.growth,
        totalRevenue: revenueStats.totalRevenue,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
