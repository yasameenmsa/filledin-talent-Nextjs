import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';

import { withAdminAuth } from '@/lib/auth/nextauth-middleware';

export const GET = withAdminAuth(async (req) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Filters
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        // If search term provided, search in job titles and applicant names
        let jobIds: string[] = [];
        let applicantIds: string[] = [];

        if (search) {
            // Find jobs matching the search term
            const matchingJobs = await Job.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            jobIds = matchingJobs.map(job => job._id.toString());

            // Find users matching the search term
            const matchingUsers = await User.find({
                $or: [
                    { 'profile.firstName': { $regex: search, $options: 'i' } },
                    { 'profile.lastName': { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            applicantIds = matchingUsers.map(user => user._id.toString());

            if (jobIds.length > 0 || applicantIds.length > 0) {
                query.$or = [];
                if (jobIds.length > 0) {
                    query.$or.push({ job: { $in: jobIds } });
                }
                if (applicantIds.length > 0) {
                    query.$or.push({ applicant: { $in: applicantIds } });
                }
            } else {
                // No matches found, return empty result
                return NextResponse.json({
                    success: true,
                    applications: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    },
                    stats: {
                        total: 0,
                        pending: 0,
                        interviews: 0,
                        accepted: 0,
                        rejected: 0
                    }
                });
            }
        }

        // Build sort object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with population
        const [applications, total] = await Promise.all([
            Application.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'job',
                    select: 'title company location workingType'
                })
                .populate({
                    path: 'applicant',
                    select: 'email profile.firstName profile.lastName profile.profileImage'
                })
                .lean(),
            Application.countDocuments(query)
        ]);

        // Get stats
        const [stats] = await Application.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    interviews: {
                        $sum: { $cond: [{ $eq: ['$status', 'interviews'] }, 1, 0] }
                    },
                    accepted: {
                        $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            stats: stats || {
                total: 0,
                pending: 0,
                interviews: 0,
                accepted: 0,
                rejected: 0
            }
        });
    } catch (error) {
        console.error('Error fetching admin applications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
