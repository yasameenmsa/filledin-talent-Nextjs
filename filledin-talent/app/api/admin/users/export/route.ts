import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const format = searchParams.get('format') || 'csv';

    // Build query (same as main users route)
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (role !== 'all') {
      query.role = role;
    }

    if (status !== 'all') {
      if (status === 'active') {
        query.isEmailVerified = true;
      } else if (status === 'inactive') {
        query.isEmailVerified = false;
      }
    }

    // Get all users (no pagination for export)
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select('-password')
      .lean();

    // Get additional data for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const jobsPosted = user.role === 'employer' ?
          await Job.countDocuments({ postedBy: user._id }) : 0;

        const applicationsSubmitted = user.role === 'job_seeker' ?
          await Application.countDocuments({ userId: user._id }) : 0;

        return {
          id: (user._id as any).toString(),
          name: user.name || user.email.split('@')[0],
          email: user.email,
          phone: user.phone || '',
          role: user.role || 'job_seeker',
          status: user.isEmailVerified ? 'active' : 'inactive',
          location: user.location || '',
          company: user.company || '',
          position: user.position || '',
          isVerified: user.isEmailVerified ? 'Yes' : 'No',
          jobsPosted: jobsPosted.toString(),
          applicationsSubmitted: applicationsSubmitted.toString(),
          createdAt: user.createdAt.toISOString(),
          lastLogin: user.lastLogin?.toISOString() || '',
        };
      })
    );

    if (format === 'csv') {
      // Create CSV content
      const headers = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'Role',
        'Status',
        'Location',
        'Company',
        'Position',
        'Verified',
        'Jobs Posted',
        'Applications Submitted',
        'Created At',
        'Last Login'
      ];

      const csvRows = [
        headers.join(','),
        ...usersWithStats.map(user => [
          user.id,
          `"${user.name}"`,
          user.email,
          `"${user.phone}"`,
          user.role,
          user.status,
          `"${user.location}"`,
          `"${user.company}"`,
          `"${user.position}"`,
          user.isVerified,
          user.jobsPosted,
          user.applicationsSubmitted,
          user.createdAt,
          user.lastLogin
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users-export.csv"'
        }
      });
    } else {
      // JSON format
      return NextResponse.json({
        users: usersWithStats,
        total: usersWithStats.length,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
